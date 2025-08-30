#!/usr/bin/env python3
"""
Simple Silero VAD WebSocket Server
Receives audio chunks from Node.js and returns voice activity detection results
"""

import asyncio
import json
import numpy as np
import websockets
import torch
from silero_vad import load_silero_vad, VADIterator
from datetime import datetime
import logging
import time

# Configure logging to stdout
import sys

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

# Constants
SAMPLING_RATE = 16000  # Silero VAD expects 16kHz
CHUNK_SIZE = 512       # Must be exactly 512 samples for 16kHz (32ms)

# Set torch threads for efficiency
torch.set_num_threads(1)

# Load model once at startup (shared across all connections)
print("Loading Silero VAD model...")
VAD_MODEL = load_silero_vad(onnx=True)
print("Model loaded successfully")

def int2float(sound):
    """Convert int16 audio to float32"""
    abs_max = np.abs(sound).max()
    sound = sound.astype('float32')
    if abs_max > 0:
        sound *= 1/32768
    sound = sound.squeeze()
    return sound

class VADHandler:
    """Handles VAD for a single WebSocket connection"""
    
    def __init__(self, model, use_iterator=True):
        self.model = model
        self.use_iterator = use_iterator
        
        if use_iterator:
            self.vad_iterator = VADIterator(model, sampling_rate=SAMPLING_RATE, time_resolution=2)
        
        # Buffer for incomplete chunks
        self.audio_buffer = np.array([], dtype=np.int16)
        
        # Track speaking state
        self.is_speaking = False
        self.speech_start_time = None
        self.speech_end_time = None
    
    def process_audio(self, audio_bytes):
        """Process audio bytes and return detection results"""
        # Convert bytes to int16 numpy array
        audio_int16 = np.frombuffer(audio_bytes, dtype=np.int16)
        
        # Add to buffer
        self.audio_buffer = np.concatenate([self.audio_buffer, audio_int16])
        
        results = []
        
        # Process all complete chunks in buffer
        while len(self.audio_buffer) >= CHUNK_SIZE:
            # Extract chunk
            chunk_int16 = self.audio_buffer[:CHUNK_SIZE]
            self.audio_buffer = self.audio_buffer[CHUNK_SIZE:]
            
            # Convert to float32
            chunk_float32 = int2float(chunk_int16)
            
            if self.use_iterator:
                # Use VADIterator for automatic speech segment detection
                # Returns: {'start': timestamp}, {'end': timestamp}, or None
                speech_dict = self.vad_iterator(chunk_float32, return_seconds=True)
                
                if speech_dict:
                    # VADIterator returns dict with either 'start' or 'end' key
                    if 'start' in speech_dict:
                        self.is_speaking = True
                        self.speech_start_time = speech_dict['start']
                        results.append({
                            'event': 'speech_start',
                            'ts': time.time() * 1000
                        })
                    
                    elif 'end' in speech_dict:  # Note: elif, not if - it's one or the other
                        self.is_speaking = False
                        self.speech_end_time = speech_dict['end']
                        results.append({
                            'event': 'speech_end',
                            'ts': time.time() * 1000
                        })
            else:
                # Just get speech probability
                speech_prob = self.model(torch.from_numpy(chunk_float32), SAMPLING_RATE).item()
                
                # Simple threshold-based detection
                was_speaking = self.is_speaking
                self.is_speaking = speech_prob > 0.5
                
                result = {
                    'speech_probability': speech_prob,
                    'is_speaking': self.is_speaking,
                    'timestamp': datetime.utcnow().isoformat()
                }
                
                # Detect state changes
                if not was_speaking and self.is_speaking:
                    result['event'] = 'speech_start'
                elif was_speaking and not self.is_speaking:
                    result['event'] = 'speech_end'
                
                results.append(result)
        
        return results
    
    def reset(self):
        """Reset VAD state"""
        if self.use_iterator:
            self.vad_iterator.reset_states()
        else:
            self.model.reset_states()
        
        self.audio_buffer = np.array([], dtype=np.int16)
        self.is_speaking = False
        self.speech_start_time = None
        self.speech_end_time = None

async def handle_connection(websocket, path):
    """Handle a WebSocket connection"""
    logger.info(f"New connection from {websocket.remote_address} to path {path}")
    
    # Send immediate connection acknowledgment
    try:
        await websocket.send(json.dumps({
            'type': 'connection_ready',
            'timestamp': datetime.utcnow().isoformat()
        }))
        logger.info(f"Connection established successfully with {websocket.remote_address}")
    except Exception as e:
        logger.error(f"Failed to send connection acknowledgment: {e}")
        return
    
    # Create handler for this connection using the pre-loaded model
    handler = VADHandler(VAD_MODEL, use_iterator=True)
    
    try:
        async for message in websocket:
            if isinstance(message, bytes):
                logger.info("Received message bytes")
                # Process audio chunk
                results = handler.process_audio(message)
                
                # Send all results
                for result in results:
                    await websocket.send(json.dumps(result))
                    
                    # Log important events
                    if 'event' in result:
                        logger.info(f"Event: {result['event']}")
                        
            elif isinstance(message, str):
                # Handle commands
                try:
                    logger.info(f"Received message: {message}")
                    command = json.loads(message)
                    
                    if command.get('type') == 'reset':
                        handler.reset()
                        await websocket.send(json.dumps({
                            'type': 'reset_ack',
                            'timestamp': datetime.utcnow().isoformat()
                        }))
                        logger.info("VAD state reset")
                        
                    elif command.get('type') == 'mode':
                        # Switch between iterator mode and probability mode
                        use_iterator = command.get('use_iterator', True)
                        handler = VADHandler(model, use_iterator=use_iterator)
                        await websocket.send(json.dumps({
                            'type': 'mode_changed',
                            'use_iterator': use_iterator,
                            'timestamp': datetime.utcnow().isoformat()
                        }))
                        
                except json.JSONDecodeError:
                    await websocket.send(json.dumps({
                        'error': 'Invalid JSON command',
                        'timestamp': datetime.utcnow().isoformat()
                    }))
                    
    except websockets.exceptions.ConnectionClosed as e:
        logger.info(f"Connection closed: {e}")
    except Exception as e:
        logger.error(f"Error in connection handler: {e}")
        try:
            if websocket.open:
                await websocket.send(json.dumps({
                    'error': str(e),
                    'timestamp': datetime.utcnow().isoformat()
                }))
        except:
            logger.error(f"Failed to send error message to client")
    finally:
        handler.reset()

async def main():
    """Main server function"""
    host = "localhost"
    port = 8765
    
    logger.info(f"Starting Silero VAD WebSocket server on ws://{host}:{port}")
    logger.info(f"Expecting audio format: 16-bit PCM, {SAMPLING_RATE}Hz, mono")
    logger.info(f"Chunk size: {CHUNK_SIZE} samples ({CHUNK_SIZE/SAMPLING_RATE*1000:.1f}ms)")
    
    async with websockets.serve(handle_connection, host, port):
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    asyncio.run(main())