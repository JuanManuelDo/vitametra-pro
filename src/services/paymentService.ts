export type PaymentGateway = 'STRIPE_GOOGLE_PAY' | 'MERCADO_PAGO';

class PaymentService {
    private static instance: PaymentService;

    /**
     * URLs DE PRODUCCIÓN (2nd Gen)
     * Asegúrate de que terminen sin "/" al final.
     */
    private readonly CREATE_PREF_URL = 'https://createpreference-pe6bb56yhq-uc.a.run.app';
    private readonly PROCESS_PAY_URL = 'https://processpayment-pe6bb56yhq-uc.a.run.app';

    private constructor() {}

    public static getInstance(): PaymentService {
        if (!PaymentService.instance) {
            PaymentService.instance = new PaymentService();
        }
        return PaymentService.instance;
    }

    /**
     * Obtiene el preferenceId.
     * Agregamos 'email' porque tu backend lo necesita para el objeto 'payer'.
     */
    public async createMercadoPagoPreference(planId: string, email: string) {
        try {
            console.log("Conectando con servidor de pago...");
            
            const response = await fetch(this.CREATE_PREF_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId, email }) // <--- IMPORTANTE: Enviamos email
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error en el servidor');
            }

            const data = await response.json();
            return data.preferenceId;
        } catch (error) {
            console.error("Error en createMercadoPagoPreference:", error);
            throw error;
        }
    }

    /**
     * Procesa la transacción final.
     */
    public async processMPTransaction(formData: any, planId: string, uid?: string) {
        try {
            console.log("Enviando pago al servidor para validación final...");
            
            const response = await fetch(this.PROCESS_PAY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    formData, 
                    planId, 
                    uid 
                })
            });

            // Si la respuesta no es 200 OK (ej. 403, 500), lanzamos error para que el Brick lo capture
            if (!response.ok) {
                const errorMsg = await response.text();
                console.error("Respuesta fallida del servidor:", errorMsg);
                throw new Error('Error al procesar el pago');
            }

            const result = await response.json();
            console.log("Resultado del pago recibido:", result);
            return result; // Este es el objeto { status: "approved" ... }
            
        } catch (error) {
            console.error("Error en processMPTransaction:", error);
            throw error;
        }
    }

    public async getOptimalGateway(): Promise<PaymentGateway> {
        return 'MERCADO_PAGO';
    }
}

export const paymentService = PaymentService.getInstance();