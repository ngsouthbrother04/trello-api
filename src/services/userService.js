/* eslint-disable no-lonely-if */
/* eslint-disable no-useless-catch */
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/userModel'
import { pickUserData } from '~/utils/formatter'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { BrevoProvider } from '~/providers/BrevoProvider'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { JwtProvider } from '~/providers/JwtProvider'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
import { env } from '~/config/environment'

const createNew = async (reqBody) => {
  try {
    //Kiểm tra email đã tồn tại chưa
    const existingUser = await userModel.findOneByEmail(reqBody.email)

    if (existingUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already in use')
    }

    //Lưu data vào DB
    const nameFromEmail = reqBody.email.split('@')[0]
    const newUser = {
      email: reqBody.email,
      password: bcrypt.hashSync(reqBody.password, 8),
      username: nameFromEmail,
      displayName: nameFromEmail,
      verifyToken: uuidv4()
    }
    const createdUser = await userModel.createNew(newUser)
    const newUserCreated = await userModel.findOneById(createdUser.insertedId)

    //Xác thực email
    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${newUserCreated.email}&token=${newUserCreated.verifyToken}`
    const customSubject = 'Trello MERN Stack ADVANCED: Verify your email address'
    const htmlContent = `
      <h3>Here is your email verification link:</h3>
      <h3>${verificationLink}</h3>
      <h3>Sincerely, <br> - Trello MERN Stack ADVANCED - </h3>
    `

    //Gọi tới provider gửi email
    await BrevoProvider.sendEmail(newUserCreated.email, customSubject, htmlContent)

    //Trả kết quả về controller
    return pickUserData(newUserCreated)
  } catch (error) {
    throw error
  }
}

const verifyAccount = async (reqBody) => {
  try {
    const existedUser = await userModel.findOneByEmail(reqBody.email)

    if (!existedUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    }

    if (existedUser.isActive) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Account is already verified')
    }

    if (existedUser.verifyToken !== reqBody.token) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Invalid verification token')
    }

    //Cập nhật trạng thái tài khoản
    const updateData = {
      isActive: true,
      verifyToken: null
    }

    const updatedUser = await userModel.update(existedUser._id, updateData)

    return pickUserData(updatedUser)
  } catch (error) {
    throw error
  }
}

const login = async (reqBody) => {
  try {
    const existedUser = await userModel.findOneByEmail(reqBody.email)

    if (!existedUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    }

    if (!existedUser.isActive) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Cannot login to an unverified account, please verify your email first')
    }

    if (!bcrypt.compareSync(reqBody.password, existedUser.password)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Email or password is incorrect')
    }

    /*
      Thông tin đính kèm trong token: userId, email
      Nếu mọi thứ ok, tạo token để trả về cho client
    */
    const userInfo = { _id: existedUser._id, email: existedUser.email }

    //Tạo ra accessToken và refreshToken trả về cho client
    const accessToken = await JwtProvider.generateToken(userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      // 5,
      env.ACCESS_TOKEN_LIFE)

    const refreshToken = await JwtProvider.generateToken(userInfo,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      env.REFRESH_TOKEN_LIFE)

    //Trả về thông tin user kèm theo 2 token vừa tạo
    return {
      accessToken,
      refreshToken,
      ...pickUserData(existedUser)
    }

  } catch (error) {
    throw error
  }
}

const refreshToken = async (clientRefreshToken) => {
  try {
    //Verify refresh token
    const refreshTokenDecoded = await JwtProvider.verifyToken(clientRefreshToken, env.REFRESH_TOKEN_SECRET_SIGNATURE)

    //Lấy ra thông tin user từ refreshToken cũ, tránh query lại DB
    const userInfo = {
      _id: refreshTokenDecoded._id,
      email: refreshTokenDecoded.email
    }

    //Tạo ra accessToken mới
    const accessToken = await JwtProvider.generateToken(userInfo, env.ACCESS_TOKEN_SECRET_SIGNATURE, env.ACCESS_TOKEN_LIFE)

    return { accessToken }
  } catch (error) {
    throw error
  }
}

const update = async (userId, reqBody, avatarFile) => {
  try {
    const user = await userModel.findOneById(userId)

    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    }

    if (!user.isActive) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Cannot update an unverified account, please verify your email first')
    }

    let updatedUser = {}

    if (reqBody.current_password && reqBody.new_password) {
      //Kiểm tra current_password có đúng không
      if (!bcrypt.compareSync(reqBody.current_password, user.password)) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Current password is incorrect')
      }

      updatedUser = await userModel.update(user._id, {
        ...updatedUser,
        password: bcrypt.hashSync(reqBody.new_password, 8)
      })
    } else if (avatarFile) {
      //Cập nhật avatar bằng cloudinary
      // Với folder name là 'users', nếu chưa có thì cloudinary sẽ tự tạo, nếu có rồi thì sẽ dùng lại
      const uploadResult = await CloudinaryProvider.streamUpload(avatarFile.buffer, 'trello/users', user._id.toString())

      //Luu url của ảnh vào database
      updatedUser = await userModel.update(user._id, {
        ...updatedUser,
        avatar: uploadResult.secure_url
      })
    } else {
      updatedUser = await userModel.update(user._id, reqBody)
    }

    return pickUserData(updatedUser)
  } catch (error) {
    throw error
  }
}

export const userService = {
  createNew,
  verifyAccount,
  login,
  refreshToken,
  update
}