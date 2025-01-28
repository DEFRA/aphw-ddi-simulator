const request = require('supertest')
const {
  generateReturnCodePropertyValidators
} = require('../../../../app/types/return-code')
const { createTestValidationApp } = require('./validator-helper')

describe('return code validator', () => {
  const app = createTestValidationApp(generateReturnCodePropertyValidators())

  test('returns 200 for valid return code', async () => {
    const body = { code: 'PLACEHOLDER' }
    const response = await request(app).post('/test-validation').send(body)
    expect(response.status).toEqual(200)
    expect(response.body).toEqual({})
  })

  test('returns 400 for unknown property', async () => {
    const body = {
      code: 'PLACEHOLDER',
      someUnknownField: 'some-value'
    }
    const response = await request(app).post('/test-validation').send(body)
    expect(response.status).toEqual(400)
    expect(response.body?.errors?._unknown_fields?.msg).toEqual(
      'Unknown field(s)'
    )
  })

  test('returns 400 for invalid code', async () => {
    const body = { code: 5 }
    const response = await request(app).post('/test-validation').send(body)
    expect(response.status).toEqual(400)
    expect(response.body.errors.code.msg).toEqual('Invalid value')
  })

  test('returns 400 for missing code', async () => {
    const body = {}
    const response = await request(app).post('/test-validation').send(body)
    expect(response.status).toEqual(400)
    expect(response.body.errors.code.msg).toEqual('Invalid value')
  })
})
