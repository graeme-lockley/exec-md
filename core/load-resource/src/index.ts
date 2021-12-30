import { AbstractFile } from '@observablehq/stdlib'

export const load = async (name: string) => {
  const fetchResponse = await fetch(name)

  return await fetchResponse.text()
}

class FA extends AbstractFile {
  name: string

  constructor (name: string) {
    super(name, name)
  }

  url () {
    return this.name
  }
}

export const loadSource = (url: string): FA =>
  new FA(url)
