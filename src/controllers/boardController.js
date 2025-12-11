/* eslint-disable no-console */
import { StatusCodes } from 'http-status-codes'
import { boardService } from '~/services/boardService'

const createBoard = async (req, res, next) => {
  try {
    const createdBoard = await boardService.createBoard(req.body)

    res.status(StatusCodes.CREATED).json(createdBoard)
  } catch (error) {
    next(error)
  }
}

const getListBoards = async (req, res, next) => {
  try {
    const listBoards = await boardService.getListBoards()

    res.status(StatusCodes.OK).json(listBoards)
  } catch (error) {
    next(error)
  }
}

const getDetails = async (req, res, next) => {
  try {
    const board = await boardService.getDetails(req.params.id)

    res.status(StatusCodes.OK).json(board)
  } catch (error) {
    next(error)
  }
}

const updateBoard = async (req, res, next) => {
  try {
    const updatedBoard = await boardService.updateBoard(req.params.id, req.body)

    res.status(StatusCodes.OK).json(updatedBoard)
  } catch (error) {
    next(error)
  }
}

const movingCardBetweenColumns = async (req, res, next) => {
  try {
    const result = await boardService.movingCardBetweenColumns(req.body)

    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const boardController = {
  createBoard,
  getDetails,
  getListBoards,
  updateBoard,
  movingCardBetweenColumns
}