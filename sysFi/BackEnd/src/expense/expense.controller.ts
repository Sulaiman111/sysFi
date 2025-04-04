import { Request, Response } from 'express';
import * as expenseService from './expense.service';
import mongoose from 'mongoose';

// الحصول على جميع الدفعات
export const getAllExpenses = async (req: Request, res: Response): Promise<void> => {
  try {
    const expenses = await expenseService.getAllExpenses();
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
};

// الحصول على دفعة بواسطة المعرف
export const getExpenseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const expenseId = req.params.id;
    const expense = await expenseService.getExpenseById(expenseId);
    
    if (!expense) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }
    
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expense' });
  }
};

// إنشاء دفعة جديدة
export const createExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const expenseData = req.body;
    
    // التحقق من وجود البيانات المطلوبة
    if (!expenseData.supplierId || !expenseData.amount || !expenseData.method) {
      res.status(400).json({ error: 'Supplier ID, amount, and expense method are required' });
      return;
    }
    
    const newExpense = await expenseService.createExpense(expenseData);
    res.status(201).json(newExpense);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create expense' });
  }
};

// تحديث دفعة
export const updateExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const expenseId = req.params.id;
    const expenseData = req.body;
    
    const updatedExpense = await expenseService.updateExpense(expenseId, expenseData);
    
    if (!updatedExpense) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }
    
    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update expense' });
  }
};

// حذف دفعة
export const deleteExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const expenseId = req.params.id;
    const deletedExpense = await expenseService.deleteExpense(expenseId);
    
    if (!deletedExpense) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }
    
    res.json({ 
      message: 'Expense deleted successfully',
      deletedExpense 
    });
  } catch (error: any) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ 
      error: 'Failed to delete expense',
      details: error.message 
    });
  }
};

// الحصول على دفعات عميل معين
export const getExpensesBySupplierId = async (req: Request, res: Response): Promise<void> => {
  try {
    const supplierId = req.params.supplierId;
    const expenses = await expenseService.getExpensesBySupplierId(supplierId);
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch supplier expenses' });
  }
};

// الحصول على دفعات فاتورة معينة
export const getExpensesByInvoiceId = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoiceId = req.params.invoiceId;
    const expenses = await expenseService.getExpensesByInvoiceId(invoiceId);
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoice expenses' });
  }
};

// البحث عن الدفعات
export const searchExpenses = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query.q as string;
    if (!query) {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }
    
    const expenses = await expenseService.searchExpenses(query);
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search expenses' });
  }
};

// الحصول على الدفعات حسب طريقة الدفع
export const getExpensesByMethod = async (req: Request, res: Response): Promise<void> => {
  try {
    const method = req.params.method;
    const expenses = await expenseService.getExpensesByMethod(method);
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expenses by method' });
  }
};

// الحصول على الدفعات حسب التاريخ
export const getExpensesByDate = async (req: Request, res: Response): Promise<void> => {
  try {
    const date = req.params.date;
    const expenses = await expenseService.getExpensesByDate(date);
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expenses by date' });
  }
};

// الحصول على الدفعات في فترة زمنية محددة
export const getExpensesByDateRange = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query as { startDate: string; endDate: string };
    
    if (!startDate || !endDate) {
      res.status(400).json({ error: 'Start date and end date are required' });
      return;
    }
    
    const expenses = await expenseService.getExpensesByDateRange(startDate, endDate);
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expenses by date range' });
  }
};

export const deleteAllExpenses = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await expenseService.deleteAllExpenses();
    res.json({ 
      message: 'All expenses deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error: any) {
    console.error('Error deleting all expenses:', error);
    res.status(500).json({ 
      error: 'Failed to delete all expenses',
      details: error.message 
    });
  }
};