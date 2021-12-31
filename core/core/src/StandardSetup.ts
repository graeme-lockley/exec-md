import { type Bindings, type Plugins } from '@execmd/plugin-common'
import { javascriptX } from '@execmd/plugin-javascript-x'
import { javascriptXAssert } from '@execmd/plugin-javascript-x-assert'
import { javascriptXInline } from '@execmd/plugin-javascript-x-inline'
import { javascriptXView } from '@execmd/plugin-javascript-x-view'
import { krokiX } from '@execmd/plugin-kroki-x'

export const standardSetup = (hljs: any): { plugins: Plugins, bindings: Bindings } => {
  return {
    plugins: [
      javascriptXAssert,
      javascriptXView,
      javascriptXInline,
      javascriptX,
      krokiX
    ],
    bindings: new Map([['hljs', hljs]])
  }
}
