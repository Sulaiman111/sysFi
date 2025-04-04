import { Request, Response } from 'express';
import * as customerService from './customer.service';
import Customer from './customer.model'; // Add this import for the Customer model
import  mongoose  from 'mongoose';
// Get all customers
export const getAllCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const customers = await customerService.fetchAllCustomers();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

// Get customer by ID
export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerId = req.params.id;
    const customer = await customerService.getCustomerById(customerId);
    
    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }
    
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
};

// Create new customer
export const createCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerData = req.body;
    const newCustomer = await customerService.createCustomer(customerData);
    res.status(201).json(newCustomer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create customer' });
  }
};

// Update customer
export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerId = req.params.id;
    const customerData = req.body;
    
    const updatedCustomer = await customerService.updateCustomer(customerId, customerData);
    
    if (!updatedCustomer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }
    
    res.json(updatedCustomer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update customer' });
  }
};

// Delete customer
export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerId = req.params.id;
    const deletedCustomer = await customerService.deleteCustomer(customerId);
    
    if (!deletedCustomer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }
    
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete customer' });
  }
};

// Add invoice to customer
/**
 * Add an invoice to a customer's invoice list
 */
export const addInvoiceToCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerId } = req.params;
    const { invoiceId } = req.body;

    if (!invoiceId) {
      res.status(400).json({ message: 'Invoice ID is required' });
      return;
    }

    // Find the customer
    const customer = await Customer.findById(customerId);
    if (!customer) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }

    // Add the invoice to the customer's invoice list if it's not already there
    if (!customer.invoiceList.includes(invoiceId)) {
      customer.invoiceList.push(invoiceId);
      
      // Update the customer's balance due based on the invoice amount
      // You might want to fetch the invoice and add its amount to the balance
      // This is optional and depends on your business logic
      
      await customer.save();
    }

    res.status(200).json(customer);
  } catch (error: any) {
    console.error('Error adding invoice to customer:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get customer invoices
export const getCustomerInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerId = req.params.id;
    const invoices = await customerService.getCustomerInvoices(customerId);
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer invoices' });
  }
};

// Add payment to customer
export const addPaymentToCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerId = req.params.id;
    const { paymentId } = req.body;
    
    if (!paymentId) {
      res.status(400).json({ error: 'Payment ID is required' });
      return;
    }
    
    console.log(`Controller: Adding payment ${paymentId} to customer ${customerId}`);
    
    try {
      // محاولة تحويل معرف الدفعة إلى ObjectId للتحقق من صحته
      new mongoose.Types.ObjectId(paymentId);
    } catch (idError) {
      console.error('Invalid payment ID format:', idError);
      res.status(400).json({ error: 'Invalid payment ID format' });
      return;
    }
    
    const updatedCustomer = await customerService.addPaymentToCustomer(customerId, { paymentId });
    
    if (!updatedCustomer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }
    
    res.json(updatedCustomer);
  } catch (error: any) {
    console.error('Error in addPaymentToCustomer controller:', error);
    res.status(500).json({ error: 'Failed to add payment to customer', details: error.message });
  }
};

// Get customer payments
export const getCustomerPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerId = req.params.id;
    const payments = await customerService.getCustomerPayments(customerId);
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer payments' });
  }
};



// Get customer cheques
export const getCustomerCheques = async (req: Request, res: Response) => {
  try {
    const customerId = req.params.id;
    const cheques = await customerService.getCustomerCheques(customerId);
    res.status(200).json(cheques);
  } catch (error) {
    // Fix the error typing
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch customer cheques';
    res.status(500).json({ error: errorMessage });
  }
};

// Search customers
export const searchCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query.q as string;
    if (!query) {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }
    
    const customers = await customerService.searchCustomers(query);
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search customers' });
  }
};

// Remove payment from customer
export const removePaymentFromCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: customerId, paymentId } = req.params;
    
    console.log(`Removing payment ${paymentId} from customer ${customerId}`);
    
    // Find the customer
    const customer = await Customer.findById(customerId);
    if (!customer) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }

    // Check if the payment exists in the customer's payment list
    const paymentIndex = customer.paymentList.findIndex(
      (id) => id.toString() === paymentId
    );
    
    if (paymentIndex === -1) {
      res.status(404).json({ message: 'Payment not found in customer\'s payment list' });
      return;
    }

    // Remove the payment from the customer's payment list
    customer.paymentList.splice(paymentIndex, 1);
    
    // Save the updated customer
    await customer.save();
    
    console.log(`Payment ${paymentId} removed from customer ${customerId} successfully`);
    
    res.status(200).json(customer);
  } catch (error: any) {
    console.error('Error removing payment from customer:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


