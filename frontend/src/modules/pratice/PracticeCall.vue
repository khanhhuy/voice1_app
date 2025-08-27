<template>
  <div>
    <div class="flex h-full">
        <!-- Sidebar -->
        <div class="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
            <div class="p-6 border-b border-gray-200">
                <div class="flex items-center space-x-2">
                    <div class="w-8 h-8 bg-voice-blue rounded-lg flex items-center justify-center">
                        <span class="text-white font-bold text-sm">V1</span>
                    </div>
                    <span class="font-semibold text-gray-900">Voice 1</span>
                </div>
            </div>
            
            <div class="flex-1 p-4">
                <div class="mb-6">
                    <p class="text-sm font-medium text-gray-900 mb-3">Practice</p>
                    <div class="space-y-1">
                        <div class="flex items-center space-x-2 p-2 rounded-md bg-blue-50 text-blue-700">
                            <div class="w-2 h-2 bg-blue-600 rounded-full"></div>
                            <span class="text-sm font-medium">Product Team Scenarios</span>
                        </div>
                        <div class="flex items-center space-x-2 p-2 text-gray-600 hover:bg-gray-50 rounded-md cursor-pointer">
                            <div class="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <span class="text-sm">Customer Support Scenarios</span>
                        </div>
                    </div>
                </div>
                
                <div class="mb-6">
                    <p class="text-sm font-medium text-gray-900 mb-3">Review</p>
                    <div class="space-y-1">
                        <div class="flex items-center space-x-2 p-2 text-gray-600 hover:bg-gray-50 rounded-md cursor-pointer">
                            <div class="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <span class="text-sm">Past Sessions</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="p-4 border-t border-gray-200">
                <div class="flex items-center space-x-2 p-2 text-gray-600 hover:bg-gray-50 rounded-md cursor-pointer">
                    <div class="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span class="text-sm">My Account</span>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="flex-1 flex flex-col" id="mainContent">
            <!-- Pre-Practice Briefing (Initial State) -->
            <div id="briefingState" class="flex-1 p-8">
                <div class="max-w-4xl mx-auto">
                    <!-- Header -->
                    <div class="mb-8">
                        <div class="flex items-center space-x-3 mb-4">
                            <button onclick="goBack()" class="p-2 hover:bg-gray-100 rounded-md transition-colors">
                                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                                </svg>
                            </button>
                            <div>
                                <h1 class="text-2xl font-bold text-gray-900">First-Time User Interview</h1>
                                <p class="text-gray-600">Practice conducting user interviews and discovering insights</p>
                            </div>
                        </div>
                        
                        <div class="flex items-center space-x-4">
                            <div class="flex items-center space-x-2">
                                <span class="px-2 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">gentle</span>
                                <div class="relative group">
                                    <svg class="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        Gentle: Supportive AI responses, clear guidance
                                    </div>
                                </div>
                            </div>
                            <span class="text-gray-500">•</span>
                            <span class="text-sm text-gray-600">10-15 min practice</span>
                        </div>
                    </div>

                    <!-- Customer Profile -->
                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Your Customer Today</h3>
                        <div class="flex items-start space-x-4">
                            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <span class="text-blue-700 font-semibold">JL</span>
                            </div>
                            <div class="flex-1">
                                <h4 class="font-semibold text-gray-900">Jessica Lee</h4>
                                <p class="text-gray-600">Marketing Manager, GrowthCo</p>
                                <div class="mt-3 p-3 bg-gray-50 rounded-md">
                                    <p class="text-sm text-gray-700"><strong>Context:</strong> New customer completed onboarding 2 weeks ago. You want to understand their initial experience and current workflow.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <!-- Success Criteria -->
                        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4">Success Criteria</h3>
                            <div class="space-y-3">
                                <div class="flex items-start space-x-3">
                                    <div class="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0 mt-0.5"></div>
                                    <p class="text-sm text-gray-700">Ask at least 3 follow-up questions about their workflow</p>
                                </div>
                                <div class="flex items-start space-x-3">
                                    <div class="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0 mt-0.5"></div>
                                    <p class="text-sm text-gray-700">Identify 2+ pain points in their current process</p>
                                </div>
                                <div class="flex items-start space-x-3">
                                    <div class="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0 mt-0.5"></div>
                                    <p class="text-sm text-gray-700">Maintain empathetic tone throughout conversation</p>
                                </div>
                                <div class="flex items-start space-x-3">
                                    <div class="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0 mt-0.5"></div>
                                    <p class="text-sm text-gray-700">Avoid leading questions that bias responses</p>
                                </div>
                            </div>
                        </div>

                        <!-- Skills & Tips -->
                        <div class="space-y-6">
                            <!-- Skills Practiced -->
                            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 class="text-lg font-semibold text-gray-900 mb-4">Skills You'll Practice</h3>
                                <div class="space-y-2">
                                    <span class="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">Active Listening</span>
                                    <span class="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full ml-2">Follow-up Questions</span>
                                    <span class="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">User Journey Mapping</span>
                                </div>
                            </div>

                            <!-- Quick Tips -->
                            <div class="bg-blue-50 rounded-lg border border-blue-200 p-6">
                                <h3 class="text-lg font-semibold text-blue-900 mb-3">💡 Quick Tips</h3>
                                <ul class="space-y-2 text-sm text-blue-800">
                                    <li>• Start with open-ended questions like "Tell me about..."</li>
                                    <li>• Use "Why?" and "How?" to dig deeper</li>
                                    <li>• Listen for emotions, not just facts</li>
                                    <li>• Summarize what you heard to confirm understanding</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <!-- Start Button -->
                    <div class="mt-8 text-center">
                        <button onclick="startPractice()" class="bg-black text-white px-8 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors">
                            Start Practice Session
                        </button>
                        <p class="text-sm text-gray-500 mt-2">The AI will simulate Jessica Lee - treat it like a real customer call</p>
                    </div>
                </div>
            </div>

            <!-- Active Practice Interface (Hidden Initially) -->
            <div id="practiceState" class="hidden flex-1 flex flex-col">
                <!-- Practice Header -->
                <div class="bg-white border-b border-gray-200 px-8 py-4">
                    <div class="flex items-center justify-between max-w-4xl mx-auto">
                        <div class="flex items-center space-x-4">
                            <div class="flex items-center space-x-2">
                                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span class="text-sm font-medium text-gray-900">Active Practice</span>
                            </div>
                            <span class="text-gray-300">|</span>
                            <span class="text-sm text-gray-600">First-Time User Interview with Jessica Lee</span>
                        </div>
                        
                        <div class="flex items-center space-x-4">
                            <div class="text-sm text-gray-600" id="timer">03:24</div>
                            <button onclick="endPractice()" class="text-sm text-gray-500 hover:text-gray-700">End Session</button>
                        </div>
                    </div>
                </div>

                <!-- Practice Content -->
                <div class="flex-1 flex max-w-4xl mx-auto w-full">
                    <!-- Conversation Area -->
                    <div class="flex-1 flex flex-col p-8">
                        <!-- AI Customer Display -->
                        <div class="text-center mb-8">
                            <div class="relative inline-block mb-4">
                                <div class="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                    <span class="text-2xl text-blue-700 font-semibold">JL</span>
                                </div>
                                <!-- Speaking Indicator -->
                                <div id="speakingIndicator" class="hidden absolute -bottom-1 -right-1">
                                    <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                        <div class="w-2 h-2 bg-white rounded speaking-indicator"></div>
                                    </div>
                                </div>
                            </div>
                            <h3 class="text-lg font-semibold text-gray-900">Jessica Lee</h3>
                            <p class="text-gray-600">Marketing Manager, GrowthCo</p>
                        </div>

                        <!-- Conversation Log -->
                        <div class="flex-1 bg-gray-50 rounded-lg p-4 mb-6 max-h-96 overflow-y-auto">
                            <div class="space-y-4" id="conversationLog">
                                <div class="bg-blue-100 rounded-lg p-3 max-w-sm">
                                    <p class="text-sm text-blue-800"><strong>Jessica:</strong> Hi! Thanks for setting up this call. I'm excited to chat about my experience with your product so far.</p>
                                </div>
                                <div class="bg-white rounded-lg p-3 max-w-sm ml-auto">
                                    <p class="text-sm text-gray-800"><strong>You:</strong> Hi Jessica! Thanks for taking the time. I'd love to hear about your experience. Can you tell me about how you've been using the product since onboarding?</p>
                                </div>
                                <div class="bg-blue-100 rounded-lg p-3 max-w-sm">
                                    <p class="text-sm text-blue-800"><strong>Jessica:</strong> Sure! I've been using it mostly for our campaign tracking. It's been helpful, though I'm still figuring out some of the advanced features.</p>
                                </div>
                            </div>
                        </div>

                        <!-- Voice Controls -->
                        <div class="flex items-center justify-center space-x-4">
                            <button id="micButton" onclick="toggleMic()" class="relative">
                                <div class="w-16 h-16 bg-voice-blue rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                                    <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clip-rule="evenodd"></path>
                                    </svg>
                                </div>
                                <div class="absolute inset-0 rounded-full border-2 border-voice-blue pulse-ring hidden" id="pulseRing"></div>
                            </button>
                            <div class="text-center">
                                <p class="text-sm text-gray-600" id="micStatus">Click to speak</p>
                            </div>
                        </div>
                    </div>

                    <!-- Real-time Guidance Sidebar -->
                    <div class="w-80 border-l border-gray-200 bg-gray-50 p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Real-time Guidance</h3>
                        
                        <!-- Progress -->
                        <div class="mb-6">
                            <h4 class="text-sm font-medium text-gray-900 mb-3">Success Criteria Progress</h4>
                            <div class="space-y-2">
                                <div class="flex items-center space-x-2">
                                    <div class="w-4 h-4 rounded-full bg-green-500 flex-shrink-0"></div>
                                    <p class="text-sm text-gray-600">Follow-up questions (1/3)</p>
                                </div>
                                <div class="flex items-center space-x-2">
                                    <div class="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0"></div>
                                    <p class="text-sm text-gray-600">Pain points identified (0/2)</p>
                                </div>
                                <div class="flex items-center space-x-2">
                                    <div class="w-4 h-4 rounded-full bg-green-500 flex-shrink-0"></div>
                                    <p class="text-sm text-gray-600">Empathetic tone maintained</p>
                                </div>
                                <div class="flex items-center space-x-2">
                                    <div class="w-4 h-4 rounded-full bg-green-500 flex-shrink-0"></div>
                                    <p class="text-sm text-gray-600">Avoiding leading questions</p>
                                </div>
                            </div>
                        </div>

                        <!-- Suggestions -->
                        <div class="mb-6">
                            <h4 class="text-sm font-medium text-gray-900 mb-3">💡 Helpful Prompts</h4>
                            <div class="space-y-2">
                                <div class="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                    <p class="text-sm text-yellow-800">Try asking: "What's been challenging about those advanced features?"</p>
                                </div>
                                <div class="p-3 bg-blue-50 border border-blue-200 rounded-md">
                                    <p class="text-sm text-blue-800">Consider exploring her workflow before using your product</p>
                                </div>
                            </div>
                        </div>

                        <!-- Quick Actions -->
                        <div>
                            <h4 class="text-sm font-medium text-gray-900 mb-3">Quick Actions</h4>
                            <div class="space-y-2">
                                <button class="w-full text-left p-2 text-sm text-gray-600 hover:bg-white rounded-md transition-colors">📝 Take a note</button>
                                <button class="w-full text-left p-2 text-sm text-gray-600 hover:bg-white rounded-md transition-colors">⏸️ Pause session</button>
                                <button class="w-full text-left p-2 text-sm text-gray-600 hover:bg-white rounded-md transition-colors">🔄 Restart from beginning</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePageHeader } from '@/modules/header/usePageHeader'

const { setTitle } = usePageHeader()!
setTitle('Practice Call')

let isListening = false;
        let sessionTimer = 204; // 3:24 in seconds
        let timerInterval;

        function startPractice() {
            document.getElementById('briefingState').classList.add('hidden');
            document.getElementById('practiceState').classList.remove('hidden');
            
            // Start the session timer
            timerInterval = setInterval(updateTimer, 1000);
            
            // Simulate initial AI response
            setTimeout(() => {
                showAISpeaking();
            }, 2000);
        }

        function endPractice() {
            // This would typically show a feedback/results screen
            alert('Practice session ended! In a real implementation, this would show your performance feedback.');
            clearInterval(timerInterval);
            
            // Reset to briefing state
            document.getElementById('practiceState').classList.add('hidden');
            document.getElementById('briefingState').classList.remove('hidden');
        }

        function goBack() {
            // This would navigate back to the scenarios selection page
            alert('Going back to scenario selection...');
        }

        function toggleMic() {
            const micButton = document.getElementById('micButton');
            const micStatus = document.getElementById('micStatus');
            const pulseRing = document.getElementById('pulseRing');
            
            isListening = !isListening;
            
            if (isListening) {
                micButton.classList.add('bg-red-500', 'hover:bg-red-600');
                micButton.classList.remove('bg-voice-blue', 'hover:bg-blue-600');
                micStatus.textContent = 'Listening...';
                pulseRing.classList.remove('hidden');
                
                // Simulate user speaking and then AI response
                setTimeout(() => {
                    toggleMic(); // Stop listening
                    addUserMessage("That's interesting! What specific advanced features have been giving you trouble?");
                    
                    setTimeout(() => {
                        showAISpeaking();
                        setTimeout(() => {
                            hideAISpeaking();
                            addAIMessage("Well, I've been struggling with the automation rules setup. It seems powerful but quite complex. Also, the reporting dashboard has so many options that I feel overwhelmed.");
                        }, 2000);
                    }, 1000);
                }, 3000);
            } else {
                micButton.classList.remove('bg-red-500', 'hover:bg-red-600');
                micButton.classList.add('bg-voice-blue', 'hover:bg-blue-600');
                micStatus.textContent = 'Click to speak';
                pulseRing.classList.add('hidden');
            }
        }

        function showAISpeaking() {
            document.getElementById('speakingIndicator').classList.remove('hidden');
        }

        function hideAISpeaking() {
            document.getElementById('speakingIndicator').classList.add('hidden');
        }

        function addUserMessage(message) {
            const conversationLog = document.getElementById('conversationLog');
            const messageDiv = document.createElement('div');
            messageDiv.className = 'bg-white rounded-lg p-3 max-w-sm ml-auto';
            messageDiv.innerHTML = `<p class="text-sm text-gray-800"><strong>You:</strong> ${message}</p>`;
            conversationLog.appendChild(messageDiv);
            conversationLog.scrollTop = conversationLog.scrollHeight;
        }

        function addAIMessage(message) {
            const conversationLog = document.getElementById('conversationLog');
            const messageDiv = document.createElement('div');
            messageDiv.className = 'bg-blue-100 rounded-lg p-3 max-w-sm';
            messageDiv.innerHTML = `<p class="text-sm text-blue-800"><strong>Jessica:</strong> ${message}</p>`;
            conversationLog.appendChild(messageDiv);
            conversationLog.scrollTop = conversationLog.scrollHeight;
        }

        function updateTimer() {
            sessionTimer++;
            const minutes = Math.floor(sessionTimer / 60);
            const seconds = sessionTimer % 60;
            document.getElementById('timer').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        // Simulate progress updates
        setTimeout(() => {
            if (!document.getElementById('practiceState').classList.contains('hidden')) {
                // Update progress indicators as the conversation progresses
                console.log('Updating progress...');
            }
        }, 10000);
</script>