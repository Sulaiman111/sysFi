import { Request, Response } from 'express';
import * as companyService from './company.service';

// Extend the Express Request type to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    [key: string]: any;
  };
}

// الحصول على جميع الشركات
export const getAllCompanies = async (req: Request, res: Response): Promise<void> => {
  try {
    const companies = await companyService.getAllCompanies();
    res.json(companies);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch companies';
    res.status(500).json({ error: errorMessage });
  }
};

// الحصول على شركة بواسطة المعرف
export const getCompanyById = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyId = req.params.id;
    const company = await companyService.getCompanyById(companyId);
    
    if (!company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }
    
    res.json(company);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch company';
    res.status(500).json({ error: errorMessage });
  }
};

// إنشاء شركة جديدة
export const createCompany = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // إضافة معرف المستخدم الذي أنشأ الشركة
    const companyData = {
      ...req.body,
      createdBy: req.body.userId || req.user?.id // يعتمد على كيفية تخزين معلومات المستخدم في الطلب
    };
    
    const newCompany = await companyService.createCompany(companyData);
    res.status(201).json(newCompany);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create company';
    res.status(500).json({ error: errorMessage });
  }
};

// تحديث شركة
export const updateCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyId = req.params.id;
    const companyData = req.body;
    
    const updatedCompany = await companyService.updateCompany(companyId, companyData);
    
    if (!updatedCompany) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }
    
    res.json(updatedCompany);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update company';
    res.status(500).json({ error: errorMessage });
  }
};

// حذف شركة
export const deleteCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyId = req.params.id;
    const deletedCompany = await companyService.deleteCompany(companyId);
    
    if (!deletedCompany) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }
    
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete company';
    res.status(500).json({ error: errorMessage });
  }
};

// تحديث اشتراك الشركة
export const updateSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyId = req.params.id;
    const { subscriptionType, subscriptionEndDate } = req.body;
    
    if (!subscriptionType || !subscriptionEndDate) {
      res.status(400).json({ error: 'Subscription type and end date are required' });
      return;
    }
    
    const endDate = new Date(subscriptionEndDate);
    const updatedCompany = await companyService.updateSubscription(
      companyId, 
      subscriptionType, 
      endDate
    );
    
    if (!updatedCompany) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }
    
    res.json(updatedCompany);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update subscription';
    res.status(500).json({ error: errorMessage });
  }
};

// إضافة مستخدم مصرح له
export const addAuthorizedUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyId = req.params.id;
    const { userId } = req.body;
    
    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }
    
    const updatedCompany = await companyService.addAuthorizedUser(companyId, userId);
    
    if (!updatedCompany) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }
    
    res.json(updatedCompany);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to add authorized user';
    res.status(500).json({ error: errorMessage });
  }
};

// إزالة مستخدم مصرح له
export const removeAuthorizedUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyId = req.params.id;
    const { userId } = req.body;
    
    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }
    
    const updatedCompany = await companyService.removeAuthorizedUser(companyId, userId);
    
    if (!updatedCompany) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }
    
    res.json(updatedCompany);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to remove authorized user';
    res.status(500).json({ error: errorMessage });
  }
};

// إضافة عميل إلى الشركة
export const addCustomerToCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyId = req.params.id;
    const { customerId } = req.body;
    
    if (!customerId) {
      res.status(400).json({ error: 'Customer ID is required' });
      return;
    }
    
    const updatedCompany = await companyService.addCustomerToCompany(companyId, customerId);
    
    if (!updatedCompany) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }
    
    res.json(updatedCompany);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to add customer to company';
    res.status(500).json({ error: errorMessage });
  }
};

// البحث عن شركات
export const searchCompanies = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query.q as string;
    if (!query) {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }
    
    const companies = await companyService.searchCompanies(query);
    res.json(companies);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to search companies';
    res.status(500).json({ error: errorMessage });
  }
};

// الحصول على الشركات التي ستنتهي اشتراكاتها قريبًا
export const getExpiringSubscriptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const daysThreshold = parseInt(req.query.days as string) || 7;
    const companies = await companyService.getExpiringSubscriptions(daysThreshold);
    res.json(companies);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch companies with expiring subscriptions';
    res.status(500).json({ error: errorMessage });
  }
};