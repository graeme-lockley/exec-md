import { marked } from 'marked'
import { type IModule, type Observer, defineVariable } from '@exec-md/runtime'

import { parse, type ParseResult } from '@exec-md/javascript-parser'
import { valueUpdater, inspectorUpdater, renderCode, type Bindings, type Inspector, type Options, type Plugin } from '@exec-md/plugin-common'

interface JavascriptX extends Plugin {
    hljs: any | undefined;
}

type Renderer = () => string;

let idCount = 0

export const javascriptX: JavascriptX = {
  name: 'js-x',
  pattern: /^(js|javascript)\s+x\s*/,

  hljs: undefined,

  setup: function (bindings: Bindings) {
    this.hljs = bindings.get('hljs')
  },

  render: function (module: IModule, body: string, options: Options, render: boolean): string | Node {
    const pr: ParseResult = parse(body)

    if (pr.type === 'assignment' || pr.type === 'exception') {
      if (render) {
        const id = `js-x-${idCount++}`
        const observerID = id + '-observer'
        const codeID = id + '-code'

        const renderer: Renderer =
                    () => renderCode(this.hljs, 'javascript', body)

        const name = pr.type === 'assignment' ? pr.name : undefined

        const variableObserver =
                    observer(observerID, codeID, name, options.has('hide'), options.has('pin'), renderer)

        if (pr.type === 'assignment') { defineVariable(module, variableObserver, pr.name, pr.dependencies, pr.body) } else {
          module.variable(variableObserver).define(name, [], () => {
            throw pr.exception
          })
        }

        return `<div id='${id}' class='nbv-js-x'><div id='${observerID}'></div><div id='${codeID}'></div></div>`
      } else if (pr.type === 'assignment') { defineVariable(module, undefined, pr.name, pr.dependencies, pr.body) }

      return ''
    } else {
      fetch(pr.urn).then((r) => r.text()).then((t) => {
        const newModule = module._runtime.module()
        importMarkup(t, newModule)

        pr.names.forEach(({ name, alias }) => module.variable().import(name, alias, newModule))
      }).catch(e => console.log(e))

      if (render) {
        const id = `js-x-${idCount++}`
        const observerID = id + '-observer'
        const codeID = id + '-code'

        const renderer: Renderer = () => renderCode(this.hljs, 'javascript', body)

        const variableObserver = observer(observerID, codeID, pr.urn, options.has('hide'), options.has('pin'), renderer)

        const aliases = pr.names.map(({ alias }) => alias)

        defineVariable(module, variableObserver, undefined, aliases, `({${aliases.join(', ')}})`)

        return `<div id='${id}' class='nbv-js-x'><div id='${observerID}'></div><div id='${codeID}'></div></div>`
      } else { return '' }
    }
  }
}

const observer = (inspectorElementID: string, codeElementID: string, name: string | undefined, hide: boolean, pin: boolean, renderer: Renderer): Observer => {
  const inspectorControl = hide ? undefined : inspectorUpdater(inspectorElementID)
  const codeControl = valueUpdater(codeElementID)

  return {
    fulfilled: function (value: any): void {
      if (!hide) { inspectorControl((inspector: Inspector) => inspector.fulfilled(value, name)) }
      codeControl(pin ? renderer() : '')
    },
    pending: function (): void {
      if (!hide) { inspectorControl((inspector: Inspector) => inspector.pending()) }
      codeControl(pin ? renderer() : '')
    },
    rejected: function (value?: any): void {
      if (!hide) { inspectorControl((inspector: Inspector) => inspector.rejected(value)) }
      codeControl(renderer())
    }
  }
}

export const importMarkup = (text: string, module: IModule): void =>
  marked.parse(text, { nbv_module: module, nbv_render: false })
