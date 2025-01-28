const { createApp } = require('../../../../app/app')
const request = require('supertest')

describe('/trustmark endpoint test', () => {
  test('returns the expected object', async () => {
    const app = createApp()
    const response = await request(app).get('/trustmark')

    expect(response.status).toEqual(200)
    expect(response.body).toEqual({
      idp: 'http://localhost:3000/',
      trustmark_provider: 'http://localhost:3000/',
      C: ['Cl', 'Cl.Cm'],
      P: ['P0', 'P1', 'P2']
    })
  })
})
