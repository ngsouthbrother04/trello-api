/* eslint-disable no-console */
import { StatusCodes } from 'http-status-codes'
import { columnService } from '~/services/columnService'

const createColumn = async (req, res, next) => {
  try {
    const createdColumn = await columnService.createColumn(req.body)

    res.status(StatusCodes.CREATED).json(createdColumn)
  } catch (error) {
    next(error)
  }
}

const updateColumn = async (req, res, next) => {
  try {
    const updatedColumn = await columnService.updateColumn(req.params.id, req.body)

    res.status(StatusCodes.OK).json(updatedColumn)
  } catch (error) {
    next(error)
  }
}

const deleteColumn = async (req, res, next) => {
  try {
    const deletedColumn = await columnService.deleteColumn(req.params.id)

    res.status(StatusCodes.OK).json(deletedColumn)
  } catch (error) {
    next(error)
  }
}

export const columnController = {
  createColumn,
  updateColumn,
  deleteColumn
}