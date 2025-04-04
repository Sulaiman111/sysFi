import Supplier, { SupplierDocument } from './supplier.model';
import { InvoiceDocument as Invoice } from '../invoice/invoice.model';
import { ExpenseDocument as Expense } from '../expense/expense.model';
import { Types } from 'mongoose';
import  mongoose  from 'mongoose';
// Get all suppliers
export const fetchAllSuppliers = async (): Promise<SupplierDocument[]> => {
  try {
    return await Supplier.find();
  } catch (error) {
    throw new Error('Failed to fetch suppliers');
  }
};

// Get supplier by ID
export const getSupplierById = async (id: string): Promise<SupplierDocument | null> => {
  try {
    return await Supplier.findById(id);
  } catch (error) {
    throw new Error(`Failed to fetch supplier with ID: ${id}`);
  }
};

// Create new supplier
export const createSupplier = async (supplierData: Partial<SupplierDocument>): Promise<SupplierDocument> => {
  try {
    const newSupplier = new Supplier(supplierData);
    return await newSupplier.save();
  } catch (error) {
    throw new Error('Failed to create supplier');
  }
};

// Update supplier
export const updateSupplier = async (id: string, supplierData: Partial<SupplierDocument>): Promise<SupplierDocument | null> => {
  try {
    return await Supplier.findByIdAndUpdate(id, supplierData, { new: true });
  } catch (error) {
    throw new Error(`Failed to update supplier with ID: ${id}`);
  }
};

// Delete supplier
export const deleteSupplier = async (id: string): Promise<SupplierDocument | null> => {
  try {
    return await Supplier.findByIdAndDelete(id);
  } catch (error) {
    throw new Error(`Failed to delete supplier with ID: ${id}`);
  }
};

// Add invoice to supplier
export const addInvoiceToSupplier = async (supplierId: string, invoiceData: any): Promise<SupplierDocument | null> => {
  try {    
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      console.log('Supplier not found');
      return null;
    }
    
    // Add bonus field if not present
    if (!invoiceData.bonus) {
      invoiceData.bonus = 0;
    }
    
    // Create the invoice first
    const invoiceModel = mongoose.model('Invoice');
    const newInvoice = new invoiceModel({
      ...invoiceData,
      supplierId: supplierId
    });
    
    // Save the invoice
    const savedInvoice = await newInvoice.save();
    console.log('Invoice saved:', savedInvoice._id);
    
    // Add the invoice reference to the supplier
    if (!supplier.invoiceList) {
      supplier.invoiceList = [];
    }
    
    supplier.invoiceList.push(savedInvoice._id);
    
    // Update supplier balance
    supplier.balanceDue += savedInvoice.amount;
    
    // Save the updated supplier
    await supplier.save();
    console.log('Supplier updated with new invoice');
    
    return supplier;
  } catch (error) {
    console.error('Error adding invoice to supplier:', error);
    throw new Error(`Failed to add invoice to supplier with ID: ${supplierId}`);
  }
};

// Get supplier invoices
export const getSupplierInvoices = async (supplierId: string): Promise<any[]> => {
  try {
    const supplier = await Supplier.findById(supplierId).populate('invoiceList');
    if (!supplier) return [];;
    return supplier.invoiceList;
  } catch (error) {
    throw new Error(`Failed to fetch invoices for supplier with ID: ${supplierId}`);
  }
};

// Get supplier expenses
export const getSupplierExpenses = async (supplierId: string): Promise<any[]> => {
  try {
    // استخدام populate للصول على بيانات المدفوعات الكاملة
    const supplier = await Supplier.findById(supplierId).populate('expenseList');
    if (!supplier) return [];
    // @ts-ignore - نتجاهل خطأ TypeScript مؤقتًا
    return supplier.expenseList;
  } catch (error) {
    throw new Error(`Failed to fetch expenses for supplier with ID: ${supplierId}`);
  }
};

// Get supplier cheques
export const getSupplierCheques = async (supplierId: string): Promise<any[]> => {
  try {
    console.log('Fetching cheques for supplier:', supplierId);
    
    // استخدام نموذج الشيكات للبحث عن الشيكات المرتبطة بالعميل
    const ChequeModel = mongoose.model('Cheque');
    const cheques = await ChequeModel.find({ supplierId: supplierId })
      .sort({ chequeDate: 1 }) // ترتيب حسب تاريخ الشيك
      .populate('expenseId'); // جلب بيانات الدفعة المرتبطة
    
    console.log(`Found ${cheques.length} cheques for supplier`);
    return cheques;
  } catch (error) {
    console.error('Error fetching supplier cheques:', error);
    throw new Error(`Failed to fetch cheques for supplier with ID: ${supplierId}`);
  }
};

// Search suppliers by name, company, or location
export const searchSuppliers = async (query: string): Promise<SupplierDocument[]> => {
  try {
    return await Supplier.find({
      $or: [
        { supplierName: { $regex: query, $options: 'i' } },
        { companyName: { $regex: query, $options: 'i' } },
        { geographicalLocation: { $regex: query, $options: 'i' } }
      ]
    });
  } catch (error) {
    throw new Error(`Failed to search suppliers with query: ${query}`);
  }
};

/**
 * Add expense to supplier
 */
export const addExpenseToSupplier = async (supplierId: string, expenseData: { expenseId: string }): Promise<any> => {
  try {    
    // تحويل معرف الدفعة إلى ObjectId
    const expenseObjectId = new mongoose.Types.ObjectId(expenseData.expenseId);
    
    // البحث عن العميل وتحديثه
    const supplier = await Supplier.findById(supplierId);
    
    if (!supplier) {
      throw new Error('Supplier not found');
    }
    
    if (!supplier.expenseList.includes(expenseObjectId)) {
      supplier.expenseList.push(expenseObjectId);
      await supplier.save();
    } else {
      console.log(`Expense ${expenseData.expenseId} already exists in supplier's expense list`);
    }
    
    return supplier;
  } catch (error) {
    console.error('Error in addExpenseToSupplier service:', error);
    throw error;
  }
};

