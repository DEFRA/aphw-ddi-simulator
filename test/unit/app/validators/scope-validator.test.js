const { Config } = require('../../../../app/config')
const { areScopesValid } = require('../../../../app/validators/scope-validator')

describe('scope validator tests', () => {
  const config = Config.getInstance()
  const scopesSpy = jest.spyOn(config, 'getScopes')

  test('returns false for any invalid scopes', () => {
    scopesSpy.mockReturnValue(['openid', 'phone'])

    expect(areScopesValid(['openid', 'nickname'], config)).toBe(false)
  })

  test('returns false for any unsupported scopes', () => {
    scopesSpy.mockReturnValue(['openid', 'phone'])

    expect(areScopesValid(['openid', 'email'], config)).toBe(false)
  })

  test('returns true if the scopes are valid and known', () => {
    scopesSpy.mockReturnValue(['openid', 'email'])

    expect(areScopesValid(['openid', 'email'], config)).toBe(true)
  })
})
