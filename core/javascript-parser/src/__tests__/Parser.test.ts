import { parse, type AssignmentStatement, type ExceptionStatement, type ImportStatement } from '../index'

describe('Parser', () => {
  test('Simple expression', () => {
    const ast = parse('1 + 2') as AssignmentStatement

    expect(ast.type).toEqual('assignment')
    expect(ast.name).toBeUndefined()
    expect(ast.dependencies).toEqual([])
    expect(ast.body).toEqual('1 + 2')
  })

  describe('Assignment', () => {
    test('Simple', () => {
      const ast = parse('x = y + 2') as AssignmentStatement

      expect(ast.type).toEqual('assignment')
      expect(ast.name).toEqual('x')
      expect(ast.dependencies).toEqual(['y'])
      expect(ast.body).toEqual('y + 2')
    })

    test('Block', () => {
      const ast = parse('x = { const z = y + 2; return z + 1; }') as AssignmentStatement

      expect(ast.type).toEqual('assignment')
      expect(ast.name).toEqual('x')
      expect(ast.dependencies).toEqual(['y'])
      expect(ast.body).toEqual('{ const z = y + 2; return z + 1; }')
    })
  })

  test('Import', () => {
    const ast = parse('import { a as a1, b } from \'https://hello.world/bob.md\'') as ImportStatement

    expect(ast.type).toEqual('import')
    expect(ast.names).toEqual([
      { alias: 'a1', name: 'a' },
      { alias: 'b', name: 'b' }
    ])
    expect(ast.urn).toEqual('https://hello.world/bob.md')
  })

  test('Error', () => {
    const ast = parse('import { a as a1 b } from \'https://hello.world/bob.md\'') as ExceptionStatement

    expect(ast.type).toEqual('exception')
    expect(ast.exception).toBeTruthy()
  })
})
