
import User from './user.model';
import { Document } from 'mongoose';

// Keep using the UserDocument interface that's already defined in this file
interface UserDocument extends Document {
  username: string;
  password: string;
  phone: number;
  role: string;
  nots?: string;
}

export const createUser = async (userData: {
  username: string;
  password: string;
  phone: number;
  role: string;
  nots?: string;
}): Promise<UserDocument> => {
  try {
    const newUser = new User(userData);
    return (await newUser.save()) as UserDocument;
  } catch (error) {
    throw error;
  }
};

export const getAllUsers = async (): Promise<UserDocument[]> => {
  try {
    return await User.find();
  } catch (error) {
    throw error;
  }
};

export const getUserById = async (id: string): Promise<UserDocument | null> => {
  try {
    return await User.findById(id);
  } catch (error) {
    throw error;
  }
};

export const updateUser = async (
  id: string,
  userData: Partial<UserDocument>
): Promise<UserDocument | null> => {
  try {
    return await User.findByIdAndUpdate(id, userData, { new: true });
  } catch (error) {
    throw error;
  }
};

export const deleteUser = async (id: string): Promise<UserDocument | null> => {
  try {
    return await User.findByIdAndDelete(id);
  } catch (error) {
    throw error;
  }
};

export const getUserByUsername = async (username: string): Promise<UserDocument | null> => {
  try {
    return await User.findOne({ username });
  } catch (error) {
    throw error;
  }
};

// Add these functions to your user.service.ts file

/**
 * الحصول على المستخدمين المصرح لهم للشركة
 */
export interface AuthorizedUser {
  id: string;
  email: string;
  name: string;
}

export const getAuthorizedUsersForCompany = async (companyId: string): Promise<AuthorizedUser[]> => {
  try {
    // Changed UserModel to User
    const users = await User.find({ 
      authorizedCompanies: { $in: [companyId] } 
    });
    
    return users.map(user => {
      const userDoc = user as UserDocument;
      return {
        id: userDoc._id ? userDoc._id.toString() : String(user._id),
        email: userDoc.username, // Using username as email since email property doesn't exist
        name: userDoc.username
      };
    });
  } catch (error) {
    console.error(`Error getting authorized users for company ${companyId}:`, error);
    throw error;
  }
};

/**
 * الحصول على المستخدمين المشرفين
 */
export const getAdminUsers = async (): Promise<AuthorizedUser[]> => {
  try {
    // Changed UserModel to User
    const admins = await User.find({ role: 'admin' });
    
    return admins.map(admin => {
      const adminDoc = admin as UserDocument;
      return {
        id: adminDoc._id ? adminDoc._id.toString() : String(admin._id),
        email: adminDoc.username, // Using username as email since email property doesn't exist
        name: adminDoc.username
      };
    });
  } catch (error) {
    console.error('Error getting admin users:', error);
    throw error;
  }
};

/**
 * إرسال إشعار إلى البريد الإلكتروني الرسمي للشركة
 */
export const sendNotificationToCompanyEmail = async (
  companyId: string, 
  subject: string, 
  message: string
): Promise<boolean> => {
  try {
    // هنا يمكنك استخدام خدمة البريد الإلكتروني لإرسال رسالة إلى البريد الرسمي للشركة
    // يمكن استخدام nodemailer أو أي خدمة أخرى
    
    console.log(`Sending email notification to company ${companyId}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);
    
    // هنا يجب إضافة كود الإرسال الفعلي
    
    return true;
  } catch (error) {
    console.error(`Error sending notification to company ${companyId}:`, error);
    return false;
  }
};

/**
 * إرسال إشعار إلى مستخدمي الشركة عبر الواتساب
 */
export const sendWhatsAppNotificationToUsers = async (
  companyId: string,
  message: string
): Promise<boolean> => {
  try {
    // الحصول على المستخدمين المصرح لهم للشركة
    const users = await getAuthorizedUsersForCompany(companyId);
    
    // إرسال رسالة واتساب لكل مستخدم
    for (const user of users) {
      // هنا يمكنك استخدام واجهة برمجة تطبيقات الواتساب لإرسال الرسائل
      // مثل twilio أو أي خدمة أخرى
      
      console.log(`Sending WhatsApp message to user ${user.name}`);
      console.log(`Message: ${message}`);
      
      // هنا يجب إضافة كود الإرسال الفعلي
    }
    
    return true;
  } catch (error) {
    console.error(`Error sending WhatsApp notifications for company ${companyId}:`, error);
    return false;
  }
};