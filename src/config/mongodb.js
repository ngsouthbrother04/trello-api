import { MongoClient, ServerApiVersion } from 'mongodb'
import { env } from '~/config/environment'

let trelloDB = null

const MongoClientInstance = new MongoClient(env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

export const CONNECT_DB = async () => {
  await MongoClientInstance.connect()

  trelloDB = MongoClientInstance.db(env.DATABASE_NAME)
}

export const GET_DB = () => {
  if (!trelloDB) {
    throw new Error('Database not connected. Please call CONNECT_DB first.')
  }

  return trelloDB
}

export const CLOSE_DB = async () => {
  await MongoClientInstance.close()
}