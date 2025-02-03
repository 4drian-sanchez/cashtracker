import 'dotenv/config'
import express from 'express' 
import colors from 'colors'
import morgan from 'morgan'
import db from './config/db'

const connectDB = async () => {
    try {
        await db.authenticate()
        db.sync()
        console.log(colors.cyan.bold('base de datos conectada'))
    } catch (error) {
        //console.log(error)
        console.log(colors.cyan.bold('Falló la conexión a la datos conectada'))
    }
}
connectDB()

const app = express()

app.use(morgan('dev'))

app.use(express.json())



export default app