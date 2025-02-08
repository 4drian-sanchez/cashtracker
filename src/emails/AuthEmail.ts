import { transport } from "../config/nodemailer"

type EmailConfirmationType = {
    name: string
    email: string
    token: string
}

class AuthEmail {
    static emailConfirmationAccount = async (user: EmailConfirmationType) => {
        await transport.sendMail({
            from: 'CashTracker <admin@cashtrackr.com>',
            to: user.email,
            subject: 'cashTrackr - Confirma tu cuenta',
            html: `
                <p>Hola ${user.name}, has creado tu cuenta en CashTracker, ya esta casi lista</p>
                <p>Visita el siguiente enlace</p>
                <a href="#">Confirmar cuenta</a>
                <p>e Ingresa el siguiente código: <b>${user.token}</b></p>
            `
        })
    }
    static forgotPassword = async (user: EmailConfirmationType) => {
        await transport.sendMail({
            from: 'CashTracker <admin@cashtrackr.com>',
            to: user.email,
            subject: 'cashTrackr - Confirma tu cuenta',
            html: `
                <p>Hola ${user.name}, has solicitado cambiar tu contraseña, ya esta casi listo</p>
                <p>Visita el siguiente enlace</p>
                <a href="#">Cambiar contraseña</a>
                <p>E Ingresa el siguiente código: <b>${user.token}</b></p>
            `
        })
    }
}

export default AuthEmail