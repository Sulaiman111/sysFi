import mongoose, { Document, Schema } from 'mongoose';

export interface ChequeDocument extends Document {
  chequeId: string;  // معرف الشيك الخاص
  chequeNumber: string;
  bankName: string;
  chequeDate: string;
  amount: number;
  holderName?: string;  // اسم صاحب الشيك (اختياري)
  holderPhone?: string;  // رقم هاتف صاحب الشيك (اختياري)
  status: string;  // حالة الشيك
  type: string;  // نوع الشيك (تم قبضه أم تم صرفه)
  customerId: mongoose.Types.ObjectId;  // العميل المرتبط بالشيك
  paymentId?: mongoose.Types.ObjectId;  // الدفعة المرتبطة بالشيك (اختياري)
  createdAt: Date;
  updatedAt: Date;
}

const ChequeSchema = new Schema({
  chequeId: { 
    type: String, 
    required: true, 
    unique: true,
    default: () => `CHQ-${Date.now()}-${Math.floor(Math.random() * 1000)}` 
  },  // معرف الشيك الخاص
  chequeNumber: { type: String, required: true },
  bankName: { type: String, required: true },
  chequeDate: { type: String, required: true },
  amount: { type: Number, required: true },
  holderName: { type: String, required: false },  // اسم صاحب الشيك (اختياري)
  holderPhone: { type: String, required: false },  // رقم هاتف صاحب الشيك (اختياري)
  status: { 
    type: String, 
    required: true, 
    enum: ['pending', 'cleared', 'bounced'],  // حالة الشيك
    default: 'pending' 
  },
  type: {
    type: String,
    required: true,
    enum: ['received', 'issued'],  
    default: 'received'
  },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  paymentId: { type: Schema.Types.ObjectId, ref: 'Payment', required: false },
}, { timestamps: true });

export default mongoose.model<ChequeDocument>('Cheque', ChequeSchema);