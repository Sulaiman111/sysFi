import Cheque, { ChequeDocument } from './cheque.model';
import mongoose from 'mongoose';

// الحصول على جميع الشيكات
export const getAllCheques = async (): Promise<ChequeDocument[]> => {
  try {
    return await Cheque.find()
      .populate('customerId', 'customerName companyName')
      .populate('paymentId');
  } catch (error) {
    throw new Error('Failed to fetch cheques');
  }
};

// الحصول على شيك بواسطة المعرف
export const getChequeById = async (id: string): Promise<ChequeDocument | null> => {
  try {
    return await Cheque.findById(id)
      .populate('customerId', 'customerName companyName')
      .populate('paymentId');
  } catch (error) {
    throw new Error(`Failed to fetch cheque with ID: ${id}`);
  }
};

// إنشاء شيك جديد
export const createCheque = async (chequeData: Partial<ChequeDocument>): Promise<ChequeDocument> => {
  try {
    const newCheque = new Cheque(chequeData);
    return await newCheque.save();
  } catch (error) {
    throw new Error('Failed to create cheque');
  }
};

// تحديث شيك
export const updateCheque = async (id: string, chequeData: Partial<ChequeDocument>): Promise<ChequeDocument | null> => {
  try {
    return await Cheque.findByIdAndUpdate(
      id,
      chequeData,
      { new: true }
    )
      .populate('customerId', 'customerName companyName')
      .populate('paymentId');
  } catch (error) {
    throw new Error(`Failed to update cheque with ID: ${id}`);
  }
};

// حذف شيك
export const deleteCheque = async (id: string): Promise<ChequeDocument | null> => {
  try {
    return await Cheque.findByIdAndDelete(id);
  } catch (error) {
    throw new Error(`Failed to delete cheque with ID: ${id}`);
  }
};

// تحديث حالة الشيك
export const updateChequeStatus = async (id: string, status: string): Promise<ChequeDocument | null> => {
  try {
    return await Cheque.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .populate('customerId', 'customerName companyName')
      .populate('paymentId');
  } catch (error) {
    throw new Error(`Failed to update status for cheque with ID: ${id}`);
  }
};

// الحصول على شيكات عميل معين
export const getChequesByCustomerId = async (customerId: string): Promise<ChequeDocument[]> => {
  try {
    return await Cheque.find({ customerId })
      .populate('paymentId');
  } catch (error) {
    throw new Error(`Failed to fetch cheques for customer with ID: ${customerId}`);
  }
};

// الحصول على شيكات دفعة معينة
export const getChequesByPaymentId = async (paymentId: string): Promise<ChequeDocument[]> => {
  try {
    return await Cheque.find({ paymentId })
      .populate('customerId', 'customerName companyName');
  } catch (error) {
    throw new Error(`Failed to fetch cheques for payment with ID: ${paymentId}`);
  }
};

// الحصول على الشيكات حسب النوع (مستلمة أو مصدرة)
export const getChequesByType = async (type: string): Promise<ChequeDocument[]> => {
  try {
    return await Cheque.find({ type })
      .populate('customerId', 'customerName companyName')
      .populate('paymentId');
  } catch (error) {
    throw new Error(`Failed to fetch cheques with type: ${type}`);
  }
};

// الحصول على الشيكات حسب الحالة
export const getChequesByStatus = async (status: string): Promise<ChequeDocument[]> => {
  try {
    return await Cheque.find({ status })
      .populate('customerId', 'customerName companyName')
      .populate('paymentId');
  } catch (error) {
    throw new Error(`Failed to fetch cheques with status: ${status}`);
  }
};

// البحث عن الشيكات
export const searchCheques = async (query: string): Promise<ChequeDocument[]> => {
  try {
    return await Cheque.find({
      $or: [
        { chequeNumber: { $regex: query, $options: 'i' } },
        { bankName: { $regex: query, $options: 'i' } },
        { holderName: { $regex: query, $options: 'i' } }
      ]
    })
      .populate('customerId', 'customerName companyName')
      .populate('paymentId');
  } catch (error) {
    throw new Error(`Failed to search cheques with query: ${query}`);
  }
};

// الحصول على الشيكات حسب التاريخ
export const getChequesByDate = async (date: string): Promise<ChequeDocument[]> => {
  try {
    return await Cheque.find({ chequeDate: date })
      .populate('customerId', 'customerName companyName')
      .populate('paymentId');
  } catch (error) {
    throw new Error(`Failed to fetch cheques for date: ${date}`);
  }
};

// الحصول على الشيكات في فترة زمنية محددة
export const getChequesByDateRange = async (startDate: string, endDate: string): Promise<ChequeDocument[]> => {
  try {
    return await Cheque.find({
      chequeDate: { $gte: startDate, $lte: endDate }
    })
      .populate('customerId', 'customerName companyName')
      .populate('paymentId');
  } catch (error) {
    throw new Error(`Failed to fetch cheques between ${startDate} and ${endDate}`);
  }
};