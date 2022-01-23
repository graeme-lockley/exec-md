import * as FS from 'fs'

import { javascriptX, performImport, relativeURL } from '../JavascriptX'
import { createRuntime, IModule } from '@exec-md/runtime'

describe('relativeURL', () => {
  test('relative to local', () => {
    expect(relativeURL('src/__tests__/primary.md', 'fred.md')).toEqual('src/__tests__/fred.md')
    expect(relativeURL('src/__tests__/primary.md', '../fred.md')).toEqual('src/fred.md')
    expect(relativeURL('src/__tests__/primary.md', '../../fred.md')).toEqual('/fred.md')
    expect(relativeURL('src/__tests__/primary.md', '../../../fred.md')).toEqual('/fred.md')
  })

  test('absolute http', () => {
    expect(relativeURL('src/__tests__/primary.md', 'http://hello.world')).toEqual('http://hello.world')
    expect(relativeURL('src/__tests__/primary.md', 'https://hello.world')).toEqual('https://hello.world')
  })
})

describe('import', () => {
  describe('relative import', () => {
    test('nested', async () => {
      const validFetch = (url: string): Promise<any> =>
        new Promise((resolve, reject) => {
          try {
            FS.readFile(url, 'utf8', (err, data) => {
              if (err) {
                return reject(err)
              } else {
                return resolve({ text: () => data })
              }
            })
          } catch (e) {
            reject(e)
          }
        })

      globalThis.fetch = validFetch

      const runtime = createRuntime()
      const module = runtime.module()
      setConfig(module)

      await performImport(module, {
        type: 'import',
        // names: [{ name: 'nameA', alias: 'nameA' }, { name: 'nameAs', alias: 'nameAs' }],
        names: [{ name: 'nameAs', alias: 'nameAs' }],
        urn: './primary.md'
      })

      await delay(1000)

      const nameAs = await module.value('nameAs')
      expect(nameAs).toEqual('Hello World')

      // const nameA = await module.value('nameA')
      // expect(nameA).toEqual('Hello World')
    })
  })
})

const setConfig = (module: IModule) => {
  module.variable().define('__config', [], {
    url: './src/__tests__/test.md',
    plugins: [javascriptX],
    bindings: new Map()
  })
}

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))
