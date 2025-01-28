const { createApp } = require('../../../../app/app')
const request = require('supertest')

describe('/.well-known/jwks.json endpoint test', () => {
  test('returns an object containing EC and RSA keys', async () => {
    const app = createApp()
    const response = await request(app).get('/.well-known/jwks.json')

    expect(response.status).toEqual(200)
    expect(response.body).toHaveProperty('keys')

    const keys = response.body.keys
    expect(keys).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kty: 'EC' }),
        expect.objectContaining({ kty: 'RSA' })
      ])
    )
  })
})
