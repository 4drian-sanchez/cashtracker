import Router from 'express'
import AuthController from '../controllers/AuthController'
import { body, param } from 'express-validator'
import { handleInputErrors } from '../middlewares/validation'
import { limiter } from '../config/limit'
import { authenticate } from '../middlewares/auth'

const router = Router()

//RATE LIMITING
router.use(limiter)

router.post('/create-account',
    body('name')
        .notEmpty().withMessage('El nombre no puede ir vacio'),
    body('email')
        .isEmail().withMessage('El E-mail no es válido'),
    body('password')
        .isLength({ min: 8 }).withMessage('La contraseña debe tener mínimo 8 carácteres'),
    handleInputErrors,
    AuthController.createAccount
)

router.post('/confirm-account',
    body('token')
        .isLength({ min: 6, max: 6 })
        .withMessage('El token no es válido'),
    handleInputErrors,
    AuthController.confirmAccount
)

router.post('/login',
    body('email')
        .isEmail().withMessage('El E-mail no es válido'),
    body('password')
        .notEmpty().withMessage('La contraseña no puede ir vacia'),
    handleInputErrors,
    AuthController.login
)

router.post('/forgot-password',
    body('email')
        .isEmail().withMessage('El E-mail no es válido'),
    handleInputErrors,
    AuthController.forgotPassword
)

router.post('/validate-token',
    body('token')
        .notEmpty().withMessage('Ingresa un token'),
    handleInputErrors,
    AuthController.validateToken
)

router.post('/reset-password/:token',
    param('token')
        .notEmpty().withMessage('Ingresa un token'),
    body('password')
        .isLength({ min: 8 }).withMessage('La contraseña debe tener mínimo 8 carácteres'),
    handleInputErrors,
    AuthController.changePasswordWithToken
)

router.get('/user', 
    authenticate,
    AuthController.getUser
)

router.post('/update-password',
    authenticate,
    body('current_password')
        .notEmpty().withMessage('La contraseña debe tener mínimo 8 carácteres'),
    body('password')
        .isLength({ min: 8 }).withMessage('La contraseña debe tener mínimo 8 carácteres'),
    handleInputErrors,
    AuthController.updateCurrentUserPassword
)

router.post('/check-password',
    authenticate,
    body('password')
        .notEmpty().withMessage('La contraseña no puede ir vacia'),
    handleInputErrors,
    AuthController.checkPassword
)

export default router