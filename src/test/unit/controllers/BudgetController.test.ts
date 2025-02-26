import {createRequest, createResponse} from 'node-mocks-http'
import {budgets} from '../../mocks/budget'
import BudgetController from '../../../controllers/BudgetController'
import Budget from '../../../models/Budget'
import Expense from '../../../models/Expense'

//MOCKS
jest.mock('../../../models/Budget', () => ({
    findAll: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn()
}))

describe( 'BudgetController.getAll', () => {

    beforeEach( () => {
        (Budget.findAll as jest.Mock).mockImplementation( (options) => {
            const updatedBudget = budgets.filter( budget => budget.userId === options.where.userId);
            return Promise.resolve(updatedBudget)
        })
    })

    test('should retrieve 2 budgets for user by ID 1', async () => {

        const req = createRequest({
            method: 'GET',
            url: '/api/budgets',
            user: {id: 1}
        })

        const res = createResponse();
        await BudgetController.getAll(req, res)

        const data = res._getJSONData()
        expect(data).toHaveLength(2)
        expect(res.statusCode).toBe(200)
        expect(res.statusCode).not.toBe(404)

    })

    test('should retrieve 1 budget for user by ID 2', async () => {

        const req = createRequest({
            method: 'GET',
            url: '/api/budgets',
            user: {id: 2}
        })

        const res = createResponse();
        await BudgetController.getAll(req, res)

        const data = res._getJSONData()
        expect(data).toHaveLength(1)
        expect(res.statusCode).toBe(200)
        expect(res.statusCode).not.toBe(404)        
    })

    test('should retrieve 0 budgets for user by ID 10', async () => {

        const req = createRequest({
            method: 'GET',
            url: '/api/budgets',
            user: {id: 10}
        })

        const res = createResponse();
        await BudgetController.getAll(req, res)

        const data = res._getJSONData()
        expect(data).toHaveLength(0)
        expect(res.statusCode).toBe(200)
        expect(res.statusCode).not.toBe(404)        
    })

    //Comprueba el Catch
    test('Should handle errors when fetching budgets', async () => {
        const req = createRequest({
            method: 'GET',
            url: '/api/budgets',
            user: {id: 100}
        })
        const res = createResponse();

        (Budget.findAll as jest.Mock).mockRejectedValue(new Error);
        await BudgetController.getAll(req, res)

        expect(res.statusCode).toBe(500)
        expect(res._getJSONData()).toEqual({error: 'Hubo un error'})
    })
})

describe('BudgetController.create', () => {
    test('Should create a new budget and respond with statusCode 201', async () => {

        const mockBudget = {
            save: jest.fn().mockResolvedValue(true) //Method save para guardar en la base de datos
        };

        (Budget.create as jest.Mock).mockResolvedValue(mockBudget)

        const req = createRequest({
            method: 'POST',
            url: '/api/budgets',
            user: {id: 1},
            body: {name: 'presupuesto de prueba', amount: 300}
        })
        const res = createResponse();
        await BudgetController.create(req, res)

        const data = res._getJSONData()
        expect(res.statusCode).toBe(201)
        expect(data).toBe('Presupuesto creado correctamente')
        expect(mockBudget.save).toHaveBeenCalled()
        expect(mockBudget.save).toHaveBeenCalledTimes(1)
        expect(Budget.create).toHaveBeenCalledWith(req.body)
    })

    test('Should handle budget creation error', async () => {

        const mockBudget = {
            save: jest.fn()
        };

        (Budget.create as jest.Mock).mockRejectedValue(new Error)

        const req = createRequest({
            method: 'POST',
            url: '/api/budgets',
            user: {id: 1},
            body: {name: 'presupuesto de prueba', amount: 300}
        })
        const res = createResponse();
        await BudgetController.create(req, res)

        const data = res._getJSONData()
        expect(res.statusCode).toBe(500)
        expect(data).toEqual({error: 'Hubo un error'})
        expect(mockBudget.save).not.toHaveBeenCalled()
        expect(Budget.create).toHaveBeenCalledWith(req.body)
    })
})

describe('BudgetController.getById', () => {

    beforeEach( () => {
        (Budget.findByPk as jest.Mock).mockImplementation( id => {
            const budget = budgets.filter( b => b.id === id)[0]
            return Promise.resolve(budget)
        })
    })

    test('should return a budget with ID 1 and three expenses', async () => {
        const req = createRequest({
            method: 'GET',
            url: '/api/budgets/:id',
            budget: {id: 1}
        })
        const res = createResponse();
        await BudgetController.getById(req, res)

        const data = res._getJSONData()
        expect(res.statusCode).toBe(200)
        expect(data.expenses).toHaveLength(3)
        expect(Budget.findByPk).toHaveBeenCalled()
        expect(Budget.findByPk).toHaveBeenCalledTimes(1)
        expect(Budget.findByPk).toHaveBeenCalledWith(req.budget.id, {
            include: [Expense]
        })
    })

    test('should return a budget with ID 2 and two expenses', async () => {
        const req = createRequest({
            method: 'GET',
            url: '/api/budgets/:id',
            budget: {id: 2}
        })
        const res = createResponse();
        await BudgetController.getById(req, res)

        const data = res._getJSONData()
        expect(res.statusCode).toBe(200)
        expect(data.expenses).toHaveLength(2)
    })

    test('should return a budget with ID 3 and 0 expenses', async () => {
        const req = createRequest({
            method: 'GET',
            url: '/api/budgets/:id',
            budget: {id: 3}
        })
        const res = createResponse();
        await BudgetController.getById(req, res)

        const data = res._getJSONData()
        expect(res.statusCode).toBe(200)
        expect(data.expenses).toHaveLength(0)
    })
})

describe('BudgetController.updateById', () => {

    
    test('Should update the budget and return a success message', async () => {
        const mockBudget = {
            update: jest.fn().mockResolvedValue(true)
        };
        const req = createRequest({
            method: 'PUT',
            url: '/api/budgets/:id',
            budget: mockBudget,
            body: {name: 'presupuesto actualizado', amount: 2000}
        })
        const res = createResponse();
        await BudgetController.updateById(req, res)        

        const data = res._getJSONData()
        expect(res.statusCode).toBe(200)
        expect(data).toBe('Presupuesto actualizado correctamente')
        expect(mockBudget.update).toHaveBeenCalled()
        expect(mockBudget.update).toHaveBeenCalledTimes(1)
        expect(mockBudget.update).toHaveBeenCalledWith(req.body)
    })
})

describe('BudgetController.deleteById', () => {
    test('Should delete the budget and return a success message', async () => {
        const mockBudget = {
            destroy: jest.fn().mockResolvedValue(true)
        };

        const req = createRequest({
            method: 'DELETE',
            url: '/api/budgets/:id',
            budget: mockBudget
        })

        const res = createResponse();
        await BudgetController.deleteById(req, res)        

        const data = res._getJSONData()
        expect(res.statusCode).toBe(200)
        expect(data).toBe('Presupuesto Eliminado')
        expect(mockBudget.destroy).toHaveBeenCalled()
        expect(mockBudget.destroy).toHaveBeenCalledTimes(1)
    })
})