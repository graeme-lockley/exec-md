# execmd

A monoreport containing a number of projects supporting in-browser markdown execution.

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
