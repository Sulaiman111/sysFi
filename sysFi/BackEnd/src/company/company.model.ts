import mongoose, { Document, Schema } from 'mongoose';

export interface CompanyDocument extends Document {
  name: string;
  logo: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  registrationDate: Date;
  subscriptionEndDate: Date;
  subscriptionType: 'basic' | 'premium' | 'enterprise';
  subscriptionStatus: 'active' | 'expired' | 'trial';
  contactEmail: string;
  contactPhone: string;
  website: string;
  taxNumber: string;
  authorizedUsers: mongoose.Types.ObjectId[];
  customers: mongoose.Types.ObjectId[];
  notes: string;
  settings: {
    theme: string;
    currency: string;
    language: string;
    timezone: string;
    invoicePrefix: string;
    fiscalYearStart: string;
  };
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<CompanyDocument>(
  {
    name: { type: String, required: true },
    logo: { type: String, default: '' },
    address: { type: String, default: '' },
    location: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 }
    },
    registrationDate: { type: Date, default: Date.now },
    subscriptionEndDate: { type: Date, required: true },
    subscriptionType: { 
      type: String, 
      enum: ['basic', 'premium', 'enterprise'], 
      default: 'basic' 
    },
    subscriptionStatus: { 
      type: String, 
      enum: ['active', 'expired', 'trial'], 
      default: 'trial' 
    },
    contactEmail: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    website: { type: String, default: '' },
    taxNumber: { type: String, default: '' },
    authorizedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    customers: [{ type: Schema.Types.ObjectId, ref: 'Customer' }],
    notes: { type: String, default: '' },
    settings: {
      theme: { type: String, default: 'light' },
      currency: { type: String, default: 'USD' },
      language: { type: String, default: 'en' },
      timezone: { type: String, default: 'UTC' },
      invoicePrefix: { type: String, default: 'INV-' },
      fiscalYearStart: { type: String, default: '01-01' }
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// إنشاء فهرس للبحث السريع
CompanySchema.index({ name: 'text', contactEmail: 'text' });

// التحقق من حالة الاشتراك قبل الحفظ
CompanySchema.pre('save', function(next) {
  const company = this;
  
  // تحديث حالة الاشتراك بناءً على تاريخ انتهاء الاشتراك
  if (company.subscriptionEndDate < new Date()) {
    company.subscriptionStatus = 'expired';
  }
  
  next();
});

export default mongoose.model<CompanyDocument>('Company', CompanySchema);