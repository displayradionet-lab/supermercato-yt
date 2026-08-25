import { createTransport } from "nodemailer";

// Creazione del transporter con timeout rigidi per Vercel/Serverless
const transporter = createTransport({
  host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // TLS tramite STARTTLS su porta 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // TIMEOUT FONDAMENTALI PER INNGEST E VERCEL:
  connectionTimeout: 5000, // 5s max per connettersi
  greetingTimeout: 5000,   // 5s max per salutare il server SMTP
  socketTimeout: 5000,     // 5s max di inattività
});

const sendEmail = async ({
  to,
  subject,
  body,
}: {
  to: string;
  subject: string;
  body: string;
}) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("Mancano le credenziali SMTP_USER o SMTP_PASS nelle environment variables.");
  }

  const senderEmail = process.env.SENDER_EMAIL;
  if (!senderEmail) {
    throw new Error("Manca SENDER_EMAIL nelle variabili d'ambiente.");
  }

  const res = await transporter.sendMail({
    from: `"Supermercato-yt" <${senderEmail}>`,
    to,
    subject,
    html: body,
  });

  return res;
};

export default sendEmail;