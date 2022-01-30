import { setUp, tearDown, testAssertionValues, value } from '../Harness'

beforeAll(() => setUp('./public/notebooks/simple.md'))

afterAll(() => tearDown())

describe('Simple Notebook', () => {
    test('value', async () => {
        const vs = await value('value')
        const vsSquared = await value('valuesSquared')

        expect(vs).toEqual([2, 4, 6, 8, 10])
        expect(vsSquared).toEqual([4, 16, 36, 64, 100])
    })

    test('athletes', async () => {
        const athletes = await value('athletes')

        expect(athletes[0]).toEqual({
            'bronze': 0,
            'date_of_birth': new Date('1969-10-17T00:00:00.000Z'),
            'gold': 0,
            'height': 1.72,
            'id': 736041664,
            'info': null,
            'name': 'A Jesus Garcia',
            'nationality': 'ESP',
            'sex': 'male',
            'silver': 0,
            'sport': 'athletics',
            'weight': 64
        })

        expect(athletes.length).toEqual(11538)
    })

    test('arbList', async () => {
        const arbList = await value('arbList')

        expect(arbList.length).toEqual(20)
    })

    test('exponent', async () => {
        const exponent = await value('exponent')

        expect(exponent).toEqual(undefined)
    })

    test('Notebook assertions', async () => {
        const assertions = await testAssertionValues()

        expect(assertions.length).toEqual(2)

        expect(assertions[0].name).toEqual('Given a negative argument then all hell breaks loose')
        expect(assertions[0].reason).toEqual('Exception thrown')

        expect(assertions[1].name).toEqual('Given a silly mistake this test will fail')
        expect(assertions[1].reason).toEqual('Assertion failed')
    })

    // As this notebook contains illustrative errors the pipeline would fail.  However the following
    // code would normally be used.
    // Note:
    //   assertAssertions would need to be imported from Harness.js

    // test('Assert notebook assertions', async () => {
    //     assertAssertions()
    // })
})
