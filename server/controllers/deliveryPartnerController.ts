import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const generateToken = (id: string) => {
  return jwt.sign({ id, role: 'delivery' }, process.env.JWT_SECRET as string, {
    expiresIn: '30d',
  });
};

// Login Delivery partner
// POST /api/delivery/Login
export const loginPartner = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and pwd' });
    }

    const partner = await prisma.deliveryPartner.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (!partner) {
      return res.status(400).json({ message: 'Invalid email and pwd' });
    }

    if (!partner.isActive) {
      return res
        .status(403)
        .json({ message: 'Your account has been deactivated' });
    }

    const isMatch = await bcrypt.compare(password, partner.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or pwd' });
    }

    const token = generateToken(partner.id);
    const { password: _, ...partnerData } = partner;

    return res.json({ partner: partnerData, token });
  } catch (error: any) {
    console.error('Errore login partner:', error);
    return res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};

// togglePartnerStatus
export const togglePartnerStatus = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { isActive } = req.body;

    const updatedPartner = await prisma.deliveryPartner.update({
      where: { id },
      data: {
        isActive: isActive,
      },
    });

    return res.json({
      message: 'Partner status updated successfully',
      updatedPartner,
    });
  } catch (error: any) {
    console.error('Errore aggiornamento partner:', error);
    return res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};

// Get assigned deliveries GET /api/delivery/my-deliveries
export const getMyDeliveries = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const partnerId = (req as any).partner?.id || (req as any).user?.id;

    if (!partnerId) {
      return res.status(401).json({ message: 'Partner non autorizzato' });
    }

    const where: any = { deliveryPartnerId: partnerId };

    if (status === 'active') {
      where.status = {
        in: [
          'placed', 'Placed', 'PLACED',
          'Assigned', 'assigned', 'ASSIGNED',
          'Packed', 'packed', 'PACKED',
          'Out for Delivery', 'Out_for_Delivery', 'out_for_delivery', 'Out_of_Delivery'
        ]
      };
    } else if (status === 'completed') {
      where.status = {
        in: ['Delivered', 'delivered', 'DELIVERED', 'Cancelled', 'cancelled', 'CANCELLED']
      };
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, phone: true } },
        // 👈 Nessun 'address: true' qui! 'shippingAddress' viene già estratto in automatico.
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ orders });
  } catch (error: any) {
    console.error('Errore durante il recupero delle consegne:', error);
    return res.status(500).json({ message: error.message });
  }
};

// get single delivery detail - GET /api/delivery/my-deliveries/:id
export const getDeliveryDetail = async (req: Request, res: Response) => {
  try {
    const partnerId = (req as any).partner?.id || (req as any).user?.id;

    if (!partnerId) {
      return res.status(401).json({ message: 'Partner non autorizzato' });
    }

    const order = await prisma.order.findFirst({
      where: { id: req.params.id as string, deliveryPartnerId: partnerId },
      include: { 
        user: { select: { name: true, email: true, phone: true } },
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    return res.json({ order });
  } catch (error: any) {
    console.error('Errore getDeliveryDetail:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Update order status - PUT /api/delivery/my-deliveries/:id/status
export const updateDeliveryStatus = async (req: Request, res: Response) => {
  try {
    // 1. Estrai l'ID garantendo che sia una stringa singola
    const orderId = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
    const { status } = req.body;
    const partnerId = (req as any).partner?.id || (req as any).user?.id;

    if (!partnerId) {
      return res.status(401).json({ message: 'Partner non autorizzato' });
    }

    // 2. Cerca PRIMA l'ordine nel DB per verificare che esista ed appartenga al rider
    const order = await prisma.order.findFirst({
      where: { id: orderId, deliveryPartnerId: partnerId },
    });

    if (!order) {
      return res.status(404).json({ message: 'Ordine non trovato o non assegnato a te' });
    }

    // 3. Calcola il nuovo valore di isPaid basandoti sull'ordine appena trovato
    const isPaidUpdate: boolean = (status.toLowerCase() === 'delivered')
     ? true : Boolean(order.isPaid);

    // 4. Esegui l'aggiornamento
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: status,
        isPaid: isPaidUpdate,
      },
    });

    return res.json({ message: 'Stato aggiornato', order: updatedOrder });
  } catch (error: any) {
    console.error('Errore aggiornamento stato:', error);
    return res.status(500).json({ message: error.message || 'Errore durante l\'aggiornamento' });
  }
};

// Complete del OTP - PUT /api/delivery/my-deliveries/:id/complete
export const completeDelivery = async (req: Request, res: Response) => {
  try {
    const { otp } = req.body;
    const partnerId = (req as any).partner?.id || (req as any).user?.id;

    const order = await prisma.order.findFirst({
      where: { id: req.params.id as string, deliveryPartnerId: partnerId },
    });

    if (!order || order.status.toLowerCase() === 'cancelled' || order.status.toLowerCase() === 'delivered') {
      return res.status(400).json({ message: 'Invalid request' });
    }

    if (order.deliveryOtp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    const history = (order.statusHistory as any[]) || [];

    history.push({
      status: 'Delivered',
      note: 'Delivered by partner via OTP',
      timeStamp: new Date(),
    });

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { 
        status: 'Delivered', 
        isPaid: true, // Imposta a true alla consegna
        statusHistory: history, 
        deliveryOtp: '' 
      },
    });

    return res.json({ order: updatedOrder, message: 'Delivery completed successfully' });
  } catch (error: any) {
    console.error('Errore completeDelivery:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Cancel delivery - PUT /api/delivery/my-deliveries/:id/cancel
export const cancelDelivery = async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    const partnerId = (req as any).partner?.id || (req as any).user?.id;

    const order = await prisma.order.findFirst({
      where: { id: req.params.id as string, deliveryPartnerId: partnerId },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status.toLowerCase() === 'delivered') {
      return res.status(400).json({ message: 'Cannot cancel delivered order' });
    }

    const history = (order.statusHistory as any[]) || [];

    history.push({
      status: 'Cancelled',
      note: reason || '',
      timeStamp: new Date(),
    });

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { status: 'Cancelled', statusHistory: history },
    });

    return res.json({ order: updatedOrder, message: 'Delivery cancelled' });
  } catch (error: any) {
    console.error('Errore cancelDelivery:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Update live location - PUT /api/delivery/my-deliveries/:id/location
export const updateLocation = async (req: Request, res: Response) => {
  try {
    const { lat, lng } = req.body;
    const partnerId = (req as any).partner?.id || (req as any).user?.id;

    const order = await prisma.order.findFirst({
      where: {
        id: req.params.id as string,
        deliveryPartnerId: partnerId,
        status: { 
          in: [
            'placed', 'Placed', 
            'Assigned', 'assigned', 
            'Packed', 'packed', 
            'Out for Delivery', 'Out_for_Delivery', 'Out_of_Delivery'
          ] 
        },
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or inactive' });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { liveLocation: { lat, lng, updatedAt: new Date() } },
    });

    return res.json({ success: true });
  } catch (error: any) {
    console.error('Errore updateLocation:', error);
    return res.status(500).json({ message: error.message });
  }
};