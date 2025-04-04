import Expense, { ExpenseDocument } from './expense.model';
import mongoose from 'mongoose';
import Supplier from '../supplier/supplier.model';
import Invoice from '../invoice/invoice.model';
import Cheque from '../cheque/cheque.model';


export const getAllExpenses = async (): Promise<ExpenseDocument[]> => {
  try {
    return await Expense.find()
      .populate('supplierId', 'supplierName companyName')
      .populate('createdBy', 'name')
      .populate('cheques');
  } catch (error) {
    throw new Error('Failed to fetch expenses');
  }
};

// الحصول على دفعة بواسطة المعرف
export const getExpenseById = async (id: string): Promise<ExpenseDocument | null> => {
  try {
    return await Expense.findById(id)
      .populate('supplierId', 'supplierName companyName')
      .populate('createdBy', 'name')
      .populate('cheques');
  } catch (error) {
    throw new Error(`Failed to fetch expense with ID: ${id}`);
  }
};

// إنشاء دفعة جديدة
export const createExpense = async (expenseData: Partial<ExpenseDocument>): Promise<ExpenseDocument> => {
  try {
    // إنشاء معرف فريد للدفعة إذا لم يتم توفيره
    if (!expenseData.expenseId) {
      expenseData.expenseId = `PAY-${Date.now()}`;
    }
    
    const newExpense = new Expense(expenseData);
    return await newExpense.save();
  } catch (error) {
    throw new Error('Failed to create expense');
  }
};

// تحديث دفعة
export const updateExpense = async (id: string, expenseData: Partial<ExpenseDocument>): Promise<ExpenseDocument | null> => {
  try {
    // Check if invoiceId is a string that starts with "INV-"
    if (expenseData.invoiceId && typeof expenseData.invoiceId === 'string' && (expenseData.invoiceId as string).startsWith('INV-')) {
      // Find the invoice by invoiceNumber instead of _id
      const invoice = await mongoose.model('Invoice').findOne({ invoiceNumber: expenseData.invoiceId });
      if (invoice) {
        // Replace the string with the actual ObjectId
        expenseData.invoiceId = invoice._id;
      } else {
        throw new Error(`Invoice with number ${expenseData.invoiceId} not found`);
      }
    }
    
    return await Expense.findByIdAndUpdate(
      id,
      expenseData,
      { new: true }
    )
      .populate('supplierId', 'supplierName companyName')
      .populate('createdBy', 'name')
      .populate('cheques');
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to update expense with ID: ${id}: ${error.message}`);
    }
    throw new Error(`Failed to update expense with ID: ${id}`);
  }
};

// حذف دفعة
export const deleteExpense = async (id: string): Promise<ExpenseDocument | null> => {
  try {
    const expense = await Expense.findById(id);
    if (!expense) return null;

    // Remove expense from supplier's expense list
    if (expense.supplierId) {
      await Supplier.findByIdAndUpdate(
        expense.supplierId,
        { $pull: { expenseList: id } }
      );
    }

    // Remove expense from invoice if it exists
    if (expense.invoiceId) {
      await Invoice.findByIdAndUpdate(
        expense.invoiceId,
        { 
          $pull: { expenses: { expenseId: id } },
          $inc: { remainingAmount: expense.amount }
        }
      );
    }

    // Delete associated cheques if expense method was check
    if (expense.method === 'check' && expense.cheques?.length > 0) {
      await Cheque.deleteMany({ _id: { $in: expense.cheques } });
    }

    // Finally delete the expense
    return await Expense.findByIdAndDelete(id);
  } catch (error) {
    throw new Error(`Failed to delete expense with ID: ${id}`);
  }
};

// الحصول على دفعات عميل معين
export const getExpensesBySupplierId = async (supplierId: string): Promise<ExpenseDocument[]> => {
  try {
    return await Expense.find({ supplierId })
      .populate('createdBy', 'name')
      .populate('cheques');
  } catch (error) {
    throw new Error(`Failed to fetch expenses for supplier with ID: ${supplierId}`);
  }
};

// الحصول على دفعات فاتورة معينة
export const getExpensesByInvoiceId = async (invoiceId: string): Promise<ExpenseDocument[]> => {
  try {
    return await Expense.find({ invoiceId })
      .populate('supplierId', 'supplierName companyName')
      .populate('createdBy', 'name')
      .populate('cheques');
  } catch (error) {
    throw new Error(`Failed to fetch expenses for invoice with ID: ${invoiceId}`);
  }
};

// البحث عن الدفعات
export const searchExpenses = async (query: string): Promise<ExpenseDocument[]> => {
  try {
    return await Expense.find({
      $or: [
        { expenseId: { $regex: query, $options: 'i' } },
        { invoiceNumber: { $regex: query, $options: 'i' } }
      ]
    })
      .populate('supplierId', 'supplierName companyName')
      .populate('createdBy', 'name');
  } catch (error) {
    throw new Error(`Failed to search expenses with query: ${query}`);
  }
};

// الحصول على الدفعات حسب طريقة الدفع
export const getExpensesByMethod = async (method: string): Promise<ExpenseDocument[]> => {
  try {
    return await Expense.find({ method })
      .populate('supplierId', 'supplierName companyName')
      .populate('createdBy', 'name');
  } catch (error) {
    throw new Error(`Failed to fetch expenses with method: ${method}`);
  }
};

// الحصول على الدفعات حسب التاريخ
export const getExpensesByDate = async (date: string): Promise<ExpenseDocument[]> => {
  try {
    return await Expense.find({ date })
      .populate('supplierId', 'supplierName companyName')
      .populate('createdBy', 'name');
  } catch (error) {
    throw new Error(`Failed to fetch expenses for date: ${date}`);
  }
};

// الحصول على الدفعات في فترة زمنية محددة
export const getExpensesByDateRange = async (startDate: string, endDate: string): Promise<ExpenseDocument[]> => {
  try {
    return await Expense.find({
      date: { $gte: startDate, $lte: endDate }
    })
      .populate('supplierId', 'supplierName companyName')
      .populate('createdBy', 'name');
  } catch (error) {
    throw new Error(`Failed to fetch expenses between ${startDate} and ${endDate}`);
  }
};

// حذف جميع الدفعات
export const deleteAllExpenses = async (): Promise<{ deletedCount: number }> => {
  try {
    // Get all expenses first to handle related data
    const expenses = await Expense.find();
    
    // Process each expense to clean up related data
    await Promise.all(expenses.map(async (expense) => {
      // Remove from suppliers
      if (expense.supplierId) {
        await Supplier.updateMany(
          { _id: expense.supplierId },
          { $pull: { expenseList: expense._id } }
        );
      }

      // Remove from invoices and update remaining amounts
      if (expense.invoiceId) {
        await Invoice.updateMany(
          { _id: expense.invoiceId },
          { 
            $pull: { expenses: { expenseId: expense._id } },
            $inc: { remainingAmount: expense.amount }
          }
        );
      }

      // Delete associated cheques
      if (expense.method === 'check' && expense.cheques?.length > 0) {
        await Cheque.deleteMany({ _id: { $in: expense.cheques } });
      }
    }));

    // Finally delete all expenses
    const result = await Expense.deleteMany({});
    return { deletedCount: result.deletedCount || 0 };
  } catch (error) {
    throw new Error('Failed to delete all expenses');
  }
};