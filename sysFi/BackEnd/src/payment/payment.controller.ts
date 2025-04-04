import { Request, Response } from 'express';
import * as paymentService from './payment.service';
import mongoose from 'mongoose';

// الحصول على جميع الدفعات
export const getAllPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const payments = await paymentService.getAllPayments();
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

// الحصول على دفعة بواسطة المعرف
export const getPaymentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const paymentId = req.params.id;
    const payment = await paymentService.getPaymentById(paymentId);
    
    if (!payment) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }
    
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
};

// إنشاء دفعة جديدة
export const createPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const paymentData = req.body;
    
    // التحقق من وجود البيانات المطلوبة
    if (!paymentData.customerId || !paymentData.amount || !paymentData.method) {
      res.status(400).json({ error: 'Customer ID, amount, and payment method are required' });
      return;
    }
    
    const newPayment = await paymentService.createPayment(paymentData);
    res.status(201).json(newPayment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create payment' });
  }
};

// تحديث دفعة
export const updatePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const paymentId = req.params.id;
    const paymentData = req.body;
    
    const updatedPayment = await paymentService.updatePayment(paymentId, paymentData);
    
    if (!updatedPayment) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }
    
    res.json(updatedPayment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update payment' });
  }
};

// حذف دفعة
export const deletePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const paymentId = req.params.id;
    const deletedPayment = await paymentService.deletePayment(paymentId);
    
    if (!deletedPayment) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }
    
    res.json({ 
      message: 'Payment deleted successfully',
      deletedPayment 
    });
  } catch (error: any) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ 
      error: 'Failed to delete payment',
      details: error.message 
    });
  }
};

// الحصول على دفعات عميل معين
export const getPaymentsByCustomerId = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerId = req.params.customerId;
    const payments = await paymentService.getPaymentsByCustomerId(customerId);
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer payments' });
  }
};

// الحصول على دفعات فاتورة معينة
export const getPaymentsByInvoiceId = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoiceId = req.params.invoiceId;
    const payments = await paymentService.getPaymentsByInvoiceId(invoiceId);
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoice payments' });
  }
};

// البحث عن الدفعات
export const searchPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query.q as string;
    if (!query) {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }
    
    const payments = await paymentService.searchPayments(query);
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search payments' });
  }
};

// الحصول على الدفعات حسب طريقة الدفع
export const getPaymentsByMethod = async (req: Request, res: Response): Promise<void> => {
  try {
    const method = req.params.method;
    const payments = await paymentService.getPaymentsByMethod(method);
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments by method' });
  }
};

// الحصول على الدفعات حسب التاريخ
export const getPaymentsByDate = async (req: Request, res: Response): Promise<void> => {
  try {
    const date = req.params.date;
    const payments = await paymentService.getPaymentsByDate(date);
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments by date' });
  }
};

// الحصول على الدفعات في فترة زمنية محددة
export const getPaymentsByDateRange = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query as { startDate: string; endDate: string };
    
    if (!startDate || !endDate) {
      res.status(400).json({ error: 'Start date and end date are required' });
      return;
    }
    
    const payments = await paymentService.getPaymentsByDateRange(startDate, endDate);
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments by date range' });
  }
};

export const deleteAllPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await paymentService.deleteAllPayments();
    res.json({ 
      message: 'All payments deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error: any) {
    console.error('Error deleting all payments:', error);
    res.status(500).json({ 
      error: 'Failed to delete all payments',
      details: error.message 
    });
  }
};