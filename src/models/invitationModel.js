import Joi from 'joi'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { INVITATION_TYPES, BOARD_INVITATION_STATUS } from '~/utils/constants'
import { userModel } from './userModel'
import { ObjectId } from 'mongodb'
import { boardModel } from './boardModel'

const INVITATION_COLLECTION_NAME = 'invitations'
const INVITATION_COLLECTION_SCHEMA = Joi.object({
  inviterId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  inviteeId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  type: Joi.string().required().valid(...Object.values(INVITATION_TYPES)),

  // Lời mời vào board
  boardInvitation: Joi.object({
    boardId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    status: Joi.string().valid(...Object.values(BOARD_INVITATION_STATUS))
  }).optional(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt', 'inviterId', 'inviteeId', 'type']

const validateSchema = async (data) => {
  return await INVITATION_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const findOneById = async (invitationId) => {
  try {
    return await GET_DB().collection(INVITATION_COLLECTION_NAME).findOne({ _id: new ObjectId(invitationId), _destroy: false })
  } catch (error) {
    throw Error(error)
  }
}

const createNewBoardInvitation = async (data) => {
  try {
    const validatedData = await validateSchema(data)

    const correctData = {
      ...validatedData,
      inviterId: new ObjectId(validatedData.inviterId),
      inviteeId: new ObjectId(validatedData.inviteeId)
    }

    if (correctData.boardInvitation) {
      correctData.boardInvitation = {
        ...correctData.boardInvitation,
        boardId: new ObjectId(correctData.boardInvitation.boardId)
      }
    }

    return await GET_DB().collection(INVITATION_COLLECTION_NAME).insertOne(correctData)
  } catch (error) {
    throw Error(error)
  }
}

const update = async (invitationId, data) => {
  try {
    Object.keys(data).forEach(field => {
      if (INVALID_UPDATE_FIELDS.includes(field)) {
        delete data[field]
      }
    })

    if (data.boardInvitation) {
      data.boardInvitation = {
        ...data.boardInvitation,
        boardId: new ObjectId(data.boardInvitation.boardId)
      }
    }

    return await GET_DB().collection(INVITATION_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(invitationId) },
      { $set: data },
      { returnDocument: 'after' }
    )
  } catch (error) {
    throw Error(error)
  }
}

//Lấy toàn bộ lời mời theo user được mời
const findByUser = async (userId) => {
  try {
    const queryConditions = [
      { inviteeId: new ObjectId(userId) },
      { _destroy: false }
    ]

    const query = await GET_DB()
      .collection(INVITATION_COLLECTION_NAME)
      .aggregate([
        { $match: { $and: queryConditions } },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'inviteeId',
            foreignField: '_id',
            as: 'invitee',
            pipeline: [{ $project: { 'password': 0, 'verify': 0 } }]
          }
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'inviterId',
            foreignField: '_id',
            as: 'inviter',
            pipeline: [{ $project: { 'password': 0, 'verify': 0 } }]
          }
        },
        {
          $lookup: {
            from: boardModel.BOARD_COLLECTION_NAME,
            localField: 'boardInvitation.boardId',
            foreignField: '_id',
            as: 'board'
          }
        }
      ]).toArray()

    return query
  } catch (error) {
    throw new Error(error)
  }
}

export const invitationModel = {
  INVITATION_COLLECTION_NAME,
  INVITATION_COLLECTION_SCHEMA,
  findOneById,
  createNewBoardInvitation,
  update,
  findByUser
}