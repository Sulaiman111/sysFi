import { Router } from 'express';
import * as customerController from './customer.controller';

const router = Router();

// Get all customers and create new customer
router.route('/customers')
  .get(customerController.getAllCustomers)
  .post(customerController.createCustomer);

// Search customers
router.route('/customers/search')
  .get(customerController.searchCustomers);

// Get, update, and delete customer by ID
router.route('/customers/:id')
  .get(customerController.getCustomerById)
  .put(customerController.updateCustomer)
  .delete(customerController.deleteCustomer);

// Customer invoices
router.route('/customers/:customerId/invoices')
  .post(customerController.addInvoiceToCustomer)
  .get(customerController.getCustomerInvoices);

// Customer payments
router.route('/customers/:id/payments')
  .get(customerController.getCustomerPayments)
  .post(customerController.addPaymentToCustomer);

// Customer cheques
router.route('/customers/:id/cheques')
  .get(customerController.getCustomerCheques);

// حذف دفعة من قائمة مدفوعات العميل
router.delete('/customers/:id/payments/:paymentId', customerController.removePaymentFromCustomer);


export default router;