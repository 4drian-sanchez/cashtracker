import { createRequest, createResponse } from 'node-mocks-http'
import Expense from '../../../models/Expense'
import { ExpensesController } from '../../../controllers/ExpenseController'
import Budget from '../../../models/Budget'
import { expenses } from '../../mocks/expenses'

jest.mock( '../../../models/Expense', () => ({
    create: jest.fn()
}))

describe('expenseController.create', () => {
    it('should create a new expense', async () => {
        const expenseMock = {
            save: jest.fn().mockResolvedValue(true)
        };
        (Expense.create as jest.Mock).mockResolvedValue(expenseMock)

        const req = createRequest({
            method: 'POST',
            url: '/api/budgets/:budgetId/expenses',
            body: {name: 'nuevo gasto', amount: 500},
            budget: {id: 1}
        })
        const res = createResponse()

        await ExpensesController.create(req, res)

        const data = res._getJSONData()
        expect(res.statusCode).toBe(201)
        expect(data).toEqual('Gasto creado correctamente')
        expect(expenseMock.save).toHaveBeenCalled()
        expect(expenseMock.save).toHaveBeenCalledTimes(1)
        expect(Expense.create).toHaveBeenCalledWith(req.body)
    })

    it('should handle expense creation error', async () => {
        const expenseMock = {
            save: jest.fn()
        };
        (Expense.create as jest.Mock).mockRejectedValue(new Error)

        const req = createRequest({
            method: 'POST',
            url: '/api/budgets/:budgetId/expenses',
            body: {name: 'nuevo gasto', amount: 500},
            budget: {id: 1}
        })
        const res = createResponse()

        await ExpensesController.create(req, res)

        const data = res._getJSONData()
        expect(res.statusCode).toBe(500)
        expect(data).toEqual({error: 'Hubo un error'})
        expect(expenseMock.save).not.toHaveBeenCalled()
        expect(Expense.create).toHaveBeenCalledWith(req.body)
    })
})

describe('expenseController.getById', () => {
    it('should return expense with ID 1', async () => {
        const req = createRequest({
            method: 'GET',
            url: '/api/budgets/:budgetId/expenses/expenseID',
            expense: expenses[0]
        })
        const res = createResponse()
        await ExpensesController.getById(req, res)
        
        const data = res._getJSONData()
        expect(res.statusCode).toBe(200)
        expect(data).toEqual(expenses[0])
    })
})

describe('expenseController.updateById', () => { 
    it('Should handle expense updated', async () => {

        const expenseMock = {
            ...expenses[0],
            update: jest.fn()
        }

        const req = createRequest({
            method: 'PUT',
            url: '/api/budgets/:budgetId/expenses/expenseId',
            expense: expenseMock,
            body: {name: 'expense updated', amount: 3999}
        })
        const res = createResponse()
        await ExpensesController.updateById(req, res)
        
        const data = res._getJSONData()
        expect(res.statusCode).toBe(200)
    })
})
