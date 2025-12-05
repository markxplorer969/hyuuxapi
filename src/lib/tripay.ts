// lib/tripay.ts
import crypto from "crypto";
import axios from "axios";

export class Tripay {
  apiKey: string;
  privateKey: string;
  merchantId: string;
  baseURL: string;

  constructor() {
    this.apiKey = process.env.TRIPAY_API_KEY!;
    this.privateKey = process.env.TRIPAY_PRIVATE_KEY!;
    this.merchantId = process.env.TRIPAY_MERCHANT_ID!;
    this.baseURL = "https://tripay.co.id/api"; // REAL MODE
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
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/callback`,
        signature: this.generateSignature(merchant_ref, amountInt),
      };

      const res = await axios.post(`${this.baseURL}/transaction/create`, payload, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      });

      return { merchant_ref, ...res.data };
    } catch (err: any) {
      console.error("Tripay Error", err.response?.data || err.message);
      throw new Error(JSON.stringify(err.response?.data || err.message));
    }
  }
}
