import { type Bindings, type Plugins } from '@exec-md/plugin-common'
import { javascriptX } from '@exec-md/plugin-javascript-x'
import { javascriptXAssert } from '@exec-md/plugin-javascript-x-assert'
import { javascriptXInline } from '@exec-md/plugin-javascript-x-inline'
import { javascriptXView } from '@exec-md/plugin-javascript-x-view'
import { krokiX } from '@exec-md/plugin-kroki-x'

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
