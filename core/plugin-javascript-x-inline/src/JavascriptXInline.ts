import { type IModule, type Observer, defineVariable } from '@exec-md/runtime'

import { parse } from '@exec-md/javascript-parser'
import { valueUpdater, type Bindings, type Options, type Plugin } from '@exec-md/plugin-common'

interface JavascriptXInline extends Plugin {
    hljs: any | undefined;
}

let idCount = 0

export const javascriptXInline: JavascriptXInline = {
  name: 'js-inline',
  pattern: /^(js|javascript)\s+inline\s*/,

  hljs: undefined,

  setup: function (bindings: Bindings) {
    this.hljs = bindings.get('hljs')
  },

  render: function (module: IModule, body: string, options: Options, render: boolean, modules: Array<Promise<IModule>>): string | Node {
    if (render) {
      if (body === null || body === undefined || body === '') { return '<span class=\'nbv-js-x-inline\'></span>' } else {
        try {
          const pr = parse(body)

          if (pr.type === 'assignment') {
            const id = `js-x-inline-${idCount++}`

            const variableObserver = observer(id)

            defineVariable(module, variableObserver, pr.name, pr.dependencies, pr.body)

            return `<span id='${id}' class='nbv-js-x-inline'></span>`
          } else { return '<div class=\'nbv-js-x-assert\'>Unable to inline an import</div>' }
        } catch (e) {
          return `<span class='nbv-js-x-inline'>${e}</span>`
        }
      }
    } else { return '' }
  }
}

const observer = (codeElementID: string): Observer => {
  const valueControl = valueUpdater(codeElementID)

  return {
    fulfilled: function (value: any): void {
      valueControl(value)
    },
    pending: function (): void {
      valueControl('')
    },
    rejected: function (value?: any): void {
      valueControl(value)
    }
  }
}
