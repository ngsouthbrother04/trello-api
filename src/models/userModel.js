import Joi from 'joi'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'

const USER_ROLES = {
  CLIENT: 'client',
  ADMIN: 'admin'
}

const INVALID_FIELDS = ['_id', 'email', 'username', 'createdAt']

const USER_COLLECTION_NAME = 'users'
const USER_COLLECTION_SCHEMA = Joi.object({
  email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
  password: Joi.string().required(),
  username: Joi.string().required().trim().strict(),
  displayName: Joi.string().required().trim().strict(),
  avartar: Joi.string().default(null),
  role: Joi.string().valid(USER_ROLES.CLIENT, USER_ROLES.ADMIN).default(USER_ROLES.CLIENT),
  isActive: Joi.boolean().default(false),
  verifyToken: Joi.string(),
  createdAt: Joi.date().timestamp('javascript').default(new Date()),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const validateSchema = async (data) => {
  try {
    return await USER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (id) => {
  try {
    return await GET_DB().collection(USER_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
  } catch (error) {
    throw new Error(error)
  }
}

const createNew = async (data) => {
  try {
    const validData = await validateSchema(data)
    const createdUser = await GET_DB().collection(USER_COLLECTION_NAME).insertOne(validData)

    return createdUser
  } catch (error) {
    throw new Error(error)
  }
}

const findOneByEmail = async (email) => {
  try {
    return await GET_DB().collection(USER_COLLECTION_NAME).findOne({ email })
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (userID, data) => {
  try {
    Object.keys(data).forEach(key => {
      if (INVALID_FIELDS.includes(key)) {
        delete data[key]
      }
    })

    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(userID) },
      { $set: { ...data, updatedAt: new Date() } },
      { returnDocument: 'after' })

    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const userModel = {
  USER_COLLECTION_NAME,
  USER_COLLECTION_SCHEMA,
  USER_ROLES,
  createNew,
  findOneById,
  findOneByEmail,
  update
}