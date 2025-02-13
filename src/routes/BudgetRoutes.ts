import { Router } from "express";
import BudgetController from "../controllers/BudgetController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middlewares/validation";
import { validateBudgetExists, validateId, validateBudgetsInput, hasAccess } from "../middlewares/budget";
import { ExpensesController } from "../controllers/ExpenseController";
import { validateExpenseExists, validateExpenseId, validateExpensesInput } from "../middlewares/expenses";
import { authenticate } from "../middlewares/auth";

const router = Router()

//Auth
router.use(authenticate) //req.user

//MIDDLEWARES:
router.param('budgetId', validateId)
router.param('budgetId', validateBudgetExists) //req.budget
router.param('budgetId', hasAccess)

router.param('expenseId', validateExpenseId)
router.param('expenseId', validateExpenseExists) //req.expenses

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

/** Routes of expenses **/

//CREATE EXPENSE
router.post('/:budgetId/expenses',
    validateExpensesInput,
    handleInputErrors,
    ExpensesController.create
)

//GET EXPENSE BY ID
router.get('/:budgetId/expenses/:expenseId', 
    ExpensesController.getById
)

//UPDATE EXPENSE
router.put('/:budgetId/expenses/:expenseId', 
    validateExpensesInput,
    handleInputErrors,
    ExpensesController.updateById
)

//DELETE EXPENSE
router.delete('/:budgetId/expenses/:expenseId', 
    ExpensesController.deleteById
)

export default router