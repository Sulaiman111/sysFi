import express from 'express';
import * as companyController from './company.controller';
// استيراد middleware للتحقق من المصادقة والتفويض
// import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// الحصول على جميع الشركات - متاح فقط للمشرف الرئيسي
router.get('/companies', companyController.getAllCompanies);

// الحصول على الشركات التي ستنتهي اشتراكاتها قريبًا
router.get('/companies/expiring', companyController.getExpiringSubscriptions);

// البحث عن شركات
router.get('/companies/search', companyController.searchCompanies);

// الحصول على شركة بواسطة المعرف
router.get('/companies/:id', companyController.getCompanyById);

// إنشاء شركة جديدة
router.post('/companies', companyController.createCompany);

// تحديث شركة
router.put('/companies/:id', companyController.updateCompany);

// حذف شركة
router.delete('/companies/:id', companyController.deleteCompany);

// تحديث اشتراك الشركة
router.patch('/companies/:id/subscription', companyController.updateSubscription);

// إضافة مستخدم مصرح له
router.post('/companies/:id/users', companyController.addAuthorizedUser);

// إزالة مستخدم مصرح له
router.delete('/companies/:id/users', companyController.removeAuthorizedUser);

// إضافة عميل إلى الشركة
router.post('/companies/:id/customers', companyController.addCustomerToCompany);

export default router;