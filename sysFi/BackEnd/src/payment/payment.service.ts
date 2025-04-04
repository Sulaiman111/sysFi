import Payment, { PaymentDocument } from './payment.model';
import mongoose from 'mongoose';
import Customer from '../customer/customer.model';
import Invoice from '../invoice/invoice.model';
import Cheque from '../cheque/cheque.model';

// الحصول على جميع الدفعات
export const getAllPayments = async (): Promise<PaymentDocument[]> => {
  try {
    return await Payment.find()
      .populate('customerId', 'customerName companyName')
      .populate('createdBy', 'name')
      .populate('cheques');
  } catch (error) {
    throw new Error('Failed to fetch payments');
  }
};

// الحصول على دفعة بواسطة المعرف
export const getPaymentById = async (id: string): Promise<PaymentDocument | null> => {
  try {
    return await Payment.findById(id)
      .populate('customerId', 'customerName companyName')
      .populate('createdBy', 'name')
      .populate('cheques');
  } catch (error) {
    throw new Error(`Failed to fetch payment with ID: ${id}`);
  }
};

// إنشاء دفعة جديدة
export const createPayment = async (paymentData: Partial<PaymentDocument>): Promise<PaymentDocument> => {
  try {
    // إنشاء معرف فريد للدفعة إذا لم يتم توفيره
    if (!paymentData.paymentId) {
      paymentData.paymentId = `PAY-${Date.now()}`;
    }
    
    const newPayment = new Payment(paymentData);
    return await newPayment.save();
  } catch (error) {
    throw new Error('Failed to create payment');
  }
};

// تحديث دفعة
export const updatePayment = async (id: string, paymentData: Partial<PaymentDocument>): Promise<PaymentDocument | null> => {
  try {
    // Check if invoiceId is a string that starts with "INV-"
    if (paymentData.invoiceId && typeof paymentData.invoiceId === 'string' && (paymentData.invoiceId as string).startsWith('INV-')) {
      // Find the invoice by invoiceNumber instead of _id
      const invoice = await mongoose.model('Invoice').findOne({ invoiceNumber: paymentData.invoiceId });
      if (invoice) {
        // Replace the string with the actual ObjectId
        paymentData.invoiceId = invoice._id;
      } else {
        throw new Error(`Invoice with number ${paymentData.invoiceId} not found`);
      }
    }
    
    return await Payment.findByIdAndUpdate(
      id,
      paymentData,
      { new: true }
    )
      .populate('customerId', 'customerName companyName')
      .populate('createdBy', 'name')
      .populate('cheques');
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to update payment with ID: ${id}: ${error.message}`);
    }
    throw new Error(`Failed to update payment with ID: ${id}`);
  }
};

// حذف دفعة
export const deletePayment = async (id: string): Promise<PaymentDocument | null> => {
  try {
    const payment = await Payment.findById(id);
    if (!payment) return null;

    // Remove payment from customer's payment list
    if (payment.customerId) {
      await Customer.findByIdAndUpdate(
        payment.customerId,
        { $pull: { paymentList: id } }
      );
    }

    // Remove payment from invoice if it exists
    if (payment.invoiceId) {
      await Invoice.findByIdAndUpdate(
        payment.invoiceId,
        { 
          $pull: { payments: { paymentId: id } },
          $inc: { remainingAmount: payment.amount }
        }
      );
    }

    // Delete associated cheques if payment method was check
    if (payment.method === 'check' && payment.cheques?.length > 0) {
      await Cheque.deleteMany({ _id: { $in: payment.cheques } });
    }

    // Finally delete the payment
    return await Payment.findByIdAndDelete(id);
  } catch (error) {
    throw new Error(`Failed to delete payment with ID: ${id}`);
  }
};

// الحصول على دفعات عميل معين
export const getPaymentsByCustomerId = async (customerId: string): Promise<PaymentDocument[]> => {
  try {
    return await Payment.find({ customerId })
      .populate('createdBy', 'name')
      .populate('cheques');
  } catch (error) {
    throw new Error(`Failed to fetch payments for customer with ID: ${customerId}`);
  }
};

// الحصول على دفعات فاتورة معينة
export const getPaymentsByInvoiceId = async (invoiceId: string): Promise<PaymentDocument[]> => {
  try {
    return await Payment.find({ invoiceId })
      .populate('customerId', 'customerName companyName')
      .populate('createdBy', 'name')
      .populate('cheques');
  } catch (error) {
    throw new Error(`Failed to fetch payments for invoice with ID: ${invoiceId}`);
  }
};

// البحث عن الدفعات
export const searchPayments = async (query: string): Promise<PaymentDocument[]> => {
  try {
    return await Payment.find({
      $or: [
        { paymentId: { $regex: query, $options: 'i' } },
        { invoiceNumber: { $regex: query, $options: 'i' } }
      ]
    })
      .populate('customerId', 'customerName companyName')
      .populate('createdBy', 'name');
  } catch (error) {
    throw new Error(`Failed to search payments with query: ${query}`);
  }
};

// الحصول على الدفعات حسب طريقة الدفع
export const getPaymentsByMethod = async (method: string): Promise<PaymentDocument[]> => {
  try {
    return await Payment.find({ method })
      .populate('customerId', 'customerName companyName')
      .populate('createdBy', 'name');
  } catch (error) {
    throw new Error(`Failed to fetch payments with method: ${method}`);
  }
};

// الحصول على الدفعات حسب التاريخ
export const getPaymentsByDate = async (date: string): Promise<PaymentDocument[]> => {
  try {
    return await Payment.find({ date })
      .populate('customerId', 'customerName companyName')
      .populate('createdBy', 'name');
  } catch (error) {
    throw new Error(`Failed to fetch payments for date: ${date}`);
  }
};

// الحصول على الدفعات في فترة زمنية محددة
export const getPaymentsByDateRange = async (startDate: string, endDate: string): Promise<PaymentDocument[]> => {
  try {
    return await Payment.find({
      date: { $gte: startDate, $lte: endDate }
    })
      .populate('customerId', 'customerName companyName')
      .populate('createdBy', 'name');
  } catch (error) {
    throw new Error(`Failed to fetch payments between ${startDate} and ${endDate}`);
  }
};

// حذف جميع الدفعات
export const deleteAllPayments = async (): Promise<{ deletedCount: number }> => {
  try {
    // Get all payments first to handle related data
    const payments = await Payment.find();
    
    // Process each payment to clean up related data
    await Promise.all(payments.map(async (payment) => {
      // Remove from customers
      if (payment.customerId) {
        await Customer.updateMany(
          { _id: payment.customerId },
          { $pull: { paymentList: payment._id } }
        );
      }

      // Remove from invoices and update remaining amounts
      if (payment.invoiceId) {
        await Invoice.updateMany(
          { _id: payment.invoiceId },
          { 
            $pull: { payments: { paymentId: payment._id } },
            $inc: { remainingAmount: payment.amount }
          }
        );
      }

      // Delete associated cheques
      if (payment.method === 'check' && payment.cheques?.length > 0) {
        await Cheque.deleteMany({ _id: { $in: payment.cheques } });
      }
    }));

    // Finally delete all payments
    const result = await Payment.deleteMany({});
    return { deletedCount: result.deletedCount || 0 };
  } catch (error) {
    throw new Error('Failed to delete all payments');
  }
};