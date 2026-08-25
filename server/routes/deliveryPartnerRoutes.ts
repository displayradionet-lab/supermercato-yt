import express from 'express';
import { 
  cancelDelivery, 
  completeDelivery, 
  getDeliveryDetail, 
  getMyDeliveries, // 👈 Assicurati di importare la funzione per recuperare le consegne
  loginPartner, 
  togglePartnerStatus, 
  updateDeliveryStatus, 
  updateLocation 
} from '../controllers/deliveryPartnerController.js';
import deliveryAuth from '../middleware/deliveryAuth.js';

const deliveryPartnerRouter = express.Router();
deliveryPartnerRouter.post('/login', loginPartner);


deliveryPartnerRouter.put('/partner/:id/status', deliveryAuth, togglePartnerStatus);
deliveryPartnerRouter.put('/:id', deliveryAuth, togglePartnerStatus);


deliveryPartnerRouter.get('/my-deliveries', deliveryAuth, getMyDeliveries);

deliveryPartnerRouter.get('/my-deliveries/:id', deliveryAuth, getDeliveryDetail);

// Aggiornamento stato e azioni sulla consegna
deliveryPartnerRouter.put('/my-deliveries/:id/complete', deliveryAuth, completeDelivery);
deliveryPartnerRouter.put('/my-deliveries/:id/cancel', deliveryAuth, cancelDelivery);
deliveryPartnerRouter.put('/my-deliveries/:id/status', deliveryAuth, updateDeliveryStatus);
deliveryPartnerRouter.put('/my-deliveries/:id/location', deliveryAuth, updateLocation);

export default deliveryPartnerRouter;