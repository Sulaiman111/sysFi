import { Request, Response } from 'express';
import * as invoiceService from './invoice.service';
import mongoose from 'mongoose';
import  Invoice from './invoice.model';  // Add this import

// الحصول على جميع الفواتير
export const getAllInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoices = await invoiceService.getAllInvoices();
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

// الحصول على فاتورة بواسطة المعرف
export const getInvoiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoiceId = req.params.id;
    const invoice = await invoiceService.getInvoiceById(invoiceId);
    
    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }
    
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
};

// إنشاء فاتورة جديدة
// تعديل createInvoice
export const createInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoiceData = req.body;
    
    // التحقق من وجود البيانات المطلوبة حسب نوع الفاتورة
    if (invoiceData.type === 'purchase') {
      if (!invoiceData.supplierId || !invoiceData.items || invoiceData.items.length === 0) {
        res.status(400).json({ error: 'Supplier ID and at least one item are required for purchase invoices' });
        return;
      }
    } else {
      if (!invoiceData.customerId || !invoiceData.items || invoiceData.items.length === 0) {
        res.status(400).json({ error: 'Customer ID and at least one item are required for sales invoices' });
        return;
      }
    }
    
    // إنشاء معرف فريد للفاتورة
    if (!invoiceData.invoiceId) {
      invoiceData.invoiceId = `INV-${Date.now()}`;
    }
    
    const newInvoice = await invoiceService.createInvoice(invoiceData);
    res.status(201).json(newInvoice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create invoice' });
  }
};

// إضافة getInvoicesBySupplier
export const getInvoicesBySupplierId = async (req: Request, res: Response): Promise<void> => {
  try {
    const supplierId = req.params.supplierId;
    const invoices = await invoiceService.getInvoicesBySupplierId(supplierId);
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch supplier invoices' });
  }
};

// تحديث فاتورة
export const updateInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoiceId = req.params.id;
    const invoiceData = req.body;
    
    const updatedInvoice = await invoiceService.updateInvoice(invoiceId, invoiceData);
    
    if (!updatedInvoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }
    
    res.json(updatedInvoice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update invoice' });
  }
};

// حذف فاتورة
export const deleteInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoiceId = req.params.id;
    const deletedInvoice = await invoiceService.deleteInvoice(invoiceId);
    
    if (!deletedInvoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }
    
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
};

// الحصول على فواتير عميل معين
export const getInvoicesByCustomerId = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerId = req.params.customerId;
    const invoices = await invoiceService.getInvoicesByCustomerId(customerId);
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer invoices' });
  }
};

// تحديث حالة الفاتورة
export const updateInvoiceStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoiceId = req.params.id;
    const { status } = req.body;
    
    if (!status || !['pending', 'paid', 'overdue', 'draft'].includes(status)) {
      res.status(400).json({ error: 'Valid status (pending, paid, overdue, draft) is required' });
      return;
    }
    
    const updatedInvoice = await invoiceService.updateInvoiceStatus(invoiceId, status);
    
    if (!updatedInvoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }
    
    res.json(updatedInvoice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update invoice status' });
  }
};

// البحث عن الفواتير
export const searchInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query.q as string;
    if (!query) {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }
    
    const invoices = await invoiceService.searchInvoices(query);
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search invoices' });
  }
};

// الحصول على الفواتير حسب الحالة
export const getInvoicesByStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const status = req.params.status;
    
    if (!['pending', 'paid', 'overdue', 'draft'].includes(status)) {
      res.status(400).json({ error: 'Valid status (pending, paid, overdue, draft) is required' });
      return;
    }
    
    const invoices = await invoiceService.getInvoicesByStatus(status);
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoices by status' });
  }
};

// إضافة وظيفة جديدة للحصول على الفواتير حسب النوع
export const getInvoicesByType = async (req: Request, res: Response): Promise<void> => {
  try {
    const type = req.params.type;
    
    if (!['sales', 'purchase'].includes(type)) {
      res.status(400).json({ error: 'Valid type (sales, purchase) is required' });
      return;
    }
    
    const invoices = await invoiceService.getInvoicesByType(type);
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoices by type' });
  }
};

// إضافة دفعة جديدة للفاتورة
export const addPaymentToInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoiceId = req.params.id;
    const paymentData = req.body;
    
    // التحقق من وجود البيانات المطلوبة
    if (!paymentData.paymentId || !paymentData.amount || !paymentData.date || !paymentData.method) {
      res.status(400).json({ error: 'Payment ID, amount, date, and method are required' });
      return;
    }
    
    const updatedInvoice = await invoiceService.addPaymentToInvoice(invoiceId, paymentData);
    
    if (!updatedInvoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }
    
    res.json(updatedInvoice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add payment to invoice' });
  }
};

// الحصول على دفعات فاتورة معينة
export const getInvoicePayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoiceId = req.params.id;
    const invoice = await invoiceService.getInvoiceById(invoiceId);
    
    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }
    
    res.json(invoice.payments || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoice payments' });
  }
};


export const deleteAllInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await invoiceService.deleteAllInvoices();
    res.json({ 
      message: 'All invoices deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error: any) {
    console.error('Error deleting all invoices:', error);
    res.status(500).json({ 
      error: 'Failed to delete all invoices',
      details: error.message 
    });
  }
};

// إضافة مصروف جديد للفاتورة
export const addExpenseToInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoiceId = req.params.id;
    const expenseData = req.body;
    
    if (!expenseData.expenseId || !expenseData.amount || !expenseData.date || !expenseData.method) {
      res.status(400).json({ error: 'Expense ID, amount, date, and method are required' });
      return;
    }
    
    const updatedInvoice = await invoiceService.addExpenseToInvoice(invoiceId, expenseData);
    
    if (!updatedInvoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }
    
    res.json(updatedInvoice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add expense to invoice' });
  }
};

// الحصول على مصروفات فاتورة معينة
export const getInvoiceExpenses = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoiceId = req.params.id;
    const invoice = await invoiceService.getInvoiceById(invoiceId);
    
    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }
    
    res.json(invoice.expenses || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoice expenses' });
  }
};
