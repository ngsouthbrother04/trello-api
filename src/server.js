/* eslint-disable no-console */
import express from 'express'
import cors from 'cors'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import exitHook from 'async-exit-hook'
import { env } from '~/config/environment'
import { APIs_V1 } from '~/routes/v1/index'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'
import { corsOptions } from './config/cors'
import cookieParser from 'cookie-parser'
import socketIO from 'socket.io'
import http from 'http'
import { invitationUserToBoardSocket } from './sockets/invitationUserToBoardSocket'

/** Các thuộc tính của req trong Express
 * Body: req.body
 * Params: req.params
 * Query: req.query
 * Headers: req.headers
 * Cookies: req.cookies
 * File: req.file | req.files (đối với upload file)
 */

const START_SERVER = () => {
  const app = express()

  //Disable cache for all responses
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  app.use(cookieParser())

  app.use(cors(corsOptions))

  app.use(express.json())

  app.use('/v1', APIs_V1)

  app.use(errorHandlingMiddleware)

  const server = http.createServer(app)

  //Khởi tạo io với server và CORS
  const io = socketIO(server, {
    cors: corsOptions
  })

  io.on('connection', (socket) => {
    invitationUserToBoardSocket(socket)
  })

  //Dùng server.listen thay vì app.listen vì đã bọc app vào http và đã tích hợp socket.io
  if (env.BUILD_MODE === 'production') {
    server.listen(process.env.PORT, () => {
      console.log(`Running at port: ${process.env.PORT}/`)
    })
  } else {
    server.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
      console.log(`Running at ${env.LOCAL_DEV_APP_HOST}:${env.LOCAL_DEV_APP_PORT}/`)
    })
  }

  //Cleanup before stopping the server
  exitHook(() => {
    CLOSE_DB()
    console.log('Exited app...')
  })
}

(async () => {
  try {
    await CONNECT_DB()
    START_SERVER()
  } catch (error) {
    console.error('Failed to connect to the database:', error)
    process.exit(0)
  }
})()