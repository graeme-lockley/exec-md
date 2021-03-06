import type { IModule } from '@exec-md/runtime'

export type Bindings = Map<string, any>;
export type Options = Map<string, string>;

export interface Plugin {
    name: string;
    pattern: RegExp,
    setup?: (bindings: Bindings) => void,
    render: (module: IModule, body: string, options: Options, render: boolean, modules: Array<Promise<IModule>>) => string | Node
}

export type Plugins = Array<Plugin>;

export const setup = (plugins: Plugins, bindings: Bindings): void => {
  plugins.filter((p) => p.setup !== undefined).map((p) => p.setup(bindings))
}
