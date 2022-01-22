# exec-md

A monorepo containing a number of projects supporting in-browser markdown execution of code placed in fenced code blocks.

## Building

When running in a VS Code container the build process is straightforward as [node](https://nodejs.org/en/), [pnpm](https://pnpm.io) and [rush](https://rushjs.io) are pre-installed for you.

```
rush update
```

to download and install all dependencies and then

```
rush build
```

to run eslint, all unit tests and bundle each project

## Credit

This repo makes extensive use of [Observable's](https://github.com/observablehq) libraries and it would be remiss of me not to mention the excellent work that the Observable team are doing.
