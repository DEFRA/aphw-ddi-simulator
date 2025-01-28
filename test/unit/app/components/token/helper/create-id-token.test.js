const { errors, importPKCS8, jwtVerify } = require('jose')
const { Config } = require('../../../../../../app/config')
const {
  ID_TOKEN_EXPIRY,
  EC_PRIVATE_TOKEN_SIGNING_KEY_ID,
  RSA_PRIVATE_TOKEN_SIGNING_KEY_ID,
  SESSION_ID,
  EC_PRIVATE_TOKEN_SIGNING_KEY,
  INVALID_ISSUER,
  ONE_DAY_IN_SECONDS
} = require('../../../../../../app/constants')
const { createIdToken } = require('../../../../../../app/components/token/helper/create-id-token')

describe('createIdToken tests', () => {
  const mockAuthRequestParams = {
    claims: [],
    nonce: 'nonce-1238rhbh4r84=4rij=r4r',
    scopes: ['openid'],
    redirectUri: 'https://example.com/authentication-callback/',
    vtr: {
      credentialTrust: 'Cl.Cm',
      levelOfConfidence: null
    }
  }
  const testTimestampMs = 1723707024
  const testClientId = 'testClientId'
  const testSubClaim =
    'urn:fdc:gov.uk:2022:56P4CMsGh_02YOlWpd8PAOI-2sVlB2nsNU7mcLZYhYw='
  const testAccessToken =
    'eyJhbGciOiJSUzI1NiIsImtpZCI6IjczMzRiNzE4LTNmMjktNDRlZi04YjY1LWUyNjZhMTdkYWVhNSJ9.eyJleHAiOjkzNjQ4OTc4MSwiaWF0Ijo5MzY0ODk2MDEsImlzcyI6Imh0dHBzOi8vb2lkYy50ZXN0LmFjY291bnQuZ292LnVrIiwianRpIjoiMTIzNDU2NyIsImNsaWVudF9pZCI6InRlc3RDbGllbnRJZCIsInN1YiI6InVybjpmZGM6Z292LnVrOjIwMjI6NTZQNENNc0doXzAyWU9sV3BkOFBBT0ktMnNWbEIybnNOVTdtY0xaWWhZdz0iLCJzaWQiOiIxMjM0NTY3Iiwic2NvcGUiOlsib3BlbmlkIl19.GDDz3DcWSUCWMT8OkxZvU8ffiAjOKcNNaW23RzlEBer3G4Xz5Sp7moGtbP4vcfXT_pLUy-_YTIsiJ9r-A1gchhmx_qbfnWcqHxwj3DFYZ_Q16XgpB_7o_MtsiY1aAhqd8-zywTg25aczMHPtZMLVdYx9vw8zlF9iI9sOscS-s5Bje1yZ6ZmbHseHYVa8yJmZIjoKcdnGQXQwGQFp1KyzkA2gJxnR19Nc8O9oM4PA5y6uBCme3YTknei3T3tfJrPiBevtdvr9SV5fBTK2MrPzHao51_8nT841TdnMbHWxYp0FHTiBw7aAQO2VoKQ6Zku5CqBd3dyeQy_sZDNOFrDOTA'

  const clientIdSpy = jest.spyOn(Config.getInstance(), 'getClientId')
  const subSpy = jest.spyOn(Config.getInstance(), 'getSub')
  const tokenSigningAlgorithmSpy = jest.spyOn(
    Config.getInstance(),
    'getIdTokenSigningAlgorithm'
  )
  const idTokenErrorSpy = jest.spyOn(Config.getInstance(), 'getIdTokenErrors')

  const decodeTokenPart = (part) =>
    JSON.parse(Buffer.from(part, 'base64url').toString())

  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(testTimestampMs)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('returns a signed Id token using RS256', async () => {
    tokenSigningAlgorithmSpy.mockReturnValue('RS256')
    subSpy.mockReturnValue(testSubClaim)
    clientIdSpy.mockReturnValue(testClientId)

    const IdToken = await createIdToken(mockAuthRequestParams, testAccessToken)
    const tokenParts = IdToken.split('.')

    const header = decodeTokenPart(tokenParts[0])
    const payload = decodeTokenPart(tokenParts[1])

    expect(tokenParts.length).toBe(3)
    expect(header).toStrictEqual({
      alg: 'RS256',
      kid: RSA_PRIVATE_TOKEN_SIGNING_KEY_ID
    })
    expect(payload).toStrictEqual({
      iat: Math.floor(testTimestampMs / 1000),
      exp: Math.floor(testTimestampMs / 1000) + ID_TOKEN_EXPIRY,
      iss: 'http://localhost:3000/',
      aud: testClientId,
      sub: testSubClaim,
      sid: SESSION_ID,
      at_hash: 'oB7bgQoIL9clDcgMdS4Ydg',
      vtm: 'http://localhost:3000/trustmark',
      vot: 'Cl.Cm',
      nonce: mockAuthRequestParams.nonce
    })
    expect(typeof tokenParts[2]).toBe('string')
  })

  test('returns a signed Id Token using ES256', async () => {
    tokenSigningAlgorithmSpy.mockReturnValue('ES256')
    subSpy.mockReturnValue(testSubClaim)
    clientIdSpy.mockReturnValue(testClientId)

    const idToken = await createIdToken(mockAuthRequestParams, testAccessToken)
    const tokenParts = idToken.split('.')

    const header = decodeTokenPart(tokenParts[0])
    const payload = decodeTokenPart(tokenParts[1])

    expect(tokenParts.length).toBe(3)
    expect(header).toStrictEqual({
      alg: 'ES256',
      kid: EC_PRIVATE_TOKEN_SIGNING_KEY_ID
    })
    expect(payload).toStrictEqual({
      iat: Math.floor(testTimestampMs / 1000),
      exp: Math.floor(testTimestampMs / 1000) + ID_TOKEN_EXPIRY,
      iss: 'http://localhost:3000/',
      aud: testClientId,
      sub: testSubClaim,
      sid: SESSION_ID,
      at_hash: 'oB7bgQoIL9clDcgMdS4Ydg',
      vtm: 'http://localhost:3000/trustmark',
      vot: mockAuthRequestParams.vtr.credentialTrust,
      nonce: mockAuthRequestParams.nonce
    })
    expect(typeof tokenParts[2]).toBe('string')
  })

  test('returns an invalid header if the client config has enabled INVALID_ALG_HEADER', async () => {
    tokenSigningAlgorithmSpy.mockReturnValue('ES256')
    subSpy.mockReturnValue(testSubClaim)
    clientIdSpy.mockReturnValue(testClientId)
    idTokenErrorSpy.mockReturnValue(['INVALID_ALG_HEADER'])

    const idToken = await createIdToken(mockAuthRequestParams, testAccessToken)
    const tokenParts = idToken.split('.')

    const header = decodeTokenPart(tokenParts[0])

    expect(tokenParts.length).toBe(3)
    expect(header).toStrictEqual({
      alg: 'HS256'
    })
  })

  test('returns an invalid signature if the client config has enabled INVALID_SIGNATURE', async () => {
    tokenSigningAlgorithmSpy.mockReturnValue('ES256')
    subSpy.mockReturnValue(testSubClaim)
    clientIdSpy.mockReturnValue(testClientId)
    idTokenErrorSpy.mockReturnValue(['INVALID_SIGNATURE'])

    const idToken = await createIdToken(mockAuthRequestParams, testAccessToken)

    const ecTokenKey = await importPKCS8(EC_PRIVATE_TOKEN_SIGNING_KEY, 'ES256')

    await expect(jwtVerify(idToken, ecTokenKey)).rejects.toThrow(
      errors.JWSSignatureVerificationFailed
    )
  })

  test('returns a token with iat in the future if the client config has enabled TOKEN_NOT_VALID_YET', async () => {
    tokenSigningAlgorithmSpy.mockReturnValue('ES256')
    subSpy.mockReturnValue(testSubClaim)
    clientIdSpy.mockReturnValue(testClientId)
    idTokenErrorSpy.mockReturnValue(['TOKEN_NOT_VALID_YET'])

    const idToken = await createIdToken(mockAuthRequestParams, testAccessToken)

    const payload = decodeTokenPart(idToken.split('.')[1])
    expect(payload.iat).toEqual(
      Math.floor(testTimestampMs / 1000) + ONE_DAY_IN_SECONDS
    )
  })

  test('returns an expired token if the client config has enabled TOKEN_EXPIRED', async () => {
    tokenSigningAlgorithmSpy.mockReturnValue('ES256')
    subSpy.mockReturnValue(testSubClaim)
    clientIdSpy.mockReturnValue(testClientId)
    idTokenErrorSpy.mockReturnValue(['TOKEN_EXPIRED'])

    const idToken = await createIdToken(mockAuthRequestParams, testAccessToken)

    const payload = decodeTokenPart(idToken.split('.')[1])
    expect(payload.exp).toEqual(
      Math.floor(testTimestampMs / 1000) - ONE_DAY_IN_SECONDS
    )
  })

  test('returns an invalid vot if the client config has enabled INCORRECT_VOT', async () => {
    tokenSigningAlgorithmSpy.mockReturnValue('ES256')
    subSpy.mockReturnValue(testSubClaim)
    clientIdSpy.mockReturnValue(testClientId)
    idTokenErrorSpy.mockReturnValue(['INCORRECT_VOT'])

    const idToken = await createIdToken(mockAuthRequestParams, testAccessToken)

    const payload = decodeTokenPart(idToken.split('.')[1])
    expect(payload.vot).not.toEqual(mockAuthRequestParams.vtr.credentialTrust)
    expect(payload.vot).toBe('Cl')
  })

  test('returns an invalid aud if the client config has enabled INVALID_AUD', async () => {
    tokenSigningAlgorithmSpy.mockReturnValue('ES256')
    subSpy.mockReturnValue(testSubClaim)
    clientIdSpy.mockReturnValue(testClientId)
    idTokenErrorSpy.mockReturnValue(['INVALID_AUD'])

    const idToken = await createIdToken(mockAuthRequestParams, testAccessToken)

    const payload = decodeTokenPart(idToken.split('.')[1])
    expect(payload.aud).not.toEqual(testClientId)
  })

  test('returns an invalid iss if the client config has enabled INVALID_ISS', async () => {
    tokenSigningAlgorithmSpy.mockReturnValue('ES256')
    subSpy.mockReturnValue(testSubClaim)
    clientIdSpy.mockReturnValue(testClientId)
    idTokenErrorSpy.mockReturnValue(['INVALID_ISS'])

    const idToken = await createIdToken(mockAuthRequestParams, testAccessToken)

    const payload = decodeTokenPart(idToken.split('.')[1])
    expect(payload.iss).not.toEqual('http://localhost:3000/')
    expect(payload.iss).toBe(INVALID_ISSUER)
  })

  test('returns an invalid nonce if the client config has enabled NONCE_NOT_MATCHING', async () => {
    tokenSigningAlgorithmSpy.mockReturnValue('ES256')
    subSpy.mockReturnValue(testSubClaim)
    clientIdSpy.mockReturnValue(testClientId)
    idTokenErrorSpy.mockReturnValue(['NONCE_NOT_MATCHING'])

    const idToken = await createIdToken(mockAuthRequestParams, testAccessToken)

    const payload = decodeTokenPart(idToken.split('.')[1])
    expect(payload.iss).not.toEqual(mockAuthRequestParams.nonce)
  })
})
