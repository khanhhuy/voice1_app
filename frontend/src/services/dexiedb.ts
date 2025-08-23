import Dexie, { type Table } from 'dexie'

export interface BlobRecord {
  key: string
  value: Blob
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export class DexieDB extends Dexie {
  blobs!: Table<BlobRecord>

  constructor () {
    super('Voice1Database')
    this.version(1).stores({
      blobs: 'key, createdAt, updatedAt'
    })

    this.blobs.hook('creating', (_primKey, obj) => {
      obj.createdAt = new Date()
      obj.updatedAt = new Date()
    })

    this.blobs.hook('updating', (modifications) => {
      (modifications as BlobRecord).updatedAt = new Date()
    })
  }

  async setBlob (key: string, blob: Blob, metadata?: Record<string, unknown>): Promise<void> {
    await this.blobs.put({
      key,
      value: blob,
      metadata,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }

  async getBlob (key: string): Promise<Blob | null> {
    const record = await this.blobs.get(key)
    return record?.value || null
  }

  async getBlobRecord (key: string): Promise<BlobRecord | null> {
    return await this.blobs.get(key) || null
  }

  async hasBlob (key: string): Promise<boolean> {
    return await this.blobs.get(key) !== undefined
  }

  async deleteBlob (key: string): Promise<void> {
    await this.blobs.delete(key)
  }

  async getAllKeys (): Promise<string[]> {
    return await this.blobs.orderBy('key').keys() as string[]
  }

  async getAllBlobs (): Promise<BlobRecord[]> {
    return await this.blobs.toArray()
  }

  async clearAllBlobs (): Promise<void> {
    await this.blobs.clear()
  }

  async getBlobSize (key: string): Promise<number | null> {
    const record = await this.blobs.get(key)
    return record?.value.size || null
  }

  async getBlobCount (): Promise<number> {
    return await this.blobs.count()
  }

  async updateMetadata (key: string, metadata: Record<string, unknown>): Promise<void> {
    await this.blobs.update(key, { metadata })
  }

  async searchBlobsByKeyPattern (pattern: RegExp): Promise<BlobRecord[]> {
    return await this.blobs
      .filter(record => pattern.test(record.key))
      .toArray()
  }

}

export const db = new DexieDB()