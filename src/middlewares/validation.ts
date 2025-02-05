import { Request, Response, NextFunction } from 'express'
import { body, validationResult } from 'express-validator'


export const validateBudgetsInput = async (req: Request, res: Response, next: NextFunction) => {

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


export const handleInputErrors = (req: Request, res: Response, next: NextFunction) => {

    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return
    }
    
    next()

}