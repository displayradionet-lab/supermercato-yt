/* eslint-disable @typescript-eslint/no-explicit-any */
import { KeyRoundIcon } from 'lucide-react'

export default function OrderOTP({ order }: { order: any }) {
    if (!order) return null;

    // Recupera l'OTP (con fallback se manca nel mock/DB)
    const rawOtp = order.deliveryOtp ?? order.otp ?? order.code;
    const otp = rawOtp !== undefined && rawOtp !== null ? String(rawOtp) : "";

    // Trasforma lo stato corrente in minuscolo
    const currentStatus = String(order.status || "").toLowerCase();

    // Includiamo TUTTI gli stati dell'ordine per cui vuoi mostrare l'OTP
    const allowedStatuses = [
        "placed", 
        "confirmed", 
        "assigned", 
        "packed", 
        "out for delivery",
        "delivered" // Aggiungilo se vuoi vederlo sempre anche a consegna completata
    ];
    
    // Mostra l'OTP se c'è un codice e lo stato è tra quelli consentiti
    const showOtp = otp.length > 0 && allowedStatuses.includes(currentStatus);

    if (!showOtp) return null;

    return (
        <div className="bg-gradient-to-r from-app-green to-app-green-light rounded-2xl p-6 text-white mb-6">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
                    <KeyRoundIcon className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-semibold">Delivery OTP</h3>
                    <p className="text-xs text-white/70">Share this with your delivery partner</p>
                </div>
            </div>
            <div className="flex gap-2 mt-2">
                {otp.split("").map((digit: string, i: number) => (
                    <div 
                        key={i} 
                        className="w-11 h-12 rounded-xl bg-white/15 flex items-center justify-center text-2xl font-mono font-bold tracking-wider"
                    >
                        {digit}
                    </div>
                ))}
            </div>
        </div>
    );
}