const { createApp } = require('../../../../app/app')
const request = require('supertest')

test('healthy test', async () => {
  const app = createApp()

  const response = await request(app).get('/healthy')

  expect(response.status).toEqual(200)
})
