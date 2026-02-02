
import React, { useEffect, useRef, useState } from 'react';
import Spinner from './Spinner';

interface GooglePayButtonProps {
    amount: string;
    currency: string;
    onPaymentAuthorized: (paymentData: any) => Promise<void>;
    onError: (err: any) => void;
}

const GooglePayButton: React.FC<GooglePayButtonProps> = ({ amount, currency, onPaymentAuthorized, onError }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isSdkReady, setIsSdkReady] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const checkSdk = () => {
            if ((window as any).google?.payments?.api) {
                if (isMounted) setIsSdkReady(true);
            } else {
                setTimeout(checkSdk, 100);
            }
        };
        checkSdk();
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        if (!isSdkReady || !containerRef.current) return;

        const paymentsClient = new (window as any).google.payments.api.PaymentsClient({
            environment: 'TEST'
        });

        const button = paymentsClient.createButton({
            onClick: async () => {
                const paymentDataRequest = {
                    apiVersion: 2,
                    apiVersionMinor: 0,
                    allowedPaymentMethods: [{
                        type: 'CARD',
                        parameters: {
                            allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
                            allowedCardNetworks: ["MASTERCARD", "VISA", "AMEX"]
                        },
                        tokenizationSpecification: {
                            type: 'PAYMENT_GATEWAY',
                            parameters: {
                                'gateway': 'example',
                                'gatewayMerchantId': 'exampleGatewayMerchantId'
                            }
                        }
                    }],
                    transactionInfo: {
                        totalPriceStatus: 'FINAL',
                        totalPrice: amount,
                        currencyCode: currency,
                        countryCode: 'CL'
                    },
                    merchantInfo: {
                        merchantName: 'VitaMetra',
                        merchantId: 'BCR2DN5T72A273TV'
                    }
                };

                try {
                    const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);
                    await onPaymentAuthorized(paymentData);
                } catch (err) {
                    onError(err);
                }
            },
            buttonColor: 'black',
            buttonType: 'buy',
            buttonSizeMode: 'fill'
        });

        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(button);

    }, [isSdkReady, amount, currency]);

    return (
        <div className="w-full h-14 min-h-[56px] relative">
            {!isSdkReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-100 rounded-2xl animate-pulse">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Iniciando Nodo GPay...</span>
                </div>
            )}
            <div ref={containerRef} className="w-full h-full" />
        </div>
    );
};

export default GooglePayButton;
