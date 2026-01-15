import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { JwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'

const isAuthorized = async (req, res, next) => {
  //Lấy accessToken nằm trong request cookie phía client
  const clientAccessToken = req.cookies?.accessToken

  //Nếu không tìm thấy token thì báo lỗi
  if (!clientAccessToken) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized (Access token not found)'))
  }

  try {
    //B1: Giải mã token để xem token có hợp lệ hay không
    const accessTokenDecoded = await JwtProvider.verifyToken(clientAccessToken, env.ACCESS_TOKEN_SECRET_SIGNATURE)

    //B2: Nếu hợp lệ, giải mã và gắn vào req.jwtDecoded để sử dụng ở các layers sau
    req.jwtDecoded = accessTokenDecoded

    //B3: Cho phép đi tiếp
    next()
  } catch (error) {
    //Nếu accessToken hết hạn -> trả lỗi để client gọi refreshToken (410 - GONE)
    if (error?.message.includes('jwt expired')) {
      next(new ApiError(StatusCodes.GONE, 'Access token need to be refreshed'))
      return
    }

    //Nếu không hợp lệ -> trả về lỗi 401 và sign out client
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized'))
  }
}

export const authMiddleware = {
  isAuthorized
}
