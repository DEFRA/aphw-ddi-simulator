const { createApp } = require('../../../../app/app')
const request = require('supertest')

describe('Server test', () => {
  test('createServer returns server', async () => {
    const app = createApp()

    const response = await request(app).get('/healthy')

    expect(response.status).toEqual(200)
  })
})
