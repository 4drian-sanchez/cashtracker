import { Router } from "express";
import BudgetController from "../controllers/BudgetController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middlewares/validation";
import { validateBudgetExists, validateId } from "../middlewares/budget";

const router = Router()

//GET ALL
router.get('/', BudgetController.getAll)

//CREATE
router.post('/',
    body('name')
        .notEmpty()
        .withMessage('El nombre no puede ir vácio'),
    
    body('amount')
        .notEmpty()
            .withMessage('El presupuesto no puede ir vácio')
        .custom( value => value > 0 )
            .withMessage('EL presupuesto debe ser mayor a 0')
        .isNumeric()
            .withMessage('EL presupuesto no es válido'),

    handleInputErrors,
    BudgetController.create
)

//GET BY ID
router.get('/:id', 
    validateId,
    validateBudgetExists,
    BudgetController.getById
)

//UPDATE
router.put('/:id', 
    validateId,
    body('name')
        .notEmpty()
        .withMessage('El nombre no puede ir vácio'),
    body('amount')
        .notEmpty()
            .withMessage('El presupuesto no puede ir vácio')
        .custom( value => value > 0 )
            .withMessage('EL presupuesto debe ser mayor a 0')
        .isNumeric()
            .withMessage('EL presupuesto no es válido'),
    validateBudgetExists,
    handleInputErrors,
    BudgetController.updateById
)

//DELETE
router.delete('/:id', 
    validateId,
    validateBudgetExists,
    BudgetController.deleteById
)


export default router