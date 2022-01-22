import { type IModule, type Observer, defineVariable } from '@exec-md/runtime'

import { parse, type ImportStatement, type ParseResult } from '@exec-md/javascript-parser'
import { parseInfoString, valueUpdater, inspectorUpdater, renderCode, type Bindings, type Inspector, type Options, type Plugin, type Plugins } from '@exec-md/plugin-common'

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
      performImport(module, pr).catch((e) => {
        console.error('plugin-javascript-x: performImport: ', e)
      })

      if (render) {
        const id = `js-x-${idCount++}`
        const observerID = id + '-observer'
        const codeID = id + '-code'

        const renderer: Renderer = () => renderCode(this.hljs, 'javascript', body)

        const variableObserver = observer(observerID, codeID, pr.urn, options.has('hide'), options.has('pin'), renderer)

        const aliases = pr.names.map(({ alias }) => alias)

        defineVariable(module, variableObserver, undefined, aliases, `({${aliases.join(', ')}})`)

        return `<div id='${id}' class='nbv-js-x'><div id='${observerID}'></div><div id='${codeID}'></div></div>`
      } else {
        return ''
      }
    }
  }
}

export const performImport = async (module: IModule, pr: ImportStatement): Promise<any> =>
  performImportItem(module, pr)

const performImportItem = (module: IModule, pr: ImportStatement): Promise<any> => {
  const neverResolves = new Promise((resolve, reject) => {
  })

  const variables = new Map()
  pr.names.forEach(({ name, alias }) => {
    const v = module.variable()

    variables.set(alias, v)

    v.define(alias, [], neverResolves)
  })

  return module.value('__config').then((config) => {
    const url = relativeURL(config.url, pr.urn)
    return fetch(url).then(result => result.text()).then(text => {
      const newModule = module._runtime.module()

      newModule.variable().define('__config', [], {
        url,
        plugins: config.plugins,
        bindings: config.bindings
      })

      importMarkup(text, newModule, config.plugins)

      pr.names.forEach(({ name, alias }) => {
        variables.get(alias).delete()
        module.variable().import(name, alias, newModule)
      })

      return text
    })
  })
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

export const importMarkup = (text: string, module: IModule, plugins: Plugins): void => {
  const lines = text.split(/\n/)
  const numberOfLines = lines.length
  let lp = 0

  while (lp < numberOfLines) {
    const line = lines[lp]

    if (line.startsWith('```')) {
      let nextLp = lp + 1
      while (true) {
        if (nextLp === numberOfLines) {
          return
        }

        const nextLine = lines[nextLp]

        if (nextLine.startsWith('```')) {
          const body = lines.slice(lp + 1, nextLp).join('\n')
          const infostring = line.slice(3).trim()

          const findResponse = find(plugins, infostring)

          if (findResponse !== undefined) {
            const [plugin, is] = findResponse

            plugin.render(module, body, is, false)
          }

          lp = nextLp + 1
          break
        }

        nextLp += 1
      }
    }

    lp += 1
  }
}

export const relativeURL = (baseURL: string, relURL: string): string => {
  if (relURL.startsWith('http:') || relURL.startsWith('https:') || relURL.startsWith('/')) {
    return relURL
  }

  const dropLastComponent = (name: string): string => {
    if (name.length === 0) {
      return name
    }

    const idx = name.lastIndexOf('/', name[name.length - 1] === '/' ? name.length - 2 : name.length - 1)

    return (idx === -1)
      ? '/'
      : name.slice(0, idx + 1)
  }

  baseURL = dropLastComponent(baseURL)

  while (true) {
    if (relURL.startsWith('./')) {
      relURL = relURL.slice(2)
    } else if (relURL.startsWith('../')) {
      relURL = relURL.slice(3)
      baseURL = dropLastComponent(baseURL)
    } else {
      return baseURL + relURL
    }
  }
}

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
