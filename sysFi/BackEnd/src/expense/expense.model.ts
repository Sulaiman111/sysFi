import mongoose, { Document, Schema } from 'mongoose';

export interface ExpenseDocument extends Document {
  expenseId: string;
  supplierId: mongoose.Types.ObjectId;
  invoiceId: mongoose.Types.ObjectId;
  amount: number;
  method: string;
  date: string;
  cheques: mongoose.Types.ObjectId[];  
  createdBy: mongoose.Types.ObjectId;
  status: string;          // إضافة حالة الدفعة
  notes: string;           // إضافة ملاحظات
  reference: string;       // إضافة رقم مرجعي
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema({
  expenseId: { type: String, required: true, unique: true },
  supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
  invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: false },
  amount: { type: Number, required: true },
  method: { type: String, required: true, enum: ['cash', 'check'] },
  date: { type: String, required: true },
  cheques: [{ type: Schema.Types.ObjectId, ref: 'Cheque' }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'completed'
  },
  notes: { type: String },
  reference: { type: String },
}, { timestamps: true });

export default mongoose.model<ExpenseDocument>('Expense', ExpenseSchema);