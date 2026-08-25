import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import authRouter from './routes/authRoutes.js';
import productRouter from './routes/productRoutes.js';
import uploadRouter from './routes/uploadRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import { serve } from 'inngest/express';
import { inngest, functions } from './inngest/index.js';
import addressRouter from './routes/addressesRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import deliveryPartnerRouter from './routes/deliveryPartnerRoutes.js';
import { stripeWebhooks } from './controllers/webhooks.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

app.post(
  '/api/stripe',
  express.raw({ type: 'application/json' }),
  stripeWebhooks,
);
// Middleware
app.use(cors({
  origin: '*', // Se vuoi essere specifico: 'https://tuo-frontend.vercel.app'
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
// Ricostruzione di __dirname per gli ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Aggiungi questa riga nel file principale del server:
app.use(
  '/images',
  express.static(path.join(__dirname, '../client/public/images')),
);

const port = process.env.PORT || 4000;

app.get('/', (req: Request, res: Response) => {
  res.send('Server is live!');
});

app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/orders', orderRouter);
app.use('/api/inngest', serve({ client: inngest, functions }));
app.use('/api/addresses', addressRouter);
app.use('/api/admin', adminRouter);
app.use('/api/admin/delivery-partners', deliveryPartnerRouter);
app.use('/api/delivery', deliveryPartnerRouter);

// Error handling
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error(error);
  res.status(500).json({ message: error.message });
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server in esecuzione sulla porta ${PORT}`);
  });
}


export default app;