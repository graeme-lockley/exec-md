import { load, loadSource } from '../index'

describe('loadSource', () => {
  test('valid URL', async () => {
    globalThis.fetch = validFetch

    const csv = await loadAsText('arb-url')

    expect(csv).toEqual('Hello world')
  })

  test('invalid URL', async () => {
    globalThis.fetch = invalidFetch

    await expect(() => loadAsText('arb-url')).rejects.toThrow('Invalid URL')
  })
})

describe('load', () => {
  test('valid URL', async () => {
    globalThis.fetch = validFetch

    const text = await load('arb-url')
    expect(text).toEqual('Hello world')
  })

  test('invalid URL', async () => {
    globalThis.fetch = invalidFetch

    await expect(() => load('arb-url')).rejects.toThrow('Invalid URL')
  })
})

const validFetch = (url: string): Promise<any> => {
  return Promise.resolve({
    ok: true,
    text: () => Promise.resolve('Hello world')
  })
}

const invalidFetch = (url: string): Promise<any> => {
  return Promise.reject(new Error('Invalid URL'))
}

const loadAsText = async (url: string): Promise<any> => {
  const c = loadSource(url) as any
  return await c.text()
}
