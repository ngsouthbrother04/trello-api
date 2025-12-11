import express from 'express'
import { boardValidation } from '~/validations/boardValidation'
import { boardController } from '~/controllers/boardController'

const Router = express.Router()

Router.route('/')
  .get(boardController.getListBoards)
  .post(boardValidation.createBoard, boardController.createBoard)

//API để di chuyển card giữa các column trong cùng một board
Router.route('/supports/moving-card')
  .put(boardValidation.movingCardBetweenColumns, boardController.movingCardBetweenColumns)

Router.route('/:id')
  .get(boardController.getDetails)
  .put(boardValidation.updateBoard, boardController.updateBoard) //Update columnOrderIds when moving column inside board

export const boardRoute = Router