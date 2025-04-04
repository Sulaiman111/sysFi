import { Router } from 'express';
import * as chequeController from './cheque.controller';

const router = Router();

// الحصول على جميع الشيكات وإنشاء شيك جديد
router.route('/cheques')
  .get(chequeController.getAllCheques)
  .post(chequeController.createCheque);

// البحث عن الشيكات
router.get('/cheques/search', chequeController.searchCheques);

// الحصول على الشيكات حسب النوع (مستلمة أو مصدرة)
router.get('/cheques/type/:type', chequeController.getChequesByType);

// الحصول على الشيكات حسب الحالة
router.get('/cheques/status/:status', chequeController.getChequesByStatus);

// الحصول على الشيكات حسب التاريخ
router.get('/cheques/date/:date', chequeController.getChequesByDate);

// الحصول على الشيكات في فترة زمنية محددة
router.get('/cheques/date-range', chequeController.getChequesByDateRange);

// الحصول على شيكات عميل معين
router.get('/cheques/customer/:customerId', chequeController.getChequesByCustomerId);

// الحصول على شيكات دفعة معينة
router.get('/cheques/payment/:paymentId', chequeController.getChequesByPaymentId);

// الحصول على شيك محدد وتحديثه وحذفه
router.route('/cheques/:id')
  .get(chequeController.getChequeById)
  .put(chequeController.updateCheque)
  .delete(chequeController.deleteCheque);

// تحديث حالة الشيك
router.patch('/cheques/:id/status', chequeController.updateChequeStatus);

export default router;