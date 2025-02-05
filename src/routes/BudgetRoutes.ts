import { Router } from "express";
import BudgetController from "../controllers/BudgetController";
import { body, param } from "express-validator";
import { handleInputErrors, validateBudgetsInput } from "../middlewares/validation";
import { validateBudgetExists, validateId } from "../middlewares/budget";

const router = Router()

//MIDDLEWARES:
router.param('budgetId', validateId)
router.param('budgetId', validateBudgetExists)

//GET ALL
router.get('/', BudgetController.getAll)

//CREATE
router.post('/',
    validateBudgetsInput,
    handleInputErrors,
    BudgetController.create
)

//GET BY ID
router.get('/:budgetId', BudgetController.getById )

//UPDATE
router.put('/:budgetId', 
    validateBudgetsInput,
    handleInputErrors,
    BudgetController.updateById
)

//DELETE
router.delete('/:budgetId', BudgetController.deleteById )


export default router