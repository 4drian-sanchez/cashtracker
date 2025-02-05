import {Sequelize} from 'sequelize-typescript'
import 'dotenv/config'

const db = new Sequelize( process.env.DB_URL, {
    models: [
        __dirname + '/../models/**'
    ],
    dialectOptions : {
        ssl: { 
            require: false
        }
    }
})

export default db