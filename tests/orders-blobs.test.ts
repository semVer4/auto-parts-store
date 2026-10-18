import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createBlobsOrderRepository } from '../src/server/blobs-order-repository'

const { getStore, getWithMetadata, setJSON, list } = vi.hoisted(() => ({
  getStore: vi.fn(),
  getWithMetadata: vi.fn(),
  setJSON: vi.fn(),
  list: vi.fn(),
}))
vi.mock('@netlify/blobs', () => ({ getStore }))

describe('Netlify Blobs order repository', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    getStore.mockReturnValue({ getWithMetadata, setJSON, list })
    list.mockResolvedValue({ blobs: [] })
  })

  it('uses site-wide strong reads and resolves runtime credentials lazily', async () => {
    const repository = createBlobsOrderRepository()
    expect(getStore).not.toHaveBeenCalled()
    getWithMetadata.mockResolvedValue({ data: { orders: [] }, etag: 'revision-one' })
    expect(await repository.read('session-key')).toEqual({
      data: { orders: [] },
      etag: 'revision-one',
    })
    expect(getStore).toHaveBeenCalledWith({
      name: 'autodetal-demo-orders-v1',
      consistency: 'strong',
    })
    expect(getWithMetadata).toHaveBeenCalledWith('session-key', {
      type: 'json',
      consistency: 'strong',
    })
  })

  it('distinguishes a missing session from a malformed persisted aggregate', async () => {
    const repository = createBlobsOrderRepository()
    getWithMetadata.mockResolvedValueOnce(null)
    expect(await repository.read('session-key')).toBeNull()
    getWithMetadata.mockResolvedValueOnce({ data: { orders: [] } })
    await expect(repository.read('session-key')).rejects.toThrow('Invalid persisted session')
    getWithMetadata.mockResolvedValueOnce({
      data: { orders: Array(21).fill({}) },
      etag: 'revision',
    })
    await expect(repository.read('session-key')).rejects.toThrow('Invalid persisted session')
  })

  it('uses create-only writes for new sessions and ETag conditional writes for updates', async () => {
    const repository = createBlobsOrderRepository()
    setJSON
      .mockResolvedValueOnce({ modified: true, etag: 'revision-one' })
      .mockResolvedValueOnce({ modified: false })
    expect(await repository.write('session-key', { orders: [] }, null)).toBe(true)
    expect(setJSON).toHaveBeenNthCalledWith(1, 'session-key', { orders: [] }, { onlyIfNew: true })
    expect(await repository.write('session-key', { orders: [] }, 'revision-one')).toBe(false)
    expect(setJSON).toHaveBeenNthCalledWith(
      2,
      'session-key',
      { orders: [] },
      { onlyIfMatch: 'revision-one' },
    )
  })

  it('recovers the real emulator ETag with a fenced exact-prefix read', async () => {
    const repository = createBlobsOrderRepository()
    getWithMetadata.mockResolvedValue({ data: { orders: [] } })
    list.mockResolvedValue({ blobs: [{ key: 'session-key', etag: 'actual-storage-etag' }] })
    expect(await repository.read('session-key')).toEqual({
      data: { orders: [] },
      etag: 'actual-storage-etag',
    })
    expect(list).toHaveBeenCalledTimes(2)
    expect(list).toHaveBeenCalledWith({ prefix: 'session-key' })
  })

  it('retries a missing-ETag read when the fenced revision changes', async () => {
    const repository = createBlobsOrderRepository()
    getWithMetadata.mockResolvedValue({ data: { orders: [] } })
    list
      .mockResolvedValueOnce({ blobs: [{ key: 'session-key', etag: 'old' }] })
      .mockResolvedValue({ blobs: [{ key: 'session-key', etag: 'new' }] })
    expect((await repository.read('session-key'))?.etag).toBe('new')
    expect(list).toHaveBeenCalledTimes(4)
  })

  it('fails closed when a missing ETag cannot be recovered consistently', async () => {
    const repository = createBlobsOrderRepository()
    getWithMetadata.mockResolvedValue({ data: { orders: [] } })
    let revision = 0
    list.mockImplementation(async () => ({
      blobs: [{ key: 'session-key', etag: String(++revision) }],
    }))
    await expect(repository.read('session-key')).rejects.toThrow('Invalid persisted session')
    expect(list).toHaveBeenCalledTimes(6)
    expect(setJSON).not.toHaveBeenCalled()
  })
})
