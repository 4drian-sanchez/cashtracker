import request from 'supertest'
import server from '../../server'
import connectDB, { db } from '../../config/db'
import AuthController from '../../controllers/AuthController'
import User from '../../models/User'
import * as passwordUtils from '../../utils/bcrypt'
import * as jwtUtils from '../../utils/jwt'

beforeAll( async () => {
    await connectDB()
})

afterAll(async () => {
    // Cierra la conexión de Sequelize
    await db.close();
  });

describe('Authentication - Create account', () => {
    it('should display validation errors when form is mepty', async () => {
        const response = await request(server)
                                .post('/api/auth/create-account')
                                .send({})

        const createAccountMock = jest.spyOn(AuthController, 'createAccount')        

        expect(response.statusCode).toBe(400)                              
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(3)
        
        expect(response.statusCode).not.toBe(200)
        expect(response.body.errors).not.toHaveLength(2)
        expect(createAccountMock).not.toHaveBeenCalled()

    })

    it('should return 400 status code when the password is less than 8 characters', async () => {
        const response = await request(server)
                                .post('/api/auth/create-account')
                                .send({
                                    name: 'adrian',
                                    password: 'short',
                                    email: 'test@test.com'
                                })

        const createAccountMock = jest.spyOn(AuthController, 'createAccount')        

        expect(response.statusCode).toBe(400)                              
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(1)
        
        expect(response.statusCode).not.toBe(200)
        expect(response.body.errors).not.toHaveLength(2)
        expect(createAccountMock).not.toHaveBeenCalled()
    })

    it('should register a new user successfully', async () => {
        const response = await request(server)
                                .post('/api/auth/create-account')
                                .send({
                                    name: 'test name',
                                    password: 'password',
                                    email: 'test@test.com'
                                })

        expect(response.statusCode).toBe(201)  
        expect(response.body).not.toHaveProperty('errors')
        expect(response.statusCode).not.toBe(400)
    })

    it('should return 409 confict when a user is already registered', async () => {
        const response = await request(server)
                                .post('/api/auth/create-account')
                                .send({
                                    name: 'test name',
                                    password: 'password',
                                    email: 'test@test.com'
                                })

        expect(response.statusCode).toBe(409)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('El E-mail ya esta registrado')
        
        expect(response.statusCode).not.toBe(201)
        expect(response.statusCode).not.toBe(400)
        expect(response.body).not.toHaveProperty('errors')
    })
})

describe('Authentication - Account confirmation with token or invalid', () => {

    it('should display error if token is empty', async () => {
        const response = await request(server)
                .post('/api/auth/confirm-account')
                .send({token: 'invalid_token'})
        
        expect(response.status).toBe(400)
        expect(response.status).not.toBe(200)

        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(1)
        expect(response.body.errors[0].msg).toBe('El token no es válido')
    })

    it('should display error if token doesnt exists', async () => {
        const response = await request(server)
                .post('/api/auth/confirm-account')
                .send({token: "123456"})
        
        expect(response.status).toBe(409)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('Token no válido')
        expect(response.status).not.toBe(200)
    })

    it('should confirmation with a valid token', async () => {
        const token = globalThis.cashTrackrConfirmationToken
        const response = await request(server)
                .post('/api/auth/confirm-account')
                .send({token})
        
        expect(response.status).toBe(200)
        expect(response.status).not.toBe(409)
        expect(response.body).toEqual('Cuenta confirmada')

    })
})

describe('Authentication - login', () => {

    beforeEach(() => {
        jest.clearAllMocks()
    }) 

    it('should display validation errors when the form is empty', async () => {
        const response = await request(server)
                            .post('/api/auth/login')
                            .send({})
        const loginMock = jest.spyOn(AuthController, 'login')

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(2)
        
        expect(response.body.errors).not.toHaveLength(1)
        expect(loginMock).not.toHaveBeenCalled()
    })

    it('should return a error when user not exists', async () => {
        const response = await request(server)
                            .post('/api/auth/login')
                            .send({
                                email: 'user@test.com',
                                password: 'password'
                            })

        expect(response.status).toBe(404)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('El usuario no existe')
        
        expect(response.status).not.toBe(200)
    })

    it('should return a 404 error if the user acount is not confirmed', async () => {
        (jest.spyOn(User, 'findOne') as jest.Mock).mockResolvedValue({
            id: 1,
            confirmed: false,
            name: 'user test',
            email: 'user@gmail.com',
        })

        const response = await request(server)
                            .post('/api/auth/login')
                            .send({
                                email: 'user@gmail.com',
                                password: 'passwordt',
                            })

        expect(response.status).toBe(403)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('El usuario no ha confirmado su cuenta')
        expect(response.status).not.toBe(200)
    })

    it('should return a 404 error if the user acount is not confirmed 2', async () => {
        const user = await request(server)
                            .post('/api/auth/create-account')
                            .send({
                                name: "test",
                                email: 'user@gmail.com',
                                password: 'password',
                            })

        const response = await request(server)
                            .post('/api/auth/login')
                            .send({
                                email: 'user@gmail.com',
                                password: 'password',
                            })

        expect(response.status).toBe(403)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('El usuario no ha confirmado su cuenta')
        expect(response.status).not.toBe(200)
    })

    it('should return a 404 error if the user has the incorrect password', async () => {
        const findOne = (jest.spyOn(User, 'findOne') as jest.Mock).mockResolvedValue({
            id: 1,
            confirmed: true,
            name: 'user test',
            email: 'user@gmail.com'
        })

        const comparePassword = (jest.spyOn(passwordUtils, 'checkPassword') as jest.Mock).mockResolvedValue(false)

        const response = await request(server)
                            .post('/api/auth/login')
                            .send({
                                email: 'user@gmail.com',
                                password: 'password',
                            })

        expect(response.status).toBe(401)
        expect(response.body).toEqual({error: "Contraseña incorrecta"})
        expect(response.body.error).toBe('Contraseña incorrecta')
        expect(response.status).not.toBe(200)
        expect(response.status).not.toBe(403)

        expect(findOne).toHaveBeenCalledTimes(1)
        expect(comparePassword).toHaveBeenCalledTimes(1)
    })

    it('should return a 200 with JWT and success login', async () => {
        const findOne = (jest.spyOn(User, 'findOne') as jest.Mock).mockResolvedValue({
            id: 1,
            confirmed: true,
            name: 'user test',
            email: 'user@gmail.com',
            password: 'password'
        })

        const comparePassword = (jest.spyOn(passwordUtils, 'checkPassword') as jest.Mock).mockResolvedValue(true)
        const generateJWT = (jest.spyOn(jwtUtils, 'generateJWT') as jest.Mock).mockReturnValue('JWT_token')

        const response = await request(server)
                            .post('/api/auth/login')
                            .send({
                                email: 'user@gmail.com',
                                password: 'password',
                            })

        expect(response.status).toBe(200)
        expect(response.body).toEqual('JWT_token')
        expect(generateJWT).toHaveBeenCalledWith(1)
        
        expect(generateJWT).toHaveBeenCalledTimes(1)
        expect(findOne).toHaveBeenCalledTimes(1)
        expect(comparePassword).toHaveBeenCalledTimes(1)
        expect(comparePassword).toHaveBeenCalledWith('password', 'password')

    })
})

let jwt : string

async function authenticateUser () {
    const response = await request(server).post('/api/auth/login').send({
        "email": "test@test.com",
        "password": "password"
    })
    expect(response.status).toBe(200)
    jwt = response.body
}

describe('GET /api/budgets', () => {

    beforeAll(() => {
        jest.restoreAllMocks()
    })

    beforeAll( async () => {
        await authenticateUser()
    })

    it('should reject unauthenticated access to budgets without a jwt', async () => {
        const response = await request(server).get('/api/budgets')

        expect(response.status).toBe(404)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toEqual('El bearer no es válido')
    })

    it('should reject authenticated access to invalid jwt', async () => {
        const response = await request(server)
                                .get('/api/budgets')
                                .auth('not_valid', {type: 'bearer'})

        expect(response.status).toBe(500)
        expect(response.body).toEqual('jwt malformed')
    })

    it('should allow autheticated accesss to budget with a valid JWT', async () => {
        const response = await request(server)
                                    .get('/api/budgets')
                                    .auth(jwt, {type: 'bearer'})

        expect(response.status).toBe(200)                            
        expect(response.status).not.toBe(404)
        expect(response.body).not.toHaveProperty('error')
    })
})

describe('POST /api/budgets', () => {
    beforeAll(() => {
        jest.restoreAllMocks()
    })

    beforeAll( async () => {
        await authenticateUser()
    })


    it('should reject unauthenticated access to post method budgets without a jwt', async () => {
        const response = await request(server).get('/api/budgets')

        expect(response.status).toBe(404)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toEqual('El bearer no es válido')
    })

    it('should return two errors messages when the form is empty', async () => {
        const response = await request(server).post('/api/budgets').auth(jwt, {type: 'bearer'}).send({})

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.status).not.toBe(201)
    })

    it('should return a success message with new budget', async () => {
        const response = await request(server).post('/api/budgets').auth(jwt, {type: 'bearer'}).send({
            name: 'presupuesto de prueba',
            amount: 300
        })

        expect(response.status).toBe(201)
        expect(response.body).not.toHaveProperty('errors')
        expect(response.status).not.toBe(400)
    })
})

describe('GET /api/budgets:id', () => {

    beforeAll( async () => {
        await authenticateUser()
    })

    it('should reject unauthenticated access to post method budget without a jwt', async () => {
        const response = await request(server).get('/api/budgets/1')
        expect(response.status).toBe(404)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toEqual('El bearer no es válido')
    })
    

    it('should return error message when the ID is not valid', async () => {
        const response = await request(server).get('/api/budgets/not-valid').auth(jwt, {type: 'bearer'})

        expect(response.status).toBe(400)
        expect(response.body.errors).toBeDefined()
        expect(response.body.errors).toHaveLength(2)
        
        expect(response.status).not.toBe(200)
    })

    it('should return error message when the budget not exists', async () => {
        const response = await request(server).get('/api/budgets/100').auth(jwt, {type: 'bearer'})

        expect(response.status).toBe(404)
        expect(response.body.error).toBeDefined()
        expect(response.body.error).toEqual("El presupuesto no a sido encontrado")
        
        expect(response.status).not.toBe(200)
    })

    it('should get budget by id', async () => {
        const response = await request(server).get('/api/budgets/1').auth(jwt, {type: 'bearer'})

        expect(response.status).toBe(200) 
        expect(response.status).not.toBe(404)
        expect(response.status).not.toBe(400)
    })
})

describe('PUT /api/budgets:id', () => {

    beforeAll( async () => {
        await authenticateUser()
    })

    it('should reject unauthenticated access to put method budget without a jwt', async () => {
        const response = await request(server).put('/api/budgets/1')
        expect(response.status).toBe(404)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toEqual('El bearer no es válido')
    })

    it('should return a 400 bad request when the form is empty', async () => {
        const response = await request(server).put('/api/budgets/1').auth(jwt, {type: 'bearer'}).send({})

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(4)
        expect(response.status).not.toBe(200)
    })

    it('should return a success message with the updated budget', async () => {
        const response = await request(server).put('/api/budgets/1').auth(jwt, {type: 'bearer'}).send({
            name: 'update budget',
            amount: '333'
        })

        expect(response.status).toBe(200)
        expect(response.body).toEqual("Presupuesto actualizado correctamente")
        
        expect(response.body.error).not.toBeDefined()
        expect(response.status).not.toBe(400)
    })
    
})

describe('DELETE - /api/budgets:id', () => {

    beforeAll( async () => {
        await authenticateUser()
    })

    it('should reject unauthenticated access to put method budget without a jwt', async () => {
        const response = await request(server).delete('/api/budgets/1')
        expect(response.status).toBe(404)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toEqual('El bearer no es válido')
    })

    it('should return error message when the budget does not existent', async () => {
        const response = await request(server).delete('/api/budgets/100').auth(jwt, {type: 'bearer'})
        expect(response.status).toBe(404)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toEqual("El presupuesto no a sido encontrado")
    })

    it('should delete the budget', async () => {
        const response = await request(server).delete('/api/budgets/1').auth(jwt, {type: 'bearer'})
        expect(response.status).toBe(200)
        expect(response.body).toEqual("Presupuesto Eliminado")
    })
})