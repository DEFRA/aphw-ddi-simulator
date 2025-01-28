const { createApp } = require('../../../../app/app')
const request = require('supertest')

test('GET /healthz route returns 200', async () => {
  const app = createApp()

  const response = await request(app).get('/healthz')

  expect(response.status).toEqual(200)
})
