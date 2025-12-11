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


export const cardController = {
  createCard
}