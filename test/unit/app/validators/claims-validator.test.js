const { Config } = require('../../../../app/config')
const { areClaimsValid } = require('../../../../app/validators/claims-validator')

describe('claims validation tests', () => {
  const config = Config.getInstance()

  const claimsSpy = jest.spyOn(config, 'getClaims')

  test('returns true if the claims are empty', () => {
    claimsSpy.mockReturnValue([
      'https://vocab.account.gov.uk/v1/coreIdentityJWT'
    ])

    expect(areClaimsValid([], config)).toBe(true)
  })

  test('returns false for unknown claims', () => {
    claimsSpy.mockReturnValue([
      'https://vocab.account.gov.uk/v1/coreIdentityJWT'
    ])

    expect(
      areClaimsValid(['https://vocab.account.gov.uk/v1/unknownClaim'], config)
    ).toBe(false)
  })

  test('returns false if the claims are not supported by the client', () => {
    claimsSpy.mockReturnValue([
      'https://vocab.account.gov.uk/v1/coreIdentityJWT'
    ])

    expect(
      areClaimsValid(['https://vocab.account.gov.uk/v1/returnCode'], config)
    ).toBe(false)
  })

  test('returns true if all the claims are known and supported by the client', () => {
    claimsSpy.mockReturnValue([
      'https://vocab.account.gov.uk/v1/coreIdentityJWT',
      'https://vocab.account.gov.uk/v1/returnCode'
    ])

    expect(
      areClaimsValid(
        [
          'https://vocab.account.gov.uk/v1/coreIdentityJWT',
          'https://vocab.account.gov.uk/v1/returnCode'
        ],
        config
      )
    ).toBe(true)
  })
})
