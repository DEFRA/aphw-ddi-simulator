const { createTestValidationApp } = require('./validator-helper')
const request = require('supertest')
const {
  generateResponseConfigurationPropertyValidators
} = require('../../../../app/types/response-configuration')

describe('response configuration validator', () => {
  const app = createTestValidationApp(
    generateResponseConfigurationPropertyValidators()
  )

  test('returns 200 for valid response configuration', async () => {
    const body = {
      sub: 'example subject',
      email: 'test@example.com',
      emailVerified: true,
      phoneNumber: '07123456789',
      phoneNumberVerified: false,
      maxLoCAchieved: 'P2',
      coreIdentityVerifiableCredentials: { exampleField: 'example value' },
      passportDetails: [{ exampleField: 'example value' }],
      drivingPermitDetails: [{ exampleField: 'example value' }],
      socialSecurityRecordDetails: [{ exampleField: 'example value' }],
      postalAddressDetails: [{ exampleField: 'example value' }],
      returnCodes: [{ code: 'example_code' }]
    }
    const response = await request(app).post('/test-validation').send(body)
    expect(response.status).toEqual(200)
    expect(response.body).toEqual({})
  })

  test('returns 400 for unknown property', async () => {
    const body = { someUnknownProperty: 'some-value' }
    const response = await request(app).post('/test-validation').send(body)
    expect(response.status).toEqual(400)
    expect(response.body?.errors?._unknown_fields?.msg).toEqual(
      'Unknown field(s)'
    )
  })

  test('returns 400 for invalid sub', async () => {
    const body = { sub: false }
    const response = await request(app).post('/test-validation').send(body)
    expect(response.status).toEqual(400)
    expect(response.body.errors.sub.msg).toEqual('Invalid value')
  })

  test('returns 400 for invalid email', async () => {
    const body = { email: false }
    const response = await request(app).post('/test-validation').send(body)
    expect(response.status).toEqual(400)
    expect(response.body.errors.email.msg).toEqual('Invalid value')
  })

  test('returns 400 for invalid emailVerified', async () => {
    const body = { emailVerified: 'yes' }
    const response = await request(app).post('/test-validation').send(body)
    expect(response.status).toEqual(400)
    expect(response.body.errors.emailVerified.msg).toEqual('Invalid value')
  })

  test('returns 400 for invalid phoneNumber', async () => {
    const body = { phoneNumber: 712456789 }
    const response = await request(app).post('/test-validation').send(body)
    expect(response.status).toEqual(400)
    expect(response.body.errors.phoneNumber.msg).toEqual('Invalid value')
  })

  test('returns 400 for invalid phoneNumberVerified', async () => {
    const body = { phoneNumberVerified: 'no' }
    const response = await request(app).post('/test-validation').send(body)
    expect(response.status).toEqual(400)
    expect(response.body.errors.phoneNumberVerified.msg).toEqual(
      'Invalid value'
    )
  })

  test('returns 400 for invalid maxLoCAchieved', async () => {
    const body = { maxLoCAchieved: 'Cl.P0' }
    const response = await request(app).post('/test-validation').send(body)
    expect(response.status).toEqual(400)
    expect(response.body.errors.maxLoCAchieved.msg).toEqual('Invalid value')
  })

  test('returns 400 for invalid coreIdentityVerifiableCredentials', async () => {
    const body = { coreIdentityVerifiableCredentials: [] }
    const response = await request(app).post('/test-validation').send(body)
    expect(response.status).toEqual(400)
    expect(response.body.errors.coreIdentityVerifiableCredentials.msg).toEqual(
      'Invalid value'
    )
  })

  test('returns 400 for invalid passportDetails', async () => {
    const body = { passportDetails: {} }
    const response = await request(app).post('/test-validation').send(body)
    expect(response.status).toEqual(400)
    expect(response.body.errors.passportDetails.msg).toEqual('Invalid value')
  })

  test('returns 400 for invalid drivingPermitDetails', async () => {
    const body = { drivingPermitDetails: {} }
    const response = await request(app).post('/test-validation').send(body)
    expect(response.status).toEqual(400)
    expect(response.body.errors.drivingPermitDetails.msg).toEqual(
      'Invalid value'
    )
  })

  test('returns 400 for invalid socialSecurityRecordDetails', async () => {
    const body = { socialSecurityRecordDetails: {} }
    const response = await request(app).post('/test-validation').send(body)
    expect(response.status).toEqual(400)
    expect(response.body.errors.socialSecurityRecordDetails.msg).toEqual(
      'Invalid value'
    )
  })

  test('returns 400 for invalid postalAddressDetails', async () => {
    const body = { postalAddressDetails: {} }
    const response = await request(app).post('/test-validation').send(body)
    expect(response.status).toEqual(400)
    expect(response.body.errors.postalAddressDetails.msg).toEqual(
      'Invalid value'
    )
  })

  test('returns 400 for invalid returnCodes', async () => {
    const body = { returnCodes: {} }
    const response = await request(app).post('/test-validation').send(body)
    expect(response.status).toEqual(400)
    expect(response.body.errors.returnCodes.msg).toEqual('Invalid value')
  })
})
