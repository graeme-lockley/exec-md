import { type IModule, type Observer, defineVariable } from '@exec-md/runtime'

import { parse } from '@exec-md/javascript-parser'
import { valueUpdater, renderCode, type Bindings, type Options, type Plugin } from '@exec-md/plugin-common'

interface JavascriptXAssert extends Plugin {
  hljs: any | undefined;
}

type Renderer = () => string;

let idCount = 0

export const javascriptXAssert: JavascriptXAssert = {
  name: 'js-x-assert',
  pattern: /^(js|javascript)\s+x\s+assert\s*/,

  hljs: undefined,

  setup: function (bindings: Bindings) {
    this.hljs = bindings.get('hljs')
  },

  render: function (module: IModule, body: string, options: Options, render: boolean, modules: Array<Promise<IModule>>): string | Node {
    const pr =
      parse(body)

    if (render) {
      if (pr.type === 'assignment') {
        const id =
          `js-x-assert-${idCount++}`

        const renderer: Renderer =
          () => renderCode(this.hljs, 'javascript', body)

        const variableObserver: Observer =
          observer(id, options.get('js-x-assert'), options.has('hide'), options.has('pin'), renderer)

        defineVariable(module, variableObserver, pr.name, pr.dependencies, pr.body)

        return `<div id='${id}' class='nbv-js-x-assert'>Nothing to show</div>`
      } else { return '<div class=\'nbv-js-x-assert\'>Unable to assert against an import</div>' }
    } else {
      if (pr.type === 'assignment') {
        const id = `__assert_${idCount++}`
        const literalName = (options.get('js-x-assert') ?? id).replace(/'/g, "\\'")

        defineVariable(module, undefined, id, pr.dependencies, `{ try { return ['${literalName}', ${pr.body}] } catch (e) { return ['${literalName}', e] } }`)
      }

      return ''
    }
  }
}

const observer = (elementID: string, name: string | undefined, hide: boolean, pin: boolean, renderer: Renderer): Observer => {
  const update = valueUpdater(elementID)

  return {
    fulfilled: function (value: any): void {
      update(value
        ? `${hide ? '' : `<div class='nbv-passed'>${name}</div>`}${pin ? renderer() : ''}`
        : `<div class='nbv-failed'>${name}</div>${renderer()}`
      )
    },
    pending: function (): void {
      update(`${hide ? '' : `<div class='nbv-pending'>${name}</div>`}${pin ? renderer() : ''}`)
    },
    rejected: function (value?: any): void {
      update(`<div class='nbv-error-title'>${name}</div><div class='nbv-error-body'>${value}</div>${renderer()}`)
    }
  }
}
