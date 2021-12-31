import hljs from 'highlight.js/lib/core'

import javascriptHighlighter from 'highlight.js/lib/languages/javascript'
import plaintextHighlighter from 'highlight.js/lib/languages/plaintext'

import { type Bindings, type Plugins } from '@execmd/plugin-common'
import { javascriptX } from '@execmd/plugin-javascript-x'
import { javascriptXAssert } from '@execmd/plugin-javascript-x-assert'
import { javascriptXInline } from '@execmd/plugin-javascript-x-inline'
import { javascriptXView } from '@execmd/plugin-javascript-x-view'
import { krokiX } from '@execmd/plugin-kroki-x'

export const standardSetup = (): { plugins: Plugins, bindings: Bindings } => {
  hljs.registerLanguage('javascript', javascriptHighlighter)
  hljs.registerLanguage('js', javascriptHighlighter)
  hljs.registerLanguage('plaintext', plaintextHighlighter)

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
