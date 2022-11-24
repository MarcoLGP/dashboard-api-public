import { MongoClient } from "mongodb"
import * as dotenv from "dotenv"
dotenv.config()

const uri = process.env.MONGODB_URI
const mongoClient = await new MongoClient(uri).connect()
const db = mongoClient.db('db_dashboard')

export {
    db
}
