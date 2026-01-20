/* eslint-disable no-console */
import { StatusCodes } from 'http-status-codes'
import { cardService } from '~/services/cardService'

const createCard = async (req, res, next) => {
  try {
    const createdCard = await cardService.createCard(req.body)
    res.status(StatusCodes.CREATED).json(createdCard)
  } catch (error) {
    next(error)
  }
}

const updateCard = async (req, res, next) => {
  try {
    const cardId = req.params.id
    const cardCoverFile = req.file
    const userInfo = req.jwtDecoded
    const updatedCard = await cardService.updateCard(cardId, req.body, cardCoverFile, userInfo)

    res.status(StatusCodes.OK).json(updatedCard)
  } catch (error) {
    next(error)
  }
}


export const cardController = {
  createCard,
  updateCard
}