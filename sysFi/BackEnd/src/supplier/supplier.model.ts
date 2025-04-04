import mongoose, { Document, Schema } from 'mongoose';

export interface SupplierDocument extends Document {
  supplierName: string;
  companyName: string;
  supplierType: string;
  phone: string;
  balanceDue: number;
  invoiceList: mongoose.Types.ObjectId[]; 
  expenseList: mongoose.Types.ObjectId[]; 
  geographicalLocation: string;
  location: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema = new Schema({
  supplierName: { type: String, required: true },
  companyName: { type: String, required: true },
  supplierType: { type: String, required: true },
  phone: { type: String, required: true },
  balanceDue: { type: Number, default: 0 },
  invoiceList: [{ type: Schema.Types.ObjectId, ref: 'Invoice' }], 
  expenseList: [{ type: Schema.Types.ObjectId, ref: 'Expense' }],
  geographicalLocation: { type: String, required: true },
  location: { type: String, required: true },
  notes: { type: String }
}, { timestamps: true });

export default mongoose.model<SupplierDocument>('Supplier', SupplierSchema);