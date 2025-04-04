import mongoose, { Document, Schema, Model } from 'mongoose';

// Define interface for the methods
interface InvoiceMethods {
  calculateTotalAmount(): number;
  calculateRemainingAmount(): number;
}

// Extend the Document interface with our methods
export interface InvoiceDocument extends Document, InvoiceMethods {
  invoiceId: string;
  customerId: mongoose.Types.ObjectId;
  supplierId: mongoose.Types.ObjectId;
  customer: {
    customerName?: string;
    companyName?: string;
    phone?: number;
  };
  supplier: {
    supplierName?: string;
    companyName?: string;
    phone?: number;
  };
  amount: number;
  status: string;
  date: string;
  dueDate: string;
  createdAt: Date;
  updatedAt: Date;
  items: Array<{
    productId: number; //  mongoose.Types.ObjectId 
    productName: string;
    quantity: number;
    freeQuantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  issuedBy: number; //  mongoose.Types.ObjectId 
  terms: string;
  type: 'sales' | 'purchase';
  email: string;
  // Add both payments and expenses tracking
  payments: Array<{
    paymentId: mongoose.Types.ObjectId;
    amount: number;
    date: string;
    method: string;
    reference?: string;
  }>;
  expenses: Array<{
    expenseId: mongoose.Types.ObjectId;
    amount: number;
    date: string;
    method: string;
    reference?: string;
  }>;
  paidAmount: number;
  remainingAmount: number;
}

// Create a Model type that knows about InvoiceMethods
type InvoiceModel = Model<InvoiceDocument, {}, InvoiceMethods>;

const InvoiceSchema = new Schema(
  {
    invoiceId: { type: String, required: true, unique: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: false },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: false },
    customer: {
      customerName: { type: String },
      companyName: { type: String },
      phone: { type: Number }
    },
    email: { type: String },
    amount: { type: Number, required: true },
    status: { 
      type: String, 
      required: false, 
      enum: ['pending', 'paid', 'partially_paid', 'overdue', 'unpaid','draft'],
      set: function(this: InvoiceDocument, value: string) {
        if (value === 'partially_paid') {
          this.dueDate = this.dueDate; // Keep original dueDate
        }
        return value;
      }
    },
    date: { type: String, required: true },
    dueDate: { 
      type: String, 
      required: false,
      set: function(this: InvoiceDocument, value: string) {
        if (this.status === 'paid') {
          return value;
        } else if (this.status === 'partially_paid') {
          return "Incomplete";
        }
        return value;
      }
    },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        productName: { type: String, required: true }, // اسم المنتج
        quantity: { type: Number, required: true }, // الكمية المدفوعة
        freeQuantity: { type: Number, required: true, default: 0 },
        unitPrice: { type: Number, required: true }, // السعر للوحدة
        totalPrice: { type: Number, required: true }, // السعر الإجمالي
      },
    ],
    //issuedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // من أصدر الفاتورة
    terms: { type: String, required: false }, // الشروط
    type: { type: String, enum: ['sales', 'purchase'], default: 'sales' },
    // Add payment tracking fields
    payments: [
      {
        paymentId: { type: Schema.Types.ObjectId, ref: 'Payment', required: true },
        amount: { type: Number, required: true },
        date: { type: String, required: true },
        method: { type: String, required: true },
        reference: { type: String }
      }
    ],
    expenses: [
      {
        expenseId: { type: Schema.Types.ObjectId, ref: 'Expense', required: true },
        amount: { type: Number, required: true },
        date: { type: String, required: true },
        method: { type: String, required: true },
        reference: { type: String }
      }
    ],
    paidAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

InvoiceSchema.methods.calculateTotalAmount = function() {
  const totalAmount = this.items.reduce((sum: number, item: {
    productId: mongoose.Types.ObjectId;
    productName: string;
    quantity: number;
    freeQuantity: number;
    unitPrice: number;
    totalPrice: number;
  }) => sum + item.totalPrice, 0);
  this.amount = totalAmount + (this.bonus || 0);
  return this.amount;
};

// Add method to calculate remaining amount
InvoiceSchema.methods.calculateRemainingAmount = function() {
  // Calculate total from payments
  const paymentsAmount = (this.payments || []).reduce((sum: number, payment: {
    amount: number;
  }) => sum + payment.amount, 0);

  // Calculate total from expenses
  const expensesAmount = (this.expenses || []).reduce((sum: number, expense: {
    amount: number;
  }) => sum + expense.amount, 0);

  // Total amount paid from both payments and expenses
  const totalPaidAmount = this.type === 'sales' ? paymentsAmount : expensesAmount;
  
  this.paidAmount = totalPaidAmount;
  this.remainingAmount = this.amount - totalPaidAmount;
  
  // Update status based on payment status
  if (this.remainingAmount <= 0) {
    this.status = 'paid';
  } else if (this.paidAmount > 0) {
    this.status = 'partially_paid';
  }
  
  return this.remainingAmount;
};

// Fix the pre-save hook to avoid type casting issues
InvoiceSchema.pre('save', function(next) {
  if (this.payments && Array.isArray(this.payments)) {
    const paidAmount = this.payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    this.paidAmount = paidAmount;
    this.remainingAmount = this.amount - paidAmount;
    
    // Update status and dueDate based on payment status
    if (this.remainingAmount <= 0) {
      this.status = 'paid';
      // Set dueDate to the date of the last payment
      if (this.payments.length > 0) {
        const lastPayment = this.payments[this.payments.length - 1];
        this.dueDate = lastPayment.date;
      }
    } else if (this.paidAmount > 0) {
      this.status = 'partially_paid';
    }
  }
  next();
});

export default mongoose.model<InvoiceDocument, InvoiceModel>('Invoice', InvoiceSchema);
