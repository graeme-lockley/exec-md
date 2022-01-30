import "core-js/stable"
import "regenerator-runtime/runtime"
import { createRuntime } from "@exec-md/runtime";
import { standardSetup, defineModuleConfig, markedParse } from '@exec-md/core'
import FS from 'fs'

let runtime = undefined
let module = undefined

const importModule = (runtime, filename) => {
    const module = runtime.module();
    const modules = []

    defineModuleConfig(module, filename)
    markedParse(FS.readFileSync(filename, 'utf-8'), module, false, modules)

    return [module, modules]
}

export const setUp = async (notebookName) => {
    globalThis.fetch = fetchFromFS
    standardSetup(undefined)

    runtime = createRuntime()

    const imports = importModule(runtime, notebookName)
    module = imports[0]
    await Promise.all(imports[1])
}

export const tearDown = () => {
    runtime.dispose()
    runtime = undefined
}

const fetchFromFS = (url) =>
    new Promise((resolve, reject) => {
        try {
            const fileName = url.startsWith('/') ? `./public${url}` : url

            FS.readFile(fileName, 'utf8', (err, data) => {
                if (err) {
                    console.error(`Fetch Error: ${url}`, err)
                    return reject(err)
                } else {
                    return resolve({ ok: true, text: () => data })
                }
            })
        } catch (e) {
            reject(e)
        }
    })

export const testAssertionValues = async () => {
    const names = [...module._scope.keys()].filter(n => n.startsWith('__assert_'))
    const values = names.map(name => module.value(name))

    const testResults = await Promise.all(values.map(value => {
        return value.then(v => {
            const result = v[1] === true
                ? false
                : {
                    name: v[0],
                    reason: v[1] === false ? 'Assertion failed' : 'Exception thrown'
                }

            if (result && v[1] !== false)
                result.detail = v[1]

            return result
        }).catch(e => e)
    }))

    return testResults.filter(n => n)
}

export const assertAssertions = async () => {
    const assertions = await testAssertionValues(module)

    expect(assertions).toEqual([])
}

export const value = async (variable) => 
    module.value(variable)