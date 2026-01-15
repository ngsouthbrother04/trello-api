import express from 'express'
import { cardValidation } from '~/validations/cardValidation'
import { cardController } from '~/controllers/cardController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/')
  .post(authMiddleware.isAuthorized, cardValidation.createCard, cardController.createCard)

export const cardRoute = Router