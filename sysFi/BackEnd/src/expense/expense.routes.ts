import { Router } from 'express';
import * as expenseController from './expense.controller';

const router = Router();

// الحصول على جميع الدفعات وإنشاء دفعة جديدة
router.route('/expenses')
  .get(expenseController.getAllExpenses)
  .post(expenseController.createExpense);

// البحث عن الدفعات
router.get('/expenses/search', expenseController.searchExpenses);

// الحصول على الدفعات حسب طريقة الدفع
router.get('/expenses/method/:method', expenseController.getExpensesByMethod);

// الحصول على الدفعات حسب التاريخ
router.get('/expenses/date/:date', expenseController.getExpensesByDate);

// الحصول على الدفعات في فترة زمنية محددة
router.get('/expenses/date-range', expenseController.getExpensesByDateRange);

// الحصول على دفعات عميل معين
router.get('/expenses/supplier/:supplierId', expenseController.getExpensesBySupplierId);

// الحصول على دفعات فاتورة معينة
router.get('/expenses/invoice/:invoiceId', expenseController.getExpensesByInvoiceId);

// حذف جميع الدفعات (Move this BEFORE the :id route)
router.delete('/expenses/delete-all', expenseController.deleteAllExpenses);

// الحصول على دفعة محددة وتحديثها وحذفها
router.route('/expenses/:id')
  .get(expenseController.getExpenseById)
  .delete(expenseController.deleteExpense);

export default router;