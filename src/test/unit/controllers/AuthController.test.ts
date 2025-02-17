import { createRequest, createResponse } from "node-mocks-http";
import User from "../../../models/User";
import AuthController from "../../../controllers/AuthController";
import { checkPassword, hashPassword } from "../../../utils/bcrypt";
import { generateToken } from "../../../utils/token";
import AuthEmail from "../../../emails/AuthEmail";
import { generateJWT } from "../../../utils/jwt";

jest.mock("../../../models/User")
jest.mock("../../../utils/bcrypt")
jest.mock("../../../utils/token")
jest.mock("../../../utils/jwt")

describe('AuthController.createAccount', () => {

    beforeEach( () => {
        jest.resetAllMocks()
    })

    it('should return a 409 status code and an error message if the email is already registered', async () => {
        (User.findOne as jest.Mock).mockResolvedValue(true)
        const req = createRequest({
            body: {
                email: 'test@test.com',
                password: 'password'
            }
        })

        const res = createResponse()

        await AuthController.createAccount(req, res)
        const data = res._getJSONData()

        expect(res.statusCode).toBe(409)
        expect(data).toEqual({error: 'El E-mail ya esta registrado'})
        expect(User.findOne).toHaveBeenCalled()
        expect(User.findOne).toHaveBeenCalledTimes(1)
    })

    it('should register a new user and return a success message', async () => {
        const req = createRequest({
            body: {
                email: 'test@test.com',
                password: 'password',
                name: 'adrian',
            }
        })
        const res = createResponse()

        const userMock = { ...req.body, save: jest.fn() };

        (User.create as jest.Mock).mockResolvedValue(userMock);
        (hashPassword as jest.Mock).mockResolvedValue('hashPassword');
        (generateToken as jest.Mock).mockReturnValue('123456')
        jest.spyOn(AuthEmail, 'emailConfirmationAccount').mockImplementation( () => Promise.resolve() )
        
        await AuthController.createAccount(req, res)

        expect(User.create).toHaveBeenCalledWith(req.body)
        expect(User.create).toHaveBeenCalledTimes(1)
        expect(userMock.save).toHaveBeenCalled()
        expect(userMock.password).toBe('hashPassword')
        expect(userMock.token).toBe('123456')
        expect(AuthEmail.emailConfirmationAccount).toHaveBeenCalledWith({
            name: req.body.name,
            email: req.body.email,
            token: '123456',
        })
        expect(res.statusCode).toBe(200)
    })
})

describe('AuthController.login', () => {
    
    it('should return 404 status if user is not found', async () => {
        (User.findOne as jest.Mock).mockResolvedValue(null)
        const req = createRequest({
            body: {
                email: 'test@test.com',
                password: 'password'
            }
        })
        const res = createResponse()

        await AuthController.login(req, res)
        const data = res._getJSONData()

        expect(res.statusCode).toBe(404)
        expect(data).toEqual({error: 'El usuario no existe'})
    })
    
    it('should return 403 status if the account has not been confirmed', async () => {
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            email: 'test@test.com',
            password: 'password',
            confirmed: false
        })
        const req = createRequest({
            body: {
                email: 'test@test.com',
                password: 'password'
            }
        })
        const res = createResponse()

        await AuthController.login(req, res)
        const data = res._getJSONData()

        expect(res.statusCode).toBe(403)
        expect(data).toEqual({error: 'El usuario no ha confirmado su cuenta'})
    })
    
    it('should return 401 status if the password is incorrect', async () => {

        const userMock = {
            id: 1,
            email: 'test@test.com',
            password: 'password',
            confirmed: true
        };

        const req = createRequest({
            body: {
                email: 'test@test.com',
                password: 'password'
            }
        })
        const res = createResponse();
        const fakeJWT = 'fakeJWT';

        (User.findOne as jest.Mock).mockResolvedValue(userMock);
        (checkPassword as jest.Mock).mockResolvedValue(true);
        (generateJWT as jest.Mock).mockReturnValue(fakeJWT);
        

        await AuthController.login(req, res)
        const data = res._getJSONData()

        expect(res.statusCode).toBe(200)
        expect(data).toEqual(fakeJWT)
        expect(generateJWT).toHaveBeenCalled()
        expect(generateJWT).toHaveBeenCalledWith(userMock.id)
    })
})