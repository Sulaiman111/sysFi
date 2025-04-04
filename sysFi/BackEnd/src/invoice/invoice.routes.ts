import { Router } from 'express';
import * as invoiceController from './invoice.controller';

const router = Router();

// الحصول على جميع الفواتير وإنشاء فاتورة جديدة
router.route('/invoices')
  .get(invoiceController.getAllInvoices)
  .post(invoiceController.createInvoice);

// البحث عن الفواتير
router.get('/invoices/search', invoiceController.searchInvoices);

// الحصول على الفواتير حسب الحالة
router.get('/invoices/status/:status', invoiceController.getInvoicesByStatus);

// الحصول على الفواتير حسب النوع (مبيعات أو مشتريات)
router.get('/invoices/type/:type', invoiceController.getInvoicesByType);

// الحصول على فواتير عميل معين
router.get('/invoices/customer/:customerId', invoiceController.getInvoicesByCustomerId);

// حذف جميع الفواتير
router.delete('/invoices/delete-all', invoiceController.deleteAllInvoices);

// الحصول على فاتورة محددة وتحديثها وحذفها
router.route('/invoices/:id')
  .get(invoiceController.getInvoiceById)
  .put(invoiceController.updateInvoice)
  .delete(invoiceController.deleteInvoice);

// تحديث حالة الفاتورة
router.patch('/invoices/:id/status', invoiceController.updateInvoiceStatus);




// إضافة دفعة جديدة للفاتورة
router.post('/invoices/:id/payments', invoiceController.addPaymentToInvoice);

// الحصول على دفعات فاتورة معينة
router.get('/invoices/:id/payments', invoiceController.getInvoicePayments);



// إضافة مصروف جديد للفاتورة
router.post('/invoices/:id/expenses', invoiceController.addExpenseToInvoice);

// الحصول على مصروفات فاتورة معينة
router.get('/invoices/:id/expenses', invoiceController.getInvoiceExpenses);

// إضافة مسار جديد للحصول على فواتير المورد
router.get('/invoices/supplier/:supplierId', invoiceController.getInvoicesBySupplierId);

export default router;