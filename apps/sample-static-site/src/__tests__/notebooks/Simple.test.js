import "core-js/stable"
import "regenerator-runtime/runtime"
import { createRuntime } from "@exec-md/runtime";
import { standardSetup, defineModuleConfig, markedParse } from '@exec-md/core'
import FS from 'fs'

let runtime = undefined
let module = undefined

beforeAll(() => {
    globalThis.fetch = fetchFromFS
    standardSetup(undefined)
})

beforeEach(async () => {
    runtime = createRuntime()

    const imports = importModule(runtime, './public/notebooks/simple.md')
    module = imports[0]
    await Promise.all(imports[1])
})

afterEach(() => {
    runtime.dispose()
    runtime = undefined
})

describe('Simple Notebook', () => {
    test('value', async () => {
        const value = await module.value('value')
        const valuesSquared = await module.value('valuesSquared')

        expect(value).toEqual([2, 4, 6, 8, 10])
        expect(valuesSquared).toEqual([4, 16, 36, 64, 100])
    })

    test('athletes', async () => {
        const athletes = await module.value('athletes')

        expect(athletes[0]).toEqual({
            "bronze": 0,
            "date_of_birth": new Date('1969-10-17T00:00:00.000Z'),
            "gold": 0,
            "height": 1.72,
            "id": 736041664,
            "info": null,
            "name": "A Jesus Garcia",
            "nationality": "ESP",
            "sex": "male",
            "silver": 0,
            "sport": "athletics",
            "weight": 64,
        })

        expect(athletes.length).toEqual(11538)
    })

    test('arbList', async () => {
        const arbList = await module.value('arbList')

        expect(arbList.length).toEqual(20)
    })

    test('exponent', async () => {
        const exponent = await module.value('exponent')

        expect(exponent).toEqual(undefined)
    })
})

const importModule = (runtime, filename) => {
    const module = runtime.module();
    const modules = []

    defineModuleConfig(module, filename)
    markedParse(FS.readFileSync(filename, 'utf-8'), module, false, modules)

    return [module, modules]
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
