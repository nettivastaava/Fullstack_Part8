require('dotenv').config()

let MONGO_URL = process.env.MONGO_URL

module.exports = {
    MONGO_URL,
}