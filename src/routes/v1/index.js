import express from 'express'
import { boardRoute } from '~/routes/v1/boardRoute.js'
import { columnRoute } from '~/routes/v1/columnRoute.js'
import { cardRoute } from '~/routes/v1/cardRoute.js'
import { userRoute } from '~/routes/v1/userRoute.js'
import { invitationRoute } from '~/routes/v1/invitationRoute.js'

const Router = express.Router()

Router.use('/boards', boardRoute)
Router.use('/columns', columnRoute)
Router.use('/cards', cardRoute)
Router.use('/users', userRoute)
Router.use('/invitations', invitationRoute)

export const APIs_V1 = Router