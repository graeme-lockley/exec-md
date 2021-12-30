import { load, loadSource } from '../index'

const ARB_TEXT = 'Hello World'
const ARB_URL = 'arb-url'
const INVALID_URL_RESPONSE = 'Invalid URL'

describe('loadSource', () => {
  test('valid URL', async () => {
    globalThis.fetch = validFetch

    const text = await loadAsText(ARB_URL)

    expect(text).toEqual(ARB_TEXT)
  })

  test('invalid URL', async () => {
    globalThis.fetch = invalidFetch

    await expect(() => loadAsText(ARB_URL)).rejects.toThrow(INVALID_URL_RESPONSE)
  })
})

describe('load', () => {
  test('valid URL', async () => {
    globalThis.fetch = validFetch

    const text = await load(ARB_URL)

    expect(text).toEqual(ARB_TEXT)
  })

  test('invalid URL', async () => {
    globalThis.fetch = invalidFetch

    await expect(() => load(ARB_URL)).rejects.toThrow(INVALID_URL_RESPONSE)
  })
})

const validFetch = (url: string): Promise<any> =>
  Promise.resolve({
    ok: true,
    text: () => Promise.resolve(ARB_TEXT)
  })

const invalidFetch = (url: string): Promise<any> =>
  Promise.reject(new Error(INVALID_URL_RESPONSE))

const loadAsText = async (url: string): Promise<any> => {
  const c = loadSource(url) as any
  return await c.text()
}
