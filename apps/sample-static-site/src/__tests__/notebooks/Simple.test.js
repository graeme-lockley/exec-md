import "core-js/stable"
import "regenerator-runtime/runtime"
import { createRuntime } from "@exec-md/runtime";
import { standardSetup, defineModuleConfig, markedParse } from '@exec-md/core'
import FS from 'fs'

let runtime = undefined

beforeAll(() => {
    standardSetup(undefined)
})

beforeEach(() => {
    runtime = createRuntime();
})

afterEach(() => {
    runtime.dispose()
    runtime = undefined
})

test('value', async () => {
    const module = importModule(runtime, './public/notebooks/simple.md')

    const value = await module.value('value')

    expect(value).toEqual([2, 4, 6, 8, 10])
})


const importModule = (runtime, filename) => {
    const module = runtime.module();

    defineModuleConfig(module, filename)
    markedParse(FS.readFileSync(filename, 'utf-8'), module, false)

    return module
}