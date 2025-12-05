// lib/tripay.ts
import crypto from "crypto";
import axios from "axios";

export class Tripay {
  apiKey: string;
  privateKey: string;
  merchantId: string;
  baseURL: string;

  constructor() {
    this.apiKey = process.env.TRIPAY_API_KEY || "wQpoX52cDDYAzHSqbbP4olgBi72LzulFZZIgupvn";
    this.privateKey = process.env.TRIPAY_PRIVATE_KEY || "jdxUW-1FPAr-NHdvs-YU9cN-LPG3z";
    this.merchantId = process.env.TRIPAY_MERCHANT_ID || "T29243";
    
    // Always use production unless explicitly set to sandbox
    const useSandbox = process.env.USE_TRIPAY_SANDBOX === 'true';
    this.baseURL = useSandbox ? "https://tripay.co.id/api-sandbox" : "https://tripay.co.id/api";
    
    console.log('Tripay Configuration:', {
      merchantId: this.merchantId,
      baseURL: this.baseURL,
      useSandbox
    });
  }

  generateSignature(merchantRef: string, amount: number) {
    const raw = this.merchantId + merchantRef + amount;
    return crypto.createHmac("sha256", this.privateKey).update(raw).digest("hex");
  }

  async createQris(params: {
    userId: string;
    planId: string;
    amount: number;
    customer_name: string;
    customer_email: string;
  }) {
    try {
      const amountInt = Math.round(params.amount);
      const merchant_ref = `INV-${params.userId}-${Date.now()}`;

      console.log('Creating Tripay transaction with params:', {
        merchant_ref,
        amount: amountInt,
        customer_name: params.customer_name,
        customer_email: params.customer_email,
        planId: params.planId
      });

      const payload = {
        method: "QRIS",
        merchant_ref,
        amount: amountInt,
        customer_name: params.customer_name,
        customer_email: params.customer_email,
        order_items: [
          {
            name: `Plan Upgrade: ${params.planId}`,
            price: amountInt,
            quantity: 1,
          },
        ],
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/payment/callback`,
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/success`,
        signature: this.generateSignature(merchant_ref, amountInt),
      };

      console.log('Sending payload to Tripay:', payload);

      const res = await axios.post(`${this.baseURL}/transaction/create`, payload, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      });

      console.log('Tripay response:', res.data);

      return { merchant_ref, ...res.data };
    } catch (err: any) {
      console.error("Tripay Error Details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config
      });
      
      throw new Error(err.response?.data?.message || err.message || 'Failed to create payment');
    }
  }

  async checkTransactionStatus(reference: string) {
    try {
      const payload = {
        reference,
      };

      const signature = crypto
        .createHmac("sha256", this.privateKey)
        .update(this.merchantId + reference)
        .digest("hex");

      const res = await axios.post(
        `${this.baseURL}/transaction/detail`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
            "X-Signature": signature,
          },
        }
      );

      return res.data;
    } catch (err: any) {
      console.error("Tripay Status Check Error", err.response?.data || err.message);
      throw new Error(JSON.stringify(err.response?.data || err.message));
    }
  }

  async getPaymentChannels() {
    try {
      const res = await axios.get(`${this.baseURL}/payment-channel`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      return res.data;
    } catch (err: any) {
      console.error("Tripay Channels Error", err.response?.data || err.message);
      throw new Error(JSON.stringify(err.response?.data || err.message));
    }
  }

  async getPaymentChannelsAlternative() {
    try {
      const res = await axios.get(`${this.baseURL}/v1/payment-channel`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      return res.data;
    } catch (err: any) {
      console.error("Tripay Channels Alternative Error", err.response?.data || err.message);
      throw new Error(JSON.stringify(err.response?.data || err.message));
    }
  }

  calculateFee(amount: number, channel: string = 'QRIS'): number {
    // Default fee calculation for QRIS (usually 0.7%)
    const feeRates: { [key: string]: number } = {
      'QRIS': 0.007,
      'QRISC': 0.007,
      'OVO': 0.02,
      'DANA': 0.02,
      'SHOPEEPAY': 0.02,
      'PERMATAVA': 0.02,
      'BCAVA': 0.02,
      'BNIVA': 0.02,
      'BRIVA': 0.02,
      'MANDIRIVA': 0.02,
      'CIMBVA': 0.02,
      'MUAMALATVA': 0.02,
      'ALFAMART': 5000,
      'INDOMARET': 5000,
    };

    const feeRate = feeRates[channel] || feeRates['QRIS'];
    
    if (channel.includes('VA') || channel.includes('VA')) {
      return Math.max(feeRate, 2500); // Minimum fee for VA
    } else if (channel.includes('MART') || channel.includes('MARET')) {
      return feeRate; // Fixed fee for convenience stores
    } else {
      return Math.max(amount * feeRate, 1000); // Percentage fee with minimum
    }
  }
}
