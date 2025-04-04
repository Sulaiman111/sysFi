import Invoice, { InvoiceDocument } from './invoice.model';
import mongoose from 'mongoose';
import Customer from '../customer/customer.model';

// الحصول على جميع الفواتير
// تعديل getAllInvoices
export const getAllInvoices = async (): Promise<InvoiceDocument[]> => {
  try {
    return await Invoice.find()
      .populate('customerId', 'customerName companyName')
      .populate('supplierId', 'supplierName companyName');
  } catch (error) {
    throw new Error('Failed to fetch invoices');
  }
};

// تعديل getInvoiceById
export const getInvoiceById = async (id: string): Promise<InvoiceDocument | null> => {
  try {
    return await Invoice.findById(id)
      .populate('customerId', 'customerName companyName')
      .populate('supplierId', 'supplierName companyName')
      .populate('issuedBy', 'name');
  } catch (error) {
    throw new Error(`Failed to fetch invoice with ID: ${id}`);
  }
};

// إضافة getInvoicesBySupplierId
export const getInvoicesBySupplierId = async (supplierId: string): Promise<InvoiceDocument[]> => {
  try {
    return await Invoice.find({ supplierId })
      .populate('supplierId', 'supplierName companyName');
  } catch (error) {
    throw new Error(`Failed to fetch invoices for supplier with ID: ${supplierId}`);
  }
};

// تعديل createInvoice
export const createInvoice = async (invoiceData: Partial<InvoiceDocument>): Promise<InvoiceDocument> => {
  try {
    const newInvoice = new Invoice(invoiceData);
    
    // حساب المبلغ الإجمالي للفاتورة
    newInvoice.calculateTotalAmount();
    // 
    return await newInvoice.save();
  } catch (error) {
    throw new Error('Failed to create invoice');
  }
};

// تحديث فاتورة
export const updateInvoice = async (id: string, invoiceData: Partial<InvoiceDocument>): Promise<InvoiceDocument | null> => {
  try {
    const invoice = await Invoice.findById(id);
    if (!invoice) return null;
    
    // تحديث البيانات
    Object.assign(invoice, invoiceData);
    
    // إعادة حساب المبلغ الإجمالي إذا تم تحديث العناصر
    if (invoiceData.items !== undefined) {
      invoice.calculateTotalAmount();
    }
    
    return await invoice.save();
  } catch (error) {
    throw new Error(`Failed to update invoice with ID: ${id}`);
  }
};

// حذف فاتورة
export const deleteInvoice = async (id: string): Promise<InvoiceDocument | null> => {
  try {
    return await Invoice.findByIdAndDelete(id);
  } catch (error) {
    throw new Error(`Failed to delete invoice with ID: ${id}`);
  }
};

// الحصول على فواتير عميل معين
export const getInvoicesByCustomerId = async (customerId: string): Promise<InvoiceDocument[]> => {
  try {
    return await Invoice.find({ customerId });
  } catch (error) {
    throw new Error(`Failed to fetch invoices for customer with ID: ${customerId}`);
  }
};

// تحديث حالة الفاتورة
export const updateInvoiceStatus = async (id: string, status: string): Promise<InvoiceDocument | null> => {
  try {
    return await Invoice.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
  } catch (error) {
    throw new Error(`Failed to update status for invoice with ID: ${id}`);
  }
};

// البحث عن الفواتير
export const searchInvoices = async (query: string): Promise<InvoiceDocument[]> => {
  try {
    return await Invoice.find({
      $or: [
        { invoiceId: { $regex: query, $options: 'i' } },
        { status: { $regex: query, $options: 'i' } }
      ]
    }).populate('customerId', 'customerName companyName');
  } catch (error) {
    throw new Error(`Failed to search invoices with query: ${query}`);
  }
};

// الحصول على الفواتير حسب الحالة
export const getInvoicesByStatus = async (status: string): Promise<InvoiceDocument[]> => {
  try {
    return await Invoice.find({ status }).populate('customerId', 'customerName companyName');
  } catch (error) {
    throw new Error(`Failed to fetch invoices with status: ${status}`);
  }
};

// Add this new function to get invoices by type
export const getInvoicesByType = async (type: string) => {
  try {
    return await Invoice.find({ type })
      .populate('customerId')
      .populate('items.productId')
      .lean();
  } catch (error) {
    console.error('Error fetching invoices by type:', error);
    throw error;
  }
};

// إضافة دفعة جديدة للفاتورة
export const addPaymentToInvoice = async (
  invoiceId: string, 
  paymentData: { 
    paymentId: mongoose.Types.ObjectId | string, 
    amount: number, 
    date: string, 
    method: string, 
    reference?: string 
  }
): Promise<InvoiceDocument | null> => {
  try {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return null;
    
    // تحويل paymentId إلى ObjectId إذا كان سلسلة نصية
    const paymentIdObj = typeof paymentData.paymentId === 'string' 
      ? new mongoose.Types.ObjectId(paymentData.paymentId) 
      : paymentData.paymentId;
    
    // إضافة الدفعة إلى مصفوفة الدفعات
    invoice.payments.push({
      paymentId: paymentIdObj,
      amount: paymentData.amount,
      date: paymentData.date,
      method: paymentData.method,
      reference: paymentData.reference
    });
    
    // إعادة حساب المبلغ المتبقي وتحديث حالة الفاتورة
    invoice.calculateRemainingAmount();
    
    return await invoice.save();
  } catch (error) {
    throw new Error(`Failed to add payment to invoice with ID: ${invoiceId}`);
  }
};

// حذف دفعة من فاتورة
export const removePaymentFromInvoice = async (
  invoiceId: string, 
  paymentId: string
): Promise<InvoiceDocument | null> => {
  try {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return null;
    
    // البحث عن الدفعة وحذفها
    const paymentIndex = invoice.payments.findIndex(
      payment => payment.paymentId.toString() === paymentId
    );
    
    if (paymentIndex === -1) return null;
    
    // حذف الدفعة من المصفوفة
    invoice.payments.splice(paymentIndex, 1);
    
    // إعادة حساب المبلغ المتبقي وتحديث حالة الفاتورة
    invoice.calculateRemainingAmount();
    
    // إذا لم تكن هناك دفعات، أعد تعيين الحالة إلى "pending"
    if (invoice.payments.length === 0) {
      invoice.status = 'pending';
    }
    
    return await invoice.save();
  } catch (error) {
    throw new Error(`Failed to remove payment from invoice with ID: ${invoiceId}`);
  }
};

// الحصول على الفواتير التي تحتوي على دفعة معينة
export const getInvoicesByPaymentId = async (paymentId: string): Promise<InvoiceDocument[]> => {
  try {
    return await Invoice.find({ 'payments.paymentId': new mongoose.Types.ObjectId(paymentId) });
  } catch (error) {
    throw new Error(`Failed to fetch invoices with payment ID: ${paymentId}`);
  }
};

// إضافة مصروف جديد للفاتورة
export const addExpenseToInvoice = async (
  invoiceId: string, 
  expenseData: { 
    expenseId: mongoose.Types.ObjectId | string, 
    amount: number, 
    date: string, 
    method: string, 
    reference?: string 
  }
): Promise<InvoiceDocument | null> => {
  try {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return null;
    
    // تحويل expenseId إلى ObjectId إذا كان سلسلة نصية
    const expenseIdObj = typeof expenseData.expenseId === 'string' 
      ? new mongoose.Types.ObjectId(expenseData.expenseId) 
      : expenseData.expenseId;
    
    // إضافة المصروف إلى مصفوفة المصروفات
    invoice.expenses.push({
      expenseId: expenseIdObj,
      amount: expenseData.amount,
      date: expenseData.date,
      method: expenseData.method,
      reference: expenseData.reference
    });
    
    // إعادة حساب المبلغ المتبقي وتحديث حالة الفاتورة
    invoice.calculateRemainingAmount();
    
    return await invoice.save();
  } catch (error) {
    throw new Error(`Failed to add expense to invoice with ID: ${invoiceId}`);
  }
};

// الحصول على الفواتير التي تحتوي على مصروف معين
export const getInvoicesByExpenseId = async (expenseId: string): Promise<InvoiceDocument[]> => {
  try {
    return await Invoice.find({ 'expenses.expenseId': new mongoose.Types.ObjectId(expenseId) });
  } catch (error) {
    throw new Error(`Failed to fetch invoices with expense ID: ${expenseId}`);
  }
};


export const deleteAllInvoices = async (): Promise<{ deletedCount: number }> => {
  try {
    // Get all invoices first to handle related data
    const invoices = await Invoice.find();
    
    // Process each invoice to clean up related data
    await Promise.all(invoices.map(async (invoice) => {
      // Remove invoice reference from customer
      if (invoice.customerId) {
        await Customer.findByIdAndUpdate(
          invoice.customerId,
          { $pull: { invoiceList: invoice._id } }
        );
      }

      // Update customer balance
      if (invoice.customerId && invoice.amount) {
        await Customer.findByIdAndUpdate(
          invoice.customerId,
          { $inc: { balanceDue: -invoice.amount } }
        );
      }
    }));

    // Finally delete all invoices
    const result = await Invoice.deleteMany({});
    return { deletedCount: result.deletedCount || 0 };
  } catch (error) {
    throw new Error('Failed to delete all invoices');
  }
};