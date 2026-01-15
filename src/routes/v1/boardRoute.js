import express from 'express'
import { boardValidation } from '~/validations/boardValidation'
import { boardController } from '~/controllers/boardController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/')
  .get(authMiddleware.isAuthorized, boardController.getListBoards)
  .post(authMiddleware.isAuthorized, boardValidation.createBoard, boardController.createBoard)

//API để di chuyển card giữa các column trong cùng một board
Router.route('/supports/moving-card')
  .put(authMiddleware.isAuthorized, boardValidation.movingCardBetweenColumns, boardController.movingCardBetweenColumns)

Router.route('/:id')
  .get(authMiddleware.isAuthorized, boardController.getDetails)
  .put(authMiddleware.isAuthorized, boardValidation.updateBoard, boardController.updateBoard) //Update columnOrderIds when moving column inside board

export const boardRoute = Router