const request = require('supertest')
const { createTestValidationApp } = require('./validator-helper')
const {
  generateConfigRequestPropertyValidators
} = require('../../../../app/types/config-request')

describe('config request validator', () => {
  const app = createTestValidationApp(
    generateConfigRequestPropertyValidators()
  )

  test('returns 200 for valid config request', async () => {
    const body = {
      clientConfiguration: {},
      responseConfiguration: {},
      errorConfiguration: {}
    }
    const response = await request(app).post('/test-validation').send(body)
    expect(response.status).toEqual(200)
    expect(response.body).toEqual({})
  })

  test('returns 400 for unknown property', async () => {
    const body = {
      someUnknownField: 'some-value'
    }
    const response = await request(app).post('/test-validation').send(body)
    expect(response.status).toEqual(400)
    expect(response.body?.errors?._unknown_fields?.msg).toEqual(
      'Unknown field(s)'
    )
  })

  test('returns 400 for invalid clientConfiguration', async () => {
    const body = { clientConfiguration: [] }
    const response = await request(app).post('/test-validation').send(body)
    expect(response.status).toEqual(400)
    expect(response.body.errors.clientConfiguration.msg).toEqual(
      'Invalid value'
    )
  })

  test('returns 400 for invalid responseConfiguration', async () => {
    const body = { responseConfiguration: 0 }
    const response = await request(app).post('/test-validation').send(body)
    expect(response.status).toEqual(400)
    expect(response.body.errors.responseConfiguration.msg).toEqual(
      'Invalid value'
    )
  })

  test('returns 400 for invalid errorConfiguration', async () => {
    const body = { errorConfiguration: '' }
    const response = await request(app).post('/test-validation').send(body)
    expect(response.status).toEqual(400)
    expect(response.body.errors.errorConfiguration.msg).toEqual(
      'Invalid value'
    )
  })
})
