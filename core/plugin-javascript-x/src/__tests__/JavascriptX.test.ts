import { performImport } from "../JavascriptX"
import { createRuntime } from "@exec-md/runtime"

describe('import', () => {
  test('variable defined prior to import', async () => {
    let whenDoneResolve: any = undefined

    const validFetch = (url: string): Promise<any> =>
      new Promise((resolve, reject) => {
        whenDoneResolve = (v: any) => resolve(v)
      })

    globalThis.fetch = validFetch

    const runtime = createRuntime()
    const module = runtime.module()

    performImport(module, {
      type: "import",
      names: [{ name: 'x', alias: 'y' }],
      urn: 'http://hello.world'
    })

    expect(module.value("y")).not.toBeUndefined()

    whenDoneResolve({
      ok: true,
      text: () => "``` js x\nx = 10;\n```"
    })

    expect(module.value("y")).not.toBeUndefined()

    runtime.dispose()
  })
})

