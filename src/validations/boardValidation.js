import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import ApiError from '~/utils/ApiError'
import { BOARD_TYPE } from '~/utils/constants'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const createBoard = async (req, res, next) => {
  const board = Joi.object({
    title: Joi.string().required().min(3).max(100).trim().strict().messages({
      'any.required': 'Title is required',
      'string.empty': 'Title cannot be an empty string',
      'string.min': 'Title should have at least 3 chars',
      'string.max': 'Title should have less than or equal to 100 chars',
      'string.trim': 'Title should not have leading or trailing spaces'
    }),
    description: Joi.string().required().min(3).max(256).trim().strict().messages({
      'any.required': 'Description is required',
      'string.empty': 'Description cannot be an empty string',
      'string.min': 'Description should have at least 3 chars',
      'string.max': 'Description should have less than or equal to 256 chars',
      'string.trim': 'Description should not have leading or trailing spaces'
    }),
    type: Joi.string().valid(BOARD_TYPE.PUBLIC, BOARD_TYPE.PRIVATE).required().messages({
      'any.required': 'Type is required',
      'any.only': 'Type must be either public or private'
    }),
    _destroy: Joi.boolean().valid(true, false).default(false)
  })

  try {
    await board.validateAsync(req.body, { abortEarly: false })

    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const updateBoard = async (req, res, next) => {
  const board = Joi.object({
    title: Joi.string().min(3).max(100).trim().strict(),
    description: Joi.string().min(3).max(256).trim().strict(),
    type: Joi.string().valid(BOARD_TYPE.PUBLIC, BOARD_TYPE.PRIVATE),
    _destroy: Joi.boolean().valid(true, false)
  })

  try {
    await board.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true //Cho phép các trường không được định nghĩa trong schema
    })

    next()
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

const movingCardBetweenColumns = async (req, res, next) => {
  const board = Joi.object({
    currCardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    prevColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    nextColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    prevCardOrderIds: Joi.array().required().items(
      Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    ),
    nextCardOrderIds: Joi.array().required().items(
      Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    )
  })

  try {
    await board.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

export const boardValidation = {
  createBoard,
  updateBoard,
  movingCardBetweenColumns
}