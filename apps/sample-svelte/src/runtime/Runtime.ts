import { Runtime } from "@observablehq/runtime";

import { defaultLibrary } from "./Library";
import type { Observer } from "./Observer"

export interface IRuntime {
  dispose(): void
  module(): IModule
}

export interface IModule {
  _runtime: IRuntime
  _scope: Map<string, Promise<any>>

  variable(observer?: Observer): IVariable
  value(name: string): Promise<any>
}

export interface IVariable {
  define(name: string | undefined, dependencies: Array<string>, body: any): void
  import(name: string, alias: string | null, fromModule: IModule): void
  import(name: string, fromModule: IModule): void
}

export const createRuntime = (library?: any): IRuntime => {
  library = library || defaultLibrary()

  return new Runtime(library) as IRuntime
}

export const defineVariable = (module: IModule, observer: Observer | undefined, name: string | undefined, dependencies: Array<string>, body: string): void => {
  module
    .variable(observer)
    .define(name, dependencies, Eval(`(${dependencies.join(", ")}) => ${body}`));
}

const Eval = eval;