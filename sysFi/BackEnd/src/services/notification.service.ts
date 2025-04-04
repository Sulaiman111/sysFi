import nodemailer from 'nodemailer';
import * as companyService from '../company/company.service';
import * as userService from '../user/user.service';
import { AuthorizedUser } from '../user/user.service';

// إعداد ناقل البريد الإلكتروني
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'user@example.com',
    pass: process.env.SMTP_PASSWORD || 'password',
  },
});

/**
 * إرسال إشعار بريد إلكتروني
 */
export const sendEmail = async (to: string, subject: string, html: string): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@example.com',
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

/**
 * إرسال إشعار انتهاء الاشتراك
 */
export const sendSubscriptionExpirationNotice = async (companyId: string, daysRemaining: number): Promise<boolean> => {
  try {
    const company = await companyService.getCompanyById(companyId);
    
    if (!company) {
      console.error(`Company not found: ${companyId}`);
      return false;
    }
    
    // الحصول على المستخدمين المصرح لهم للشركة
    const authorizedUsers = await userService.getAuthorizedUsersForCompany(companyId);
    
    if (!authorizedUsers || authorizedUsers.length === 0) {
      console.error(`No authorized users found for company: ${companyId}`);
      return false;
    }
    
    // إنشاء محتوى البريد الإلكتروني
    const subject = `تنبيه: اشتراك ${company.name} سينتهي قريبًا`;
    const html = `
      <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>تنبيه انتهاء الاشتراك</h2>
        <p>مرحبًا،</p>
        <p>نود إعلامكم أن اشتراك شركتكم <strong>${company.name}</strong> سينتهي خلال <strong>${daysRemaining} يوم(أيام)</strong>.</p>
        <p>تاريخ انتهاء الاشتراك: <strong>${company.subscriptionEndDate}</strong></p>
        <p>لضمان استمرارية الخدمة، يرجى تجديد اشتراكك قبل تاريخ الانتهاء.</p>
        <p>يمكنك تجديد الاشتراك من خلال لوحة التحكم الخاصة بك أو الاتصال بفريق الدعم الخاص بنا.</p>
        <p>شكرًا لاستخدامك خدماتنا!</p>
        <p>مع أطيب التحيات،<br>فريق الدعم</p>
      </div>
    `;
    
    // إرسال البريد الإلكتروني إلى جميع المستخدمين المصرح لهم
    const emailPromises = authorizedUsers.map((user: AuthorizedUser) => 
      sendEmail(user.email, subject, html)
    );
    
    await Promise.all(emailPromises);
    return true;
  } catch (error) {
    console.error('Error sending subscription expiration notice:', error);
    return false;
  }
};

/**
 * إرسال إشعار انتهاء الاشتراك للمشرف
 */
export const sendAdminSubscriptionExpirationNotice = async (companyId: string): Promise<boolean> => {
  try {
    const company = await companyService.getCompanyById(companyId);
    
    if (!company) {
      console.error(`Company not found: ${companyId}`);
      return false;
    }
    
    // الحصول على المشرفين
    const admins = await userService.getAdminUsers();
    
    if (!admins || admins.length === 0) {
      console.error('No admin users found');
      return false;
    }
    
    // إنشاء محتوى البريد الإلكتروني
    const subject = `تنبيه للمشرف: اشتراك ${company.name} انتهى`;
    const html = `
      <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>تنبيه انتهاء اشتراك شركة</h2>
        <p>مرحبًا،</p>
        <p>نود إعلامكم أن اشتراك شركة <strong>${company.name}</strong> قد انتهى.</p>
        <p>تاريخ انتهاء الاشتراك: <strong>${company.subscriptionEndDate}</strong></p>
        <p>معلومات الاتصال بالشركة:</p>
        <ul>
          <li>البريد الإلكتروني: ${company.contactEmail}</li>
          <li>رقم الهاتف: ${company.contactPhone}</li>
        </ul>
        <p>يرجى متابعة الأمر مع الشركة لتجديد اشتراكها.</p>
      </div>
    `;
    
    // إرسال البريد الإلكتروني إلى جميع المشرفين
    const emailPromises = admins.map((admin: AuthorizedUser) => 
      sendEmail(admin.email, subject, html)
    );
    
    await Promise.all(emailPromises);
    return true;
  } catch (error) {
    console.error('Error sending admin subscription expiration notice:', error);
    return false;
  }
};

/**
 * جدولة إشعارات انتهاء الاشتراك
 * يتم تشغيل هذه الوظيفة بواسطة مهمة cron
 */
export const scheduleSubscriptionExpirationNotices = async (): Promise<void> => {
  try {
    // الحصول على الشركات التي ستنتهي اشتراكاتها خلال 30 يومًا
    const expiringCompanies = await companyService.getExpiringSubscriptions(30);
    
    for (const company of expiringCompanies) {
      const today = new Date();
      const expirationDate = new Date(company.subscriptionEndDate);
      const daysRemaining = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // إرسال إشعارات في أوقات محددة قبل انتهاء الاشتراك
      if (daysRemaining === 30 || daysRemaining === 14 || daysRemaining === 7 || daysRemaining === 3 || daysRemaining === 1) {
        await sendSubscriptionExpirationNotice(company.id, daysRemaining);
      }
      
      // إذا انتهى الاشتراك اليوم، أرسل إشعارًا للمشرف
      if (daysRemaining === 0) {
        await sendAdminSubscriptionExpirationNotice(company.id);
        
        // تحديث حالة اشتراك الشركة إلى "منتهي"
        // Fix: use updateSubscription instead of updateSubscriptionStatus
        await companyService.updateSubscription(company.id, 'expired', company.subscriptionEndDate);
      }
    }
  } catch (error) {
    console.error('Error scheduling subscription expiration notices:', error);
  }
};