const express = require('express')
const {
  body,
  checkExact,
  validationResult
} = require('express-validator')

const createTestValidationApp = (validators) => {
  const app = express()

  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))

  app.post(
    '/test-validation',
    ...validators,
    checkExact(),
    body().isObject(),
    (req, res) => {
      const validationFailures = validationResult(req)
      if (!validationFailures.isEmpty()) {
        res.status(400).send({ errors: validationFailures.mapped() })
        return
      }

      res.status(200).send()
    }
  )

  return app
}

module.exports = {
  createTestValidationApp
}
