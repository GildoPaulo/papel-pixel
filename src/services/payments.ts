const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface PaymentRequest {
  amount: number;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  userId: string;
  shippingInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    province: string;
  };
  phone?: string;
  cardDetails?: {
    number: string;
    expiry: string;
    cvv: string;
  };
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  paymentUrl?: string;
  redirectUrl?: string;
  message?: string;
  instructions?: string[];
  qrCode?: string;
  amount?: number;
  reference?: string;
  paymentCode?: string;
}

// ==========================================
// PAYPAL PAYMENT
// ==========================================

export const initiatePayPalPayment = async (
  data: PaymentRequest
): Promise<PaymentResponse> => {
  try {
    const response = await fetch(`${API_URL}/payments/paypal/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || result.details || 'Falha ao processar pagamento PayPal');
    }

    if (!result.success) {
      throw new Error(result.error || 'Falha ao processar pagamento PayPal');
    }

    return result;
  } catch (error: any) {
    console.error('❌ PayPal payment error:', error);
    throw error;
  }
};

// ==========================================
// M-PESA PAYMENT
// ==========================================

export const initiateMpesaPayment = async (
  data: PaymentRequest
): Promise<PaymentResponse> => {
  try {
    const response = await fetch(`${API_URL}/payments/mpesa/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to initiate M-Pesa payment');
    }

    return await response.json();
  } catch (error) {
    console.error('M-Pesa payment error:', error);
    throw error;
  }
};

// ==========================================
// CARD PAYMENT (Visa/Mastercard)
// ==========================================

export const initiateCardPayment = async (
  data: PaymentRequest
): Promise<PaymentResponse> => {
  try {
    const response = await fetch(`${API_URL}/payments/card/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || result.details || 'Falha ao processar pagamento com cartão');
    }

    if (!result.success) {
      throw new Error(result.error || 'Falha ao processar pagamento com cartão');
    }

    return result;
  } catch (error: any) {
    console.error('❌ Card payment error:', error);
    throw error;
  }
};

// ==========================================
// CASH ON DELIVERY
// ==========================================

export const createCashOrder = async (
  data: PaymentRequest
): Promise<PaymentResponse> => {
  try {
    const response = await fetch(`${API_URL}/payments/cash/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create cash order');
    }

    return await response.json();
  } catch (error) {
    console.error('Cash order error:', error);
    throw error;
  }
};

// ==========================================
// PAYMENT STATUS
// ==========================================

export const getPaymentStatus = async (
  transactionId: string
): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/payments/status/${transactionId}`);

    if (!response.ok) {
      throw new Error('Failed to get payment status');
    }

    return await response.json();
  } catch (error) {
    console.error('Payment status error:', error);
    throw error;
  }
};

// ==========================================
// BANK TRANSFER PAYMENT
// ==========================================

export const initiateBankTransferPayment = async (
  data: PaymentRequest & { bankName?: string; accountNumber?: string }
): Promise<PaymentResponse> => {
  try {
    const response = await fetch(`${API_URL}/payments/bank-transfer/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || result.details || 'Falha ao processar pagamento via transferência bancária');
    }

    if (!result.success) {
      throw new Error(result.error || 'Falha ao processar pagamento via transferência bancária');
    }

    return result;
  } catch (error: any) {
    console.error('❌ Bank transfer payment error:', error);
    throw error;
  }
};

export const uploadBankReceipt = async (
  transactionId: string,
  orderId: string,
  file: File
): Promise<{ success: boolean; message?: string; receiptUrl?: string }> => {
  try {
    const formData = new FormData();
    formData.append('receipt', file);
    formData.append('transactionId', transactionId);
    formData.append('orderId', orderId);

    const response = await fetch(`${API_URL}/payments/bank-transfer/upload-receipt`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Falha ao fazer upload do comprovante');
    }

    return result;
  } catch (error: any) {
    console.error('❌ Bank receipt upload error:', error);
    throw error;
  }
};

// ==========================================
// CHECK M-PESA STATUS (Polling)
// ==========================================

export const checkMpesaStatus = async (
  transactionId: string,
  maxAttempts = 30,
  interval = 3000
): Promise<any> => {
  let attempts = 0;

  return new Promise((resolve, reject) => {
    const checkStatus = async () => {
      try {
        const status = await getPaymentStatus(transactionId);

        if (status.status === 'completed' || status.status === 'failed') {
          resolve(status);
          return;
        }

        attempts++;

        if (attempts >= maxAttempts) {
          reject(new Error('Payment status check timeout'));
          return;
        }

        setTimeout(checkStatus, interval);
      } catch (error) {
        reject(error);
      }
    };

    checkStatus();
  });
};
