import express from 'express' 
import morgan from 'morgan'
import budgerRoutes from './routes/BudgetRoutes'
import AuthRoutes from './routes/AuthRoutes'
import connectDB from './config/db'
import 'dotenv/config'

//Conexion a la base de datos
connectDB()

const app = express()

app.use(morgan('dev'))

app.use(express.json())

app.use( '/api/budgets', budgerRoutes)
app.use( '/api/auth', AuthRoutes)

export default app