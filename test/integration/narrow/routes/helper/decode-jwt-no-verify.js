const decodeTokenPart = (part) =>
  JSON.parse(Buffer.from(part, 'base64url').toString())

const decodeJwtNoVerify = (signedJwt) => {
  const [headerPart, payloadPart] = signedJwt.split('.')
  const payload = decodeTokenPart(payloadPart)
  const protectedHeader = decodeTokenPart(headerPart)
  return { payload, protectedHeader }
}

module.exports = {
  decodeJwtNoVerify
}
