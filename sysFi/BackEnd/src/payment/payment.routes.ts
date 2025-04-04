import { Router } from 'express';
import * as paymentController from './payment.controller';

const router = Router();

// الحصول على جميع الدفعات وإنشاء دفعة جديدة
router.route('/payments')
  .get(paymentController.getAllPayments)
  .post(paymentController.createPayment);

// البحث عن الدفعات
router.get('/payments/search', paymentController.searchPayments);

// الحصول على الدفعات حسب طريقة الدفع
router.get('/payments/method/:method', paymentController.getPaymentsByMethod);

// الحصول على الدفعات حسب التاريخ
router.get('/payments/date/:date', paymentController.getPaymentsByDate);

// الحصول على الدفعات في فترة زمنية محددة
router.get('/payments/date-range', paymentController.getPaymentsByDateRange);

// الحصول على دفعات عميل معين
router.get('/payments/customer/:customerId', paymentController.getPaymentsByCustomerId);

// الحصول على دفعات فاتورة معينة
router.get('/payments/invoice/:invoiceId', paymentController.getPaymentsByInvoiceId);

// حذف جميع الدفعات (Move this BEFORE the :id route)
router.delete('/payments/delete-all', paymentController.deleteAllPayments);

// الحصول على دفعة محددة وتحديثها وحذفها
router.route('/payments/:id')
  .get(paymentController.getPaymentById)
  .delete(paymentController.deletePayment);

export default router;