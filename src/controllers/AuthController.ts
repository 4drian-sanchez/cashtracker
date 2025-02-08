import { Request, Response } from "express";
import User from "../models/User";
import { checkPassword, hashPassword } from "../utils/bcrypt";
import { generateToken } from "../utils/token";
import AuthEmail from "../emails/AuthEmail";
import { generateJWT } from "../utils/jwt";

class AuthController {

    static createAccount = async (req: Request, res: Response) => {

        const { email, password } = req.body

        const userExists = await User.findOne({ where: { email } })
        if (userExists) {
            const error = new Error('El E-mail ya esta registrado')
            res.status(409).json({ error: error.message })
            return
        }

        try {
            const user = new User(req.body)
            user.password = await hashPassword(password)
            user.token = generateToken()

            await AuthEmail.emailConfirmationAccount({
                name: user.name,
                email: user.email,
                token: user.token
            })

            await user.save()
            res.json('usuario creado correctamente')

        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'hubo un error' })
        }
    }

    static confirmAccount = async (req: Request, res: Response) => {

        const { token } = req.body
        const user = await User.findOne({ where: { token } })

        if (!user) {
            const error = new Error('Token no válido')
            res.status(409).json({ error: error.message })
            return
        }

        user.confirmed = true
        user.token = null
        await user.save()
        res.status(200).json('Cuenta confirmada')
    }

    static login = async (req: Request, res: Response) => {

        const { email, password } = req.body

        const user = await User.findOne({ where: { email } })
        if (!user) {
            const error = new Error('El usuario no existe')
            res.status(404).json({ error: error.message })
            return
        }

        if(!user.confirmed) {
            const error = new Error('El usuario no ha confirmado su cuenta')
            res.status(403).json({ error: error.message })
            return
        }

        const isPasswordCorrect = await checkPassword(password, user.password)
        if(!isPasswordCorrect) {
            const error = new Error('Contraseña incorrecta')
            res.status(401).json({ error: error.message })
            return
        }
        
        const jwt = generateJWT(user.id)
        res.json(jwt)
    }

    static forgotPassword = async (req: Request, res: Response) => {
        
        const { email } = req.body

        const user = await User.findOne({ where: { email } })
        if (!user) {
            const error = new Error('El usuario no existe')
            res.status(404).json({ error: error.message })
            return
        }

        user.token = generateToken()
        await user.save()

        await AuthEmail.forgotPassword({
            name: user.name,
            email: user.email,
            token: user.token
        })

        res.status(200).json('Revisa tu correo para ver las instrucciones')
    }

    static validateToken = async (req: Request, res: Response) => { 
        const {token} = req.body

        const tokenExists = await User.findOne({where: {token}})
        if(!tokenExists) {
            const error = new Error('El token no es válido')
            res.status(404).json({error: error.message})
            return
        }
        res.json('el token existe!!!')
    }

    static changePasswordWithToken = async (req: Request, res: Response) => {
        const {token} = req.params
        const {password} = req.body

        const user = await User.findOne({where: {token}})
        if(!user) {
            const error = new Error('El token no es válido')
            res.status(404).json({error: error.message})
            return
        }

        user.token = null
        user.password = await hashPassword(password)
        await user.save()
        res.status(200).json('Cambia restablacida correctamente')
    }
}

export default AuthController