import { Library } from '@observablehq/runtime'
import { loadSource } from '@exec-md/load-resource'

const localBindings = {
  load: () => (url: string) => loadSource(url)
}

export const defaultLibrary = (bindings?: any): any =>
  Object.assign(new Library(), localBindings, bindings)
