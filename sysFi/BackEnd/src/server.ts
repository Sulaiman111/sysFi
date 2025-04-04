import express from 'express';
const mongoose = require('mongoose');
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './user/user.routes'
import customerRoutes from './customer/customer.routes'
import invoiceRoutes from './invoice/invoice.routes';
import paymentRoutes from './payment/payment.routes';
import chequeRoutes from './cheque/cheque.routes';
import companyRoutes from './company/company.routes';
import supplierRoutes from './supplier/supplier.routes'
import expenseRoutes from './expense/expense.routes'
import { startSubscriptionNotificationCron } from './cron/subscription-notifications';




dotenv.config(); 

const app = express();
const PORT = 5002;

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api', customerRoutes);
app.use('/api', supplierRoutes);
app.use('/api', invoiceRoutes);
app.use('/api', paymentRoutes);
app.use('/api', expenseRoutes);
app.use('/api', companyRoutes);
app.use('/api', chequeRoutes);
app.use('/api', companyRoutes);
//الاتصال مع الداتابيس 
mongoose.connect('mongodb+srv://user:11223344@cluster0.rjvvx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log("Database connection successful"))
  .catch((err: Error) => console.log("Database connection failed", err));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  startSubscriptionNotificationCron();
});
