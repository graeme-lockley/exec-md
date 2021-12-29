import { loadSource } from '../index'

test('bob', () => {
  const url = 'https://graeme-lockley.github.io/notebook-viewer-2/penguins.csv'
  const content = loadSource(url)

  expect(content.name).toEqual(url)
})
