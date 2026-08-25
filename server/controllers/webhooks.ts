import { Request, Response } from "express";
import Stripe from "stripe";
import { prisma } from "../config/prisma.js";
import { inngest } from "../inngest/index.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const endpointSecret = process.env.STRIPE_WEBHOOKS_SECRET;

export const stripeWebhooks = async (request: Request, response: Response) => {
  let event: Stripe.Event;

  if (!endpointSecret) {
    console.error(" STRIPE_WEBHOOKS_SECRET non configurato nel file .env");
    return response.status(400).send("Webhook secret missing");
  }

  // Verifica la firma di Stripe
  const signature = request.headers['stripe-signature'];
  try {
    event = stripe.webhooks.constructEvent(
      request.body,
      signature as string,
      endpointSecret
    );
  } catch (error: any) {
    console.log(` Verifica della firma del Webhook fallita.`, error.message);
    return response.sendStatus(400);
  }

  // Gestione degli eventi
  switch (event.type) {
    case 'payment_intent.succeeded': {
  try {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    console.log(" PaymentIntent ricevuto:", paymentIntent.id);

    // Recupera la sessione di Checkout legata a questo pagamento
    const session = await stripe.checkout.sessions.list({
      payment_intent: paymentIntent.id,
    });

    // 1. Estrae l'orderId inviato nei metadata durante il checkout
    const orderId = session.data[0]?.metadata?.orderId;
    console.log(" Order ID estretto dai metadata:", orderId);

    if (!orderId) {
      console.log(" ATTENZIONE: Nessun orderId nei metadata! Verificare dove viene creata la sessione di checkout.");
      break;
    }

    // 2. Aggiorna l'ordine su Neon DB
    const paidOrder = await prisma.order.update({
      where: { id: orderId },
      data: { isPaid: true },
    });

    console.log(` SUCCESS: Ordine ${paidOrder.id} aggiornato su Neon DB (isPaid: true)`);

    // ... codice per decrementare lo stock e Inngest ...

  } catch (error: any) {
    console.error("Errore aggiornamento Neon DB:", error.message);
  }
  break;
}

    case 'payment_intent.canceled':
    case 'payment_intent.payment_failed': {
      try {
        const paymentIntentFailure = event.data.object as Stripe.PaymentIntent;
        const sessionFailure = await stripe.checkout.sessions.list({
          payment_intent: paymentIntentFailure.id
        });

        const failureOrderId = sessionFailure.data[0]?.metadata?.orderId;

        if (failureOrderId) {
          await prisma.order.delete({ where: { id: failureOrderId } });
          console.log(` Ordine annullato o fallito rimosso dal DB: ${failureOrderId}`);
        }
      } catch (error: any) {
        console.error(" Errore durante l'eliminazione dell'ordine fallito:", error.message);
      }
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Risposta di conferma a Stripe per chiudere correttamente la connessione
  return response.json({ received: true });
};