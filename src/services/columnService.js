import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { columnModel } from '~/models/columnModel'
import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'

const createColumn = async (req) => {
  try {
    const column = {
      ...req
    }

    const createdColumn = await columnModel.createColumn(column)
    const getNewColumn = await columnModel.findOneById(createdColumn.insertedId)

    if (getNewColumn) {
      getNewColumn.card = []

      await boardModel.pushColIdToBoard(getNewColumn)
    }

    return getNewColumn
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Fail to create new column')
  }
}

const updateColumn = async (id, data) => {
  try {
    const updateColumn = {
      ...data,
      updatedAt: Date.now()
    }

    return await columnModel.updateColumn(id, updateColumn)
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Fail to update column')
  }
}

const deleteColumn = async (id) => {
  try {
    const column = await columnModel.findOneById(id)
    if (!column) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found')
    }
    //Delete cards inside column
    await cardModel.deleteManyByColumnId(id)

    //Remove columnId from board's columnOrderIds array
    await boardModel.pullColIdFromBoard(column)

    //Delete column
    await columnModel.deleteOneById(id)

    return { deleteResult: 'Column and cards inside deleted successfully' }
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Fail to delete column')
  }
}

export const columnService = {
  createColumn,
  updateColumn,
  deleteColumn
}