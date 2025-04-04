import mongoose, { Document, Schema } from 'mongoose';

export interface CustomerDocument extends Document {
  customerName: string;
  companyName: string;
  customerType: string;
  phone: string;
  balanceDue: number;
  invoiceList: mongoose.Types.ObjectId[]; 
  paymentList: mongoose.Types.ObjectId[]; 
  geographicalLocation: string;
  location: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema({
  customerName: { type: String, required: true },
  companyName: { type: String, required: true },
  customerType: { type: String, required: true },
  phone: { type: String, required: true },
  balanceDue: { type: Number, default: 0 },
  invoiceList: [{ type: Schema.Types.ObjectId, ref: 'Invoice' }], 
  paymentList: [{ type: Schema.Types.ObjectId, ref: 'Payment' }],
  geographicalLocation: { type: String, required: true },
  location: { type: String, required: true },
  notes: { type: String }
}, { timestamps: true });

export default mongoose.model<CustomerDocument>('Customer', CustomerSchema);