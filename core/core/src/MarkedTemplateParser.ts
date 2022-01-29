import { marked } from 'marked'
import { parseInfoString, renderCode, setup as pluginSetup, type Bindings, type Options, type Plugin, type Plugins } from '@exec-md/plugin-common'
import type { IModule } from '@exec-md/runtime'

import { standardSetup as ss } from './StandardSetup'

let hljs

let globalPlugins: Plugins = []
let globalBindings: Bindings = new Map()

export const standardSetup = (hljs: any): void => {
  const settings = ss(hljs)

  setup(settings.plugins, settings.bindings)
}

export const setup = (plugins: Plugins, bindings: Bindings): void => {
  hljs = bindings.get('hljs')
  pluginSetup(plugins, bindings)
  globalPlugins = plugins
  globalBindings = bindings
  marked.use({ renderer: renderer(plugins), extensions: [inlineExpression(plugins)] })
}

const renderer = (plugins: Plugins) => ({
  code (code: string, infostring: string, escaped: boolean | undefined) {
    const findResponse = find(plugins, infostring)

    if (findResponse === undefined) return renderCode(hljs, infostring, code)
    else {
      const [plugin, is] = findResponse

      return plugin.render(this.options.nbv_module, code, is, this.options.nbv_render, this.options.nbv_modules)
    }
  }
})

const inlineExpression = (plugins: Plugins) => ({
  name: 'expression',
  level: 'inline',
  start (src: string) {
    return src.match(/\$\{/)?.index
  },
  tokenizer (src: string, tokens: any) {
    if (src.startsWith('${')) {
      let index = 0

      // State values:
      //   0 - top-level Javascript
      //   1 - within a back quote (`)
      let state = 0

      while (index < src.length) {
        switch (state) {
          case 0:
            if (src[index] === '}') {
              const result = {
                type: 'expression',
                raw: src.slice(0, index + 1),
                body: src.slice(2, index)
              }
              return result
            } else if (src[index] === '`') { state = 1 }
            break
          case 1:
            if (src[index] === '`') {
              state = 0
            }
        }
        index += 1
      }
    }

    return undefined
  },
  renderer (token: any) {
    const findResponse = find(plugins, 'js inline')

    if (findResponse === undefined) { return '[Error: js inline: no plugin configured]' } else {
      const [plugin] = findResponse

      return plugin.render(this.parser.options.nbv_module, token.body, new Map(), this.parser.options.nbv_render, this.parser.options.nbv_modules)
    }
  }
})

export const translateMarkup = (text: string, module: IModule, url: string = ''): string => {
  defineModuleConfig(module, url)
  return markedParse(text, module, true)
}

export const translateURL = (url: string, module: IModule): Promise<string> =>
  fetch(url)
    .then((result) => result.text())
    .then((text) => {
      defineModuleConfig(module, url)

      return markedParse(text, module, true)
    })

export const defineModuleConfig = (module: IModule, url: string | undefined): void => {
  module.variable().define('__config', [], {
    url,
    plugins: globalPlugins,
    bindings: globalBindings
  })
}

export const markedParse = (text: string, module: IModule, render: boolean) =>
  marked.parse(text, { nbv_module: module, nbv_render: render, nbv_modules: [] })

const find = (plugins: Plugins, infostring: string): [Plugin, Options] | undefined =>
  findMap(plugins, (plugin: Plugin) => {
    const match = infostring.match(plugin.pattern)

    return (match == null)
      ? undefined
      : [plugin, parseInfoString(plugin.name + ' ' + infostring.slice(match[0].length))]
  })

function findMap<X, Y> (
  items: Array<X>,
  p: (x: X) => Y | undefined
): Y | undefined {
  let idx = 0

  while (idx < items.length) {
    const r = p(items[idx])

    if (r !== undefined) return r

    idx += 1
  }

  return undefined
}
