const { createApp } = require('../../../../app/app')
const request = require('supertest')

describe('Integration: Healthcheck', () => {
  test('Healthcheck endpoint returns 200', async () => {
    const app = createApp()
    const response = await request(app).get('/')
    expect(response.status).toEqual(200)
    expect(response.text).toEqual('Express + TypeScript Server')
  })
})
