import { parse } from '../Parser'

describe('Parser', () => {
  test('Expression', () => {
    const ast: any = parse('1 + 2')

    expect(ast.dependencies).toEqual([])
    expect(ast.name).toBeUndefined()
    expect(ast.type).toEqual('assignment')
  })
})
