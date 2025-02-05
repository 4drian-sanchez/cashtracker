import { Request, Response, NextFunction } from "express";
import { param, validationResult } from "express-validator";
import Budget from "../models/Budget";

export const validateId = async (req: Request, res: Response, next: NextFunction) => {
    
    await param('budgetId')
        .isInt()
            .withMessage('ID no válido')
        .custom( value => value > 0 )
            .withMessage('EL presupuesto debe ser mayor a 0')
        .run(req)
    
    let errors = validationResult(req)

    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return
    }
    
    next()
}

declare global {
    namespace Express {
        interface Request {
            budget?: Budget
        }
    }
}

export const validateBudgetExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { budgetId } = req.params
        const budget = await Budget.findByPk(budgetId)

        if(!budget) {
            const error = new Error('El presupuesto no a sido encontrado')
            res.status(404).json({error: error.message})
            return
        }

        req.budget = budget

    } catch (error) {
        //console.log(error)
        res.status(500).json({error: 'Hubo un error'})
    }finally {
        next()
    }
}