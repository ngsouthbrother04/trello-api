import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { slugify } from '~/utils/formatter'
import { boardModel } from '~/models/boardModel'
import { ObjectId } from 'mongodb'
import { cloneDeep } from 'lodash'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import { DEFAULT_PAGE, DEFAULT_ITEMS_PER_PAGE } from '~/utils/constants'

const createBoard = async (userId, reqBody) => {
  try {
    const board = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    const createdBoard = await boardModel.createBoard(userId, board)

    return await boardModel.findOneById(createdBoard.insertedId)
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Fail to create new board')
  }
}

const getDetails = async (userId, boardId) => {
  try {
    if (!ObjectId.isValid(boardId)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid board id')
    }

    const board = await boardModel.getDetails(userId, boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Cannot find board with given id')
    }

    const responseBoard = cloneDeep(board)

    responseBoard.columns.forEach(col => {
      //equals là phương thức so sánh ObjectId của mongodb
      col.cards = responseBoard.cards.filter(card => card.columnId.equals(col._id))
    })

    delete responseBoard.cards

    return responseBoard
  } catch (error) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Cannot find board with given id')
  }
}

const getBoards = async (userId, page, itemsPerPage, queryFilters) => {
  try {
    if (!page) page = DEFAULT_PAGE
    if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE

    return await boardModel.getBoards(userId, parseInt(page, 10), parseInt(itemsPerPage, 10), queryFilters)
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Fail to get list boards')
  }
}

const updateBoard = async (id, data) => {
  try {
    const updateBoard = {
      ...data,
      slug: data.title ? slugify(data.title) : undefined,
      updatedAt: Date.now()
    }

    const updatedBoard = await boardModel.updateBoard(id, updateBoard)

    return updatedBoard
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Fail to update board')
  }
}

const movingCardBetweenColumns = async (reqBody) => {
  try {
    // B1: Cập nhật mảng cardOrderIds của Column ban đầu chứa nó (Hiểu bản chất là xóa _id của Card ra khỏi mảng)
    await columnModel.updateColumn(reqBody.prevColumnId, {
      cardOrderIds: reqBody.prevCardOrderIds || [],
      updatedAt: Date.now()
    })

    // B2: Cập nhật mảng cardOrderIds của Column tiếp theo (Hiểu bản chất là thêm _id của Card vào mảng)
    await columnModel.updateColumn(reqBody.nextColumnId, {
      cardOrderIds: reqBody.nextCardOrderIds || [],
      updatedAt: Date.now()
    })

    // B3: Câp nhật lại trường columnId mới của cái Card đã kéo
    await cardModel.updateCard(reqBody.currCardId, {
      columnId: reqBody.nextColumnId,
      updatedAt: Date.now()
    })

    return { updateResult: 'success' }
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, `Fail to move card between columns: ${error.message}`)
  }
}

export const boardService = {
  createBoard,
  getDetails,
  getBoards,
  updateBoard,
  movingCardBetweenColumns
}