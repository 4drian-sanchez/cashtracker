import {Sequelize} from 'sequelize-typescript'
import 'dotenv/config'

const db = new Sequelize( process.env.DB_URL, {
    dialectOptions : {
        ssl: { 
            require: false
        }
    }
})

export default db