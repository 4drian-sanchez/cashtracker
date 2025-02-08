import { Request, Response, NextFunction } from 'express'
import { body, param, validationResult } from 'express-validator'
import Expense from '../models/Expense'


export const validateExpenseId = async (req: Request, res: Response, next: NextFunction) => {
    
    await param('expenseId')
        .isInt()
            .withMessage('ID no válido')
        .custom( value => value > 0 )
            .withMessage('ID no válido')
        .run(req)
    
    let errors = validationResult(req)

    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return
    }
    
    next()
}

export const validateExpensesInput = async (req: Request, res: Response, next: NextFunction) => {

    await body('name')
        .notEmpty().withMessage('El nombre no puede ir vácio')
        .run(req)

    await body('amount')
        .notEmpty().withMessage('El presupuesto no puede ir vácio')
        .custom(value => value > 0).withMessage('EL presupuesto debe ser mayor a 0')
        .isNumeric().withMessage('EL presupuesto no es válido')
        .run(req)

    next()

}

declare global {
    namespace Express {
        interface Request {
            expense?: Expense
        }
    }
}

export const validateExpenseExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { expenseId } = req.params
        const expense = await Expense.findByPk(expenseId)

        if(!expense) {
            const error = new Error('El gasto no a sido encontrado')
            res.status(404).json({error: error.message})
            return
        }

        req.expense = expense

    } catch (error) {
        //console.log(error)
        res.status(500).json({error: 'Hubo un error'})
    }finally {
        next()
    }
}
