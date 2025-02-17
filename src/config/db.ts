import { Sequelize } from 'sequelize-typescript'
import 'dotenv/config'

// Configuración de la conexión 
//TODO: Se debe modificar algunas propiedades cuando pase a produccion
export const db = new Sequelize({
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    logging: process.env.NODE_ENV === 'development' 
    ? (msg) => console.log(`[Sequelize] ${msg}`) // Solo log en desarrollo
    : false, // Desactivado en producción y test,
    dialect: 'postgres',
    models: [
        __dirname + '/../models/**'
    ],
    dialectOptions: {}
});

const connectDB = async () => {
    try {
        await db.authenticate()
        await db.sync()
        //console.log(colors.cyan.bold('base de datos conectada'))
    } catch (error) {
        //console.log(error)
        //console.log(colors.red.bold('Falló la conexión a la base de datos'))
    }
}

export default connectDB