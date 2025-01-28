const { dedupeQueryParams } = require('../../../../app/middleware/dedupe-query-params')

describe('dedupeQueryParams tests', () => {
  test('returns string and undefined query params', () => {
    const mockReq = {
      query: {
        key: 'val',
        key1: 'val1',
        key2: undefined
      },
      path: '/endpoint'
    }
    const mockRes = {}
    const mockNext = jest.fn()

    dedupeQueryParams(mockReq, mockRes, mockNext)
    expect(mockReq.query).toStrictEqual({
      key: 'val',
      key1: 'val1',
      key2: undefined
    })
    expect(mockNext).toHaveBeenCalled()
  })

  test('returns the last instance of an array of query params', () => {
    const mockReq = {
      query: {
        key: 'val',
        key1: ['val1', 'val2', 'val3'],
        key2: undefined
      },
      path: '/endpoint'
    }
    const mockRes = {}
    const mockNext = jest.fn()

    dedupeQueryParams(mockReq, mockRes, mockNext)
    expect(mockReq.query).toStrictEqual({
      key: 'val',
      key1: 'val3',
      key2: undefined
    })
    expect(mockNext).toHaveBeenCalled()
  })

  test('ignores any object query params', () => {
    const mockReq = {
      query: {
        key: 'val',
        key1: ['val1', 'val2', 'val3'],
        key2: {
          someOtherKey: 'val4'
        }
      },
      path: '/endpoint'
    }
    const mockRes = {}
    const mockNext = jest.fn()

    dedupeQueryParams(mockReq, mockRes, mockNext)
    expect(mockReq.query).toStrictEqual({
      key: 'val',
      key1: 'val3'
    })
    expect(mockNext).toHaveBeenCalled()
  })

  test('handles a mixture of cases', () => {
    const mockReq = {
      query: {
        key: 'val',
        key1: ['val1', 'val2', 'val3'],
        key2: undefined,
        key3: {
          someOtherKey: 'val4'
        }
      },
      path: '/endpoint'
    }
    const mockRes = {}
    const mockNext = jest.fn()

    dedupeQueryParams(mockReq, mockRes, mockNext)
    expect(mockReq.query).toStrictEqual({
      key: 'val',
      key1: 'val3',
      key2: undefined
    })
    expect(mockNext).toHaveBeenCalled()
  })
})
