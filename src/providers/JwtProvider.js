import JWT from 'jsonwebtoken'

/**
 * Func cần 3 tham số:
  * - payload: dữ liệu muốn mã hóa vào token
  * - secretSignature: chuỗi bí mật dùng để mã hóa và giải mã token
  * - tokenLife: thời gian token tồn tại
 */
const generateToken = async (payload, secretSignature, tokenLife) => {
  try {
    return JWT.sign(payload, secretSignature, {
      expiresIn: tokenLife,
      algorithm: 'HS256'
    })
  } catch (error) {
    throw new Error(error)
  }
}

/**
 * Func kiểm tra xem token có hợp lệ không: Token tạo ra có đúng với secretSignature không
 */
const verifyToken = async (token, secretSignature) => {
  try {
    return JWT.verify(token, secretSignature)
  } catch (error) {
    throw new Error(error)
  }
}

export const JwtProvider = {
  generateToken,
  verifyToken
}
