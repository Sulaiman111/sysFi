import { Request, Response } from 'express';
import * as supplierService from './supplier.service';
import Supplier from './supplier.model'; // Add this import for the Supplier model
import  mongoose  from 'mongoose';
// Get all suppliers
export const getAllSuppliers = async (req: Request, res: Response): Promise<void> => {
  try {
    const suppliers = await supplierService.fetchAllSuppliers();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
};

// Get supplier by ID
export const getSupplierById = async (req: Request, res: Response): Promise<void> => {
  try {
    const supplierId = req.params.id;
    const supplier = await supplierService.getSupplierById(supplierId);
    
    if (!supplier) {
      res.status(404).json({ error: 'Supplier not found' });
      return;
    }
    
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch supplier' });
  }
};

// Create new supplier
export const createSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const supplierData = req.body;
    const newSupplier = await supplierService.createSupplier(supplierData);
    res.status(201).json(newSupplier);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create supplier' });
  }
};

// Update supplier
export const updateSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const supplierId = req.params.id;
    const supplierData = req.body;
    
    const updatedSupplier = await supplierService.updateSupplier(supplierId, supplierData);
    
    if (!updatedSupplier) {
      res.status(404).json({ error: 'Supplier not found' });
      return;
    }
    
    res.json(updatedSupplier);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update supplier' });
  }
};

// Delete supplier
export const deleteSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const supplierId = req.params.id;
    const deletedSupplier = await supplierService.deleteSupplier(supplierId);
    
    if (!deletedSupplier) {
      res.status(404).json({ error: 'Supplier not found' });
      return;
    }
    
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete supplier' });
  }
};

// Add invoice to supplier
/**
 * Add an invoice to a supplier's invoice list
 */
export const addInvoiceToSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const { supplierId } = req.params;
    const { invoiceId } = req.body;

    if (!invoiceId) {
      res.status(400).json({ message: 'Invoice ID is required' });
      return;
    }

    // Find the supplier
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      res.status(404).json({ message: 'Supplier not found' });
      return;
    }

    // Add the invoice to the supplier's invoice list if it's not already there
    if (!supplier.invoiceList.includes(invoiceId)) {
      supplier.invoiceList.push(invoiceId);
      
      // Update the supplier's balance due based on the invoice amount
      // You might want to fetch the invoice and add its amount to the balance
      // This is optional and depends on your business logic
      
      await supplier.save();
    }

    res.status(200).json(supplier);
  } catch (error: any) {
    console.error('Error adding invoice to supplier:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get supplier invoices
export const getSupplierInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const supplierId = req.params.id;
    const invoices = await supplierService.getSupplierInvoices(supplierId);
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch supplier invoices' });
  }
};

// Add expense to supplier
export const addExpenseToSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const supplierId = req.params.id;
    const { expenseId } = req.body;
    
    if (!expenseId) {
      res.status(400).json({ error: 'Expense ID is required' });
      return;
    }
    
    console.log(`Controller: Adding expense ${expenseId} to supplier ${supplierId}`);
    
    try {
      // محاولة تحويل معرف الدفعة إلى ObjectId للتحقق من صحته
      new mongoose.Types.ObjectId(expenseId);
    } catch (idError) {
      console.error('Invalid expense ID format:', idError);
      res.status(400).json({ error: 'Invalid expense ID format' });
      return;
    }
    
    const updatedSupplier = await supplierService.addExpenseToSupplier(supplierId, { expenseId });
    
    if (!updatedSupplier) {
      res.status(404).json({ error: 'Supplier not found' });
      return;
    }
    
    res.json(updatedSupplier);
  } catch (error: any) {
    console.error('Error in addExpenseToSupplier controller:', error);
    res.status(500).json({ error: 'Failed to add expense to supplier', details: error.message });
  }
};

// Get supplier expenses
export const getSupplierExpenses = async (req: Request, res: Response): Promise<void> => {
  try {
    const supplierId = req.params.id;
    const expenses = await supplierService.getSupplierExpenses(supplierId);
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch supplier expenses' });
  }
};



// Get supplier cheques
export const getSupplierCheques = async (req: Request, res: Response) => {
  try {
    const supplierId = req.params.id;
    const cheques = await supplierService.getSupplierCheques(supplierId);
    res.status(200).json(cheques);
  } catch (error) {
    // Fix the error typing
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch supplier cheques';
    res.status(500).json({ error: errorMessage });
  }
};

// Search suppliers
export const searchSuppliers = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query.q as string;
    if (!query) {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }
    
    const suppliers = await supplierService.searchSuppliers(query);
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search suppliers' });
  }
};

// Remove expense from supplier
export const removeExpenseFromSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: supplierId, expenseId } = req.params;
    
    console.log(`Removing expense ${expenseId} from supplier ${supplierId}`);
    
    // Find the supplier
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      res.status(404).json({ message: 'Supplier not found' });
      return;
    }

    // Check if the expense exists in the supplier's expense list
    const expenseIndex = supplier.expenseList.findIndex(
      (id) => id.toString() === expenseId
    );
    
    if (expenseIndex === -1) {
      res.status(404).json({ message: 'Expense not found in supplier\'s expense list' });
      return;
    }

    // Remove the expense from the supplier's expense list
    supplier.expenseList.splice(expenseIndex, 1);
    
    // Save the updated supplier
    await supplier.save();
    
    console.log(`Expense ${expenseId} removed from supplier ${supplierId} successfully`);
    
    res.status(200).json(supplier);
  } catch (error: any) {
    console.error('Error removing expense from supplier:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


