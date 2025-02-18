import colors from 'colors'
import { exit } from 'node:process'
import { db } from '../config/db'

export const clearDB = async () => {
    try {
        await db.sync({force: true})
        console.log(colors.green.bold('datos eliminados correctamente'))
    } catch (error) {
        //console.log(error)
        exit(1)
    }
}

if(process.argv[2] === '--clear') {
    clearDB()
}