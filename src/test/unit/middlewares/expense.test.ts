import { createRequest, createResponse } from "node-mocks-http";
import Expense from "../../../models/Expense";
import { expenses } from "../../mocks/expenses";
import { validateExpenseExists } from "../../../middlewares/expenses";
import { budgets } from "../../mocks/budget";
import { hasAccess } from "../../../middlewares/budget";

jest.mock("../../../models/Expense", () => ({
    findByPk: jest.fn()
}))

describe(' middleware - validateExpeneExists', () => {

    beforeEach( () => {
        (Expense.findByPk as jest.Mock).mockImplementation( (id) => {
            const expense = expenses.filter( e => e.id === id)[0] ??  null
            return Promise.resolve(expense)
        })
    } )

    it('should handle a non-existent expense', async () => {
        const req = createRequest({
            params: {
                expenseId: 120
            }
        })
        const res = createResponse()
        const next = jest.fn()

        await validateExpenseExists(req, res, next)

        const data = res._getJSONData()
        
        expect(res.statusCode).toBe(404)
        expect(data).toEqual({error: 'El gasto no a sido encontrado'})
        expect(next).not.toHaveBeenCalled()
    })

    it('should handle a next middleware if expense exists', async () => {
        const req = createRequest({
            params: {
                expenseId: 1
            }
        })
        const res = createResponse()
        const next = jest.fn()

        await validateExpenseExists(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(next).toHaveBeenCalled()
        expect(next).toHaveBeenCalledTimes(1)
        expect(req.expense).toEqual(expenses[0])
    })

    it('should handle internal server errror', async () => {

        (Expense.findByPk as jest.Mock).mockRejectedValue(new Error)

        const req = createRequest({
            params: {
                expenseId: 1
            }
        })
        const res = createResponse()
        const next = jest.fn()

        await validateExpenseExists(req, res, next)
        const data = res._getJSONData()

        expect(res.statusCode).toBe(500)
        expect(data).toEqual({error: 'Hubo un error'})
        expect(next).not.toHaveBeenCalled()
    })

    it('should prevent unauthorized users from adding expenses', async () => {
        const req = createRequest({
            budget: budgets[0],
            user: {id: 20}
        })

        const res = createResponse()
        const next = jest.fn()
        hasAccess(req, res, next)

        expect(res.statusCode).toBe(401)
        expect(next).not.toHaveBeenCalled()
        expect(res._getJSONData()).toEqual({error: 'No tienes acceso para esta acción'})
    })
})