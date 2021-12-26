
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop$1() { }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element$2(name) {
        return document.createElement(name);
    }
    function text$3(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text$3(' ');
    }
    function empty$2() {
        return text$3('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }
    class HtmlTag {
        constructor() {
            this.e = this.n = null;
        }
        c(html) {
            this.h(html);
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element$2(target.nodeName);
                this.t = target;
                this.c(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }
    function update_await_block_branch(info, ctx, dirty) {
        const child_ctx = ctx.slice();
        const { resolved } = info;
        if (info.current === info.then) {
            child_ctx[info.value] = resolved;
        }
        if (info.current === info.catch) {
            child_ctx[info.error] = resolved;
        }
        info.block.p(child_ctx, dirty);
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop$1,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop$1;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.3' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    var deepFreezeEs6 = {exports: {}};

    function deepFreeze(obj) {
        if (obj instanceof Map) {
            obj.clear = obj.delete = obj.set = function () {
                throw new Error('map is read-only');
            };
        } else if (obj instanceof Set) {
            obj.add = obj.clear = obj.delete = function () {
                throw new Error('set is read-only');
            };
        }

        // Freeze self
        Object.freeze(obj);

        Object.getOwnPropertyNames(obj).forEach(function (name) {
            var prop = obj[name];

            // Freeze prop if it is an object
            if (typeof prop == 'object' && !Object.isFrozen(prop)) {
                deepFreeze(prop);
            }
        });

        return obj;
    }

    deepFreezeEs6.exports = deepFreeze;
    deepFreezeEs6.exports.default = deepFreeze;

    var deepFreeze$1 = deepFreezeEs6.exports;

    /** @typedef {import('highlight.js').CallbackResponse} CallbackResponse */
    /** @typedef {import('highlight.js').CompiledMode} CompiledMode */
    /** @implements CallbackResponse */

    class Response$1 {
      /**
       * @param {CompiledMode} mode
       */
      constructor(mode) {
        // eslint-disable-next-line no-undefined
        if (mode.data === undefined) mode.data = {};

        this.data = mode.data;
        this.isMatchIgnored = false;
      }

      ignoreMatch() {
        this.isMatchIgnored = true;
      }
    }

    /**
     * @param {string} value
     * @returns {string}
     */
    function escapeHTML(value) {
      return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
    }

    /**
     * performs a shallow merge of multiple objects into one
     *
     * @template T
     * @param {T} original
     * @param {Record<string,any>[]} objects
     * @returns {T} a single new object
     */
    function inherit$1(original, ...objects) {
      /** @type Record<string,any> */
      const result = Object.create(null);

      for (const key in original) {
        result[key] = original[key];
      }
      objects.forEach(function(obj) {
        for (const key in obj) {
          result[key] = obj[key];
        }
      });
      return /** @type {T} */ (result);
    }

    /**
     * @typedef {object} Renderer
     * @property {(text: string) => void} addText
     * @property {(node: Node) => void} openNode
     * @property {(node: Node) => void} closeNode
     * @property {() => string} value
     */

    /** @typedef {{kind?: string, sublanguage?: boolean}} Node */
    /** @typedef {{walk: (r: Renderer) => void}} Tree */
    /** */

    const SPAN_CLOSE = '</span>';

    /**
     * Determines if a node needs to be wrapped in <span>
     *
     * @param {Node} node */
    const emitsWrappingTags = (node) => {
      return !!node.kind;
    };

    /**
     *
     * @param {string} name
     * @param {{prefix:string}} options
     */
    const expandScopeName = (name, { prefix }) => {
      if (name.includes(".")) {
        const pieces = name.split(".");
        return [
          `${prefix}${pieces.shift()}`,
          ...(pieces.map((x, i) => `${x}${"_".repeat(i + 1)}`))
        ].join(" ");
      }
      return `${prefix}${name}`;
    };

    /** @type {Renderer} */
    class HTMLRenderer {
      /**
       * Creates a new HTMLRenderer
       *
       * @param {Tree} parseTree - the parse tree (must support `walk` API)
       * @param {{classPrefix: string}} options
       */
      constructor(parseTree, options) {
        this.buffer = "";
        this.classPrefix = options.classPrefix;
        parseTree.walk(this);
      }

      /**
       * Adds texts to the output stream
       *
       * @param {string} text */
      addText(text) {
        this.buffer += escapeHTML(text);
      }

      /**
       * Adds a node open to the output stream (if needed)
       *
       * @param {Node} node */
      openNode(node) {
        if (!emitsWrappingTags(node)) return;

        let scope = node.kind;
        if (node.sublanguage) {
          scope = `language-${scope}`;
        } else {
          scope = expandScopeName(scope, { prefix: this.classPrefix });
        }
        this.span(scope);
      }

      /**
       * Adds a node close to the output stream (if needed)
       *
       * @param {Node} node */
      closeNode(node) {
        if (!emitsWrappingTags(node)) return;

        this.buffer += SPAN_CLOSE;
      }

      /**
       * returns the accumulated buffer
      */
      value() {
        return this.buffer;
      }

      // helpers

      /**
       * Builds a span element
       *
       * @param {string} className */
      span(className) {
        this.buffer += `<span class="${className}">`;
      }
    }

    /** @typedef {{kind?: string, sublanguage?: boolean, children: Node[]} | string} Node */
    /** @typedef {{kind?: string, sublanguage?: boolean, children: Node[]} } DataNode */
    /** @typedef {import('highlight.js').Emitter} Emitter */
    /**  */

    class TokenTree {
      constructor() {
        /** @type DataNode */
        this.rootNode = { children: [] };
        this.stack = [this.rootNode];
      }

      get top() {
        return this.stack[this.stack.length - 1];
      }

      get root() { return this.rootNode; }

      /** @param {Node} node */
      add(node) {
        this.top.children.push(node);
      }

      /** @param {string} kind */
      openNode(kind) {
        /** @type Node */
        const node = { kind, children: [] };
        this.add(node);
        this.stack.push(node);
      }

      closeNode() {
        if (this.stack.length > 1) {
          return this.stack.pop();
        }
        // eslint-disable-next-line no-undefined
        return undefined;
      }

      closeAllNodes() {
        while (this.closeNode());
      }

      toJSON() {
        return JSON.stringify(this.rootNode, null, 4);
      }

      /**
       * @typedef { import("./html_renderer").Renderer } Renderer
       * @param {Renderer} builder
       */
      walk(builder) {
        // this does not
        return this.constructor._walk(builder, this.rootNode);
        // this works
        // return TokenTree._walk(builder, this.rootNode);
      }

      /**
       * @param {Renderer} builder
       * @param {Node} node
       */
      static _walk(builder, node) {
        if (typeof node === "string") {
          builder.addText(node);
        } else if (node.children) {
          builder.openNode(node);
          node.children.forEach((child) => this._walk(builder, child));
          builder.closeNode(node);
        }
        return builder;
      }

      /**
       * @param {Node} node
       */
      static _collapse(node) {
        if (typeof node === "string") return;
        if (!node.children) return;

        if (node.children.every(el => typeof el === "string")) {
          // node.text = node.children.join("");
          // delete node.children;
          node.children = [node.children.join("")];
        } else {
          node.children.forEach((child) => {
            TokenTree._collapse(child);
          });
        }
      }
    }

    /**
      Currently this is all private API, but this is the minimal API necessary
      that an Emitter must implement to fully support the parser.

      Minimal interface:

      - addKeyword(text, kind)
      - addText(text)
      - addSublanguage(emitter, subLanguageName)
      - finalize()
      - openNode(kind)
      - closeNode()
      - closeAllNodes()
      - toHTML()

    */

    /**
     * @implements {Emitter}
     */
    class TokenTreeEmitter extends TokenTree {
      /**
       * @param {*} options
       */
      constructor(options) {
        super();
        this.options = options;
      }

      /**
       * @param {string} text
       * @param {string} kind
       */
      addKeyword(text, kind) {
        if (text === "") { return; }

        this.openNode(kind);
        this.addText(text);
        this.closeNode();
      }

      /**
       * @param {string} text
       */
      addText(text) {
        if (text === "") { return; }

        this.add(text);
      }

      /**
       * @param {Emitter & {root: DataNode}} emitter
       * @param {string} name
       */
      addSublanguage(emitter, name) {
        /** @type DataNode */
        const node = emitter.root;
        node.kind = name;
        node.sublanguage = true;
        this.add(node);
      }

      toHTML() {
        const renderer = new HTMLRenderer(this, this.options);
        return renderer.value();
      }

      finalize() {
        return true;
      }
    }

    /**
     * @param {string} value
     * @returns {RegExp}
     * */

    /**
     * @param {RegExp | string } re
     * @returns {string}
     */
    function source(re) {
      if (!re) return null;
      if (typeof re === "string") return re;

      return re.source;
    }

    /**
     * @param {RegExp | string } re
     * @returns {string}
     */
    function lookahead(re) {
      return concat('(?=', re, ')');
    }

    /**
     * @param {RegExp | string } re
     * @returns {string}
     */
    function anyNumberOfTimes(re) {
      return concat('(?:', re, ')*');
    }

    /**
     * @param {RegExp | string } re
     * @returns {string}
     */
    function optional(re) {
      return concat('(?:', re, ')?');
    }

    /**
     * @param {...(RegExp | string) } args
     * @returns {string}
     */
    function concat(...args) {
      const joined = args.map((x) => source(x)).join("");
      return joined;
    }

    /**
     * @param { Array<string | RegExp | Object> } args
     * @returns {object}
     */
    function stripOptionsFromArgs(args) {
      const opts = args[args.length - 1];

      if (typeof opts === 'object' && opts.constructor === Object) {
        args.splice(args.length - 1, 1);
        return opts;
      } else {
        return {};
      }
    }

    /**
     * Any of the passed expresssions may match
     *
     * Creates a huge this | this | that | that match
     * @param {(RegExp | string)[] } args
     * @returns {string}
     */
    function either(...args) {
      /** @type { object & {capture?: boolean} }  */
      const opts = stripOptionsFromArgs(args);
      const joined = '('
        + (opts.capture ? "" : "?:")
        + args.map((x) => source(x)).join("|") + ")";
      return joined;
    }

    /**
     * @param {RegExp | string} re
     * @returns {number}
     */
    function countMatchGroups(re) {
      return (new RegExp(re.toString() + '|')).exec('').length - 1;
    }

    /**
     * Does lexeme start with a regular expression match at the beginning
     * @param {RegExp} re
     * @param {string} lexeme
     */
    function startsWith(re, lexeme) {
      const match = re && re.exec(lexeme);
      return match && match.index === 0;
    }

    // BACKREF_RE matches an open parenthesis or backreference. To avoid
    // an incorrect parse, it additionally matches the following:
    // - [...] elements, where the meaning of parentheses and escapes change
    // - other escape sequences, so we do not misparse escape sequences as
    //   interesting elements
    // - non-matching or lookahead parentheses, which do not capture. These
    //   follow the '(' with a '?'.
    const BACKREF_RE = /\[(?:[^\\\]]|\\.)*\]|\(\??|\\([1-9][0-9]*)|\\./;

    // **INTERNAL** Not intended for outside usage
    // join logically computes regexps.join(separator), but fixes the
    // backreferences so they continue to match.
    // it also places each individual regular expression into it's own
    // match group, keeping track of the sequencing of those match groups
    // is currently an exercise for the caller. :-)
    /**
     * @param {(string | RegExp)[]} regexps
     * @param {{joinWith: string}} opts
     * @returns {string}
     */
    function _rewriteBackreferences(regexps, { joinWith }) {
      let numCaptures = 0;

      return regexps.map((regex) => {
        numCaptures += 1;
        const offset = numCaptures;
        let re = source(regex);
        let out = '';

        while (re.length > 0) {
          const match = BACKREF_RE.exec(re);
          if (!match) {
            out += re;
            break;
          }
          out += re.substring(0, match.index);
          re = re.substring(match.index + match[0].length);
          if (match[0][0] === '\\' && match[1]) {
            // Adjust the backreference.
            out += '\\' + String(Number(match[1]) + offset);
          } else {
            out += match[0];
            if (match[0] === '(') {
              numCaptures++;
            }
          }
        }
        return out;
      }).map(re => `(${re})`).join(joinWith);
    }

    /** @typedef {import('highlight.js').Mode} Mode */
    /** @typedef {import('highlight.js').ModeCallback} ModeCallback */

    // Common regexps
    const MATCH_NOTHING_RE = /\b\B/;
    const IDENT_RE$1 = '[a-zA-Z]\\w*';
    const UNDERSCORE_IDENT_RE = '[a-zA-Z_]\\w*';
    const NUMBER_RE = '\\b\\d+(\\.\\d+)?';
    const C_NUMBER_RE = '(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)'; // 0x..., 0..., decimal, float
    const BINARY_NUMBER_RE = '\\b(0b[01]+)'; // 0b...
    const RE_STARTERS_RE = '!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~';

    /**
    * @param { Partial<Mode> & {binary?: string | RegExp} } opts
    */
    const SHEBANG = (opts = {}) => {
      const beginShebang = /^#![ ]*\//;
      if (opts.binary) {
        opts.begin = concat(
          beginShebang,
          /.*\b/,
          opts.binary,
          /\b.*/);
      }
      return inherit$1({
        scope: 'meta',
        begin: beginShebang,
        end: /$/,
        relevance: 0,
        /** @type {ModeCallback} */
        "on:begin": (m, resp) => {
          if (m.index !== 0) resp.ignoreMatch();
        }
      }, opts);
    };

    // Common modes
    const BACKSLASH_ESCAPE = {
      begin: '\\\\[\\s\\S]', relevance: 0
    };
    const APOS_STRING_MODE = {
      scope: 'string',
      begin: '\'',
      end: '\'',
      illegal: '\\n',
      contains: [BACKSLASH_ESCAPE]
    };
    const QUOTE_STRING_MODE = {
      scope: 'string',
      begin: '"',
      end: '"',
      illegal: '\\n',
      contains: [BACKSLASH_ESCAPE]
    };
    const PHRASAL_WORDS_MODE = {
      begin: /\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/
    };
    /**
     * Creates a comment mode
     *
     * @param {string | RegExp} begin
     * @param {string | RegExp} end
     * @param {Mode | {}} [modeOptions]
     * @returns {Partial<Mode>}
     */
    const COMMENT = function(begin, end, modeOptions = {}) {
      const mode = inherit$1(
        {
          scope: 'comment',
          begin,
          end,
          contains: []
        },
        modeOptions
      );
      mode.contains.push({
        scope: 'doctag',
        // hack to avoid the space from being included. the space is necessary to
        // match here to prevent the plain text rule below from gobbling up doctags
        begin: '[ ]*(?=(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):)',
        end: /(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):/,
        excludeBegin: true,
        relevance: 0
      });
      const ENGLISH_WORD = either(
        // list of common 1 and 2 letter words in English
        "I",
        "a",
        "is",
        "so",
        "us",
        "to",
        "at",
        "if",
        "in",
        "it",
        "on",
        // note: this is not an exhaustive list of contractions, just popular ones
        /[A-Za-z]+['](d|ve|re|ll|t|s|n)/, // contractions - can't we'd they're let's, etc
        /[A-Za-z]+[-][a-z]+/, // `no-way`, etc.
        /[A-Za-z][a-z]{2,}/ // allow capitalized words at beginning of sentences
      );
      // looking like plain text, more likely to be a comment
      mode.contains.push(
        {
          // TODO: how to include ", (, ) without breaking grammars that use these for
          // comment delimiters?
          // begin: /[ ]+([()"]?([A-Za-z'-]{3,}|is|a|I|so|us|[tT][oO]|at|if|in|it|on)[.]?[()":]?([.][ ]|[ ]|\))){3}/
          // ---

          // this tries to find sequences of 3 english words in a row (without any
          // "programming" type syntax) this gives us a strong signal that we've
          // TRULY found a comment - vs perhaps scanning with the wrong language.
          // It's possible to find something that LOOKS like the start of the
          // comment - but then if there is no readable text - good chance it is a
          // false match and not a comment.
          //
          // for a visual example please see:
          // https://github.com/highlightjs/highlight.js/issues/2827

          begin: concat(
            /[ ]+/, // necessary to prevent us gobbling up doctags like /* @author Bob Mcgill */
            '(',
            ENGLISH_WORD,
            /[.]?[:]?([.][ ]|[ ])/,
            '){3}') // look for 3 words in a row
        }
      );
      return mode;
    };
    const C_LINE_COMMENT_MODE = COMMENT('//', '$');
    const C_BLOCK_COMMENT_MODE = COMMENT('/\\*', '\\*/');
    const HASH_COMMENT_MODE = COMMENT('#', '$');
    const NUMBER_MODE = {
      scope: 'number',
      begin: NUMBER_RE,
      relevance: 0
    };
    const C_NUMBER_MODE = {
      scope: 'number',
      begin: C_NUMBER_RE,
      relevance: 0
    };
    const BINARY_NUMBER_MODE = {
      scope: 'number',
      begin: BINARY_NUMBER_RE,
      relevance: 0
    };
    const REGEXP_MODE = {
      // this outer rule makes sure we actually have a WHOLE regex and not simply
      // an expression such as:
      //
      //     3 / something
      //
      // (which will then blow up when regex's `illegal` sees the newline)
      begin: /(?=\/[^/\n]*\/)/,
      contains: [{
        scope: 'regexp',
        begin: /\//,
        end: /\/[gimuy]*/,
        illegal: /\n/,
        contains: [
          BACKSLASH_ESCAPE,
          {
            begin: /\[/,
            end: /\]/,
            relevance: 0,
            contains: [BACKSLASH_ESCAPE]
          }
        ]
      }]
    };
    const TITLE_MODE = {
      scope: 'title',
      begin: IDENT_RE$1,
      relevance: 0
    };
    const UNDERSCORE_TITLE_MODE = {
      scope: 'title',
      begin: UNDERSCORE_IDENT_RE,
      relevance: 0
    };
    const METHOD_GUARD = {
      // excludes method names from keyword processing
      begin: '\\.\\s*' + UNDERSCORE_IDENT_RE,
      relevance: 0
    };

    /**
     * Adds end same as begin mechanics to a mode
     *
     * Your mode must include at least a single () match group as that first match
     * group is what is used for comparison
     * @param {Partial<Mode>} mode
     */
    const END_SAME_AS_BEGIN = function(mode) {
      return Object.assign(mode,
        {
          /** @type {ModeCallback} */
          'on:begin': (m, resp) => { resp.data._beginMatch = m[1]; },
          /** @type {ModeCallback} */
          'on:end': (m, resp) => { if (resp.data._beginMatch !== m[1]) resp.ignoreMatch(); }
        });
    };

    var MODES = /*#__PURE__*/Object.freeze({
        __proto__: null,
        MATCH_NOTHING_RE: MATCH_NOTHING_RE,
        IDENT_RE: IDENT_RE$1,
        UNDERSCORE_IDENT_RE: UNDERSCORE_IDENT_RE,
        NUMBER_RE: NUMBER_RE,
        C_NUMBER_RE: C_NUMBER_RE,
        BINARY_NUMBER_RE: BINARY_NUMBER_RE,
        RE_STARTERS_RE: RE_STARTERS_RE,
        SHEBANG: SHEBANG,
        BACKSLASH_ESCAPE: BACKSLASH_ESCAPE,
        APOS_STRING_MODE: APOS_STRING_MODE,
        QUOTE_STRING_MODE: QUOTE_STRING_MODE,
        PHRASAL_WORDS_MODE: PHRASAL_WORDS_MODE,
        COMMENT: COMMENT,
        C_LINE_COMMENT_MODE: C_LINE_COMMENT_MODE,
        C_BLOCK_COMMENT_MODE: C_BLOCK_COMMENT_MODE,
        HASH_COMMENT_MODE: HASH_COMMENT_MODE,
        NUMBER_MODE: NUMBER_MODE,
        C_NUMBER_MODE: C_NUMBER_MODE,
        BINARY_NUMBER_MODE: BINARY_NUMBER_MODE,
        REGEXP_MODE: REGEXP_MODE,
        TITLE_MODE: TITLE_MODE,
        UNDERSCORE_TITLE_MODE: UNDERSCORE_TITLE_MODE,
        METHOD_GUARD: METHOD_GUARD,
        END_SAME_AS_BEGIN: END_SAME_AS_BEGIN
    });

    /**
    @typedef {import('highlight.js').CallbackResponse} CallbackResponse
    @typedef {import('highlight.js').CompilerExt} CompilerExt
    */

    // Grammar extensions / plugins
    // See: https://github.com/highlightjs/highlight.js/issues/2833

    // Grammar extensions allow "syntactic sugar" to be added to the grammar modes
    // without requiring any underlying changes to the compiler internals.

    // `compileMatch` being the perfect small example of now allowing a grammar
    // author to write `match` when they desire to match a single expression rather
    // than being forced to use `begin`.  The extension then just moves `match` into
    // `begin` when it runs.  Ie, no features have been added, but we've just made
    // the experience of writing (and reading grammars) a little bit nicer.

    // ------

    // TODO: We need negative look-behind support to do this properly
    /**
     * Skip a match if it has a preceding dot
     *
     * This is used for `beginKeywords` to prevent matching expressions such as
     * `bob.keyword.do()`. The mode compiler automatically wires this up as a
     * special _internal_ 'on:begin' callback for modes with `beginKeywords`
     * @param {RegExpMatchArray} match
     * @param {CallbackResponse} response
     */
    function skipIfHasPrecedingDot(match, response) {
      const before = match.input[match.index - 1];
      if (before === ".") {
        response.ignoreMatch();
      }
    }

    /**
     *
     * @type {CompilerExt}
     */
    function scopeClassName(mode, _parent) {
      // eslint-disable-next-line no-undefined
      if (mode.className !== undefined) {
        mode.scope = mode.className;
        delete mode.className;
      }
    }

    /**
     * `beginKeywords` syntactic sugar
     * @type {CompilerExt}
     */
    function beginKeywords(mode, parent) {
      if (!parent) return;
      if (!mode.beginKeywords) return;

      // for languages with keywords that include non-word characters checking for
      // a word boundary is not sufficient, so instead we check for a word boundary
      // or whitespace - this does no harm in any case since our keyword engine
      // doesn't allow spaces in keywords anyways and we still check for the boundary
      // first
      mode.begin = '\\b(' + mode.beginKeywords.split(' ').join('|') + ')(?!\\.)(?=\\b|\\s)';
      mode.__beforeBegin = skipIfHasPrecedingDot;
      mode.keywords = mode.keywords || mode.beginKeywords;
      delete mode.beginKeywords;

      // prevents double relevance, the keywords themselves provide
      // relevance, the mode doesn't need to double it
      // eslint-disable-next-line no-undefined
      if (mode.relevance === undefined) mode.relevance = 0;
    }

    /**
     * Allow `illegal` to contain an array of illegal values
     * @type {CompilerExt}
     */
    function compileIllegal(mode, _parent) {
      if (!Array.isArray(mode.illegal)) return;

      mode.illegal = either(...mode.illegal);
    }

    /**
     * `match` to match a single expression for readability
     * @type {CompilerExt}
     */
    function compileMatch(mode, _parent) {
      if (!mode.match) return;
      if (mode.begin || mode.end) throw new Error("begin & end are not supported with match");

      mode.begin = mode.match;
      delete mode.match;
    }

    /**
     * provides the default 1 relevance to all modes
     * @type {CompilerExt}
     */
    function compileRelevance(mode, _parent) {
      // eslint-disable-next-line no-undefined
      if (mode.relevance === undefined) mode.relevance = 1;
    }

    // allow beforeMatch to act as a "qualifier" for the match
    // the full match begin must be [beforeMatch][begin]
    const beforeMatchExt = (mode, parent) => {
      if (!mode.beforeMatch) return;
      // starts conflicts with endsParent which we need to make sure the child
      // rule is not matched multiple times
      if (mode.starts) throw new Error("beforeMatch cannot be used with starts");

      const originalMode = Object.assign({}, mode);
      Object.keys(mode).forEach((key) => { delete mode[key]; });

      mode.keywords = originalMode.keywords;
      mode.begin = concat(originalMode.beforeMatch, lookahead(originalMode.begin));
      mode.starts = {
        relevance: 0,
        contains: [
          Object.assign(originalMode, { endsParent: true })
        ]
      };
      mode.relevance = 0;

      delete originalMode.beforeMatch;
    };

    // keywords that should have no default relevance value
    const COMMON_KEYWORDS = [
      'of',
      'and',
      'for',
      'in',
      'not',
      'or',
      'if',
      'then',
      'parent', // common variable name
      'list', // common variable name
      'value' // common variable name
    ];

    const DEFAULT_KEYWORD_SCOPE = "keyword";

    /**
     * Given raw keywords from a language definition, compile them.
     *
     * @param {string | Record<string,string|string[]> | Array<string>} rawKeywords
     * @param {boolean} caseInsensitive
     */
    function compileKeywords(rawKeywords, caseInsensitive, scopeName = DEFAULT_KEYWORD_SCOPE) {
      /** @type KeywordDict */
      const compiledKeywords = Object.create(null);

      // input can be a string of keywords, an array of keywords, or a object with
      // named keys representing scopeName (which can then point to a string or array)
      if (typeof rawKeywords === 'string') {
        compileList(scopeName, rawKeywords.split(" "));
      } else if (Array.isArray(rawKeywords)) {
        compileList(scopeName, rawKeywords);
      } else {
        Object.keys(rawKeywords).forEach(function(scopeName) {
          // collapse all our objects back into the parent object
          Object.assign(
            compiledKeywords,
            compileKeywords(rawKeywords[scopeName], caseInsensitive, scopeName)
          );
        });
      }
      return compiledKeywords;

      // ---

      /**
       * Compiles an individual list of keywords
       *
       * Ex: "for if when while|5"
       *
       * @param {string} scopeName
       * @param {Array<string>} keywordList
       */
      function compileList(scopeName, keywordList) {
        if (caseInsensitive) {
          keywordList = keywordList.map(x => x.toLowerCase());
        }
        keywordList.forEach(function(keyword) {
          const pair = keyword.split('|');
          compiledKeywords[pair[0]] = [scopeName, scoreForKeyword(pair[0], pair[1])];
        });
      }
    }

    /**
     * Returns the proper score for a given keyword
     *
     * Also takes into account comment keywords, which will be scored 0 UNLESS
     * another score has been manually assigned.
     * @param {string} keyword
     * @param {string} [providedScore]
     */
    function scoreForKeyword(keyword, providedScore) {
      // manual scores always win over common keywords
      // so you can force a score of 1 if you really insist
      if (providedScore) {
        return Number(providedScore);
      }

      return commonKeyword(keyword) ? 0 : 1;
    }

    /**
     * Determines if a given keyword is common or not
     *
     * @param {string} keyword */
    function commonKeyword(keyword) {
      return COMMON_KEYWORDS.includes(keyword.toLowerCase());
    }

    /*

    For the reasoning behind this please see:
    https://github.com/highlightjs/highlight.js/issues/2880#issuecomment-747275419

    */

    /**
     * @type {Record<string, boolean>}
     */
    const seenDeprecations = {};

    /**
     * @param {string} message
     */
    const error = (message) => {
      console.error(message);
    };

    /**
     * @param {string} message
     * @param {any} args
     */
    const warn = (message, ...args) => {
      console.log(`WARN: ${message}`, ...args);
    };

    /**
     * @param {string} version
     * @param {string} message
     */
    const deprecated = (version, message) => {
      if (seenDeprecations[`${version}/${message}`]) return;

      console.log(`Deprecated as of ${version}. ${message}`);
      seenDeprecations[`${version}/${message}`] = true;
    };

    /* eslint-disable no-throw-literal */

    /**
    @typedef {import('highlight.js').CompiledMode} CompiledMode
    */

    const MultiClassError = new Error();

    /**
     * Renumbers labeled scope names to account for additional inner match
     * groups that otherwise would break everything.
     *
     * Lets say we 3 match scopes:
     *
     *   { 1 => ..., 2 => ..., 3 => ... }
     *
     * So what we need is a clean match like this:
     *
     *   (a)(b)(c) => [ "a", "b", "c" ]
     *
     * But this falls apart with inner match groups:
     *
     * (a)(((b)))(c) => ["a", "b", "b", "b", "c" ]
     *
     * Our scopes are now "out of alignment" and we're repeating `b` 3 times.
     * What needs to happen is the numbers are remapped:
     *
     *   { 1 => ..., 2 => ..., 5 => ... }
     *
     * We also need to know that the ONLY groups that should be output
     * are 1, 2, and 5.  This function handles this behavior.
     *
     * @param {CompiledMode} mode
     * @param {Array<RegExp | string>} regexes
     * @param {{key: "beginScope"|"endScope"}} opts
     */
    function remapScopeNames(mode, regexes, { key }) {
      let offset = 0;
      const scopeNames = mode[key];
      /** @type Record<number,boolean> */
      const emit = {};
      /** @type Record<number,string> */
      const positions = {};

      for (let i = 1; i <= regexes.length; i++) {
        positions[i + offset] = scopeNames[i];
        emit[i + offset] = true;
        offset += countMatchGroups(regexes[i - 1]);
      }
      // we use _emit to keep track of which match groups are "top-level" to avoid double
      // output from inside match groups
      mode[key] = positions;
      mode[key]._emit = emit;
      mode[key]._multi = true;
    }

    /**
     * @param {CompiledMode} mode
     */
    function beginMultiClass(mode) {
      if (!Array.isArray(mode.begin)) return;

      if (mode.skip || mode.excludeBegin || mode.returnBegin) {
        error("skip, excludeBegin, returnBegin not compatible with beginScope: {}");
        throw MultiClassError;
      }

      if (typeof mode.beginScope !== "object" || mode.beginScope === null) {
        error("beginScope must be object");
        throw MultiClassError;
      }

      remapScopeNames(mode, mode.begin, { key: "beginScope" });
      mode.begin = _rewriteBackreferences(mode.begin, { joinWith: "" });
    }

    /**
     * @param {CompiledMode} mode
     */
    function endMultiClass(mode) {
      if (!Array.isArray(mode.end)) return;

      if (mode.skip || mode.excludeEnd || mode.returnEnd) {
        error("skip, excludeEnd, returnEnd not compatible with endScope: {}");
        throw MultiClassError;
      }

      if (typeof mode.endScope !== "object" || mode.endScope === null) {
        error("endScope must be object");
        throw MultiClassError;
      }

      remapScopeNames(mode, mode.end, { key: "endScope" });
      mode.end = _rewriteBackreferences(mode.end, { joinWith: "" });
    }

    /**
     * this exists only to allow `scope: {}` to be used beside `match:`
     * Otherwise `beginScope` would necessary and that would look weird

      {
        match: [ /def/, /\w+/ ]
        scope: { 1: "keyword" , 2: "title" }
      }

     * @param {CompiledMode} mode
     */
    function scopeSugar(mode) {
      if (mode.scope && typeof mode.scope === "object" && mode.scope !== null) {
        mode.beginScope = mode.scope;
        delete mode.scope;
      }
    }

    /**
     * @param {CompiledMode} mode
     */
    function MultiClass(mode) {
      scopeSugar(mode);

      if (typeof mode.beginScope === "string") {
        mode.beginScope = { _wrap: mode.beginScope };
      }
      if (typeof mode.endScope === "string") {
        mode.endScope = { _wrap: mode.endScope };
      }

      beginMultiClass(mode);
      endMultiClass(mode);
    }

    /**
    @typedef {import('highlight.js').Mode} Mode
    @typedef {import('highlight.js').CompiledMode} CompiledMode
    @typedef {import('highlight.js').Language} Language
    @typedef {import('highlight.js').HLJSPlugin} HLJSPlugin
    @typedef {import('highlight.js').CompiledLanguage} CompiledLanguage
    */

    // compilation

    /**
     * Compiles a language definition result
     *
     * Given the raw result of a language definition (Language), compiles this so
     * that it is ready for highlighting code.
     * @param {Language} language
     * @returns {CompiledLanguage}
     */
    function compileLanguage(language) {
      /**
       * Builds a regex with the case sensitivity of the current language
       *
       * @param {RegExp | string} value
       * @param {boolean} [global]
       */
      function langRe(value, global) {
        return new RegExp(
          source(value),
          'm'
          + (language.case_insensitive ? 'i' : '')
          + (language.unicodeRegex ? 'u' : '')
          + (global ? 'g' : '')
        );
      }

      /**
        Stores multiple regular expressions and allows you to quickly search for
        them all in a string simultaneously - returning the first match.  It does
        this by creating a huge (a|b|c) regex - each individual item wrapped with ()
        and joined by `|` - using match groups to track position.  When a match is
        found checking which position in the array has content allows us to figure
        out which of the original regexes / match groups triggered the match.

        The match object itself (the result of `Regex.exec`) is returned but also
        enhanced by merging in any meta-data that was registered with the regex.
        This is how we keep track of which mode matched, and what type of rule
        (`illegal`, `begin`, end, etc).
      */
      class MultiRegex {
        constructor() {
          this.matchIndexes = {};
          // @ts-ignore
          this.regexes = [];
          this.matchAt = 1;
          this.position = 0;
        }

        // @ts-ignore
        addRule(re, opts) {
          opts.position = this.position++;
          // @ts-ignore
          this.matchIndexes[this.matchAt] = opts;
          this.regexes.push([opts, re]);
          this.matchAt += countMatchGroups(re) + 1;
        }

        compile() {
          if (this.regexes.length === 0) {
            // avoids the need to check length every time exec is called
            // @ts-ignore
            this.exec = () => null;
          }
          const terminators = this.regexes.map(el => el[1]);
          this.matcherRe = langRe(_rewriteBackreferences(terminators, { joinWith: '|' }), true);
          this.lastIndex = 0;
        }

        /** @param {string} s */
        exec(s) {
          this.matcherRe.lastIndex = this.lastIndex;
          const match = this.matcherRe.exec(s);
          if (!match) { return null; }

          // eslint-disable-next-line no-undefined
          const i = match.findIndex((el, i) => i > 0 && el !== undefined);
          // @ts-ignore
          const matchData = this.matchIndexes[i];
          // trim off any earlier non-relevant match groups (ie, the other regex
          // match groups that make up the multi-matcher)
          match.splice(0, i);

          return Object.assign(match, matchData);
        }
      }

      /*
        Created to solve the key deficiently with MultiRegex - there is no way to
        test for multiple matches at a single location.  Why would we need to do
        that?  In the future a more dynamic engine will allow certain matches to be
        ignored.  An example: if we matched say the 3rd regex in a large group but
        decided to ignore it - we'd need to started testing again at the 4th
        regex... but MultiRegex itself gives us no real way to do that.

        So what this class creates MultiRegexs on the fly for whatever search
        position they are needed.

        NOTE: These additional MultiRegex objects are created dynamically.  For most
        grammars most of the time we will never actually need anything more than the
        first MultiRegex - so this shouldn't have too much overhead.

        Say this is our search group, and we match regex3, but wish to ignore it.

          regex1 | regex2 | regex3 | regex4 | regex5    ' ie, startAt = 0

        What we need is a new MultiRegex that only includes the remaining
        possibilities:

          regex4 | regex5                               ' ie, startAt = 3

        This class wraps all that complexity up in a simple API... `startAt` decides
        where in the array of expressions to start doing the matching. It
        auto-increments, so if a match is found at position 2, then startAt will be
        set to 3.  If the end is reached startAt will return to 0.

        MOST of the time the parser will be setting startAt manually to 0.
      */
      class ResumableMultiRegex {
        constructor() {
          // @ts-ignore
          this.rules = [];
          // @ts-ignore
          this.multiRegexes = [];
          this.count = 0;

          this.lastIndex = 0;
          this.regexIndex = 0;
        }

        // @ts-ignore
        getMatcher(index) {
          if (this.multiRegexes[index]) return this.multiRegexes[index];

          const matcher = new MultiRegex();
          this.rules.slice(index).forEach(([re, opts]) => matcher.addRule(re, opts));
          matcher.compile();
          this.multiRegexes[index] = matcher;
          return matcher;
        }

        resumingScanAtSamePosition() {
          return this.regexIndex !== 0;
        }

        considerAll() {
          this.regexIndex = 0;
        }

        // @ts-ignore
        addRule(re, opts) {
          this.rules.push([re, opts]);
          if (opts.type === "begin") this.count++;
        }

        /** @param {string} s */
        exec(s) {
          const m = this.getMatcher(this.regexIndex);
          m.lastIndex = this.lastIndex;
          let result = m.exec(s);

          // The following is because we have no easy way to say "resume scanning at the
          // existing position but also skip the current rule ONLY". What happens is
          // all prior rules are also skipped which can result in matching the wrong
          // thing. Example of matching "booger":

          // our matcher is [string, "booger", number]
          //
          // ....booger....

          // if "booger" is ignored then we'd really need a regex to scan from the
          // SAME position for only: [string, number] but ignoring "booger" (if it
          // was the first match), a simple resume would scan ahead who knows how
          // far looking only for "number", ignoring potential string matches (or
          // future "booger" matches that might be valid.)

          // So what we do: We execute two matchers, one resuming at the same
          // position, but the second full matcher starting at the position after:

          //     /--- resume first regex match here (for [number])
          //     |/---- full match here for [string, "booger", number]
          //     vv
          // ....booger....

          // Which ever results in a match first is then used. So this 3-4 step
          // process essentially allows us to say "match at this position, excluding
          // a prior rule that was ignored".
          //
          // 1. Match "booger" first, ignore. Also proves that [string] does non match.
          // 2. Resume matching for [number]
          // 3. Match at index + 1 for [string, "booger", number]
          // 4. If #2 and #3 result in matches, which came first?
          if (this.resumingScanAtSamePosition()) {
            if (result && result.index === this.lastIndex) ; else { // use the second matcher result
              const m2 = this.getMatcher(0);
              m2.lastIndex = this.lastIndex + 1;
              result = m2.exec(s);
            }
          }

          if (result) {
            this.regexIndex += result.position + 1;
            if (this.regexIndex === this.count) {
              // wrap-around to considering all matches again
              this.considerAll();
            }
          }

          return result;
        }
      }

      /**
       * Given a mode, builds a huge ResumableMultiRegex that can be used to walk
       * the content and find matches.
       *
       * @param {CompiledMode} mode
       * @returns {ResumableMultiRegex}
       */
      function buildModeRegex(mode) {
        const mm = new ResumableMultiRegex();

        mode.contains.forEach(term => mm.addRule(term.begin, { rule: term, type: "begin" }));

        if (mode.terminatorEnd) {
          mm.addRule(mode.terminatorEnd, { type: "end" });
        }
        if (mode.illegal) {
          mm.addRule(mode.illegal, { type: "illegal" });
        }

        return mm;
      }

      /** skip vs abort vs ignore
       *
       * @skip   - The mode is still entered and exited normally (and contains rules apply),
       *           but all content is held and added to the parent buffer rather than being
       *           output when the mode ends.  Mostly used with `sublanguage` to build up
       *           a single large buffer than can be parsed by sublanguage.
       *
       *             - The mode begin ands ends normally.
       *             - Content matched is added to the parent mode buffer.
       *             - The parser cursor is moved forward normally.
       *
       * @abort  - A hack placeholder until we have ignore.  Aborts the mode (as if it
       *           never matched) but DOES NOT continue to match subsequent `contains`
       *           modes.  Abort is bad/suboptimal because it can result in modes
       *           farther down not getting applied because an earlier rule eats the
       *           content but then aborts.
       *
       *             - The mode does not begin.
       *             - Content matched by `begin` is added to the mode buffer.
       *             - The parser cursor is moved forward accordingly.
       *
       * @ignore - Ignores the mode (as if it never matched) and continues to match any
       *           subsequent `contains` modes.  Ignore isn't technically possible with
       *           the current parser implementation.
       *
       *             - The mode does not begin.
       *             - Content matched by `begin` is ignored.
       *             - The parser cursor is not moved forward.
       */

      /**
       * Compiles an individual mode
       *
       * This can raise an error if the mode contains certain detectable known logic
       * issues.
       * @param {Mode} mode
       * @param {CompiledMode | null} [parent]
       * @returns {CompiledMode | never}
       */
      function compileMode(mode, parent) {
        const cmode = /** @type CompiledMode */ (mode);
        if (mode.isCompiled) return cmode;

        [
          scopeClassName,
          // do this early so compiler extensions generally don't have to worry about
          // the distinction between match/begin
          compileMatch,
          MultiClass,
          beforeMatchExt
        ].forEach(ext => ext(mode, parent));

        language.compilerExtensions.forEach(ext => ext(mode, parent));

        // __beforeBegin is considered private API, internal use only
        mode.__beforeBegin = null;

        [
          beginKeywords,
          // do this later so compiler extensions that come earlier have access to the
          // raw array if they wanted to perhaps manipulate it, etc.
          compileIllegal,
          // default to 1 relevance if not specified
          compileRelevance
        ].forEach(ext => ext(mode, parent));

        mode.isCompiled = true;

        let keywordPattern = null;
        if (typeof mode.keywords === "object" && mode.keywords.$pattern) {
          // we need a copy because keywords might be compiled multiple times
          // so we can't go deleting $pattern from the original on the first
          // pass
          mode.keywords = Object.assign({}, mode.keywords);
          keywordPattern = mode.keywords.$pattern;
          delete mode.keywords.$pattern;
        }
        keywordPattern = keywordPattern || /\w+/;

        if (mode.keywords) {
          mode.keywords = compileKeywords(mode.keywords, language.case_insensitive);
        }

        cmode.keywordPatternRe = langRe(keywordPattern, true);

        if (parent) {
          if (!mode.begin) mode.begin = /\B|\b/;
          cmode.beginRe = langRe(cmode.begin);
          if (!mode.end && !mode.endsWithParent) mode.end = /\B|\b/;
          if (mode.end) cmode.endRe = langRe(cmode.end);
          cmode.terminatorEnd = source(cmode.end) || '';
          if (mode.endsWithParent && parent.terminatorEnd) {
            cmode.terminatorEnd += (mode.end ? '|' : '') + parent.terminatorEnd;
          }
        }
        if (mode.illegal) cmode.illegalRe = langRe(/** @type {RegExp | string} */ (mode.illegal));
        if (!mode.contains) mode.contains = [];

        mode.contains = [].concat(...mode.contains.map(function(c) {
          return expandOrCloneMode(c === 'self' ? mode : c);
        }));
        mode.contains.forEach(function(c) { compileMode(/** @type Mode */ (c), cmode); });

        if (mode.starts) {
          compileMode(mode.starts, parent);
        }

        cmode.matcher = buildModeRegex(cmode);
        return cmode;
      }

      if (!language.compilerExtensions) language.compilerExtensions = [];

      // self is not valid at the top-level
      if (language.contains && language.contains.includes('self')) {
        throw new Error("ERR: contains `self` is not supported at the top-level of a language.  See documentation.");
      }

      // we need a null object, which inherit will guarantee
      language.classNameAliases = inherit$1(language.classNameAliases || {});

      return compileMode(/** @type Mode */ (language));
    }

    /**
     * Determines if a mode has a dependency on it's parent or not
     *
     * If a mode does have a parent dependency then often we need to clone it if
     * it's used in multiple places so that each copy points to the correct parent,
     * where-as modes without a parent can often safely be re-used at the bottom of
     * a mode chain.
     *
     * @param {Mode | null} mode
     * @returns {boolean} - is there a dependency on the parent?
     * */
    function dependencyOnParent(mode) {
      if (!mode) return false;

      return mode.endsWithParent || dependencyOnParent(mode.starts);
    }

    /**
     * Expands a mode or clones it if necessary
     *
     * This is necessary for modes with parental dependenceis (see notes on
     * `dependencyOnParent`) and for nodes that have `variants` - which must then be
     * exploded into their own individual modes at compile time.
     *
     * @param {Mode} mode
     * @returns {Mode | Mode[]}
     * */
    function expandOrCloneMode(mode) {
      if (mode.variants && !mode.cachedVariants) {
        mode.cachedVariants = mode.variants.map(function(variant) {
          return inherit$1(mode, { variants: null }, variant);
        });
      }

      // EXPAND
      // if we have variants then essentially "replace" the mode with the variants
      // this happens in compileMode, where this function is called from
      if (mode.cachedVariants) {
        return mode.cachedVariants;
      }

      // CLONE
      // if we have dependencies on parents then we need a unique
      // instance of ourselves, so we can be reused with many
      // different parents without issue
      if (dependencyOnParent(mode)) {
        return inherit$1(mode, { starts: mode.starts ? inherit$1(mode.starts) : null });
      }

      if (Object.isFrozen(mode)) {
        return inherit$1(mode);
      }

      // no special dependency issues, just return ourselves
      return mode;
    }

    var version$1 = "11.3.1";

    class HTMLInjectionError extends Error {
      constructor(reason, html) {
        super(reason);
        this.name = "HTMLInjectionError";
        this.html = html;
      }
    }

    /*
    Syntax highlighting with language autodetection.
    https://highlightjs.org/
    */

    /**
    @typedef {import('highlight.js').Mode} Mode
    @typedef {import('highlight.js').CompiledMode} CompiledMode
    @typedef {import('highlight.js').CompiledScope} CompiledScope
    @typedef {import('highlight.js').Language} Language
    @typedef {import('highlight.js').HLJSApi} HLJSApi
    @typedef {import('highlight.js').HLJSPlugin} HLJSPlugin
    @typedef {import('highlight.js').PluginEvent} PluginEvent
    @typedef {import('highlight.js').HLJSOptions} HLJSOptions
    @typedef {import('highlight.js').LanguageFn} LanguageFn
    @typedef {import('highlight.js').HighlightedHTMLElement} HighlightedHTMLElement
    @typedef {import('highlight.js').BeforeHighlightContext} BeforeHighlightContext
    @typedef {import('highlight.js/private').MatchType} MatchType
    @typedef {import('highlight.js/private').KeywordData} KeywordData
    @typedef {import('highlight.js/private').EnhancedMatch} EnhancedMatch
    @typedef {import('highlight.js/private').AnnotatedError} AnnotatedError
    @typedef {import('highlight.js').AutoHighlightResult} AutoHighlightResult
    @typedef {import('highlight.js').HighlightOptions} HighlightOptions
    @typedef {import('highlight.js').HighlightResult} HighlightResult
    */


    const escape$1 = escapeHTML;
    const inherit = inherit$1;
    const NO_MATCH = Symbol("nomatch");
    const MAX_KEYWORD_HITS = 7;

    /**
     * @param {any} hljs - object that is extended (legacy)
     * @returns {HLJSApi}
     */
    const HLJS = function(hljs) {
      // Global internal variables used within the highlight.js library.
      /** @type {Record<string, Language>} */
      const languages = Object.create(null);
      /** @type {Record<string, string>} */
      const aliases = Object.create(null);
      /** @type {HLJSPlugin[]} */
      const plugins = [];

      // safe/production mode - swallows more errors, tries to keep running
      // even if a single syntax or parse hits a fatal error
      let SAFE_MODE = true;
      const LANGUAGE_NOT_FOUND = "Could not find the language '{}', did you forget to load/include a language module?";
      /** @type {Language} */
      const PLAINTEXT_LANGUAGE = { disableAutodetect: true, name: 'Plain text', contains: [] };

      // Global options used when within external APIs. This is modified when
      // calling the `hljs.configure` function.
      /** @type HLJSOptions */
      let options = {
        ignoreUnescapedHTML: false,
        throwUnescapedHTML: false,
        noHighlightRe: /^(no-?highlight)$/i,
        languageDetectRe: /\blang(?:uage)?-([\w-]+)\b/i,
        classPrefix: 'hljs-',
        cssSelector: 'pre code',
        languages: null,
        // beta configuration options, subject to change, welcome to discuss
        // https://github.com/highlightjs/highlight.js/issues/1086
        __emitter: TokenTreeEmitter
      };

      /* Utility functions */

      /**
       * Tests a language name to see if highlighting should be skipped
       * @param {string} languageName
       */
      function shouldNotHighlight(languageName) {
        return options.noHighlightRe.test(languageName);
      }

      /**
       * @param {HighlightedHTMLElement} block - the HTML element to determine language for
       */
      function blockLanguage(block) {
        let classes = block.className + ' ';

        classes += block.parentNode ? block.parentNode.className : '';

        // language-* takes precedence over non-prefixed class names.
        const match = options.languageDetectRe.exec(classes);
        if (match) {
          const language = getLanguage(match[1]);
          if (!language) {
            warn(LANGUAGE_NOT_FOUND.replace("{}", match[1]));
            warn("Falling back to no-highlight mode for this block.", block);
          }
          return language ? match[1] : 'no-highlight';
        }

        return classes
          .split(/\s+/)
          .find((_class) => shouldNotHighlight(_class) || getLanguage(_class));
      }

      /**
       * Core highlighting function.
       *
       * OLD API
       * highlight(lang, code, ignoreIllegals, continuation)
       *
       * NEW API
       * highlight(code, {lang, ignoreIllegals})
       *
       * @param {string} codeOrLanguageName - the language to use for highlighting
       * @param {string | HighlightOptions} optionsOrCode - the code to highlight
       * @param {boolean} [ignoreIllegals] - whether to ignore illegal matches, default is to bail
       *
       * @returns {HighlightResult} Result - an object that represents the result
       * @property {string} language - the language name
       * @property {number} relevance - the relevance score
       * @property {string} value - the highlighted HTML code
       * @property {string} code - the original raw code
       * @property {CompiledMode} top - top of the current mode stack
       * @property {boolean} illegal - indicates whether any illegal matches were found
      */
      function highlight(codeOrLanguageName, optionsOrCode, ignoreIllegals) {
        let code = "";
        let languageName = "";
        if (typeof optionsOrCode === "object") {
          code = codeOrLanguageName;
          ignoreIllegals = optionsOrCode.ignoreIllegals;
          languageName = optionsOrCode.language;
        } else {
          // old API
          deprecated("10.7.0", "highlight(lang, code, ...args) has been deprecated.");
          deprecated("10.7.0", "Please use highlight(code, options) instead.\nhttps://github.com/highlightjs/highlight.js/issues/2277");
          languageName = codeOrLanguageName;
          code = optionsOrCode;
        }

        // https://github.com/highlightjs/highlight.js/issues/3149
        // eslint-disable-next-line no-undefined
        if (ignoreIllegals === undefined) { ignoreIllegals = true; }

        /** @type {BeforeHighlightContext} */
        const context = {
          code,
          language: languageName
        };
        // the plugin can change the desired language or the code to be highlighted
        // just be changing the object it was passed
        fire("before:highlight", context);

        // a before plugin can usurp the result completely by providing it's own
        // in which case we don't even need to call highlight
        const result = context.result
          ? context.result
          : _highlight(context.language, context.code, ignoreIllegals);

        result.code = context.code;
        // the plugin can change anything in result to suite it
        fire("after:highlight", result);

        return result;
      }

      /**
       * private highlight that's used internally and does not fire callbacks
       *
       * @param {string} languageName - the language to use for highlighting
       * @param {string} codeToHighlight - the code to highlight
       * @param {boolean?} [ignoreIllegals] - whether to ignore illegal matches, default is to bail
       * @param {CompiledMode?} [continuation] - current continuation mode, if any
       * @returns {HighlightResult} - result of the highlight operation
      */
      function _highlight(languageName, codeToHighlight, ignoreIllegals, continuation) {
        const keywordHits = Object.create(null);

        /**
         * Return keyword data if a match is a keyword
         * @param {CompiledMode} mode - current mode
         * @param {string} matchText - the textual match
         * @returns {KeywordData | false}
         */
        function keywordData(mode, matchText) {
          return mode.keywords[matchText];
        }

        function processKeywords() {
          if (!top.keywords) {
            emitter.addText(modeBuffer);
            return;
          }

          let lastIndex = 0;
          top.keywordPatternRe.lastIndex = 0;
          let match = top.keywordPatternRe.exec(modeBuffer);
          let buf = "";

          while (match) {
            buf += modeBuffer.substring(lastIndex, match.index);
            const word = language.case_insensitive ? match[0].toLowerCase() : match[0];
            const data = keywordData(top, word);
            if (data) {
              const [kind, keywordRelevance] = data;
              emitter.addText(buf);
              buf = "";

              keywordHits[word] = (keywordHits[word] || 0) + 1;
              if (keywordHits[word] <= MAX_KEYWORD_HITS) relevance += keywordRelevance;
              if (kind.startsWith("_")) {
                // _ implied for relevance only, do not highlight
                // by applying a class name
                buf += match[0];
              } else {
                const cssClass = language.classNameAliases[kind] || kind;
                emitter.addKeyword(match[0], cssClass);
              }
            } else {
              buf += match[0];
            }
            lastIndex = top.keywordPatternRe.lastIndex;
            match = top.keywordPatternRe.exec(modeBuffer);
          }
          buf += modeBuffer.substr(lastIndex);
          emitter.addText(buf);
        }

        function processSubLanguage() {
          if (modeBuffer === "") return;
          /** @type HighlightResult */
          let result = null;

          if (typeof top.subLanguage === 'string') {
            if (!languages[top.subLanguage]) {
              emitter.addText(modeBuffer);
              return;
            }
            result = _highlight(top.subLanguage, modeBuffer, true, continuations[top.subLanguage]);
            continuations[top.subLanguage] = /** @type {CompiledMode} */ (result._top);
          } else {
            result = highlightAuto(modeBuffer, top.subLanguage.length ? top.subLanguage : null);
          }

          // Counting embedded language score towards the host language may be disabled
          // with zeroing the containing mode relevance. Use case in point is Markdown that
          // allows XML everywhere and makes every XML snippet to have a much larger Markdown
          // score.
          if (top.relevance > 0) {
            relevance += result.relevance;
          }
          emitter.addSublanguage(result._emitter, result.language);
        }

        function processBuffer() {
          if (top.subLanguage != null) {
            processSubLanguage();
          } else {
            processKeywords();
          }
          modeBuffer = '';
        }

        /**
         * @param {CompiledScope} scope
         * @param {RegExpMatchArray} match
         */
        function emitMultiClass(scope, match) {
          let i = 1;
          // eslint-disable-next-line no-undefined
          while (match[i] !== undefined) {
            if (!scope._emit[i]) { i++; continue; }
            const klass = language.classNameAliases[scope[i]] || scope[i];
            const text = match[i];
            if (klass) {
              emitter.addKeyword(text, klass);
            } else {
              modeBuffer = text;
              processKeywords();
              modeBuffer = "";
            }
            i++;
          }
        }

        /**
         * @param {CompiledMode} mode - new mode to start
         * @param {RegExpMatchArray} match
         */
        function startNewMode(mode, match) {
          if (mode.scope && typeof mode.scope === "string") {
            emitter.openNode(language.classNameAliases[mode.scope] || mode.scope);
          }
          if (mode.beginScope) {
            // beginScope just wraps the begin match itself in a scope
            if (mode.beginScope._wrap) {
              emitter.addKeyword(modeBuffer, language.classNameAliases[mode.beginScope._wrap] || mode.beginScope._wrap);
              modeBuffer = "";
            } else if (mode.beginScope._multi) {
              // at this point modeBuffer should just be the match
              emitMultiClass(mode.beginScope, match);
              modeBuffer = "";
            }
          }

          top = Object.create(mode, { parent: { value: top } });
          return top;
        }

        /**
         * @param {CompiledMode } mode - the mode to potentially end
         * @param {RegExpMatchArray} match - the latest match
         * @param {string} matchPlusRemainder - match plus remainder of content
         * @returns {CompiledMode | void} - the next mode, or if void continue on in current mode
         */
        function endOfMode(mode, match, matchPlusRemainder) {
          let matched = startsWith(mode.endRe, matchPlusRemainder);

          if (matched) {
            if (mode["on:end"]) {
              const resp = new Response$1(mode);
              mode["on:end"](match, resp);
              if (resp.isMatchIgnored) matched = false;
            }

            if (matched) {
              while (mode.endsParent && mode.parent) {
                mode = mode.parent;
              }
              return mode;
            }
          }
          // even if on:end fires an `ignore` it's still possible
          // that we might trigger the end node because of a parent mode
          if (mode.endsWithParent) {
            return endOfMode(mode.parent, match, matchPlusRemainder);
          }
        }

        /**
         * Handle matching but then ignoring a sequence of text
         *
         * @param {string} lexeme - string containing full match text
         */
        function doIgnore(lexeme) {
          if (top.matcher.regexIndex === 0) {
            // no more regexes to potentially match here, so we move the cursor forward one
            // space
            modeBuffer += lexeme[0];
            return 1;
          } else {
            // no need to move the cursor, we still have additional regexes to try and
            // match at this very spot
            resumeScanAtSamePosition = true;
            return 0;
          }
        }

        /**
         * Handle the start of a new potential mode match
         *
         * @param {EnhancedMatch} match - the current match
         * @returns {number} how far to advance the parse cursor
         */
        function doBeginMatch(match) {
          const lexeme = match[0];
          const newMode = match.rule;

          const resp = new Response$1(newMode);
          // first internal before callbacks, then the public ones
          const beforeCallbacks = [newMode.__beforeBegin, newMode["on:begin"]];
          for (const cb of beforeCallbacks) {
            if (!cb) continue;
            cb(match, resp);
            if (resp.isMatchIgnored) return doIgnore(lexeme);
          }

          if (newMode.skip) {
            modeBuffer += lexeme;
          } else {
            if (newMode.excludeBegin) {
              modeBuffer += lexeme;
            }
            processBuffer();
            if (!newMode.returnBegin && !newMode.excludeBegin) {
              modeBuffer = lexeme;
            }
          }
          startNewMode(newMode, match);
          return newMode.returnBegin ? 0 : lexeme.length;
        }

        /**
         * Handle the potential end of mode
         *
         * @param {RegExpMatchArray} match - the current match
         */
        function doEndMatch(match) {
          const lexeme = match[0];
          const matchPlusRemainder = codeToHighlight.substr(match.index);

          const endMode = endOfMode(top, match, matchPlusRemainder);
          if (!endMode) { return NO_MATCH; }

          const origin = top;
          if (top.endScope && top.endScope._wrap) {
            processBuffer();
            emitter.addKeyword(lexeme, top.endScope._wrap);
          } else if (top.endScope && top.endScope._multi) {
            processBuffer();
            emitMultiClass(top.endScope, match);
          } else if (origin.skip) {
            modeBuffer += lexeme;
          } else {
            if (!(origin.returnEnd || origin.excludeEnd)) {
              modeBuffer += lexeme;
            }
            processBuffer();
            if (origin.excludeEnd) {
              modeBuffer = lexeme;
            }
          }
          do {
            if (top.scope) {
              emitter.closeNode();
            }
            if (!top.skip && !top.subLanguage) {
              relevance += top.relevance;
            }
            top = top.parent;
          } while (top !== endMode.parent);
          if (endMode.starts) {
            startNewMode(endMode.starts, match);
          }
          return origin.returnEnd ? 0 : lexeme.length;
        }

        function processContinuations() {
          const list = [];
          for (let current = top; current !== language; current = current.parent) {
            if (current.scope) {
              list.unshift(current.scope);
            }
          }
          list.forEach(item => emitter.openNode(item));
        }

        /** @type {{type?: MatchType, index?: number, rule?: Mode}}} */
        let lastMatch = {};

        /**
         *  Process an individual match
         *
         * @param {string} textBeforeMatch - text preceding the match (since the last match)
         * @param {EnhancedMatch} [match] - the match itself
         */
        function processLexeme(textBeforeMatch, match) {
          const lexeme = match && match[0];

          // add non-matched text to the current mode buffer
          modeBuffer += textBeforeMatch;

          if (lexeme == null) {
            processBuffer();
            return 0;
          }

          // we've found a 0 width match and we're stuck, so we need to advance
          // this happens when we have badly behaved rules that have optional matchers to the degree that
          // sometimes they can end up matching nothing at all
          // Ref: https://github.com/highlightjs/highlight.js/issues/2140
          if (lastMatch.type === "begin" && match.type === "end" && lastMatch.index === match.index && lexeme === "") {
            // spit the "skipped" character that our regex choked on back into the output sequence
            modeBuffer += codeToHighlight.slice(match.index, match.index + 1);
            if (!SAFE_MODE) {
              /** @type {AnnotatedError} */
              const err = new Error(`0 width match regex (${languageName})`);
              err.languageName = languageName;
              err.badRule = lastMatch.rule;
              throw err;
            }
            return 1;
          }
          lastMatch = match;

          if (match.type === "begin") {
            return doBeginMatch(match);
          } else if (match.type === "illegal" && !ignoreIllegals) {
            // illegal match, we do not continue processing
            /** @type {AnnotatedError} */
            const err = new Error('Illegal lexeme "' + lexeme + '" for mode "' + (top.scope || '<unnamed>') + '"');
            err.mode = top;
            throw err;
          } else if (match.type === "end") {
            const processed = doEndMatch(match);
            if (processed !== NO_MATCH) {
              return processed;
            }
          }

          // edge case for when illegal matches $ (end of line) which is technically
          // a 0 width match but not a begin/end match so it's not caught by the
          // first handler (when ignoreIllegals is true)
          if (match.type === "illegal" && lexeme === "") {
            // advance so we aren't stuck in an infinite loop
            return 1;
          }

          // infinite loops are BAD, this is a last ditch catch all. if we have a
          // decent number of iterations yet our index (cursor position in our
          // parsing) still 3x behind our index then something is very wrong
          // so we bail
          if (iterations > 100000 && iterations > match.index * 3) {
            const err = new Error('potential infinite loop, way more iterations than matches');
            throw err;
          }

          /*
          Why might be find ourselves here?  An potential end match that was
          triggered but could not be completed.  IE, `doEndMatch` returned NO_MATCH.
          (this could be because a callback requests the match be ignored, etc)

          This causes no real harm other than stopping a few times too many.
          */

          modeBuffer += lexeme;
          return lexeme.length;
        }

        const language = getLanguage(languageName);
        if (!language) {
          error(LANGUAGE_NOT_FOUND.replace("{}", languageName));
          throw new Error('Unknown language: "' + languageName + '"');
        }

        const md = compileLanguage(language);
        let result = '';
        /** @type {CompiledMode} */
        let top = continuation || md;
        /** @type Record<string,CompiledMode> */
        const continuations = {}; // keep continuations for sub-languages
        const emitter = new options.__emitter(options);
        processContinuations();
        let modeBuffer = '';
        let relevance = 0;
        let index = 0;
        let iterations = 0;
        let resumeScanAtSamePosition = false;

        try {
          top.matcher.considerAll();

          for (;;) {
            iterations++;
            if (resumeScanAtSamePosition) {
              // only regexes not matched previously will now be
              // considered for a potential match
              resumeScanAtSamePosition = false;
            } else {
              top.matcher.considerAll();
            }
            top.matcher.lastIndex = index;

            const match = top.matcher.exec(codeToHighlight);
            // console.log("match", match[0], match.rule && match.rule.begin)

            if (!match) break;

            const beforeMatch = codeToHighlight.substring(index, match.index);
            const processedCount = processLexeme(beforeMatch, match);
            index = match.index + processedCount;
          }
          processLexeme(codeToHighlight.substr(index));
          emitter.closeAllNodes();
          emitter.finalize();
          result = emitter.toHTML();

          return {
            language: languageName,
            value: result,
            relevance: relevance,
            illegal: false,
            _emitter: emitter,
            _top: top
          };
        } catch (err) {
          if (err.message && err.message.includes('Illegal')) {
            return {
              language: languageName,
              value: escape$1(codeToHighlight),
              illegal: true,
              relevance: 0,
              _illegalBy: {
                message: err.message,
                index: index,
                context: codeToHighlight.slice(index - 100, index + 100),
                mode: err.mode,
                resultSoFar: result
              },
              _emitter: emitter
            };
          } else if (SAFE_MODE) {
            return {
              language: languageName,
              value: escape$1(codeToHighlight),
              illegal: false,
              relevance: 0,
              errorRaised: err,
              _emitter: emitter,
              _top: top
            };
          } else {
            throw err;
          }
        }
      }

      /**
       * returns a valid highlight result, without actually doing any actual work,
       * auto highlight starts with this and it's possible for small snippets that
       * auto-detection may not find a better match
       * @param {string} code
       * @returns {HighlightResult}
       */
      function justTextHighlightResult(code) {
        const result = {
          value: escape$1(code),
          illegal: false,
          relevance: 0,
          _top: PLAINTEXT_LANGUAGE,
          _emitter: new options.__emitter(options)
        };
        result._emitter.addText(code);
        return result;
      }

      /**
      Highlighting with language detection. Accepts a string with the code to
      highlight. Returns an object with the following properties:

      - language (detected language)
      - relevance (int)
      - value (an HTML string with highlighting markup)
      - secondBest (object with the same structure for second-best heuristically
        detected language, may be absent)

        @param {string} code
        @param {Array<string>} [languageSubset]
        @returns {AutoHighlightResult}
      */
      function highlightAuto(code, languageSubset) {
        languageSubset = languageSubset || options.languages || Object.keys(languages);
        const plaintext = justTextHighlightResult(code);

        const results = languageSubset.filter(getLanguage).filter(autoDetection).map(name =>
          _highlight(name, code, false)
        );
        results.unshift(plaintext); // plaintext is always an option

        const sorted = results.sort((a, b) => {
          // sort base on relevance
          if (a.relevance !== b.relevance) return b.relevance - a.relevance;

          // always award the tie to the base language
          // ie if C++ and Arduino are tied, it's more likely to be C++
          if (a.language && b.language) {
            if (getLanguage(a.language).supersetOf === b.language) {
              return 1;
            } else if (getLanguage(b.language).supersetOf === a.language) {
              return -1;
            }
          }

          // otherwise say they are equal, which has the effect of sorting on
          // relevance while preserving the original ordering - which is how ties
          // have historically been settled, ie the language that comes first always
          // wins in the case of a tie
          return 0;
        });

        const [best, secondBest] = sorted;

        /** @type {AutoHighlightResult} */
        const result = best;
        result.secondBest = secondBest;

        return result;
      }

      /**
       * Builds new class name for block given the language name
       *
       * @param {HTMLElement} element
       * @param {string} [currentLang]
       * @param {string} [resultLang]
       */
      function updateClassName(element, currentLang, resultLang) {
        const language = (currentLang && aliases[currentLang]) || resultLang;

        element.classList.add("hljs");
        element.classList.add(`language-${language}`);
      }

      /**
       * Applies highlighting to a DOM node containing code.
       *
       * @param {HighlightedHTMLElement} element - the HTML element to highlight
      */
      function highlightElement(element) {
        /** @type HTMLElement */
        let node = null;
        const language = blockLanguage(element);

        if (shouldNotHighlight(language)) return;

        fire("before:highlightElement",
          { el: element, language: language });

        // we should be all text, no child nodes (unescaped HTML) - this is possibly
        // an HTML injection attack - it's likely too late if this is already in
        // production (the code has likely already done its damage by the time
        // we're seeing it)... but we yell loudly about this so that hopefully it's
        // more likely to be caught in development before making it to production
        if (element.children.length > 0) {
          if (!options.ignoreUnescapedHTML) {
            console.warn("One of your code blocks includes unescaped HTML. This is a potentially serious security risk.");
            console.warn("https://github.com/highlightjs/highlight.js/issues/2886");
            console.warn(element);
          }
          if (options.throwUnescapedHTML) {
            const err = new HTMLInjectionError(
              "One of your code blocks includes unescaped HTML.",
              element.innerHTML
            );
            throw err;
          }
        }

        node = element;
        const text = node.textContent;
        const result = language ? highlight(text, { language, ignoreIllegals: true }) : highlightAuto(text);

        element.innerHTML = result.value;
        updateClassName(element, language, result.language);
        element.result = {
          language: result.language,
          // TODO: remove with version 11.0
          re: result.relevance,
          relevance: result.relevance
        };
        if (result.secondBest) {
          element.secondBest = {
            language: result.secondBest.language,
            relevance: result.secondBest.relevance
          };
        }

        fire("after:highlightElement", { el: element, result, text });
      }

      /**
       * Updates highlight.js global options with the passed options
       *
       * @param {Partial<HLJSOptions>} userOptions
       */
      function configure(userOptions) {
        options = inherit(options, userOptions);
      }

      // TODO: remove v12, deprecated
      const initHighlighting = () => {
        highlightAll();
        deprecated("10.6.0", "initHighlighting() deprecated.  Use highlightAll() now.");
      };

      // TODO: remove v12, deprecated
      function initHighlightingOnLoad() {
        highlightAll();
        deprecated("10.6.0", "initHighlightingOnLoad() deprecated.  Use highlightAll() now.");
      }

      let wantsHighlight = false;

      /**
       * auto-highlights all pre>code elements on the page
       */
      function highlightAll() {
        // if we are called too early in the loading process
        if (document.readyState === "loading") {
          wantsHighlight = true;
          return;
        }

        const blocks = document.querySelectorAll(options.cssSelector);
        blocks.forEach(highlightElement);
      }

      function boot() {
        // if a highlight was requested before DOM was loaded, do now
        if (wantsHighlight) highlightAll();
      }

      // make sure we are in the browser environment
      if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('DOMContentLoaded', boot, false);
      }

      /**
       * Register a language grammar module
       *
       * @param {string} languageName
       * @param {LanguageFn} languageDefinition
       */
      function registerLanguage(languageName, languageDefinition) {
        let lang = null;
        try {
          lang = languageDefinition(hljs);
        } catch (error$1) {
          error("Language definition for '{}' could not be registered.".replace("{}", languageName));
          // hard or soft error
          if (!SAFE_MODE) { throw error$1; } else { error(error$1); }
          // languages that have serious errors are replaced with essentially a
          // "plaintext" stand-in so that the code blocks will still get normal
          // css classes applied to them - and one bad language won't break the
          // entire highlighter
          lang = PLAINTEXT_LANGUAGE;
        }
        // give it a temporary name if it doesn't have one in the meta-data
        if (!lang.name) lang.name = languageName;
        languages[languageName] = lang;
        lang.rawDefinition = languageDefinition.bind(null, hljs);

        if (lang.aliases) {
          registerAliases(lang.aliases, { languageName });
        }
      }

      /**
       * Remove a language grammar module
       *
       * @param {string} languageName
       */
      function unregisterLanguage(languageName) {
        delete languages[languageName];
        for (const alias of Object.keys(aliases)) {
          if (aliases[alias] === languageName) {
            delete aliases[alias];
          }
        }
      }

      /**
       * @returns {string[]} List of language internal names
       */
      function listLanguages() {
        return Object.keys(languages);
      }

      /**
       * @param {string} name - name of the language to retrieve
       * @returns {Language | undefined}
       */
      function getLanguage(name) {
        name = (name || '').toLowerCase();
        return languages[name] || languages[aliases[name]];
      }

      /**
       *
       * @param {string|string[]} aliasList - single alias or list of aliases
       * @param {{languageName: string}} opts
       */
      function registerAliases(aliasList, { languageName }) {
        if (typeof aliasList === 'string') {
          aliasList = [aliasList];
        }
        aliasList.forEach(alias => { aliases[alias.toLowerCase()] = languageName; });
      }

      /**
       * Determines if a given language has auto-detection enabled
       * @param {string} name - name of the language
       */
      function autoDetection(name) {
        const lang = getLanguage(name);
        return lang && !lang.disableAutodetect;
      }

      /**
       * Upgrades the old highlightBlock plugins to the new
       * highlightElement API
       * @param {HLJSPlugin} plugin
       */
      function upgradePluginAPI(plugin) {
        // TODO: remove with v12
        if (plugin["before:highlightBlock"] && !plugin["before:highlightElement"]) {
          plugin["before:highlightElement"] = (data) => {
            plugin["before:highlightBlock"](
              Object.assign({ block: data.el }, data)
            );
          };
        }
        if (plugin["after:highlightBlock"] && !plugin["after:highlightElement"]) {
          plugin["after:highlightElement"] = (data) => {
            plugin["after:highlightBlock"](
              Object.assign({ block: data.el }, data)
            );
          };
        }
      }

      /**
       * @param {HLJSPlugin} plugin
       */
      function addPlugin(plugin) {
        upgradePluginAPI(plugin);
        plugins.push(plugin);
      }

      /**
       *
       * @param {PluginEvent} event
       * @param {any} args
       */
      function fire(event, args) {
        const cb = event;
        plugins.forEach(function(plugin) {
          if (plugin[cb]) {
            plugin[cb](args);
          }
        });
      }

      /**
       * DEPRECATED
       * @param {HighlightedHTMLElement} el
       */
      function deprecateHighlightBlock(el) {
        deprecated("10.7.0", "highlightBlock will be removed entirely in v12.0");
        deprecated("10.7.0", "Please use highlightElement now.");

        return highlightElement(el);
      }

      /* Interface definition */
      Object.assign(hljs, {
        highlight,
        highlightAuto,
        highlightAll,
        highlightElement,
        // TODO: Remove with v12 API
        highlightBlock: deprecateHighlightBlock,
        configure,
        initHighlighting,
        initHighlightingOnLoad,
        registerLanguage,
        unregisterLanguage,
        listLanguages,
        getLanguage,
        registerAliases,
        autoDetection,
        inherit,
        addPlugin
      });

      hljs.debugMode = function() { SAFE_MODE = false; };
      hljs.safeMode = function() { SAFE_MODE = true; };
      hljs.versionString = version$1;

      hljs.regex = {
        concat: concat,
        lookahead: lookahead,
        either: either,
        optional: optional,
        anyNumberOfTimes: anyNumberOfTimes
      };

      for (const key in MODES) {
        // @ts-ignore
        if (typeof MODES[key] === "object") {
          // @ts-ignore
          deepFreeze$1(MODES[key]);
        }
      }

      // merge all the modes/regexes into our main object
      Object.assign(hljs, MODES);

      return hljs;
    };

    // export an "instance" of the highlighter
    var highlight$1 = HLJS({});

    var core = highlight$1;
    highlight$1.HighlightJS = highlight$1;
    highlight$1.default = highlight$1;

    const IDENT_RE = '[A-Za-z$_][0-9A-Za-z$_]*';
    const KEYWORDS = [
      "as", // for exports
      "in",
      "of",
      "if",
      "for",
      "while",
      "finally",
      "var",
      "new",
      "function",
      "do",
      "return",
      "void",
      "else",
      "break",
      "catch",
      "instanceof",
      "with",
      "throw",
      "case",
      "default",
      "try",
      "switch",
      "continue",
      "typeof",
      "delete",
      "let",
      "yield",
      "const",
      "class",
      // JS handles these with a special rule
      // "get",
      // "set",
      "debugger",
      "async",
      "await",
      "static",
      "import",
      "from",
      "export",
      "extends"
    ];
    const LITERALS = [
      "true",
      "false",
      "null",
      "undefined",
      "NaN",
      "Infinity"
    ];

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects
    const TYPES = [
      // Fundamental objects
      "Object",
      "Function",
      "Boolean",
      "Symbol",
      // numbers and dates
      "Math",
      "Date",
      "Number",
      "BigInt",
      // text
      "String",
      "RegExp",
      // Indexed collections
      "Array",
      "Float32Array",
      "Float64Array",
      "Int8Array",
      "Uint8Array",
      "Uint8ClampedArray",
      "Int16Array",
      "Int32Array",
      "Uint16Array",
      "Uint32Array",
      "BigInt64Array",
      "BigUint64Array",
      // Keyed collections
      "Set",
      "Map",
      "WeakSet",
      "WeakMap",
      // Structured data
      "ArrayBuffer",
      "SharedArrayBuffer",
      "Atomics",
      "DataView",
      "JSON",
      // Control abstraction objects
      "Promise",
      "Generator",
      "GeneratorFunction",
      "AsyncFunction",
      // Reflection
      "Reflect",
      "Proxy",
      // Internationalization
      "Intl",
      // WebAssembly
      "WebAssembly"
    ];

    const ERROR_TYPES = [
      "Error",
      "EvalError",
      "InternalError",
      "RangeError",
      "ReferenceError",
      "SyntaxError",
      "TypeError",
      "URIError"
    ];

    const BUILT_IN_GLOBALS = [
      "setInterval",
      "setTimeout",
      "clearInterval",
      "clearTimeout",

      "require",
      "exports",

      "eval",
      "isFinite",
      "isNaN",
      "parseFloat",
      "parseInt",
      "decodeURI",
      "decodeURIComponent",
      "encodeURI",
      "encodeURIComponent",
      "escape",
      "unescape"
    ];

    const BUILT_IN_VARIABLES = [
      "arguments",
      "this",
      "super",
      "console",
      "window",
      "document",
      "localStorage",
      "module",
      "global" // Node.js
    ];

    const BUILT_INS = [].concat(
      BUILT_IN_GLOBALS,
      TYPES,
      ERROR_TYPES
    );

    /*
    Language: JavaScript
    Description: JavaScript (JS) is a lightweight, interpreted, or just-in-time compiled programming language with first-class functions.
    Category: common, scripting, web
    Website: https://developer.mozilla.org/en-US/docs/Web/JavaScript
    */

    /** @type LanguageFn */
    function javascript$1(hljs) {
      const regex = hljs.regex;
      /**
       * Takes a string like "<Booger" and checks to see
       * if we can find a matching "</Booger" later in the
       * content.
       * @param {RegExpMatchArray} match
       * @param {{after:number}} param1
       */
      const hasClosingTag = (match, { after }) => {
        const tag = "</" + match[0].slice(1);
        const pos = match.input.indexOf(tag, after);
        return pos !== -1;
      };

      const IDENT_RE$1 = IDENT_RE;
      const FRAGMENT = {
        begin: '<>',
        end: '</>'
      };
      // to avoid some special cases inside isTrulyOpeningTag
      const XML_SELF_CLOSING = /<[A-Za-z0-9\\._:-]+\s*\/>/;
      const XML_TAG = {
        begin: /<[A-Za-z0-9\\._:-]+/,
        end: /\/[A-Za-z0-9\\._:-]+>|\/>/,
        /**
         * @param {RegExpMatchArray} match
         * @param {CallbackResponse} response
         */
        isTrulyOpeningTag: (match, response) => {
          const afterMatchIndex = match[0].length + match.index;
          const nextChar = match.input[afterMatchIndex];
          if (
            // HTML should not include another raw `<` inside a tag
            // nested type?
            // `<Array<Array<number>>`, etc.
            nextChar === "<" ||
            // the , gives away that this is not HTML
            // `<T, A extends keyof T, V>`
            nextChar === ",") {
            response.ignoreMatch();
            return;
          }

          // `<something>`
          // Quite possibly a tag, lets look for a matching closing tag...
          if (nextChar === ">") {
            // if we cannot find a matching closing tag, then we
            // will ignore it
            if (!hasClosingTag(match, { after: afterMatchIndex })) {
              response.ignoreMatch();
            }
          }

          // `<blah />` (self-closing)
          // handled by simpleSelfClosing rule

          // `<From extends string>`
          // technically this could be HTML, but it smells like a type
          let m;
          const afterMatch = match.input.substr(afterMatchIndex);
          // NOTE: This is ugh, but added specifically for https://github.com/highlightjs/highlight.js/issues/3276
          if ((m = afterMatch.match(/^\s+extends\s+/))) {
            if (m.index === 0) {
              response.ignoreMatch();
              // eslint-disable-next-line no-useless-return
              return;
            }
          }
        }
      };
      const KEYWORDS$1 = {
        $pattern: IDENT_RE,
        keyword: KEYWORDS,
        literal: LITERALS,
        built_in: BUILT_INS,
        "variable.language": BUILT_IN_VARIABLES
      };

      // https://tc39.es/ecma262/#sec-literals-numeric-literals
      const decimalDigits = '[0-9](_?[0-9])*';
      const frac = `\\.(${decimalDigits})`;
      // DecimalIntegerLiteral, including Annex B NonOctalDecimalIntegerLiteral
      // https://tc39.es/ecma262/#sec-additional-syntax-numeric-literals
      const decimalInteger = `0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*`;
      const NUMBER = {
        className: 'number',
        variants: [
          // DecimalLiteral
          { begin: `(\\b(${decimalInteger})((${frac})|\\.)?|(${frac}))` +
            `[eE][+-]?(${decimalDigits})\\b` },
          { begin: `\\b(${decimalInteger})\\b((${frac})\\b|\\.)?|(${frac})\\b` },

          // DecimalBigIntegerLiteral
          { begin: `\\b(0|[1-9](_?[0-9])*)n\\b` },

          // NonDecimalIntegerLiteral
          { begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b" },
          { begin: "\\b0[bB][0-1](_?[0-1])*n?\\b" },
          { begin: "\\b0[oO][0-7](_?[0-7])*n?\\b" },

          // LegacyOctalIntegerLiteral (does not include underscore separators)
          // https://tc39.es/ecma262/#sec-additional-syntax-numeric-literals
          { begin: "\\b0[0-7]+n?\\b" },
        ],
        relevance: 0
      };

      const SUBST = {
        className: 'subst',
        begin: '\\$\\{',
        end: '\\}',
        keywords: KEYWORDS$1,
        contains: [] // defined later
      };
      const HTML_TEMPLATE = {
        begin: 'html`',
        end: '',
        starts: {
          end: '`',
          returnEnd: false,
          contains: [
            hljs.BACKSLASH_ESCAPE,
            SUBST
          ],
          subLanguage: 'xml'
        }
      };
      const CSS_TEMPLATE = {
        begin: 'css`',
        end: '',
        starts: {
          end: '`',
          returnEnd: false,
          contains: [
            hljs.BACKSLASH_ESCAPE,
            SUBST
          ],
          subLanguage: 'css'
        }
      };
      const TEMPLATE_STRING = {
        className: 'string',
        begin: '`',
        end: '`',
        contains: [
          hljs.BACKSLASH_ESCAPE,
          SUBST
        ]
      };
      const JSDOC_COMMENT = hljs.COMMENT(
        /\/\*\*(?!\/)/,
        '\\*/',
        {
          relevance: 0,
          contains: [
            {
              begin: '(?=@[A-Za-z]+)',
              relevance: 0,
              contains: [
                {
                  className: 'doctag',
                  begin: '@[A-Za-z]+'
                },
                {
                  className: 'type',
                  begin: '\\{',
                  end: '\\}',
                  excludeEnd: true,
                  excludeBegin: true,
                  relevance: 0
                },
                {
                  className: 'variable',
                  begin: IDENT_RE$1 + '(?=\\s*(-)|$)',
                  endsParent: true,
                  relevance: 0
                },
                // eat spaces (not newlines) so we can find
                // types or variables
                {
                  begin: /(?=[^\n])\s/,
                  relevance: 0
                }
              ]
            }
          ]
        }
      );
      const COMMENT = {
        className: "comment",
        variants: [
          JSDOC_COMMENT,
          hljs.C_BLOCK_COMMENT_MODE,
          hljs.C_LINE_COMMENT_MODE
        ]
      };
      const SUBST_INTERNALS = [
        hljs.APOS_STRING_MODE,
        hljs.QUOTE_STRING_MODE,
        HTML_TEMPLATE,
        CSS_TEMPLATE,
        TEMPLATE_STRING,
        NUMBER,
        // This is intentional:
        // See https://github.com/highlightjs/highlight.js/issues/3288
        // hljs.REGEXP_MODE
      ];
      SUBST.contains = SUBST_INTERNALS
        .concat({
          // we need to pair up {} inside our subst to prevent
          // it from ending too early by matching another }
          begin: /\{/,
          end: /\}/,
          keywords: KEYWORDS$1,
          contains: [
            "self"
          ].concat(SUBST_INTERNALS)
        });
      const SUBST_AND_COMMENTS = [].concat(COMMENT, SUBST.contains);
      const PARAMS_CONTAINS = SUBST_AND_COMMENTS.concat([
        // eat recursive parens in sub expressions
        {
          begin: /\(/,
          end: /\)/,
          keywords: KEYWORDS$1,
          contains: ["self"].concat(SUBST_AND_COMMENTS)
        }
      ]);
      const PARAMS = {
        className: 'params',
        begin: /\(/,
        end: /\)/,
        excludeBegin: true,
        excludeEnd: true,
        keywords: KEYWORDS$1,
        contains: PARAMS_CONTAINS
      };

      // ES6 classes
      const CLASS_OR_EXTENDS = {
        variants: [
          // class Car extends vehicle
          {
            match: [
              /class/,
              /\s+/,
              IDENT_RE$1,
              /\s+/,
              /extends/,
              /\s+/,
              regex.concat(IDENT_RE$1, "(", regex.concat(/\./, IDENT_RE$1), ")*")
            ],
            scope: {
              1: "keyword",
              3: "title.class",
              5: "keyword",
              7: "title.class.inherited"
            }
          },
          // class Car
          {
            match: [
              /class/,
              /\s+/,
              IDENT_RE$1
            ],
            scope: {
              1: "keyword",
              3: "title.class"
            }
          },

        ]
      };

      const CLASS_REFERENCE = {
        relevance: 0,
        match:
        regex.either(
          // Hard coded exceptions
          /\bJSON/,
          // Float32Array
          /\b[A-Z][a-z]+([A-Z][a-z]+|\d)*/,
          // CSSFactory
          /\b[A-Z]{2,}([A-Z][a-z]+|\d)+/,
          // BLAH
          // this will be flagged as a UPPER_CASE_CONSTANT instead
        ),
        className: "title.class",
        keywords: {
          _: [
            // se we still get relevance credit for JS library classes
            ...TYPES,
            ...ERROR_TYPES
          ]
        }
      };

      const USE_STRICT = {
        label: "use_strict",
        className: 'meta',
        relevance: 10,
        begin: /^\s*['"]use (strict|asm)['"]/
      };

      const FUNCTION_DEFINITION = {
        variants: [
          {
            match: [
              /function/,
              /\s+/,
              IDENT_RE$1,
              /(?=\s*\()/
            ]
          },
          // anonymous function
          {
            match: [
              /function/,
              /\s*(?=\()/
            ]
          }
        ],
        className: {
          1: "keyword",
          3: "title.function"
        },
        label: "func.def",
        contains: [ PARAMS ],
        illegal: /%/
      };

      const UPPER_CASE_CONSTANT = {
        relevance: 0,
        match: /\b[A-Z][A-Z_0-9]+\b/,
        className: "variable.constant"
      };

      function noneOf(list) {
        return regex.concat("(?!", list.join("|"), ")");
      }

      const FUNCTION_CALL = {
        match: regex.concat(
          /\b/,
          noneOf([
            ...BUILT_IN_GLOBALS,
            "super"
          ]),
          IDENT_RE$1, regex.lookahead(/\(/)),
        className: "title.function",
        relevance: 0
      };

      const PROPERTY_ACCESS = {
        begin: regex.concat(/\./, regex.lookahead(
          regex.concat(IDENT_RE$1, /(?![0-9A-Za-z$_(])/)
        )),
        end: IDENT_RE$1,
        excludeBegin: true,
        keywords: "prototype",
        className: "property",
        relevance: 0
      };

      const GETTER_OR_SETTER = {
        match: [
          /get|set/,
          /\s+/,
          IDENT_RE$1,
          /(?=\()/
        ],
        className: {
          1: "keyword",
          3: "title.function"
        },
        contains: [
          { // eat to avoid empty params
            begin: /\(\)/
          },
          PARAMS
        ]
      };

      const FUNC_LEAD_IN_RE = '(\\(' +
        '[^()]*(\\(' +
        '[^()]*(\\(' +
        '[^()]*' +
        '\\)[^()]*)*' +
        '\\)[^()]*)*' +
        '\\)|' + hljs.UNDERSCORE_IDENT_RE + ')\\s*=>';

      const FUNCTION_VARIABLE = {
        match: [
          /const|var|let/, /\s+/,
          IDENT_RE$1, /\s*/,
          /=\s*/,
          regex.lookahead(FUNC_LEAD_IN_RE)
        ],
        className: {
          1: "keyword",
          3: "title.function"
        },
        contains: [
          PARAMS
        ]
      };

      return {
        name: 'Javascript',
        aliases: ['js', 'jsx', 'mjs', 'cjs'],
        keywords: KEYWORDS$1,
        // this will be extended by TypeScript
        exports: { PARAMS_CONTAINS, CLASS_REFERENCE },
        illegal: /#(?![$_A-z])/,
        contains: [
          hljs.SHEBANG({
            label: "shebang",
            binary: "node",
            relevance: 5
          }),
          USE_STRICT,
          hljs.APOS_STRING_MODE,
          hljs.QUOTE_STRING_MODE,
          HTML_TEMPLATE,
          CSS_TEMPLATE,
          TEMPLATE_STRING,
          COMMENT,
          NUMBER,
          CLASS_REFERENCE,
          {
            className: 'attr',
            begin: IDENT_RE$1 + regex.lookahead(':'),
            relevance: 0
          },
          FUNCTION_VARIABLE,
          { // "value" container
            begin: '(' + hljs.RE_STARTERS_RE + '|\\b(case|return|throw)\\b)\\s*',
            keywords: 'return throw case',
            relevance: 0,
            contains: [
              COMMENT,
              hljs.REGEXP_MODE,
              {
                className: 'function',
                // we have to count the parens to make sure we actually have the
                // correct bounding ( ) before the =>.  There could be any number of
                // sub-expressions inside also surrounded by parens.
                begin: FUNC_LEAD_IN_RE,
                returnBegin: true,
                end: '\\s*=>',
                contains: [
                  {
                    className: 'params',
                    variants: [
                      {
                        begin: hljs.UNDERSCORE_IDENT_RE,
                        relevance: 0
                      },
                      {
                        className: null,
                        begin: /\(\s*\)/,
                        skip: true
                      },
                      {
                        begin: /\(/,
                        end: /\)/,
                        excludeBegin: true,
                        excludeEnd: true,
                        keywords: KEYWORDS$1,
                        contains: PARAMS_CONTAINS
                      }
                    ]
                  }
                ]
              },
              { // could be a comma delimited list of params to a function call
                begin: /,/,
                relevance: 0
              },
              {
                match: /\s+/,
                relevance: 0
              },
              { // JSX
                variants: [
                  { begin: FRAGMENT.begin, end: FRAGMENT.end },
                  { match: XML_SELF_CLOSING },
                  {
                    begin: XML_TAG.begin,
                    // we carefully check the opening tag to see if it truly
                    // is a tag and not a false positive
                    'on:begin': XML_TAG.isTrulyOpeningTag,
                    end: XML_TAG.end
                  }
                ],
                subLanguage: 'xml',
                contains: [
                  {
                    begin: XML_TAG.begin,
                    end: XML_TAG.end,
                    skip: true,
                    contains: ['self']
                  }
                ]
              }
            ],
          },
          FUNCTION_DEFINITION,
          {
            // prevent this from getting swallowed up by function
            // since they appear "function like"
            beginKeywords: "while if switch catch for"
          },
          {
            // we have to count the parens to make sure we actually have the correct
            // bounding ( ).  There could be any number of sub-expressions inside
            // also surrounded by parens.
            begin: '\\b(?!function)' + hljs.UNDERSCORE_IDENT_RE +
              '\\(' + // first parens
              '[^()]*(\\(' +
                '[^()]*(\\(' +
                  '[^()]*' +
                '\\)[^()]*)*' +
              '\\)[^()]*)*' +
              '\\)\\s*\\{', // end parens
            returnBegin:true,
            label: "func.def",
            contains: [
              PARAMS,
              hljs.inherit(hljs.TITLE_MODE, { begin: IDENT_RE$1, className: "title.function" })
            ]
          },
          // catch ... so it won't trigger the property rule below
          {
            match: /\.\.\./,
            relevance: 0
          },
          PROPERTY_ACCESS,
          // hack: prevents detection of keywords in some circumstances
          // .keyword()
          // $keyword = x
          {
            match: '\\$' + IDENT_RE$1,
            relevance: 0
          },
          {
            match: [ /\bconstructor(?=\s*\()/ ],
            className: { 1: "title.function" },
            contains: [ PARAMS ]
          },
          FUNCTION_CALL,
          UPPER_CASE_CONSTANT,
          CLASS_OR_EXTENDS,
          GETTER_OR_SETTER,
          {
            match: /\$[(.]/ // relevance booster for a pattern common to JS libs: `$(something)` and `$.something`
          }
        ]
      };
    }

    /*
    Language: Plain text
    Author: Egor Rogov (e.rogov@postgrespro.ru)
    Description: Plain text without any highlighting.
    Category: common
    */

    function plaintext(hljs) {
      return {
        name: 'Plain text',
        aliases: [
          'text',
          'txt'
        ],
        disableAutodetect: true
      };
    }

    function dispatch(node, type, detail) {
      detail = detail || {};
      var document = node.ownerDocument, event = document.defaultView.CustomEvent;
      if (typeof event === "function") {
        event = new event(type, {detail: detail});
      } else {
        event = document.createEvent("Event");
        event.initEvent(type, false, false);
        event.detail = detail;
      }
      node.dispatchEvent(event);
    }

    // TODO https://twitter.com/mbostock/status/702737065121742848
    function isarray(value) {
      return Array.isArray(value)
          || value instanceof Int8Array
          || value instanceof Int16Array
          || value instanceof Int32Array
          || value instanceof Uint8Array
          || value instanceof Uint8ClampedArray
          || value instanceof Uint16Array
          || value instanceof Uint32Array
          || value instanceof Float32Array
          || value instanceof Float64Array;
    }

    // Non-integer keys in arrays, e.g. [1, 2, 0.5: "value"].
    function isindex(key) {
      return key === (key | 0) + "";
    }

    function inspectName(name) {
      const n = document.createElement("span");
      n.className = "observablehq--cellname";
      n.textContent = `${name} = `;
      return n;
    }

    const symbolToString = Symbol.prototype.toString;

    // Symbols do not coerce to strings; they must be explicitly converted.
    function formatSymbol(symbol) {
      return symbolToString.call(symbol);
    }

    const {getOwnPropertySymbols, prototype: {hasOwnProperty: hasOwnProperty$2}} = Object;
    const {toStringTag} = Symbol;

    const FORBIDDEN = {};

    const symbolsof = getOwnPropertySymbols;

    function isown(object, key) {
      return hasOwnProperty$2.call(object, key);
    }

    function tagof(object) {
      return object[toStringTag]
          || (object.constructor && object.constructor.name)
          || "Object";
    }

    function valueof$1(object, key) {
      try {
        const value = object[key];
        if (value) value.constructor; // Test for SecurityError.
        return value;
      } catch (ignore) {
        return FORBIDDEN;
      }
    }

    const SYMBOLS = [
      { symbol: "@@__IMMUTABLE_INDEXED__@@", name: "Indexed", modifier: true },
      { symbol: "@@__IMMUTABLE_KEYED__@@", name: "Keyed", modifier: true },
      { symbol: "@@__IMMUTABLE_LIST__@@", name: "List", arrayish: true },
      { symbol: "@@__IMMUTABLE_MAP__@@", name: "Map" },
      {
        symbol: "@@__IMMUTABLE_ORDERED__@@",
        name: "Ordered",
        modifier: true,
        prefix: true
      },
      { symbol: "@@__IMMUTABLE_RECORD__@@", name: "Record" },
      {
        symbol: "@@__IMMUTABLE_SET__@@",
        name: "Set",
        arrayish: true,
        setish: true
      },
      { symbol: "@@__IMMUTABLE_STACK__@@", name: "Stack", arrayish: true }
    ];

    function immutableName(obj) {
      try {
        let symbols = SYMBOLS.filter(({ symbol }) => obj[symbol] === true);
        if (!symbols.length) return;

        const name = symbols.find(s => !s.modifier);
        const prefix =
          name.name === "Map" && symbols.find(s => s.modifier && s.prefix);

        const arrayish = symbols.some(s => s.arrayish);
        const setish = symbols.some(s => s.setish);

        return {
          name: `${prefix ? prefix.name : ""}${name.name}`,
          symbols,
          arrayish: arrayish && !setish,
          setish
        };
      } catch (e) {
        return null;
      }
    }

    const {getPrototypeOf, getOwnPropertyDescriptors} = Object;
    const objectPrototype = getPrototypeOf({});

    function inspectExpanded(object, _, name, proto) {
      let arrayish = isarray(object);
      let tag, fields, next, n;

      if (object instanceof Map) {
        if (object instanceof object.constructor) {
          tag = `Map(${object.size})`;
          fields = iterateMap$1;
        } else { // avoid incompatible receiver error for prototype
          tag = "Map()";
          fields = iterateObject$1;
        }
      } else if (object instanceof Set) {
        if (object instanceof object.constructor) {
          tag = `Set(${object.size})`;
          fields = iterateSet$1;
        } else { // avoid incompatible receiver error for prototype
          tag = "Set()";
          fields = iterateObject$1;
        }
      } else if (arrayish) {
        tag = `${object.constructor.name}(${object.length})`;
        fields = iterateArray$1;
      } else if ((n = immutableName(object))) {
        tag = `Immutable.${n.name}${n.name === "Record" ? "" : `(${object.size})`}`;
        arrayish = n.arrayish;
        fields = n.arrayish
          ? iterateImArray$1
          : n.setish
          ? iterateImSet$1
          : iterateImObject$1;
      } else if (proto) {
        tag = tagof(object);
        fields = iterateProto;
      } else {
        tag = tagof(object);
        fields = iterateObject$1;
      }

      const span = document.createElement("span");
      span.className = "observablehq--expanded";
      if (name) {
        span.appendChild(inspectName(name));
      }
      const a = span.appendChild(document.createElement("a"));
      a.innerHTML = `<svg width=8 height=8 class='observablehq--caret'>
    <path d='M4 7L0 1h8z' fill='currentColor' />
  </svg>`;
      a.appendChild(document.createTextNode(`${tag}${arrayish ? " [" : " {"}`));
      a.addEventListener("mouseup", function(event) {
        event.stopPropagation();
        replace(span, inspectCollapsed(object, null, name, proto));
      });

      fields = fields(object);
      for (let i = 0; !(next = fields.next()).done && i < 20; ++i) {
        span.appendChild(next.value);
      }

      if (!next.done) {
        const a = span.appendChild(document.createElement("a"));
        a.className = "observablehq--field";
        a.style.display = "block";
        a.appendChild(document.createTextNode(`  … more`));
        a.addEventListener("mouseup", function(event) {
          event.stopPropagation();
          span.insertBefore(next.value, span.lastChild.previousSibling);
          for (let i = 0; !(next = fields.next()).done && i < 19; ++i) {
            span.insertBefore(next.value, span.lastChild.previousSibling);
          }
          if (next.done) span.removeChild(span.lastChild.previousSibling);
          dispatch(span, "load");
        });
      }

      span.appendChild(document.createTextNode(arrayish ? "]" : "}"));

      return span;
    }

    function* iterateMap$1(map) {
      for (const [key, value] of map) {
        yield formatMapField$1(key, value);
      }
      yield* iterateObject$1(map);
    }

    function* iterateSet$1(set) {
      for (const value of set) {
        yield formatSetField(value);
      }
      yield* iterateObject$1(set);
    }

    function* iterateImSet$1(set) {
      for (const value of set) {
        yield formatSetField(value);
      }
    }

    function* iterateArray$1(array) {
      for (let i = 0, n = array.length; i < n; ++i) {
        if (i in array) {
          yield formatField$1(i, valueof$1(array, i), "observablehq--index");
        }
      }
      for (const key in array) {
        if (!isindex(key) && isown(array, key)) {
          yield formatField$1(key, valueof$1(array, key), "observablehq--key");
        }
      }
      for (const symbol of symbolsof(array)) {
        yield formatField$1(
          formatSymbol(symbol),
          valueof$1(array, symbol),
          "observablehq--symbol"
        );
      }
    }

    function* iterateImArray$1(array) {
      let i1 = 0;
      for (const n = array.size; i1 < n; ++i1) {
        yield formatField$1(i1, array.get(i1), true);
      }
    }

    function* iterateProto(object) {
      for (const key in getOwnPropertyDescriptors(object)) {
        yield formatField$1(key, valueof$1(object, key), "observablehq--key");
      }
      for (const symbol of symbolsof(object)) {
        yield formatField$1(
          formatSymbol(symbol),
          valueof$1(object, symbol),
          "observablehq--symbol"
        );
      }

      const proto = getPrototypeOf(object);
      if (proto && proto !== objectPrototype) {
        yield formatPrototype(proto);
      }
    }

    function* iterateObject$1(object) {
      for (const key in object) {
        if (isown(object, key)) {
          yield formatField$1(key, valueof$1(object, key), "observablehq--key");
        }
      }
      for (const symbol of symbolsof(object)) {
        yield formatField$1(
          formatSymbol(symbol),
          valueof$1(object, symbol),
          "observablehq--symbol"
        );
      }

      const proto = getPrototypeOf(object);
      if (proto && proto !== objectPrototype) {
        yield formatPrototype(proto);
      }
    }

    function* iterateImObject$1(object) {
      for (const [key, value] of object) {
        yield formatField$1(key, value, "observablehq--key");
      }
    }

    function formatPrototype(value) {
      const item = document.createElement("div");
      const span = item.appendChild(document.createElement("span"));
      item.className = "observablehq--field";
      span.className = "observablehq--prototype-key";
      span.textContent = `  <prototype>`;
      item.appendChild(document.createTextNode(": "));
      item.appendChild(inspect(value, undefined, undefined, undefined, true));
      return item;
    }

    function formatField$1(key, value, className) {
      const item = document.createElement("div");
      const span = item.appendChild(document.createElement("span"));
      item.className = "observablehq--field";
      span.className = className;
      span.textContent = `  ${key}`;
      item.appendChild(document.createTextNode(": "));
      item.appendChild(inspect(value));
      return item;
    }

    function formatMapField$1(key, value) {
      const item = document.createElement("div");
      item.className = "observablehq--field";
      item.appendChild(document.createTextNode("  "));
      item.appendChild(inspect(key));
      item.appendChild(document.createTextNode(" => "));
      item.appendChild(inspect(value));
      return item;
    }

    function formatSetField(value) {
      const item = document.createElement("div");
      item.className = "observablehq--field";
      item.appendChild(document.createTextNode("  "));
      item.appendChild(inspect(value));
      return item;
    }

    function hasSelection(elem) {
      const sel = window.getSelection();
      return (
        sel.type === "Range" &&
        (sel.containsNode(elem, true) ||
          sel.anchorNode.isSelfOrDescendant(elem) ||
          sel.focusNode.isSelfOrDescendant(elem))
      );
    }

    function inspectCollapsed(object, shallow, name, proto) {
      let arrayish = isarray(object);
      let tag, fields, next, n;

      if (object instanceof Map) {
        if (object instanceof object.constructor) {
          tag = `Map(${object.size})`;
          fields = iterateMap;
        } else { // avoid incompatible receiver error for prototype
          tag = "Map()";
          fields = iterateObject;
        }
      } else if (object instanceof Set) {
        if (object instanceof object.constructor) {
          tag = `Set(${object.size})`;
          fields = iterateSet;
        } else { // avoid incompatible receiver error for prototype
          tag = "Set()";
          fields = iterateObject;
        }
      } else if (arrayish) {
        tag = `${object.constructor.name}(${object.length})`;
        fields = iterateArray;
      } else if ((n = immutableName(object))) {
        tag = `Immutable.${n.name}${n.name === 'Record' ? '' : `(${object.size})`}`;
        arrayish = n.arrayish;
        fields = n.arrayish ? iterateImArray : n.setish ? iterateImSet : iterateImObject;
      } else {
        tag = tagof(object);
        fields = iterateObject;
      }

      if (shallow) {
        const span = document.createElement("span");
        span.className = "observablehq--shallow";
        if (name) {
          span.appendChild(inspectName(name));
        }
        span.appendChild(document.createTextNode(tag));
        span.addEventListener("mouseup", function(event) {
          if (hasSelection(span)) return;
          event.stopPropagation();
          replace(span, inspectCollapsed(object));
        });
        return span;
      }

      const span = document.createElement("span");
      span.className = "observablehq--collapsed";
      if (name) {
        span.appendChild(inspectName(name));
      }
      const a = span.appendChild(document.createElement("a"));
      a.innerHTML = `<svg width=8 height=8 class='observablehq--caret'>
    <path d='M7 4L1 8V0z' fill='currentColor' />
  </svg>`;
      a.appendChild(document.createTextNode(`${tag}${arrayish ? " [" : " {"}`));
      span.addEventListener("mouseup", function(event) {
        if (hasSelection(span)) return;
        event.stopPropagation();
        replace(span, inspectExpanded(object, null, name, proto));
      }, true);

      fields = fields(object);
      for (let i = 0; !(next = fields.next()).done && i < 20; ++i) {
        if (i > 0) span.appendChild(document.createTextNode(", "));
        span.appendChild(next.value);
      }

      if (!next.done) span.appendChild(document.createTextNode(", …"));
      span.appendChild(document.createTextNode(arrayish ? "]" : "}"));

      return span;
    }

    function* iterateMap(map) {
      for (const [key, value] of map) {
        yield formatMapField(key, value);
      }
      yield* iterateObject(map);
    }

    function* iterateSet(set) {
      for (const value of set) {
        yield inspect(value, true);
      }
      yield* iterateObject(set);
    }

    function* iterateImSet(set) {
      for (const value of set) {
        yield inspect(value, true);
      }
    }

    function* iterateImArray(array) {
      let i0 = -1, i1 = 0;
      for (const n = array.size; i1 < n; ++i1) {
        if (i1 > i0 + 1) yield formatEmpty(i1 - i0 - 1);
        yield inspect(array.get(i1), true);
        i0 = i1;
      }
      if (i1 > i0 + 1) yield formatEmpty(i1 - i0 - 1);
    }

    function* iterateArray(array) {
      let i0 = -1, i1 = 0;
      for (const n = array.length; i1 < n; ++i1) {
        if (i1 in array) {
          if (i1 > i0 + 1) yield formatEmpty(i1 - i0 - 1);
          yield inspect(valueof$1(array, i1), true);
          i0 = i1;
        }
      }
      if (i1 > i0 + 1) yield formatEmpty(i1 - i0 - 1);
      for (const key in array) {
        if (!isindex(key) && isown(array, key)) {
          yield formatField(key, valueof$1(array, key), "observablehq--key");
        }
      }
      for (const symbol of symbolsof(array)) {
        yield formatField(formatSymbol(symbol), valueof$1(array, symbol), "observablehq--symbol");
      }
    }

    function* iterateObject(object) {
      for (const key in object) {
        if (isown(object, key)) {
          yield formatField(key, valueof$1(object, key), "observablehq--key");
        }
      }
      for (const symbol of symbolsof(object)) {
        yield formatField(formatSymbol(symbol), valueof$1(object, symbol), "observablehq--symbol");
      }
    }

    function* iterateImObject(object) {
      for (const [key, value] of object) {
        yield formatField(key, value, "observablehq--key");
      }
    }

    function formatEmpty(e) {
      const span = document.createElement("span");
      span.className = "observablehq--empty";
      span.textContent = e === 1 ? "empty" : `empty × ${e}`;
      return span;
    }

    function formatField(key, value, className) {
      const fragment = document.createDocumentFragment();
      const span = fragment.appendChild(document.createElement("span"));
      span.className = className;
      span.textContent = key;
      fragment.appendChild(document.createTextNode(": "));
      fragment.appendChild(inspect(value, true));
      return fragment;
    }

    function formatMapField(key, value) {
      const fragment = document.createDocumentFragment();
      fragment.appendChild(inspect(key, true));
      fragment.appendChild(document.createTextNode(" => "));
      fragment.appendChild(inspect(value, true));
      return fragment;
    }

    function format(date, fallback) {
      if (!(date instanceof Date)) date = new Date(+date);
      if (isNaN(date)) return typeof fallback === "function" ? fallback(date) : fallback;
      const hours = date.getUTCHours();
      const minutes = date.getUTCMinutes();
      const seconds = date.getUTCSeconds();
      const milliseconds = date.getUTCMilliseconds();
      return `${formatYear$1(date.getUTCFullYear())}-${pad$1(date.getUTCMonth() + 1, 2)}-${pad$1(date.getUTCDate(), 2)}${
    hours || minutes || seconds || milliseconds ? `T${pad$1(hours, 2)}:${pad$1(minutes, 2)}${
      seconds || milliseconds ? `:${pad$1(seconds, 2)}${
        milliseconds ? `.${pad$1(milliseconds, 3)}` : ``
      }` : ``
    }Z` : ``
  }`;
    }

    function formatYear$1(year) {
      return year < 0 ? `-${pad$1(-year, 6)}`
        : year > 9999 ? `+${pad$1(year, 6)}`
        : pad$1(year, 4);
    }

    function pad$1(value, width) {
      return `${value}`.padStart(width, "0");
    }

    function formatDate$1(date) {
      return format(date, "Invalid Date");
    }

    var errorToString = Error.prototype.toString;

    function formatError(value) {
      return value.stack || errorToString.call(value);
    }

    var regExpToString = RegExp.prototype.toString;

    function formatRegExp(value) {
      return regExpToString.call(value);
    }

    /* eslint-disable no-control-regex */
    const NEWLINE_LIMIT = 20;

    function formatString(string, shallow, expanded, name) {
      if (shallow === false) {
        // String has fewer escapes displayed with double quotes
        if (count$1(string, /["\n]/g) <= count$1(string, /`|\${/g)) {
          const span = document.createElement("span");
          if (name) span.appendChild(inspectName(name));
          const textValue = span.appendChild(document.createElement("span"));
          textValue.className = "observablehq--string";
          textValue.textContent = JSON.stringify(string);
          return span;
        }
        const lines = string.split("\n");
        if (lines.length > NEWLINE_LIMIT && !expanded) {
          const div = document.createElement("div");
          if (name) div.appendChild(inspectName(name));
          const textValue = div.appendChild(document.createElement("span"));
          textValue.className = "observablehq--string";
          textValue.textContent = "`" + templatify(lines.slice(0, NEWLINE_LIMIT).join("\n"));
          const splitter = div.appendChild(document.createElement("span"));
          const truncatedCount = lines.length - NEWLINE_LIMIT;
          splitter.textContent = `Show ${truncatedCount} truncated line${truncatedCount > 1 ? "s": ""}`; splitter.className = "observablehq--string-expand";
          splitter.addEventListener("mouseup", function (event) {
            event.stopPropagation();
            replace(div, inspect(string, shallow, true, name));
          });
          return div;
        }
        const span = document.createElement("span");
        if (name) span.appendChild(inspectName(name));
        const textValue = span.appendChild(document.createElement("span"));
        textValue.className = `observablehq--string${expanded ? " observablehq--expanded" : ""}`;
        textValue.textContent = "`" + templatify(string) + "`";
        return span;
      }

      const span = document.createElement("span");
      if (name) span.appendChild(inspectName(name));
      const textValue = span.appendChild(document.createElement("span"));
      textValue.className = "observablehq--string";
      textValue.textContent = JSON.stringify(string.length > 100 ?
        `${string.slice(0, 50)}…${string.slice(-49)}` : string);
      return span;
    }

    function templatify(string) {
      return string.replace(/[\\`\x00-\x09\x0b-\x19]|\${/g, templatifyChar);
    }

    function templatifyChar(char) {
      var code = char.charCodeAt(0);
      switch (code) {
        case 0x8: return "\\b";
        case 0x9: return "\\t";
        case 0xb: return "\\v";
        case 0xc: return "\\f";
        case 0xd: return "\\r";
      }
      return code < 0x10 ? "\\x0" + code.toString(16)
          : code < 0x20 ? "\\x" + code.toString(16)
          : "\\" + char;
    }

    function count$1(string, re) {
      var n = 0;
      while (re.exec(string)) ++n;
      return n;
    }

    var toString$2 = Function.prototype.toString,
        TYPE_ASYNC = {prefix: "async ƒ"},
        TYPE_ASYNC_GENERATOR = {prefix: "async ƒ*"},
        TYPE_CLASS = {prefix: "class"},
        TYPE_FUNCTION = {prefix: "ƒ"},
        TYPE_GENERATOR = {prefix: "ƒ*"};

    function inspectFunction(f, name) {
      var type, m, t = toString$2.call(f);

      switch (f.constructor && f.constructor.name) {
        case "AsyncFunction": type = TYPE_ASYNC; break;
        case "AsyncGeneratorFunction": type = TYPE_ASYNC_GENERATOR; break;
        case "GeneratorFunction": type = TYPE_GENERATOR; break;
        default: type = /^class\b/.test(t) ? TYPE_CLASS : TYPE_FUNCTION; break;
      }

      // A class, possibly named.
      // class Name
      if (type === TYPE_CLASS) {
        return formatFunction(type, "", name);
      }

      // An arrow function with a single argument.
      // foo =>
      // async foo =>
      if ((m = /^(?:async\s*)?(\w+)\s*=>/.exec(t))) {
        return formatFunction(type, "(" + m[1] + ")", name);
      }

      // An arrow function with parenthesized arguments.
      // (…)
      // async (…)
      if ((m = /^(?:async\s*)?\(\s*(\w+(?:\s*,\s*\w+)*)?\s*\)/.exec(t))) {
        return formatFunction(type, m[1] ? "(" + m[1].replace(/\s*,\s*/g, ", ") + ")" : "()", name);
      }

      // A function, possibly: async, generator, anonymous, simply arguments.
      // function name(…)
      // function* name(…)
      // async function name(…)
      // async function* name(…)
      if ((m = /^(?:async\s*)?function(?:\s*\*)?(?:\s*\w+)?\s*\(\s*(\w+(?:\s*,\s*\w+)*)?\s*\)/.exec(t))) {
        return formatFunction(type, m[1] ? "(" + m[1].replace(/\s*,\s*/g, ", ") + ")" : "()", name);
      }

      // Something else, like destructuring, comments or default values.
      return formatFunction(type, "(…)", name);
    }

    function formatFunction(type, args, cellname) {
      var span = document.createElement("span");
      span.className = "observablehq--function";
      if (cellname) {
        span.appendChild(inspectName(cellname));
      }
      var spanType = span.appendChild(document.createElement("span"));
      spanType.className = "observablehq--keyword";
      spanType.textContent = type.prefix;
      span.appendChild(document.createTextNode(args));
      return span;
    }

    const {prototype: {toString: toString$1}} = Object;

    function inspect(value, shallow, expand, name, proto) {
      let type = typeof value;
      switch (type) {
        case "boolean":
        case "undefined": { value += ""; break; }
        case "number": { value = value === 0 && 1 / value < 0 ? "-0" : value + ""; break; }
        case "bigint": { value = value + "n"; break; }
        case "symbol": { value = formatSymbol(value); break; }
        case "function": { return inspectFunction(value, name); }
        case "string": { return formatString(value, shallow, expand, name); }
        default: {
          if (value === null) { type = null, value = "null"; break; }
          if (value instanceof Date) { type = "date", value = formatDate$1(value); break; }
          if (value === FORBIDDEN) { type = "forbidden", value = "[forbidden]"; break; }
          switch (toString$1.call(value)) {
            case "[object RegExp]": { type = "regexp", value = formatRegExp(value); break; }
            case "[object Error]": // https://github.com/lodash/lodash/blob/master/isError.js#L26
            case "[object DOMException]": { type = "error", value = formatError(value); break; }
            default: return (expand ? inspectExpanded : inspectCollapsed)(value, shallow, name, proto);
          }
          break;
        }
      }
      const span = document.createElement("span");
      if (name) span.appendChild(inspectName(name));
      const n = span.appendChild(document.createElement("span"));
      n.className = `observablehq--${type}`;
      n.textContent = value;
      return span;
    }

    function replace(spanOld, spanNew) {
      if (spanOld.classList.contains("observablehq--inspect")) spanNew.classList.add("observablehq--inspect");
      spanOld.parentNode.replaceChild(spanNew, spanOld);
      dispatch(spanNew, "load");
    }

    const LOCATION_MATCH = /\s+\(\d+:\d+\)$/m;

    class Inspector {
      constructor(node) {
        if (!node) throw new Error("invalid node");
        this._node = node;
        node.classList.add("observablehq");
      }
      pending() {
        const {_node} = this;
        _node.classList.remove("observablehq--error");
        _node.classList.add("observablehq--running");
      }
      fulfilled(value, name) {
        const {_node} = this;
        if (!isnode(value) || (value.parentNode && value.parentNode !== _node)) {
          value = inspect(value, false, _node.firstChild // TODO Do this better.
              && _node.firstChild.classList
              && _node.firstChild.classList.contains("observablehq--expanded"), name);
          value.classList.add("observablehq--inspect");
        }
        _node.classList.remove("observablehq--running", "observablehq--error");
        if (_node.firstChild !== value) {
          if (_node.firstChild) {
            while (_node.lastChild !== _node.firstChild) _node.removeChild(_node.lastChild);
            _node.replaceChild(value, _node.firstChild);
          } else {
            _node.appendChild(value);
          }
        }
        dispatch(_node, "update");
      }
      rejected(error, name) {
        const {_node} = this;
        _node.classList.remove("observablehq--running");
        _node.classList.add("observablehq--error");
        while (_node.lastChild) _node.removeChild(_node.lastChild);
        var div = document.createElement("div");
        div.className = "observablehq--inspect";
        if (name) div.appendChild(inspectName(name));
        div.appendChild(document.createTextNode((error + "").replace(LOCATION_MATCH, "")));
        _node.appendChild(div);
        dispatch(_node, "error", {error: error});
      }
    }

    Inspector.into = function(container) {
      if (typeof container === "string") {
        container = document.querySelector(container);
        if (container == null) throw new Error("container not found");
      }
      return function() {
        return new Inspector(container.appendChild(document.createElement("div")));
      };
    };

    // Returns true if the given value is something that should be added to the DOM
    // by the inspector, rather than being inspected. This deliberately excludes
    // DocumentFragment since appending a fragment “dissolves” (mutates) the
    // fragment, and we wish for the inspector to not have side-effects. Also,
    // HTMLElement.prototype is an instanceof Element, but not an element!
    function isnode(value) {
      return (value instanceof Element || value instanceof Text)
          && (value instanceof value.constructor);
    }

    var EOL = {},
        EOF = {},
        QUOTE = 34,
        NEWLINE = 10,
        RETURN = 13;

    function objectConverter(columns) {
      return new Function("d", "return {" + columns.map(function(name, i) {
        return JSON.stringify(name) + ": d[" + i + "] || \"\"";
      }).join(",") + "}");
    }

    function customConverter(columns, f) {
      var object = objectConverter(columns);
      return function(row, i) {
        return f(object(row), i, columns);
      };
    }

    // Compute unique columns in order of discovery.
    function inferColumns(rows) {
      var columnSet = Object.create(null),
          columns = [];

      rows.forEach(function(row) {
        for (var column in row) {
          if (!(column in columnSet)) {
            columns.push(columnSet[column] = column);
          }
        }
      });

      return columns;
    }

    function pad(value, width) {
      var s = value + "", length = s.length;
      return length < width ? new Array(width - length + 1).join(0) + s : s;
    }

    function formatYear(year) {
      return year < 0 ? "-" + pad(-year, 6)
        : year > 9999 ? "+" + pad(year, 6)
        : pad(year, 4);
    }

    function formatDate(date) {
      var hours = date.getUTCHours(),
          minutes = date.getUTCMinutes(),
          seconds = date.getUTCSeconds(),
          milliseconds = date.getUTCMilliseconds();
      return isNaN(date) ? "Invalid Date"
          : formatYear(date.getUTCFullYear()) + "-" + pad(date.getUTCMonth() + 1, 2) + "-" + pad(date.getUTCDate(), 2)
          + (milliseconds ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2) + "." + pad(milliseconds, 3) + "Z"
          : seconds ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2) + "Z"
          : minutes || hours ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + "Z"
          : "");
    }

    function dsv$1(delimiter) {
      var reFormat = new RegExp("[\"" + delimiter + "\n\r]"),
          DELIMITER = delimiter.charCodeAt(0);

      function parse(text, f) {
        var convert, columns, rows = parseRows(text, function(row, i) {
          if (convert) return convert(row, i - 1);
          columns = row, convert = f ? customConverter(row, f) : objectConverter(row);
        });
        rows.columns = columns || [];
        return rows;
      }

      function parseRows(text, f) {
        var rows = [], // output rows
            N = text.length,
            I = 0, // current character index
            n = 0, // current line number
            t, // current token
            eof = N <= 0, // current token followed by EOF?
            eol = false; // current token followed by EOL?

        // Strip the trailing newline.
        if (text.charCodeAt(N - 1) === NEWLINE) --N;
        if (text.charCodeAt(N - 1) === RETURN) --N;

        function token() {
          if (eof) return EOF;
          if (eol) return eol = false, EOL;

          // Unescape quotes.
          var i, j = I, c;
          if (text.charCodeAt(j) === QUOTE) {
            while (I++ < N && text.charCodeAt(I) !== QUOTE || text.charCodeAt(++I) === QUOTE);
            if ((i = I) >= N) eof = true;
            else if ((c = text.charCodeAt(I++)) === NEWLINE) eol = true;
            else if (c === RETURN) { eol = true; if (text.charCodeAt(I) === NEWLINE) ++I; }
            return text.slice(j + 1, i - 1).replace(/""/g, "\"");
          }

          // Find next delimiter or newline.
          while (I < N) {
            if ((c = text.charCodeAt(i = I++)) === NEWLINE) eol = true;
            else if (c === RETURN) { eol = true; if (text.charCodeAt(I) === NEWLINE) ++I; }
            else if (c !== DELIMITER) continue;
            return text.slice(j, i);
          }

          // Return last token before EOF.
          return eof = true, text.slice(j, N);
        }

        while ((t = token()) !== EOF) {
          var row = [];
          while (t !== EOL && t !== EOF) row.push(t), t = token();
          if (f && (row = f(row, n++)) == null) continue;
          rows.push(row);
        }

        return rows;
      }

      function preformatBody(rows, columns) {
        return rows.map(function(row) {
          return columns.map(function(column) {
            return formatValue(row[column]);
          }).join(delimiter);
        });
      }

      function format(rows, columns) {
        if (columns == null) columns = inferColumns(rows);
        return [columns.map(formatValue).join(delimiter)].concat(preformatBody(rows, columns)).join("\n");
      }

      function formatBody(rows, columns) {
        if (columns == null) columns = inferColumns(rows);
        return preformatBody(rows, columns).join("\n");
      }

      function formatRows(rows) {
        return rows.map(formatRow).join("\n");
      }

      function formatRow(row) {
        return row.map(formatValue).join(delimiter);
      }

      function formatValue(value) {
        return value == null ? ""
            : value instanceof Date ? formatDate(value)
            : reFormat.test(value += "") ? "\"" + value.replace(/"/g, "\"\"") + "\""
            : value;
      }

      return {
        parse: parse,
        parseRows: parseRows,
        format: format,
        formatBody: formatBody,
        formatRows: formatRows,
        formatRow: formatRow,
        formatValue: formatValue
      };
    }

    var csv = dsv$1(",");

    var csvParse = csv.parse;
    var csvParseRows = csv.parseRows;

    var tsv = dsv$1("\t");

    var tsvParse = tsv.parse;
    var tsvParseRows = tsv.parseRows;

    function autoType(object) {
      for (var key in object) {
        var value = object[key].trim(), number, m;
        if (!value) value = null;
        else if (value === "true") value = true;
        else if (value === "false") value = false;
        else if (value === "NaN") value = NaN;
        else if (!isNaN(number = +value)) value = number;
        else if (m = value.match(/^([-+]\d{2})?\d{4}(-\d{2}(-\d{2})?)?(T\d{2}:\d{2}(:\d{2}(\.\d{3})?)?(Z|[-+]\d{2}:\d{2})?)?$/)) {
          if (fixtz && !!m[4] && !m[7]) value = value.replace(/-/g, "/").replace(/T/, " ");
          value = new Date(value);
        }
        else continue;
        object[key] = value;
      }
      return object;
    }

    // https://github.com/d3/d3-dsv/issues/45
    const fixtz = new Date("2019-01-01T00:00").getHours() || new Date("2019-07-01T00:00").getHours();

    const metas = new Map;
    const queue$1 = [];
    const map$2 = queue$1.map;
    const some = queue$1.some;
    const hasOwnProperty$1 = queue$1.hasOwnProperty;
    const origin = "https://cdn.jsdelivr.net/npm/";
    const identifierRe = /^((?:@[^/@]+\/)?[^/@]+)(?:@([^/]+))?(?:\/(.*))?$/;
    const versionRe = /^\d+\.\d+\.\d+(-[\w-.+]+)?$/;
    const extensionRe = /\.[^/]*$/;
    const mains = ["unpkg", "jsdelivr", "browser", "main"];

    class RequireError extends Error {
      constructor(message) {
        super(message);
      }
    }

    RequireError.prototype.name = RequireError.name;

    function main(meta) {
      for (const key of mains) {
        const value = meta[key];
        if (typeof value === "string") {
          return extensionRe.test(value) ? value : `${value}.js`;
        }
      }
    }

    function parseIdentifier(identifier) {
      const match = identifierRe.exec(identifier);
      return match && {
        name: match[1],
        version: match[2],
        path: match[3]
      };
    }

    function resolveMeta(target) {
      const url = `${origin}${target.name}${target.version ? `@${target.version}` : ""}/package.json`;
      let meta = metas.get(url);
      if (!meta) metas.set(url, meta = fetch(url).then(response => {
        if (!response.ok) throw new RequireError("unable to load package.json");
        if (response.redirected && !metas.has(response.url)) metas.set(response.url, meta);
        return response.json();
      }));
      return meta;
    }

    async function resolve$1(name, base) {
      if (name.startsWith(origin)) name = name.substring(origin.length);
      if (/^(\w+:)|\/\//i.test(name)) return name;
      if (/^[.]{0,2}\//i.test(name)) return new URL(name, base == null ? location : base).href;
      if (!name.length || /^[\s._]/.test(name) || /\s$/.test(name)) throw new RequireError("illegal name");
      const target = parseIdentifier(name);
      if (!target) return `${origin}${name}`;
      if (!target.version && base != null && base.startsWith(origin)) {
        const meta = await resolveMeta(parseIdentifier(base.substring(origin.length)));
        target.version = meta.dependencies && meta.dependencies[target.name] || meta.peerDependencies && meta.peerDependencies[target.name];
      }
      if (target.path && !extensionRe.test(target.path)) target.path += ".js";
      if (target.path && target.version && versionRe.test(target.version)) return `${origin}${target.name}@${target.version}/${target.path}`;
      const meta = await resolveMeta(target);
      return `${origin}${meta.name}@${meta.version}/${target.path || main(meta) || "index.js"}`;
    }

    var require = requireFrom(resolve$1);

    function requireFrom(resolver) {
      const cache = new Map;
      const requireBase = requireRelative(null);

      function requireAbsolute(url) {
        if (typeof url !== "string") return url;
        let module = cache.get(url);
        if (!module) cache.set(url, module = new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.onload = () => {
            try { resolve(queue$1.pop()(requireRelative(url))); }
            catch (error) { reject(new RequireError("invalid module")); }
            script.remove();
          };
          script.onerror = () => {
            reject(new RequireError("unable to load module"));
            script.remove();
          };
          script.async = true;
          script.src = url;
          window.define = define;
          document.head.appendChild(script);
        }));
        return module;
      }

      function requireRelative(base) {
        return name => Promise.resolve(resolver(name, base)).then(requireAbsolute);
      }

      function requireAlias(aliases) {
        return requireFrom((name, base) => {
          if (name in aliases) {
            name = aliases[name], base = null;
            if (typeof name !== "string") return name;
          }
          return resolver(name, base);
        });
      }

      function require(name) {
        return arguments.length > 1
            ? Promise.all(map$2.call(arguments, requireBase)).then(merge$1)
            : requireBase(name);
      }

      require.alias = requireAlias;
      require.resolve = resolver;

      return require;
    }

    function merge$1(modules) {
      const o = {};
      for (const m of modules) {
        for (const k in m) {
          if (hasOwnProperty$1.call(m, k)) {
            if (m[k] == null) Object.defineProperty(o, k, {get: getter(m, k)});
            else o[k] = m[k];
          }
        }
      }
      return o;
    }

    function getter(object, name) {
      return () => object[name];
    }

    function isbuiltin(name) {
      name = name + "";
      return name === "exports" || name === "module";
    }

    function define(name, dependencies, factory) {
      const n = arguments.length;
      if (n < 2) factory = name, dependencies = [];
      else if (n < 3) factory = dependencies, dependencies = typeof name === "string" ? [] : name;
      queue$1.push(some.call(dependencies, isbuiltin) ? require => {
        const exports = {};
        const module = {exports};
        return Promise.all(map$2.call(dependencies, name => {
          name = name + "";
          return name === "exports" ? exports : name === "module" ? module : require(name);
        })).then(dependencies => {
          factory.apply(null, dependencies);
          return module.exports;
        });
      } : require => {
        return Promise.all(map$2.call(dependencies, require)).then(dependencies => {
          return typeof factory === "function" ? factory.apply(null, dependencies) : factory;
        });
      });
    }

    define.amd = {};

    function dependency(name, version, main) {
      return {
        resolve(path = main) {
          return `https://cdn.jsdelivr.net/npm/${name}@${version}/${path}`;
        }
      };
    }

    const d3 = dependency("d3", "7.2.1", "dist/d3.min.js");
    const inputs = dependency("@observablehq/inputs", "0.10.4", "dist/inputs.min.js");
    const plot = dependency("@observablehq/plot", "0.3.2", "dist/plot.umd.min.js");
    const graphviz = dependency("@observablehq/graphviz", "0.2.1", "dist/graphviz.min.js");
    const highlight = dependency("@observablehq/highlight.js", "2.0.0", "highlight.min.js");
    const katex = dependency("@observablehq/katex", "0.11.1", "dist/katex.min.js");
    const lodash = dependency("lodash", "4.17.21", "lodash.min.js");
    const htl = dependency("htl", "0.3.1", "dist/htl.min.js");
    const jszip = dependency("jszip", "3.7.1", "dist/jszip.min.js");
    const marked$1 = dependency("marked", "0.3.12", "marked.min.js");
    const sql = dependency("sql.js", "1.6.2", "dist/sql-wasm.js");
    const vega = dependency("vega", "5.21.0", "build/vega.min.js");
    const vegalite = dependency("vega-lite", "5.2.0", "build/vega-lite.min.js");
    const vegaliteApi = dependency("vega-lite-api", "5.0.0", "build/vega-lite-api.min.js");
    const arrow = dependency("apache-arrow", "4.0.1", "Arrow.es2015.min.js");
    const arquero = dependency("arquero", "4.8.7", "dist/arquero.min.js");
    const topojson = dependency("topojson-client", "3.1.0", "dist/topojson-client.min.js");
    const exceljs = dependency("exceljs", "4.3.0", "dist/exceljs.min.js");

    async function sqlite(require) {
      const init = await require(sql.resolve());
      return init({locateFile: file => sql.resolve(`dist/${file}`)});
    }

    class SQLiteDatabaseClient {
      constructor(db) {
        Object.defineProperties(this, {
          _db: {value: db}
        });
      }
      static async open(source) {
        const [SQL, buffer] = await Promise.all([sqlite(require), Promise.resolve(source).then(load$1)]);
        return new SQLiteDatabaseClient(new SQL.Database(buffer));
      }
      async query(query, params) {
        return await exec(this._db, query, params);
      }
      async queryRow(query, params) {
        return (await this.query(query, params))[0] || null;
      }
      async explain(query, params) {
        const rows = await this.query(`EXPLAIN QUERY PLAN ${query}`, params);
        return element$1("pre", {className: "observablehq--inspect"}, [
          text$2(rows.map(row => row.detail).join("\n"))
        ]);
      }
      async describe(object) {
        const rows = await (object === undefined
          ? this.query(`SELECT name FROM sqlite_master WHERE type = 'table'`)
          : this.query(`SELECT * FROM pragma_table_info(?)`, [object]));
        if (!rows.length) throw new Error("Not found");
        const {columns} = rows;
        return element$1("table", {value: rows}, [
          element$1("thead", [element$1("tr", columns.map(c => element$1("th", [text$2(c)])))]),
          element$1("tbody", rows.map(r => element$1("tr", columns.map(c => element$1("td", [text$2(r[c])])))))
        ]);
      }
      async sql(strings, ...args) {
        return this.query(strings.join("?"), args);
      }
    }
    Object.defineProperty(SQLiteDatabaseClient.prototype, "dialect", {
      value: "sqlite"
    });

    function load$1(source) {
      return typeof source === "string" ? fetch(source).then(load$1)
        : source instanceof Response || source instanceof Blob ? source.arrayBuffer().then(load$1)
        : source instanceof ArrayBuffer ? new Uint8Array(source)
        : source;
    }

    async function exec(db, query, params) {
      const [result] = await db.exec(query, params);
      if (!result) return [];
      const {columns, values} = result;
      const rows = values.map(row => Object.fromEntries(row.map((value, i) => [columns[i], value])));
      rows.columns = columns;
      return rows;
    }

    function element$1(name, props, children) {
      if (arguments.length === 2) children = props, props = undefined;
      const element = document.createElement(name);
      if (props !== undefined) for (const p in props) element[p] = props[p];
      if (children !== undefined) for (const c of children) element.appendChild(c);
      return element;
    }

    function text$2(value) {
      return document.createTextNode(value);
    }

    class Workbook {
      constructor(workbook) {
        Object.defineProperties(this, {
          _: {value: workbook},
          sheetNames: {
            value: workbook.worksheets.map((s) => s.name),
            enumerable: true,
          },
        });
      }
      sheet(name, options) {
        const sname =
          typeof name === "number"
            ? this.sheetNames[name]
            : this.sheetNames.includes((name += ""))
            ? name
            : null;
        if (sname == null) throw new Error(`Sheet not found: ${name}`);
        const sheet = this._.getWorksheet(sname);
        return extract(sheet, options);
      }
    }

    function extract(sheet, {range, headers} = {}) {
      let [[c0, r0], [c1, r1]] = parseRange(range, sheet);
      const headerRow = headers ? sheet._rows[r0++] : null;
      let names = new Set(["#"]);
      for (let n = c0; n <= c1; n++) {
        const value = headerRow ? valueOf(headerRow.findCell(n + 1)) : null;
        let name = (value && value + "") || toColumn(n);
        while (names.has(name)) name += "_";
        names.add(name);
      }
      names = new Array(c0).concat(Array.from(names));

      const output = new Array(r1 - r0 + 1);
      for (let r = r0; r <= r1; r++) {
        const row = (output[r - r0] = Object.create(null, {"#": {value: r + 1}}));
        const _row = sheet.getRow(r + 1);
        if (_row.hasValues)
          for (let c = c0; c <= c1; c++) {
            const value = valueOf(_row.findCell(c + 1));
            if (value != null) row[names[c + 1]] = value;
          }
      }

      output.columns = names.filter(() => true); // Filter sparse columns
      return output;
    }

    function valueOf(cell) {
      if (!cell) return;
      const {value} = cell;
      if (value && typeof value === "object" && !(value instanceof Date)) {
        if (value.formula || value.sharedFormula) {
          return value.result && value.result.error ? NaN : value.result;
        }
        if (value.richText) {
          return richText(value);
        }
        if (value.text) {
          let {text} = value;
          if (text.richText) text = richText(text);
          return value.hyperlink && value.hyperlink !== text
            ? `${value.hyperlink} ${text}`
            : text;
        }
        return value;
      }
      return value;
    }

    function richText(value) {
      return value.richText.map((d) => d.text).join("");
    }

    function parseRange(specifier = ":", {columnCount, rowCount}) {
      specifier += "";
      if (!specifier.match(/^[A-Z]*\d*:[A-Z]*\d*$/))
        throw new Error("Malformed range specifier");
      const [[c0 = 0, r0 = 0], [c1 = columnCount - 1, r1 = rowCount - 1]] =
        specifier.split(":").map(fromCellReference);
      return [
        [c0, r0],
        [c1, r1],
      ];
    }

    // Returns the default column name for a zero-based column index.
    // For example: 0 -> "A", 1 -> "B", 25 -> "Z", 26 -> "AA", 27 -> "AB".
    function toColumn(c) {
      let sc = "";
      c++;
      do {
        sc = String.fromCharCode(64 + (c % 26 || 26)) + sc;
      } while ((c = Math.floor((c - 1) / 26)));
      return sc;
    }

    // Returns the zero-based indexes from a cell reference.
    // For example: "A1" -> [0, 0], "B2" -> [1, 1], "AA10" -> [26, 9].
    function fromCellReference(s) {
      const [, sc, sr] = s.match(/^([A-Z]*)(\d*)$/);
      let c = 0;
      if (sc)
        for (let i = 0; i < sc.length; i++)
          c += Math.pow(26, sc.length - i - 1) * (sc.charCodeAt(i) - 64);
      return [c ? c - 1 : undefined, sr ? +sr - 1 : undefined];
    }

    async function remote_fetch(file) {
      const response = await fetch(await file.url());
      if (!response.ok) throw new Error(`Unable to load file: ${file.name}`);
      return response;
    }

    async function dsv(file, delimiter, {array = false, typed = false} = {}) {
      const text = await file.text();
      return (delimiter === "\t"
          ? (array ? tsvParseRows : tsvParse)
          : (array ? csvParseRows : csvParse))(text, typed && autoType);
    }

    class AbstractFile {
      constructor(name) {
        Object.defineProperty(this, "name", {value: name, enumerable: true});
      }
      async blob() {
        return (await remote_fetch(this)).blob();
      }
      async arrayBuffer() {
        return (await remote_fetch(this)).arrayBuffer();
      }
      async text() {
        return (await remote_fetch(this)).text();
      }
      async json() {
        return (await remote_fetch(this)).json();
      }
      async stream() {
        return (await remote_fetch(this)).body;
      }
      async csv(options) {
        return dsv(this, ",", options);
      }
      async tsv(options) {
        return dsv(this, "\t", options);
      }
      async image(props) {
        const url = await this.url();
        return new Promise((resolve, reject) => {
          const i = new Image();
          if (new URL(url, document.baseURI).origin !== new URL(location).origin) {
            i.crossOrigin = "anonymous";
          }
          Object.assign(i, props);
          i.onload = () => resolve(i);
          i.onerror = () => reject(new Error(`Unable to load file: ${this.name}`));
          i.src = url;
        });
      }
      async arrow() {
        const [Arrow, response] = await Promise.all([require(arrow.resolve()), remote_fetch(this)]);
        return Arrow.Table.from(response);
      }
      async sqlite() {
        return SQLiteDatabaseClient.open(remote_fetch(this));
      }
      async zip() {
        const [JSZip, buffer] = await Promise.all([require(jszip.resolve()), this.arrayBuffer()]);
        return new ZipArchive(await JSZip.loadAsync(buffer));
      }
      async xml(mimeType = "application/xml") {
        return (new DOMParser).parseFromString(await this.text(), mimeType);
      }
      async html() {
        return this.xml("text/html");
      }
      async xlsx() {
        const [ExcelJS, buffer] = await Promise.all([require(exceljs.resolve()), this.arrayBuffer()]);
        return new Workbook(await new ExcelJS.Workbook().xlsx.load(buffer));
      }
    }

    class FileAttachment extends AbstractFile {
      constructor(url, name) {
        super(name);
        Object.defineProperty(this, "_url", {value: url});
      }
      async url() {
        return (await this._url) + "";
      }
    }

    function NoFileAttachments(name) {
      throw new Error(`File not found: ${name}`);
    }

    function FileAttachments(resolve) {
      return Object.assign(
        name => {
          const url = resolve(name += ""); // Returns a Promise, string, or null.
          if (url == null) throw new Error(`File not found: ${name}`);
          return new FileAttachment(url, name);
        },
        {prototype: FileAttachment.prototype} // instanceof
      );
    }

    class ZipArchive {
      constructor(archive) {
        Object.defineProperty(this, "_", {value: archive});
        this.filenames = Object.keys(archive.files).filter(name => !archive.files[name].dir);
      }
      file(path) {
        const object = this._.file(path += "");
        if (!object || object.dir) throw new Error(`file not found: ${path}`);
        return new ZipArchiveEntry(object);
      }
    }

    class ZipArchiveEntry extends AbstractFile {
      constructor(object) {
        super(object.name);
        Object.defineProperty(this, "_", {value: object});
        Object.defineProperty(this, "_url", {writable: true});
      }
      async url() {
        return this._url || (this._url = this.blob().then(URL.createObjectURL));
      }
      async blob() {
        return this._.async("blob");
      }
      async arrayBuffer() {
        return this._.async("arraybuffer");
      }
      async text() {
        return this._.async("text");
      }
      async json() {
        return JSON.parse(await this.text());
      }
    }

    function canvas(width, height) {
      var canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      return canvas;
    }

    function context2d(width, height, dpi) {
      if (dpi == null) dpi = devicePixelRatio;
      var canvas = document.createElement("canvas");
      canvas.width = width * dpi;
      canvas.height = height * dpi;
      canvas.style.width = width + "px";
      var context = canvas.getContext("2d");
      context.scale(dpi, dpi);
      return context;
    }

    function download(value, name = "untitled", label = "Save") {
      const a = document.createElement("a");
      const b = a.appendChild(document.createElement("button"));
      b.textContent = label;
      a.download = name;

      async function reset() {
        await new Promise(requestAnimationFrame);
        URL.revokeObjectURL(a.href);
        a.removeAttribute("href");
        b.textContent = label;
        b.disabled = false;
      }

      a.onclick = async event => {
        b.disabled = true;
        if (a.href) return reset(); // Already saved.
        b.textContent = "Saving…";
        try {
          const object = await (typeof value === "function" ? value() : value);
          b.textContent = "Download";
          a.href = URL.createObjectURL(object); // eslint-disable-line require-atomic-updates
        } catch (ignore) {
          b.textContent = label;
        }
        if (event.eventPhase) return reset(); // Already downloaded.
        b.disabled = false;
      };

      return a;
    }

    var namespaces = {
      math: "http://www.w3.org/1998/Math/MathML",
      svg: "http://www.w3.org/2000/svg",
      xhtml: "http://www.w3.org/1999/xhtml",
      xlink: "http://www.w3.org/1999/xlink",
      xml: "http://www.w3.org/XML/1998/namespace",
      xmlns: "http://www.w3.org/2000/xmlns/"
    };

    function element(name, attributes) {
      var prefix = name += "", i = prefix.indexOf(":"), value;
      if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
      var element = namespaces.hasOwnProperty(prefix) // eslint-disable-line no-prototype-builtins
          ? document.createElementNS(namespaces[prefix], name)
          : document.createElement(name);
      if (attributes) for (var key in attributes) {
        prefix = key, i = prefix.indexOf(":"), value = attributes[key];
        if (i >= 0 && (prefix = key.slice(0, i)) !== "xmlns") key = key.slice(i + 1);
        if (namespaces.hasOwnProperty(prefix)) element.setAttributeNS(namespaces[prefix], key, value); // eslint-disable-line no-prototype-builtins
        else element.setAttribute(key, value);
      }
      return element;
    }

    function input$1(type) {
      var input = document.createElement("input");
      if (type != null) input.type = type;
      return input;
    }

    function range$1(min, max, step) {
      if (arguments.length === 1) max = min, min = null;
      var input = document.createElement("input");
      input.min = min = min == null ? 0 : +min;
      input.max = max = max == null ? 1 : +max;
      input.step = step == null ? "any" : step = +step;
      input.type = "range";
      return input;
    }

    function select(values) {
      var select = document.createElement("select");
      Array.prototype.forEach.call(values, function(value) {
        var option = document.createElement("option");
        option.value = option.textContent = value;
        select.appendChild(option);
      });
      return select;
    }

    function svg$1(width, height) {
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", [0, 0, width, height]);
      svg.setAttribute("width", width);
      svg.setAttribute("height", height);
      return svg;
    }

    function text$1(value) {
      return document.createTextNode(value);
    }

    var count = 0;

    function uid(name) {
      return new Id("O-" + (name == null ? "" : name + "-") + ++count);
    }

    function Id(id) {
      this.id = id;
      this.href = new URL(`#${id}`, location) + "";
    }

    Id.prototype.toString = function() {
      return "url(" + this.href + ")";
    };

    var DOM = {
      canvas: canvas,
      context2d: context2d,
      download: download,
      element: element,
      input: input$1,
      range: range$1,
      select: select,
      svg: svg$1,
      text: text$1,
      uid: uid
    };

    function buffer(file) {
      return new Promise(function(resolve, reject) {
        var reader = new FileReader;
        reader.onload = function() { resolve(reader.result); };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });
    }

    function text(file) {
      return new Promise(function(resolve, reject) {
        var reader = new FileReader;
        reader.onload = function() { resolve(reader.result); };
        reader.onerror = reject;
        reader.readAsText(file);
      });
    }

    function url(file) {
      return new Promise(function(resolve, reject) {
        var reader = new FileReader;
        reader.onload = function() { resolve(reader.result); };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    var Files = {
      buffer: buffer,
      text: text,
      url: url
    };

    function that() {
      return this;
    }

    function disposable(value, dispose) {
      let done = false;
      if (typeof dispose !== "function") {
        throw new Error("dispose is not a function");
      }
      return {
        [Symbol.iterator]: that,
        next: () => done ? {done: true} : (done = true, {done: false, value}),
        return: () => (done = true, dispose(value), {done: true}),
        throw: () => ({done: done = true})
      };
    }

    function* filter(iterator, test) {
      var result, index = -1;
      while (!(result = iterator.next()).done) {
        if (test(result.value, ++index)) {
          yield result.value;
        }
      }
    }

    function observe(initialize) {
      let stale = false;
      let value;
      let resolve;
      const dispose = initialize(change);

      if (dispose != null && typeof dispose !== "function") {
        throw new Error(typeof dispose.then === "function"
            ? "async initializers are not supported"
            : "initializer returned something, but not a dispose function");
      }

      function change(x) {
        if (resolve) resolve(x), resolve = null;
        else stale = true;
        return value = x;
      }

      function next() {
        return {done: false, value: stale
            ? (stale = false, Promise.resolve(value))
            : new Promise(_ => (resolve = _))};
      }

      return {
        [Symbol.iterator]: that,
        throw: () => ({done: true}),
        return: () => (dispose != null && dispose(), {done: true}),
        next
      };
    }

    function input(input) {
      return observe(function(change) {
        var event = eventof(input), value = valueof(input);
        function inputted() { change(valueof(input)); }
        input.addEventListener(event, inputted);
        if (value !== undefined) change(value);
        return function() { input.removeEventListener(event, inputted); };
      });
    }

    function valueof(input) {
      switch (input.type) {
        case "range":
        case "number": return input.valueAsNumber;
        case "date": return input.valueAsDate;
        case "checkbox": return input.checked;
        case "file": return input.multiple ? input.files : input.files[0];
        case "select-multiple": return Array.from(input.selectedOptions, o => o.value);
        default: return input.value;
      }
    }

    function eventof(input) {
      switch (input.type) {
        case "button":
        case "submit":
        case "checkbox": return "click";
        case "file": return "change";
        default: return "input";
      }
    }

    function* map$1(iterator, transform) {
      var result, index = -1;
      while (!(result = iterator.next()).done) {
        yield transform(result.value, ++index);
      }
    }

    function queue(initialize) {
      let resolve;
      const queue = [];
      const dispose = initialize(push);

      if (dispose != null && typeof dispose !== "function") {
        throw new Error(typeof dispose.then === "function"
            ? "async initializers are not supported"
            : "initializer returned something, but not a dispose function");
      }

      function push(x) {
        queue.push(x);
        if (resolve) resolve(queue.shift()), resolve = null;
        return x;
      }

      function next() {
        return {done: false, value: queue.length
            ? Promise.resolve(queue.shift())
            : new Promise(_ => (resolve = _))};
      }

      return {
        [Symbol.iterator]: that,
        throw: () => ({done: true}),
        return: () => (dispose != null && dispose(), {done: true}),
        next
      };
    }

    function* range(start, stop, step) {
      start = +start;
      stop = +stop;
      step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;
      var i = -1, n = Math.max(0, Math.ceil((stop - start) / step)) | 0;
      while (++i < n) {
        yield start + i * step;
      }
    }

    function valueAt(iterator, i) {
      if (!isFinite(i = +i) || i < 0 || i !== i | 0) return;
      var result, index = -1;
      while (!(result = iterator.next()).done) {
        if (++index === i) {
          return result.value;
        }
      }
    }

    function worker(source) {
      const url = URL.createObjectURL(new Blob([source], {type: "text/javascript"}));
      const worker = new Worker(url);
      return disposable(worker, () => {
        worker.terminate();
        URL.revokeObjectURL(url);
      });
    }

    var Generators = {
      disposable: disposable,
      filter: filter,
      input: input,
      map: map$1,
      observe: observe,
      queue: queue,
      range: range,
      valueAt: valueAt,
      worker: worker
    };

    function template(render, wrapper) {
      return function(strings) {
        var string = strings[0],
            parts = [], part,
            root = null,
            node, nodes,
            walker,
            i, n, j, m, k = -1;

        // Concatenate the text using comments as placeholders.
        for (i = 1, n = arguments.length; i < n; ++i) {
          part = arguments[i];
          if (part instanceof Node) {
            parts[++k] = part;
            string += "<!--o:" + k + "-->";
          } else if (Array.isArray(part)) {
            for (j = 0, m = part.length; j < m; ++j) {
              node = part[j];
              if (node instanceof Node) {
                if (root === null) {
                  parts[++k] = root = document.createDocumentFragment();
                  string += "<!--o:" + k + "-->";
                }
                root.appendChild(node);
              } else {
                root = null;
                string += node;
              }
            }
            root = null;
          } else {
            string += part;
          }
          string += strings[i];
        }

        // Render the text.
        root = render(string);

        // Walk the rendered content to replace comment placeholders.
        if (++k > 0) {
          nodes = new Array(k);
          walker = document.createTreeWalker(root, NodeFilter.SHOW_COMMENT, null, false);
          while (walker.nextNode()) {
            node = walker.currentNode;
            if (/^o:/.test(node.nodeValue)) {
              nodes[+node.nodeValue.slice(2)] = node;
            }
          }
          for (i = 0; i < k; ++i) {
            if (node = nodes[i]) {
              node.parentNode.replaceChild(parts[i], node);
            }
          }
        }

        // Is the rendered content
        // … a parent of a single child? Detach and return the child.
        // … a document fragment? Replace the fragment with an element.
        // … some other node? Return it.
        return root.childNodes.length === 1 ? root.removeChild(root.firstChild)
            : root.nodeType === 11 ? ((node = wrapper()).appendChild(root), node)
            : root;
      };
    }

    var html = template(function(string) {
      var template = document.createElement("template");
      template.innerHTML = string.trim();
      return document.importNode(template.content, true);
    }, function() {
      return document.createElement("span");
    });

    function md(require) {
      return require(marked$1.resolve()).then(function(marked) {
        return template(
          function(string) {
            var root = document.createElement("div");
            root.innerHTML = marked(string, {langPrefix: ""}).trim();
            var code = root.querySelectorAll("pre code[class]");
            if (code.length > 0) {
              require(highlight.resolve()).then(function(hl) {
                code.forEach(function(block) {
                  function done() {
                    hl.highlightBlock(block);
                    block.parentNode.classList.add("observablehq--md-pre");
                  }
                  if (hl.getLanguage(block.className)) {
                    done();
                  } else {
                    require(highlight.resolve("async-languages/index.js"))
                      .then(index => {
                        if (index.has(block.className)) {
                          return require(highlight.resolve("async-languages/" + index.get(block.className))).then(language => {
                            hl.registerLanguage(block.className, language);
                          });
                        }
                      })
                      .then(done, done);
                  }
                });
              });
            }
            return root;
          },
          function() {
            return document.createElement("div");
          }
        );
      });
    }

    function Mutable(value) {
      let change;
      Object.defineProperties(this, {
        generator: {value: observe(_ => void (change = _))},
        value: {get: () => value, set: x => change(value = x)} // eslint-disable-line no-setter-return
      });
      if (value !== undefined) change(value);
    }

    function* now() {
      while (true) {
        yield Date.now();
      }
    }

    function delay$1(duration, value) {
      return new Promise(function(resolve) {
        setTimeout(function() {
          resolve(value);
        }, duration);
      });
    }

    var timeouts = new Map;

    function timeout(now, time) {
      var t = new Promise(function(resolve) {
        timeouts.delete(time);
        var delay = time - now;
        if (!(delay > 0)) throw new Error("invalid time");
        if (delay > 0x7fffffff) throw new Error("too long to wait");
        setTimeout(resolve, delay);
      });
      timeouts.set(time, t);
      return t;
    }

    function when(time, value) {
      var now;
      return (now = timeouts.get(time = +time)) ? now.then(() => value)
          : (now = Date.now()) >= time ? Promise.resolve(value)
          : timeout(now, time).then(() => value);
    }

    function tick(duration, value) {
      return when(Math.ceil((Date.now() + 1) / duration) * duration, value);
    }

    var Promises = {
      delay: delay$1,
      tick: tick,
      when: when
    };

    function resolve(name, base) {
      if (/^(\w+:)|\/\//i.test(name)) return name;
      if (/^[.]{0,2}\//i.test(name)) return new URL(name, base == null ? location : base).href;
      if (!name.length || /^[\s._]/.test(name) || /\s$/.test(name)) throw new Error("illegal name");
      return "https://unpkg.com/" + name;
    }

    function requirer(resolve) {
      return resolve == null ? require : requireFrom(resolve);
    }

    var svg = template(function(string) {
      var root = document.createElementNS("http://www.w3.org/2000/svg", "g");
      root.innerHTML = string.trim();
      return root;
    }, function() {
      return document.createElementNS("http://www.w3.org/2000/svg", "g");
    });

    var raw = String.raw;

    function style(href) {
      return new Promise(function(resolve, reject) {
        var link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        link.onerror = reject;
        link.onload = resolve;
        document.head.appendChild(link);
      });
    }

    function tex(require) {
      return Promise.all([
        require(katex.resolve()),
        style(katex.resolve("dist/katex.min.css"))
      ]).then(function(values) {
        var katex = values[0], tex = renderer();

        function renderer(options) {
          return function() {
            var root = document.createElement("div");
            katex.render(raw.apply(String, arguments), root, options);
            return root.removeChild(root.firstChild);
          };
        }

        tex.options = renderer;
        tex.block = renderer({displayMode: true});
        return tex;
      });
    }

    async function vl(require) {
      const [v, vl, api] = await Promise.all([vega, vegalite, vegaliteApi].map(d => require(d.resolve())));
      return api.register(v, vl);
    }

    function width() {
      return observe(function(change) {
        var width = change(document.body.clientWidth);
        function resized() {
          var w = document.body.clientWidth;
          if (w !== width) change(width = w);
        }
        window.addEventListener("resize", resized);
        return function() {
          window.removeEventListener("resize", resized);
        };
      });
    }

    var Library = Object.assign(function Library(resolver) {
      const require = requirer(resolver);
      Object.defineProperties(this, properties({
        FileAttachment: () => NoFileAttachments,
        Arrow: () => require(arrow.resolve()),
        Inputs: () => require(inputs.resolve()).then(Inputs => ({...Inputs, file: Inputs.fileOf(AbstractFile)})),
        Mutable: () => Mutable,
        Plot: () => require(plot.resolve()),
        SQLite: () => sqlite(require),
        SQLiteDatabaseClient: () => SQLiteDatabaseClient,
        _: () => require(lodash.resolve()),
        aq: () => require.alias({"apache-arrow": arrow.resolve()})(arquero.resolve()),
        d3: () => require(d3.resolve()),
        dot: () => require(graphviz.resolve()),
        htl: () => require(htl.resolve()),
        html: () => html,
        md: () => md(require),
        now,
        require: () => require,
        resolve: () => resolve,
        svg: () => svg,
        tex: () => tex(require),
        topojson: () => require(topojson.resolve()),
        vl: () => vl(require),
        width,

        // Note: these are namespace objects, and thus exposed directly rather than
        // being wrapped in a function. This allows library.Generators to resolve,
        // rather than needing module.value.
        DOM,
        Files,
        Generators,
        Promises
      }));
    }, {resolve: require.resolve});

    function properties(values) {
      return Object.fromEntries(Object.entries(values).map(property));
    }

    function property([key, value]) {
      return [key, ({value, writable: true, enumerable: true})];
    }

    function RuntimeError(message, input) {
      this.message = message + "";
      this.input = input;
    }

    RuntimeError.prototype = Object.create(Error.prototype);
    RuntimeError.prototype.name = "RuntimeError";
    RuntimeError.prototype.constructor = RuntimeError;

    function generatorish(value) {
      return value
          && typeof value.next === "function"
          && typeof value.return === "function";
    }

    function load(notebook, library, observer) {
      if (typeof library == "function") observer = library, library = null;
      if (typeof observer !== "function") throw new Error("invalid observer");
      if (library == null) library = new Library();

      const {modules, id} = notebook;
      const map = new Map;
      const runtime = new Runtime(library);
      const main = runtime_module(id);

      function runtime_module(id) {
        let module = map.get(id);
        if (!module) map.set(id, module = runtime.module());
        return module;
      }

      for (const m of modules) {
        const module = runtime_module(m.id);
        let i = 0;
        for (const v of m.variables) {
          if (v.from) module.import(v.remote, v.name, runtime_module(v.from));
          else if (module === main) module.variable(observer(v, i, m.variables)).define(v.name, v.inputs, v.value);
          else module.define(v.name, v.inputs, v.value);
          ++i;
        }
      }

      return runtime;
    }

    var prototype = Array.prototype;
    var map = prototype.map;
    var forEach = prototype.forEach;

    function constant(x) {
      return function() {
        return x;
      };
    }

    function identity(x) {
      return x;
    }

    function rethrow(e) {
      return function() {
        throw e;
      };
    }

    function noop() {}

    var TYPE_NORMAL = 1; // a normal variable
    var TYPE_IMPLICIT = 2; // created on reference
    var TYPE_DUPLICATE = 3; // created on duplicate definition

    var no_observer = {};

    function Variable(type, module, observer) {
      if (!observer) observer = no_observer;
      Object.defineProperties(this, {
        _observer: {value: observer, writable: true},
        _definition: {value: variable_undefined, writable: true},
        _duplicate: {value: undefined, writable: true},
        _duplicates: {value: undefined, writable: true},
        _indegree: {value: NaN, writable: true}, // The number of computing inputs.
        _inputs: {value: [], writable: true},
        _invalidate: {value: noop, writable: true},
        _module: {value: module},
        _name: {value: null, writable: true},
        _outputs: {value: new Set, writable: true},
        _promise: {value: Promise.resolve(undefined), writable: true},
        _reachable: {value: observer !== no_observer, writable: true}, // Is this variable transitively visible?
        _rejector: {value: variable_rejector(this)},
        _type: {value: type},
        _value: {value: undefined, writable: true},
        _version: {value: 0, writable: true}
      });
    }

    Object.defineProperties(Variable.prototype, {
      _pending: {value: variable_pending, writable: true, configurable: true},
      _fulfilled: {value: variable_fulfilled, writable: true, configurable: true},
      _rejected: {value: variable_rejected, writable: true, configurable: true},
      define: {value: variable_define, writable: true, configurable: true},
      delete: {value: variable_delete, writable: true, configurable: true},
      import: {value: variable_import, writable: true, configurable: true}
    });

    function variable_attach(variable) {
      variable._module._runtime._dirty.add(variable);
      variable._outputs.add(this);
    }

    function variable_detach(variable) {
      variable._module._runtime._dirty.add(variable);
      variable._outputs.delete(this);
    }

    function variable_undefined() {
      throw variable_undefined;
    }

    function variable_rejector(variable) {
      return function(error) {
        if (error === variable_undefined) throw new RuntimeError(variable._name + " is not defined", variable._name);
        if (error instanceof Error && error.message) throw new RuntimeError(error.message, variable._name);
        throw new RuntimeError(variable._name + " could not be resolved", variable._name);
      };
    }

    function variable_duplicate(name) {
      return function() {
        throw new RuntimeError(name + " is defined more than once");
      };
    }

    function variable_define(name, inputs, definition) {
      switch (arguments.length) {
        case 1: {
          definition = name, name = inputs = null;
          break;
        }
        case 2: {
          definition = inputs;
          if (typeof name === "string") inputs = null;
          else inputs = name, name = null;
          break;
        }
      }
      return variable_defineImpl.call(this,
        name == null ? null : name + "",
        inputs == null ? [] : map.call(inputs, this._module._resolve, this._module),
        typeof definition === "function" ? definition : constant(definition)
      );
    }

    function variable_defineImpl(name, inputs, definition) {
      var scope = this._module._scope, runtime = this._module._runtime;

      this._inputs.forEach(variable_detach, this);
      inputs.forEach(variable_attach, this);
      this._inputs = inputs;
      this._definition = definition;
      this._value = undefined;

      // Is this an active variable (that may require disposal)?
      if (definition === noop) runtime._variables.delete(this);
      else runtime._variables.add(this);

      // Did the variable’s name change? Time to patch references!
      if (name !== this._name || scope.get(name) !== this) {
        var error, found;

        if (this._name) { // Did this variable previously have a name?
          if (this._outputs.size) { // And did other variables reference this variable?
            scope.delete(this._name);
            found = this._module._resolve(this._name);
            found._outputs = this._outputs, this._outputs = new Set;
            found._outputs.forEach(function(output) { output._inputs[output._inputs.indexOf(this)] = found; }, this);
            found._outputs.forEach(runtime._updates.add, runtime._updates);
            runtime._dirty.add(found).add(this);
            scope.set(this._name, found);
          } else if ((found = scope.get(this._name)) === this) { // Do no other variables reference this variable?
            scope.delete(this._name); // It’s safe to delete!
          } else if (found._type === TYPE_DUPLICATE) { // Do other variables assign this name?
            found._duplicates.delete(this); // This variable no longer assigns this name.
            this._duplicate = undefined;
            if (found._duplicates.size === 1) { // Is there now only one variable assigning this name?
              found = found._duplicates.keys().next().value; // Any references are now fixed!
              error = scope.get(this._name);
              found._outputs = error._outputs, error._outputs = new Set;
              found._outputs.forEach(function(output) { output._inputs[output._inputs.indexOf(error)] = found; });
              found._definition = found._duplicate, found._duplicate = undefined;
              runtime._dirty.add(error).add(found);
              runtime._updates.add(found);
              scope.set(this._name, found);
            }
          } else {
            throw new Error;
          }
        }

        if (this._outputs.size) throw new Error;

        if (name) { // Does this variable have a new name?
          if (found = scope.get(name)) { // Do other variables reference or assign this name?
            if (found._type === TYPE_DUPLICATE) { // Do multiple other variables already define this name?
              this._definition = variable_duplicate(name), this._duplicate = definition;
              found._duplicates.add(this);
            } else if (found._type === TYPE_IMPLICIT) { // Are the variable references broken?
              this._outputs = found._outputs, found._outputs = new Set; // Now they’re fixed!
              this._outputs.forEach(function(output) { output._inputs[output._inputs.indexOf(found)] = this; }, this);
              runtime._dirty.add(found).add(this);
              scope.set(name, this);
            } else { // Does another variable define this name?
              found._duplicate = found._definition, this._duplicate = definition; // Now they’re duplicates.
              error = new Variable(TYPE_DUPLICATE, this._module);
              error._name = name;
              error._definition = this._definition = found._definition = variable_duplicate(name);
              error._outputs = found._outputs, found._outputs = new Set;
              error._outputs.forEach(function(output) { output._inputs[output._inputs.indexOf(found)] = error; });
              error._duplicates = new Set([this, found]);
              runtime._dirty.add(found).add(error);
              runtime._updates.add(found).add(error);
              scope.set(name, error);
            }
          } else {
            scope.set(name, this);
          }
        }

        this._name = name;
      }

      runtime._updates.add(this);
      runtime._compute();
      return this;
    }

    function variable_import(remote, name, module) {
      if (arguments.length < 3) module = name, name = remote;
      return variable_defineImpl.call(this, name + "", [module._resolve(remote + "")], identity);
    }

    function variable_delete() {
      return variable_defineImpl.call(this, null, [], noop);
    }

    function variable_pending() {
      if (this._observer.pending) this._observer.pending();
    }

    function variable_fulfilled(value) {
      if (this._observer.fulfilled) this._observer.fulfilled(value, this._name);
    }

    function variable_rejected(error) {
      if (this._observer.rejected) this._observer.rejected(error, this._name);
    }

    function Module(runtime, builtins = []) {
      Object.defineProperties(this, {
        _runtime: {value: runtime},
        _scope: {value: new Map},
        _builtins: {value: new Map([
          ["invalidation", variable_invalidation],
          ["visibility", variable_visibility],
          ...builtins
        ])},
        _source: {value: null, writable: true}
      });
    }

    Object.defineProperties(Module.prototype, {
      _copy: {value: module_copy, writable: true, configurable: true},
      _resolve: {value: module_resolve, writable: true, configurable: true},
      redefine: {value: module_redefine, writable: true, configurable: true},
      define: {value: module_define, writable: true, configurable: true},
      derive: {value: module_derive, writable: true, configurable: true},
      import: {value: module_import, writable: true, configurable: true},
      value: {value: module_value, writable: true, configurable: true},
      variable: {value: module_variable, writable: true, configurable: true},
      builtin: {value: module_builtin, writable: true, configurable: true}
    });

    function module_redefine(name) {
      var v = this._scope.get(name);
      if (!v) throw new RuntimeError(name + " is not defined");
      if (v._type === TYPE_DUPLICATE) throw new RuntimeError(name + " is defined more than once");
      return v.define.apply(v, arguments);
    }

    function module_define() {
      var v = new Variable(TYPE_NORMAL, this);
      return v.define.apply(v, arguments);
    }

    function module_import() {
      var v = new Variable(TYPE_NORMAL, this);
      return v.import.apply(v, arguments);
    }

    function module_variable(observer) {
      return new Variable(TYPE_NORMAL, this, observer);
    }

    async function module_value(name) {
      var v = this._scope.get(name);
      if (!v) throw new RuntimeError(name + " is not defined");
      if (v._observer === no_observer) {
        v._observer = true;
        this._runtime._dirty.add(v);
      }
      await this._runtime._compute();
      return v._promise;
    }

    function module_derive(injects, injectModule) {
      var copy = new Module(this._runtime, this._builtins);
      copy._source = this;
      forEach.call(injects, function(inject) {
        if (typeof inject !== "object") inject = {name: inject + ""};
        if (inject.alias == null) inject.alias = inject.name;
        copy.import(inject.name, inject.alias, injectModule);
      });
      Promise.resolve().then(() => {
        const modules = new Set([this]);
        for (const module of modules) {
          for (const variable of module._scope.values()) {
            if (variable._definition === identity) { // import
              const module = variable._inputs[0]._module;
              const source = module._source || module;
              if (source === this) { // circular import-with!
                console.warn("circular module definition; ignoring"); // eslint-disable-line no-console
                return;
              }
              modules.add(source);
            }
          }
        }
        this._copy(copy, new Map);
      });
      return copy;
    }

    function module_copy(copy, map) {
      copy._source = this;
      map.set(this, copy);
      for (const [name, source] of this._scope) {
        var target = copy._scope.get(name);
        if (target && target._type === TYPE_NORMAL) continue; // injection
        if (source._definition === identity) { // import
          var sourceInput = source._inputs[0],
              sourceModule = sourceInput._module;
          copy.import(sourceInput._name, name, map.get(sourceModule)
            || (sourceModule._source
               ? sourceModule._copy(new Module(copy._runtime, copy._builtins), map) // import-with
               : sourceModule));
        } else {
          copy.define(name, source._inputs.map(variable_name), source._definition);
        }
      }
      return copy;
    }

    function module_resolve(name) {
      var variable = this._scope.get(name), value;
      if (!variable) {
        variable = new Variable(TYPE_IMPLICIT, this);
        if (this._builtins.has(name)) {
          variable.define(name, constant(this._builtins.get(name)));
        } else if (this._runtime._builtin._scope.has(name)) {
          variable.import(name, this._runtime._builtin);
        } else {
          try {
            value = this._runtime._global(name);
          } catch (error) {
            return variable.define(name, rethrow(error));
          }
          if (value === undefined) {
            this._scope.set(variable._name = name, variable);
          } else {
            variable.define(name, constant(value));
          }
        }
      }
      return variable;
    }

    function module_builtin(name, value) {
      this._builtins.set(name, value);
    }

    function variable_name(variable) {
      return variable._name;
    }

    const frame = typeof requestAnimationFrame === "function" ? requestAnimationFrame : setImmediate;

    var variable_invalidation = {};
    var variable_visibility = {};

    function Runtime(builtins = new Library, global = window_global) {
      var builtin = this.module();
      Object.defineProperties(this, {
        _dirty: {value: new Set},
        _updates: {value: new Set},
        _precomputes: {value: [], writable: true},
        _computing: {value: null, writable: true},
        _init: {value: null, writable: true},
        _modules: {value: new Map},
        _variables: {value: new Set},
        _disposed: {value: false, writable: true},
        _builtin: {value: builtin},
        _global: {value: global}
      });
      if (builtins) for (var name in builtins) {
        (new Variable(TYPE_IMPLICIT, builtin)).define(name, [], builtins[name]);
      }
    }

    Object.defineProperties(Runtime, {
      load: {value: load, writable: true, configurable: true}
    });

    Object.defineProperties(Runtime.prototype, {
      _precompute: {value: runtime_precompute, writable: true, configurable: true},
      _compute: {value: runtime_compute, writable: true, configurable: true},
      _computeSoon: {value: runtime_computeSoon, writable: true, configurable: true},
      _computeNow: {value: runtime_computeNow, writable: true, configurable: true},
      dispose: {value: runtime_dispose, writable: true, configurable: true},
      module: {value: runtime_module, writable: true, configurable: true},
      fileAttachments: {value: FileAttachments, writable: true, configurable: true}
    });

    function runtime_dispose() {
      this._computing = Promise.resolve();
      this._disposed = true;
      this._variables.forEach(v => {
        v._invalidate();
        v._version = NaN;
      });
    }

    function runtime_module(define, observer = noop) {
      let module;
      if (define === undefined) {
        if (module = this._init) {
          this._init = null;
          return module;
        }
        return new Module(this);
      }
      module = this._modules.get(define);
      if (module) return module;
      this._init = module = new Module(this);
      this._modules.set(define, module);
      try {
        define(this, observer);
      } finally {
        this._init = null;
      }
      return module;
    }

    function runtime_precompute(callback) {
      this._precomputes.push(callback);
      this._compute();
    }

    function runtime_compute() {
      return this._computing || (this._computing = this._computeSoon());
    }

    function runtime_computeSoon() {
      return new Promise(frame).then(() => this._disposed ? undefined : this._computeNow());
    }

    async function runtime_computeNow() {
      var queue = [],
          variables,
          variable,
          precomputes = this._precomputes;

      // If there are any paused generators, resume them before computing so they
      // can update (if synchronous) before computing downstream variables.
      if (precomputes.length) {
        this._precomputes = [];
        for (const callback of precomputes) callback();
        await runtime_defer(3);
      }

      // Compute the reachability of the transitive closure of dirty variables.
      // Any newly-reachable variable must also be recomputed.
      // Any no-longer-reachable variable must be terminated.
      variables = new Set(this._dirty);
      variables.forEach(function(variable) {
        variable._inputs.forEach(variables.add, variables);
        const reachable = variable_reachable(variable);
        if (reachable > variable._reachable) {
          this._updates.add(variable);
        } else if (reachable < variable._reachable) {
          variable._invalidate();
        }
        variable._reachable = reachable;
      }, this);

      // Compute the transitive closure of updating, reachable variables.
      variables = new Set(this._updates);
      variables.forEach(function(variable) {
        if (variable._reachable) {
          variable._indegree = 0;
          variable._outputs.forEach(variables.add, variables);
        } else {
          variable._indegree = NaN;
          variables.delete(variable);
        }
      });

      this._computing = null;
      this._updates.clear();
      this._dirty.clear();

      // Compute the indegree of updating variables.
      variables.forEach(function(variable) {
        variable._outputs.forEach(variable_increment);
      });

      do {
        // Identify the root variables (those with no updating inputs).
        variables.forEach(function(variable) {
          if (variable._indegree === 0) {
            queue.push(variable);
          }
        });

        // Compute the variables in topological order.
        while (variable = queue.pop()) {
          variable_compute(variable);
          variable._outputs.forEach(postqueue);
          variables.delete(variable);
        }

        // Any remaining variables are circular, or depend on them.
        variables.forEach(function(variable) {
          if (variable_circular(variable)) {
            variable_error(variable, new RuntimeError("circular definition"));
            variable._outputs.forEach(variable_decrement);
            variables.delete(variable);
          }
        });
      } while (variables.size);

      function postqueue(variable) {
        if (--variable._indegree === 0) {
          queue.push(variable);
        }
      }
    }

    // We want to give generators, if they’re defined synchronously, a chance to
    // update before computing downstream variables. This creates a synchronous
    // promise chain of the given depth that we’ll await before recomputing
    // downstream variables.
    function runtime_defer(depth = 0) {
      let p = Promise.resolve();
      for (let i = 0; i < depth; ++i) p = p.then(() => {});
      return p;
    }

    function variable_circular(variable) {
      const inputs = new Set(variable._inputs);
      for (const i of inputs) {
        if (i === variable) return true;
        i._inputs.forEach(inputs.add, inputs);
      }
      return false;
    }

    function variable_increment(variable) {
      ++variable._indegree;
    }

    function variable_decrement(variable) {
      --variable._indegree;
    }

    function variable_value(variable) {
      return variable._promise.catch(variable._rejector);
    }

    function variable_invalidator(variable) {
      return new Promise(function(resolve) {
        variable._invalidate = resolve;
      });
    }

    function variable_intersector(invalidation, variable) {
      let node = typeof IntersectionObserver === "function" && variable._observer && variable._observer._node;
      let visible = !node, resolve = noop, reject = noop, promise, observer;
      if (node) {
        observer = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting) && (promise = null, resolve()));
        observer.observe(node);
        invalidation.then(() => (observer.disconnect(), observer = null, reject()));
      }
      return function(value) {
        if (visible) return Promise.resolve(value);
        if (!observer) return Promise.reject();
        if (!promise) promise = new Promise((y, n) => (resolve = y, reject = n));
        return promise.then(() => value);
      };
    }

    function variable_compute(variable) {
      variable._invalidate();
      variable._invalidate = noop;
      variable._pending();

      const value0 = variable._value;
      const version = ++variable._version;

      // Lazily-constructed invalidation variable; only constructed if referenced as an input.
      let invalidation = null;

      // If the variable doesn’t have any inputs, we can optimize slightly.
      const promise = variable._promise = (variable._inputs.length
          ? Promise.all(variable._inputs.map(variable_value)).then(define)
          : new Promise(resolve => resolve(variable._definition.call(value0))))
        .then(generate);

      // Compute the initial value of the variable.
      function define(inputs) {
        if (variable._version !== version) return;

        // Replace any reference to invalidation with the promise, lazily.
        for (var i = 0, n = inputs.length; i < n; ++i) {
          switch (inputs[i]) {
            case variable_invalidation: {
              inputs[i] = invalidation = variable_invalidator(variable);
              break;
            }
            case variable_visibility: {
              if (!invalidation) invalidation = variable_invalidator(variable);
              inputs[i] = variable_intersector(invalidation, variable);
              break;
            }
          }
        }

        return variable._definition.apply(value0, inputs);
      }

      // If the value is a generator, then retrieve its first value, and dispose of
      // the generator if the variable is invalidated. Note that the cell may
      // already have been invalidated here, in which case we need to terminate the
      // generator immediately!
      function generate(value) {
        if (generatorish(value)) {
          if (variable._version !== version) return void value.return();
          (invalidation || variable_invalidator(variable)).then(variable_return(value));
          return variable_generate(variable, version, value);
        }
        return value;
      }

      promise.then((value) => {
        if (variable._version !== version) return;
        variable._value = value;
        variable._fulfilled(value);
      }, (error) => {
        if (variable._version !== version) return;
        variable._value = undefined;
        variable._rejected(error);
      });
    }

    function variable_generate(variable, version, generator) {
      const runtime = variable._module._runtime;

      // Retrieve the next value from the generator; if successful, invoke the
      // specified callback. The returned promise resolves to the yielded value, or
      // to undefined if the generator is done.
      function compute(onfulfilled) {
        return new Promise(resolve => resolve(generator.next())).then(({done, value}) => {
          return done ? undefined : Promise.resolve(value).then(onfulfilled);
        });
      }

      // Retrieve the next value from the generator; if successful, fulfill the
      // variable, compute downstream variables, and schedule the next value to be
      // pulled from the generator at the start of the next animation frame. If not
      // successful, reject the variable, compute downstream variables, and return.
      function recompute() {
        const promise = compute((value) => {
          if (variable._version !== version) return;
          postcompute(value, promise).then(() => runtime._precompute(recompute));
          variable._fulfilled(value);
          return value;
        });
        promise.catch((error) => {
          if (variable._version !== version) return;
          postcompute(undefined, promise);
          variable._rejected(error);
        });
      }

      // After the generator fulfills or rejects, set its current value, promise,
      // and schedule any downstream variables for update.
      function postcompute(value, promise) {
        variable._value = value;
        variable._promise = promise;
        variable._outputs.forEach(runtime._updates.add, runtime._updates);
        return runtime._compute();
      }

      // When retrieving the first value from the generator, the promise graph is
      // already established, so we only need to queue the next pull.
      return compute((value) => {
        if (variable._version !== version) return;
        runtime._precompute(recompute);
        return value;
      });
    }

    function variable_error(variable, error) {
      variable._invalidate();
      variable._invalidate = noop;
      variable._pending();
      ++variable._version;
      variable._indegree = NaN;
      (variable._promise = Promise.reject(error)).catch(noop);
      variable._value = undefined;
      variable._rejected(error);
    }

    function variable_return(generator) {
      return function() {
        generator.return();
      };
    }

    function variable_reachable(variable) {
      if (variable._observer !== no_observer) return true; // Directly reachable.
      var outputs = new Set(variable._outputs);
      for (const output of outputs) {
        if (output._observer !== no_observer) return true;
        output._outputs.forEach(outputs.add, outputs);
      }
      return false;
    }

    function window_global(name) {
      return window[name];
    }

    // Reserved word lists for various dialects of the language

    var reservedWords = {
      3: "abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile",
      5: "class enum extends super const export import",
      6: "enum",
      strict: "implements interface let package private protected public static yield",
      strictBind: "eval arguments"
    };

    // And the keywords

    var ecma5AndLessKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this";

    var keywords = {
      5: ecma5AndLessKeywords,
      "5module": ecma5AndLessKeywords + " export import",
      6: ecma5AndLessKeywords + " const class extends export import super"
    };

    var keywordRelationalOperator = /^in(stanceof)?$/;

    // ## Character categories

    // Big ugly regular expressions that match characters in the
    // whitespace, identifier, and identifier-start categories. These
    // are only applied when a character is found to actually have a
    // code point above 128.
    // Generated by `bin/generate-identifier-regex.js`.
    var nonASCIIidentifierStartChars = "\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u037f\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u052f\u0531-\u0556\u0559\u0560-\u0588\u05d0-\u05ea\u05ef-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u0860-\u086a\u08a0-\u08b4\u08b6-\u08c7\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u09fc\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0af9\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c39\u0c3d\u0c58-\u0c5a\u0c60\u0c61\u0c80\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d04-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d54-\u0d56\u0d5f-\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e86-\u0e8a\u0e8c-\u0ea3\u0ea5\u0ea7-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f5\u13f8-\u13fd\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f8\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1878\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191e\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1c80-\u1c88\u1c90-\u1cba\u1cbd-\u1cbf\u1ce9-\u1cec\u1cee-\u1cf3\u1cf5\u1cf6\u1cfa\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2118-\u211d\u2124\u2126\u2128\u212a-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309b-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312f\u3131-\u318e\u31a0-\u31bf\u31f0-\u31ff\u3400-\u4dbf\u4e00-\u9ffc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua69d\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua7bf\ua7c2-\ua7ca\ua7f5-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua8fd\ua8fe\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\ua9e0-\ua9e4\ua9e6-\ua9ef\ua9fa-\ua9fe\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa7e-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uab30-\uab5a\uab5c-\uab69\uab70-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc";
    var nonASCIIidentifierChars = "\u200c\u200d\xb7\u0300-\u036f\u0387\u0483-\u0487\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u0669\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7\u06e8\u06ea-\u06ed\u06f0-\u06f9\u0711\u0730-\u074a\u07a6-\u07b0\u07c0-\u07c9\u07eb-\u07f3\u07fd\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0859-\u085b\u08d3-\u08e1\u08e3-\u0903\u093a-\u093c\u093e-\u094f\u0951-\u0957\u0962\u0963\u0966-\u096f\u0981-\u0983\u09bc\u09be-\u09c4\u09c7\u09c8\u09cb-\u09cd\u09d7\u09e2\u09e3\u09e6-\u09ef\u09fe\u0a01-\u0a03\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a66-\u0a71\u0a75\u0a81-\u0a83\u0abc\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ae2\u0ae3\u0ae6-\u0aef\u0afa-\u0aff\u0b01-\u0b03\u0b3c\u0b3e-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b55-\u0b57\u0b62\u0b63\u0b66-\u0b6f\u0b82\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7\u0be6-\u0bef\u0c00-\u0c04\u0c3e-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0c66-\u0c6f\u0c81-\u0c83\u0cbc\u0cbe-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0ce6-\u0cef\u0d00-\u0d03\u0d3b\u0d3c\u0d3e-\u0d44\u0d46-\u0d48\u0d4a-\u0d4d\u0d57\u0d62\u0d63\u0d66-\u0d6f\u0d81-\u0d83\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0de6-\u0def\u0df2\u0df3\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0e50-\u0e59\u0eb1\u0eb4-\u0ebc\u0ec8-\u0ecd\u0ed0-\u0ed9\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e\u0f3f\u0f71-\u0f84\u0f86\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u102b-\u103e\u1040-\u1049\u1056-\u1059\u105e-\u1060\u1062-\u1064\u1067-\u106d\u1071-\u1074\u1082-\u108d\u108f-\u109d\u135d-\u135f\u1369-\u1371\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b4-\u17d3\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u18a9\u1920-\u192b\u1930-\u193b\u1946-\u194f\u19d0-\u19da\u1a17-\u1a1b\u1a55-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1ab0-\u1abd\u1abf\u1ac0\u1b00-\u1b04\u1b34-\u1b44\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1b82\u1ba1-\u1bad\u1bb0-\u1bb9\u1be6-\u1bf3\u1c24-\u1c37\u1c40-\u1c49\u1c50-\u1c59\u1cd0-\u1cd2\u1cd4-\u1ce8\u1ced\u1cf4\u1cf7-\u1cf9\u1dc0-\u1df9\u1dfb-\u1dff\u203f\u2040\u2054\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2cef-\u2cf1\u2d7f\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua620-\ua629\ua66f\ua674-\ua67d\ua69e\ua69f\ua6f0\ua6f1\ua802\ua806\ua80b\ua823-\ua827\ua82c\ua880\ua881\ua8b4-\ua8c5\ua8d0-\ua8d9\ua8e0-\ua8f1\ua8ff-\ua909\ua926-\ua92d\ua947-\ua953\ua980-\ua983\ua9b3-\ua9c0\ua9d0-\ua9d9\ua9e5\ua9f0-\ua9f9\uaa29-\uaa36\uaa43\uaa4c\uaa4d\uaa50-\uaa59\uaa7b-\uaa7d\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uaaeb-\uaaef\uaaf5\uaaf6\uabe3-\uabea\uabec\uabed\uabf0-\uabf9\ufb1e\ufe00-\ufe0f\ufe20-\ufe2f\ufe33\ufe34\ufe4d-\ufe4f\uff10-\uff19\uff3f";

    var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
    var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");

    nonASCIIidentifierStartChars = nonASCIIidentifierChars = null;

    // These are a run-length and offset encoded representation of the
    // >0xffff code points that are a valid part of identifiers. The
    // offset starts at 0x10000, and each pair of numbers represents an
    // offset to the next range, and then a size of the range. They were
    // generated by bin/generate-identifier-regex.js

    // eslint-disable-next-line comma-spacing
    var astralIdentifierStartCodes = [0,11,2,25,2,18,2,1,2,14,3,13,35,122,70,52,268,28,4,48,48,31,14,29,6,37,11,29,3,35,5,7,2,4,43,157,19,35,5,35,5,39,9,51,157,310,10,21,11,7,153,5,3,0,2,43,2,1,4,0,3,22,11,22,10,30,66,18,2,1,11,21,11,25,71,55,7,1,65,0,16,3,2,2,2,28,43,28,4,28,36,7,2,27,28,53,11,21,11,18,14,17,111,72,56,50,14,50,14,35,349,41,7,1,79,28,11,0,9,21,107,20,28,22,13,52,76,44,33,24,27,35,30,0,3,0,9,34,4,0,13,47,15,3,22,0,2,0,36,17,2,24,85,6,2,0,2,3,2,14,2,9,8,46,39,7,3,1,3,21,2,6,2,1,2,4,4,0,19,0,13,4,159,52,19,3,21,2,31,47,21,1,2,0,185,46,42,3,37,47,21,0,60,42,14,0,72,26,230,43,117,63,32,7,3,0,3,7,2,1,2,23,16,0,2,0,95,7,3,38,17,0,2,0,29,0,11,39,8,0,22,0,12,45,20,0,35,56,264,8,2,36,18,0,50,29,113,6,2,1,2,37,22,0,26,5,2,1,2,31,15,0,328,18,190,0,80,921,103,110,18,195,2749,1070,4050,582,8634,568,8,30,114,29,19,47,17,3,32,20,6,18,689,63,129,74,6,0,67,12,65,1,2,0,29,6135,9,1237,43,8,8952,286,50,2,18,3,9,395,2309,106,6,12,4,8,8,9,5991,84,2,70,2,1,3,0,3,1,3,3,2,11,2,0,2,6,2,64,2,3,3,7,2,6,2,27,2,3,2,4,2,0,4,6,2,339,3,24,2,24,2,30,2,24,2,30,2,24,2,30,2,24,2,30,2,24,2,7,2357,44,11,6,17,0,370,43,1301,196,60,67,8,0,1205,3,2,26,2,1,2,0,3,0,2,9,2,3,2,0,2,0,7,0,5,0,2,0,2,0,2,2,2,1,2,0,3,0,2,0,2,0,2,0,2,0,2,1,2,0,3,3,2,6,2,3,2,3,2,0,2,9,2,16,6,2,2,4,2,16,4421,42717,35,4148,12,221,3,5761,15,7472,3104,541,1507,4938];

    // eslint-disable-next-line comma-spacing
    var astralIdentifierCodes = [509,0,227,0,150,4,294,9,1368,2,2,1,6,3,41,2,5,0,166,1,574,3,9,9,370,1,154,10,176,2,54,14,32,9,16,3,46,10,54,9,7,2,37,13,2,9,6,1,45,0,13,2,49,13,9,3,2,11,83,11,7,0,161,11,6,9,7,3,56,1,2,6,3,1,3,2,10,0,11,1,3,6,4,4,193,17,10,9,5,0,82,19,13,9,214,6,3,8,28,1,83,16,16,9,82,12,9,9,84,14,5,9,243,14,166,9,71,5,2,1,3,3,2,0,2,1,13,9,120,6,3,6,4,0,29,9,41,6,2,3,9,0,10,10,47,15,406,7,2,7,17,9,57,21,2,13,123,5,4,0,2,1,2,6,2,0,9,9,49,4,2,1,2,4,9,9,330,3,19306,9,135,4,60,6,26,9,1014,0,2,54,8,3,82,0,12,1,19628,1,5319,4,4,5,9,7,3,6,31,3,149,2,1418,49,513,54,5,49,9,0,15,0,23,4,2,14,1361,6,2,16,3,6,2,1,2,4,262,6,10,9,419,13,1495,6,110,6,6,9,4759,9,787719,239];

    // This has a complexity linear to the value of the code. The
    // assumption is that looking up astral identifier characters is
    // rare.
    function isInAstralSet(code, set) {
      var pos = 0x10000;
      for (var i = 0; i < set.length; i += 2) {
        pos += set[i];
        if (pos > code) { return false }
        pos += set[i + 1];
        if (pos >= code) { return true }
      }
    }

    // Test whether a given character code starts an identifier.

    function isIdentifierStart(code, astral) {
      if (code < 65) { return code === 36 }
      if (code < 91) { return true }
      if (code < 97) { return code === 95 }
      if (code < 123) { return true }
      if (code <= 0xffff) { return code >= 0xaa && nonASCIIidentifierStart.test(String.fromCharCode(code)) }
      if (astral === false) { return false }
      return isInAstralSet(code, astralIdentifierStartCodes)
    }

    // Test whether a given character is part of an identifier.

    function isIdentifierChar(code, astral) {
      if (code < 48) { return code === 36 }
      if (code < 58) { return true }
      if (code < 65) { return false }
      if (code < 91) { return true }
      if (code < 97) { return code === 95 }
      if (code < 123) { return true }
      if (code <= 0xffff) { return code >= 0xaa && nonASCIIidentifier.test(String.fromCharCode(code)) }
      if (astral === false) { return false }
      return isInAstralSet(code, astralIdentifierStartCodes) || isInAstralSet(code, astralIdentifierCodes)
    }

    // ## Token types

    // The assignment of fine-grained, information-carrying type objects
    // allows the tokenizer to store the information it has about a
    // token in a way that is very cheap for the parser to look up.

    // All token type variables start with an underscore, to make them
    // easy to recognize.

    // The `beforeExpr` property is used to disambiguate between regular
    // expressions and divisions. It is set on all token types that can
    // be followed by an expression (thus, a slash after them would be a
    // regular expression).
    //
    // The `startsExpr` property is used to check if the token ends a
    // `yield` expression. It is set on all token types that either can
    // directly start an expression (like a quotation mark) or can
    // continue an expression (like the body of a string).
    //
    // `isLoop` marks a keyword as starting a loop, which is important
    // to know when parsing a label, in order to allow or disallow
    // continue jumps to that label.

    var TokenType = function TokenType(label, conf) {
      if ( conf === void 0 ) conf = {};

      this.label = label;
      this.keyword = conf.keyword;
      this.beforeExpr = !!conf.beforeExpr;
      this.startsExpr = !!conf.startsExpr;
      this.isLoop = !!conf.isLoop;
      this.isAssign = !!conf.isAssign;
      this.prefix = !!conf.prefix;
      this.postfix = !!conf.postfix;
      this.binop = conf.binop || null;
      this.updateContext = null;
    };

    function binop(name, prec) {
      return new TokenType(name, {beforeExpr: true, binop: prec})
    }
    var beforeExpr = {beforeExpr: true}, startsExpr = {startsExpr: true};

    // Map keyword names to token types.

    var keywords$1 = {};

    // Succinct definitions of keyword token types
    function kw(name, options) {
      if ( options === void 0 ) options = {};

      options.keyword = name;
      return keywords$1[name] = new TokenType(name, options)
    }

    var types = {
      num: new TokenType("num", startsExpr),
      regexp: new TokenType("regexp", startsExpr),
      string: new TokenType("string", startsExpr),
      name: new TokenType("name", startsExpr),
      eof: new TokenType("eof"),

      // Punctuation token types.
      bracketL: new TokenType("[", {beforeExpr: true, startsExpr: true}),
      bracketR: new TokenType("]"),
      braceL: new TokenType("{", {beforeExpr: true, startsExpr: true}),
      braceR: new TokenType("}"),
      parenL: new TokenType("(", {beforeExpr: true, startsExpr: true}),
      parenR: new TokenType(")"),
      comma: new TokenType(",", beforeExpr),
      semi: new TokenType(";", beforeExpr),
      colon: new TokenType(":", beforeExpr),
      dot: new TokenType("."),
      question: new TokenType("?", beforeExpr),
      questionDot: new TokenType("?."),
      arrow: new TokenType("=>", beforeExpr),
      template: new TokenType("template"),
      invalidTemplate: new TokenType("invalidTemplate"),
      ellipsis: new TokenType("...", beforeExpr),
      backQuote: new TokenType("`", startsExpr),
      dollarBraceL: new TokenType("${", {beforeExpr: true, startsExpr: true}),

      // Operators. These carry several kinds of properties to help the
      // parser use them properly (the presence of these properties is
      // what categorizes them as operators).
      //
      // `binop`, when present, specifies that this operator is a binary
      // operator, and will refer to its precedence.
      //
      // `prefix` and `postfix` mark the operator as a prefix or postfix
      // unary operator.
      //
      // `isAssign` marks all of `=`, `+=`, `-=` etcetera, which act as
      // binary operators with a very low precedence, that should result
      // in AssignmentExpression nodes.

      eq: new TokenType("=", {beforeExpr: true, isAssign: true}),
      assign: new TokenType("_=", {beforeExpr: true, isAssign: true}),
      incDec: new TokenType("++/--", {prefix: true, postfix: true, startsExpr: true}),
      prefix: new TokenType("!/~", {beforeExpr: true, prefix: true, startsExpr: true}),
      logicalOR: binop("||", 1),
      logicalAND: binop("&&", 2),
      bitwiseOR: binop("|", 3),
      bitwiseXOR: binop("^", 4),
      bitwiseAND: binop("&", 5),
      equality: binop("==/!=/===/!==", 6),
      relational: binop("</>/<=/>=", 7),
      bitShift: binop("<</>>/>>>", 8),
      plusMin: new TokenType("+/-", {beforeExpr: true, binop: 9, prefix: true, startsExpr: true}),
      modulo: binop("%", 10),
      star: binop("*", 10),
      slash: binop("/", 10),
      starstar: new TokenType("**", {beforeExpr: true}),
      coalesce: binop("??", 1),

      // Keyword token types.
      _break: kw("break"),
      _case: kw("case", beforeExpr),
      _catch: kw("catch"),
      _continue: kw("continue"),
      _debugger: kw("debugger"),
      _default: kw("default", beforeExpr),
      _do: kw("do", {isLoop: true, beforeExpr: true}),
      _else: kw("else", beforeExpr),
      _finally: kw("finally"),
      _for: kw("for", {isLoop: true}),
      _function: kw("function", startsExpr),
      _if: kw("if"),
      _return: kw("return", beforeExpr),
      _switch: kw("switch"),
      _throw: kw("throw", beforeExpr),
      _try: kw("try"),
      _var: kw("var"),
      _const: kw("const"),
      _while: kw("while", {isLoop: true}),
      _with: kw("with"),
      _new: kw("new", {beforeExpr: true, startsExpr: true}),
      _this: kw("this", startsExpr),
      _super: kw("super", startsExpr),
      _class: kw("class", startsExpr),
      _extends: kw("extends", beforeExpr),
      _export: kw("export"),
      _import: kw("import", startsExpr),
      _null: kw("null", startsExpr),
      _true: kw("true", startsExpr),
      _false: kw("false", startsExpr),
      _in: kw("in", {beforeExpr: true, binop: 7}),
      _instanceof: kw("instanceof", {beforeExpr: true, binop: 7}),
      _typeof: kw("typeof", {beforeExpr: true, prefix: true, startsExpr: true}),
      _void: kw("void", {beforeExpr: true, prefix: true, startsExpr: true}),
      _delete: kw("delete", {beforeExpr: true, prefix: true, startsExpr: true})
    };

    // Matches a whole line break (where CRLF is considered a single
    // line break). Used to count lines.

    var lineBreak = /\r\n?|\n|\u2028|\u2029/;
    var lineBreakG = new RegExp(lineBreak.source, "g");

    function isNewLine(code, ecma2019String) {
      return code === 10 || code === 13 || (!ecma2019String && (code === 0x2028 || code === 0x2029))
    }

    var nonASCIIwhitespace = /[\u1680\u2000-\u200a\u202f\u205f\u3000\ufeff]/;

    var skipWhiteSpace = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g;

    var ref = Object.prototype;
    var hasOwnProperty = ref.hasOwnProperty;
    var toString = ref.toString;

    // Checks if an object has a property.

    function has(obj, propName) {
      return hasOwnProperty.call(obj, propName)
    }

    var isArray = Array.isArray || (function (obj) { return (
      toString.call(obj) === "[object Array]"
    ); });

    function wordsRegexp(words) {
      return new RegExp("^(?:" + words.replace(/ /g, "|") + ")$")
    }

    // These are used when `options.locations` is on, for the
    // `startLoc` and `endLoc` properties.

    var Position = function Position(line, col) {
      this.line = line;
      this.column = col;
    };

    Position.prototype.offset = function offset (n) {
      return new Position(this.line, this.column + n)
    };

    var SourceLocation = function SourceLocation(p, start, end) {
      this.start = start;
      this.end = end;
      if (p.sourceFile !== null) { this.source = p.sourceFile; }
    };

    // The `getLineInfo` function is mostly useful when the
    // `locations` option is off (for performance reasons) and you
    // want to find the line/column position for a given character
    // offset. `input` should be the code string that the offset refers
    // into.

    function getLineInfo(input, offset) {
      for (var line = 1, cur = 0;;) {
        lineBreakG.lastIndex = cur;
        var match = lineBreakG.exec(input);
        if (match && match.index < offset) {
          ++line;
          cur = match.index + match[0].length;
        } else {
          return new Position(line, offset - cur)
        }
      }
    }

    // A second optional argument can be given to further configure
    // the parser process. These options are recognized:

    var defaultOptions = {
      // `ecmaVersion` indicates the ECMAScript version to parse. Must be
      // either 3, 5, 6 (2015), 7 (2016), 8 (2017), 9 (2018), or 10
      // (2019). This influences support for strict mode, the set of
      // reserved words, and support for new syntax features. The default
      // is 10.
      ecmaVersion: 10,
      // `sourceType` indicates the mode the code should be parsed in.
      // Can be either `"script"` or `"module"`. This influences global
      // strict mode and parsing of `import` and `export` declarations.
      sourceType: "script",
      // `onInsertedSemicolon` can be a callback that will be called
      // when a semicolon is automatically inserted. It will be passed
      // the position of the comma as an offset, and if `locations` is
      // enabled, it is given the location as a `{line, column}` object
      // as second argument.
      onInsertedSemicolon: null,
      // `onTrailingComma` is similar to `onInsertedSemicolon`, but for
      // trailing commas.
      onTrailingComma: null,
      // By default, reserved words are only enforced if ecmaVersion >= 5.
      // Set `allowReserved` to a boolean value to explicitly turn this on
      // an off. When this option has the value "never", reserved words
      // and keywords can also not be used as property names.
      allowReserved: null,
      // When enabled, a return at the top level is not considered an
      // error.
      allowReturnOutsideFunction: false,
      // When enabled, import/export statements are not constrained to
      // appearing at the top of the program.
      allowImportExportEverywhere: false,
      // When enabled, await identifiers are allowed to appear at the top-level scope,
      // but they are still not allowed in non-async functions.
      allowAwaitOutsideFunction: false,
      // When enabled, hashbang directive in the beginning of file
      // is allowed and treated as a line comment.
      allowHashBang: false,
      // When `locations` is on, `loc` properties holding objects with
      // `start` and `end` properties in `{line, column}` form (with
      // line being 1-based and column 0-based) will be attached to the
      // nodes.
      locations: false,
      // A function can be passed as `onToken` option, which will
      // cause Acorn to call that function with object in the same
      // format as tokens returned from `tokenizer().getToken()`. Note
      // that you are not allowed to call the parser from the
      // callback—that will corrupt its internal state.
      onToken: null,
      // A function can be passed as `onComment` option, which will
      // cause Acorn to call that function with `(block, text, start,
      // end)` parameters whenever a comment is skipped. `block` is a
      // boolean indicating whether this is a block (`/* */`) comment,
      // `text` is the content of the comment, and `start` and `end` are
      // character offsets that denote the start and end of the comment.
      // When the `locations` option is on, two more parameters are
      // passed, the full `{line, column}` locations of the start and
      // end of the comments. Note that you are not allowed to call the
      // parser from the callback—that will corrupt its internal state.
      onComment: null,
      // Nodes have their start and end characters offsets recorded in
      // `start` and `end` properties (directly on the node, rather than
      // the `loc` object, which holds line/column data. To also add a
      // [semi-standardized][range] `range` property holding a `[start,
      // end]` array with the same numbers, set the `ranges` option to
      // `true`.
      //
      // [range]: https://bugzilla.mozilla.org/show_bug.cgi?id=745678
      ranges: false,
      // It is possible to parse multiple files into a single AST by
      // passing the tree produced by parsing the first file as
      // `program` option in subsequent parses. This will add the
      // toplevel forms of the parsed file to the `Program` (top) node
      // of an existing parse tree.
      program: null,
      // When `locations` is on, you can pass this to record the source
      // file in every node's `loc` object.
      sourceFile: null,
      // This value, if given, is stored in every node, whether
      // `locations` is on or off.
      directSourceFile: null,
      // When enabled, parenthesized expressions are represented by
      // (non-standard) ParenthesizedExpression nodes
      preserveParens: false
    };

    // Interpret and default an options object

    function getOptions(opts) {
      var options = {};

      for (var opt in defaultOptions)
        { options[opt] = opts && has(opts, opt) ? opts[opt] : defaultOptions[opt]; }

      if (options.ecmaVersion >= 2015)
        { options.ecmaVersion -= 2009; }

      if (options.allowReserved == null)
        { options.allowReserved = options.ecmaVersion < 5; }

      if (isArray(options.onToken)) {
        var tokens = options.onToken;
        options.onToken = function (token) { return tokens.push(token); };
      }
      if (isArray(options.onComment))
        { options.onComment = pushComment(options, options.onComment); }

      return options
    }

    function pushComment(options, array) {
      return function(block, text, start, end, startLoc, endLoc) {
        var comment = {
          type: block ? "Block" : "Line",
          value: text,
          start: start,
          end: end
        };
        if (options.locations)
          { comment.loc = new SourceLocation(this, startLoc, endLoc); }
        if (options.ranges)
          { comment.range = [start, end]; }
        array.push(comment);
      }
    }

    // Each scope gets a bitset that may contain these flags
    var
        SCOPE_TOP = 1,
        SCOPE_FUNCTION$1 = 2,
        SCOPE_VAR = SCOPE_TOP | SCOPE_FUNCTION$1,
        SCOPE_ASYNC$1 = 4,
        SCOPE_GENERATOR$1 = 8,
        SCOPE_ARROW = 16,
        SCOPE_SIMPLE_CATCH = 32,
        SCOPE_SUPER = 64,
        SCOPE_DIRECT_SUPER = 128;

    function functionFlags(async, generator) {
      return SCOPE_FUNCTION$1 | (async ? SCOPE_ASYNC$1 : 0) | (generator ? SCOPE_GENERATOR$1 : 0)
    }

    // Used in checkLVal and declareName to determine the type of a binding
    var
        BIND_NONE = 0, // Not a binding
        BIND_VAR = 1, // Var-style binding
        BIND_LEXICAL = 2, // Let- or const-style binding
        BIND_FUNCTION = 3, // Function declaration
        BIND_SIMPLE_CATCH = 4, // Simple (identifier pattern) catch binding
        BIND_OUTSIDE = 5; // Special case for function names as bound inside the function

    var Parser$1 = function Parser(options, input, startPos) {
      this.options = options = getOptions(options);
      this.sourceFile = options.sourceFile;
      this.keywords = wordsRegexp(keywords[options.ecmaVersion >= 6 ? 6 : options.sourceType === "module" ? "5module" : 5]);
      var reserved = "";
      if (options.allowReserved !== true) {
        for (var v = options.ecmaVersion;; v--)
          { if (reserved = reservedWords[v]) { break } }
        if (options.sourceType === "module") { reserved += " await"; }
      }
      this.reservedWords = wordsRegexp(reserved);
      var reservedStrict = (reserved ? reserved + " " : "") + reservedWords.strict;
      this.reservedWordsStrict = wordsRegexp(reservedStrict);
      this.reservedWordsStrictBind = wordsRegexp(reservedStrict + " " + reservedWords.strictBind);
      this.input = String(input);

      // Used to signal to callers of `readWord1` whether the word
      // contained any escape sequences. This is needed because words with
      // escape sequences must not be interpreted as keywords.
      this.containsEsc = false;

      // Set up token state

      // The current position of the tokenizer in the input.
      if (startPos) {
        this.pos = startPos;
        this.lineStart = this.input.lastIndexOf("\n", startPos - 1) + 1;
        this.curLine = this.input.slice(0, this.lineStart).split(lineBreak).length;
      } else {
        this.pos = this.lineStart = 0;
        this.curLine = 1;
      }

      // Properties of the current token:
      // Its type
      this.type = types.eof;
      // For tokens that include more information than their type, the value
      this.value = null;
      // Its start and end offset
      this.start = this.end = this.pos;
      // And, if locations are used, the {line, column} object
      // corresponding to those offsets
      this.startLoc = this.endLoc = this.curPosition();

      // Position information for the previous token
      this.lastTokEndLoc = this.lastTokStartLoc = null;
      this.lastTokStart = this.lastTokEnd = this.pos;

      // The context stack is used to superficially track syntactic
      // context to predict whether a regular expression is allowed in a
      // given position.
      this.context = this.initialContext();
      this.exprAllowed = true;

      // Figure out if it's a module code.
      this.inModule = options.sourceType === "module";
      this.strict = this.inModule || this.strictDirective(this.pos);

      // Used to signify the start of a potential arrow function
      this.potentialArrowAt = -1;

      // Positions to delayed-check that yield/await does not exist in default parameters.
      this.yieldPos = this.awaitPos = this.awaitIdentPos = 0;
      // Labels in scope.
      this.labels = [];
      // Thus-far undefined exports.
      this.undefinedExports = {};

      // If enabled, skip leading hashbang line.
      if (this.pos === 0 && options.allowHashBang && this.input.slice(0, 2) === "#!")
        { this.skipLineComment(2); }

      // Scope tracking for duplicate variable names (see scope.js)
      this.scopeStack = [];
      this.enterScope(SCOPE_TOP);

      // For RegExp validation
      this.regexpState = null;
    };

    var prototypeAccessors = { inFunction: { configurable: true },inGenerator: { configurable: true },inAsync: { configurable: true },allowSuper: { configurable: true },allowDirectSuper: { configurable: true },treatFunctionsAsVar: { configurable: true } };

    Parser$1.prototype.parse = function parse () {
      var node = this.options.program || this.startNode();
      this.nextToken();
      return this.parseTopLevel(node)
    };

    prototypeAccessors.inFunction.get = function () { return (this.currentVarScope().flags & SCOPE_FUNCTION$1) > 0 };
    prototypeAccessors.inGenerator.get = function () { return (this.currentVarScope().flags & SCOPE_GENERATOR$1) > 0 };
    prototypeAccessors.inAsync.get = function () { return (this.currentVarScope().flags & SCOPE_ASYNC$1) > 0 };
    prototypeAccessors.allowSuper.get = function () { return (this.currentThisScope().flags & SCOPE_SUPER) > 0 };
    prototypeAccessors.allowDirectSuper.get = function () { return (this.currentThisScope().flags & SCOPE_DIRECT_SUPER) > 0 };
    prototypeAccessors.treatFunctionsAsVar.get = function () { return this.treatFunctionsAsVarInScope(this.currentScope()) };

    // Switch to a getter for 7.0.0.
    Parser$1.prototype.inNonArrowFunction = function inNonArrowFunction () { return (this.currentThisScope().flags & SCOPE_FUNCTION$1) > 0 };

    Parser$1.extend = function extend () {
        var plugins = [], len = arguments.length;
        while ( len-- ) plugins[ len ] = arguments[ len ];

      var cls = this;
      for (var i = 0; i < plugins.length; i++) { cls = plugins[i](cls); }
      return cls
    };

    Parser$1.parse = function parse (input, options) {
      return new this(options, input).parse()
    };

    Parser$1.parseExpressionAt = function parseExpressionAt (input, pos, options) {
      var parser = new this(options, input, pos);
      parser.nextToken();
      return parser.parseExpression()
    };

    Parser$1.tokenizer = function tokenizer (input, options) {
      return new this(options, input)
    };

    Object.defineProperties( Parser$1.prototype, prototypeAccessors );

    var pp = Parser$1.prototype;

    // ## Parser utilities

    var literal = /^(?:'((?:\\.|[^'\\])*?)'|"((?:\\.|[^"\\])*?)")/;
    pp.strictDirective = function(start) {
      for (;;) {
        // Try to find string literal.
        skipWhiteSpace.lastIndex = start;
        start += skipWhiteSpace.exec(this.input)[0].length;
        var match = literal.exec(this.input.slice(start));
        if (!match) { return false }
        if ((match[1] || match[2]) === "use strict") {
          skipWhiteSpace.lastIndex = start + match[0].length;
          var spaceAfter = skipWhiteSpace.exec(this.input), end = spaceAfter.index + spaceAfter[0].length;
          var next = this.input.charAt(end);
          return next === ";" || next === "}" ||
            (lineBreak.test(spaceAfter[0]) &&
             !(/[(`.[+\-/*%<>=,?^&]/.test(next) || next === "!" && this.input.charAt(end + 1) === "="))
        }
        start += match[0].length;

        // Skip semicolon, if any.
        skipWhiteSpace.lastIndex = start;
        start += skipWhiteSpace.exec(this.input)[0].length;
        if (this.input[start] === ";")
          { start++; }
      }
    };

    // Predicate that tests whether the next token is of the given
    // type, and if yes, consumes it as a side effect.

    pp.eat = function(type) {
      if (this.type === type) {
        this.next();
        return true
      } else {
        return false
      }
    };

    // Tests whether parsed token is a contextual keyword.

    pp.isContextual = function(name) {
      return this.type === types.name && this.value === name && !this.containsEsc
    };

    // Consumes contextual keyword if possible.

    pp.eatContextual = function(name) {
      if (!this.isContextual(name)) { return false }
      this.next();
      return true
    };

    // Asserts that following token is given contextual keyword.

    pp.expectContextual = function(name) {
      if (!this.eatContextual(name)) { this.unexpected(); }
    };

    // Test whether a semicolon can be inserted at the current position.

    pp.canInsertSemicolon = function() {
      return this.type === types.eof ||
        this.type === types.braceR ||
        lineBreak.test(this.input.slice(this.lastTokEnd, this.start))
    };

    pp.insertSemicolon = function() {
      if (this.canInsertSemicolon()) {
        if (this.options.onInsertedSemicolon)
          { this.options.onInsertedSemicolon(this.lastTokEnd, this.lastTokEndLoc); }
        return true
      }
    };

    // Consume a semicolon, or, failing that, see if we are allowed to
    // pretend that there is a semicolon at this position.

    pp.semicolon = function() {
      if (!this.eat(types.semi) && !this.insertSemicolon()) { this.unexpected(); }
    };

    pp.afterTrailingComma = function(tokType, notNext) {
      if (this.type === tokType) {
        if (this.options.onTrailingComma)
          { this.options.onTrailingComma(this.lastTokStart, this.lastTokStartLoc); }
        if (!notNext)
          { this.next(); }
        return true
      }
    };

    // Expect a token of a given type. If found, consume it, otherwise,
    // raise an unexpected token error.

    pp.expect = function(type) {
      this.eat(type) || this.unexpected();
    };

    // Raise an unexpected token error.

    pp.unexpected = function(pos) {
      this.raise(pos != null ? pos : this.start, "Unexpected token");
    };

    function DestructuringErrors() {
      this.shorthandAssign =
      this.trailingComma =
      this.parenthesizedAssign =
      this.parenthesizedBind =
      this.doubleProto =
        -1;
    }

    pp.checkPatternErrors = function(refDestructuringErrors, isAssign) {
      if (!refDestructuringErrors) { return }
      if (refDestructuringErrors.trailingComma > -1)
        { this.raiseRecoverable(refDestructuringErrors.trailingComma, "Comma is not permitted after the rest element"); }
      var parens = isAssign ? refDestructuringErrors.parenthesizedAssign : refDestructuringErrors.parenthesizedBind;
      if (parens > -1) { this.raiseRecoverable(parens, "Parenthesized pattern"); }
    };

    pp.checkExpressionErrors = function(refDestructuringErrors, andThrow) {
      if (!refDestructuringErrors) { return false }
      var shorthandAssign = refDestructuringErrors.shorthandAssign;
      var doubleProto = refDestructuringErrors.doubleProto;
      if (!andThrow) { return shorthandAssign >= 0 || doubleProto >= 0 }
      if (shorthandAssign >= 0)
        { this.raise(shorthandAssign, "Shorthand property assignments are valid only in destructuring patterns"); }
      if (doubleProto >= 0)
        { this.raiseRecoverable(doubleProto, "Redefinition of __proto__ property"); }
    };

    pp.checkYieldAwaitInDefaultParams = function() {
      if (this.yieldPos && (!this.awaitPos || this.yieldPos < this.awaitPos))
        { this.raise(this.yieldPos, "Yield expression cannot be a default value"); }
      if (this.awaitPos)
        { this.raise(this.awaitPos, "Await expression cannot be a default value"); }
    };

    pp.isSimpleAssignTarget = function(expr) {
      if (expr.type === "ParenthesizedExpression")
        { return this.isSimpleAssignTarget(expr.expression) }
      return expr.type === "Identifier" || expr.type === "MemberExpression"
    };

    var pp$1 = Parser$1.prototype;

    // ### Statement parsing

    // Parse a program. Initializes the parser, reads any number of
    // statements, and wraps them in a Program node.  Optionally takes a
    // `program` argument.  If present, the statements will be appended
    // to its body instead of creating a new node.

    pp$1.parseTopLevel = function(node) {
      var exports = {};
      if (!node.body) { node.body = []; }
      while (this.type !== types.eof) {
        var stmt = this.parseStatement(null, true, exports);
        node.body.push(stmt);
      }
      if (this.inModule)
        { for (var i = 0, list = Object.keys(this.undefinedExports); i < list.length; i += 1)
          {
            var name = list[i];

            this.raiseRecoverable(this.undefinedExports[name].start, ("Export '" + name + "' is not defined"));
          } }
      this.adaptDirectivePrologue(node.body);
      this.next();
      node.sourceType = this.options.sourceType;
      return this.finishNode(node, "Program")
    };

    var loopLabel = {kind: "loop"}, switchLabel = {kind: "switch"};

    pp$1.isLet = function(context) {
      if (this.options.ecmaVersion < 6 || !this.isContextual("let")) { return false }
      skipWhiteSpace.lastIndex = this.pos;
      var skip = skipWhiteSpace.exec(this.input);
      var next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next);
      // For ambiguous cases, determine if a LexicalDeclaration (or only a
      // Statement) is allowed here. If context is not empty then only a Statement
      // is allowed. However, `let [` is an explicit negative lookahead for
      // ExpressionStatement, so special-case it first.
      if (nextCh === 91) { return true } // '['
      if (context) { return false }

      if (nextCh === 123) { return true } // '{'
      if (isIdentifierStart(nextCh, true)) {
        var pos = next + 1;
        while (isIdentifierChar(this.input.charCodeAt(pos), true)) { ++pos; }
        var ident = this.input.slice(next, pos);
        if (!keywordRelationalOperator.test(ident)) { return true }
      }
      return false
    };

    // check 'async [no LineTerminator here] function'
    // - 'async /*foo*/ function' is OK.
    // - 'async /*\n*/ function' is invalid.
    pp$1.isAsyncFunction = function() {
      if (this.options.ecmaVersion < 8 || !this.isContextual("async"))
        { return false }

      skipWhiteSpace.lastIndex = this.pos;
      var skip = skipWhiteSpace.exec(this.input);
      var next = this.pos + skip[0].length;
      return !lineBreak.test(this.input.slice(this.pos, next)) &&
        this.input.slice(next, next + 8) === "function" &&
        (next + 8 === this.input.length || !isIdentifierChar(this.input.charAt(next + 8)))
    };

    // Parse a single statement.
    //
    // If expecting a statement and finding a slash operator, parse a
    // regular expression literal. This is to handle cases like
    // `if (foo) /blah/.exec(foo)`, where looking at the previous token
    // does not help.

    pp$1.parseStatement = function(context, topLevel, exports) {
      var starttype = this.type, node = this.startNode(), kind;

      if (this.isLet(context)) {
        starttype = types._var;
        kind = "let";
      }

      // Most types of statements are recognized by the keyword they
      // start with. Many are trivial to parse, some require a bit of
      // complexity.

      switch (starttype) {
      case types._break: case types._continue: return this.parseBreakContinueStatement(node, starttype.keyword)
      case types._debugger: return this.parseDebuggerStatement(node)
      case types._do: return this.parseDoStatement(node)
      case types._for: return this.parseForStatement(node)
      case types._function:
        // Function as sole body of either an if statement or a labeled statement
        // works, but not when it is part of a labeled statement that is the sole
        // body of an if statement.
        if ((context && (this.strict || context !== "if" && context !== "label")) && this.options.ecmaVersion >= 6) { this.unexpected(); }
        return this.parseFunctionStatement(node, false, !context)
      case types._class:
        if (context) { this.unexpected(); }
        return this.parseClass(node, true)
      case types._if: return this.parseIfStatement(node)
      case types._return: return this.parseReturnStatement(node)
      case types._switch: return this.parseSwitchStatement(node)
      case types._throw: return this.parseThrowStatement(node)
      case types._try: return this.parseTryStatement(node)
      case types._const: case types._var:
        kind = kind || this.value;
        if (context && kind !== "var") { this.unexpected(); }
        return this.parseVarStatement(node, kind)
      case types._while: return this.parseWhileStatement(node)
      case types._with: return this.parseWithStatement(node)
      case types.braceL: return this.parseBlock(true, node)
      case types.semi: return this.parseEmptyStatement(node)
      case types._export:
      case types._import:
        if (this.options.ecmaVersion > 10 && starttype === types._import) {
          skipWhiteSpace.lastIndex = this.pos;
          var skip = skipWhiteSpace.exec(this.input);
          var next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next);
          if (nextCh === 40 || nextCh === 46) // '(' or '.'
            { return this.parseExpressionStatement(node, this.parseExpression()) }
        }

        if (!this.options.allowImportExportEverywhere) {
          if (!topLevel)
            { this.raise(this.start, "'import' and 'export' may only appear at the top level"); }
          if (!this.inModule)
            { this.raise(this.start, "'import' and 'export' may appear only with 'sourceType: module'"); }
        }
        return starttype === types._import ? this.parseImport(node) : this.parseExport(node, exports)

        // If the statement does not start with a statement keyword or a
        // brace, it's an ExpressionStatement or LabeledStatement. We
        // simply start parsing an expression, and afterwards, if the
        // next token is a colon and the expression was a simple
        // Identifier node, we switch to interpreting it as a label.
      default:
        if (this.isAsyncFunction()) {
          if (context) { this.unexpected(); }
          this.next();
          return this.parseFunctionStatement(node, true, !context)
        }

        var maybeName = this.value, expr = this.parseExpression();
        if (starttype === types.name && expr.type === "Identifier" && this.eat(types.colon))
          { return this.parseLabeledStatement(node, maybeName, expr, context) }
        else { return this.parseExpressionStatement(node, expr) }
      }
    };

    pp$1.parseBreakContinueStatement = function(node, keyword) {
      var isBreak = keyword === "break";
      this.next();
      if (this.eat(types.semi) || this.insertSemicolon()) { node.label = null; }
      else if (this.type !== types.name) { this.unexpected(); }
      else {
        node.label = this.parseIdent();
        this.semicolon();
      }

      // Verify that there is an actual destination to break or
      // continue to.
      var i = 0;
      for (; i < this.labels.length; ++i) {
        var lab = this.labels[i];
        if (node.label == null || lab.name === node.label.name) {
          if (lab.kind != null && (isBreak || lab.kind === "loop")) { break }
          if (node.label && isBreak) { break }
        }
      }
      if (i === this.labels.length) { this.raise(node.start, "Unsyntactic " + keyword); }
      return this.finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement")
    };

    pp$1.parseDebuggerStatement = function(node) {
      this.next();
      this.semicolon();
      return this.finishNode(node, "DebuggerStatement")
    };

    pp$1.parseDoStatement = function(node) {
      this.next();
      this.labels.push(loopLabel);
      node.body = this.parseStatement("do");
      this.labels.pop();
      this.expect(types._while);
      node.test = this.parseParenExpression();
      if (this.options.ecmaVersion >= 6)
        { this.eat(types.semi); }
      else
        { this.semicolon(); }
      return this.finishNode(node, "DoWhileStatement")
    };

    // Disambiguating between a `for` and a `for`/`in` or `for`/`of`
    // loop is non-trivial. Basically, we have to parse the init `var`
    // statement or expression, disallowing the `in` operator (see
    // the second parameter to `parseExpression`), and then check
    // whether the next token is `in` or `of`. When there is no init
    // part (semicolon immediately after the opening parenthesis), it
    // is a regular `for` loop.

    pp$1.parseForStatement = function(node) {
      this.next();
      var awaitAt = (this.options.ecmaVersion >= 9 && (this.inAsync || (!this.inFunction && this.options.allowAwaitOutsideFunction)) && this.eatContextual("await")) ? this.lastTokStart : -1;
      this.labels.push(loopLabel);
      this.enterScope(0);
      this.expect(types.parenL);
      if (this.type === types.semi) {
        if (awaitAt > -1) { this.unexpected(awaitAt); }
        return this.parseFor(node, null)
      }
      var isLet = this.isLet();
      if (this.type === types._var || this.type === types._const || isLet) {
        var init$1 = this.startNode(), kind = isLet ? "let" : this.value;
        this.next();
        this.parseVar(init$1, true, kind);
        this.finishNode(init$1, "VariableDeclaration");
        if ((this.type === types._in || (this.options.ecmaVersion >= 6 && this.isContextual("of"))) && init$1.declarations.length === 1) {
          if (this.options.ecmaVersion >= 9) {
            if (this.type === types._in) {
              if (awaitAt > -1) { this.unexpected(awaitAt); }
            } else { node.await = awaitAt > -1; }
          }
          return this.parseForIn(node, init$1)
        }
        if (awaitAt > -1) { this.unexpected(awaitAt); }
        return this.parseFor(node, init$1)
      }
      var refDestructuringErrors = new DestructuringErrors;
      var init = this.parseExpression(true, refDestructuringErrors);
      if (this.type === types._in || (this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
        if (this.options.ecmaVersion >= 9) {
          if (this.type === types._in) {
            if (awaitAt > -1) { this.unexpected(awaitAt); }
          } else { node.await = awaitAt > -1; }
        }
        this.toAssignable(init, false, refDestructuringErrors);
        this.checkLVal(init);
        return this.parseForIn(node, init)
      } else {
        this.checkExpressionErrors(refDestructuringErrors, true);
      }
      if (awaitAt > -1) { this.unexpected(awaitAt); }
      return this.parseFor(node, init)
    };

    pp$1.parseFunctionStatement = function(node, isAsync, declarationPosition) {
      this.next();
      return this.parseFunction(node, FUNC_STATEMENT | (declarationPosition ? 0 : FUNC_HANGING_STATEMENT), false, isAsync)
    };

    pp$1.parseIfStatement = function(node) {
      this.next();
      node.test = this.parseParenExpression();
      // allow function declarations in branches, but only in non-strict mode
      node.consequent = this.parseStatement("if");
      node.alternate = this.eat(types._else) ? this.parseStatement("if") : null;
      return this.finishNode(node, "IfStatement")
    };

    pp$1.parseReturnStatement = function(node) {
      if (!this.inFunction && !this.options.allowReturnOutsideFunction)
        { this.raise(this.start, "'return' outside of function"); }
      this.next();

      // In `return` (and `break`/`continue`), the keywords with
      // optional arguments, we eagerly look for a semicolon or the
      // possibility to insert one.

      if (this.eat(types.semi) || this.insertSemicolon()) { node.argument = null; }
      else { node.argument = this.parseExpression(); this.semicolon(); }
      return this.finishNode(node, "ReturnStatement")
    };

    pp$1.parseSwitchStatement = function(node) {
      this.next();
      node.discriminant = this.parseParenExpression();
      node.cases = [];
      this.expect(types.braceL);
      this.labels.push(switchLabel);
      this.enterScope(0);

      // Statements under must be grouped (by label) in SwitchCase
      // nodes. `cur` is used to keep the node that we are currently
      // adding statements to.

      var cur;
      for (var sawDefault = false; this.type !== types.braceR;) {
        if (this.type === types._case || this.type === types._default) {
          var isCase = this.type === types._case;
          if (cur) { this.finishNode(cur, "SwitchCase"); }
          node.cases.push(cur = this.startNode());
          cur.consequent = [];
          this.next();
          if (isCase) {
            cur.test = this.parseExpression();
          } else {
            if (sawDefault) { this.raiseRecoverable(this.lastTokStart, "Multiple default clauses"); }
            sawDefault = true;
            cur.test = null;
          }
          this.expect(types.colon);
        } else {
          if (!cur) { this.unexpected(); }
          cur.consequent.push(this.parseStatement(null));
        }
      }
      this.exitScope();
      if (cur) { this.finishNode(cur, "SwitchCase"); }
      this.next(); // Closing brace
      this.labels.pop();
      return this.finishNode(node, "SwitchStatement")
    };

    pp$1.parseThrowStatement = function(node) {
      this.next();
      if (lineBreak.test(this.input.slice(this.lastTokEnd, this.start)))
        { this.raise(this.lastTokEnd, "Illegal newline after throw"); }
      node.argument = this.parseExpression();
      this.semicolon();
      return this.finishNode(node, "ThrowStatement")
    };

    // Reused empty array added for node fields that are always empty.

    var empty = [];

    pp$1.parseTryStatement = function(node) {
      this.next();
      node.block = this.parseBlock();
      node.handler = null;
      if (this.type === types._catch) {
        var clause = this.startNode();
        this.next();
        if (this.eat(types.parenL)) {
          clause.param = this.parseBindingAtom();
          var simple = clause.param.type === "Identifier";
          this.enterScope(simple ? SCOPE_SIMPLE_CATCH : 0);
          this.checkLVal(clause.param, simple ? BIND_SIMPLE_CATCH : BIND_LEXICAL);
          this.expect(types.parenR);
        } else {
          if (this.options.ecmaVersion < 10) { this.unexpected(); }
          clause.param = null;
          this.enterScope(0);
        }
        clause.body = this.parseBlock(false);
        this.exitScope();
        node.handler = this.finishNode(clause, "CatchClause");
      }
      node.finalizer = this.eat(types._finally) ? this.parseBlock() : null;
      if (!node.handler && !node.finalizer)
        { this.raise(node.start, "Missing catch or finally clause"); }
      return this.finishNode(node, "TryStatement")
    };

    pp$1.parseVarStatement = function(node, kind) {
      this.next();
      this.parseVar(node, false, kind);
      this.semicolon();
      return this.finishNode(node, "VariableDeclaration")
    };

    pp$1.parseWhileStatement = function(node) {
      this.next();
      node.test = this.parseParenExpression();
      this.labels.push(loopLabel);
      node.body = this.parseStatement("while");
      this.labels.pop();
      return this.finishNode(node, "WhileStatement")
    };

    pp$1.parseWithStatement = function(node) {
      if (this.strict) { this.raise(this.start, "'with' in strict mode"); }
      this.next();
      node.object = this.parseParenExpression();
      node.body = this.parseStatement("with");
      return this.finishNode(node, "WithStatement")
    };

    pp$1.parseEmptyStatement = function(node) {
      this.next();
      return this.finishNode(node, "EmptyStatement")
    };

    pp$1.parseLabeledStatement = function(node, maybeName, expr, context) {
      for (var i$1 = 0, list = this.labels; i$1 < list.length; i$1 += 1)
        {
        var label = list[i$1];

        if (label.name === maybeName)
          { this.raise(expr.start, "Label '" + maybeName + "' is already declared");
      } }
      var kind = this.type.isLoop ? "loop" : this.type === types._switch ? "switch" : null;
      for (var i = this.labels.length - 1; i >= 0; i--) {
        var label$1 = this.labels[i];
        if (label$1.statementStart === node.start) {
          // Update information about previous labels on this node
          label$1.statementStart = this.start;
          label$1.kind = kind;
        } else { break }
      }
      this.labels.push({name: maybeName, kind: kind, statementStart: this.start});
      node.body = this.parseStatement(context ? context.indexOf("label") === -1 ? context + "label" : context : "label");
      this.labels.pop();
      node.label = expr;
      return this.finishNode(node, "LabeledStatement")
    };

    pp$1.parseExpressionStatement = function(node, expr) {
      node.expression = expr;
      this.semicolon();
      return this.finishNode(node, "ExpressionStatement")
    };

    // Parse a semicolon-enclosed block of statements, handling `"use
    // strict"` declarations when `allowStrict` is true (used for
    // function bodies).

    pp$1.parseBlock = function(createNewLexicalScope, node, exitStrict) {
      if ( createNewLexicalScope === void 0 ) createNewLexicalScope = true;
      if ( node === void 0 ) node = this.startNode();

      node.body = [];
      this.expect(types.braceL);
      if (createNewLexicalScope) { this.enterScope(0); }
      while (this.type !== types.braceR) {
        var stmt = this.parseStatement(null);
        node.body.push(stmt);
      }
      if (exitStrict) { this.strict = false; }
      this.next();
      if (createNewLexicalScope) { this.exitScope(); }
      return this.finishNode(node, "BlockStatement")
    };

    // Parse a regular `for` loop. The disambiguation code in
    // `parseStatement` will already have parsed the init statement or
    // expression.

    pp$1.parseFor = function(node, init) {
      node.init = init;
      this.expect(types.semi);
      node.test = this.type === types.semi ? null : this.parseExpression();
      this.expect(types.semi);
      node.update = this.type === types.parenR ? null : this.parseExpression();
      this.expect(types.parenR);
      node.body = this.parseStatement("for");
      this.exitScope();
      this.labels.pop();
      return this.finishNode(node, "ForStatement")
    };

    // Parse a `for`/`in` and `for`/`of` loop, which are almost
    // same from parser's perspective.

    pp$1.parseForIn = function(node, init) {
      var isForIn = this.type === types._in;
      this.next();

      if (
        init.type === "VariableDeclaration" &&
        init.declarations[0].init != null &&
        (
          !isForIn ||
          this.options.ecmaVersion < 8 ||
          this.strict ||
          init.kind !== "var" ||
          init.declarations[0].id.type !== "Identifier"
        )
      ) {
        this.raise(
          init.start,
          ((isForIn ? "for-in" : "for-of") + " loop variable declaration may not have an initializer")
        );
      } else if (init.type === "AssignmentPattern") {
        this.raise(init.start, "Invalid left-hand side in for-loop");
      }
      node.left = init;
      node.right = isForIn ? this.parseExpression() : this.parseMaybeAssign();
      this.expect(types.parenR);
      node.body = this.parseStatement("for");
      this.exitScope();
      this.labels.pop();
      return this.finishNode(node, isForIn ? "ForInStatement" : "ForOfStatement")
    };

    // Parse a list of variable declarations.

    pp$1.parseVar = function(node, isFor, kind) {
      node.declarations = [];
      node.kind = kind;
      for (;;) {
        var decl = this.startNode();
        this.parseVarId(decl, kind);
        if (this.eat(types.eq)) {
          decl.init = this.parseMaybeAssign(isFor);
        } else if (kind === "const" && !(this.type === types._in || (this.options.ecmaVersion >= 6 && this.isContextual("of")))) {
          this.unexpected();
        } else if (decl.id.type !== "Identifier" && !(isFor && (this.type === types._in || this.isContextual("of")))) {
          this.raise(this.lastTokEnd, "Complex binding patterns require an initialization value");
        } else {
          decl.init = null;
        }
        node.declarations.push(this.finishNode(decl, "VariableDeclarator"));
        if (!this.eat(types.comma)) { break }
      }
      return node
    };

    pp$1.parseVarId = function(decl, kind) {
      decl.id = this.parseBindingAtom();
      this.checkLVal(decl.id, kind === "var" ? BIND_VAR : BIND_LEXICAL, false);
    };

    var FUNC_STATEMENT = 1, FUNC_HANGING_STATEMENT = 2, FUNC_NULLABLE_ID = 4;

    // Parse a function declaration or literal (depending on the
    // `statement & FUNC_STATEMENT`).

    // Remove `allowExpressionBody` for 7.0.0, as it is only called with false
    pp$1.parseFunction = function(node, statement, allowExpressionBody, isAsync) {
      this.initFunction(node);
      if (this.options.ecmaVersion >= 9 || this.options.ecmaVersion >= 6 && !isAsync) {
        if (this.type === types.star && (statement & FUNC_HANGING_STATEMENT))
          { this.unexpected(); }
        node.generator = this.eat(types.star);
      }
      if (this.options.ecmaVersion >= 8)
        { node.async = !!isAsync; }

      if (statement & FUNC_STATEMENT) {
        node.id = (statement & FUNC_NULLABLE_ID) && this.type !== types.name ? null : this.parseIdent();
        if (node.id && !(statement & FUNC_HANGING_STATEMENT))
          // If it is a regular function declaration in sloppy mode, then it is
          // subject to Annex B semantics (BIND_FUNCTION). Otherwise, the binding
          // mode depends on properties of the current scope (see
          // treatFunctionsAsVar).
          { this.checkLVal(node.id, (this.strict || node.generator || node.async) ? this.treatFunctionsAsVar ? BIND_VAR : BIND_LEXICAL : BIND_FUNCTION); }
      }

      var oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
      this.yieldPos = 0;
      this.awaitPos = 0;
      this.awaitIdentPos = 0;
      this.enterScope(functionFlags(node.async, node.generator));

      if (!(statement & FUNC_STATEMENT))
        { node.id = this.type === types.name ? this.parseIdent() : null; }

      this.parseFunctionParams(node);
      this.parseFunctionBody(node, allowExpressionBody, false);

      this.yieldPos = oldYieldPos;
      this.awaitPos = oldAwaitPos;
      this.awaitIdentPos = oldAwaitIdentPos;
      return this.finishNode(node, (statement & FUNC_STATEMENT) ? "FunctionDeclaration" : "FunctionExpression")
    };

    pp$1.parseFunctionParams = function(node) {
      this.expect(types.parenL);
      node.params = this.parseBindingList(types.parenR, false, this.options.ecmaVersion >= 8);
      this.checkYieldAwaitInDefaultParams();
    };

    // Parse a class declaration or literal (depending on the
    // `isStatement` parameter).

    pp$1.parseClass = function(node, isStatement) {
      this.next();

      // ecma-262 14.6 Class Definitions
      // A class definition is always strict mode code.
      var oldStrict = this.strict;
      this.strict = true;

      this.parseClassId(node, isStatement);
      this.parseClassSuper(node);
      var classBody = this.startNode();
      var hadConstructor = false;
      classBody.body = [];
      this.expect(types.braceL);
      while (this.type !== types.braceR) {
        var element = this.parseClassElement(node.superClass !== null);
        if (element) {
          classBody.body.push(element);
          if (element.type === "MethodDefinition" && element.kind === "constructor") {
            if (hadConstructor) { this.raise(element.start, "Duplicate constructor in the same class"); }
            hadConstructor = true;
          }
        }
      }
      this.strict = oldStrict;
      this.next();
      node.body = this.finishNode(classBody, "ClassBody");
      return this.finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression")
    };

    pp$1.parseClassElement = function(constructorAllowsSuper) {
      var this$1$1 = this;

      if (this.eat(types.semi)) { return null }

      var method = this.startNode();
      var tryContextual = function (k, noLineBreak) {
        if ( noLineBreak === void 0 ) noLineBreak = false;

        var start = this$1$1.start, startLoc = this$1$1.startLoc;
        if (!this$1$1.eatContextual(k)) { return false }
        if (this$1$1.type !== types.parenL && (!noLineBreak || !this$1$1.canInsertSemicolon())) { return true }
        if (method.key) { this$1$1.unexpected(); }
        method.computed = false;
        method.key = this$1$1.startNodeAt(start, startLoc);
        method.key.name = k;
        this$1$1.finishNode(method.key, "Identifier");
        return false
      };

      method.kind = "method";
      method.static = tryContextual("static");
      var isGenerator = this.eat(types.star);
      var isAsync = false;
      if (!isGenerator) {
        if (this.options.ecmaVersion >= 8 && tryContextual("async", true)) {
          isAsync = true;
          isGenerator = this.options.ecmaVersion >= 9 && this.eat(types.star);
        } else if (tryContextual("get")) {
          method.kind = "get";
        } else if (tryContextual("set")) {
          method.kind = "set";
        }
      }
      if (!method.key) { this.parsePropertyName(method); }
      var key = method.key;
      var allowsDirectSuper = false;
      if (!method.computed && !method.static && (key.type === "Identifier" && key.name === "constructor" ||
          key.type === "Literal" && key.value === "constructor")) {
        if (method.kind !== "method") { this.raise(key.start, "Constructor can't have get/set modifier"); }
        if (isGenerator) { this.raise(key.start, "Constructor can't be a generator"); }
        if (isAsync) { this.raise(key.start, "Constructor can't be an async method"); }
        method.kind = "constructor";
        allowsDirectSuper = constructorAllowsSuper;
      } else if (method.static && key.type === "Identifier" && key.name === "prototype") {
        this.raise(key.start, "Classes may not have a static property named prototype");
      }
      this.parseClassMethod(method, isGenerator, isAsync, allowsDirectSuper);
      if (method.kind === "get" && method.value.params.length !== 0)
        { this.raiseRecoverable(method.value.start, "getter should have no params"); }
      if (method.kind === "set" && method.value.params.length !== 1)
        { this.raiseRecoverable(method.value.start, "setter should have exactly one param"); }
      if (method.kind === "set" && method.value.params[0].type === "RestElement")
        { this.raiseRecoverable(method.value.params[0].start, "Setter cannot use rest params"); }
      return method
    };

    pp$1.parseClassMethod = function(method, isGenerator, isAsync, allowsDirectSuper) {
      method.value = this.parseMethod(isGenerator, isAsync, allowsDirectSuper);
      return this.finishNode(method, "MethodDefinition")
    };

    pp$1.parseClassId = function(node, isStatement) {
      if (this.type === types.name) {
        node.id = this.parseIdent();
        if (isStatement)
          { this.checkLVal(node.id, BIND_LEXICAL, false); }
      } else {
        if (isStatement === true)
          { this.unexpected(); }
        node.id = null;
      }
    };

    pp$1.parseClassSuper = function(node) {
      node.superClass = this.eat(types._extends) ? this.parseExprSubscripts() : null;
    };

    // Parses module export declaration.

    pp$1.parseExport = function(node, exports) {
      this.next();
      // export * from '...'
      if (this.eat(types.star)) {
        if (this.options.ecmaVersion >= 11) {
          if (this.eatContextual("as")) {
            node.exported = this.parseIdent(true);
            this.checkExport(exports, node.exported.name, this.lastTokStart);
          } else {
            node.exported = null;
          }
        }
        this.expectContextual("from");
        if (this.type !== types.string) { this.unexpected(); }
        node.source = this.parseExprAtom();
        this.semicolon();
        return this.finishNode(node, "ExportAllDeclaration")
      }
      if (this.eat(types._default)) { // export default ...
        this.checkExport(exports, "default", this.lastTokStart);
        var isAsync;
        if (this.type === types._function || (isAsync = this.isAsyncFunction())) {
          var fNode = this.startNode();
          this.next();
          if (isAsync) { this.next(); }
          node.declaration = this.parseFunction(fNode, FUNC_STATEMENT | FUNC_NULLABLE_ID, false, isAsync);
        } else if (this.type === types._class) {
          var cNode = this.startNode();
          node.declaration = this.parseClass(cNode, "nullableID");
        } else {
          node.declaration = this.parseMaybeAssign();
          this.semicolon();
        }
        return this.finishNode(node, "ExportDefaultDeclaration")
      }
      // export var|const|let|function|class ...
      if (this.shouldParseExportStatement()) {
        node.declaration = this.parseStatement(null);
        if (node.declaration.type === "VariableDeclaration")
          { this.checkVariableExport(exports, node.declaration.declarations); }
        else
          { this.checkExport(exports, node.declaration.id.name, node.declaration.id.start); }
        node.specifiers = [];
        node.source = null;
      } else { // export { x, y as z } [from '...']
        node.declaration = null;
        node.specifiers = this.parseExportSpecifiers(exports);
        if (this.eatContextual("from")) {
          if (this.type !== types.string) { this.unexpected(); }
          node.source = this.parseExprAtom();
        } else {
          for (var i = 0, list = node.specifiers; i < list.length; i += 1) {
            // check for keywords used as local names
            var spec = list[i];

            this.checkUnreserved(spec.local);
            // check if export is defined
            this.checkLocalExport(spec.local);
          }

          node.source = null;
        }
        this.semicolon();
      }
      return this.finishNode(node, "ExportNamedDeclaration")
    };

    pp$1.checkExport = function(exports, name, pos) {
      if (!exports) { return }
      if (has(exports, name))
        { this.raiseRecoverable(pos, "Duplicate export '" + name + "'"); }
      exports[name] = true;
    };

    pp$1.checkPatternExport = function(exports, pat) {
      var type = pat.type;
      if (type === "Identifier")
        { this.checkExport(exports, pat.name, pat.start); }
      else if (type === "ObjectPattern")
        { for (var i = 0, list = pat.properties; i < list.length; i += 1)
          {
            var prop = list[i];

            this.checkPatternExport(exports, prop);
          } }
      else if (type === "ArrayPattern")
        { for (var i$1 = 0, list$1 = pat.elements; i$1 < list$1.length; i$1 += 1) {
          var elt = list$1[i$1];

            if (elt) { this.checkPatternExport(exports, elt); }
        } }
      else if (type === "Property")
        { this.checkPatternExport(exports, pat.value); }
      else if (type === "AssignmentPattern")
        { this.checkPatternExport(exports, pat.left); }
      else if (type === "RestElement")
        { this.checkPatternExport(exports, pat.argument); }
      else if (type === "ParenthesizedExpression")
        { this.checkPatternExport(exports, pat.expression); }
    };

    pp$1.checkVariableExport = function(exports, decls) {
      if (!exports) { return }
      for (var i = 0, list = decls; i < list.length; i += 1)
        {
        var decl = list[i];

        this.checkPatternExport(exports, decl.id);
      }
    };

    pp$1.shouldParseExportStatement = function() {
      return this.type.keyword === "var" ||
        this.type.keyword === "const" ||
        this.type.keyword === "class" ||
        this.type.keyword === "function" ||
        this.isLet() ||
        this.isAsyncFunction()
    };

    // Parses a comma-separated list of module exports.

    pp$1.parseExportSpecifiers = function(exports) {
      var nodes = [], first = true;
      // export { x, y as z } [from '...']
      this.expect(types.braceL);
      while (!this.eat(types.braceR)) {
        if (!first) {
          this.expect(types.comma);
          if (this.afterTrailingComma(types.braceR)) { break }
        } else { first = false; }

        var node = this.startNode();
        node.local = this.parseIdent(true);
        node.exported = this.eatContextual("as") ? this.parseIdent(true) : node.local;
        this.checkExport(exports, node.exported.name, node.exported.start);
        nodes.push(this.finishNode(node, "ExportSpecifier"));
      }
      return nodes
    };

    // Parses import declaration.

    pp$1.parseImport = function(node) {
      this.next();
      // import '...'
      if (this.type === types.string) {
        node.specifiers = empty;
        node.source = this.parseExprAtom();
      } else {
        node.specifiers = this.parseImportSpecifiers();
        this.expectContextual("from");
        node.source = this.type === types.string ? this.parseExprAtom() : this.unexpected();
      }
      this.semicolon();
      return this.finishNode(node, "ImportDeclaration")
    };

    // Parses a comma-separated list of module imports.

    pp$1.parseImportSpecifiers = function() {
      var nodes = [], first = true;
      if (this.type === types.name) {
        // import defaultObj, { x, y as z } from '...'
        var node = this.startNode();
        node.local = this.parseIdent();
        this.checkLVal(node.local, BIND_LEXICAL);
        nodes.push(this.finishNode(node, "ImportDefaultSpecifier"));
        if (!this.eat(types.comma)) { return nodes }
      }
      if (this.type === types.star) {
        var node$1 = this.startNode();
        this.next();
        this.expectContextual("as");
        node$1.local = this.parseIdent();
        this.checkLVal(node$1.local, BIND_LEXICAL);
        nodes.push(this.finishNode(node$1, "ImportNamespaceSpecifier"));
        return nodes
      }
      this.expect(types.braceL);
      while (!this.eat(types.braceR)) {
        if (!first) {
          this.expect(types.comma);
          if (this.afterTrailingComma(types.braceR)) { break }
        } else { first = false; }

        var node$2 = this.startNode();
        node$2.imported = this.parseIdent(true);
        if (this.eatContextual("as")) {
          node$2.local = this.parseIdent();
        } else {
          this.checkUnreserved(node$2.imported);
          node$2.local = node$2.imported;
        }
        this.checkLVal(node$2.local, BIND_LEXICAL);
        nodes.push(this.finishNode(node$2, "ImportSpecifier"));
      }
      return nodes
    };

    // Set `ExpressionStatement#directive` property for directive prologues.
    pp$1.adaptDirectivePrologue = function(statements) {
      for (var i = 0; i < statements.length && this.isDirectiveCandidate(statements[i]); ++i) {
        statements[i].directive = statements[i].expression.raw.slice(1, -1);
      }
    };
    pp$1.isDirectiveCandidate = function(statement) {
      return (
        statement.type === "ExpressionStatement" &&
        statement.expression.type === "Literal" &&
        typeof statement.expression.value === "string" &&
        // Reject parenthesized strings.
        (this.input[statement.start] === "\"" || this.input[statement.start] === "'")
      )
    };

    var pp$2 = Parser$1.prototype;

    // Convert existing expression atom to assignable pattern
    // if possible.

    pp$2.toAssignable = function(node, isBinding, refDestructuringErrors) {
      if (this.options.ecmaVersion >= 6 && node) {
        switch (node.type) {
        case "Identifier":
          if (this.inAsync && node.name === "await")
            { this.raise(node.start, "Cannot use 'await' as identifier inside an async function"); }
          break

        case "ObjectPattern":
        case "ArrayPattern":
        case "RestElement":
          break

        case "ObjectExpression":
          node.type = "ObjectPattern";
          if (refDestructuringErrors) { this.checkPatternErrors(refDestructuringErrors, true); }
          for (var i = 0, list = node.properties; i < list.length; i += 1) {
            var prop = list[i];

          this.toAssignable(prop, isBinding);
            // Early error:
            //   AssignmentRestProperty[Yield, Await] :
            //     `...` DestructuringAssignmentTarget[Yield, Await]
            //
            //   It is a Syntax Error if |DestructuringAssignmentTarget| is an |ArrayLiteral| or an |ObjectLiteral|.
            if (
              prop.type === "RestElement" &&
              (prop.argument.type === "ArrayPattern" || prop.argument.type === "ObjectPattern")
            ) {
              this.raise(prop.argument.start, "Unexpected token");
            }
          }
          break

        case "Property":
          // AssignmentProperty has type === "Property"
          if (node.kind !== "init") { this.raise(node.key.start, "Object pattern can't contain getter or setter"); }
          this.toAssignable(node.value, isBinding);
          break

        case "ArrayExpression":
          node.type = "ArrayPattern";
          if (refDestructuringErrors) { this.checkPatternErrors(refDestructuringErrors, true); }
          this.toAssignableList(node.elements, isBinding);
          break

        case "SpreadElement":
          node.type = "RestElement";
          this.toAssignable(node.argument, isBinding);
          if (node.argument.type === "AssignmentPattern")
            { this.raise(node.argument.start, "Rest elements cannot have a default value"); }
          break

        case "AssignmentExpression":
          if (node.operator !== "=") { this.raise(node.left.end, "Only '=' operator can be used for specifying default value."); }
          node.type = "AssignmentPattern";
          delete node.operator;
          this.toAssignable(node.left, isBinding);
          // falls through to AssignmentPattern

        case "AssignmentPattern":
          break

        case "ParenthesizedExpression":
          this.toAssignable(node.expression, isBinding, refDestructuringErrors);
          break

        case "ChainExpression":
          this.raiseRecoverable(node.start, "Optional chaining cannot appear in left-hand side");
          break

        case "MemberExpression":
          if (!isBinding) { break }

        default:
          this.raise(node.start, "Assigning to rvalue");
        }
      } else if (refDestructuringErrors) { this.checkPatternErrors(refDestructuringErrors, true); }
      return node
    };

    // Convert list of expression atoms to binding list.

    pp$2.toAssignableList = function(exprList, isBinding) {
      var end = exprList.length;
      for (var i = 0; i < end; i++) {
        var elt = exprList[i];
        if (elt) { this.toAssignable(elt, isBinding); }
      }
      if (end) {
        var last = exprList[end - 1];
        if (this.options.ecmaVersion === 6 && isBinding && last && last.type === "RestElement" && last.argument.type !== "Identifier")
          { this.unexpected(last.argument.start); }
      }
      return exprList
    };

    // Parses spread element.

    pp$2.parseSpread = function(refDestructuringErrors) {
      var node = this.startNode();
      this.next();
      node.argument = this.parseMaybeAssign(false, refDestructuringErrors);
      return this.finishNode(node, "SpreadElement")
    };

    pp$2.parseRestBinding = function() {
      var node = this.startNode();
      this.next();

      // RestElement inside of a function parameter must be an identifier
      if (this.options.ecmaVersion === 6 && this.type !== types.name)
        { this.unexpected(); }

      node.argument = this.parseBindingAtom();

      return this.finishNode(node, "RestElement")
    };

    // Parses lvalue (assignable) atom.

    pp$2.parseBindingAtom = function() {
      if (this.options.ecmaVersion >= 6) {
        switch (this.type) {
        case types.bracketL:
          var node = this.startNode();
          this.next();
          node.elements = this.parseBindingList(types.bracketR, true, true);
          return this.finishNode(node, "ArrayPattern")

        case types.braceL:
          return this.parseObj(true)
        }
      }
      return this.parseIdent()
    };

    pp$2.parseBindingList = function(close, allowEmpty, allowTrailingComma) {
      var elts = [], first = true;
      while (!this.eat(close)) {
        if (first) { first = false; }
        else { this.expect(types.comma); }
        if (allowEmpty && this.type === types.comma) {
          elts.push(null);
        } else if (allowTrailingComma && this.afterTrailingComma(close)) {
          break
        } else if (this.type === types.ellipsis) {
          var rest = this.parseRestBinding();
          this.parseBindingListItem(rest);
          elts.push(rest);
          if (this.type === types.comma) { this.raise(this.start, "Comma is not permitted after the rest element"); }
          this.expect(close);
          break
        } else {
          var elem = this.parseMaybeDefault(this.start, this.startLoc);
          this.parseBindingListItem(elem);
          elts.push(elem);
        }
      }
      return elts
    };

    pp$2.parseBindingListItem = function(param) {
      return param
    };

    // Parses assignment pattern around given atom if possible.

    pp$2.parseMaybeDefault = function(startPos, startLoc, left) {
      left = left || this.parseBindingAtom();
      if (this.options.ecmaVersion < 6 || !this.eat(types.eq)) { return left }
      var node = this.startNodeAt(startPos, startLoc);
      node.left = left;
      node.right = this.parseMaybeAssign();
      return this.finishNode(node, "AssignmentPattern")
    };

    // Verify that a node is an lval — something that can be assigned
    // to.
    // bindingType can be either:
    // 'var' indicating that the lval creates a 'var' binding
    // 'let' indicating that the lval creates a lexical ('let' or 'const') binding
    // 'none' indicating that the binding should be checked for illegal identifiers, but not for duplicate references

    pp$2.checkLVal = function(expr, bindingType, checkClashes) {
      if ( bindingType === void 0 ) bindingType = BIND_NONE;

      switch (expr.type) {
      case "Identifier":
        if (bindingType === BIND_LEXICAL && expr.name === "let")
          { this.raiseRecoverable(expr.start, "let is disallowed as a lexically bound name"); }
        if (this.strict && this.reservedWordsStrictBind.test(expr.name))
          { this.raiseRecoverable(expr.start, (bindingType ? "Binding " : "Assigning to ") + expr.name + " in strict mode"); }
        if (checkClashes) {
          if (has(checkClashes, expr.name))
            { this.raiseRecoverable(expr.start, "Argument name clash"); }
          checkClashes[expr.name] = true;
        }
        if (bindingType !== BIND_NONE && bindingType !== BIND_OUTSIDE) { this.declareName(expr.name, bindingType, expr.start); }
        break

      case "ChainExpression":
        this.raiseRecoverable(expr.start, "Optional chaining cannot appear in left-hand side");
        break

      case "MemberExpression":
        if (bindingType) { this.raiseRecoverable(expr.start, "Binding member expression"); }
        break

      case "ObjectPattern":
        for (var i = 0, list = expr.properties; i < list.length; i += 1)
          {
        var prop = list[i];

        this.checkLVal(prop, bindingType, checkClashes);
      }
        break

      case "Property":
        // AssignmentProperty has type === "Property"
        this.checkLVal(expr.value, bindingType, checkClashes);
        break

      case "ArrayPattern":
        for (var i$1 = 0, list$1 = expr.elements; i$1 < list$1.length; i$1 += 1) {
          var elem = list$1[i$1];

        if (elem) { this.checkLVal(elem, bindingType, checkClashes); }
        }
        break

      case "AssignmentPattern":
        this.checkLVal(expr.left, bindingType, checkClashes);
        break

      case "RestElement":
        this.checkLVal(expr.argument, bindingType, checkClashes);
        break

      case "ParenthesizedExpression":
        this.checkLVal(expr.expression, bindingType, checkClashes);
        break

      default:
        this.raise(expr.start, (bindingType ? "Binding" : "Assigning to") + " rvalue");
      }
    };

    // A recursive descent parser operates by defining functions for all

    var pp$3 = Parser$1.prototype;

    // Check if property name clashes with already added.
    // Object/class getters and setters are not allowed to clash —
    // either with each other or with an init property — and in
    // strict mode, init properties are also not allowed to be repeated.

    pp$3.checkPropClash = function(prop, propHash, refDestructuringErrors) {
      if (this.options.ecmaVersion >= 9 && prop.type === "SpreadElement")
        { return }
      if (this.options.ecmaVersion >= 6 && (prop.computed || prop.method || prop.shorthand))
        { return }
      var key = prop.key;
      var name;
      switch (key.type) {
      case "Identifier": name = key.name; break
      case "Literal": name = String(key.value); break
      default: return
      }
      var kind = prop.kind;
      if (this.options.ecmaVersion >= 6) {
        if (name === "__proto__" && kind === "init") {
          if (propHash.proto) {
            if (refDestructuringErrors) {
              if (refDestructuringErrors.doubleProto < 0)
                { refDestructuringErrors.doubleProto = key.start; }
              // Backwards-compat kludge. Can be removed in version 6.0
            } else { this.raiseRecoverable(key.start, "Redefinition of __proto__ property"); }
          }
          propHash.proto = true;
        }
        return
      }
      name = "$" + name;
      var other = propHash[name];
      if (other) {
        var redefinition;
        if (kind === "init") {
          redefinition = this.strict && other.init || other.get || other.set;
        } else {
          redefinition = other.init || other[kind];
        }
        if (redefinition)
          { this.raiseRecoverable(key.start, "Redefinition of property"); }
      } else {
        other = propHash[name] = {
          init: false,
          get: false,
          set: false
        };
      }
      other[kind] = true;
    };

    // ### Expression parsing

    // These nest, from the most general expression type at the top to
    // 'atomic', nondivisible expression types at the bottom. Most of
    // the functions will simply let the function(s) below them parse,
    // and, *if* the syntactic construct they handle is present, wrap
    // the AST node that the inner parser gave them in another node.

    // Parse a full expression. The optional arguments are used to
    // forbid the `in` operator (in for loops initalization expressions)
    // and provide reference for storing '=' operator inside shorthand
    // property assignment in contexts where both object expression
    // and object pattern might appear (so it's possible to raise
    // delayed syntax error at correct position).

    pp$3.parseExpression = function(noIn, refDestructuringErrors) {
      var startPos = this.start, startLoc = this.startLoc;
      var expr = this.parseMaybeAssign(noIn, refDestructuringErrors);
      if (this.type === types.comma) {
        var node = this.startNodeAt(startPos, startLoc);
        node.expressions = [expr];
        while (this.eat(types.comma)) { node.expressions.push(this.parseMaybeAssign(noIn, refDestructuringErrors)); }
        return this.finishNode(node, "SequenceExpression")
      }
      return expr
    };

    // Parse an assignment expression. This includes applications of
    // operators like `+=`.

    pp$3.parseMaybeAssign = function(noIn, refDestructuringErrors, afterLeftParse) {
      if (this.isContextual("yield")) {
        if (this.inGenerator) { return this.parseYield(noIn) }
        // The tokenizer will assume an expression is allowed after
        // `yield`, but this isn't that kind of yield
        else { this.exprAllowed = false; }
      }

      var ownDestructuringErrors = false, oldParenAssign = -1, oldTrailingComma = -1;
      if (refDestructuringErrors) {
        oldParenAssign = refDestructuringErrors.parenthesizedAssign;
        oldTrailingComma = refDestructuringErrors.trailingComma;
        refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = -1;
      } else {
        refDestructuringErrors = new DestructuringErrors;
        ownDestructuringErrors = true;
      }

      var startPos = this.start, startLoc = this.startLoc;
      if (this.type === types.parenL || this.type === types.name)
        { this.potentialArrowAt = this.start; }
      var left = this.parseMaybeConditional(noIn, refDestructuringErrors);
      if (afterLeftParse) { left = afterLeftParse.call(this, left, startPos, startLoc); }
      if (this.type.isAssign) {
        var node = this.startNodeAt(startPos, startLoc);
        node.operator = this.value;
        node.left = this.type === types.eq ? this.toAssignable(left, false, refDestructuringErrors) : left;
        if (!ownDestructuringErrors) {
          refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = refDestructuringErrors.doubleProto = -1;
        }
        if (refDestructuringErrors.shorthandAssign >= node.left.start)
          { refDestructuringErrors.shorthandAssign = -1; } // reset because shorthand default was used correctly
        this.checkLVal(left);
        this.next();
        node.right = this.parseMaybeAssign(noIn);
        return this.finishNode(node, "AssignmentExpression")
      } else {
        if (ownDestructuringErrors) { this.checkExpressionErrors(refDestructuringErrors, true); }
      }
      if (oldParenAssign > -1) { refDestructuringErrors.parenthesizedAssign = oldParenAssign; }
      if (oldTrailingComma > -1) { refDestructuringErrors.trailingComma = oldTrailingComma; }
      return left
    };

    // Parse a ternary conditional (`?:`) operator.

    pp$3.parseMaybeConditional = function(noIn, refDestructuringErrors) {
      var startPos = this.start, startLoc = this.startLoc;
      var expr = this.parseExprOps(noIn, refDestructuringErrors);
      if (this.checkExpressionErrors(refDestructuringErrors)) { return expr }
      if (this.eat(types.question)) {
        var node = this.startNodeAt(startPos, startLoc);
        node.test = expr;
        node.consequent = this.parseMaybeAssign();
        this.expect(types.colon);
        node.alternate = this.parseMaybeAssign(noIn);
        return this.finishNode(node, "ConditionalExpression")
      }
      return expr
    };

    // Start the precedence parser.

    pp$3.parseExprOps = function(noIn, refDestructuringErrors) {
      var startPos = this.start, startLoc = this.startLoc;
      var expr = this.parseMaybeUnary(refDestructuringErrors, false);
      if (this.checkExpressionErrors(refDestructuringErrors)) { return expr }
      return expr.start === startPos && expr.type === "ArrowFunctionExpression" ? expr : this.parseExprOp(expr, startPos, startLoc, -1, noIn)
    };

    // Parse binary operators with the operator precedence parsing
    // algorithm. `left` is the left-hand side of the operator.
    // `minPrec` provides context that allows the function to stop and
    // defer further parser to one of its callers when it encounters an
    // operator that has a lower precedence than the set it is parsing.

    pp$3.parseExprOp = function(left, leftStartPos, leftStartLoc, minPrec, noIn) {
      var prec = this.type.binop;
      if (prec != null && (!noIn || this.type !== types._in)) {
        if (prec > minPrec) {
          var logical = this.type === types.logicalOR || this.type === types.logicalAND;
          var coalesce = this.type === types.coalesce;
          if (coalesce) {
            // Handle the precedence of `tt.coalesce` as equal to the range of logical expressions.
            // In other words, `node.right` shouldn't contain logical expressions in order to check the mixed error.
            prec = types.logicalAND.binop;
          }
          var op = this.value;
          this.next();
          var startPos = this.start, startLoc = this.startLoc;
          var right = this.parseExprOp(this.parseMaybeUnary(null, false), startPos, startLoc, prec, noIn);
          var node = this.buildBinary(leftStartPos, leftStartLoc, left, right, op, logical || coalesce);
          if ((logical && this.type === types.coalesce) || (coalesce && (this.type === types.logicalOR || this.type === types.logicalAND))) {
            this.raiseRecoverable(this.start, "Logical expressions and coalesce expressions cannot be mixed. Wrap either by parentheses");
          }
          return this.parseExprOp(node, leftStartPos, leftStartLoc, minPrec, noIn)
        }
      }
      return left
    };

    pp$3.buildBinary = function(startPos, startLoc, left, right, op, logical) {
      var node = this.startNodeAt(startPos, startLoc);
      node.left = left;
      node.operator = op;
      node.right = right;
      return this.finishNode(node, logical ? "LogicalExpression" : "BinaryExpression")
    };

    // Parse unary operators, both prefix and postfix.

    pp$3.parseMaybeUnary = function(refDestructuringErrors, sawUnary) {
      var startPos = this.start, startLoc = this.startLoc, expr;
      if (this.isContextual("await") && (this.inAsync || (!this.inFunction && this.options.allowAwaitOutsideFunction))) {
        expr = this.parseAwait();
        sawUnary = true;
      } else if (this.type.prefix) {
        var node = this.startNode(), update = this.type === types.incDec;
        node.operator = this.value;
        node.prefix = true;
        this.next();
        node.argument = this.parseMaybeUnary(null, true);
        this.checkExpressionErrors(refDestructuringErrors, true);
        if (update) { this.checkLVal(node.argument); }
        else if (this.strict && node.operator === "delete" &&
                 node.argument.type === "Identifier")
          { this.raiseRecoverable(node.start, "Deleting local variable in strict mode"); }
        else { sawUnary = true; }
        expr = this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
      } else {
        expr = this.parseExprSubscripts(refDestructuringErrors);
        if (this.checkExpressionErrors(refDestructuringErrors)) { return expr }
        while (this.type.postfix && !this.canInsertSemicolon()) {
          var node$1 = this.startNodeAt(startPos, startLoc);
          node$1.operator = this.value;
          node$1.prefix = false;
          node$1.argument = expr;
          this.checkLVal(expr);
          this.next();
          expr = this.finishNode(node$1, "UpdateExpression");
        }
      }

      if (!sawUnary && this.eat(types.starstar))
        { return this.buildBinary(startPos, startLoc, expr, this.parseMaybeUnary(null, false), "**", false) }
      else
        { return expr }
    };

    // Parse call, dot, and `[]`-subscript expressions.

    pp$3.parseExprSubscripts = function(refDestructuringErrors) {
      var startPos = this.start, startLoc = this.startLoc;
      var expr = this.parseExprAtom(refDestructuringErrors);
      if (expr.type === "ArrowFunctionExpression" && this.input.slice(this.lastTokStart, this.lastTokEnd) !== ")")
        { return expr }
      var result = this.parseSubscripts(expr, startPos, startLoc);
      if (refDestructuringErrors && result.type === "MemberExpression") {
        if (refDestructuringErrors.parenthesizedAssign >= result.start) { refDestructuringErrors.parenthesizedAssign = -1; }
        if (refDestructuringErrors.parenthesizedBind >= result.start) { refDestructuringErrors.parenthesizedBind = -1; }
      }
      return result
    };

    pp$3.parseSubscripts = function(base, startPos, startLoc, noCalls) {
      var maybeAsyncArrow = this.options.ecmaVersion >= 8 && base.type === "Identifier" && base.name === "async" &&
          this.lastTokEnd === base.end && !this.canInsertSemicolon() && base.end - base.start === 5 &&
          this.potentialArrowAt === base.start;
      var optionalChained = false;

      while (true) {
        var element = this.parseSubscript(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained);

        if (element.optional) { optionalChained = true; }
        if (element === base || element.type === "ArrowFunctionExpression") {
          if (optionalChained) {
            var chainNode = this.startNodeAt(startPos, startLoc);
            chainNode.expression = element;
            element = this.finishNode(chainNode, "ChainExpression");
          }
          return element
        }

        base = element;
      }
    };

    pp$3.parseSubscript = function(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained) {
      var optionalSupported = this.options.ecmaVersion >= 11;
      var optional = optionalSupported && this.eat(types.questionDot);
      if (noCalls && optional) { this.raise(this.lastTokStart, "Optional chaining cannot appear in the callee of new expressions"); }

      var computed = this.eat(types.bracketL);
      if (computed || (optional && this.type !== types.parenL && this.type !== types.backQuote) || this.eat(types.dot)) {
        var node = this.startNodeAt(startPos, startLoc);
        node.object = base;
        node.property = computed ? this.parseExpression() : this.parseIdent(this.options.allowReserved !== "never");
        node.computed = !!computed;
        if (computed) { this.expect(types.bracketR); }
        if (optionalSupported) {
          node.optional = optional;
        }
        base = this.finishNode(node, "MemberExpression");
      } else if (!noCalls && this.eat(types.parenL)) {
        var refDestructuringErrors = new DestructuringErrors, oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
        this.yieldPos = 0;
        this.awaitPos = 0;
        this.awaitIdentPos = 0;
        var exprList = this.parseExprList(types.parenR, this.options.ecmaVersion >= 8, false, refDestructuringErrors);
        if (maybeAsyncArrow && !optional && !this.canInsertSemicolon() && this.eat(types.arrow)) {
          this.checkPatternErrors(refDestructuringErrors, false);
          this.checkYieldAwaitInDefaultParams();
          if (this.awaitIdentPos > 0)
            { this.raise(this.awaitIdentPos, "Cannot use 'await' as identifier inside an async function"); }
          this.yieldPos = oldYieldPos;
          this.awaitPos = oldAwaitPos;
          this.awaitIdentPos = oldAwaitIdentPos;
          return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList, true)
        }
        this.checkExpressionErrors(refDestructuringErrors, true);
        this.yieldPos = oldYieldPos || this.yieldPos;
        this.awaitPos = oldAwaitPos || this.awaitPos;
        this.awaitIdentPos = oldAwaitIdentPos || this.awaitIdentPos;
        var node$1 = this.startNodeAt(startPos, startLoc);
        node$1.callee = base;
        node$1.arguments = exprList;
        if (optionalSupported) {
          node$1.optional = optional;
        }
        base = this.finishNode(node$1, "CallExpression");
      } else if (this.type === types.backQuote) {
        if (optional || optionalChained) {
          this.raise(this.start, "Optional chaining cannot appear in the tag of tagged template expressions");
        }
        var node$2 = this.startNodeAt(startPos, startLoc);
        node$2.tag = base;
        node$2.quasi = this.parseTemplate({isTagged: true});
        base = this.finishNode(node$2, "TaggedTemplateExpression");
      }
      return base
    };

    // Parse an atomic expression — either a single token that is an
    // expression, an expression started by a keyword like `function` or
    // `new`, or an expression wrapped in punctuation like `()`, `[]`,
    // or `{}`.

    pp$3.parseExprAtom = function(refDestructuringErrors) {
      // If a division operator appears in an expression position, the
      // tokenizer got confused, and we force it to read a regexp instead.
      if (this.type === types.slash) { this.readRegexp(); }

      var node, canBeArrow = this.potentialArrowAt === this.start;
      switch (this.type) {
      case types._super:
        if (!this.allowSuper)
          { this.raise(this.start, "'super' keyword outside a method"); }
        node = this.startNode();
        this.next();
        if (this.type === types.parenL && !this.allowDirectSuper)
          { this.raise(node.start, "super() call outside constructor of a subclass"); }
        // The `super` keyword can appear at below:
        // SuperProperty:
        //     super [ Expression ]
        //     super . IdentifierName
        // SuperCall:
        //     super ( Arguments )
        if (this.type !== types.dot && this.type !== types.bracketL && this.type !== types.parenL)
          { this.unexpected(); }
        return this.finishNode(node, "Super")

      case types._this:
        node = this.startNode();
        this.next();
        return this.finishNode(node, "ThisExpression")

      case types.name:
        var startPos = this.start, startLoc = this.startLoc, containsEsc = this.containsEsc;
        var id = this.parseIdent(false);
        if (this.options.ecmaVersion >= 8 && !containsEsc && id.name === "async" && !this.canInsertSemicolon() && this.eat(types._function))
          { return this.parseFunction(this.startNodeAt(startPos, startLoc), 0, false, true) }
        if (canBeArrow && !this.canInsertSemicolon()) {
          if (this.eat(types.arrow))
            { return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], false) }
          if (this.options.ecmaVersion >= 8 && id.name === "async" && this.type === types.name && !containsEsc) {
            id = this.parseIdent(false);
            if (this.canInsertSemicolon() || !this.eat(types.arrow))
              { this.unexpected(); }
            return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], true)
          }
        }
        return id

      case types.regexp:
        var value = this.value;
        node = this.parseLiteral(value.value);
        node.regex = {pattern: value.pattern, flags: value.flags};
        return node

      case types.num: case types.string:
        return this.parseLiteral(this.value)

      case types._null: case types._true: case types._false:
        node = this.startNode();
        node.value = this.type === types._null ? null : this.type === types._true;
        node.raw = this.type.keyword;
        this.next();
        return this.finishNode(node, "Literal")

      case types.parenL:
        var start = this.start, expr = this.parseParenAndDistinguishExpression(canBeArrow);
        if (refDestructuringErrors) {
          if (refDestructuringErrors.parenthesizedAssign < 0 && !this.isSimpleAssignTarget(expr))
            { refDestructuringErrors.parenthesizedAssign = start; }
          if (refDestructuringErrors.parenthesizedBind < 0)
            { refDestructuringErrors.parenthesizedBind = start; }
        }
        return expr

      case types.bracketL:
        node = this.startNode();
        this.next();
        node.elements = this.parseExprList(types.bracketR, true, true, refDestructuringErrors);
        return this.finishNode(node, "ArrayExpression")

      case types.braceL:
        return this.parseObj(false, refDestructuringErrors)

      case types._function:
        node = this.startNode();
        this.next();
        return this.parseFunction(node, 0)

      case types._class:
        return this.parseClass(this.startNode(), false)

      case types._new:
        return this.parseNew()

      case types.backQuote:
        return this.parseTemplate()

      case types._import:
        if (this.options.ecmaVersion >= 11) {
          return this.parseExprImport()
        } else {
          return this.unexpected()
        }

      default:
        this.unexpected();
      }
    };

    pp$3.parseExprImport = function() {
      var node = this.startNode();

      // Consume `import` as an identifier for `import.meta`.
      // Because `this.parseIdent(true)` doesn't check escape sequences, it needs the check of `this.containsEsc`.
      if (this.containsEsc) { this.raiseRecoverable(this.start, "Escape sequence in keyword import"); }
      var meta = this.parseIdent(true);

      switch (this.type) {
      case types.parenL:
        return this.parseDynamicImport(node)
      case types.dot:
        node.meta = meta;
        return this.parseImportMeta(node)
      default:
        this.unexpected();
      }
    };

    pp$3.parseDynamicImport = function(node) {
      this.next(); // skip `(`

      // Parse node.source.
      node.source = this.parseMaybeAssign();

      // Verify ending.
      if (!this.eat(types.parenR)) {
        var errorPos = this.start;
        if (this.eat(types.comma) && this.eat(types.parenR)) {
          this.raiseRecoverable(errorPos, "Trailing comma is not allowed in import()");
        } else {
          this.unexpected(errorPos);
        }
      }

      return this.finishNode(node, "ImportExpression")
    };

    pp$3.parseImportMeta = function(node) {
      this.next(); // skip `.`

      var containsEsc = this.containsEsc;
      node.property = this.parseIdent(true);

      if (node.property.name !== "meta")
        { this.raiseRecoverable(node.property.start, "The only valid meta property for import is 'import.meta'"); }
      if (containsEsc)
        { this.raiseRecoverable(node.start, "'import.meta' must not contain escaped characters"); }
      if (this.options.sourceType !== "module")
        { this.raiseRecoverable(node.start, "Cannot use 'import.meta' outside a module"); }

      return this.finishNode(node, "MetaProperty")
    };

    pp$3.parseLiteral = function(value) {
      var node = this.startNode();
      node.value = value;
      node.raw = this.input.slice(this.start, this.end);
      if (node.raw.charCodeAt(node.raw.length - 1) === 110) { node.bigint = node.raw.slice(0, -1).replace(/_/g, ""); }
      this.next();
      return this.finishNode(node, "Literal")
    };

    pp$3.parseParenExpression = function() {
      this.expect(types.parenL);
      var val = this.parseExpression();
      this.expect(types.parenR);
      return val
    };

    pp$3.parseParenAndDistinguishExpression = function(canBeArrow) {
      var startPos = this.start, startLoc = this.startLoc, val, allowTrailingComma = this.options.ecmaVersion >= 8;
      if (this.options.ecmaVersion >= 6) {
        this.next();

        var innerStartPos = this.start, innerStartLoc = this.startLoc;
        var exprList = [], first = true, lastIsComma = false;
        var refDestructuringErrors = new DestructuringErrors, oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, spreadStart;
        this.yieldPos = 0;
        this.awaitPos = 0;
        // Do not save awaitIdentPos to allow checking awaits nested in parameters
        while (this.type !== types.parenR) {
          first ? first = false : this.expect(types.comma);
          if (allowTrailingComma && this.afterTrailingComma(types.parenR, true)) {
            lastIsComma = true;
            break
          } else if (this.type === types.ellipsis) {
            spreadStart = this.start;
            exprList.push(this.parseParenItem(this.parseRestBinding()));
            if (this.type === types.comma) { this.raise(this.start, "Comma is not permitted after the rest element"); }
            break
          } else {
            exprList.push(this.parseMaybeAssign(false, refDestructuringErrors, this.parseParenItem));
          }
        }
        var innerEndPos = this.start, innerEndLoc = this.startLoc;
        this.expect(types.parenR);

        if (canBeArrow && !this.canInsertSemicolon() && this.eat(types.arrow)) {
          this.checkPatternErrors(refDestructuringErrors, false);
          this.checkYieldAwaitInDefaultParams();
          this.yieldPos = oldYieldPos;
          this.awaitPos = oldAwaitPos;
          return this.parseParenArrowList(startPos, startLoc, exprList)
        }

        if (!exprList.length || lastIsComma) { this.unexpected(this.lastTokStart); }
        if (spreadStart) { this.unexpected(spreadStart); }
        this.checkExpressionErrors(refDestructuringErrors, true);
        this.yieldPos = oldYieldPos || this.yieldPos;
        this.awaitPos = oldAwaitPos || this.awaitPos;

        if (exprList.length > 1) {
          val = this.startNodeAt(innerStartPos, innerStartLoc);
          val.expressions = exprList;
          this.finishNodeAt(val, "SequenceExpression", innerEndPos, innerEndLoc);
        } else {
          val = exprList[0];
        }
      } else {
        val = this.parseParenExpression();
      }

      if (this.options.preserveParens) {
        var par = this.startNodeAt(startPos, startLoc);
        par.expression = val;
        return this.finishNode(par, "ParenthesizedExpression")
      } else {
        return val
      }
    };

    pp$3.parseParenItem = function(item) {
      return item
    };

    pp$3.parseParenArrowList = function(startPos, startLoc, exprList) {
      return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList)
    };

    // New's precedence is slightly tricky. It must allow its argument to
    // be a `[]` or dot subscript expression, but not a call — at least,
    // not without wrapping it in parentheses. Thus, it uses the noCalls
    // argument to parseSubscripts to prevent it from consuming the
    // argument list.

    var empty$1 = [];

    pp$3.parseNew = function() {
      if (this.containsEsc) { this.raiseRecoverable(this.start, "Escape sequence in keyword new"); }
      var node = this.startNode();
      var meta = this.parseIdent(true);
      if (this.options.ecmaVersion >= 6 && this.eat(types.dot)) {
        node.meta = meta;
        var containsEsc = this.containsEsc;
        node.property = this.parseIdent(true);
        if (node.property.name !== "target")
          { this.raiseRecoverable(node.property.start, "The only valid meta property for new is 'new.target'"); }
        if (containsEsc)
          { this.raiseRecoverable(node.start, "'new.target' must not contain escaped characters"); }
        if (!this.inNonArrowFunction())
          { this.raiseRecoverable(node.start, "'new.target' can only be used in functions"); }
        return this.finishNode(node, "MetaProperty")
      }
      var startPos = this.start, startLoc = this.startLoc, isImport = this.type === types._import;
      node.callee = this.parseSubscripts(this.parseExprAtom(), startPos, startLoc, true);
      if (isImport && node.callee.type === "ImportExpression") {
        this.raise(startPos, "Cannot use new with import()");
      }
      if (this.eat(types.parenL)) { node.arguments = this.parseExprList(types.parenR, this.options.ecmaVersion >= 8, false); }
      else { node.arguments = empty$1; }
      return this.finishNode(node, "NewExpression")
    };

    // Parse template expression.

    pp$3.parseTemplateElement = function(ref) {
      var isTagged = ref.isTagged;

      var elem = this.startNode();
      if (this.type === types.invalidTemplate) {
        if (!isTagged) {
          this.raiseRecoverable(this.start, "Bad escape sequence in untagged template literal");
        }
        elem.value = {
          raw: this.value,
          cooked: null
        };
      } else {
        elem.value = {
          raw: this.input.slice(this.start, this.end).replace(/\r\n?/g, "\n"),
          cooked: this.value
        };
      }
      this.next();
      elem.tail = this.type === types.backQuote;
      return this.finishNode(elem, "TemplateElement")
    };

    pp$3.parseTemplate = function(ref) {
      if ( ref === void 0 ) ref = {};
      var isTagged = ref.isTagged; if ( isTagged === void 0 ) isTagged = false;

      var node = this.startNode();
      this.next();
      node.expressions = [];
      var curElt = this.parseTemplateElement({isTagged: isTagged});
      node.quasis = [curElt];
      while (!curElt.tail) {
        if (this.type === types.eof) { this.raise(this.pos, "Unterminated template literal"); }
        this.expect(types.dollarBraceL);
        node.expressions.push(this.parseExpression());
        this.expect(types.braceR);
        node.quasis.push(curElt = this.parseTemplateElement({isTagged: isTagged}));
      }
      this.next();
      return this.finishNode(node, "TemplateLiteral")
    };

    pp$3.isAsyncProp = function(prop) {
      return !prop.computed && prop.key.type === "Identifier" && prop.key.name === "async" &&
        (this.type === types.name || this.type === types.num || this.type === types.string || this.type === types.bracketL || this.type.keyword || (this.options.ecmaVersion >= 9 && this.type === types.star)) &&
        !lineBreak.test(this.input.slice(this.lastTokEnd, this.start))
    };

    // Parse an object literal or binding pattern.

    pp$3.parseObj = function(isPattern, refDestructuringErrors) {
      var node = this.startNode(), first = true, propHash = {};
      node.properties = [];
      this.next();
      while (!this.eat(types.braceR)) {
        if (!first) {
          this.expect(types.comma);
          if (this.options.ecmaVersion >= 5 && this.afterTrailingComma(types.braceR)) { break }
        } else { first = false; }

        var prop = this.parseProperty(isPattern, refDestructuringErrors);
        if (!isPattern) { this.checkPropClash(prop, propHash, refDestructuringErrors); }
        node.properties.push(prop);
      }
      return this.finishNode(node, isPattern ? "ObjectPattern" : "ObjectExpression")
    };

    pp$3.parseProperty = function(isPattern, refDestructuringErrors) {
      var prop = this.startNode(), isGenerator, isAsync, startPos, startLoc;
      if (this.options.ecmaVersion >= 9 && this.eat(types.ellipsis)) {
        if (isPattern) {
          prop.argument = this.parseIdent(false);
          if (this.type === types.comma) {
            this.raise(this.start, "Comma is not permitted after the rest element");
          }
          return this.finishNode(prop, "RestElement")
        }
        // To disallow parenthesized identifier via `this.toAssignable()`.
        if (this.type === types.parenL && refDestructuringErrors) {
          if (refDestructuringErrors.parenthesizedAssign < 0) {
            refDestructuringErrors.parenthesizedAssign = this.start;
          }
          if (refDestructuringErrors.parenthesizedBind < 0) {
            refDestructuringErrors.parenthesizedBind = this.start;
          }
        }
        // Parse argument.
        prop.argument = this.parseMaybeAssign(false, refDestructuringErrors);
        // To disallow trailing comma via `this.toAssignable()`.
        if (this.type === types.comma && refDestructuringErrors && refDestructuringErrors.trailingComma < 0) {
          refDestructuringErrors.trailingComma = this.start;
        }
        // Finish
        return this.finishNode(prop, "SpreadElement")
      }
      if (this.options.ecmaVersion >= 6) {
        prop.method = false;
        prop.shorthand = false;
        if (isPattern || refDestructuringErrors) {
          startPos = this.start;
          startLoc = this.startLoc;
        }
        if (!isPattern)
          { isGenerator = this.eat(types.star); }
      }
      var containsEsc = this.containsEsc;
      this.parsePropertyName(prop);
      if (!isPattern && !containsEsc && this.options.ecmaVersion >= 8 && !isGenerator && this.isAsyncProp(prop)) {
        isAsync = true;
        isGenerator = this.options.ecmaVersion >= 9 && this.eat(types.star);
        this.parsePropertyName(prop, refDestructuringErrors);
      } else {
        isAsync = false;
      }
      this.parsePropertyValue(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc);
      return this.finishNode(prop, "Property")
    };

    pp$3.parsePropertyValue = function(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc) {
      if ((isGenerator || isAsync) && this.type === types.colon)
        { this.unexpected(); }

      if (this.eat(types.colon)) {
        prop.value = isPattern ? this.parseMaybeDefault(this.start, this.startLoc) : this.parseMaybeAssign(false, refDestructuringErrors);
        prop.kind = "init";
      } else if (this.options.ecmaVersion >= 6 && this.type === types.parenL) {
        if (isPattern) { this.unexpected(); }
        prop.kind = "init";
        prop.method = true;
        prop.value = this.parseMethod(isGenerator, isAsync);
      } else if (!isPattern && !containsEsc &&
                 this.options.ecmaVersion >= 5 && !prop.computed && prop.key.type === "Identifier" &&
                 (prop.key.name === "get" || prop.key.name === "set") &&
                 (this.type !== types.comma && this.type !== types.braceR && this.type !== types.eq)) {
        if (isGenerator || isAsync) { this.unexpected(); }
        prop.kind = prop.key.name;
        this.parsePropertyName(prop);
        prop.value = this.parseMethod(false);
        var paramCount = prop.kind === "get" ? 0 : 1;
        if (prop.value.params.length !== paramCount) {
          var start = prop.value.start;
          if (prop.kind === "get")
            { this.raiseRecoverable(start, "getter should have no params"); }
          else
            { this.raiseRecoverable(start, "setter should have exactly one param"); }
        } else {
          if (prop.kind === "set" && prop.value.params[0].type === "RestElement")
            { this.raiseRecoverable(prop.value.params[0].start, "Setter cannot use rest params"); }
        }
      } else if (this.options.ecmaVersion >= 6 && !prop.computed && prop.key.type === "Identifier") {
        if (isGenerator || isAsync) { this.unexpected(); }
        this.checkUnreserved(prop.key);
        if (prop.key.name === "await" && !this.awaitIdentPos)
          { this.awaitIdentPos = startPos; }
        prop.kind = "init";
        if (isPattern) {
          prop.value = this.parseMaybeDefault(startPos, startLoc, prop.key);
        } else if (this.type === types.eq && refDestructuringErrors) {
          if (refDestructuringErrors.shorthandAssign < 0)
            { refDestructuringErrors.shorthandAssign = this.start; }
          prop.value = this.parseMaybeDefault(startPos, startLoc, prop.key);
        } else {
          prop.value = prop.key;
        }
        prop.shorthand = true;
      } else { this.unexpected(); }
    };

    pp$3.parsePropertyName = function(prop) {
      if (this.options.ecmaVersion >= 6) {
        if (this.eat(types.bracketL)) {
          prop.computed = true;
          prop.key = this.parseMaybeAssign();
          this.expect(types.bracketR);
          return prop.key
        } else {
          prop.computed = false;
        }
      }
      return prop.key = this.type === types.num || this.type === types.string ? this.parseExprAtom() : this.parseIdent(this.options.allowReserved !== "never")
    };

    // Initialize empty function node.

    pp$3.initFunction = function(node) {
      node.id = null;
      if (this.options.ecmaVersion >= 6) { node.generator = node.expression = false; }
      if (this.options.ecmaVersion >= 8) { node.async = false; }
    };

    // Parse object or class method.

    pp$3.parseMethod = function(isGenerator, isAsync, allowDirectSuper) {
      var node = this.startNode(), oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;

      this.initFunction(node);
      if (this.options.ecmaVersion >= 6)
        { node.generator = isGenerator; }
      if (this.options.ecmaVersion >= 8)
        { node.async = !!isAsync; }

      this.yieldPos = 0;
      this.awaitPos = 0;
      this.awaitIdentPos = 0;
      this.enterScope(functionFlags(isAsync, node.generator) | SCOPE_SUPER | (allowDirectSuper ? SCOPE_DIRECT_SUPER : 0));

      this.expect(types.parenL);
      node.params = this.parseBindingList(types.parenR, false, this.options.ecmaVersion >= 8);
      this.checkYieldAwaitInDefaultParams();
      this.parseFunctionBody(node, false, true);

      this.yieldPos = oldYieldPos;
      this.awaitPos = oldAwaitPos;
      this.awaitIdentPos = oldAwaitIdentPos;
      return this.finishNode(node, "FunctionExpression")
    };

    // Parse arrow function expression with given parameters.

    pp$3.parseArrowExpression = function(node, params, isAsync) {
      var oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;

      this.enterScope(functionFlags(isAsync, false) | SCOPE_ARROW);
      this.initFunction(node);
      if (this.options.ecmaVersion >= 8) { node.async = !!isAsync; }

      this.yieldPos = 0;
      this.awaitPos = 0;
      this.awaitIdentPos = 0;

      node.params = this.toAssignableList(params, true);
      this.parseFunctionBody(node, true, false);

      this.yieldPos = oldYieldPos;
      this.awaitPos = oldAwaitPos;
      this.awaitIdentPos = oldAwaitIdentPos;
      return this.finishNode(node, "ArrowFunctionExpression")
    };

    // Parse function body and check parameters.

    pp$3.parseFunctionBody = function(node, isArrowFunction, isMethod) {
      var isExpression = isArrowFunction && this.type !== types.braceL;
      var oldStrict = this.strict, useStrict = false;

      if (isExpression) {
        node.body = this.parseMaybeAssign();
        node.expression = true;
        this.checkParams(node, false);
      } else {
        var nonSimple = this.options.ecmaVersion >= 7 && !this.isSimpleParamList(node.params);
        if (!oldStrict || nonSimple) {
          useStrict = this.strictDirective(this.end);
          // If this is a strict mode function, verify that argument names
          // are not repeated, and it does not try to bind the words `eval`
          // or `arguments`.
          if (useStrict && nonSimple)
            { this.raiseRecoverable(node.start, "Illegal 'use strict' directive in function with non-simple parameter list"); }
        }
        // Start a new scope with regard to labels and the `inFunction`
        // flag (restore them to their old value afterwards).
        var oldLabels = this.labels;
        this.labels = [];
        if (useStrict) { this.strict = true; }

        // Add the params to varDeclaredNames to ensure that an error is thrown
        // if a let/const declaration in the function clashes with one of the params.
        this.checkParams(node, !oldStrict && !useStrict && !isArrowFunction && !isMethod && this.isSimpleParamList(node.params));
        // Ensure the function name isn't a forbidden identifier in strict mode, e.g. 'eval'
        if (this.strict && node.id) { this.checkLVal(node.id, BIND_OUTSIDE); }
        node.body = this.parseBlock(false, undefined, useStrict && !oldStrict);
        node.expression = false;
        this.adaptDirectivePrologue(node.body.body);
        this.labels = oldLabels;
      }
      this.exitScope();
    };

    pp$3.isSimpleParamList = function(params) {
      for (var i = 0, list = params; i < list.length; i += 1)
        {
        var param = list[i];

        if (param.type !== "Identifier") { return false
      } }
      return true
    };

    // Checks function params for various disallowed patterns such as using "eval"
    // or "arguments" and duplicate parameters.

    pp$3.checkParams = function(node, allowDuplicates) {
      var nameHash = {};
      for (var i = 0, list = node.params; i < list.length; i += 1)
        {
        var param = list[i];

        this.checkLVal(param, BIND_VAR, allowDuplicates ? null : nameHash);
      }
    };

    // Parses a comma-separated list of expressions, and returns them as
    // an array. `close` is the token type that ends the list, and
    // `allowEmpty` can be turned on to allow subsequent commas with
    // nothing in between them to be parsed as `null` (which is needed
    // for array literals).

    pp$3.parseExprList = function(close, allowTrailingComma, allowEmpty, refDestructuringErrors) {
      var elts = [], first = true;
      while (!this.eat(close)) {
        if (!first) {
          this.expect(types.comma);
          if (allowTrailingComma && this.afterTrailingComma(close)) { break }
        } else { first = false; }

        var elt = (void 0);
        if (allowEmpty && this.type === types.comma)
          { elt = null; }
        else if (this.type === types.ellipsis) {
          elt = this.parseSpread(refDestructuringErrors);
          if (refDestructuringErrors && this.type === types.comma && refDestructuringErrors.trailingComma < 0)
            { refDestructuringErrors.trailingComma = this.start; }
        } else {
          elt = this.parseMaybeAssign(false, refDestructuringErrors);
        }
        elts.push(elt);
      }
      return elts
    };

    pp$3.checkUnreserved = function(ref) {
      var start = ref.start;
      var end = ref.end;
      var name = ref.name;

      if (this.inGenerator && name === "yield")
        { this.raiseRecoverable(start, "Cannot use 'yield' as identifier inside a generator"); }
      if (this.inAsync && name === "await")
        { this.raiseRecoverable(start, "Cannot use 'await' as identifier inside an async function"); }
      if (this.keywords.test(name))
        { this.raise(start, ("Unexpected keyword '" + name + "'")); }
      if (this.options.ecmaVersion < 6 &&
        this.input.slice(start, end).indexOf("\\") !== -1) { return }
      var re = this.strict ? this.reservedWordsStrict : this.reservedWords;
      if (re.test(name)) {
        if (!this.inAsync && name === "await")
          { this.raiseRecoverable(start, "Cannot use keyword 'await' outside an async function"); }
        this.raiseRecoverable(start, ("The keyword '" + name + "' is reserved"));
      }
    };

    // Parse the next token as an identifier. If `liberal` is true (used
    // when parsing properties), it will also convert keywords into
    // identifiers.

    pp$3.parseIdent = function(liberal, isBinding) {
      var node = this.startNode();
      if (this.type === types.name) {
        node.name = this.value;
      } else if (this.type.keyword) {
        node.name = this.type.keyword;

        // To fix https://github.com/acornjs/acorn/issues/575
        // `class` and `function` keywords push new context into this.context.
        // But there is no chance to pop the context if the keyword is consumed as an identifier such as a property name.
        // If the previous token is a dot, this does not apply because the context-managing code already ignored the keyword
        if ((node.name === "class" || node.name === "function") &&
            (this.lastTokEnd !== this.lastTokStart + 1 || this.input.charCodeAt(this.lastTokStart) !== 46)) {
          this.context.pop();
        }
      } else {
        this.unexpected();
      }
      this.next(!!liberal);
      this.finishNode(node, "Identifier");
      if (!liberal) {
        this.checkUnreserved(node);
        if (node.name === "await" && !this.awaitIdentPos)
          { this.awaitIdentPos = node.start; }
      }
      return node
    };

    // Parses yield expression inside generator.

    pp$3.parseYield = function(noIn) {
      if (!this.yieldPos) { this.yieldPos = this.start; }

      var node = this.startNode();
      this.next();
      if (this.type === types.semi || this.canInsertSemicolon() || (this.type !== types.star && !this.type.startsExpr)) {
        node.delegate = false;
        node.argument = null;
      } else {
        node.delegate = this.eat(types.star);
        node.argument = this.parseMaybeAssign(noIn);
      }
      return this.finishNode(node, "YieldExpression")
    };

    pp$3.parseAwait = function() {
      if (!this.awaitPos) { this.awaitPos = this.start; }

      var node = this.startNode();
      this.next();
      node.argument = this.parseMaybeUnary(null, false);
      return this.finishNode(node, "AwaitExpression")
    };

    var pp$4 = Parser$1.prototype;

    // This function is used to raise exceptions on parse errors. It
    // takes an offset integer (into the current `input`) to indicate
    // the location of the error, attaches the position to the end
    // of the error message, and then raises a `SyntaxError` with that
    // message.

    pp$4.raise = function(pos, message) {
      var loc = getLineInfo(this.input, pos);
      message += " (" + loc.line + ":" + loc.column + ")";
      var err = new SyntaxError(message);
      err.pos = pos; err.loc = loc; err.raisedAt = this.pos;
      throw err
    };

    pp$4.raiseRecoverable = pp$4.raise;

    pp$4.curPosition = function() {
      if (this.options.locations) {
        return new Position(this.curLine, this.pos - this.lineStart)
      }
    };

    var pp$5 = Parser$1.prototype;

    var Scope = function Scope(flags) {
      this.flags = flags;
      // A list of var-declared names in the current lexical scope
      this.var = [];
      // A list of lexically-declared names in the current lexical scope
      this.lexical = [];
      // A list of lexically-declared FunctionDeclaration names in the current lexical scope
      this.functions = [];
    };

    // The functions in this module keep track of declared variables in the current scope in order to detect duplicate variable names.

    pp$5.enterScope = function(flags) {
      this.scopeStack.push(new Scope(flags));
    };

    pp$5.exitScope = function() {
      this.scopeStack.pop();
    };

    // The spec says:
    // > At the top level of a function, or script, function declarations are
    // > treated like var declarations rather than like lexical declarations.
    pp$5.treatFunctionsAsVarInScope = function(scope) {
      return (scope.flags & SCOPE_FUNCTION$1) || !this.inModule && (scope.flags & SCOPE_TOP)
    };

    pp$5.declareName = function(name, bindingType, pos) {
      var redeclared = false;
      if (bindingType === BIND_LEXICAL) {
        var scope = this.currentScope();
        redeclared = scope.lexical.indexOf(name) > -1 || scope.functions.indexOf(name) > -1 || scope.var.indexOf(name) > -1;
        scope.lexical.push(name);
        if (this.inModule && (scope.flags & SCOPE_TOP))
          { delete this.undefinedExports[name]; }
      } else if (bindingType === BIND_SIMPLE_CATCH) {
        var scope$1 = this.currentScope();
        scope$1.lexical.push(name);
      } else if (bindingType === BIND_FUNCTION) {
        var scope$2 = this.currentScope();
        if (this.treatFunctionsAsVar)
          { redeclared = scope$2.lexical.indexOf(name) > -1; }
        else
          { redeclared = scope$2.lexical.indexOf(name) > -1 || scope$2.var.indexOf(name) > -1; }
        scope$2.functions.push(name);
      } else {
        for (var i = this.scopeStack.length - 1; i >= 0; --i) {
          var scope$3 = this.scopeStack[i];
          if (scope$3.lexical.indexOf(name) > -1 && !((scope$3.flags & SCOPE_SIMPLE_CATCH) && scope$3.lexical[0] === name) ||
              !this.treatFunctionsAsVarInScope(scope$3) && scope$3.functions.indexOf(name) > -1) {
            redeclared = true;
            break
          }
          scope$3.var.push(name);
          if (this.inModule && (scope$3.flags & SCOPE_TOP))
            { delete this.undefinedExports[name]; }
          if (scope$3.flags & SCOPE_VAR) { break }
        }
      }
      if (redeclared) { this.raiseRecoverable(pos, ("Identifier '" + name + "' has already been declared")); }
    };

    pp$5.checkLocalExport = function(id) {
      // scope.functions must be empty as Module code is always strict.
      if (this.scopeStack[0].lexical.indexOf(id.name) === -1 &&
          this.scopeStack[0].var.indexOf(id.name) === -1) {
        this.undefinedExports[id.name] = id;
      }
    };

    pp$5.currentScope = function() {
      return this.scopeStack[this.scopeStack.length - 1]
    };

    pp$5.currentVarScope = function() {
      for (var i = this.scopeStack.length - 1;; i--) {
        var scope = this.scopeStack[i];
        if (scope.flags & SCOPE_VAR) { return scope }
      }
    };

    // Could be useful for `this`, `new.target`, `super()`, `super.property`, and `super[property]`.
    pp$5.currentThisScope = function() {
      for (var i = this.scopeStack.length - 1;; i--) {
        var scope = this.scopeStack[i];
        if (scope.flags & SCOPE_VAR && !(scope.flags & SCOPE_ARROW)) { return scope }
      }
    };

    var Node$1 = function Node(parser, pos, loc) {
      this.type = "";
      this.start = pos;
      this.end = 0;
      if (parser.options.locations)
        { this.loc = new SourceLocation(parser, loc); }
      if (parser.options.directSourceFile)
        { this.sourceFile = parser.options.directSourceFile; }
      if (parser.options.ranges)
        { this.range = [pos, 0]; }
    };

    // Start an AST node, attaching a start offset.

    var pp$6 = Parser$1.prototype;

    pp$6.startNode = function() {
      return new Node$1(this, this.start, this.startLoc)
    };

    pp$6.startNodeAt = function(pos, loc) {
      return new Node$1(this, pos, loc)
    };

    // Finish an AST node, adding `type` and `end` properties.

    function finishNodeAt(node, type, pos, loc) {
      node.type = type;
      node.end = pos;
      if (this.options.locations)
        { node.loc.end = loc; }
      if (this.options.ranges)
        { node.range[1] = pos; }
      return node
    }

    pp$6.finishNode = function(node, type) {
      return finishNodeAt.call(this, node, type, this.lastTokEnd, this.lastTokEndLoc)
    };

    // Finish node at given position

    pp$6.finishNodeAt = function(node, type, pos, loc) {
      return finishNodeAt.call(this, node, type, pos, loc)
    };

    // The algorithm used to determine whether a regexp can appear at a

    var TokContext = function TokContext(token, isExpr, preserveSpace, override, generator) {
      this.token = token;
      this.isExpr = !!isExpr;
      this.preserveSpace = !!preserveSpace;
      this.override = override;
      this.generator = !!generator;
    };

    var types$1 = {
      b_stat: new TokContext("{", false),
      b_expr: new TokContext("{", true),
      b_tmpl: new TokContext("${", false),
      p_stat: new TokContext("(", false),
      p_expr: new TokContext("(", true),
      q_tmpl: new TokContext("`", true, true, function (p) { return p.tryReadTemplateToken(); }),
      f_stat: new TokContext("function", false),
      f_expr: new TokContext("function", true),
      f_expr_gen: new TokContext("function", true, false, null, true),
      f_gen: new TokContext("function", false, false, null, true)
    };

    var pp$7 = Parser$1.prototype;

    pp$7.initialContext = function() {
      return [types$1.b_stat]
    };

    pp$7.braceIsBlock = function(prevType) {
      var parent = this.curContext();
      if (parent === types$1.f_expr || parent === types$1.f_stat)
        { return true }
      if (prevType === types.colon && (parent === types$1.b_stat || parent === types$1.b_expr))
        { return !parent.isExpr }

      // The check for `tt.name && exprAllowed` detects whether we are
      // after a `yield` or `of` construct. See the `updateContext` for
      // `tt.name`.
      if (prevType === types._return || prevType === types.name && this.exprAllowed)
        { return lineBreak.test(this.input.slice(this.lastTokEnd, this.start)) }
      if (prevType === types._else || prevType === types.semi || prevType === types.eof || prevType === types.parenR || prevType === types.arrow)
        { return true }
      if (prevType === types.braceL)
        { return parent === types$1.b_stat }
      if (prevType === types._var || prevType === types._const || prevType === types.name)
        { return false }
      return !this.exprAllowed
    };

    pp$7.inGeneratorContext = function() {
      for (var i = this.context.length - 1; i >= 1; i--) {
        var context = this.context[i];
        if (context.token === "function")
          { return context.generator }
      }
      return false
    };

    pp$7.updateContext = function(prevType) {
      var update, type = this.type;
      if (type.keyword && prevType === types.dot)
        { this.exprAllowed = false; }
      else if (update = type.updateContext)
        { update.call(this, prevType); }
      else
        { this.exprAllowed = type.beforeExpr; }
    };

    // Token-specific context update code

    types.parenR.updateContext = types.braceR.updateContext = function() {
      if (this.context.length === 1) {
        this.exprAllowed = true;
        return
      }
      var out = this.context.pop();
      if (out === types$1.b_stat && this.curContext().token === "function") {
        out = this.context.pop();
      }
      this.exprAllowed = !out.isExpr;
    };

    types.braceL.updateContext = function(prevType) {
      this.context.push(this.braceIsBlock(prevType) ? types$1.b_stat : types$1.b_expr);
      this.exprAllowed = true;
    };

    types.dollarBraceL.updateContext = function() {
      this.context.push(types$1.b_tmpl);
      this.exprAllowed = true;
    };

    types.parenL.updateContext = function(prevType) {
      var statementParens = prevType === types._if || prevType === types._for || prevType === types._with || prevType === types._while;
      this.context.push(statementParens ? types$1.p_stat : types$1.p_expr);
      this.exprAllowed = true;
    };

    types.incDec.updateContext = function() {
      // tokExprAllowed stays unchanged
    };

    types._function.updateContext = types._class.updateContext = function(prevType) {
      if (prevType.beforeExpr && prevType !== types.semi && prevType !== types._else &&
          !(prevType === types._return && lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) &&
          !((prevType === types.colon || prevType === types.braceL) && this.curContext() === types$1.b_stat))
        { this.context.push(types$1.f_expr); }
      else
        { this.context.push(types$1.f_stat); }
      this.exprAllowed = false;
    };

    types.backQuote.updateContext = function() {
      if (this.curContext() === types$1.q_tmpl)
        { this.context.pop(); }
      else
        { this.context.push(types$1.q_tmpl); }
      this.exprAllowed = false;
    };

    types.star.updateContext = function(prevType) {
      if (prevType === types._function) {
        var index = this.context.length - 1;
        if (this.context[index] === types$1.f_expr)
          { this.context[index] = types$1.f_expr_gen; }
        else
          { this.context[index] = types$1.f_gen; }
      }
      this.exprAllowed = true;
    };

    types.name.updateContext = function(prevType) {
      var allowed = false;
      if (this.options.ecmaVersion >= 6 && prevType !== types.dot) {
        if (this.value === "of" && !this.exprAllowed ||
            this.value === "yield" && this.inGeneratorContext())
          { allowed = true; }
      }
      this.exprAllowed = allowed;
    };

    // This file contains Unicode properties extracted from the ECMAScript
    // specification. The lists are extracted like so:
    // $$('#table-binary-unicode-properties > figure > table > tbody > tr > td:nth-child(1) code').map(el => el.innerText)

    // #table-binary-unicode-properties
    var ecma9BinaryProperties = "ASCII ASCII_Hex_Digit AHex Alphabetic Alpha Any Assigned Bidi_Control Bidi_C Bidi_Mirrored Bidi_M Case_Ignorable CI Cased Changes_When_Casefolded CWCF Changes_When_Casemapped CWCM Changes_When_Lowercased CWL Changes_When_NFKC_Casefolded CWKCF Changes_When_Titlecased CWT Changes_When_Uppercased CWU Dash Default_Ignorable_Code_Point DI Deprecated Dep Diacritic Dia Emoji Emoji_Component Emoji_Modifier Emoji_Modifier_Base Emoji_Presentation Extender Ext Grapheme_Base Gr_Base Grapheme_Extend Gr_Ext Hex_Digit Hex IDS_Binary_Operator IDSB IDS_Trinary_Operator IDST ID_Continue IDC ID_Start IDS Ideographic Ideo Join_Control Join_C Logical_Order_Exception LOE Lowercase Lower Math Noncharacter_Code_Point NChar Pattern_Syntax Pat_Syn Pattern_White_Space Pat_WS Quotation_Mark QMark Radical Regional_Indicator RI Sentence_Terminal STerm Soft_Dotted SD Terminal_Punctuation Term Unified_Ideograph UIdeo Uppercase Upper Variation_Selector VS White_Space space XID_Continue XIDC XID_Start XIDS";
    var ecma10BinaryProperties = ecma9BinaryProperties + " Extended_Pictographic";
    var ecma11BinaryProperties = ecma10BinaryProperties;
    var unicodeBinaryProperties = {
      9: ecma9BinaryProperties,
      10: ecma10BinaryProperties,
      11: ecma11BinaryProperties
    };

    // #table-unicode-general-category-values
    var unicodeGeneralCategoryValues = "Cased_Letter LC Close_Punctuation Pe Connector_Punctuation Pc Control Cc cntrl Currency_Symbol Sc Dash_Punctuation Pd Decimal_Number Nd digit Enclosing_Mark Me Final_Punctuation Pf Format Cf Initial_Punctuation Pi Letter L Letter_Number Nl Line_Separator Zl Lowercase_Letter Ll Mark M Combining_Mark Math_Symbol Sm Modifier_Letter Lm Modifier_Symbol Sk Nonspacing_Mark Mn Number N Open_Punctuation Ps Other C Other_Letter Lo Other_Number No Other_Punctuation Po Other_Symbol So Paragraph_Separator Zp Private_Use Co Punctuation P punct Separator Z Space_Separator Zs Spacing_Mark Mc Surrogate Cs Symbol S Titlecase_Letter Lt Unassigned Cn Uppercase_Letter Lu";

    // #table-unicode-script-values
    var ecma9ScriptValues = "Adlam Adlm Ahom Ahom Anatolian_Hieroglyphs Hluw Arabic Arab Armenian Armn Avestan Avst Balinese Bali Bamum Bamu Bassa_Vah Bass Batak Batk Bengali Beng Bhaiksuki Bhks Bopomofo Bopo Brahmi Brah Braille Brai Buginese Bugi Buhid Buhd Canadian_Aboriginal Cans Carian Cari Caucasian_Albanian Aghb Chakma Cakm Cham Cham Cherokee Cher Common Zyyy Coptic Copt Qaac Cuneiform Xsux Cypriot Cprt Cyrillic Cyrl Deseret Dsrt Devanagari Deva Duployan Dupl Egyptian_Hieroglyphs Egyp Elbasan Elba Ethiopic Ethi Georgian Geor Glagolitic Glag Gothic Goth Grantha Gran Greek Grek Gujarati Gujr Gurmukhi Guru Han Hani Hangul Hang Hanunoo Hano Hatran Hatr Hebrew Hebr Hiragana Hira Imperial_Aramaic Armi Inherited Zinh Qaai Inscriptional_Pahlavi Phli Inscriptional_Parthian Prti Javanese Java Kaithi Kthi Kannada Knda Katakana Kana Kayah_Li Kali Kharoshthi Khar Khmer Khmr Khojki Khoj Khudawadi Sind Lao Laoo Latin Latn Lepcha Lepc Limbu Limb Linear_A Lina Linear_B Linb Lisu Lisu Lycian Lyci Lydian Lydi Mahajani Mahj Malayalam Mlym Mandaic Mand Manichaean Mani Marchen Marc Masaram_Gondi Gonm Meetei_Mayek Mtei Mende_Kikakui Mend Meroitic_Cursive Merc Meroitic_Hieroglyphs Mero Miao Plrd Modi Modi Mongolian Mong Mro Mroo Multani Mult Myanmar Mymr Nabataean Nbat New_Tai_Lue Talu Newa Newa Nko Nkoo Nushu Nshu Ogham Ogam Ol_Chiki Olck Old_Hungarian Hung Old_Italic Ital Old_North_Arabian Narb Old_Permic Perm Old_Persian Xpeo Old_South_Arabian Sarb Old_Turkic Orkh Oriya Orya Osage Osge Osmanya Osma Pahawh_Hmong Hmng Palmyrene Palm Pau_Cin_Hau Pauc Phags_Pa Phag Phoenician Phnx Psalter_Pahlavi Phlp Rejang Rjng Runic Runr Samaritan Samr Saurashtra Saur Sharada Shrd Shavian Shaw Siddham Sidd SignWriting Sgnw Sinhala Sinh Sora_Sompeng Sora Soyombo Soyo Sundanese Sund Syloti_Nagri Sylo Syriac Syrc Tagalog Tglg Tagbanwa Tagb Tai_Le Tale Tai_Tham Lana Tai_Viet Tavt Takri Takr Tamil Taml Tangut Tang Telugu Telu Thaana Thaa Thai Thai Tibetan Tibt Tifinagh Tfng Tirhuta Tirh Ugaritic Ugar Vai Vaii Warang_Citi Wara Yi Yiii Zanabazar_Square Zanb";
    var ecma10ScriptValues = ecma9ScriptValues + " Dogra Dogr Gunjala_Gondi Gong Hanifi_Rohingya Rohg Makasar Maka Medefaidrin Medf Old_Sogdian Sogo Sogdian Sogd";
    var ecma11ScriptValues = ecma10ScriptValues + " Elymaic Elym Nandinagari Nand Nyiakeng_Puachue_Hmong Hmnp Wancho Wcho";
    var unicodeScriptValues = {
      9: ecma9ScriptValues,
      10: ecma10ScriptValues,
      11: ecma11ScriptValues
    };

    var data = {};
    function buildUnicodeData(ecmaVersion) {
      var d = data[ecmaVersion] = {
        binary: wordsRegexp(unicodeBinaryProperties[ecmaVersion] + " " + unicodeGeneralCategoryValues),
        nonBinary: {
          General_Category: wordsRegexp(unicodeGeneralCategoryValues),
          Script: wordsRegexp(unicodeScriptValues[ecmaVersion])
        }
      };
      d.nonBinary.Script_Extensions = d.nonBinary.Script;

      d.nonBinary.gc = d.nonBinary.General_Category;
      d.nonBinary.sc = d.nonBinary.Script;
      d.nonBinary.scx = d.nonBinary.Script_Extensions;
    }
    buildUnicodeData(9);
    buildUnicodeData(10);
    buildUnicodeData(11);

    var pp$8 = Parser$1.prototype;

    var RegExpValidationState = function RegExpValidationState(parser) {
      this.parser = parser;
      this.validFlags = "gim" + (parser.options.ecmaVersion >= 6 ? "uy" : "") + (parser.options.ecmaVersion >= 9 ? "s" : "");
      this.unicodeProperties = data[parser.options.ecmaVersion >= 11 ? 11 : parser.options.ecmaVersion];
      this.source = "";
      this.flags = "";
      this.start = 0;
      this.switchU = false;
      this.switchN = false;
      this.pos = 0;
      this.lastIntValue = 0;
      this.lastStringValue = "";
      this.lastAssertionIsQuantifiable = false;
      this.numCapturingParens = 0;
      this.maxBackReference = 0;
      this.groupNames = [];
      this.backReferenceNames = [];
    };

    RegExpValidationState.prototype.reset = function reset (start, pattern, flags) {
      var unicode = flags.indexOf("u") !== -1;
      this.start = start | 0;
      this.source = pattern + "";
      this.flags = flags;
      this.switchU = unicode && this.parser.options.ecmaVersion >= 6;
      this.switchN = unicode && this.parser.options.ecmaVersion >= 9;
    };

    RegExpValidationState.prototype.raise = function raise (message) {
      this.parser.raiseRecoverable(this.start, ("Invalid regular expression: /" + (this.source) + "/: " + message));
    };

    // If u flag is given, this returns the code point at the index (it combines a surrogate pair).
    // Otherwise, this returns the code unit of the index (can be a part of a surrogate pair).
    RegExpValidationState.prototype.at = function at (i, forceU) {
        if ( forceU === void 0 ) forceU = false;

      var s = this.source;
      var l = s.length;
      if (i >= l) {
        return -1
      }
      var c = s.charCodeAt(i);
      if (!(forceU || this.switchU) || c <= 0xD7FF || c >= 0xE000 || i + 1 >= l) {
        return c
      }
      var next = s.charCodeAt(i + 1);
      return next >= 0xDC00 && next <= 0xDFFF ? (c << 10) + next - 0x35FDC00 : c
    };

    RegExpValidationState.prototype.nextIndex = function nextIndex (i, forceU) {
        if ( forceU === void 0 ) forceU = false;

      var s = this.source;
      var l = s.length;
      if (i >= l) {
        return l
      }
      var c = s.charCodeAt(i), next;
      if (!(forceU || this.switchU) || c <= 0xD7FF || c >= 0xE000 || i + 1 >= l ||
          (next = s.charCodeAt(i + 1)) < 0xDC00 || next > 0xDFFF) {
        return i + 1
      }
      return i + 2
    };

    RegExpValidationState.prototype.current = function current (forceU) {
        if ( forceU === void 0 ) forceU = false;

      return this.at(this.pos, forceU)
    };

    RegExpValidationState.prototype.lookahead = function lookahead (forceU) {
        if ( forceU === void 0 ) forceU = false;

      return this.at(this.nextIndex(this.pos, forceU), forceU)
    };

    RegExpValidationState.prototype.advance = function advance (forceU) {
        if ( forceU === void 0 ) forceU = false;

      this.pos = this.nextIndex(this.pos, forceU);
    };

    RegExpValidationState.prototype.eat = function eat (ch, forceU) {
        if ( forceU === void 0 ) forceU = false;

      if (this.current(forceU) === ch) {
        this.advance(forceU);
        return true
      }
      return false
    };

    function codePointToString(ch) {
      if (ch <= 0xFFFF) { return String.fromCharCode(ch) }
      ch -= 0x10000;
      return String.fromCharCode((ch >> 10) + 0xD800, (ch & 0x03FF) + 0xDC00)
    }

    /**
     * Validate the flags part of a given RegExpLiteral.
     *
     * @param {RegExpValidationState} state The state to validate RegExp.
     * @returns {void}
     */
    pp$8.validateRegExpFlags = function(state) {
      var validFlags = state.validFlags;
      var flags = state.flags;

      for (var i = 0; i < flags.length; i++) {
        var flag = flags.charAt(i);
        if (validFlags.indexOf(flag) === -1) {
          this.raise(state.start, "Invalid regular expression flag");
        }
        if (flags.indexOf(flag, i + 1) > -1) {
          this.raise(state.start, "Duplicate regular expression flag");
        }
      }
    };

    /**
     * Validate the pattern part of a given RegExpLiteral.
     *
     * @param {RegExpValidationState} state The state to validate RegExp.
     * @returns {void}
     */
    pp$8.validateRegExpPattern = function(state) {
      this.regexp_pattern(state);

      // The goal symbol for the parse is |Pattern[~U, ~N]|. If the result of
      // parsing contains a |GroupName|, reparse with the goal symbol
      // |Pattern[~U, +N]| and use this result instead. Throw a *SyntaxError*
      // exception if _P_ did not conform to the grammar, if any elements of _P_
      // were not matched by the parse, or if any Early Error conditions exist.
      if (!state.switchN && this.options.ecmaVersion >= 9 && state.groupNames.length > 0) {
        state.switchN = true;
        this.regexp_pattern(state);
      }
    };

    // https://www.ecma-international.org/ecma-262/8.0/#prod-Pattern
    pp$8.regexp_pattern = function(state) {
      state.pos = 0;
      state.lastIntValue = 0;
      state.lastStringValue = "";
      state.lastAssertionIsQuantifiable = false;
      state.numCapturingParens = 0;
      state.maxBackReference = 0;
      state.groupNames.length = 0;
      state.backReferenceNames.length = 0;

      this.regexp_disjunction(state);

      if (state.pos !== state.source.length) {
        // Make the same messages as V8.
        if (state.eat(0x29 /* ) */)) {
          state.raise("Unmatched ')'");
        }
        if (state.eat(0x5D /* ] */) || state.eat(0x7D /* } */)) {
          state.raise("Lone quantifier brackets");
        }
      }
      if (state.maxBackReference > state.numCapturingParens) {
        state.raise("Invalid escape");
      }
      for (var i = 0, list = state.backReferenceNames; i < list.length; i += 1) {
        var name = list[i];

        if (state.groupNames.indexOf(name) === -1) {
          state.raise("Invalid named capture referenced");
        }
      }
    };

    // https://www.ecma-international.org/ecma-262/8.0/#prod-Disjunction
    pp$8.regexp_disjunction = function(state) {
      this.regexp_alternative(state);
      while (state.eat(0x7C /* | */)) {
        this.regexp_alternative(state);
      }

      // Make the same message as V8.
      if (this.regexp_eatQuantifier(state, true)) {
        state.raise("Nothing to repeat");
      }
      if (state.eat(0x7B /* { */)) {
        state.raise("Lone quantifier brackets");
      }
    };

    // https://www.ecma-international.org/ecma-262/8.0/#prod-Alternative
    pp$8.regexp_alternative = function(state) {
      while (state.pos < state.source.length && this.regexp_eatTerm(state))
        { }
    };

    // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-Term
    pp$8.regexp_eatTerm = function(state) {
      if (this.regexp_eatAssertion(state)) {
        // Handle `QuantifiableAssertion Quantifier` alternative.
        // `state.lastAssertionIsQuantifiable` is true if the last eaten Assertion
        // is a QuantifiableAssertion.
        if (state.lastAssertionIsQuantifiable && this.regexp_eatQuantifier(state)) {
          // Make the same message as V8.
          if (state.switchU) {
            state.raise("Invalid quantifier");
          }
        }
        return true
      }

      if (state.switchU ? this.regexp_eatAtom(state) : this.regexp_eatExtendedAtom(state)) {
        this.regexp_eatQuantifier(state);
        return true
      }

      return false
    };

    // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-Assertion
    pp$8.regexp_eatAssertion = function(state) {
      var start = state.pos;
      state.lastAssertionIsQuantifiable = false;

      // ^, $
      if (state.eat(0x5E /* ^ */) || state.eat(0x24 /* $ */)) {
        return true
      }

      // \b \B
      if (state.eat(0x5C /* \ */)) {
        if (state.eat(0x42 /* B */) || state.eat(0x62 /* b */)) {
          return true
        }
        state.pos = start;
      }

      // Lookahead / Lookbehind
      if (state.eat(0x28 /* ( */) && state.eat(0x3F /* ? */)) {
        var lookbehind = false;
        if (this.options.ecmaVersion >= 9) {
          lookbehind = state.eat(0x3C /* < */);
        }
        if (state.eat(0x3D /* = */) || state.eat(0x21 /* ! */)) {
          this.regexp_disjunction(state);
          if (!state.eat(0x29 /* ) */)) {
            state.raise("Unterminated group");
          }
          state.lastAssertionIsQuantifiable = !lookbehind;
          return true
        }
      }

      state.pos = start;
      return false
    };

    // https://www.ecma-international.org/ecma-262/8.0/#prod-Quantifier
    pp$8.regexp_eatQuantifier = function(state, noError) {
      if ( noError === void 0 ) noError = false;

      if (this.regexp_eatQuantifierPrefix(state, noError)) {
        state.eat(0x3F /* ? */);
        return true
      }
      return false
    };

    // https://www.ecma-international.org/ecma-262/8.0/#prod-QuantifierPrefix
    pp$8.regexp_eatQuantifierPrefix = function(state, noError) {
      return (
        state.eat(0x2A /* * */) ||
        state.eat(0x2B /* + */) ||
        state.eat(0x3F /* ? */) ||
        this.regexp_eatBracedQuantifier(state, noError)
      )
    };
    pp$8.regexp_eatBracedQuantifier = function(state, noError) {
      var start = state.pos;
      if (state.eat(0x7B /* { */)) {
        var min = 0, max = -1;
        if (this.regexp_eatDecimalDigits(state)) {
          min = state.lastIntValue;
          if (state.eat(0x2C /* , */) && this.regexp_eatDecimalDigits(state)) {
            max = state.lastIntValue;
          }
          if (state.eat(0x7D /* } */)) {
            // SyntaxError in https://www.ecma-international.org/ecma-262/8.0/#sec-term
            if (max !== -1 && max < min && !noError) {
              state.raise("numbers out of order in {} quantifier");
            }
            return true
          }
        }
        if (state.switchU && !noError) {
          state.raise("Incomplete quantifier");
        }
        state.pos = start;
      }
      return false
    };

    // https://www.ecma-international.org/ecma-262/8.0/#prod-Atom
    pp$8.regexp_eatAtom = function(state) {
      return (
        this.regexp_eatPatternCharacters(state) ||
        state.eat(0x2E /* . */) ||
        this.regexp_eatReverseSolidusAtomEscape(state) ||
        this.regexp_eatCharacterClass(state) ||
        this.regexp_eatUncapturingGroup(state) ||
        this.regexp_eatCapturingGroup(state)
      )
    };
    pp$8.regexp_eatReverseSolidusAtomEscape = function(state) {
      var start = state.pos;
      if (state.eat(0x5C /* \ */)) {
        if (this.regexp_eatAtomEscape(state)) {
          return true
        }
        state.pos = start;
      }
      return false
    };
    pp$8.regexp_eatUncapturingGroup = function(state) {
      var start = state.pos;
      if (state.eat(0x28 /* ( */)) {
        if (state.eat(0x3F /* ? */) && state.eat(0x3A /* : */)) {
          this.regexp_disjunction(state);
          if (state.eat(0x29 /* ) */)) {
            return true
          }
          state.raise("Unterminated group");
        }
        state.pos = start;
      }
      return false
    };
    pp$8.regexp_eatCapturingGroup = function(state) {
      if (state.eat(0x28 /* ( */)) {
        if (this.options.ecmaVersion >= 9) {
          this.regexp_groupSpecifier(state);
        } else if (state.current() === 0x3F /* ? */) {
          state.raise("Invalid group");
        }
        this.regexp_disjunction(state);
        if (state.eat(0x29 /* ) */)) {
          state.numCapturingParens += 1;
          return true
        }
        state.raise("Unterminated group");
      }
      return false
    };

    // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ExtendedAtom
    pp$8.regexp_eatExtendedAtom = function(state) {
      return (
        state.eat(0x2E /* . */) ||
        this.regexp_eatReverseSolidusAtomEscape(state) ||
        this.regexp_eatCharacterClass(state) ||
        this.regexp_eatUncapturingGroup(state) ||
        this.regexp_eatCapturingGroup(state) ||
        this.regexp_eatInvalidBracedQuantifier(state) ||
        this.regexp_eatExtendedPatternCharacter(state)
      )
    };

    // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-InvalidBracedQuantifier
    pp$8.regexp_eatInvalidBracedQuantifier = function(state) {
      if (this.regexp_eatBracedQuantifier(state, true)) {
        state.raise("Nothing to repeat");
      }
      return false
    };

    // https://www.ecma-international.org/ecma-262/8.0/#prod-SyntaxCharacter
    pp$8.regexp_eatSyntaxCharacter = function(state) {
      var ch = state.current();
      if (isSyntaxCharacter(ch)) {
        state.lastIntValue = ch;
        state.advance();
        return true
      }
      return false
    };
    function isSyntaxCharacter(ch) {
      return (
        ch === 0x24 /* $ */ ||
        ch >= 0x28 /* ( */ && ch <= 0x2B /* + */ ||
        ch === 0x2E /* . */ ||
        ch === 0x3F /* ? */ ||
        ch >= 0x5B /* [ */ && ch <= 0x5E /* ^ */ ||
        ch >= 0x7B /* { */ && ch <= 0x7D /* } */
      )
    }

    // https://www.ecma-international.org/ecma-262/8.0/#prod-PatternCharacter
    // But eat eager.
    pp$8.regexp_eatPatternCharacters = function(state) {
      var start = state.pos;
      var ch = 0;
      while ((ch = state.current()) !== -1 && !isSyntaxCharacter(ch)) {
        state.advance();
      }
      return state.pos !== start
    };

    // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ExtendedPatternCharacter
    pp$8.regexp_eatExtendedPatternCharacter = function(state) {
      var ch = state.current();
      if (
        ch !== -1 &&
        ch !== 0x24 /* $ */ &&
        !(ch >= 0x28 /* ( */ && ch <= 0x2B /* + */) &&
        ch !== 0x2E /* . */ &&
        ch !== 0x3F /* ? */ &&
        ch !== 0x5B /* [ */ &&
        ch !== 0x5E /* ^ */ &&
        ch !== 0x7C /* | */
      ) {
        state.advance();
        return true
      }
      return false
    };

    // GroupSpecifier ::
    //   [empty]
    //   `?` GroupName
    pp$8.regexp_groupSpecifier = function(state) {
      if (state.eat(0x3F /* ? */)) {
        if (this.regexp_eatGroupName(state)) {
          if (state.groupNames.indexOf(state.lastStringValue) !== -1) {
            state.raise("Duplicate capture group name");
          }
          state.groupNames.push(state.lastStringValue);
          return
        }
        state.raise("Invalid group");
      }
    };

    // GroupName ::
    //   `<` RegExpIdentifierName `>`
    // Note: this updates `state.lastStringValue` property with the eaten name.
    pp$8.regexp_eatGroupName = function(state) {
      state.lastStringValue = "";
      if (state.eat(0x3C /* < */)) {
        if (this.regexp_eatRegExpIdentifierName(state) && state.eat(0x3E /* > */)) {
          return true
        }
        state.raise("Invalid capture group name");
      }
      return false
    };

    // RegExpIdentifierName ::
    //   RegExpIdentifierStart
    //   RegExpIdentifierName RegExpIdentifierPart
    // Note: this updates `state.lastStringValue` property with the eaten name.
    pp$8.regexp_eatRegExpIdentifierName = function(state) {
      state.lastStringValue = "";
      if (this.regexp_eatRegExpIdentifierStart(state)) {
        state.lastStringValue += codePointToString(state.lastIntValue);
        while (this.regexp_eatRegExpIdentifierPart(state)) {
          state.lastStringValue += codePointToString(state.lastIntValue);
        }
        return true
      }
      return false
    };

    // RegExpIdentifierStart ::
    //   UnicodeIDStart
    //   `$`
    //   `_`
    //   `\` RegExpUnicodeEscapeSequence[+U]
    pp$8.regexp_eatRegExpIdentifierStart = function(state) {
      var start = state.pos;
      var forceU = this.options.ecmaVersion >= 11;
      var ch = state.current(forceU);
      state.advance(forceU);

      if (ch === 0x5C /* \ */ && this.regexp_eatRegExpUnicodeEscapeSequence(state, forceU)) {
        ch = state.lastIntValue;
      }
      if (isRegExpIdentifierStart(ch)) {
        state.lastIntValue = ch;
        return true
      }

      state.pos = start;
      return false
    };
    function isRegExpIdentifierStart(ch) {
      return isIdentifierStart(ch, true) || ch === 0x24 /* $ */ || ch === 0x5F /* _ */
    }

    // RegExpIdentifierPart ::
    //   UnicodeIDContinue
    //   `$`
    //   `_`
    //   `\` RegExpUnicodeEscapeSequence[+U]
    //   <ZWNJ>
    //   <ZWJ>
    pp$8.regexp_eatRegExpIdentifierPart = function(state) {
      var start = state.pos;
      var forceU = this.options.ecmaVersion >= 11;
      var ch = state.current(forceU);
      state.advance(forceU);

      if (ch === 0x5C /* \ */ && this.regexp_eatRegExpUnicodeEscapeSequence(state, forceU)) {
        ch = state.lastIntValue;
      }
      if (isRegExpIdentifierPart(ch)) {
        state.lastIntValue = ch;
        return true
      }

      state.pos = start;
      return false
    };
    function isRegExpIdentifierPart(ch) {
      return isIdentifierChar(ch, true) || ch === 0x24 /* $ */ || ch === 0x5F /* _ */ || ch === 0x200C /* <ZWNJ> */ || ch === 0x200D /* <ZWJ> */
    }

    // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-AtomEscape
    pp$8.regexp_eatAtomEscape = function(state) {
      if (
        this.regexp_eatBackReference(state) ||
        this.regexp_eatCharacterClassEscape(state) ||
        this.regexp_eatCharacterEscape(state) ||
        (state.switchN && this.regexp_eatKGroupName(state))
      ) {
        return true
      }
      if (state.switchU) {
        // Make the same message as V8.
        if (state.current() === 0x63 /* c */) {
          state.raise("Invalid unicode escape");
        }
        state.raise("Invalid escape");
      }
      return false
    };
    pp$8.regexp_eatBackReference = function(state) {
      var start = state.pos;
      if (this.regexp_eatDecimalEscape(state)) {
        var n = state.lastIntValue;
        if (state.switchU) {
          // For SyntaxError in https://www.ecma-international.org/ecma-262/8.0/#sec-atomescape
          if (n > state.maxBackReference) {
            state.maxBackReference = n;
          }
          return true
        }
        if (n <= state.numCapturingParens) {
          return true
        }
        state.pos = start;
      }
      return false
    };
    pp$8.regexp_eatKGroupName = function(state) {
      if (state.eat(0x6B /* k */)) {
        if (this.regexp_eatGroupName(state)) {
          state.backReferenceNames.push(state.lastStringValue);
          return true
        }
        state.raise("Invalid named reference");
      }
      return false
    };

    // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-CharacterEscape
    pp$8.regexp_eatCharacterEscape = function(state) {
      return (
        this.regexp_eatControlEscape(state) ||
        this.regexp_eatCControlLetter(state) ||
        this.regexp_eatZero(state) ||
        this.regexp_eatHexEscapeSequence(state) ||
        this.regexp_eatRegExpUnicodeEscapeSequence(state, false) ||
        (!state.switchU && this.regexp_eatLegacyOctalEscapeSequence(state)) ||
        this.regexp_eatIdentityEscape(state)
      )
    };
    pp$8.regexp_eatCControlLetter = function(state) {
      var start = state.pos;
      if (state.eat(0x63 /* c */)) {
        if (this.regexp_eatControlLetter(state)) {
          return true
        }
        state.pos = start;
      }
      return false
    };
    pp$8.regexp_eatZero = function(state) {
      if (state.current() === 0x30 /* 0 */ && !isDecimalDigit(state.lookahead())) {
        state.lastIntValue = 0;
        state.advance();
        return true
      }
      return false
    };

    // https://www.ecma-international.org/ecma-262/8.0/#prod-ControlEscape
    pp$8.regexp_eatControlEscape = function(state) {
      var ch = state.current();
      if (ch === 0x74 /* t */) {
        state.lastIntValue = 0x09; /* \t */
        state.advance();
        return true
      }
      if (ch === 0x6E /* n */) {
        state.lastIntValue = 0x0A; /* \n */
        state.advance();
        return true
      }
      if (ch === 0x76 /* v */) {
        state.lastIntValue = 0x0B; /* \v */
        state.advance();
        return true
      }
      if (ch === 0x66 /* f */) {
        state.lastIntValue = 0x0C; /* \f */
        state.advance();
        return true
      }
      if (ch === 0x72 /* r */) {
        state.lastIntValue = 0x0D; /* \r */
        state.advance();
        return true
      }
      return false
    };

    // https://www.ecma-international.org/ecma-262/8.0/#prod-ControlLetter
    pp$8.regexp_eatControlLetter = function(state) {
      var ch = state.current();
      if (isControlLetter(ch)) {
        state.lastIntValue = ch % 0x20;
        state.advance();
        return true
      }
      return false
    };
    function isControlLetter(ch) {
      return (
        (ch >= 0x41 /* A */ && ch <= 0x5A /* Z */) ||
        (ch >= 0x61 /* a */ && ch <= 0x7A /* z */)
      )
    }

    // https://www.ecma-international.org/ecma-262/8.0/#prod-RegExpUnicodeEscapeSequence
    pp$8.regexp_eatRegExpUnicodeEscapeSequence = function(state, forceU) {
      if ( forceU === void 0 ) forceU = false;

      var start = state.pos;
      var switchU = forceU || state.switchU;

      if (state.eat(0x75 /* u */)) {
        if (this.regexp_eatFixedHexDigits(state, 4)) {
          var lead = state.lastIntValue;
          if (switchU && lead >= 0xD800 && lead <= 0xDBFF) {
            var leadSurrogateEnd = state.pos;
            if (state.eat(0x5C /* \ */) && state.eat(0x75 /* u */) && this.regexp_eatFixedHexDigits(state, 4)) {
              var trail = state.lastIntValue;
              if (trail >= 0xDC00 && trail <= 0xDFFF) {
                state.lastIntValue = (lead - 0xD800) * 0x400 + (trail - 0xDC00) + 0x10000;
                return true
              }
            }
            state.pos = leadSurrogateEnd;
            state.lastIntValue = lead;
          }
          return true
        }
        if (
          switchU &&
          state.eat(0x7B /* { */) &&
          this.regexp_eatHexDigits(state) &&
          state.eat(0x7D /* } */) &&
          isValidUnicode(state.lastIntValue)
        ) {
          return true
        }
        if (switchU) {
          state.raise("Invalid unicode escape");
        }
        state.pos = start;
      }

      return false
    };
    function isValidUnicode(ch) {
      return ch >= 0 && ch <= 0x10FFFF
    }

    // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-IdentityEscape
    pp$8.regexp_eatIdentityEscape = function(state) {
      if (state.switchU) {
        if (this.regexp_eatSyntaxCharacter(state)) {
          return true
        }
        if (state.eat(0x2F /* / */)) {
          state.lastIntValue = 0x2F; /* / */
          return true
        }
        return false
      }

      var ch = state.current();
      if (ch !== 0x63 /* c */ && (!state.switchN || ch !== 0x6B /* k */)) {
        state.lastIntValue = ch;
        state.advance();
        return true
      }

      return false
    };

    // https://www.ecma-international.org/ecma-262/8.0/#prod-DecimalEscape
    pp$8.regexp_eatDecimalEscape = function(state) {
      state.lastIntValue = 0;
      var ch = state.current();
      if (ch >= 0x31 /* 1 */ && ch <= 0x39 /* 9 */) {
        do {
          state.lastIntValue = 10 * state.lastIntValue + (ch - 0x30 /* 0 */);
          state.advance();
        } while ((ch = state.current()) >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */)
        return true
      }
      return false
    };

    // https://www.ecma-international.org/ecma-262/8.0/#prod-CharacterClassEscape
    pp$8.regexp_eatCharacterClassEscape = function(state) {
      var ch = state.current();

      if (isCharacterClassEscape(ch)) {
        state.lastIntValue = -1;
        state.advance();
        return true
      }

      if (
        state.switchU &&
        this.options.ecmaVersion >= 9 &&
        (ch === 0x50 /* P */ || ch === 0x70 /* p */)
      ) {
        state.lastIntValue = -1;
        state.advance();
        if (
          state.eat(0x7B /* { */) &&
          this.regexp_eatUnicodePropertyValueExpression(state) &&
          state.eat(0x7D /* } */)
        ) {
          return true
        }
        state.raise("Invalid property name");
      }

      return false
    };
    function isCharacterClassEscape(ch) {
      return (
        ch === 0x64 /* d */ ||
        ch === 0x44 /* D */ ||
        ch === 0x73 /* s */ ||
        ch === 0x53 /* S */ ||
        ch === 0x77 /* w */ ||
        ch === 0x57 /* W */
      )
    }

    // UnicodePropertyValueExpression ::
    //   UnicodePropertyName `=` UnicodePropertyValue
    //   LoneUnicodePropertyNameOrValue
    pp$8.regexp_eatUnicodePropertyValueExpression = function(state) {
      var start = state.pos;

      // UnicodePropertyName `=` UnicodePropertyValue
      if (this.regexp_eatUnicodePropertyName(state) && state.eat(0x3D /* = */)) {
        var name = state.lastStringValue;
        if (this.regexp_eatUnicodePropertyValue(state)) {
          var value = state.lastStringValue;
          this.regexp_validateUnicodePropertyNameAndValue(state, name, value);
          return true
        }
      }
      state.pos = start;

      // LoneUnicodePropertyNameOrValue
      if (this.regexp_eatLoneUnicodePropertyNameOrValue(state)) {
        var nameOrValue = state.lastStringValue;
        this.regexp_validateUnicodePropertyNameOrValue(state, nameOrValue);
        return true
      }
      return false
    };
    pp$8.regexp_validateUnicodePropertyNameAndValue = function(state, name, value) {
      if (!has(state.unicodeProperties.nonBinary, name))
        { state.raise("Invalid property name"); }
      if (!state.unicodeProperties.nonBinary[name].test(value))
        { state.raise("Invalid property value"); }
    };
    pp$8.regexp_validateUnicodePropertyNameOrValue = function(state, nameOrValue) {
      if (!state.unicodeProperties.binary.test(nameOrValue))
        { state.raise("Invalid property name"); }
    };

    // UnicodePropertyName ::
    //   UnicodePropertyNameCharacters
    pp$8.regexp_eatUnicodePropertyName = function(state) {
      var ch = 0;
      state.lastStringValue = "";
      while (isUnicodePropertyNameCharacter(ch = state.current())) {
        state.lastStringValue += codePointToString(ch);
        state.advance();
      }
      return state.lastStringValue !== ""
    };
    function isUnicodePropertyNameCharacter(ch) {
      return isControlLetter(ch) || ch === 0x5F /* _ */
    }

    // UnicodePropertyValue ::
    //   UnicodePropertyValueCharacters
    pp$8.regexp_eatUnicodePropertyValue = function(state) {
      var ch = 0;
      state.lastStringValue = "";
      while (isUnicodePropertyValueCharacter(ch = state.current())) {
        state.lastStringValue += codePointToString(ch);
        state.advance();
      }
      return state.lastStringValue !== ""
    };
    function isUnicodePropertyValueCharacter(ch) {
      return isUnicodePropertyNameCharacter(ch) || isDecimalDigit(ch)
    }

    // LoneUnicodePropertyNameOrValue ::
    //   UnicodePropertyValueCharacters
    pp$8.regexp_eatLoneUnicodePropertyNameOrValue = function(state) {
      return this.regexp_eatUnicodePropertyValue(state)
    };

    // https://www.ecma-international.org/ecma-262/8.0/#prod-CharacterClass
    pp$8.regexp_eatCharacterClass = function(state) {
      if (state.eat(0x5B /* [ */)) {
        state.eat(0x5E /* ^ */);
        this.regexp_classRanges(state);
        if (state.eat(0x5D /* ] */)) {
          return true
        }
        // Unreachable since it threw "unterminated regular expression" error before.
        state.raise("Unterminated character class");
      }
      return false
    };

    // https://www.ecma-international.org/ecma-262/8.0/#prod-ClassRanges
    // https://www.ecma-international.org/ecma-262/8.0/#prod-NonemptyClassRanges
    // https://www.ecma-international.org/ecma-262/8.0/#prod-NonemptyClassRangesNoDash
    pp$8.regexp_classRanges = function(state) {
      while (this.regexp_eatClassAtom(state)) {
        var left = state.lastIntValue;
        if (state.eat(0x2D /* - */) && this.regexp_eatClassAtom(state)) {
          var right = state.lastIntValue;
          if (state.switchU && (left === -1 || right === -1)) {
            state.raise("Invalid character class");
          }
          if (left !== -1 && right !== -1 && left > right) {
            state.raise("Range out of order in character class");
          }
        }
      }
    };

    // https://www.ecma-international.org/ecma-262/8.0/#prod-ClassAtom
    // https://www.ecma-international.org/ecma-262/8.0/#prod-ClassAtomNoDash
    pp$8.regexp_eatClassAtom = function(state) {
      var start = state.pos;

      if (state.eat(0x5C /* \ */)) {
        if (this.regexp_eatClassEscape(state)) {
          return true
        }
        if (state.switchU) {
          // Make the same message as V8.
          var ch$1 = state.current();
          if (ch$1 === 0x63 /* c */ || isOctalDigit(ch$1)) {
            state.raise("Invalid class escape");
          }
          state.raise("Invalid escape");
        }
        state.pos = start;
      }

      var ch = state.current();
      if (ch !== 0x5D /* ] */) {
        state.lastIntValue = ch;
        state.advance();
        return true
      }

      return false
    };

    // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ClassEscape
    pp$8.regexp_eatClassEscape = function(state) {
      var start = state.pos;

      if (state.eat(0x62 /* b */)) {
        state.lastIntValue = 0x08; /* <BS> */
        return true
      }

      if (state.switchU && state.eat(0x2D /* - */)) {
        state.lastIntValue = 0x2D; /* - */
        return true
      }

      if (!state.switchU && state.eat(0x63 /* c */)) {
        if (this.regexp_eatClassControlLetter(state)) {
          return true
        }
        state.pos = start;
      }

      return (
        this.regexp_eatCharacterClassEscape(state) ||
        this.regexp_eatCharacterEscape(state)
      )
    };

    // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ClassControlLetter
    pp$8.regexp_eatClassControlLetter = function(state) {
      var ch = state.current();
      if (isDecimalDigit(ch) || ch === 0x5F /* _ */) {
        state.lastIntValue = ch % 0x20;
        state.advance();
        return true
      }
      return false
    };

    // https://www.ecma-international.org/ecma-262/8.0/#prod-HexEscapeSequence
    pp$8.regexp_eatHexEscapeSequence = function(state) {
      var start = state.pos;
      if (state.eat(0x78 /* x */)) {
        if (this.regexp_eatFixedHexDigits(state, 2)) {
          return true
        }
        if (state.switchU) {
          state.raise("Invalid escape");
        }
        state.pos = start;
      }
      return false
    };

    // https://www.ecma-international.org/ecma-262/8.0/#prod-DecimalDigits
    pp$8.regexp_eatDecimalDigits = function(state) {
      var start = state.pos;
      var ch = 0;
      state.lastIntValue = 0;
      while (isDecimalDigit(ch = state.current())) {
        state.lastIntValue = 10 * state.lastIntValue + (ch - 0x30 /* 0 */);
        state.advance();
      }
      return state.pos !== start
    };
    function isDecimalDigit(ch) {
      return ch >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */
    }

    // https://www.ecma-international.org/ecma-262/8.0/#prod-HexDigits
    pp$8.regexp_eatHexDigits = function(state) {
      var start = state.pos;
      var ch = 0;
      state.lastIntValue = 0;
      while (isHexDigit(ch = state.current())) {
        state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
        state.advance();
      }
      return state.pos !== start
    };
    function isHexDigit(ch) {
      return (
        (ch >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */) ||
        (ch >= 0x41 /* A */ && ch <= 0x46 /* F */) ||
        (ch >= 0x61 /* a */ && ch <= 0x66 /* f */)
      )
    }
    function hexToInt(ch) {
      if (ch >= 0x41 /* A */ && ch <= 0x46 /* F */) {
        return 10 + (ch - 0x41 /* A */)
      }
      if (ch >= 0x61 /* a */ && ch <= 0x66 /* f */) {
        return 10 + (ch - 0x61 /* a */)
      }
      return ch - 0x30 /* 0 */
    }

    // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-LegacyOctalEscapeSequence
    // Allows only 0-377(octal) i.e. 0-255(decimal).
    pp$8.regexp_eatLegacyOctalEscapeSequence = function(state) {
      if (this.regexp_eatOctalDigit(state)) {
        var n1 = state.lastIntValue;
        if (this.regexp_eatOctalDigit(state)) {
          var n2 = state.lastIntValue;
          if (n1 <= 3 && this.regexp_eatOctalDigit(state)) {
            state.lastIntValue = n1 * 64 + n2 * 8 + state.lastIntValue;
          } else {
            state.lastIntValue = n1 * 8 + n2;
          }
        } else {
          state.lastIntValue = n1;
        }
        return true
      }
      return false
    };

    // https://www.ecma-international.org/ecma-262/8.0/#prod-OctalDigit
    pp$8.regexp_eatOctalDigit = function(state) {
      var ch = state.current();
      if (isOctalDigit(ch)) {
        state.lastIntValue = ch - 0x30; /* 0 */
        state.advance();
        return true
      }
      state.lastIntValue = 0;
      return false
    };
    function isOctalDigit(ch) {
      return ch >= 0x30 /* 0 */ && ch <= 0x37 /* 7 */
    }

    // https://www.ecma-international.org/ecma-262/8.0/#prod-Hex4Digits
    // https://www.ecma-international.org/ecma-262/8.0/#prod-HexDigit
    // And HexDigit HexDigit in https://www.ecma-international.org/ecma-262/8.0/#prod-HexEscapeSequence
    pp$8.regexp_eatFixedHexDigits = function(state, length) {
      var start = state.pos;
      state.lastIntValue = 0;
      for (var i = 0; i < length; ++i) {
        var ch = state.current();
        if (!isHexDigit(ch)) {
          state.pos = start;
          return false
        }
        state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
        state.advance();
      }
      return true
    };

    // Object type used to represent tokens. Note that normally, tokens
    // simply exist as properties on the parser object. This is only
    // used for the onToken callback and the external tokenizer.

    var Token = function Token(p) {
      this.type = p.type;
      this.value = p.value;
      this.start = p.start;
      this.end = p.end;
      if (p.options.locations)
        { this.loc = new SourceLocation(p, p.startLoc, p.endLoc); }
      if (p.options.ranges)
        { this.range = [p.start, p.end]; }
    };

    // ## Tokenizer

    var pp$9 = Parser$1.prototype;

    // Move to the next token

    pp$9.next = function(ignoreEscapeSequenceInKeyword) {
      if (!ignoreEscapeSequenceInKeyword && this.type.keyword && this.containsEsc)
        { this.raiseRecoverable(this.start, "Escape sequence in keyword " + this.type.keyword); }
      if (this.options.onToken)
        { this.options.onToken(new Token(this)); }

      this.lastTokEnd = this.end;
      this.lastTokStart = this.start;
      this.lastTokEndLoc = this.endLoc;
      this.lastTokStartLoc = this.startLoc;
      this.nextToken();
    };

    pp$9.getToken = function() {
      this.next();
      return new Token(this)
    };

    // If we're in an ES6 environment, make parsers iterable
    if (typeof Symbol !== "undefined")
      { pp$9[Symbol.iterator] = function() {
        var this$1$1 = this;

        return {
          next: function () {
            var token = this$1$1.getToken();
            return {
              done: token.type === types.eof,
              value: token
            }
          }
        }
      }; }

    // Toggle strict mode. Re-reads the next number or string to please
    // pedantic tests (`"use strict"; 010;` should fail).

    pp$9.curContext = function() {
      return this.context[this.context.length - 1]
    };

    // Read a single token, updating the parser object's token-related
    // properties.

    pp$9.nextToken = function() {
      var curContext = this.curContext();
      if (!curContext || !curContext.preserveSpace) { this.skipSpace(); }

      this.start = this.pos;
      if (this.options.locations) { this.startLoc = this.curPosition(); }
      if (this.pos >= this.input.length) { return this.finishToken(types.eof) }

      if (curContext.override) { return curContext.override(this) }
      else { this.readToken(this.fullCharCodeAtPos()); }
    };

    pp$9.readToken = function(code) {
      // Identifier or keyword. '\uXXXX' sequences are allowed in
      // identifiers, so '\' also dispatches to that.
      if (isIdentifierStart(code, this.options.ecmaVersion >= 6) || code === 92 /* '\' */)
        { return this.readWord() }

      return this.getTokenFromCode(code)
    };

    pp$9.fullCharCodeAtPos = function() {
      var code = this.input.charCodeAt(this.pos);
      if (code <= 0xd7ff || code >= 0xe000) { return code }
      var next = this.input.charCodeAt(this.pos + 1);
      return (code << 10) + next - 0x35fdc00
    };

    pp$9.skipBlockComment = function() {
      var startLoc = this.options.onComment && this.curPosition();
      var start = this.pos, end = this.input.indexOf("*/", this.pos += 2);
      if (end === -1) { this.raise(this.pos - 2, "Unterminated comment"); }
      this.pos = end + 2;
      if (this.options.locations) {
        lineBreakG.lastIndex = start;
        var match;
        while ((match = lineBreakG.exec(this.input)) && match.index < this.pos) {
          ++this.curLine;
          this.lineStart = match.index + match[0].length;
        }
      }
      if (this.options.onComment)
        { this.options.onComment(true, this.input.slice(start + 2, end), start, this.pos,
                               startLoc, this.curPosition()); }
    };

    pp$9.skipLineComment = function(startSkip) {
      var start = this.pos;
      var startLoc = this.options.onComment && this.curPosition();
      var ch = this.input.charCodeAt(this.pos += startSkip);
      while (this.pos < this.input.length && !isNewLine(ch)) {
        ch = this.input.charCodeAt(++this.pos);
      }
      if (this.options.onComment)
        { this.options.onComment(false, this.input.slice(start + startSkip, this.pos), start, this.pos,
                               startLoc, this.curPosition()); }
    };

    // Called at the start of the parse and after every token. Skips
    // whitespace and comments, and.

    pp$9.skipSpace = function() {
      loop: while (this.pos < this.input.length) {
        var ch = this.input.charCodeAt(this.pos);
        switch (ch) {
        case 32: case 160: // ' '
          ++this.pos;
          break
        case 13:
          if (this.input.charCodeAt(this.pos + 1) === 10) {
            ++this.pos;
          }
        case 10: case 8232: case 8233:
          ++this.pos;
          if (this.options.locations) {
            ++this.curLine;
            this.lineStart = this.pos;
          }
          break
        case 47: // '/'
          switch (this.input.charCodeAt(this.pos + 1)) {
          case 42: // '*'
            this.skipBlockComment();
            break
          case 47:
            this.skipLineComment(2);
            break
          default:
            break loop
          }
          break
        default:
          if (ch > 8 && ch < 14 || ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
            ++this.pos;
          } else {
            break loop
          }
        }
      }
    };

    // Called at the end of every token. Sets `end`, `val`, and
    // maintains `context` and `exprAllowed`, and skips the space after
    // the token, so that the next one's `start` will point at the
    // right position.

    pp$9.finishToken = function(type, val) {
      this.end = this.pos;
      if (this.options.locations) { this.endLoc = this.curPosition(); }
      var prevType = this.type;
      this.type = type;
      this.value = val;

      this.updateContext(prevType);
    };

    // ### Token reading

    // This is the function that is called to fetch the next token. It
    // is somewhat obscure, because it works in character codes rather
    // than characters, and because operator parsing has been inlined
    // into it.
    //
    // All in the name of speed.
    //
    pp$9.readToken_dot = function() {
      var next = this.input.charCodeAt(this.pos + 1);
      if (next >= 48 && next <= 57) { return this.readNumber(true) }
      var next2 = this.input.charCodeAt(this.pos + 2);
      if (this.options.ecmaVersion >= 6 && next === 46 && next2 === 46) { // 46 = dot '.'
        this.pos += 3;
        return this.finishToken(types.ellipsis)
      } else {
        ++this.pos;
        return this.finishToken(types.dot)
      }
    };

    pp$9.readToken_slash = function() { // '/'
      var next = this.input.charCodeAt(this.pos + 1);
      if (this.exprAllowed) { ++this.pos; return this.readRegexp() }
      if (next === 61) { return this.finishOp(types.assign, 2) }
      return this.finishOp(types.slash, 1)
    };

    pp$9.readToken_mult_modulo_exp = function(code) { // '%*'
      var next = this.input.charCodeAt(this.pos + 1);
      var size = 1;
      var tokentype = code === 42 ? types.star : types.modulo;

      // exponentiation operator ** and **=
      if (this.options.ecmaVersion >= 7 && code === 42 && next === 42) {
        ++size;
        tokentype = types.starstar;
        next = this.input.charCodeAt(this.pos + 2);
      }

      if (next === 61) { return this.finishOp(types.assign, size + 1) }
      return this.finishOp(tokentype, size)
    };

    pp$9.readToken_pipe_amp = function(code) { // '|&'
      var next = this.input.charCodeAt(this.pos + 1);
      if (next === code) {
        if (this.options.ecmaVersion >= 12) {
          var next2 = this.input.charCodeAt(this.pos + 2);
          if (next2 === 61) { return this.finishOp(types.assign, 3) }
        }
        return this.finishOp(code === 124 ? types.logicalOR : types.logicalAND, 2)
      }
      if (next === 61) { return this.finishOp(types.assign, 2) }
      return this.finishOp(code === 124 ? types.bitwiseOR : types.bitwiseAND, 1)
    };

    pp$9.readToken_caret = function() { // '^'
      var next = this.input.charCodeAt(this.pos + 1);
      if (next === 61) { return this.finishOp(types.assign, 2) }
      return this.finishOp(types.bitwiseXOR, 1)
    };

    pp$9.readToken_plus_min = function(code) { // '+-'
      var next = this.input.charCodeAt(this.pos + 1);
      if (next === code) {
        if (next === 45 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 62 &&
            (this.lastTokEnd === 0 || lineBreak.test(this.input.slice(this.lastTokEnd, this.pos)))) {
          // A `-->` line comment
          this.skipLineComment(3);
          this.skipSpace();
          return this.nextToken()
        }
        return this.finishOp(types.incDec, 2)
      }
      if (next === 61) { return this.finishOp(types.assign, 2) }
      return this.finishOp(types.plusMin, 1)
    };

    pp$9.readToken_lt_gt = function(code) { // '<>'
      var next = this.input.charCodeAt(this.pos + 1);
      var size = 1;
      if (next === code) {
        size = code === 62 && this.input.charCodeAt(this.pos + 2) === 62 ? 3 : 2;
        if (this.input.charCodeAt(this.pos + size) === 61) { return this.finishOp(types.assign, size + 1) }
        return this.finishOp(types.bitShift, size)
      }
      if (next === 33 && code === 60 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 45 &&
          this.input.charCodeAt(this.pos + 3) === 45) {
        // `<!--`, an XML-style comment that should be interpreted as a line comment
        this.skipLineComment(4);
        this.skipSpace();
        return this.nextToken()
      }
      if (next === 61) { size = 2; }
      return this.finishOp(types.relational, size)
    };

    pp$9.readToken_eq_excl = function(code) { // '=!'
      var next = this.input.charCodeAt(this.pos + 1);
      if (next === 61) { return this.finishOp(types.equality, this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2) }
      if (code === 61 && next === 62 && this.options.ecmaVersion >= 6) { // '=>'
        this.pos += 2;
        return this.finishToken(types.arrow)
      }
      return this.finishOp(code === 61 ? types.eq : types.prefix, 1)
    };

    pp$9.readToken_question = function() { // '?'
      var ecmaVersion = this.options.ecmaVersion;
      if (ecmaVersion >= 11) {
        var next = this.input.charCodeAt(this.pos + 1);
        if (next === 46) {
          var next2 = this.input.charCodeAt(this.pos + 2);
          if (next2 < 48 || next2 > 57) { return this.finishOp(types.questionDot, 2) }
        }
        if (next === 63) {
          if (ecmaVersion >= 12) {
            var next2$1 = this.input.charCodeAt(this.pos + 2);
            if (next2$1 === 61) { return this.finishOp(types.assign, 3) }
          }
          return this.finishOp(types.coalesce, 2)
        }
      }
      return this.finishOp(types.question, 1)
    };

    pp$9.getTokenFromCode = function(code) {
      switch (code) {
      // The interpretation of a dot depends on whether it is followed
      // by a digit or another two dots.
      case 46: // '.'
        return this.readToken_dot()

      // Punctuation tokens.
      case 40: ++this.pos; return this.finishToken(types.parenL)
      case 41: ++this.pos; return this.finishToken(types.parenR)
      case 59: ++this.pos; return this.finishToken(types.semi)
      case 44: ++this.pos; return this.finishToken(types.comma)
      case 91: ++this.pos; return this.finishToken(types.bracketL)
      case 93: ++this.pos; return this.finishToken(types.bracketR)
      case 123: ++this.pos; return this.finishToken(types.braceL)
      case 125: ++this.pos; return this.finishToken(types.braceR)
      case 58: ++this.pos; return this.finishToken(types.colon)

      case 96: // '`'
        if (this.options.ecmaVersion < 6) { break }
        ++this.pos;
        return this.finishToken(types.backQuote)

      case 48: // '0'
        var next = this.input.charCodeAt(this.pos + 1);
        if (next === 120 || next === 88) { return this.readRadixNumber(16) } // '0x', '0X' - hex number
        if (this.options.ecmaVersion >= 6) {
          if (next === 111 || next === 79) { return this.readRadixNumber(8) } // '0o', '0O' - octal number
          if (next === 98 || next === 66) { return this.readRadixNumber(2) } // '0b', '0B' - binary number
        }

      // Anything else beginning with a digit is an integer, octal
      // number, or float.
      case 49: case 50: case 51: case 52: case 53: case 54: case 55: case 56: case 57: // 1-9
        return this.readNumber(false)

      // Quotes produce strings.
      case 34: case 39: // '"', "'"
        return this.readString(code)

      // Operators are parsed inline in tiny state machines. '=' (61) is
      // often referred to. `finishOp` simply skips the amount of
      // characters it is given as second argument, and returns a token
      // of the type given by its first argument.

      case 47: // '/'
        return this.readToken_slash()

      case 37: case 42: // '%*'
        return this.readToken_mult_modulo_exp(code)

      case 124: case 38: // '|&'
        return this.readToken_pipe_amp(code)

      case 94: // '^'
        return this.readToken_caret()

      case 43: case 45: // '+-'
        return this.readToken_plus_min(code)

      case 60: case 62: // '<>'
        return this.readToken_lt_gt(code)

      case 61: case 33: // '=!'
        return this.readToken_eq_excl(code)

      case 63: // '?'
        return this.readToken_question()

      case 126: // '~'
        return this.finishOp(types.prefix, 1)
      }

      this.raise(this.pos, "Unexpected character '" + codePointToString$1(code) + "'");
    };

    pp$9.finishOp = function(type, size) {
      var str = this.input.slice(this.pos, this.pos + size);
      this.pos += size;
      return this.finishToken(type, str)
    };

    pp$9.readRegexp = function() {
      var escaped, inClass, start = this.pos;
      for (;;) {
        if (this.pos >= this.input.length) { this.raise(start, "Unterminated regular expression"); }
        var ch = this.input.charAt(this.pos);
        if (lineBreak.test(ch)) { this.raise(start, "Unterminated regular expression"); }
        if (!escaped) {
          if (ch === "[") { inClass = true; }
          else if (ch === "]" && inClass) { inClass = false; }
          else if (ch === "/" && !inClass) { break }
          escaped = ch === "\\";
        } else { escaped = false; }
        ++this.pos;
      }
      var pattern = this.input.slice(start, this.pos);
      ++this.pos;
      var flagsStart = this.pos;
      var flags = this.readWord1();
      if (this.containsEsc) { this.unexpected(flagsStart); }

      // Validate pattern
      var state = this.regexpState || (this.regexpState = new RegExpValidationState(this));
      state.reset(start, pattern, flags);
      this.validateRegExpFlags(state);
      this.validateRegExpPattern(state);

      // Create Literal#value property value.
      var value = null;
      try {
        value = new RegExp(pattern, flags);
      } catch (e) {
        // ESTree requires null if it failed to instantiate RegExp object.
        // https://github.com/estree/estree/blob/a27003adf4fd7bfad44de9cef372a2eacd527b1c/es5.md#regexpliteral
      }

      return this.finishToken(types.regexp, {pattern: pattern, flags: flags, value: value})
    };

    // Read an integer in the given radix. Return null if zero digits
    // were read, the integer value otherwise. When `len` is given, this
    // will return `null` unless the integer has exactly `len` digits.

    pp$9.readInt = function(radix, len, maybeLegacyOctalNumericLiteral) {
      // `len` is used for character escape sequences. In that case, disallow separators.
      var allowSeparators = this.options.ecmaVersion >= 12 && len === undefined;

      // `maybeLegacyOctalNumericLiteral` is true if it doesn't have prefix (0x,0o,0b)
      // and isn't fraction part nor exponent part. In that case, if the first digit
      // is zero then disallow separators.
      var isLegacyOctalNumericLiteral = maybeLegacyOctalNumericLiteral && this.input.charCodeAt(this.pos) === 48;

      var start = this.pos, total = 0, lastCode = 0;
      for (var i = 0, e = len == null ? Infinity : len; i < e; ++i, ++this.pos) {
        var code = this.input.charCodeAt(this.pos), val = (void 0);

        if (allowSeparators && code === 95) {
          if (isLegacyOctalNumericLiteral) { this.raiseRecoverable(this.pos, "Numeric separator is not allowed in legacy octal numeric literals"); }
          if (lastCode === 95) { this.raiseRecoverable(this.pos, "Numeric separator must be exactly one underscore"); }
          if (i === 0) { this.raiseRecoverable(this.pos, "Numeric separator is not allowed at the first of digits"); }
          lastCode = code;
          continue
        }

        if (code >= 97) { val = code - 97 + 10; } // a
        else if (code >= 65) { val = code - 65 + 10; } // A
        else if (code >= 48 && code <= 57) { val = code - 48; } // 0-9
        else { val = Infinity; }
        if (val >= radix) { break }
        lastCode = code;
        total = total * radix + val;
      }

      if (allowSeparators && lastCode === 95) { this.raiseRecoverable(this.pos - 1, "Numeric separator is not allowed at the last of digits"); }
      if (this.pos === start || len != null && this.pos - start !== len) { return null }

      return total
    };

    function stringToNumber(str, isLegacyOctalNumericLiteral) {
      if (isLegacyOctalNumericLiteral) {
        return parseInt(str, 8)
      }

      // `parseFloat(value)` stops parsing at the first numeric separator then returns a wrong value.
      return parseFloat(str.replace(/_/g, ""))
    }

    function stringToBigInt(str) {
      if (typeof BigInt !== "function") {
        return null
      }

      // `BigInt(value)` throws syntax error if the string contains numeric separators.
      return BigInt(str.replace(/_/g, ""))
    }

    pp$9.readRadixNumber = function(radix) {
      var start = this.pos;
      this.pos += 2; // 0x
      var val = this.readInt(radix);
      if (val == null) { this.raise(this.start + 2, "Expected number in radix " + radix); }
      if (this.options.ecmaVersion >= 11 && this.input.charCodeAt(this.pos) === 110) {
        val = stringToBigInt(this.input.slice(start, this.pos));
        ++this.pos;
      } else if (isIdentifierStart(this.fullCharCodeAtPos())) { this.raise(this.pos, "Identifier directly after number"); }
      return this.finishToken(types.num, val)
    };

    // Read an integer, octal integer, or floating-point number.

    pp$9.readNumber = function(startsWithDot) {
      var start = this.pos;
      if (!startsWithDot && this.readInt(10, undefined, true) === null) { this.raise(start, "Invalid number"); }
      var octal = this.pos - start >= 2 && this.input.charCodeAt(start) === 48;
      if (octal && this.strict) { this.raise(start, "Invalid number"); }
      var next = this.input.charCodeAt(this.pos);
      if (!octal && !startsWithDot && this.options.ecmaVersion >= 11 && next === 110) {
        var val$1 = stringToBigInt(this.input.slice(start, this.pos));
        ++this.pos;
        if (isIdentifierStart(this.fullCharCodeAtPos())) { this.raise(this.pos, "Identifier directly after number"); }
        return this.finishToken(types.num, val$1)
      }
      if (octal && /[89]/.test(this.input.slice(start, this.pos))) { octal = false; }
      if (next === 46 && !octal) { // '.'
        ++this.pos;
        this.readInt(10);
        next = this.input.charCodeAt(this.pos);
      }
      if ((next === 69 || next === 101) && !octal) { // 'eE'
        next = this.input.charCodeAt(++this.pos);
        if (next === 43 || next === 45) { ++this.pos; } // '+-'
        if (this.readInt(10) === null) { this.raise(start, "Invalid number"); }
      }
      if (isIdentifierStart(this.fullCharCodeAtPos())) { this.raise(this.pos, "Identifier directly after number"); }

      var val = stringToNumber(this.input.slice(start, this.pos), octal);
      return this.finishToken(types.num, val)
    };

    // Read a string value, interpreting backslash-escapes.

    pp$9.readCodePoint = function() {
      var ch = this.input.charCodeAt(this.pos), code;

      if (ch === 123) { // '{'
        if (this.options.ecmaVersion < 6) { this.unexpected(); }
        var codePos = ++this.pos;
        code = this.readHexChar(this.input.indexOf("}", this.pos) - this.pos);
        ++this.pos;
        if (code > 0x10FFFF) { this.invalidStringToken(codePos, "Code point out of bounds"); }
      } else {
        code = this.readHexChar(4);
      }
      return code
    };

    function codePointToString$1(code) {
      // UTF-16 Decoding
      if (code <= 0xFFFF) { return String.fromCharCode(code) }
      code -= 0x10000;
      return String.fromCharCode((code >> 10) + 0xD800, (code & 1023) + 0xDC00)
    }

    pp$9.readString = function(quote) {
      var out = "", chunkStart = ++this.pos;
      for (;;) {
        if (this.pos >= this.input.length) { this.raise(this.start, "Unterminated string constant"); }
        var ch = this.input.charCodeAt(this.pos);
        if (ch === quote) { break }
        if (ch === 92) { // '\'
          out += this.input.slice(chunkStart, this.pos);
          out += this.readEscapedChar(false);
          chunkStart = this.pos;
        } else {
          if (isNewLine(ch, this.options.ecmaVersion >= 10)) { this.raise(this.start, "Unterminated string constant"); }
          ++this.pos;
        }
      }
      out += this.input.slice(chunkStart, this.pos++);
      return this.finishToken(types.string, out)
    };

    // Reads template string tokens.

    var INVALID_TEMPLATE_ESCAPE_ERROR = {};

    pp$9.tryReadTemplateToken = function() {
      this.inTemplateElement = true;
      try {
        this.readTmplToken();
      } catch (err) {
        if (err === INVALID_TEMPLATE_ESCAPE_ERROR) {
          this.readInvalidTemplateToken();
        } else {
          throw err
        }
      }

      this.inTemplateElement = false;
    };

    pp$9.invalidStringToken = function(position, message) {
      if (this.inTemplateElement && this.options.ecmaVersion >= 9) {
        throw INVALID_TEMPLATE_ESCAPE_ERROR
      } else {
        this.raise(position, message);
      }
    };

    pp$9.readTmplToken = function() {
      var out = "", chunkStart = this.pos;
      for (;;) {
        if (this.pos >= this.input.length) { this.raise(this.start, "Unterminated template"); }
        var ch = this.input.charCodeAt(this.pos);
        if (ch === 96 || ch === 36 && this.input.charCodeAt(this.pos + 1) === 123) { // '`', '${'
          if (this.pos === this.start && (this.type === types.template || this.type === types.invalidTemplate)) {
            if (ch === 36) {
              this.pos += 2;
              return this.finishToken(types.dollarBraceL)
            } else {
              ++this.pos;
              return this.finishToken(types.backQuote)
            }
          }
          out += this.input.slice(chunkStart, this.pos);
          return this.finishToken(types.template, out)
        }
        if (ch === 92) { // '\'
          out += this.input.slice(chunkStart, this.pos);
          out += this.readEscapedChar(true);
          chunkStart = this.pos;
        } else if (isNewLine(ch)) {
          out += this.input.slice(chunkStart, this.pos);
          ++this.pos;
          switch (ch) {
          case 13:
            if (this.input.charCodeAt(this.pos) === 10) { ++this.pos; }
          case 10:
            out += "\n";
            break
          default:
            out += String.fromCharCode(ch);
            break
          }
          if (this.options.locations) {
            ++this.curLine;
            this.lineStart = this.pos;
          }
          chunkStart = this.pos;
        } else {
          ++this.pos;
        }
      }
    };

    // Reads a template token to search for the end, without validating any escape sequences
    pp$9.readInvalidTemplateToken = function() {
      for (; this.pos < this.input.length; this.pos++) {
        switch (this.input[this.pos]) {
        case "\\":
          ++this.pos;
          break

        case "$":
          if (this.input[this.pos + 1] !== "{") {
            break
          }
        // falls through

        case "`":
          return this.finishToken(types.invalidTemplate, this.input.slice(this.start, this.pos))

        // no default
        }
      }
      this.raise(this.start, "Unterminated template");
    };

    // Used to read escaped characters

    pp$9.readEscapedChar = function(inTemplate) {
      var ch = this.input.charCodeAt(++this.pos);
      ++this.pos;
      switch (ch) {
      case 110: return "\n" // 'n' -> '\n'
      case 114: return "\r" // 'r' -> '\r'
      case 120: return String.fromCharCode(this.readHexChar(2)) // 'x'
      case 117: return codePointToString$1(this.readCodePoint()) // 'u'
      case 116: return "\t" // 't' -> '\t'
      case 98: return "\b" // 'b' -> '\b'
      case 118: return "\u000b" // 'v' -> '\u000b'
      case 102: return "\f" // 'f' -> '\f'
      case 13: if (this.input.charCodeAt(this.pos) === 10) { ++this.pos; } // '\r\n'
      case 10: // ' \n'
        if (this.options.locations) { this.lineStart = this.pos; ++this.curLine; }
        return ""
      case 56:
      case 57:
        if (inTemplate) {
          var codePos = this.pos - 1;

          this.invalidStringToken(
            codePos,
            "Invalid escape sequence in template string"
          );

          return null
        }
      default:
        if (ch >= 48 && ch <= 55) {
          var octalStr = this.input.substr(this.pos - 1, 3).match(/^[0-7]+/)[0];
          var octal = parseInt(octalStr, 8);
          if (octal > 255) {
            octalStr = octalStr.slice(0, -1);
            octal = parseInt(octalStr, 8);
          }
          this.pos += octalStr.length - 1;
          ch = this.input.charCodeAt(this.pos);
          if ((octalStr !== "0" || ch === 56 || ch === 57) && (this.strict || inTemplate)) {
            this.invalidStringToken(
              this.pos - 1 - octalStr.length,
              inTemplate
                ? "Octal literal in template string"
                : "Octal literal in strict mode"
            );
          }
          return String.fromCharCode(octal)
        }
        if (isNewLine(ch)) {
          // Unicode new line characters after \ get removed from output in both
          // template literals and strings
          return ""
        }
        return String.fromCharCode(ch)
      }
    };

    // Used to read character escape sequences ('\x', '\u', '\U').

    pp$9.readHexChar = function(len) {
      var codePos = this.pos;
      var n = this.readInt(16, len);
      if (n === null) { this.invalidStringToken(codePos, "Bad character escape sequence"); }
      return n
    };

    // Read an identifier, and return it as a string. Sets `this.containsEsc`
    // to whether the word contained a '\u' escape.
    //
    // Incrementally adds only escaped chars, adding other chunks as-is
    // as a micro-optimization.

    pp$9.readWord1 = function() {
      this.containsEsc = false;
      var word = "", first = true, chunkStart = this.pos;
      var astral = this.options.ecmaVersion >= 6;
      while (this.pos < this.input.length) {
        var ch = this.fullCharCodeAtPos();
        if (isIdentifierChar(ch, astral)) {
          this.pos += ch <= 0xffff ? 1 : 2;
        } else if (ch === 92) { // "\"
          this.containsEsc = true;
          word += this.input.slice(chunkStart, this.pos);
          var escStart = this.pos;
          if (this.input.charCodeAt(++this.pos) !== 117) // "u"
            { this.invalidStringToken(this.pos, "Expecting Unicode escape sequence \\uXXXX"); }
          ++this.pos;
          var esc = this.readCodePoint();
          if (!(first ? isIdentifierStart : isIdentifierChar)(esc, astral))
            { this.invalidStringToken(escStart, "Invalid Unicode escape"); }
          word += codePointToString$1(esc);
          chunkStart = this.pos;
        } else {
          break
        }
        first = false;
      }
      return word + this.input.slice(chunkStart, this.pos)
    };

    // Read an identifier or keyword token. Will check for reserved
    // words when necessary.

    pp$9.readWord = function() {
      var word = this.readWord1();
      var type = types.name;
      if (this.keywords.test(word)) {
        type = keywords$1[word];
      }
      return this.finishToken(type, word)
    };

    // Acorn is a tiny, fast JavaScript parser written in JavaScript.

    var version = "7.4.1";

    Parser$1.acorn = {
      Parser: Parser$1,
      version: version,
      defaultOptions: defaultOptions,
      Position: Position,
      SourceLocation: SourceLocation,
      getLineInfo: getLineInfo,
      Node: Node$1,
      TokenType: TokenType,
      tokTypes: types,
      keywordTypes: keywords$1,
      TokContext: TokContext,
      tokContexts: types$1,
      isIdentifierChar: isIdentifierChar,
      isIdentifierStart: isIdentifierStart,
      Token: Token,
      isNewLine: isNewLine,
      lineBreak: lineBreak,
      lineBreakG: lineBreakG,
      nonASCIIwhitespace: nonASCIIwhitespace
    };

    var defaultGlobals = new Set([
      "Array",
      "ArrayBuffer",
      "atob",
      "AudioContext",
      "Blob",
      "Boolean",
      "BigInt",
      "btoa",
      "clearInterval",
      "clearTimeout",
      "console",
      "crypto",
      "CustomEvent",
      "DataView",
      "Date",
      "decodeURI",
      "decodeURIComponent",
      "devicePixelRatio",
      "document",
      "encodeURI",
      "encodeURIComponent",
      "Error",
      "escape",
      "eval",
      "fetch",
      "File",
      "FileList",
      "FileReader",
      "Float32Array",
      "Float64Array",
      "Function",
      "Headers",
      "Image",
      "ImageData",
      "Infinity",
      "Int16Array",
      "Int32Array",
      "Int8Array",
      "Intl",
      "isFinite",
      "isNaN",
      "JSON",
      "Map",
      "Math",
      "NaN",
      "Number",
      "navigator",
      "Object",
      "parseFloat",
      "parseInt",
      "performance",
      "Path2D",
      "Promise",
      "Proxy",
      "RangeError",
      "ReferenceError",
      "Reflect",
      "RegExp",
      "cancelAnimationFrame",
      "requestAnimationFrame",
      "Set",
      "setInterval",
      "setTimeout",
      "String",
      "Symbol",
      "SyntaxError",
      "TextDecoder",
      "TextEncoder",
      "this",
      "TypeError",
      "Uint16Array",
      "Uint32Array",
      "Uint8Array",
      "Uint8ClampedArray",
      "undefined",
      "unescape",
      "URIError",
      "URL",
      "WeakMap",
      "WeakSet",
      "WebSocket",
      "Worker",
      "window"
    ]);

    // AST walker module for Mozilla Parser API compatible trees

    // A simple walk is one where you simply specify callbacks to be
    // called on specific nodes. The last two arguments are optional. A
    // simple use would be
    //
    //     walk.simple(myTree, {
    //         Expression: function(node) { ... }
    //     });
    //
    // to do something with all expressions. All Parser API node types
    // can be used to identify node types, as well as Expression and
    // Statement, which denote categories of nodes.
    //
    // The base argument can be used to pass a custom (recursive)
    // walker, and state can be used to give this walked an initial
    // state.

    function simple(node, visitors, baseVisitor, state, override) {
      if (!baseVisitor) { baseVisitor = base
      ; }(function c(node, st, override) {
        var type = override || node.type, found = visitors[type];
        baseVisitor[type](node, st, c);
        if (found) { found(node, st); }
      })(node, state, override);
    }

    // An ancestor walk keeps an array of ancestor nodes (including the
    // current node) and passes them to the callback as third parameter
    // (and also as state parameter when no other state is present).
    function ancestor(node, visitors, baseVisitor, state, override) {
      var ancestors = [];
      if (!baseVisitor) { baseVisitor = base
      ; }(function c(node, st, override) {
        var type = override || node.type, found = visitors[type];
        var isNew = node !== ancestors[ancestors.length - 1];
        if (isNew) { ancestors.push(node); }
        baseVisitor[type](node, st, c);
        if (found) { found(node, st || ancestors, ancestors); }
        if (isNew) { ancestors.pop(); }
      })(node, state, override);
    }

    // Fallback to an Object.create polyfill for older environments.
    var create = Object.create || function(proto) {
      function Ctor() {}
      Ctor.prototype = proto;
      return new Ctor
    };

    // Used to create a custom walker. Will fill in all missing node
    // type properties with the defaults.
    function make(funcs, baseVisitor) {
      var visitor = create(baseVisitor || base);
      for (var type in funcs) { visitor[type] = funcs[type]; }
      return visitor
    }

    function skipThrough(node, st, c) { c(node, st); }
    function ignore(_node, _st, _c) {}

    // Node walkers.

    var base = {};

    base.Program = base.BlockStatement = function (node, st, c) {
      for (var i = 0, list = node.body; i < list.length; i += 1)
        {
        var stmt = list[i];

        c(stmt, st, "Statement");
      }
    };
    base.Statement = skipThrough;
    base.EmptyStatement = ignore;
    base.ExpressionStatement = base.ParenthesizedExpression = base.ChainExpression =
      function (node, st, c) { return c(node.expression, st, "Expression"); };
    base.IfStatement = function (node, st, c) {
      c(node.test, st, "Expression");
      c(node.consequent, st, "Statement");
      if (node.alternate) { c(node.alternate, st, "Statement"); }
    };
    base.LabeledStatement = function (node, st, c) { return c(node.body, st, "Statement"); };
    base.BreakStatement = base.ContinueStatement = ignore;
    base.WithStatement = function (node, st, c) {
      c(node.object, st, "Expression");
      c(node.body, st, "Statement");
    };
    base.SwitchStatement = function (node, st, c) {
      c(node.discriminant, st, "Expression");
      for (var i$1 = 0, list$1 = node.cases; i$1 < list$1.length; i$1 += 1) {
        var cs = list$1[i$1];

        if (cs.test) { c(cs.test, st, "Expression"); }
        for (var i = 0, list = cs.consequent; i < list.length; i += 1)
          {
          var cons = list[i];

          c(cons, st, "Statement");
        }
      }
    };
    base.SwitchCase = function (node, st, c) {
      if (node.test) { c(node.test, st, "Expression"); }
      for (var i = 0, list = node.consequent; i < list.length; i += 1)
        {
        var cons = list[i];

        c(cons, st, "Statement");
      }
    };
    base.ReturnStatement = base.YieldExpression = base.AwaitExpression = function (node, st, c) {
      if (node.argument) { c(node.argument, st, "Expression"); }
    };
    base.ThrowStatement = base.SpreadElement =
      function (node, st, c) { return c(node.argument, st, "Expression"); };
    base.TryStatement = function (node, st, c) {
      c(node.block, st, "Statement");
      if (node.handler) { c(node.handler, st); }
      if (node.finalizer) { c(node.finalizer, st, "Statement"); }
    };
    base.CatchClause = function (node, st, c) {
      if (node.param) { c(node.param, st, "Pattern"); }
      c(node.body, st, "Statement");
    };
    base.WhileStatement = base.DoWhileStatement = function (node, st, c) {
      c(node.test, st, "Expression");
      c(node.body, st, "Statement");
    };
    base.ForStatement = function (node, st, c) {
      if (node.init) { c(node.init, st, "ForInit"); }
      if (node.test) { c(node.test, st, "Expression"); }
      if (node.update) { c(node.update, st, "Expression"); }
      c(node.body, st, "Statement");
    };
    base.ForInStatement = base.ForOfStatement = function (node, st, c) {
      c(node.left, st, "ForInit");
      c(node.right, st, "Expression");
      c(node.body, st, "Statement");
    };
    base.ForInit = function (node, st, c) {
      if (node.type === "VariableDeclaration") { c(node, st); }
      else { c(node, st, "Expression"); }
    };
    base.DebuggerStatement = ignore;

    base.FunctionDeclaration = function (node, st, c) { return c(node, st, "Function"); };
    base.VariableDeclaration = function (node, st, c) {
      for (var i = 0, list = node.declarations; i < list.length; i += 1)
        {
        var decl = list[i];

        c(decl, st);
      }
    };
    base.VariableDeclarator = function (node, st, c) {
      c(node.id, st, "Pattern");
      if (node.init) { c(node.init, st, "Expression"); }
    };

    base.Function = function (node, st, c) {
      if (node.id) { c(node.id, st, "Pattern"); }
      for (var i = 0, list = node.params; i < list.length; i += 1)
        {
        var param = list[i];

        c(param, st, "Pattern");
      }
      c(node.body, st, node.expression ? "Expression" : "Statement");
    };

    base.Pattern = function (node, st, c) {
      if (node.type === "Identifier")
        { c(node, st, "VariablePattern"); }
      else if (node.type === "MemberExpression")
        { c(node, st, "MemberPattern"); }
      else
        { c(node, st); }
    };
    base.VariablePattern = ignore;
    base.MemberPattern = skipThrough;
    base.RestElement = function (node, st, c) { return c(node.argument, st, "Pattern"); };
    base.ArrayPattern = function (node, st, c) {
      for (var i = 0, list = node.elements; i < list.length; i += 1) {
        var elt = list[i];

        if (elt) { c(elt, st, "Pattern"); }
      }
    };
    base.ObjectPattern = function (node, st, c) {
      for (var i = 0, list = node.properties; i < list.length; i += 1) {
        var prop = list[i];

        if (prop.type === "Property") {
          if (prop.computed) { c(prop.key, st, "Expression"); }
          c(prop.value, st, "Pattern");
        } else if (prop.type === "RestElement") {
          c(prop.argument, st, "Pattern");
        }
      }
    };

    base.Expression = skipThrough;
    base.ThisExpression = base.Super = base.MetaProperty = ignore;
    base.ArrayExpression = function (node, st, c) {
      for (var i = 0, list = node.elements; i < list.length; i += 1) {
        var elt = list[i];

        if (elt) { c(elt, st, "Expression"); }
      }
    };
    base.ObjectExpression = function (node, st, c) {
      for (var i = 0, list = node.properties; i < list.length; i += 1)
        {
        var prop = list[i];

        c(prop, st);
      }
    };
    base.FunctionExpression = base.ArrowFunctionExpression = base.FunctionDeclaration;
    base.SequenceExpression = function (node, st, c) {
      for (var i = 0, list = node.expressions; i < list.length; i += 1)
        {
        var expr = list[i];

        c(expr, st, "Expression");
      }
    };
    base.TemplateLiteral = function (node, st, c) {
      for (var i = 0, list = node.quasis; i < list.length; i += 1)
        {
        var quasi = list[i];

        c(quasi, st);
      }

      for (var i$1 = 0, list$1 = node.expressions; i$1 < list$1.length; i$1 += 1)
        {
        var expr = list$1[i$1];

        c(expr, st, "Expression");
      }
    };
    base.TemplateElement = ignore;
    base.UnaryExpression = base.UpdateExpression = function (node, st, c) {
      c(node.argument, st, "Expression");
    };
    base.BinaryExpression = base.LogicalExpression = function (node, st, c) {
      c(node.left, st, "Expression");
      c(node.right, st, "Expression");
    };
    base.AssignmentExpression = base.AssignmentPattern = function (node, st, c) {
      c(node.left, st, "Pattern");
      c(node.right, st, "Expression");
    };
    base.ConditionalExpression = function (node, st, c) {
      c(node.test, st, "Expression");
      c(node.consequent, st, "Expression");
      c(node.alternate, st, "Expression");
    };
    base.NewExpression = base.CallExpression = function (node, st, c) {
      c(node.callee, st, "Expression");
      if (node.arguments)
        { for (var i = 0, list = node.arguments; i < list.length; i += 1)
          {
            var arg = list[i];

            c(arg, st, "Expression");
          } }
    };
    base.MemberExpression = function (node, st, c) {
      c(node.object, st, "Expression");
      if (node.computed) { c(node.property, st, "Expression"); }
    };
    base.ExportNamedDeclaration = base.ExportDefaultDeclaration = function (node, st, c) {
      if (node.declaration)
        { c(node.declaration, st, node.type === "ExportNamedDeclaration" || node.declaration.id ? "Statement" : "Expression"); }
      if (node.source) { c(node.source, st, "Expression"); }
    };
    base.ExportAllDeclaration = function (node, st, c) {
      if (node.exported)
        { c(node.exported, st); }
      c(node.source, st, "Expression");
    };
    base.ImportDeclaration = function (node, st, c) {
      for (var i = 0, list = node.specifiers; i < list.length; i += 1)
        {
        var spec = list[i];

        c(spec, st);
      }
      c(node.source, st, "Expression");
    };
    base.ImportExpression = function (node, st, c) {
      c(node.source, st, "Expression");
    };
    base.ImportSpecifier = base.ImportDefaultSpecifier = base.ImportNamespaceSpecifier = base.Identifier = base.Literal = ignore;

    base.TaggedTemplateExpression = function (node, st, c) {
      c(node.tag, st, "Expression");
      c(node.quasi, st, "Expression");
    };
    base.ClassDeclaration = base.ClassExpression = function (node, st, c) { return c(node, st, "Class"); };
    base.Class = function (node, st, c) {
      if (node.id) { c(node.id, st, "Pattern"); }
      if (node.superClass) { c(node.superClass, st, "Expression"); }
      c(node.body, st);
    };
    base.ClassBody = function (node, st, c) {
      for (var i = 0, list = node.body; i < list.length; i += 1)
        {
        var elt = list[i];

        c(elt, st);
      }
    };
    base.MethodDefinition = base.Property = function (node, st, c) {
      if (node.computed) { c(node.key, st, "Expression"); }
      c(node.value, st, "Expression");
    };

    var walk = make({
      Import() {},
      ViewExpression(node, st, c) {
        c(node.id, st, "Identifier");
      },
      MutableExpression(node, st, c) {
        c(node.id, st, "Identifier");
      }
    });

    // Based on https://github.com/ForbesLindesay/acorn-globals

    function isScope(node) {
      return node.type === "FunctionExpression"
          || node.type === "FunctionDeclaration"
          || node.type === "ArrowFunctionExpression"
          || node.type === "Program";
    }

    function isBlockScope(node) {
      return node.type === "BlockStatement"
          || node.type === "ForInStatement"
          || node.type === "ForOfStatement"
          || node.type === "ForStatement"
          || isScope(node);
    }

    function declaresArguments(node) {
      return node.type === "FunctionExpression"
          || node.type === "FunctionDeclaration";
    }

    function findReferences(cell, globals) {
      const ast = {type: "Program", body: [cell.body]};
      const locals = new Map;
      const globalSet = new Set(globals);
      const references = [];

      function hasLocal(node, name) {
        const l = locals.get(node);
        return l ? l.has(name) : false;
      }

      function declareLocal(node, id) {
        const l = locals.get(node);
        if (l) l.add(id.name);
        else locals.set(node, new Set([id.name]));
      }

      function declareClass(node) {
        if (node.id) declareLocal(node, node.id);
      }

      function declareFunction(node) {
        node.params.forEach(param => declarePattern(param, node));
        if (node.id) declareLocal(node, node.id);
      }

      function declareCatchClause(node) {
        if (node.param) declarePattern(node.param, node);
      }

      function declarePattern(node, parent) {
        switch (node.type) {
          case "Identifier":
            declareLocal(parent, node);
            break;
          case "ObjectPattern":
            node.properties.forEach(node => declarePattern(node, parent));
            break;
          case "ArrayPattern":
            node.elements.forEach(node => node && declarePattern(node, parent));
            break;
          case "Property":
            declarePattern(node.value, parent);
            break;
          case "RestElement":
            declarePattern(node.argument, parent);
            break;
          case "AssignmentPattern":
            declarePattern(node.left, parent);
            break;
          default:
            throw new Error("Unrecognized pattern type: " + node.type);
        }
      }

      function declareModuleSpecifier(node) {
        declareLocal(ast, node.local);
      }

      ancestor(
        ast,
        {
          VariableDeclaration: (node, parents) => {
            let parent = null;
            for (let i = parents.length - 1; i >= 0 && parent === null; --i) {
              if (node.kind === "var" ? isScope(parents[i]) : isBlockScope(parents[i])) {
                parent = parents[i];
              }
            }
            node.declarations.forEach(declaration => declarePattern(declaration.id, parent));
          },
          FunctionDeclaration: (node, parents) => {
            let parent = null;
            for (let i = parents.length - 2; i >= 0 && parent === null; --i) {
              if (isScope(parents[i])) {
                parent = parents[i];
              }
            }
            declareLocal(parent, node.id);
            declareFunction(node);
          },
          Function: declareFunction,
          ClassDeclaration: (node, parents) => {
            let parent = null;
            for (let i = parents.length - 2; i >= 0 && parent === null; i--) {
              if (isScope(parents[i])) {
                parent = parents[i];
              }
            }
            declareLocal(parent, node.id);
          },
          Class: declareClass,
          CatchClause: declareCatchClause,
          ImportDefaultSpecifier: declareModuleSpecifier,
          ImportSpecifier: declareModuleSpecifier,
          ImportNamespaceSpecifier: declareModuleSpecifier
        },
        walk
      );

      function identifier(node, parents) {
        let name = node.name;
        if (name === "undefined") return;
        for (let i = parents.length - 2; i >= 0; --i) {
          if (name === "arguments") {
            if (declaresArguments(parents[i])) {
              return;
            }
          }
          if (hasLocal(parents[i], name)) {
            return;
          }
          if (parents[i].type === "ViewExpression") {
            node = parents[i];
            name = `viewof ${node.id.name}`;
          }
          if (parents[i].type === "MutableExpression") {
            node = parents[i];
            name = `mutable ${node.id.name}`;
          }
        }
        if (!globalSet.has(name)) {
          if (name === "arguments") {
            throw Object.assign(new SyntaxError(`arguments is not allowed`), {node});
          }
          references.push(node);
        }
      }

      ancestor(
        ast,
        {
          VariablePattern: identifier,
          Identifier: identifier
        },
        walk
      );

      function checkConst(node, parents) {
        if (!node) return;
        switch (node.type) {
          case "Identifier":
          case "VariablePattern": {
            for (const parent of parents) {
              if (hasLocal(parent, node.name)) {
                return;
              }
            }
            if (parents[parents.length - 2].type === "MutableExpression") {
              return;
            }
            throw Object.assign(new SyntaxError(`Assignment to constant variable ${node.name}`), {node});
          }
          case "ArrayPattern": {
            for (const element of node.elements) {
              checkConst(element, parents);
            }
            return;
          }
          case "ObjectPattern": {
            for (const property of node.properties) {
              checkConst(property, parents);
            }
            return;
          }
          case "Property": {
            checkConst(node.value, parents);
            return;
          }
          case "RestElement": {
            checkConst(node.argument, parents);
            return;
          }
        }
      }

      function checkConstArgument(node, parents) {
        checkConst(node.argument, parents);
      }

      function checkConstLeft(node, parents) {
        checkConst(node.left, parents);
      }

      ancestor(
        ast,
        {
          AssignmentExpression: checkConstLeft,
          AssignmentPattern: checkConstLeft,
          UpdateExpression: checkConstArgument,
          ForOfStatement: checkConstLeft,
          ForInStatement: checkConstLeft
        },
        walk
      );

      return references;
    }

    function findFeatures(cell, featureName) {
      const ast = {type: "Program", body: [cell.body]};
      const features = new Map();
      const {references} = cell;

      simple(
        ast,
        {
          CallExpression: node => {
            const {callee, arguments: args} = node;

            // Ignore function calls that are not references to the feature.
            if (
              callee.type !== "Identifier" ||
              callee.name !== featureName ||
              references.indexOf(callee) < 0
            ) return;

            // Forbid dynamic calls.
            if (
              args.length !== 1 ||
              !((args[0].type === "Literal" && /^['"]/.test(args[0].raw)) ||
                (args[0].type === "TemplateLiteral" && args[0].expressions.length === 0))
            ) {
              throw Object.assign(new SyntaxError(`${featureName} requires a single literal string argument`), {node});
            }

            const [arg] = args;
            const name = arg.type === "Literal" ? arg.value : arg.quasis[0].value.cooked;
            const location = {start: arg.start, end: arg.end};
            if (features.has(name)) features.get(name).push(location);
            else features.set(name, [location]);
          }
        },
        walk
      );

      return features;
    }

    const SCOPE_FUNCTION = 2;
    const SCOPE_ASYNC = 4;
    const SCOPE_GENERATOR = 8;

    function parseCell(input, {tag, raw, globals, ...options} = {}) {
      let cell;
      // Parse empty input as JavaScript to keep ensure resulting ast
      // is consistent for all empty input cases.
      if (tag != null && input) {
        cell = TemplateCellParser.parse(input, options);
        const parsedTag = CellTagParser.parse(tag, options);
        parseReferences(parsedTag, tag, globals);
        parseFeatures(parsedTag, tag);
        cell.tag = parsedTag;
        cell.raw = !!raw;
      } else {
        cell = CellParser.parse(input, options);
      }
      parseReferences(cell, input, globals);
      parseFeatures(cell, input);
      return cell;
    }

    class CellParser extends Parser$1 {
      constructor(options, ...args) {
        super(Object.assign({ecmaVersion: 12}, options), ...args);
      }
      enterScope(flags) {
        if (flags & SCOPE_FUNCTION) ++this.O_function;
        return super.enterScope(flags);
      }
      exitScope() {
        if (this.currentScope().flags & SCOPE_FUNCTION) --this.O_function;
        return super.exitScope();
      }
      parseForIn(node, init) {
        if (this.O_function === 1 && node.await) this.O_async = true;
        return super.parseForIn(node, init);
      }
      parseAwait() {
        if (this.O_function === 1) this.O_async = true;
        return super.parseAwait();
      }
      parseYield(noIn) {
        if (this.O_function === 1) this.O_generator = true;
        return super.parseYield(noIn);
      }
      parseImport(node) {
        this.next();
        node.specifiers = this.parseImportSpecifiers();
        if (this.type === types._with) {
          this.next();
          node.injections = this.parseImportSpecifiers();
        }
        this.expectContextual("from");
        node.source = this.type === types.string ? this.parseExprAtom() : this.unexpected();
        return this.finishNode(node, "ImportDeclaration");
      }
      parseImportSpecifiers() {
        const nodes = [];
        const identifiers = new Set;
        let first = true;
        this.expect(types.braceL);
        while (!this.eat(types.braceR)) {
          if (first) {
            first = false;
          } else {
            this.expect(types.comma);
            if (this.afterTrailingComma(types.braceR)) break;
          }
          const node = this.startNode();
          node.view = this.eatContextual("viewof");
          node.mutable = node.view ? false : this.eatContextual("mutable");
          node.imported = this.parseIdent();
          this.checkUnreserved(node.imported);
          this.checkLocal(node.imported);
          if (this.eatContextual("as")) {
            node.local = this.parseIdent();
            this.checkUnreserved(node.local);
            this.checkLocal(node.local);
          } else {
            node.local = node.imported;
          }
          this.checkLVal(node.local, "let");
          if (identifiers.has(node.local.name)) {
            this.raise(node.local.start, `Identifier '${node.local.name}' has already been declared`);
          }
          identifiers.add(node.local.name);
          nodes.push(this.finishNode(node, "ImportSpecifier"));
        }
        return nodes;
      }
      parseExprAtom(refDestructuringErrors) {
        return (
          this.parseMaybeKeywordExpression("viewof", "ViewExpression") ||
          this.parseMaybeKeywordExpression("mutable", "MutableExpression") ||
          super.parseExprAtom(refDestructuringErrors)
        );
      }
      startCell() {
        this.O_function = 0;
        this.O_async = false;
        this.O_generator = false;
        this.strict = true;
        this.enterScope(SCOPE_FUNCTION | SCOPE_ASYNC | SCOPE_GENERATOR);
      }
      finishCell(node, body, id) {
        if (id) this.checkLocal(id);
        node.id = id;
        node.body = body;
        node.async = this.O_async;
        node.generator = this.O_generator;
        this.exitScope();
        return this.finishNode(node, "Cell");
      }
      parseCell(node, eof) {
        const lookahead = new CellParser({}, this.input, this.start);
        let token = lookahead.getToken();
        let body = null;
        let id = null;

        this.startCell();

        // An import?
        if (token.type === types._import && lookahead.getToken().type !== types.parenL) {
          body = this.parseImport(this.startNode());
        }

        // A non-empty cell?
        else if (token.type !== types.eof && token.type !== types.semi) {
          // A named cell?
          if (token.type === types.name) {
            if (token.value === "viewof" || token.value === "mutable") {
              token = lookahead.getToken();
              if (token.type !== types.name) {
                lookahead.unexpected();
              }
            }
            token = lookahead.getToken();
            if (token.type === types.eq) {
              id =
                this.parseMaybeKeywordExpression("viewof", "ViewExpression") ||
                this.parseMaybeKeywordExpression("mutable", "MutableExpression") ||
                this.parseIdent();
              token = lookahead.getToken();
              this.expect(types.eq);
            }
          }

          // A block?
          if (token.type === types.braceL) {
            body = this.parseBlock();
          }

          // An expression?
          // Possibly a function or class declaration?
          else {
            body = this.parseExpression();
            if (
              id === null &&
              (body.type === "FunctionExpression" ||
                body.type === "ClassExpression")
            ) {
              id = body.id;
            }
          }
        }

        this.semicolon();
        if (eof) this.expect(types.eof); // TODO

        return this.finishCell(node, body, id);
      }
      parseTopLevel(node) {
        return this.parseCell(node, true);
      }
      toAssignable(node, isBinding, refDestructuringErrors) {
        return node.type === "MutableExpression"
          ? node
          : super.toAssignable(node, isBinding, refDestructuringErrors);
      }
      checkLocal(id) {
        const node = id.id || id;
        if (defaultGlobals.has(node.name) || node.name === "arguments") {
          this.raise(node.start, `Identifier '${node.name}' is reserved`);
        }
      }
      checkUnreserved(node) {
        if (node.name === "viewof" || node.name === "mutable") {
          this.raise(node.start, `Unexpected keyword '${node.name}'`);
        }
        return super.checkUnreserved(node);
      }
      checkLVal(expr, bindingType, checkClashes) {
        return super.checkLVal(
          expr.type === "MutableExpression" ? expr.id : expr,
          bindingType,
          checkClashes
        );
      }
      unexpected(pos) {
        this.raise(
          pos != null ? pos : this.start,
          this.type === types.eof ? "Unexpected end of input" : "Unexpected token"
        );
      }
      parseMaybeKeywordExpression(keyword, type) {
        if (this.isContextual(keyword)) {
          const node = this.startNode();
          this.next();
          node.id = this.parseIdent();
          return this.finishNode(node, type);
        }
      }
    }

    // Based on acorn’s q_tmpl. We will use this to initialize the
    // parser context so our `readTemplateToken` override is called.
    // `readTemplateToken` is based on acorn's `readTmplToken` which
    // is used inside template literals. Our version allows backQuotes.
    const o_tmpl = new TokContext(
      "`", // token
      true, // isExpr
      true, // preserveSpace
      parser => readTemplateToken.call(parser) // override
    );

    class TemplateCellParser extends CellParser {
      constructor(...args) {
        super(...args);
        // Initialize the type so that we're inside a backQuote
        this.type = types.backQuote;
        this.exprAllowed = false;
      }
      initialContext() {
        // Provide our custom TokContext
        return [o_tmpl];
      }
      parseCell(node) {
        this.startCell();

        // Fix for nextToken calling finishToken(tt.eof)
        if (this.type === types.eof) this.value = "";

        // Based on acorn.Parser.parseTemplate
        const isTagged = true;
        const body = this.startNode();
        body.expressions = [];
        let curElt = this.parseTemplateElement({isTagged});
        body.quasis = [curElt];
        while (this.type !== types.eof) {
          this.expect(types.dollarBraceL);
          body.expressions.push(this.parseExpression());
          this.expect(types.braceR);
          body.quasis.push(curElt = this.parseTemplateElement({isTagged}));
        }
        curElt.tail = true;
        this.next();
        this.finishNode(body, "TemplateLiteral");

        this.expect(types.eof);
        return this.finishCell(node, body, null);
      }
    }

    // This is our custom override for parsing a template that allows backticks.
    // Based on acorn's readInvalidTemplateToken.
    function readTemplateToken() {
      out: for (; this.pos < this.input.length; this.pos++) {
        switch (this.input.charCodeAt(this.pos)) {
          case 92: { // slash
            if (this.pos < this.input.length - 1) ++this.pos; // not a terminal slash
            break;
          }
          case 36: { // dollar
            if (this.input.charCodeAt(this.pos + 1) === 123) { // dollar curly
              if (this.pos === this.start && this.type === types.invalidTemplate) {
                this.pos += 2;
                return this.finishToken(types.dollarBraceL);
              }
              break out;
            }
            break;
          }
        }
      }
      return this.finishToken(types.invalidTemplate, this.input.slice(this.start, this.pos));
    }

    class CellTagParser extends Parser$1 {
      constructor(options, ...args) {
        super(Object.assign({ecmaVersion: 12}, options), ...args);
      }
      enterScope(flags) {
        if (flags & SCOPE_FUNCTION) ++this.O_function;
        return super.enterScope(flags);
      }
      exitScope() {
        if (this.currentScope().flags & SCOPE_FUNCTION) --this.O_function;
        return super.exitScope();
      }
      parseForIn(node, init) {
        if (this.O_function === 1 && node.await) this.O_async = true;
        return super.parseForIn(node, init);
      }
      parseAwait() {
        if (this.O_function === 1) this.O_async = true;
        return super.parseAwait();
      }
      parseYield(noIn) {
        if (this.O_function === 1) this.O_generator = true;
        return super.parseYield(noIn);
      }
      parseTopLevel(node) {
        this.O_function = 0;
        this.O_async = false;
        this.O_generator = false;
        this.strict = true;
        this.enterScope(SCOPE_FUNCTION | SCOPE_ASYNC | SCOPE_GENERATOR);
        node.body = this.parseExpression();
        node.input = this.input;
        node.async = this.O_async;
        node.generator = this.O_generator;
        this.exitScope();
        return this.finishNode(node, "CellTag");
      }
    }

    // Find references.
    // Check for illegal references to arguments.
    // Check for illegal assignments to global references.
    function parseReferences(cell, input, globals = defaultGlobals) {
      if (!cell.body) {
        cell.references = [];
      } else if (cell.body.type === "ImportDeclaration") {
        cell.references = cell.body.injections
          ? cell.body.injections.map(i => i.imported)
          : [];
      } else {
        try {
          cell.references = findReferences(cell, globals);
        } catch (error) {
          if (error.node) {
            const loc = getLineInfo(input, error.node.start);
            error.message += ` (${loc.line}:${loc.column})`;
            error.pos = error.node.start;
            error.loc = loc;
            delete error.node;
          }
          throw error;
        }
      }
      return cell;
    }

    // Find features: file attachments, secrets, database clients.
    // Check for illegal references to arguments.
    // Check for illegal assignments to global references.
    function parseFeatures(cell, input) {
      if (cell.body && cell.body.type !== "ImportDeclaration") {
        try {
          cell.fileAttachments = findFeatures(cell, "FileAttachment");
          cell.databaseClients = findFeatures(cell, "DatabaseClient");
          cell.secrets = findFeatures(cell, "Secret");
        } catch (error) {
          if (error.node) {
            const loc = getLineInfo(input, error.node.start);
            error.message += ` (${loc.line}:${loc.column})`;
            error.pos = error.node.start;
            error.loc = loc;
            delete error.node;
          }
          throw error;
        }
      } else {
        cell.fileAttachments = new Map();
        cell.databaseClients = new Map();
        cell.secrets = new Map();
      }
      return cell;
    }

    const parse$1 = (code) => {
        var _a;
        try {
            const ast = parseCell(code);
            if (((_a = ast === null || ast === void 0 ? void 0 : ast.body) === null || _a === void 0 ? void 0 : _a.type) === "ImportDeclaration") {
                const names = ast.body.specifiers.map(s => ({ name: s.imported.name, alias: s.local.name }));
                const urn = ast.body.source.value;
                return { type: "import", names, urn };
            }
            else {
                const name = ast.id !== null && ast.id.type === "Identifier" ? ast.id.name : undefined;
                const referencedNames = ast.references.map((dep) => dep.name);
                const dependencies = uniqueElementsInStringArray$1(referencedNames);
                const body = code.slice(ast.body.start, ast.body.end);
                const fullBody = `(${dependencies.join(", ")}) => ${body}`;
                // eslint-disable-next-line
                const result = eval(fullBody);
                return { type: "assignment", name, dependencies, body, fullBody, result };
            }
        }
        catch (e) {
            return { type: "assignment", name: undefined, dependencies: [], body: code, fullBody: code, result: () => { throw e; } };
        }
    };
    const uniqueElementsInStringArray$1 = (inp) => Array.from(new Set(inp));
    const parseInfoString = (infostring) => {
        return new Map(infostring.split("|").map(s => s.trim()).map(s => {
            const i = s.indexOf(' ');
            return i == -1 ? [s, ''] : [s.slice(0, i), s.slice(i + 1).trim()];
        }));
    };

    /**
     * marked - a markdown parser
     * Copyright (c) 2011-2021, Christopher Jeffrey. (MIT Licensed)
     * https://github.com/markedjs/marked
     */

    /**
     * DO NOT EDIT THIS FILE
     * The code in this file is generated from files in ./src/
     */

    function getDefaults() {
      return {
        baseUrl: null,
        breaks: false,
        extensions: null,
        gfm: true,
        headerIds: true,
        headerPrefix: '',
        highlight: null,
        langPrefix: 'language-',
        mangle: true,
        pedantic: false,
        renderer: null,
        sanitize: false,
        sanitizer: null,
        silent: false,
        smartLists: false,
        smartypants: false,
        tokenizer: null,
        walkTokens: null,
        xhtml: false
      };
    }

    let defaults = getDefaults();

    function changeDefaults(newDefaults) {
      defaults = newDefaults;
    }

    /**
     * Helpers
     */
    const escapeTest = /[&<>"']/;
    const escapeReplace = /[&<>"']/g;
    const escapeTestNoEncode = /[<>"']|&(?!#?\w+;)/;
    const escapeReplaceNoEncode = /[<>"']|&(?!#?\w+;)/g;
    const escapeReplacements = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    const getEscapeReplacement = (ch) => escapeReplacements[ch];
    function escape(html, encode) {
      if (encode) {
        if (escapeTest.test(html)) {
          return html.replace(escapeReplace, getEscapeReplacement);
        }
      } else {
        if (escapeTestNoEncode.test(html)) {
          return html.replace(escapeReplaceNoEncode, getEscapeReplacement);
        }
      }

      return html;
    }

    const unescapeTest = /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig;

    function unescape(html) {
      // explicitly match decimal, hex, and named HTML entities
      return html.replace(unescapeTest, (_, n) => {
        n = n.toLowerCase();
        if (n === 'colon') return ':';
        if (n.charAt(0) === '#') {
          return n.charAt(1) === 'x'
            ? String.fromCharCode(parseInt(n.substring(2), 16))
            : String.fromCharCode(+n.substring(1));
        }
        return '';
      });
    }

    const caret = /(^|[^\[])\^/g;
    function edit(regex, opt) {
      regex = regex.source || regex;
      opt = opt || '';
      const obj = {
        replace: (name, val) => {
          val = val.source || val;
          val = val.replace(caret, '$1');
          regex = regex.replace(name, val);
          return obj;
        },
        getRegex: () => {
          return new RegExp(regex, opt);
        }
      };
      return obj;
    }

    const nonWordAndColonTest = /[^\w:]/g;
    const originIndependentUrl = /^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;
    function cleanUrl(sanitize, base, href) {
      if (sanitize) {
        let prot;
        try {
          prot = decodeURIComponent(unescape(href))
            .replace(nonWordAndColonTest, '')
            .toLowerCase();
        } catch (e) {
          return null;
        }
        if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0 || prot.indexOf('data:') === 0) {
          return null;
        }
      }
      if (base && !originIndependentUrl.test(href)) {
        href = resolveUrl(base, href);
      }
      try {
        href = encodeURI(href).replace(/%25/g, '%');
      } catch (e) {
        return null;
      }
      return href;
    }

    const baseUrls = {};
    const justDomain = /^[^:]+:\/*[^/]*$/;
    const protocol = /^([^:]+:)[\s\S]*$/;
    const domain = /^([^:]+:\/*[^/]*)[\s\S]*$/;

    function resolveUrl(base, href) {
      if (!baseUrls[' ' + base]) {
        // we can ignore everything in base after the last slash of its path component,
        // but we might need to add _that_
        // https://tools.ietf.org/html/rfc3986#section-3
        if (justDomain.test(base)) {
          baseUrls[' ' + base] = base + '/';
        } else {
          baseUrls[' ' + base] = rtrim(base, '/', true);
        }
      }
      base = baseUrls[' ' + base];
      const relativeBase = base.indexOf(':') === -1;

      if (href.substring(0, 2) === '//') {
        if (relativeBase) {
          return href;
        }
        return base.replace(protocol, '$1') + href;
      } else if (href.charAt(0) === '/') {
        if (relativeBase) {
          return href;
        }
        return base.replace(domain, '$1') + href;
      } else {
        return base + href;
      }
    }

    const noopTest = { exec: function noopTest() {} };

    function merge(obj) {
      let i = 1,
        target,
        key;

      for (; i < arguments.length; i++) {
        target = arguments[i];
        for (key in target) {
          if (Object.prototype.hasOwnProperty.call(target, key)) {
            obj[key] = target[key];
          }
        }
      }

      return obj;
    }

    function splitCells(tableRow, count) {
      // ensure that every cell-delimiting pipe has a space
      // before it to distinguish it from an escaped pipe
      const row = tableRow.replace(/\|/g, (match, offset, str) => {
          let escaped = false,
            curr = offset;
          while (--curr >= 0 && str[curr] === '\\') escaped = !escaped;
          if (escaped) {
            // odd number of slashes means | is escaped
            // so we leave it alone
            return '|';
          } else {
            // add space before unescaped |
            return ' |';
          }
        }),
        cells = row.split(/ \|/);
      let i = 0;

      // First/last cell in a row cannot be empty if it has no leading/trailing pipe
      if (!cells[0].trim()) { cells.shift(); }
      if (!cells[cells.length - 1].trim()) { cells.pop(); }

      if (cells.length > count) {
        cells.splice(count);
      } else {
        while (cells.length < count) cells.push('');
      }

      for (; i < cells.length; i++) {
        // leading or trailing whitespace is ignored per the gfm spec
        cells[i] = cells[i].trim().replace(/\\\|/g, '|');
      }
      return cells;
    }

    // Remove trailing 'c's. Equivalent to str.replace(/c*$/, '').
    // /c*$/ is vulnerable to REDOS.
    // invert: Remove suffix of non-c chars instead. Default falsey.
    function rtrim(str, c, invert) {
      const l = str.length;
      if (l === 0) {
        return '';
      }

      // Length of suffix matching the invert condition.
      let suffLen = 0;

      // Step left until we fail to match the invert condition.
      while (suffLen < l) {
        const currChar = str.charAt(l - suffLen - 1);
        if (currChar === c && !invert) {
          suffLen++;
        } else if (currChar !== c && invert) {
          suffLen++;
        } else {
          break;
        }
      }

      return str.substr(0, l - suffLen);
    }

    function findClosingBracket(str, b) {
      if (str.indexOf(b[1]) === -1) {
        return -1;
      }
      const l = str.length;
      let level = 0,
        i = 0;
      for (; i < l; i++) {
        if (str[i] === '\\') {
          i++;
        } else if (str[i] === b[0]) {
          level++;
        } else if (str[i] === b[1]) {
          level--;
          if (level < 0) {
            return i;
          }
        }
      }
      return -1;
    }

    function checkSanitizeDeprecation(opt) {
      if (opt && opt.sanitize && !opt.silent) {
        console.warn('marked(): sanitize and sanitizer parameters are deprecated since version 0.7.0, should not be used and will be removed in the future. Read more here: https://marked.js.org/#/USING_ADVANCED.md#options');
      }
    }

    // copied from https://stackoverflow.com/a/5450113/806777
    function repeatString(pattern, count) {
      if (count < 1) {
        return '';
      }
      let result = '';
      while (count > 1) {
        if (count & 1) {
          result += pattern;
        }
        count >>= 1;
        pattern += pattern;
      }
      return result + pattern;
    }

    function outputLink(cap, link, raw, lexer) {
      const href = link.href;
      const title = link.title ? escape(link.title) : null;
      const text = cap[1].replace(/\\([\[\]])/g, '$1');

      if (cap[0].charAt(0) !== '!') {
        lexer.state.inLink = true;
        const token = {
          type: 'link',
          raw,
          href,
          title,
          text,
          tokens: lexer.inlineTokens(text, [])
        };
        lexer.state.inLink = false;
        return token;
      } else {
        return {
          type: 'image',
          raw,
          href,
          title,
          text: escape(text)
        };
      }
    }

    function indentCodeCompensation(raw, text) {
      const matchIndentToCode = raw.match(/^(\s+)(?:```)/);

      if (matchIndentToCode === null) {
        return text;
      }

      const indentToCode = matchIndentToCode[1];

      return text
        .split('\n')
        .map(node => {
          const matchIndentInNode = node.match(/^\s+/);
          if (matchIndentInNode === null) {
            return node;
          }

          const [indentInNode] = matchIndentInNode;

          if (indentInNode.length >= indentToCode.length) {
            return node.slice(indentToCode.length);
          }

          return node;
        })
        .join('\n');
    }

    /**
     * Tokenizer
     */
    class Tokenizer {
      constructor(options) {
        this.options = options || defaults;
      }

      space(src) {
        const cap = this.rules.block.newline.exec(src);
        if (cap) {
          if (cap[0].length > 1) {
            return {
              type: 'space',
              raw: cap[0]
            };
          }
          return { raw: '\n' };
        }
      }

      code(src) {
        const cap = this.rules.block.code.exec(src);
        if (cap) {
          const text = cap[0].replace(/^ {1,4}/gm, '');
          return {
            type: 'code',
            raw: cap[0],
            codeBlockStyle: 'indented',
            text: !this.options.pedantic
              ? rtrim(text, '\n')
              : text
          };
        }
      }

      fences(src) {
        const cap = this.rules.block.fences.exec(src);
        if (cap) {
          const raw = cap[0];
          const text = indentCodeCompensation(raw, cap[3] || '');

          return {
            type: 'code',
            raw,
            lang: cap[2] ? cap[2].trim() : cap[2],
            text
          };
        }
      }

      heading(src) {
        const cap = this.rules.block.heading.exec(src);
        if (cap) {
          let text = cap[2].trim();

          // remove trailing #s
          if (/#$/.test(text)) {
            const trimmed = rtrim(text, '#');
            if (this.options.pedantic) {
              text = trimmed.trim();
            } else if (!trimmed || / $/.test(trimmed)) {
              // CommonMark requires space before trailing #s
              text = trimmed.trim();
            }
          }

          const token = {
            type: 'heading',
            raw: cap[0],
            depth: cap[1].length,
            text: text,
            tokens: []
          };
          this.lexer.inline(token.text, token.tokens);
          return token;
        }
      }

      hr(src) {
        const cap = this.rules.block.hr.exec(src);
        if (cap) {
          return {
            type: 'hr',
            raw: cap[0]
          };
        }
      }

      blockquote(src) {
        const cap = this.rules.block.blockquote.exec(src);
        if (cap) {
          const text = cap[0].replace(/^ *> ?/gm, '');

          return {
            type: 'blockquote',
            raw: cap[0],
            tokens: this.lexer.blockTokens(text, []),
            text
          };
        }
      }

      list(src) {
        let cap = this.rules.block.list.exec(src);
        if (cap) {
          let raw, istask, ischecked, indent, i, blankLine, endsWithBlankLine,
            line, nextLine, rawLine, itemContents, endEarly;

          let bull = cap[1].trim();
          const isordered = bull.length > 1;

          const list = {
            type: 'list',
            raw: '',
            ordered: isordered,
            start: isordered ? +bull.slice(0, -1) : '',
            loose: false,
            items: []
          };

          bull = isordered ? `\\d{1,9}\\${bull.slice(-1)}` : `\\${bull}`;

          if (this.options.pedantic) {
            bull = isordered ? bull : '[*+-]';
          }

          // Get next list item
          const itemRegex = new RegExp(`^( {0,3}${bull})((?: [^\\n]*)?(?:\\n|$))`);

          // Check if current bullet point can start a new List Item
          while (src) {
            endEarly = false;
            if (!(cap = itemRegex.exec(src))) {
              break;
            }

            if (this.rules.block.hr.test(src)) { // End list if bullet was actually HR (possibly move into itemRegex?)
              break;
            }

            raw = cap[0];
            src = src.substring(raw.length);

            line = cap[2].split('\n', 1)[0];
            nextLine = src.split('\n', 1)[0];

            if (this.options.pedantic) {
              indent = 2;
              itemContents = line.trimLeft();
            } else {
              indent = cap[2].search(/[^ ]/); // Find first non-space char
              indent = indent > 4 ? 1 : indent; // Treat indented code blocks (> 4 spaces) as having only 1 indent
              itemContents = line.slice(indent);
              indent += cap[1].length;
            }

            blankLine = false;

            if (!line && /^ *$/.test(nextLine)) { // Items begin with at most one blank line
              raw += nextLine + '\n';
              src = src.substring(nextLine.length + 1);
              endEarly = true;
            }

            if (!endEarly) {
              const nextBulletRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}(?:[*+-]|\\d{1,9}[.)])`);

              // Check if following lines should be included in List Item
              while (src) {
                rawLine = src.split('\n', 1)[0];
                line = rawLine;

                // Re-align to follow commonmark nesting rules
                if (this.options.pedantic) {
                  line = line.replace(/^ {1,4}(?=( {4})*[^ ])/g, '  ');
                }

                // End list item if found start of new bullet
                if (nextBulletRegex.test(line)) {
                  break;
                }

                if (line.search(/[^ ]/) >= indent || !line.trim()) { // Dedent if possible
                  itemContents += '\n' + line.slice(indent);
                } else if (!blankLine) { // Until blank line, item doesn't need indentation
                  itemContents += '\n' + line;
                } else { // Otherwise, improper indentation ends this item
                  break;
                }

                if (!blankLine && !line.trim()) { // Check if current line is blank
                  blankLine = true;
                }

                raw += rawLine + '\n';
                src = src.substring(rawLine.length + 1);
              }
            }

            if (!list.loose) {
              // If the previous item ended with a blank line, the list is loose
              if (endsWithBlankLine) {
                list.loose = true;
              } else if (/\n *\n *$/.test(raw)) {
                endsWithBlankLine = true;
              }
            }

            // Check for task list items
            if (this.options.gfm) {
              istask = /^\[[ xX]\] /.exec(itemContents);
              if (istask) {
                ischecked = istask[0] !== '[ ] ';
                itemContents = itemContents.replace(/^\[[ xX]\] +/, '');
              }
            }

            list.items.push({
              type: 'list_item',
              raw: raw,
              task: !!istask,
              checked: ischecked,
              loose: false,
              text: itemContents
            });

            list.raw += raw;
          }

          // Do not consume newlines at end of final item. Alternatively, make itemRegex *start* with any newlines to simplify/speed up endsWithBlankLine logic
          list.items[list.items.length - 1].raw = raw.trimRight();
          list.items[list.items.length - 1].text = itemContents.trimRight();
          list.raw = list.raw.trimRight();

          const l = list.items.length;

          // Item child tokens handled here at end because we needed to have the final item to trim it first
          for (i = 0; i < l; i++) {
            this.lexer.state.top = false;
            list.items[i].tokens = this.lexer.blockTokens(list.items[i].text, []);
            if (!list.loose && list.items[i].tokens.some(t => t.type === 'space')) {
              list.loose = true;
              list.items[i].loose = true;
            }
          }

          return list;
        }
      }

      html(src) {
        const cap = this.rules.block.html.exec(src);
        if (cap) {
          const token = {
            type: 'html',
            raw: cap[0],
            pre: !this.options.sanitizer
              && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
            text: cap[0]
          };
          if (this.options.sanitize) {
            token.type = 'paragraph';
            token.text = this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape(cap[0]);
            token.tokens = [];
            this.lexer.inline(token.text, token.tokens);
          }
          return token;
        }
      }

      def(src) {
        const cap = this.rules.block.def.exec(src);
        if (cap) {
          if (cap[3]) cap[3] = cap[3].substring(1, cap[3].length - 1);
          const tag = cap[1].toLowerCase().replace(/\s+/g, ' ');
          return {
            type: 'def',
            tag,
            raw: cap[0],
            href: cap[2],
            title: cap[3]
          };
        }
      }

      table(src) {
        const cap = this.rules.block.table.exec(src);
        if (cap) {
          const item = {
            type: 'table',
            header: splitCells(cap[1]).map(c => { return { text: c }; }),
            align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
            rows: cap[3] ? cap[3].replace(/\n[ \t]*$/, '').split('\n') : []
          };

          if (item.header.length === item.align.length) {
            item.raw = cap[0];

            let l = item.align.length;
            let i, j, k, row;
            for (i = 0; i < l; i++) {
              if (/^ *-+: *$/.test(item.align[i])) {
                item.align[i] = 'right';
              } else if (/^ *:-+: *$/.test(item.align[i])) {
                item.align[i] = 'center';
              } else if (/^ *:-+ *$/.test(item.align[i])) {
                item.align[i] = 'left';
              } else {
                item.align[i] = null;
              }
            }

            l = item.rows.length;
            for (i = 0; i < l; i++) {
              item.rows[i] = splitCells(item.rows[i], item.header.length).map(c => { return { text: c }; });
            }

            // parse child tokens inside headers and cells

            // header child tokens
            l = item.header.length;
            for (j = 0; j < l; j++) {
              item.header[j].tokens = [];
              this.lexer.inlineTokens(item.header[j].text, item.header[j].tokens);
            }

            // cell child tokens
            l = item.rows.length;
            for (j = 0; j < l; j++) {
              row = item.rows[j];
              for (k = 0; k < row.length; k++) {
                row[k].tokens = [];
                this.lexer.inlineTokens(row[k].text, row[k].tokens);
              }
            }

            return item;
          }
        }
      }

      lheading(src) {
        const cap = this.rules.block.lheading.exec(src);
        if (cap) {
          const token = {
            type: 'heading',
            raw: cap[0],
            depth: cap[2].charAt(0) === '=' ? 1 : 2,
            text: cap[1],
            tokens: []
          };
          this.lexer.inline(token.text, token.tokens);
          return token;
        }
      }

      paragraph(src) {
        const cap = this.rules.block.paragraph.exec(src);
        if (cap) {
          const token = {
            type: 'paragraph',
            raw: cap[0],
            text: cap[1].charAt(cap[1].length - 1) === '\n'
              ? cap[1].slice(0, -1)
              : cap[1],
            tokens: []
          };
          this.lexer.inline(token.text, token.tokens);
          return token;
        }
      }

      text(src) {
        const cap = this.rules.block.text.exec(src);
        if (cap) {
          const token = {
            type: 'text',
            raw: cap[0],
            text: cap[0],
            tokens: []
          };
          this.lexer.inline(token.text, token.tokens);
          return token;
        }
      }

      escape(src) {
        const cap = this.rules.inline.escape.exec(src);
        if (cap) {
          return {
            type: 'escape',
            raw: cap[0],
            text: escape(cap[1])
          };
        }
      }

      tag(src) {
        const cap = this.rules.inline.tag.exec(src);
        if (cap) {
          if (!this.lexer.state.inLink && /^<a /i.test(cap[0])) {
            this.lexer.state.inLink = true;
          } else if (this.lexer.state.inLink && /^<\/a>/i.test(cap[0])) {
            this.lexer.state.inLink = false;
          }
          if (!this.lexer.state.inRawBlock && /^<(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
            this.lexer.state.inRawBlock = true;
          } else if (this.lexer.state.inRawBlock && /^<\/(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
            this.lexer.state.inRawBlock = false;
          }

          return {
            type: this.options.sanitize
              ? 'text'
              : 'html',
            raw: cap[0],
            inLink: this.lexer.state.inLink,
            inRawBlock: this.lexer.state.inRawBlock,
            text: this.options.sanitize
              ? (this.options.sanitizer
                ? this.options.sanitizer(cap[0])
                : escape(cap[0]))
              : cap[0]
          };
        }
      }

      link(src) {
        const cap = this.rules.inline.link.exec(src);
        if (cap) {
          const trimmedUrl = cap[2].trim();
          if (!this.options.pedantic && /^</.test(trimmedUrl)) {
            // commonmark requires matching angle brackets
            if (!(/>$/.test(trimmedUrl))) {
              return;
            }

            // ending angle bracket cannot be escaped
            const rtrimSlash = rtrim(trimmedUrl.slice(0, -1), '\\');
            if ((trimmedUrl.length - rtrimSlash.length) % 2 === 0) {
              return;
            }
          } else {
            // find closing parenthesis
            const lastParenIndex = findClosingBracket(cap[2], '()');
            if (lastParenIndex > -1) {
              const start = cap[0].indexOf('!') === 0 ? 5 : 4;
              const linkLen = start + cap[1].length + lastParenIndex;
              cap[2] = cap[2].substring(0, lastParenIndex);
              cap[0] = cap[0].substring(0, linkLen).trim();
              cap[3] = '';
            }
          }
          let href = cap[2];
          let title = '';
          if (this.options.pedantic) {
            // split pedantic href and title
            const link = /^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(href);

            if (link) {
              href = link[1];
              title = link[3];
            }
          } else {
            title = cap[3] ? cap[3].slice(1, -1) : '';
          }

          href = href.trim();
          if (/^</.test(href)) {
            if (this.options.pedantic && !(/>$/.test(trimmedUrl))) {
              // pedantic allows starting angle bracket without ending angle bracket
              href = href.slice(1);
            } else {
              href = href.slice(1, -1);
            }
          }
          return outputLink(cap, {
            href: href ? href.replace(this.rules.inline._escapes, '$1') : href,
            title: title ? title.replace(this.rules.inline._escapes, '$1') : title
          }, cap[0], this.lexer);
        }
      }

      reflink(src, links) {
        let cap;
        if ((cap = this.rules.inline.reflink.exec(src))
            || (cap = this.rules.inline.nolink.exec(src))) {
          let link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
          link = links[link.toLowerCase()];
          if (!link || !link.href) {
            const text = cap[0].charAt(0);
            return {
              type: 'text',
              raw: text,
              text
            };
          }
          return outputLink(cap, link, cap[0], this.lexer);
        }
      }

      emStrong(src, maskedSrc, prevChar = '') {
        let match = this.rules.inline.emStrong.lDelim.exec(src);
        if (!match) return;

        // _ can't be between two alphanumerics. \p{L}\p{N} includes non-english alphabet/numbers as well
        if (match[3] && prevChar.match(/[\p{L}\p{N}]/u)) return;

        const nextChar = match[1] || match[2] || '';

        if (!nextChar || (nextChar && (prevChar === '' || this.rules.inline.punctuation.exec(prevChar)))) {
          const lLength = match[0].length - 1;
          let rDelim, rLength, delimTotal = lLength, midDelimTotal = 0;

          const endReg = match[0][0] === '*' ? this.rules.inline.emStrong.rDelimAst : this.rules.inline.emStrong.rDelimUnd;
          endReg.lastIndex = 0;

          // Clip maskedSrc to same section of string as src (move to lexer?)
          maskedSrc = maskedSrc.slice(-1 * src.length + lLength);

          while ((match = endReg.exec(maskedSrc)) != null) {
            rDelim = match[1] || match[2] || match[3] || match[4] || match[5] || match[6];

            if (!rDelim) continue; // skip single * in __abc*abc__

            rLength = rDelim.length;

            if (match[3] || match[4]) { // found another Left Delim
              delimTotal += rLength;
              continue;
            } else if (match[5] || match[6]) { // either Left or Right Delim
              if (lLength % 3 && !((lLength + rLength) % 3)) {
                midDelimTotal += rLength;
                continue; // CommonMark Emphasis Rules 9-10
              }
            }

            delimTotal -= rLength;

            if (delimTotal > 0) continue; // Haven't found enough closing delimiters

            // Remove extra characters. *a*** -> *a*
            rLength = Math.min(rLength, rLength + delimTotal + midDelimTotal);

            // Create `em` if smallest delimiter has odd char count. *a***
            if (Math.min(lLength, rLength) % 2) {
              const text = src.slice(1, lLength + match.index + rLength);
              return {
                type: 'em',
                raw: src.slice(0, lLength + match.index + rLength + 1),
                text,
                tokens: this.lexer.inlineTokens(text, [])
              };
            }

            // Create 'strong' if smallest delimiter has even char count. **a***
            const text = src.slice(2, lLength + match.index + rLength - 1);
            return {
              type: 'strong',
              raw: src.slice(0, lLength + match.index + rLength + 1),
              text,
              tokens: this.lexer.inlineTokens(text, [])
            };
          }
        }
      }

      codespan(src) {
        const cap = this.rules.inline.code.exec(src);
        if (cap) {
          let text = cap[2].replace(/\n/g, ' ');
          const hasNonSpaceChars = /[^ ]/.test(text);
          const hasSpaceCharsOnBothEnds = /^ /.test(text) && / $/.test(text);
          if (hasNonSpaceChars && hasSpaceCharsOnBothEnds) {
            text = text.substring(1, text.length - 1);
          }
          text = escape(text, true);
          return {
            type: 'codespan',
            raw: cap[0],
            text
          };
        }
      }

      br(src) {
        const cap = this.rules.inline.br.exec(src);
        if (cap) {
          return {
            type: 'br',
            raw: cap[0]
          };
        }
      }

      del(src) {
        const cap = this.rules.inline.del.exec(src);
        if (cap) {
          return {
            type: 'del',
            raw: cap[0],
            text: cap[2],
            tokens: this.lexer.inlineTokens(cap[2], [])
          };
        }
      }

      autolink(src, mangle) {
        const cap = this.rules.inline.autolink.exec(src);
        if (cap) {
          let text, href;
          if (cap[2] === '@') {
            text = escape(this.options.mangle ? mangle(cap[1]) : cap[1]);
            href = 'mailto:' + text;
          } else {
            text = escape(cap[1]);
            href = text;
          }

          return {
            type: 'link',
            raw: cap[0],
            text,
            href,
            tokens: [
              {
                type: 'text',
                raw: text,
                text
              }
            ]
          };
        }
      }

      url(src, mangle) {
        let cap;
        if (cap = this.rules.inline.url.exec(src)) {
          let text, href;
          if (cap[2] === '@') {
            text = escape(this.options.mangle ? mangle(cap[0]) : cap[0]);
            href = 'mailto:' + text;
          } else {
            // do extended autolink path validation
            let prevCapZero;
            do {
              prevCapZero = cap[0];
              cap[0] = this.rules.inline._backpedal.exec(cap[0])[0];
            } while (prevCapZero !== cap[0]);
            text = escape(cap[0]);
            if (cap[1] === 'www.') {
              href = 'http://' + text;
            } else {
              href = text;
            }
          }
          return {
            type: 'link',
            raw: cap[0],
            text,
            href,
            tokens: [
              {
                type: 'text',
                raw: text,
                text
              }
            ]
          };
        }
      }

      inlineText(src, smartypants) {
        const cap = this.rules.inline.text.exec(src);
        if (cap) {
          let text;
          if (this.lexer.state.inRawBlock) {
            text = this.options.sanitize ? (this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape(cap[0])) : cap[0];
          } else {
            text = escape(this.options.smartypants ? smartypants(cap[0]) : cap[0]);
          }
          return {
            type: 'text',
            raw: cap[0],
            text
          };
        }
      }
    }

    /**
     * Block-Level Grammar
     */
    const block = {
      newline: /^(?: *(?:\n|$))+/,
      code: /^( {4}[^\n]+(?:\n(?: *(?:\n|$))*)?)+/,
      fences: /^ {0,3}(`{3,}(?=[^`\n]*\n)|~{3,})([^\n]*)\n(?:|([\s\S]*?)\n)(?: {0,3}\1[~`]* *(?=\n|$)|$)/,
      hr: /^ {0,3}((?:- *){3,}|(?:_ *){3,}|(?:\* *){3,})(?:\n+|$)/,
      heading: /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,
      blockquote: /^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,
      list: /^( {0,3}bull)( [^\n]+?)?(?:\n|$)/,
      html: '^ {0,3}(?:' // optional indentation
        + '<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)' // (1)
        + '|comment[^\\n]*(\\n+|$)' // (2)
        + '|<\\?[\\s\\S]*?(?:\\?>\\n*|$)' // (3)
        + '|<![A-Z][\\s\\S]*?(?:>\\n*|$)' // (4)
        + '|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)' // (5)
        + '|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n *)+\\n|$)' // (6)
        + '|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)' // (7) open tag
        + '|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)' // (7) closing tag
        + ')',
      def: /^ {0,3}\[(label)\]: *\n? *<?([^\s>]+)>?(?:(?: +\n? *| *\n *)(title))? *(?:\n+|$)/,
      table: noopTest,
      lheading: /^([^\n]+)\n {0,3}(=+|-+) *(?:\n+|$)/,
      // regex template, placeholders will be replaced according to different paragraph
      // interruption rules of commonmark and the original markdown spec:
      _paragraph: /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,
      text: /^[^\n]+/
    };

    block._label = /(?!\s*\])(?:\\[\[\]]|[^\[\]])+/;
    block._title = /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/;
    block.def = edit(block.def)
      .replace('label', block._label)
      .replace('title', block._title)
      .getRegex();

    block.bullet = /(?:[*+-]|\d{1,9}[.)])/;
    block.listItemStart = edit(/^( *)(bull) */)
      .replace('bull', block.bullet)
      .getRegex();

    block.list = edit(block.list)
      .replace(/bull/g, block.bullet)
      .replace('hr', '\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))')
      .replace('def', '\\n+(?=' + block.def.source + ')')
      .getRegex();

    block._tag = 'address|article|aside|base|basefont|blockquote|body|caption'
      + '|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption'
      + '|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe'
      + '|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option'
      + '|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr'
      + '|track|ul';
    block._comment = /<!--(?!-?>)[\s\S]*?(?:-->|$)/;
    block.html = edit(block.html, 'i')
      .replace('comment', block._comment)
      .replace('tag', block._tag)
      .replace('attribute', / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/)
      .getRegex();

    block.paragraph = edit(block._paragraph)
      .replace('hr', block.hr)
      .replace('heading', ' {0,3}#{1,6} ')
      .replace('|lheading', '') // setex headings don't interrupt commonmark paragraphs
      .replace('|table', '')
      .replace('blockquote', ' {0,3}>')
      .replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n')
      .replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
      .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)')
      .replace('tag', block._tag) // pars can be interrupted by type (6) html blocks
      .getRegex();

    block.blockquote = edit(block.blockquote)
      .replace('paragraph', block.paragraph)
      .getRegex();

    /**
     * Normal Block Grammar
     */

    block.normal = merge({}, block);

    /**
     * GFM Block Grammar
     */

    block.gfm = merge({}, block.normal, {
      table: '^ *([^\\n ].*\\|.*)\\n' // Header
        + ' {0,3}(?:\\| *)?(:?-+:? *(?:\\| *:?-+:? *)*)(?:\\| *)?' // Align
        + '(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)' // Cells
    });

    block.gfm.table = edit(block.gfm.table)
      .replace('hr', block.hr)
      .replace('heading', ' {0,3}#{1,6} ')
      .replace('blockquote', ' {0,3}>')
      .replace('code', ' {4}[^\\n]')
      .replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n')
      .replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
      .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)')
      .replace('tag', block._tag) // tables can be interrupted by type (6) html blocks
      .getRegex();

    block.gfm.paragraph = edit(block._paragraph)
      .replace('hr', block.hr)
      .replace('heading', ' {0,3}#{1,6} ')
      .replace('|lheading', '') // setex headings don't interrupt commonmark paragraphs
      .replace('table', block.gfm.table) // interrupt paragraphs with table
      .replace('blockquote', ' {0,3}>')
      .replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n')
      .replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
      .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)')
      .replace('tag', block._tag) // pars can be interrupted by type (6) html blocks
      .getRegex();
    /**
     * Pedantic grammar (original John Gruber's loose markdown specification)
     */

    block.pedantic = merge({}, block.normal, {
      html: edit(
        '^ *(?:comment *(?:\\n|\\s*$)'
        + '|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)' // closed tag
        + '|<tag(?:"[^"]*"|\'[^\']*\'|\\s[^\'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))')
        .replace('comment', block._comment)
        .replace(/tag/g, '(?!(?:'
          + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub'
          + '|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)'
          + '\\b)\\w+(?!:|[^\\w\\s@]*@)\\b')
        .getRegex(),
      def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
      heading: /^(#{1,6})(.*)(?:\n+|$)/,
      fences: noopTest, // fences not supported
      paragraph: edit(block.normal._paragraph)
        .replace('hr', block.hr)
        .replace('heading', ' *#{1,6} *[^\n]')
        .replace('lheading', block.lheading)
        .replace('blockquote', ' {0,3}>')
        .replace('|fences', '')
        .replace('|list', '')
        .replace('|html', '')
        .getRegex()
    });

    /**
     * Inline-Level Grammar
     */
    const inline = {
      escape: /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,
      autolink: /^<(scheme:[^\s\x00-\x1f<>]*|email)>/,
      url: noopTest,
      tag: '^comment'
        + '|^</[a-zA-Z][\\w:-]*\\s*>' // self-closing tag
        + '|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>' // open tag
        + '|^<\\?[\\s\\S]*?\\?>' // processing instruction, e.g. <?php ?>
        + '|^<![a-zA-Z]+\\s[\\s\\S]*?>' // declaration, e.g. <!DOCTYPE html>
        + '|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>', // CDATA section
      link: /^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/,
      reflink: /^!?\[(label)\]\[(?!\s*\])((?:\\[\[\]]?|[^\[\]\\])+)\]/,
      nolink: /^!?\[(?!\s*\])((?:\[[^\[\]]*\]|\\[\[\]]|[^\[\]])*)\](?:\[\])?/,
      reflinkSearch: 'reflink|nolink(?!\\()',
      emStrong: {
        lDelim: /^(?:\*+(?:([punct_])|[^\s*]))|^_+(?:([punct*])|([^\s_]))/,
        //        (1) and (2) can only be a Right Delimiter. (3) and (4) can only be Left.  (5) and (6) can be either Left or Right.
        //        () Skip orphan delim inside strong    (1) #***                (2) a***#, a***                   (3) #***a, ***a                 (4) ***#              (5) #***#                 (6) a***a
        rDelimAst: /^[^_*]*?\_\_[^_*]*?\*[^_*]*?(?=\_\_)|[punct_](\*+)(?=[\s]|$)|[^punct*_\s](\*+)(?=[punct_\s]|$)|[punct_\s](\*+)(?=[^punct*_\s])|[\s](\*+)(?=[punct_])|[punct_](\*+)(?=[punct_])|[^punct*_\s](\*+)(?=[^punct*_\s])/,
        rDelimUnd: /^[^_*]*?\*\*[^_*]*?\_[^_*]*?(?=\*\*)|[punct*](\_+)(?=[\s]|$)|[^punct*_\s](\_+)(?=[punct*\s]|$)|[punct*\s](\_+)(?=[^punct*_\s])|[\s](\_+)(?=[punct*])|[punct*](\_+)(?=[punct*])/ // ^- Not allowed for _
      },
      code: /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,
      br: /^( {2,}|\\)\n(?!\s*$)/,
      del: noopTest,
      text: /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,
      punctuation: /^([\spunctuation])/
    };

    // list of punctuation marks from CommonMark spec
    // without * and _ to handle the different emphasis markers * and _
    inline._punctuation = '!"#$%&\'()+\\-.,/:;<=>?@\\[\\]`^{|}~';
    inline.punctuation = edit(inline.punctuation).replace(/punctuation/g, inline._punctuation).getRegex();

    // sequences em should skip over [title](link), `code`, <html>
    inline.blockSkip = /\[[^\]]*?\]\([^\)]*?\)|`[^`]*?`|<[^>]*?>/g;
    inline.escapedEmSt = /\\\*|\\_/g;

    inline._comment = edit(block._comment).replace('(?:-->|$)', '-->').getRegex();

    inline.emStrong.lDelim = edit(inline.emStrong.lDelim)
      .replace(/punct/g, inline._punctuation)
      .getRegex();

    inline.emStrong.rDelimAst = edit(inline.emStrong.rDelimAst, 'g')
      .replace(/punct/g, inline._punctuation)
      .getRegex();

    inline.emStrong.rDelimUnd = edit(inline.emStrong.rDelimUnd, 'g')
      .replace(/punct/g, inline._punctuation)
      .getRegex();

    inline._escapes = /\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/g;

    inline._scheme = /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/;
    inline._email = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/;
    inline.autolink = edit(inline.autolink)
      .replace('scheme', inline._scheme)
      .replace('email', inline._email)
      .getRegex();

    inline._attribute = /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/;

    inline.tag = edit(inline.tag)
      .replace('comment', inline._comment)
      .replace('attribute', inline._attribute)
      .getRegex();

    inline._label = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/;
    inline._href = /<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/;
    inline._title = /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/;

    inline.link = edit(inline.link)
      .replace('label', inline._label)
      .replace('href', inline._href)
      .replace('title', inline._title)
      .getRegex();

    inline.reflink = edit(inline.reflink)
      .replace('label', inline._label)
      .getRegex();

    inline.reflinkSearch = edit(inline.reflinkSearch, 'g')
      .replace('reflink', inline.reflink)
      .replace('nolink', inline.nolink)
      .getRegex();

    /**
     * Normal Inline Grammar
     */

    inline.normal = merge({}, inline);

    /**
     * Pedantic Inline Grammar
     */

    inline.pedantic = merge({}, inline.normal, {
      strong: {
        start: /^__|\*\*/,
        middle: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
        endAst: /\*\*(?!\*)/g,
        endUnd: /__(?!_)/g
      },
      em: {
        start: /^_|\*/,
        middle: /^()\*(?=\S)([\s\S]*?\S)\*(?!\*)|^_(?=\S)([\s\S]*?\S)_(?!_)/,
        endAst: /\*(?!\*)/g,
        endUnd: /_(?!_)/g
      },
      link: edit(/^!?\[(label)\]\((.*?)\)/)
        .replace('label', inline._label)
        .getRegex(),
      reflink: edit(/^!?\[(label)\]\s*\[([^\]]*)\]/)
        .replace('label', inline._label)
        .getRegex()
    });

    /**
     * GFM Inline Grammar
     */

    inline.gfm = merge({}, inline.normal, {
      escape: edit(inline.escape).replace('])', '~|])').getRegex(),
      _extended_email: /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/,
      url: /^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,
      _backpedal: /(?:[^?!.,:;*_~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_~)]+(?!$))+/,
      del: /^(~~?)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/,
      text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
    });

    inline.gfm.url = edit(inline.gfm.url, 'i')
      .replace('email', inline.gfm._extended_email)
      .getRegex();
    /**
     * GFM + Line Breaks Inline Grammar
     */

    inline.breaks = merge({}, inline.gfm, {
      br: edit(inline.br).replace('{2,}', '*').getRegex(),
      text: edit(inline.gfm.text)
        .replace('\\b_', '\\b_| {2,}\\n')
        .replace(/\{2,\}/g, '*')
        .getRegex()
    });

    /**
     * smartypants text replacement
     */
    function smartypants(text) {
      return text
        // em-dashes
        .replace(/---/g, '\u2014')
        // en-dashes
        .replace(/--/g, '\u2013')
        // opening singles
        .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
        // closing singles & apostrophes
        .replace(/'/g, '\u2019')
        // opening doubles
        .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
        // closing doubles
        .replace(/"/g, '\u201d')
        // ellipses
        .replace(/\.{3}/g, '\u2026');
    }

    /**
     * mangle email addresses
     */
    function mangle(text) {
      let out = '',
        i,
        ch;

      const l = text.length;
      for (i = 0; i < l; i++) {
        ch = text.charCodeAt(i);
        if (Math.random() > 0.5) {
          ch = 'x' + ch.toString(16);
        }
        out += '&#' + ch + ';';
      }

      return out;
    }

    /**
     * Block Lexer
     */
    class Lexer {
      constructor(options) {
        this.tokens = [];
        this.tokens.links = Object.create(null);
        this.options = options || defaults;
        this.options.tokenizer = this.options.tokenizer || new Tokenizer();
        this.tokenizer = this.options.tokenizer;
        this.tokenizer.options = this.options;
        this.tokenizer.lexer = this;
        this.inlineQueue = [];
        this.state = {
          inLink: false,
          inRawBlock: false,
          top: true
        };

        const rules = {
          block: block.normal,
          inline: inline.normal
        };

        if (this.options.pedantic) {
          rules.block = block.pedantic;
          rules.inline = inline.pedantic;
        } else if (this.options.gfm) {
          rules.block = block.gfm;
          if (this.options.breaks) {
            rules.inline = inline.breaks;
          } else {
            rules.inline = inline.gfm;
          }
        }
        this.tokenizer.rules = rules;
      }

      /**
       * Expose Rules
       */
      static get rules() {
        return {
          block,
          inline
        };
      }

      /**
       * Static Lex Method
       */
      static lex(src, options) {
        const lexer = new Lexer(options);
        return lexer.lex(src);
      }

      /**
       * Static Lex Inline Method
       */
      static lexInline(src, options) {
        const lexer = new Lexer(options);
        return lexer.inlineTokens(src);
      }

      /**
       * Preprocessing
       */
      lex(src) {
        src = src
          .replace(/\r\n|\r/g, '\n')
          .replace(/\t/g, '    ');

        this.blockTokens(src, this.tokens);

        let next;
        while (next = this.inlineQueue.shift()) {
          this.inlineTokens(next.src, next.tokens);
        }

        return this.tokens;
      }

      /**
       * Lexing
       */
      blockTokens(src, tokens = []) {
        if (this.options.pedantic) {
          src = src.replace(/^ +$/gm, '');
        }
        let token, lastToken, cutSrc, lastParagraphClipped;

        while (src) {
          if (this.options.extensions
            && this.options.extensions.block
            && this.options.extensions.block.some((extTokenizer) => {
              if (token = extTokenizer.call({ lexer: this }, src, tokens)) {
                src = src.substring(token.raw.length);
                tokens.push(token);
                return true;
              }
              return false;
            })) {
            continue;
          }

          // newline
          if (token = this.tokenizer.space(src)) {
            src = src.substring(token.raw.length);
            if (token.type) {
              tokens.push(token);
            }
            continue;
          }

          // code
          if (token = this.tokenizer.code(src)) {
            src = src.substring(token.raw.length);
            lastToken = tokens[tokens.length - 1];
            // An indented code block cannot interrupt a paragraph.
            if (lastToken && (lastToken.type === 'paragraph' || lastToken.type === 'text')) {
              lastToken.raw += '\n' + token.raw;
              lastToken.text += '\n' + token.text;
              this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
            } else {
              tokens.push(token);
            }
            continue;
          }

          // fences
          if (token = this.tokenizer.fences(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // heading
          if (token = this.tokenizer.heading(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // hr
          if (token = this.tokenizer.hr(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // blockquote
          if (token = this.tokenizer.blockquote(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // list
          if (token = this.tokenizer.list(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // html
          if (token = this.tokenizer.html(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // def
          if (token = this.tokenizer.def(src)) {
            src = src.substring(token.raw.length);
            lastToken = tokens[tokens.length - 1];
            if (lastToken && (lastToken.type === 'paragraph' || lastToken.type === 'text')) {
              lastToken.raw += '\n' + token.raw;
              lastToken.text += '\n' + token.raw;
              this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
            } else if (!this.tokens.links[token.tag]) {
              this.tokens.links[token.tag] = {
                href: token.href,
                title: token.title
              };
            }
            continue;
          }

          // table (gfm)
          if (token = this.tokenizer.table(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // lheading
          if (token = this.tokenizer.lheading(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // top-level paragraph
          // prevent paragraph consuming extensions by clipping 'src' to extension start
          cutSrc = src;
          if (this.options.extensions && this.options.extensions.startBlock) {
            let startIndex = Infinity;
            const tempSrc = src.slice(1);
            let tempStart;
            this.options.extensions.startBlock.forEach(function(getStartIndex) {
              tempStart = getStartIndex.call({ lexer: this }, tempSrc);
              if (typeof tempStart === 'number' && tempStart >= 0) { startIndex = Math.min(startIndex, tempStart); }
            });
            if (startIndex < Infinity && startIndex >= 0) {
              cutSrc = src.substring(0, startIndex + 1);
            }
          }
          if (this.state.top && (token = this.tokenizer.paragraph(cutSrc))) {
            lastToken = tokens[tokens.length - 1];
            if (lastParagraphClipped && lastToken.type === 'paragraph') {
              lastToken.raw += '\n' + token.raw;
              lastToken.text += '\n' + token.text;
              this.inlineQueue.pop();
              this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
            } else {
              tokens.push(token);
            }
            lastParagraphClipped = (cutSrc.length !== src.length);
            src = src.substring(token.raw.length);
            continue;
          }

          // text
          if (token = this.tokenizer.text(src)) {
            src = src.substring(token.raw.length);
            lastToken = tokens[tokens.length - 1];
            if (lastToken && lastToken.type === 'text') {
              lastToken.raw += '\n' + token.raw;
              lastToken.text += '\n' + token.text;
              this.inlineQueue.pop();
              this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
            } else {
              tokens.push(token);
            }
            continue;
          }

          if (src) {
            const errMsg = 'Infinite loop on byte: ' + src.charCodeAt(0);
            if (this.options.silent) {
              console.error(errMsg);
              break;
            } else {
              throw new Error(errMsg);
            }
          }
        }

        this.state.top = true;
        return tokens;
      }

      inline(src, tokens) {
        this.inlineQueue.push({ src, tokens });
      }

      /**
       * Lexing/Compiling
       */
      inlineTokens(src, tokens = []) {
        let token, lastToken, cutSrc;

        // String with links masked to avoid interference with em and strong
        let maskedSrc = src;
        let match;
        let keepPrevChar, prevChar;

        // Mask out reflinks
        if (this.tokens.links) {
          const links = Object.keys(this.tokens.links);
          if (links.length > 0) {
            while ((match = this.tokenizer.rules.inline.reflinkSearch.exec(maskedSrc)) != null) {
              if (links.includes(match[0].slice(match[0].lastIndexOf('[') + 1, -1))) {
                maskedSrc = maskedSrc.slice(0, match.index) + '[' + repeatString('a', match[0].length - 2) + ']' + maskedSrc.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex);
              }
            }
          }
        }
        // Mask out other blocks
        while ((match = this.tokenizer.rules.inline.blockSkip.exec(maskedSrc)) != null) {
          maskedSrc = maskedSrc.slice(0, match.index) + '[' + repeatString('a', match[0].length - 2) + ']' + maskedSrc.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
        }

        // Mask out escaped em & strong delimiters
        while ((match = this.tokenizer.rules.inline.escapedEmSt.exec(maskedSrc)) != null) {
          maskedSrc = maskedSrc.slice(0, match.index) + '++' + maskedSrc.slice(this.tokenizer.rules.inline.escapedEmSt.lastIndex);
        }

        while (src) {
          if (!keepPrevChar) {
            prevChar = '';
          }
          keepPrevChar = false;

          // extensions
          if (this.options.extensions
            && this.options.extensions.inline
            && this.options.extensions.inline.some((extTokenizer) => {
              if (token = extTokenizer.call({ lexer: this }, src, tokens)) {
                src = src.substring(token.raw.length);
                tokens.push(token);
                return true;
              }
              return false;
            })) {
            continue;
          }

          // escape
          if (token = this.tokenizer.escape(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // tag
          if (token = this.tokenizer.tag(src)) {
            src = src.substring(token.raw.length);
            lastToken = tokens[tokens.length - 1];
            if (lastToken && token.type === 'text' && lastToken.type === 'text') {
              lastToken.raw += token.raw;
              lastToken.text += token.text;
            } else {
              tokens.push(token);
            }
            continue;
          }

          // link
          if (token = this.tokenizer.link(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // reflink, nolink
          if (token = this.tokenizer.reflink(src, this.tokens.links)) {
            src = src.substring(token.raw.length);
            lastToken = tokens[tokens.length - 1];
            if (lastToken && token.type === 'text' && lastToken.type === 'text') {
              lastToken.raw += token.raw;
              lastToken.text += token.text;
            } else {
              tokens.push(token);
            }
            continue;
          }

          // em & strong
          if (token = this.tokenizer.emStrong(src, maskedSrc, prevChar)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // code
          if (token = this.tokenizer.codespan(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // br
          if (token = this.tokenizer.br(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // del (gfm)
          if (token = this.tokenizer.del(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // autolink
          if (token = this.tokenizer.autolink(src, mangle)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // url (gfm)
          if (!this.state.inLink && (token = this.tokenizer.url(src, mangle))) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // text
          // prevent inlineText consuming extensions by clipping 'src' to extension start
          cutSrc = src;
          if (this.options.extensions && this.options.extensions.startInline) {
            let startIndex = Infinity;
            const tempSrc = src.slice(1);
            let tempStart;
            this.options.extensions.startInline.forEach(function(getStartIndex) {
              tempStart = getStartIndex.call({ lexer: this }, tempSrc);
              if (typeof tempStart === 'number' && tempStart >= 0) { startIndex = Math.min(startIndex, tempStart); }
            });
            if (startIndex < Infinity && startIndex >= 0) {
              cutSrc = src.substring(0, startIndex + 1);
            }
          }
          if (token = this.tokenizer.inlineText(cutSrc, smartypants)) {
            src = src.substring(token.raw.length);
            if (token.raw.slice(-1) !== '_') { // Track prevChar before string of ____ started
              prevChar = token.raw.slice(-1);
            }
            keepPrevChar = true;
            lastToken = tokens[tokens.length - 1];
            if (lastToken && lastToken.type === 'text') {
              lastToken.raw += token.raw;
              lastToken.text += token.text;
            } else {
              tokens.push(token);
            }
            continue;
          }

          if (src) {
            const errMsg = 'Infinite loop on byte: ' + src.charCodeAt(0);
            if (this.options.silent) {
              console.error(errMsg);
              break;
            } else {
              throw new Error(errMsg);
            }
          }
        }

        return tokens;
      }
    }

    /**
     * Renderer
     */
    class Renderer {
      constructor(options) {
        this.options = options || defaults;
      }

      code(code, infostring, escaped) {
        const lang = (infostring || '').match(/\S*/)[0];
        if (this.options.highlight) {
          const out = this.options.highlight(code, lang);
          if (out != null && out !== code) {
            escaped = true;
            code = out;
          }
        }

        code = code.replace(/\n$/, '') + '\n';

        if (!lang) {
          return '<pre><code>'
            + (escaped ? code : escape(code, true))
            + '</code></pre>\n';
        }

        return '<pre><code class="'
          + this.options.langPrefix
          + escape(lang, true)
          + '">'
          + (escaped ? code : escape(code, true))
          + '</code></pre>\n';
      }

      blockquote(quote) {
        return '<blockquote>\n' + quote + '</blockquote>\n';
      }

      html(html) {
        return html;
      }

      heading(text, level, raw, slugger) {
        if (this.options.headerIds) {
          return '<h'
            + level
            + ' id="'
            + this.options.headerPrefix
            + slugger.slug(raw)
            + '">'
            + text
            + '</h'
            + level
            + '>\n';
        }
        // ignore IDs
        return '<h' + level + '>' + text + '</h' + level + '>\n';
      }

      hr() {
        return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
      }

      list(body, ordered, start) {
        const type = ordered ? 'ol' : 'ul',
          startatt = (ordered && start !== 1) ? (' start="' + start + '"') : '';
        return '<' + type + startatt + '>\n' + body + '</' + type + '>\n';
      }

      listitem(text) {
        return '<li>' + text + '</li>\n';
      }

      checkbox(checked) {
        return '<input '
          + (checked ? 'checked="" ' : '')
          + 'disabled="" type="checkbox"'
          + (this.options.xhtml ? ' /' : '')
          + '> ';
      }

      paragraph(text) {
        return '<p>' + text + '</p>\n';
      }

      table(header, body) {
        if (body) body = '<tbody>' + body + '</tbody>';

        return '<table>\n'
          + '<thead>\n'
          + header
          + '</thead>\n'
          + body
          + '</table>\n';
      }

      tablerow(content) {
        return '<tr>\n' + content + '</tr>\n';
      }

      tablecell(content, flags) {
        const type = flags.header ? 'th' : 'td';
        const tag = flags.align
          ? '<' + type + ' align="' + flags.align + '">'
          : '<' + type + '>';
        return tag + content + '</' + type + '>\n';
      }

      // span level renderer
      strong(text) {
        return '<strong>' + text + '</strong>';
      }

      em(text) {
        return '<em>' + text + '</em>';
      }

      codespan(text) {
        return '<code>' + text + '</code>';
      }

      br() {
        return this.options.xhtml ? '<br/>' : '<br>';
      }

      del(text) {
        return '<del>' + text + '</del>';
      }

      link(href, title, text) {
        href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);
        if (href === null) {
          return text;
        }
        let out = '<a href="' + escape(href) + '"';
        if (title) {
          out += ' title="' + title + '"';
        }
        out += '>' + text + '</a>';
        return out;
      }

      image(href, title, text) {
        href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);
        if (href === null) {
          return text;
        }

        let out = '<img src="' + href + '" alt="' + text + '"';
        if (title) {
          out += ' title="' + title + '"';
        }
        out += this.options.xhtml ? '/>' : '>';
        return out;
      }

      text(text) {
        return text;
      }
    }

    /**
     * TextRenderer
     * returns only the textual part of the token
     */
    class TextRenderer {
      // no need for block level renderers
      strong(text) {
        return text;
      }

      em(text) {
        return text;
      }

      codespan(text) {
        return text;
      }

      del(text) {
        return text;
      }

      html(text) {
        return text;
      }

      text(text) {
        return text;
      }

      link(href, title, text) {
        return '' + text;
      }

      image(href, title, text) {
        return '' + text;
      }

      br() {
        return '';
      }
    }

    /**
     * Slugger generates header id
     */
    class Slugger {
      constructor() {
        this.seen = {};
      }

      serialize(value) {
        return value
          .toLowerCase()
          .trim()
          // remove html tags
          .replace(/<[!\/a-z].*?>/ig, '')
          // remove unwanted chars
          .replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g, '')
          .replace(/\s/g, '-');
      }

      /**
       * Finds the next safe (unique) slug to use
       */
      getNextSafeSlug(originalSlug, isDryRun) {
        let slug = originalSlug;
        let occurenceAccumulator = 0;
        if (this.seen.hasOwnProperty(slug)) {
          occurenceAccumulator = this.seen[originalSlug];
          do {
            occurenceAccumulator++;
            slug = originalSlug + '-' + occurenceAccumulator;
          } while (this.seen.hasOwnProperty(slug));
        }
        if (!isDryRun) {
          this.seen[originalSlug] = occurenceAccumulator;
          this.seen[slug] = 0;
        }
        return slug;
      }

      /**
       * Convert string to unique id
       * @param {object} options
       * @param {boolean} options.dryrun Generates the next unique slug without updating the internal accumulator.
       */
      slug(value, options = {}) {
        const slug = this.serialize(value);
        return this.getNextSafeSlug(slug, options.dryrun);
      }
    }

    /**
     * Parsing & Compiling
     */
    class Parser {
      constructor(options) {
        this.options = options || defaults;
        this.options.renderer = this.options.renderer || new Renderer();
        this.renderer = this.options.renderer;
        this.renderer.options = this.options;
        this.textRenderer = new TextRenderer();
        this.slugger = new Slugger();
      }

      /**
       * Static Parse Method
       */
      static parse(tokens, options) {
        const parser = new Parser(options);
        return parser.parse(tokens);
      }

      /**
       * Static Parse Inline Method
       */
      static parseInline(tokens, options) {
        const parser = new Parser(options);
        return parser.parseInline(tokens);
      }

      /**
       * Parse Loop
       */
      parse(tokens, top = true) {
        let out = '',
          i,
          j,
          k,
          l2,
          l3,
          row,
          cell,
          header,
          body,
          token,
          ordered,
          start,
          loose,
          itemBody,
          item,
          checked,
          task,
          checkbox,
          ret;

        const l = tokens.length;
        for (i = 0; i < l; i++) {
          token = tokens[i];

          // Run any renderer extensions
          if (this.options.extensions && this.options.extensions.renderers && this.options.extensions.renderers[token.type]) {
            ret = this.options.extensions.renderers[token.type].call({ parser: this }, token);
            if (ret !== false || !['space', 'hr', 'heading', 'code', 'table', 'blockquote', 'list', 'html', 'paragraph', 'text'].includes(token.type)) {
              out += ret || '';
              continue;
            }
          }

          switch (token.type) {
            case 'space': {
              continue;
            }
            case 'hr': {
              out += this.renderer.hr();
              continue;
            }
            case 'heading': {
              out += this.renderer.heading(
                this.parseInline(token.tokens),
                token.depth,
                unescape(this.parseInline(token.tokens, this.textRenderer)),
                this.slugger);
              continue;
            }
            case 'code': {
              out += this.renderer.code(token.text,
                token.lang,
                token.escaped);
              continue;
            }
            case 'table': {
              header = '';

              // header
              cell = '';
              l2 = token.header.length;
              for (j = 0; j < l2; j++) {
                cell += this.renderer.tablecell(
                  this.parseInline(token.header[j].tokens),
                  { header: true, align: token.align[j] }
                );
              }
              header += this.renderer.tablerow(cell);

              body = '';
              l2 = token.rows.length;
              for (j = 0; j < l2; j++) {
                row = token.rows[j];

                cell = '';
                l3 = row.length;
                for (k = 0; k < l3; k++) {
                  cell += this.renderer.tablecell(
                    this.parseInline(row[k].tokens),
                    { header: false, align: token.align[k] }
                  );
                }

                body += this.renderer.tablerow(cell);
              }
              out += this.renderer.table(header, body);
              continue;
            }
            case 'blockquote': {
              body = this.parse(token.tokens);
              out += this.renderer.blockquote(body);
              continue;
            }
            case 'list': {
              ordered = token.ordered;
              start = token.start;
              loose = token.loose;
              l2 = token.items.length;

              body = '';
              for (j = 0; j < l2; j++) {
                item = token.items[j];
                checked = item.checked;
                task = item.task;

                itemBody = '';
                if (item.task) {
                  checkbox = this.renderer.checkbox(checked);
                  if (loose) {
                    if (item.tokens.length > 0 && item.tokens[0].type === 'paragraph') {
                      item.tokens[0].text = checkbox + ' ' + item.tokens[0].text;
                      if (item.tokens[0].tokens && item.tokens[0].tokens.length > 0 && item.tokens[0].tokens[0].type === 'text') {
                        item.tokens[0].tokens[0].text = checkbox + ' ' + item.tokens[0].tokens[0].text;
                      }
                    } else {
                      item.tokens.unshift({
                        type: 'text',
                        text: checkbox
                      });
                    }
                  } else {
                    itemBody += checkbox;
                  }
                }

                itemBody += this.parse(item.tokens, loose);
                body += this.renderer.listitem(itemBody, task, checked);
              }

              out += this.renderer.list(body, ordered, start);
              continue;
            }
            case 'html': {
              // TODO parse inline content if parameter markdown=1
              out += this.renderer.html(token.text);
              continue;
            }
            case 'paragraph': {
              out += this.renderer.paragraph(this.parseInline(token.tokens));
              continue;
            }
            case 'text': {
              body = token.tokens ? this.parseInline(token.tokens) : token.text;
              while (i + 1 < l && tokens[i + 1].type === 'text') {
                token = tokens[++i];
                body += '\n' + (token.tokens ? this.parseInline(token.tokens) : token.text);
              }
              out += top ? this.renderer.paragraph(body) : body;
              continue;
            }

            default: {
              const errMsg = 'Token with "' + token.type + '" type was not found.';
              if (this.options.silent) {
                console.error(errMsg);
                return;
              } else {
                throw new Error(errMsg);
              }
            }
          }
        }

        return out;
      }

      /**
       * Parse Inline Tokens
       */
      parseInline(tokens, renderer) {
        renderer = renderer || this.renderer;
        let out = '',
          i,
          token,
          ret;

        const l = tokens.length;
        for (i = 0; i < l; i++) {
          token = tokens[i];

          // Run any renderer extensions
          if (this.options.extensions && this.options.extensions.renderers && this.options.extensions.renderers[token.type]) {
            ret = this.options.extensions.renderers[token.type].call({ parser: this }, token);
            if (ret !== false || !['escape', 'html', 'link', 'image', 'strong', 'em', 'codespan', 'br', 'del', 'text'].includes(token.type)) {
              out += ret || '';
              continue;
            }
          }

          switch (token.type) {
            case 'escape': {
              out += renderer.text(token.text);
              break;
            }
            case 'html': {
              out += renderer.html(token.text);
              break;
            }
            case 'link': {
              out += renderer.link(token.href, token.title, this.parseInline(token.tokens, renderer));
              break;
            }
            case 'image': {
              out += renderer.image(token.href, token.title, token.text);
              break;
            }
            case 'strong': {
              out += renderer.strong(this.parseInline(token.tokens, renderer));
              break;
            }
            case 'em': {
              out += renderer.em(this.parseInline(token.tokens, renderer));
              break;
            }
            case 'codespan': {
              out += renderer.codespan(token.text);
              break;
            }
            case 'br': {
              out += renderer.br();
              break;
            }
            case 'del': {
              out += renderer.del(this.parseInline(token.tokens, renderer));
              break;
            }
            case 'text': {
              out += renderer.text(token.text);
              break;
            }
            default: {
              const errMsg = 'Token with "' + token.type + '" type was not found.';
              if (this.options.silent) {
                console.error(errMsg);
                return;
              } else {
                throw new Error(errMsg);
              }
            }
          }
        }
        return out;
      }
    }

    /**
     * Marked
     */
    function marked(src, opt, callback) {
      // throw error in case of non string input
      if (typeof src === 'undefined' || src === null) {
        throw new Error('marked(): input parameter is undefined or null');
      }
      if (typeof src !== 'string') {
        throw new Error('marked(): input parameter is of type '
          + Object.prototype.toString.call(src) + ', string expected');
      }

      if (typeof opt === 'function') {
        callback = opt;
        opt = null;
      }

      opt = merge({}, marked.defaults, opt || {});
      checkSanitizeDeprecation(opt);

      if (callback) {
        const highlight = opt.highlight;
        let tokens;

        try {
          tokens = Lexer.lex(src, opt);
        } catch (e) {
          return callback(e);
        }

        const done = function(err) {
          let out;

          if (!err) {
            try {
              if (opt.walkTokens) {
                marked.walkTokens(tokens, opt.walkTokens);
              }
              out = Parser.parse(tokens, opt);
            } catch (e) {
              err = e;
            }
          }

          opt.highlight = highlight;

          return err
            ? callback(err)
            : callback(null, out);
        };

        if (!highlight || highlight.length < 3) {
          return done();
        }

        delete opt.highlight;

        if (!tokens.length) return done();

        let pending = 0;
        marked.walkTokens(tokens, function(token) {
          if (token.type === 'code') {
            pending++;
            setTimeout(() => {
              highlight(token.text, token.lang, function(err, code) {
                if (err) {
                  return done(err);
                }
                if (code != null && code !== token.text) {
                  token.text = code;
                  token.escaped = true;
                }

                pending--;
                if (pending === 0) {
                  done();
                }
              });
            }, 0);
          }
        });

        if (pending === 0) {
          done();
        }

        return;
      }

      try {
        const tokens = Lexer.lex(src, opt);
        if (opt.walkTokens) {
          marked.walkTokens(tokens, opt.walkTokens);
        }
        return Parser.parse(tokens, opt);
      } catch (e) {
        e.message += '\nPlease report this to https://github.com/markedjs/marked.';
        if (opt.silent) {
          return '<p>An error occurred:</p><pre>'
            + escape(e.message + '', true)
            + '</pre>';
        }
        throw e;
      }
    }

    /**
     * Options
     */

    marked.options =
    marked.setOptions = function(opt) {
      merge(marked.defaults, opt);
      changeDefaults(marked.defaults);
      return marked;
    };

    marked.getDefaults = getDefaults;

    marked.defaults = defaults;

    /**
     * Use Extension
     */

    marked.use = function(...args) {
      const opts = merge({}, ...args);
      const extensions = marked.defaults.extensions || { renderers: {}, childTokens: {} };
      let hasExtensions;

      args.forEach((pack) => {
        // ==-- Parse "addon" extensions --== //
        if (pack.extensions) {
          hasExtensions = true;
          pack.extensions.forEach((ext) => {
            if (!ext.name) {
              throw new Error('extension name required');
            }
            if (ext.renderer) { // Renderer extensions
              const prevRenderer = extensions.renderers ? extensions.renderers[ext.name] : null;
              if (prevRenderer) {
                // Replace extension with func to run new extension but fall back if false
                extensions.renderers[ext.name] = function(...args) {
                  let ret = ext.renderer.apply(this, args);
                  if (ret === false) {
                    ret = prevRenderer.apply(this, args);
                  }
                  return ret;
                };
              } else {
                extensions.renderers[ext.name] = ext.renderer;
              }
            }
            if (ext.tokenizer) { // Tokenizer Extensions
              if (!ext.level || (ext.level !== 'block' && ext.level !== 'inline')) {
                throw new Error("extension level must be 'block' or 'inline'");
              }
              if (extensions[ext.level]) {
                extensions[ext.level].unshift(ext.tokenizer);
              } else {
                extensions[ext.level] = [ext.tokenizer];
              }
              if (ext.start) { // Function to check for start of token
                if (ext.level === 'block') {
                  if (extensions.startBlock) {
                    extensions.startBlock.push(ext.start);
                  } else {
                    extensions.startBlock = [ext.start];
                  }
                } else if (ext.level === 'inline') {
                  if (extensions.startInline) {
                    extensions.startInline.push(ext.start);
                  } else {
                    extensions.startInline = [ext.start];
                  }
                }
              }
            }
            if (ext.childTokens) { // Child tokens to be visited by walkTokens
              extensions.childTokens[ext.name] = ext.childTokens;
            }
          });
        }

        // ==-- Parse "overwrite" extensions --== //
        if (pack.renderer) {
          const renderer = marked.defaults.renderer || new Renderer();
          for (const prop in pack.renderer) {
            const prevRenderer = renderer[prop];
            // Replace renderer with func to run extension, but fall back if false
            renderer[prop] = (...args) => {
              let ret = pack.renderer[prop].apply(renderer, args);
              if (ret === false) {
                ret = prevRenderer.apply(renderer, args);
              }
              return ret;
            };
          }
          opts.renderer = renderer;
        }
        if (pack.tokenizer) {
          const tokenizer = marked.defaults.tokenizer || new Tokenizer();
          for (const prop in pack.tokenizer) {
            const prevTokenizer = tokenizer[prop];
            // Replace tokenizer with func to run extension, but fall back if false
            tokenizer[prop] = (...args) => {
              let ret = pack.tokenizer[prop].apply(tokenizer, args);
              if (ret === false) {
                ret = prevTokenizer.apply(tokenizer, args);
              }
              return ret;
            };
          }
          opts.tokenizer = tokenizer;
        }

        // ==-- Parse WalkTokens extensions --== //
        if (pack.walkTokens) {
          const walkTokens = marked.defaults.walkTokens;
          opts.walkTokens = function(token) {
            pack.walkTokens.call(this, token);
            if (walkTokens) {
              walkTokens.call(this, token);
            }
          };
        }

        if (hasExtensions) {
          opts.extensions = extensions;
        }

        marked.setOptions(opts);
      });
    };

    /**
     * Run callback for every token
     */

    marked.walkTokens = function(tokens, callback) {
      for (const token of tokens) {
        callback.call(marked, token);
        switch (token.type) {
          case 'table': {
            for (const cell of token.header) {
              marked.walkTokens(cell.tokens, callback);
            }
            for (const row of token.rows) {
              for (const cell of row) {
                marked.walkTokens(cell.tokens, callback);
              }
            }
            break;
          }
          case 'list': {
            marked.walkTokens(token.items, callback);
            break;
          }
          default: {
            if (marked.defaults.extensions && marked.defaults.extensions.childTokens && marked.defaults.extensions.childTokens[token.type]) { // Walk any extensions
              marked.defaults.extensions.childTokens[token.type].forEach(function(childTokens) {
                marked.walkTokens(token[childTokens], callback);
              });
            } else if (token.tokens) {
              marked.walkTokens(token.tokens, callback);
            }
          }
        }
      }
    };

    /**
     * Parse Inline
     */
    marked.parseInline = function(src, opt) {
      // throw error in case of non string input
      if (typeof src === 'undefined' || src === null) {
        throw new Error('marked.parseInline(): input parameter is undefined or null');
      }
      if (typeof src !== 'string') {
        throw new Error('marked.parseInline(): input parameter is of type '
          + Object.prototype.toString.call(src) + ', string expected');
      }

      opt = merge({}, marked.defaults, opt || {});
      checkSanitizeDeprecation(opt);

      try {
        const tokens = Lexer.lexInline(src, opt);
        if (opt.walkTokens) {
          marked.walkTokens(tokens, opt.walkTokens);
        }
        return Parser.parseInline(tokens, opt);
      } catch (e) {
        e.message += '\nPlease report this to https://github.com/markedjs/marked.';
        if (opt.silent) {
          return '<p>An error occurred:</p><pre>'
            + escape(e.message + '', true)
            + '</pre>';
        }
        throw e;
      }
    };

    /**
     * Expose
     */
    marked.Parser = Parser;
    marked.parser = Parser.parse;
    marked.Renderer = Renderer;
    marked.TextRenderer = TextRenderer;
    marked.Lexer = Lexer;
    marked.lexer = Lexer.lex;
    marked.Tokenizer = Tokenizer;
    marked.Slugger = Slugger;
    marked.parse = marked;
    Parser.parse;
    Lexer.lex;

    const valueUpdater = (elementID) => {
        let last = Date.now();
        const updateDiv = (moment, content) => {
            const element = document.getElementById(elementID);
            if (element === null)
                return false;
            else if (last === moment) {
                if (content instanceof Node) {
                    element.childNodes.forEach((child) => element.removeChild(child));
                    element.appendChild(content);
                }
                else
                    element.innerHTML = content;
                return true;
            }
            else
                return true;
        };
        const updateDivLoop = (moment, content) => {
            Promise.resolve(updateDiv(moment, content)).then((r) => {
                if (!r)
                    delay(100).then(() => updateDivLoop(moment, content));
            });
        };
        const snapshot = () => {
            const moment = Date.now();
            last = moment;
            return moment;
        };
        return (content) => {
            updateDivLoop(snapshot(), content);
        };
    };
    const inspectorUpdater = (elementID) => {
        let last = Date.now();
        let inspector = undefined;
        const updateDiv = (moment, update) => {
            const element = document.getElementById(elementID);
            if (element === null)
                return false;
            else if (last === moment) {
                if (inspector === undefined)
                    inspector = new Inspector(element);
                update(inspector);
                return true;
            }
            else
                return true;
        };
        const updateDivLoop = (moment, update) => {
            Promise.resolve(updateDiv(moment, update)).then((r) => {
                if (!r)
                    delay(100).then(() => updateDivLoop(moment, update));
            });
        };
        const snapshot = () => {
            const moment = Date.now();
            last = moment;
            return moment;
        };
        return (update) => {
            updateDivLoop(snapshot(), update);
        };
    };
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const renderCode = (hljs, language, body) => hljs === undefined
        ? `<pre class='nbv-unstyled-code-block'><code>${body}</code></pre>`
        : `<pre class='nbv-styled-code-block'><code class="hljs language-${language}">${hljs.highlight(body, { language }).value}</code></pre>`;

    const javascript = {
        name: 'js',
        pattern: /^(js|javascript)\s*/,
        hljs: undefined,
        setup: function (bindings) {
            this.hljs = bindings.get('hljs');
        },
        render: function (module, body, options, render) {
            return render ? renderCode(this.hljs, 'javascript', body) : '';
        }
    };

    let javascriptX_count$1 = 0;
    const javascriptX = {
        name: 'js-x',
        pattern: /^(js|javascript)\s+x\s*/,
        hljs: undefined,
        setup: function (bindings) {
            this.hljs = bindings.get('hljs');
        },
        render: function (module, body, options, render) {
            const pr = parse$1(body);
            if (pr.type === "assignment") {
                if (render) {
                    const id = `js-x-${javascriptX_count$1++}`;
                    const observerID = id + '-observer';
                    const codeID = id + '-code';
                    const renderer = () => renderCode(this.hljs, 'javascript', body);
                    const variableObserver = observer$4(observerID, codeID, pr.name, options.has('hide'), options.has('pin'), renderer);
                    module
                        .variable(variableObserver)
                        .define(pr.name, pr.dependencies, pr.result);
                    return `<div id='${id}' class='nbv-js-x'><div id='${observerID}'></div><div id='${codeID}'></div></div>`;
                }
                else {
                    module
                        .variable()
                        .define(pr.name, pr.dependencies, pr.result);
                    return '';
                }
            }
            else {
                fetch(pr.urn).then((r) => r.text()).then((t) => {
                    const newModule = module._runtime.module();
                    importContent(t, newModule);
                    pr.names.forEach(({ name, alias }) => module.variable().import(name, alias, newModule));
                }).catch(e => console.log(e));
                if (render) {
                    const id = `js-x-${javascriptX_count$1++}`;
                    const observerID = id + '-observer';
                    const codeID = id + '-code';
                    const renderer = () => renderCode(this.hljs, 'javascript', body);
                    const variableObserver = observer$4(observerID, codeID, pr.urn, options.has('hide'), options.has('pin'), renderer);
                    const aliases = pr.names.map(({ name, alias }) => alias);
                    module.variable(variableObserver).define(undefined, aliases, eval(`(${aliases.join(", ")}) => ({${aliases.join(", ")}})`));
                    return `<div id='${id}' class='nbv-js-x'><div id='${observerID}'></div><div id='${codeID}'></div></div>`;
                }
                else
                    return '';
            }
        }
    };
    const observer$4 = (inspectorElementID, codeElementID, name, hide, pin, renderer) => {
        const inspectorControl = hide ? undefined : inspectorUpdater(inspectorElementID);
        const codeControl = valueUpdater(codeElementID);
        return {
            fulfilled: function (value) {
                if (!hide)
                    inspectorControl((inspector) => inspector.fulfilled(value, name));
                codeControl(pin ? renderer() : '');
            },
            pending: function () {
                if (!hide)
                    inspectorControl((inspector) => inspector.pending());
                codeControl(pin ? renderer() : '');
            },
            rejected: function (value) {
                if (!hide)
                    inspectorControl((inspector) => inspector.rejected(value));
                codeControl(renderer());
            }
        };
    };

    let javascriptXAssert_count = 0;
    const javascriptXAssert = {
        name: 'js-x-assert',
        pattern: /^(js|javascript)\s+x\s+assert\s*/,
        hljs: undefined,
        setup: function (bindings) {
            this.hljs = bindings.get('hljs');
        },
        render: function (module, body, options, render) {
            if (render) {
                const pr = parse$1(body);
                if (pr.type === "assignment") {
                    const id = `js-x-assert-${javascriptXAssert_count++}`;
                    const renderer = () => renderCode(this.hljs, 'javascript', body);
                    const variableObserver = observer$3(id, options.get('js-x-assert'), options.has('hide'), options.has('pin'), renderer);
                    module
                        .variable(variableObserver)
                        .define(pr.name, pr.dependencies, pr.result);
                    return `<div id='${id}' class='nbv-js-x-assert'>Nothing to show</div>`;
                }
                else
                    return `<div class='nbv-js-x-assert'>Unable to assert against an import</div>`;
            }
            else
                return '';
        }
    };
    const observer$3 = (elementID, name, hide, pin, renderer) => {
        const update = valueUpdater(elementID);
        return {
            fulfilled: function (value) {
                update(value
                    ? `${hide ? '' : `<div class='nbv-passed'>${name}</div>`}${pin ? renderer() : ``}`
                    : `<div class='nbv-failed'>${name}</div>${renderer()}`);
            },
            pending: function () {
                update(`${hide ? '' : `<div class='nbv-pending'>${name}</div>`}${pin ? renderer() : ``}`);
            },
            rejected: function (value) {
                update(`<div class='nbv-error-title'>${name}</div><div class='nbv-error-body'>${value}</div>${renderer()}`);
            }
        };
    };

    let javascriptX_count = 0;
    const javascriptXInline = {
        name: 'js-inline',
        pattern: /^(js|javascript)\s+inline\s*/,
        hljs: undefined,
        setup: function (bindings) {
            this.hljs = bindings.get('hljs');
        },
        render: function (module, body, options, render) {
            if (render) {
                if (body === null || body === undefined || body === '')
                    return `<span class='nbv-js-x-inline'></span>`;
                else
                    try {
                        const pr = parse$1(body);
                        if (pr.type === "assignment") {
                            const id = `js-x-inline-${javascriptX_count++}`;
                            const variableObserver = observer$2(id);
                            module
                                .variable(variableObserver)
                                .define(pr.name, pr.dependencies, pr.result);
                            return `<span id='${id}' class='nbv-js-x-inline'></span>`;
                        }
                        else
                            return `<div class='nbv-js-x-assert'>Unable to inline an import</div>`;
                    }
                    catch (e) {
                        return `<span class='nbv-js-x-inline'>${e}</span>`;
                    }
            }
            else
                return '';
        }
    };
    const observer$2 = (codeElementID) => {
        const valueControl = valueUpdater(codeElementID);
        return {
            fulfilled: function (value) {
                valueControl(value);
            },
            pending: function () {
                valueControl('');
            },
            rejected: function (value) {
                valueControl(value);
            }
        };
    };

    let javascriptXView_count = 0;
    const javascriptXView = {
        name: 'js-x-view',
        pattern: /^(js|javascript)\s+x\s+view\s*/,
        hljs: undefined,
        setup: function (bindings) {
            this.hljs = bindings.get('hljs');
        },
        render: function (module, body, options, render) {
            const pr = parse$1(body);
            if (pr.type === "assignment")
                if (render) {
                    const viewCellID = `js-x-view-${javascriptXView_count++}`;
                    const viewID = viewCellID + '-view';
                    const codeID = viewCellID + '-code';
                    const renderer = () => renderCode(this.hljs, 'javascript', body);
                    const variableObserver = observer$1(viewID, codeID, pr.name, options.has('pin'), renderer);
                    if (pr.name === undefined)
                        module
                            .variable(variableObserver)
                            .define(pr.name, pr.dependencies, pr.result);
                    else {
                        const viewCellName = `${pr.name}$$`;
                        module
                            .variable(variableObserver)
                            .define(viewCellName, pr.dependencies, pr.result);
                        module
                            .variable()
                            .define(pr.name, [viewCellName], eval(`(${viewCellName}) => Generators.input(${viewCellName})`));
                    }
                    return `<div id='${viewCellID}' class='nbv-js-x-view'><div id='${viewID}'></div><div id='${codeID}'></div></div>`;
                }
                else if (pr.name === undefined)
                    return '';
                else {
                    module
                        .variable()
                        .define(pr.name, [], eval(`() => undefined`));
                    return '';
                }
            else if (render)
                return `<div class='nbv-js-x-assert'>Unable to view an import</div>`;
            else
                return '';
        }
    };
    const observer$1 = (viewElementID, codeElementID, name, pin, renderer) => {
        const viewControl = valueUpdater(viewElementID);
        const codeControl = valueUpdater(codeElementID);
        return {
            fulfilled: function (value) {
                viewControl(value);
                codeControl(pin ? renderer() : '');
            },
            pending: function () {
                viewControl('');
                codeControl(pin ? renderer() : '');
            },
            rejected: function (value) {
                viewControl(value);
                codeControl(renderer());
            }
        };
    };

    const supportedDiagramTypes = new Set([
        "blockdiag",
        "bytefield",
        "seqdiag",
        "actdiag",
        "c4plantuml",
        "nwdiag",
        "packetdiag",
        "rackdiag",
        "erd",
        "excalidraw",
        "graphviz",
        "mermaid",
        "nomnoml",
        "pikchr",
        "plantuml",
        "vega",
        "vegalite",
        "wavedrom",
    ]);
    let krokiX_count = 0;
    const krokiX = {
        name: 'kroki-x',
        pattern: /^kroki\s+x\s*/,
        hljs: undefined,
        setup: function (bindings) {
            this.hljs = bindings.get('hljs');
        },
        render: function (module, body, options, render) {
            if (render) {
                const id = `kroki-x-${krokiX_count++}`;
                const observerID = id + '-value';
                const codeID = id + '-code';
                const pin = options.has("pin");
                const type = options.get(this.name);
                if (supportedDiagramTypes.has(type)) {
                    /* render based on type */
                    const renderer = (body) => renderCode(this.hljs, 'plaintext', body);
                    const variableObserver = observer(observerID, codeID, type, body, options.has('pin'), renderer);
                    const f = functionFromBody(body);
                    module
                        .variable(variableObserver)
                        .define(undefined, f.names, eval(f.body));
                    return `<div id='${id}' class='nbv-kroki-x'><div id='${observerID}'></div><div id='${codeID}'>${pin ? renderer(body) : ''}</div></div>`;
                }
                else {
                    return `<div class='nbv-kroki-x'><p>Kroki Error: Unknown Type: ${type}<p><ul>${[...supportedDiagramTypes].map(i => `<li>${i}</li>`).join("")}</ul></div>`;
                }
            }
            else
                return '';
        }
    };
    const observer = (viewElementID, codeElementID, type, body, pin, renderer) => {
        const viewControl = valueUpdater(viewElementID);
        const codeControl = valueUpdater(codeElementID);
        return {
            fulfilled: function (value) {
                codeControl(pin ? renderer(body) : '');
                try {
                    fetch(`https://kroki.io/${type}/svg`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'text/plain'
                        },
                        body: value
                    })
                        .then(response => response.text())
                        .then(content => {
                        if (typeof content === "string" && content.startsWith("Error")) {
                            viewControl(renderer(content));
                            codeControl(renderer(value));
                        }
                        else
                            viewControl(content);
                    })
                        .catch(error => {
                        viewControl(`Kroki Error: ${error}`);
                        codeControl(renderer(value));
                    });
                }
                catch (e) {
                    viewControl(`Kroki Error: ${e}`);
                    codeControl(renderer(value));
                }
            },
            pending: function () {
                codeControl(pin ? renderer('') : '');
            },
            rejected: function (value) {
                viewControl(value);
                codeControl(renderer(value));
            }
        };
    };
    const functionFromBody = (body) => {
        const facets = parse(body);
        const result = [];
        const names = [];
        const addLiteral = (text) => {
            result.push(text.replace(/\\/g, '\\\\'));
        };
        let lp = 0;
        while (lp + 2 < facets.length) {
            addLiteral(facets[lp]);
            try {
                const code = facets[lp + 1];
                const ast = parseCell(code);
                const referencedNames = ast.references.map((dep) => dep.name);
                const dependencies = uniqueElementsInStringArray(referencedNames);
                const body = code.slice(ast.body.start, ast.body.end);
                dependencies.forEach(s => names.push(s));
                result.push('${');
                result.push(body);
                result.push('}');
            }
            catch (e) {
                result.push('{');
                result.push(e);
                result.push('}');
            }
            lp += 2;
        }
        addLiteral(facets[facets.length - 1]);
        const uniqueNames = uniqueElementsInStringArray(names);
        return { names: uniqueNames, body: `(${uniqueNames.join(", ")}) => \`${result.join('')}\`` };
    };
    const uniqueElementsInStringArray = (inp) => Array.from(new Set(inp));
    const parse = (body) => {
        const result = [];
        let previousLp = 0;
        let lp = 0;
        // 0 - in free text
        // 1 - in ${} block
        let state = 0;
        let curlyNesting = 0;
        while (lp < body.length) {
            // console.log(state, lp, previousLp, curlyNesting, `"${body.slice(previousLp, lp)}" '${body[lp]}' "${body.slice(lp + 1)}"`);
            switch (state) {
                case 0:
                    if (body[lp] === '$' && body[lp + 1] === '{') {
                        result.push(body.slice(previousLp, lp));
                        previousLp = lp;
                        lp += 2;
                        state = 1;
                    }
                    else
                        lp += 1;
                    break;
                case 1:
                    if (body[lp] === '}') {
                        if (curlyNesting > 0) {
                            curlyNesting -= 1;
                            lp += 1;
                        }
                        else {
                            result.push(body.slice(previousLp + 2, lp));
                            lp += 1;
                            previousLp = lp;
                            state = 0;
                        }
                    }
                    else if (body[lp] === '{') {
                        curlyNesting += 1;
                        lp += 1;
                    }
                    else
                        lp += 1;
                    break;
            }
        }
        result.push(body.slice(previousLp));
        return result;
    };

    const bindings = new Map([["hljs", core]]);
    const plugins = [
        javascriptXAssert,
        javascriptXView,
        javascriptXInline,
        javascriptX,
        javascript,
        krokiX
    ];
    plugins.filter((p) => p.setup !== undefined).map((p) => p.setup(bindings));
    const renderer = {
        code(code, infostring, escaped) {
            const findResponse = find(plugins, infostring);
            if (findResponse === undefined) {
                console.log("Unknown infostring:", infostring);
                return renderCode(core, "plaintext", code);
            }
            else {
                const [plugin, is] = findResponse;
                return plugin.render(this.options.nbv_module, code, is, this.options.nbv_render);
            }
        }
    };
    const inlineExpression = {
        name: "expression",
        level: "inline",
        start(src) {
            var _a;
            return (_a = src.match(/\$\{/)) === null || _a === void 0 ? void 0 : _a.index;
        },
        tokenizer(src, tokens) {
            if (src.startsWith("${")) {
                let index = 0;
                // State values:
                //   0 - top-level Javascript
                //   1 - within a back quote (`)
                let state = 0;
                while (index < src.length) {
                    switch (state) {
                        case 0:
                            if (src[index] === '}') {
                                const result = {
                                    type: "expression",
                                    raw: src.slice(0, index + 1),
                                    body: src.slice(2, index)
                                };
                                return result;
                            }
                            else if (src[index] === '`')
                                state = 1;
                            break;
                        case 1:
                            if (src[index] === '`') {
                                state = 0;
                            }
                    }
                    index += 1;
                }
            }
            return undefined;
        },
        renderer(token) {
            return javascriptXInline.render(this.parser.options.nbv_module, token.body, new Map(), this.parser.options.nbv_render);
        }
    };
    marked.use({ renderer, extensions: [inlineExpression] });
    const markedParser = (text, module) => marked.parse(text, { nbv_module: module, nbv_render: true });
    const importParser = (text, module) => marked.parse(text, { nbv_module: module, nbv_render: false });
    function find(plugins, infostring) {
        return findMap(plugins, (plugin) => {
            const match = infostring.match(plugin.pattern);
            if (match == null)
                return undefined;
            else
                return [
                    plugin,
                    parseInfoString(plugin.name + " " + infostring.slice(match[0].length)),
                ];
        });
    }
    function findMap(items, p) {
        let idx = 0;
        while (idx < items.length) {
            const r = p(items[idx]);
            if (r !== undefined)
                return r;
            idx += 1;
        }
        return undefined;
    }

    const importContent = (content, module) => importParser(content, module);
    class FA extends AbstractFile {
        constructor(name) {
            super(name, name);
        }
        url() {
            return this.name;
        }
    }
    const loadSource = (url) => new FA(url);

    /* src/XMarkdown.svelte generated by Svelte v3.44.3 */

    const { Object: Object_1 } = globals;

    // (1:0) <script lang="ts">import hljs from "highlight.js/lib/core"; import javascript_highlighter from "highlight.js/lib/languages/javascript"; import plaintext_highlighter from "highlight.js/lib/languages/plaintext"; import "highlight.js/styles/base16/papercolor-light.css"; import { Library, Runtime }
    function create_catch_block(ctx) {
    	const block = { c: noop$1, m: noop$1, p: noop$1, d: noop$1 };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script lang=\\\"ts\\\">import hljs from \\\"highlight.js/lib/core\\\"; import javascript_highlighter from \\\"highlight.js/lib/languages/javascript\\\"; import plaintext_highlighter from \\\"highlight.js/lib/languages/plaintext\\\"; import \\\"highlight.js/styles/base16/papercolor-light.css\\\"; import { Library, Runtime }",
    		ctx
    	});

    	return block;
    }

    // (29:57)      {@html markedParser(text, module)}
    function create_then_block(ctx) {
    	let html_tag;
    	let raw_value = markedParser(/*text*/ ctx[5], /*module*/ ctx[1]) + "";
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_tag = new HtmlTag();
    			html_anchor = empty$2();
    			html_tag.a = html_anchor;
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(raw_value, target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*sourceURL, module*/ 3 && raw_value !== (raw_value = markedParser(/*text*/ ctx[5], /*module*/ ctx[1]) + "")) html_tag.p(raw_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(29:57)      {@html markedParser(text, module)}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script lang="ts">import hljs from "highlight.js/lib/core"; import javascript_highlighter from "highlight.js/lib/languages/javascript"; import plaintext_highlighter from "highlight.js/lib/languages/plaintext"; import "highlight.js/styles/base16/papercolor-light.css"; import { Library, Runtime }
    function create_pending_block(ctx) {
    	const block = { c: noop$1, m: noop$1, p: noop$1, d: noop$1 };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(1:0) <script lang=\\\"ts\\\">import hljs from \\\"highlight.js/lib/core\\\"; import javascript_highlighter from \\\"highlight.js/lib/languages/javascript\\\"; import plaintext_highlighter from \\\"highlight.js/lib/languages/plaintext\\\"; import \\\"highlight.js/styles/base16/papercolor-light.css\\\"; import { Library, Runtime }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let await_block_anchor;
    	let promise;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 5
    	};

    	handle_promise(promise = fetch(/*sourceURL*/ ctx[0]).then(func), info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty$2();
    			info.block.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*sourceURL*/ 1 && promise !== (promise = fetch(/*sourceURL*/ ctx[0]).then(func)) && handle_promise(promise, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const func = r => r.text();

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('XMarkdown', slots, []);
    	core.registerLanguage("javascript", javascript$1);
    	core.registerLanguage("js", javascript$1);
    	core.registerLanguage("plaintext", plaintext);
    	const library = Object.assign(new Library(), { load: () => url => loadSource(url) });
    	let runtime = undefined;
    	let module = undefined;
    	let { sourceURL } = $$props;

    	function sourceURLChange(newValue) {
    		if (runtime !== undefined) {
    			runtime.dispose();
    		}

    		runtime = new Runtime(library);
    		$$invalidate(1, module = runtime.module());
    	}

    	const writable_props = ['sourceURL'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<XMarkdown> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('sourceURL' in $$props) $$invalidate(0, sourceURL = $$props.sourceURL);
    	};

    	$$self.$capture_state = () => ({
    		hljs: core,
    		javascript_highlighter: javascript$1,
    		plaintext_highlighter: plaintext,
    		Library,
    		Runtime,
    		loadSource,
    		markedParser,
    		library,
    		runtime,
    		module,
    		sourceURL,
    		sourceURLChange
    	});

    	$$self.$inject_state = $$props => {
    		if ('runtime' in $$props) runtime = $$props.runtime;
    		if ('module' in $$props) $$invalidate(1, module = $$props.module);
    		if ('sourceURL' in $$props) $$invalidate(0, sourceURL = $$props.sourceURL);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*sourceURL*/ 1) {
    			{
    				sourceURLChange();
    			}
    		}
    	};

    	return [sourceURL, module];
    }

    class XMarkdown extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { sourceURL: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "XMarkdown",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*sourceURL*/ ctx[0] === undefined && !('sourceURL' in props)) {
    			console.warn("<XMarkdown> was created without expected prop 'sourceURL'");
    		}
    	}

    	get sourceURL() {
    		throw new Error("<XMarkdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sourceURL(value) {
    		throw new Error("<XMarkdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.44.3 */
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (17:1) {#each examples as example}
    function create_each_block(ctx) {
    	let option;
    	let t0_value = /*example*/ ctx[3].text + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			option = element$2("option");
    			t0 = text$3(t0_value);
    			t1 = space();
    			option.__value = /*example*/ ctx[3].id;
    			option.value = option.__value;
    			add_location(option, file, 17, 2, 833);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(17:1) {#each examples as example}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let select;
    	let t0;
    	let br;
    	let t1;
    	let xmarkdown;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*examples*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	xmarkdown = new XMarkdown({
    			props: {
    				sourceURL: /*examples*/ ctx[1][/*selectedID*/ ctx[0]].resource
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			select = element$2("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			br = element$2("br");
    			t1 = space();
    			create_component(xmarkdown.$$.fragment);
    			attr_dev(select, "id", "select");
    			if (/*selectedID*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[2].call(select));
    			add_location(select, file, 15, 0, 757);
    			add_location(br, file, 23, 0, 911);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*selectedID*/ ctx[0]);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, br, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(xmarkdown, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*examples*/ 2) {
    				each_value = /*examples*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*selectedID, examples*/ 3) {
    				select_option(select, /*selectedID*/ ctx[0]);
    			}

    			const xmarkdown_changes = {};
    			if (dirty & /*selectedID*/ 1) xmarkdown_changes.sourceURL = /*examples*/ ctx[1][/*selectedID*/ ctx[0]].resource;
    			xmarkdown.$set(xmarkdown_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(xmarkdown.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(xmarkdown.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t1);
    			destroy_component(xmarkdown, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	let examples = [
    		{
    			id: 0,
    			text: "Simple Reactive Components",
    			resource: "simple.md"
    		},
    		{
    			id: 1,
    			text: "String Calculater Kata",
    			resource: "sck.md"
    		},
    		{
    			id: 2,
    			text: "D3 Scatterplot",
    			resource: "d3-scatterplot.md"
    		},
    		{
    			id: 3,
    			text: "Diagrams",
    			resource: "kroki-diagrams.md"
    		},
    		{
    			id: 4,
    			text: "Blocks in blocks",
    			resource: "blocks-in-blocks.md"
    		},
    		{
    			id: 5,
    			text: "Playing with SVG",
    			resource: "playing-with-svg.md"
    		},
    		{
    			id: 6,
    			text: "Basic notebook for testing",
    			resource: "basic.md"
    		},
    		{
    			id: 7,
    			text: "Nested import",
    			resource: "nested-import.md"
    		},
    		{
    			id: 8,
    			text: "Platform Components",
    			resource: "platform-components.md"
    		}
    	];

    	let selectedID = 8;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		selectedID = select_value(this);
    		$$invalidate(0, selectedID);
    		$$invalidate(1, examples);
    	}

    	$$self.$capture_state = () => ({ XMarkdown, examples, selectedID });

    	$$self.$inject_state = $$props => {
    		if ('examples' in $$props) $$invalidate(1, examples = $$props.examples);
    		if ('selectedID' in $$props) $$invalidate(0, selectedID = $$props.selectedID);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selectedID, examples, select_change_handler];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
