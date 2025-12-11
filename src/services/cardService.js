import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'

const createCard = async (req) => {
  try {
    const card = {
      ...req
    }

    const createdCard = await cardModel.createCard(card)

    const getNewCard = await cardModel.findOneById(createdCard.insertedId)

    if (getNewCard) {
      await columnModel.pushCardIdToColumn(getNewCard)
    }

    return getNewCard
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Fail to create new card')
  }
}

export const cardService = {
  createCard
}