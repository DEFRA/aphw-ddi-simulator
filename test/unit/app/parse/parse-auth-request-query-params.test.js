const areClaimsValidMock = jest.fn()
const areScopesValidMock = jest.fn()
const vtrValidatorMock = jest.fn()

jest.mock('../../../../app/validators/claims-validator', () => ({
  areClaimsValid: areClaimsValidMock
}))

jest.mock('../../../../app/validators/scope-validator', () => ({
  areScopesValid: areScopesValidMock
}))

jest.mock('../../../../app/validators/vtr-validator', () => ({
  vtrValidator: vtrValidatorMock
}))

const { parseAuthQueryParams } = require('../../../../app/parse/parse-auth-request-query-params')
const { ParseAuthRequestError } = require('../../../../app/errors/parse-auth-request-error')
const { Config } = require('../../../../app/config')
const { BadRequestError } = require('../../../../app/errors/bad-request-error')
const { randomUUID } = require('crypto')
const { AuthoriseRequestError } = require('../../../../app/errors/authorise-request-error')
const { MissingParameterError } = require('../../../../app/errors/missing-parameter-error')

const clientId = '284e6ac9818525b254053711c9251fa7'
const redirectUri = 'https://example.com/authenication-callback'
const clientLoCs = ['P0', 'P2']
const claims = [
  'https://vocab.account.gov.uk/v1/passport'
]
const state = '6066cf5d190e2f1d5eeabaf089c01529ec47f7e3833d574f'
const mockVtr = [
  {
    levelOfConfidence: null,
    credentialTrust: 'Cl.Cm'
  }
]

describe('parseAuthRequestQueryParams tests', () => {
  const config = Config.getInstance()

  jest.spyOn(config, 'getClientId').mockReturnValue(clientId)
  jest.spyOn(config, 'getRedirectUrls').mockReturnValue([redirectUri])
  jest.spyOn(config, 'getClientLoCs').mockReturnValue(clientLoCs)
  jest.spyOn(config, 'getClaims').mockReturnValue(claims)

  test('throws a missingParameter error for an empty request', () => {
    expect(() => parseAuthQueryParams({}, config)).toThrow(
      new MissingParameterError(
        'Invalid Request: No Query parameters present in request'
      )
    )
  })

  test('throws a parse request error for no client_id', () => {
    expect(() =>
      parseAuthQueryParams(
        {
          response_type: 'code',
          redirect_uri: redirectUri,
          state,
          nonce: '8b5376320b7d9307627a5ad9512da4f84555d96fe9517365',
          scope: 'openid email phone',
          claims:
            '{"userinfo":{"https:\\/\\/vocab.account.gov.uk\\/v1\\/passport":{"essential":true},"https:\\/\\/vocab.account.gov.uk\\/v1\\/coreIdentityJWT":{"essential":true},"https:\\/\\/vocab.account.gov.uk\\/v1\\/address":{"essential":true}}}',
          vtr: '["Cl.Cm"]',
          prompt: 'none'
        },
        config
      )
    ).toThrow(
      new MissingParameterError('Invalid Request: Missing client_id parameter')
    )
  })

  test('throws a parse request error for no response_type', () => {
    expect(() =>
      parseAuthQueryParams(
        {
          redirect_uri: redirectUri,
          client_id: clientId,
          state,
          nonce: '8b5376320b7d9307627a5ad9512da4f84555d96fe9517365',
          scope: 'openid email phone',
          claims:
            '{"userinfo":{"https:\\/\\/vocab.account.gov.uk\\/v1\\/passport":{"essential":true},"https:\\/\\/vocab.account.gov.uk\\/v1\\/coreIdentityJWT":{"essential":true},"https:\\/\\/vocab.account.gov.uk\\/v1\\/address":{"essential":true}}}',
          vtr: '["Cl.Cm"]',
          prompt: 'none'
        },
        config
      )
    ).toThrow(
      new MissingParameterError(
        'Invalid Request: Missing response_type parameter'
      )
    )
  })

  test('throws a parse request error if the prompt value is invalid', () => {
    expect(() =>
      parseAuthQueryParams(
        {
          response_type: 'code',
          client_id: clientId,
          redirect_uri: redirectUri,
          state,
          nonce: '8b5376320b7d9307627a5ad9512da4f84555d96fe9517365',
          scope: 'openid email phone',
          claims:
            '{"userinfo":{"https:\\/\\/vocab.account.gov.uk\\/v1\\/passport":{"essential":true},"https:\\/\\/vocab.account.gov.uk\\/v1\\/coreIdentityJWT":{"essential":true},"https:\\/\\/vocab.account.gov.uk\\/v1\\/address":{"essential":true}}}',
          vtr: '["Cl.Cm"]',
          prompt: 'no-an-oidc-prompt'
        },
        config
      )
    ).toThrow(
      new ParseAuthRequestError(
        'Invalid Request: Invalid prompt parameter',
        redirectUri,
        clientId
      )
    )
  })

  test('throws a missing parameter error for no  redirect_uri', () => {
    expect(() =>
      parseAuthQueryParams(
        {
          response_type: 'code',
          client_id: clientId,
          state,
          nonce: '8b5376320b7d9307627a5ad9512da4f84555d96fe9517365',
          scope: 'openid email phone',
          claims:
            '{"userinfo":{"https:\\/\\/vocab.account.gov.uk\\/v1\\/passport":{"essential":true},"https:\\/\\/vocab.account.gov.uk\\/v1\\/coreIdentityJWT":{"essential":true},"https:\\/\\/vocab.account.gov.uk\\/v1\\/address":{"essential":true}}}',
          vtr: '["Cl.Cm"]',
          prompt: 'none'
        },
        config
      )
    ).toThrow(
      new MissingParameterError(
        'Invalid Request: Invalid redirect_uri parameter'
      )
    )
  })

  test('throws a parse request error for an invalid redirect_uri', () => {
    expect(() =>
      parseAuthQueryParams(
        {
          response_type: 'code',
          client_id: clientId,
          redirect_uri: 'not-a-valid-uri',
          state,
          nonce: '8b5376320b7d9307627a5ad9512da4f84555d96fe9517365',
          scope: 'openid email phone',
          claims:
            '{"userinfo":{"https:\\/\\/vocab.account.gov.uk\\/v1\\/passport":{"essential":true},"https:\\/\\/vocab.account.gov.uk\\/v1\\/coreIdentityJWT":{"essential":true},"https:\\/\\/vocab.account.gov.uk\\/v1\\/address":{"essential":true}}}',
          vtr: '["Cl.Cm"]',
          prompt: 'none'
        },
        config
      )
    ).toThrow(
      new MissingParameterError(
        'Invalid Request: Invalid redirect_uri parameter'
      )
    )
  })

  test('throws a parse request error for no scope', () => {
    expect(() =>
      parseAuthQueryParams(
        {
          client_id: clientId,
          response_type: 'code',
          redirect_uri: redirectUri,
          state,
          nonce: '8b5376320b7d9307627a5ad9512da4f84555d96fe9517365',
          claims:
            '{"userinfo":{"https:\\/\\/vocab.account.gov.uk\\/v1\\/passport":{"essential":true},"https:\\/\\/vocab.account.gov.uk\\/v1\\/coreIdentityJWT":{"essential":true},"https:\\/\\/vocab.account.gov.uk\\/v1\\/address":{"essential":true}}}',
          vtr: '["Cl.Cm"]',
          prompt: 'none'
        },
        config
      )
    ).toThrow(
      new ParseAuthRequestError(
        'Invalid Request: Missing scope parameter',
        redirectUri,
        clientId
      )
    )
  })

  test('throws a parse request error for a response_type that is not a valid OIDC respone_type', () => {
    expect(() =>
      parseAuthQueryParams(
        {
          client_id: clientId,
          response_type: 'notValid',
          redirect_uri: redirectUri,
          state,
          nonce: '8b5376320b7d9307627a5ad9512da4f84555d96fe9517365',
          claims:
            '{"userinfo":{"https:\\/\\/vocab.account.gov.uk\\/v1\\/passport":{"essential":true},"https:\\/\\/vocab.account.gov.uk\\/v1\\/coreIdentityJWT":{"essential":true},"https:\\/\\/vocab.account.gov.uk\\/v1\\/address":{"essential":true}}}',
          vtr: '["Cl.Cm"]',
          prompt: 'none',
          scope: 'openid'
        },
        config
      )
    ).toThrow(
      new ParseAuthRequestError(
        'Invalid Request: Unsupported response_type parameter',
        redirectUri,
        clientId
      )
    )
  })

  test('throws a parse request error for no openid scope', () => {
    expect(() =>
      parseAuthQueryParams(
        {
          client_id: clientId,
          response_type: 'code',
          redirect_uri: redirectUri,
          state,
          nonce: '8b5376320b7d9307627a5ad9512da4f84555d96fe9517365',
          claims:
            '{"userinfo":{"https:\\/\\/vocab.account.gov.uk\\/v1\\/passport":{"essential":true},"https:\\/\\/vocab.account.gov.uk\\/v1\\/coreIdentityJWT":{"essential":true},"https:\\/\\/vocab.account.gov.uk\\/v1\\/address":{"essential":true}}}',
          vtr: '["Cl.Cm"]',
          scope: 'email phone',
          prompt: 'none'
        },
        config
      )
    ).toThrow(
      new ParseAuthRequestError(
        'Invalid Request: The scope must include an openid value',
        redirectUri,
        clientId
      )
    )
  })

  test('throws a parse request error if the claims have invalid JSON', () => {
    expect(() =>
      parseAuthQueryParams(
        {
          response_type: 'code',
          client_id: clientId,
          redirect_uri: redirectUri,
          state,
          nonce: '8b5376320b7d9307627a5ad9512da4f84555d96fe9517365',
          scope: 'openid email phone',
          claims: '{{{{{{{{{{}',
          vtr: '["Cl.Cm"]',
          prompt: 'none'
        },
        config
      )
    ).toThrow(
      new ParseAuthRequestError('Invalid JSON in claims', redirectUri, clientId)
    )
  })

  test('throws a bad request error if the client id does not match the config ', () => {
    areScopesValidMock.mockReturnValue(true)
    vtrValidatorMock.mockReturnValue(mockVtr)
    expect(() =>
      parseAuthQueryParams(
        {
          response_type: 'code',
          client_id: 'not-in-the-config',
          redirect_uri: redirectUri,
          state,
          nonce: '8b5376320b7d9307627a5ad9512da4f84555d96fe9517365',
          scope: 'openid email phone',
          claims:
            '{"userinfo":{"https:\\/\\/vocab.account.gov.uk\\/v1\\/passport":{"essential":true},"https:\\/\\/vocab.account.gov.uk\\/v1\\/coreIdentityJWT":{"essential":true},"https:\\/\\/vocab.account.gov.uk\\/v1\\/address":{"essential":true}}}',
          vtr: '["Cl.Cm"]',
          prompt: 'none'
        },
        config
      )
    ).toThrow(new BadRequestError('Invalid request'))
  })

  test('throws a bad request error if the redirect_uri is not in the config', () => {
    areClaimsValidMock.mockReturnValue(true)
    areScopesValidMock.mockReturnValue(true)
    vtrValidatorMock.mockReturnValue(mockVtr)
    expect(() =>
      parseAuthQueryParams(
        {
          response_type: 'code',
          client_id: clientId,
          redirect_uri: redirectUri + '/' + randomUUID(),
          state,
          nonce: '8b5376320b7d9307627a5ad9512da4f84555d96fe9517365',
          scope: 'openid email phone',
          claims:
            '{"userinfo":{"https:\\/\\/vocab.account.gov.uk\\/v1\\/passport":{"essential":true},"https:\\/\\/vocab.account.gov.uk\\/v1\\/coreIdentityJWT":{"essential":true},"https:\\/\\/vocab.account.gov.uk\\/v1\\/address":{"essential":true}}}',
          vtr: '["Cl.Cm"]',
          prompt: 'none'
        },
        config
      )
    ).toThrow(new BadRequestError('Invalid request'))
  })

  test('throws an authoriseRequestError if there is no state value', () => {
    areClaimsValidMock.mockReturnValue(true)
    areScopesValidMock.mockReturnValue(true)
    vtrValidatorMock.mockReturnValue(mockVtr)
    expect(() =>
      parseAuthQueryParams(
        {
          response_type: 'code',
          client_id: clientId,
          redirect_uri: redirectUri,
          nonce: '8b5376320b7d9307627a5ad9512da4f84555d96fe9517365',
          scope: 'openid email phone',
          claims:
            '{"userinfo":{"https:\\/\\/vocab.account.gov.uk\\/v1\\/passport":{"essential":true},"https:\\/\\/vocab.account.gov.uk\\/v1\\/coreIdentityJWT":{"essential":true},"https:\\/\\/vocab.account.gov.uk\\/v1\\/address":{"essential":true}}}',
          vtr: '["Cl.Cm"]',
          prompt: 'none'
        },
        config
      )
    ).toThrow(
      new AuthoriseRequestError({
        errorCode: 'invalid_request',
        errorDescription: 'Request is missing state parameter',
        httpStatusCode: 302,
        redirectUri,
        state: null
      })
    )
  })

  test('throws an authoriseRequestError if the request_uri parameter is present ', () => {
    areClaimsValidMock.mockReturnValue(true)
    areScopesValidMock.mockReturnValue(true)
    vtrValidatorMock.mockReturnValue(mockVtr)
    expect(() =>
      parseAuthQueryParams(
        {
          response_type: 'code',
          client_id: clientId,
          redirect_uri: redirectUri,
          nonce: '8b5376320b7d9307627a5ad9512da4f84555d96fe9517365',
          state,
          scope: 'openid email phone',
          claims:
            '{"userinfo":{"https:\\/\\/vocab.account.gov.uk\\/v1\\/passport":{"essential":true},"https:\\/\\/vocab.account.gov.uk\\/v1\\/coreIdentityJWT":{"essential":true},"https:\\/\\/vocab.account.gov.uk\\/v1\\/address":{"essential":true}}}',
          vtr: '["Cl.Cm"]',
          prompt: 'none',
          request_uri: 'https://example.com/some-request-uri'
        },
        config
      )
    ).toThrow(
      new AuthoriseRequestError({
        errorCode: 'request_uri_not_supported',
        errorDescription: 'Request URI parameter not supported',
        httpStatusCode: 302,
        redirectUri,
        state
      })
    )
  })

  test('throws an authoriseRequestError if the response_type is not code', () => {
    areClaimsValidMock.mockReturnValue(true)
    areScopesValidMock.mockReturnValue(true)
    vtrValidatorMock.mockReturnValue(mockVtr)
    expect(() =>
      parseAuthQueryParams(
        {
          response_type: 'token',
          client_id: clientId,
          redirect_uri: redirectUri,
          nonce: '8b5376320b7d9307627a5ad9512da4f84555d96fe9517365',
          state,
          scope: 'openid email phone',
          claims:
            '{"userinfo":{"https:\\/\\/vocab.account.gov.uk\\/v1\\/passport":{"essential":true},"https:\\/\\/vocab.account.gov.uk\\/v1\\/coreIdentityJWT":{"essential":true},"https:\\/\\/vocab.account.gov.uk\\/v1\\/address":{"essential":true}}}',
          vtr: '["Cl.Cm"]',
          prompt: 'none'
        },
        config
      )
    ).toThrow(
      new AuthoriseRequestError({
        errorCode: 'unsupported_response_type',
        errorDescription: 'Unsupported response type',
        httpStatusCode: 302,
        redirectUri,
        state
      })
    )
  })

  test('throws an authoriseRequestError if the scopes are not valid', () => {
    areScopesValidMock.mockReturnValue(false)
    areClaimsValidMock.mockReturnValue(true)
    vtrValidatorMock.mockReturnValue(mockVtr)

    expect(() =>
      parseAuthQueryParams(
        {
          response_type: 'code',
          client_id: clientId,
          redirect_uri: redirectUri,
          nonce: '8b5376320b7d9307627a5ad9512da4f84555d96fe9517365',
          state,
          scope: 'openid email phone',
          claims:
            '{"userinfo":{"https:\\/\\/vocab.account.gov.uk\\/v1\\/passport":{"essential":true},"https:\\/\\/vocab.account.gov.uk\\/v1\\/coreIdentityJWT":{"essential":true},"https:\\/\\/vocab.account.gov.uk\\/v1\\/address":{"essential":true}}}',
          vtr: '["Cl.Cm"]',
          prompt: 'none'
        },
        config
      )
    ).toThrow(
      new AuthoriseRequestError({
        errorCode: 'invalid_scope',
        errorDescription: 'Invalid, unknown or malformed scope',
        httpStatusCode: 302,
        redirectUri,
        state
      })
    )
  })

  test('throws an authoriseRequestError if the the claims are invalid', () => {
    areScopesValidMock.mockReturnValue(true)
    areClaimsValidMock.mockReturnValue(false)
    vtrValidatorMock.mockReturnValue(mockVtr)
    expect(() =>
      parseAuthQueryParams(
        {
          response_type: 'code',
          client_id: clientId,
          redirect_uri: redirectUri,
          nonce: '8b5376320b7d9307627a5ad9512da4f84555d96fe9517365',
          state,
          scope: 'openid email phone',
          claims:
            '{"userinfo":{"https:\\/\\/vocab.account.gov.uk\\/v1\\/passport":{"essential":true},"https:\\/\\/vocab.account.gov.uk\\/v1\\/coreIdentityJWT":{"essential":true},"https:\\/\\/vocab.account.gov.uk\\/v1\\/address":{"essential":true}}}',
          vtr: '["Cl.Cm"]',
          prompt: 'none'
        },
        config
      )
    ).toThrow(
      new AuthoriseRequestError({
        errorCode: 'invalid_request',
        errorDescription: 'Request contains invalid claims',
        httpStatusCode: 302,
        redirectUri,
        state
      })
    )
  })

  test('throws an authoriseRequestError if there is no nonce included', () => {
    areClaimsValidMock.mockReturnValue(true)
    areScopesValidMock.mockReturnValue(true)
    vtrValidatorMock.mockReturnValue(mockVtr)
    expect(() =>
      parseAuthQueryParams(
        {
          response_type: 'code',
          client_id: clientId,
          redirect_uri: redirectUri,
          state,
          scope: 'openid email phone',
          claims:
            '{"userinfo":{"https:\\/\\/vocab.account.gov.uk\\/v1\\/passport":{"essential":true},"https:\\/\\/vocab.account.gov.uk\\/v1\\/coreIdentityJWT":{"essential":true},"https:\\/\\/vocab.account.gov.uk\\/v1\\/address":{"essential":true}}}',
          vtr: '["Cl.Cm"]',
          prompt: 'none'
        },
        config
      )
    ).toThrow(
      new AuthoriseRequestError({
        errorCode: 'invalid_request',
        errorDescription: 'Request is missing nonce parameter',
        httpStatusCode: 302,
        redirectUri,
        state
      })
    )
  })

  test('throws an error if the vtrValidator throws', () => {
    areClaimsValidMock.mockReturnValue(true)
    areScopesValidMock.mockReturnValue(true)
    const error = new AuthoriseRequestError({
      errorCode: 'invalid_request',
      errorDescription: 'Request vtr not valid',
      httpStatusCode: 302,
      state,
      redirectUri
    })
    vtrValidatorMock.mockImplementation(() => {
      throw error
    })

    expect(() =>
      parseAuthQueryParams(
        {
          response_type: 'code',
          client_id: clientId,
          redirect_uri: redirectUri,
          state,
          scope: 'openid email phone',
          claims:
            '{"userinfo":{"https:\\/\\/vocab.account.gov.uk\\/v1\\/passport":{"essential":true},"https:\\/\\/vocab.account.gov.uk\\/v1\\/coreIdentityJWT":{"essential":true},"https:\\/\\/vocab.account.gov.uk\\/v1\\/address":{"essential":true}}}',
          vtr: '["Cl.Cm"]',
          nonce: '8b5376320b7d9307627a5ad9512da4f84555d96fe9517365',
          prompt: 'none'
        },
        config
      )
    ).toThrow(error)
  })

  test('throws an authoriseRequestError if the prompt includes select_account', () => {
    areClaimsValidMock.mockReturnValue(true)
    areScopesValidMock.mockReturnValue(true)
    vtrValidatorMock.mockReturnValue(mockVtr)
    expect(() =>
      parseAuthQueryParams(
        {
          response_type: 'code',
          client_id: clientId,
          redirect_uri: redirectUri,
          state,
          scope: 'openid email phone',
          claims:
            '{"userinfo":{"https:\\/\\/vocab.account.gov.uk\\/v1\\/passport":{"essential":true},"https:\\/\\/vocab.account.gov.uk\\/v1\\/coreIdentityJWT":{"essential":true},"https:\\/\\/vocab.account.gov.uk\\/v1\\/address":{"essential":true}}}',
          vtr: '["Cl.Cm"]',
          prompt: 'select_account',
          nonce: '8b5376320b7d9307627a5ad9512da4f84555d96fe9517365'
        },
        config
      )
    ).toThrow(
      new AuthoriseRequestError({
        errorCode: 'unmet_authentication_requirements',
        errorDescription: 'Unmet authentication requirements',
        httpStatusCode: 302,
        state,
        redirectUri
      })
    )
  })

  test('returns a parsedAuthRequest ', () => {
    areClaimsValidMock.mockReturnValue(true)
    areScopesValidMock.mockReturnValue(true)
    vtrValidatorMock.mockReturnValue(mockVtr)

    expect(
      parseAuthQueryParams(
        {
          response_type: 'code',
          client_id: clientId,
          redirect_uri: redirectUri,
          state,
          scope: 'openid email phone',
          claims:
            '{"userinfo":{"https:\\/\\/vocab.account.gov.uk\\/v1\\/passport":{"essential":true},"https:\\/\\/vocab.account.gov.uk\\/v1\\/coreIdentityJWT":{"essential":true},"https:\\/\\/vocab.account.gov.uk\\/v1\\/address":{"essential":true}}}',
          vtr: '["Cl.Cm"]',
          nonce: '8b5376320b7d9307627a5ad9512da4f84555d96fe9517365',
          prompt: 'none'
        },
        config
      )
    ).toStrictEqual({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      state,
      scope: ['openid', 'email', 'phone'],
      claims: [
        'https://vocab.account.gov.uk/v1/passport',
        'https://vocab.account.gov.uk/v1/coreIdentityJWT',
        'https://vocab.account.gov.uk/v1/address'
      ],
      vtr: mockVtr,
      nonce: '8b5376320b7d9307627a5ad9512da4f84555d96fe9517365',
      prompt: ['none'],
      ui_locales: []
    })
  })
})
