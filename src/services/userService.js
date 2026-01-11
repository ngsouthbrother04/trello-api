/* eslint-disable no-useless-catch */
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/userModel'
import { pickUserData } from '~/utils/formatter'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { BrevoProvider } from '~/providers/BrevoProvider'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

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

    //TODO: Xác thực email
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

export const userService = {
  createNew
}