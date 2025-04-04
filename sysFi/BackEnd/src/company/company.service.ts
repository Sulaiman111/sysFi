import mongoose from 'mongoose';
import Company, { CompanyDocument } from './company.model';

// جلب جميع الشركات
export const getAllCompanies = async (): Promise<CompanyDocument[]> => {
  try {
    return await Company.find()
      .populate('authorizedUsers', 'username email role')
      .sort({ createdAt: -1 });
  } catch (error) {
    throw new Error('Failed to fetch companies');
  }
};

// جلب شركة بواسطة المعرف
export const getCompanyById = async (id: string): Promise<CompanyDocument | null> => {
  try {
    return await Company.findById(id)
      .populate('authorizedUsers', 'username email role')
      .populate('customers', 'customerName companyName');
  } catch (error) {
    throw new Error(`Failed to fetch company with ID: ${id}`);
  }
};

// إنشاء شركة جديدة
export const createCompany = async (companyData: Partial<CompanyDocument>): Promise<CompanyDocument> => {
  try {
    // التأكد من أن تاريخ انتهاء الاشتراك صالح
    if (!companyData.subscriptionEndDate) {
      // إعداد تاريخ انتهاء افتراضي (30 يومًا من الآن)
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      companyData.subscriptionEndDate = endDate;
    }
    
    const newCompany = new Company(companyData);
    return await newCompany.save();
  } catch (error) {
    console.error('Error creating company:', error);
    throw new Error('Failed to create company');
  }
};

// تحديث شركة
export const updateCompany = async (id: string, companyData: Partial<CompanyDocument>): Promise<CompanyDocument | null> => {
  try {
    return await Company.findByIdAndUpdate(id, companyData, { new: true });
  } catch (error) {
    throw new Error(`Failed to update company with ID: ${id}`);
  }
};

// حذف شركة
export const deleteCompany = async (id: string): Promise<CompanyDocument | null> => {
  try {
    return await Company.findByIdAndDelete(id);
  } catch (error) {
    throw new Error(`Failed to delete company with ID: ${id}`);
  }
};

// Fix for the Company type issue in updateSubscription method

// تحديث حالة اشتراك الشركة
export const updateSubscription = async (
  companyId: string, 
  subscriptionType: string,
  subscriptionEndDate: Date
): Promise<CompanyDocument | null> => {
  try {
    // Changed CompanyModel to Company
    return await Company.findByIdAndUpdate(
      companyId, 
      { 
        subscriptionType,
        subscriptionStatus: subscriptionType === 'expired' ? 'expired' : 'active',
        subscriptionEndDate
      }, 
      { new: true }
    );
  } catch (error) {
    console.error(`Error updating subscription for company with id ${companyId}:`, error);
    throw error;
  }
};

// إضافة مستخدم مصرح له
export const addAuthorizedUser = async (companyId: string, userId: string): Promise<CompanyDocument | null> => {
  try {
    return await Company.findByIdAndUpdate(
      companyId,
      { $addToSet: { authorizedUsers: userId } },
      { new: true }
    );
  } catch (error) {
    throw new Error(`Failed to add authorized user to company with ID: ${companyId}`);
  }
};

// إزالة مستخدم مصرح له
export const removeAuthorizedUser = async (companyId: string, userId: string): Promise<CompanyDocument | null> => {
  try {
    return await Company.findByIdAndUpdate(
      companyId,
      { $pull: { authorizedUsers: userId } },
      { new: true }
    );
  } catch (error) {
    throw new Error(`Failed to remove authorized user from company with ID: ${companyId}`);
  }
};

// إضافة عميل إلى الشركة
export const addCustomerToCompany = async (companyId: string, customerId: string): Promise<CompanyDocument | null> => {
  try {
    return await Company.findByIdAndUpdate(
      companyId,
      { $addToSet: { customers: customerId } },
      { new: true }
    );
  } catch (error) {
    throw new Error(`Failed to add customer to company with ID: ${companyId}`);
  }
};

// البحث عن شركات
export const searchCompanies = async (query: string): Promise<CompanyDocument[]> => {
  try {
    return await Company.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { contactEmail: { $regex: query, $options: 'i' } },
        { taxNumber: { $regex: query, $options: 'i' } }
      ]
    });
  } catch (error) {
    throw new Error(`Failed to search companies with query: ${query}`);
  }
};

// الحصول على الشركات التي ستنتهي اشتراكاتها قريبًا
export const getExpiringSubscriptions = async (daysThreshold: number = 7): Promise<CompanyDocument[]> => {
  try {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);
    
    return await Company.find({
      subscriptionStatus: 'active',
      subscriptionEndDate: { 
        $gte: new Date(), 
        $lte: thresholdDate 
      }
    });
  } catch (error) {
    throw new Error('Failed to fetch companies with expiring subscriptions');
  }
};