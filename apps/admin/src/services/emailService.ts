/**
 * Resend Email Service for Admin & Operations
 */

export interface OrderItemReceipt {
  title: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  maker?: string;
}

export interface OrderConfirmationData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItemReceipt[];
  subtotal: number;
  customsDuty: number;
  shipping: number;
  total: number;
  shippingAddress: string;
  createdAt: string;
}

class EmailService {
  private getApiKey(): string {
    return (
      (import.meta as any).env?.VITE_RESEND_API_KEY ||
      localStorage.getItem('accessglobal_resend_api_key') ||
      ''
    );
  }

  private getFromEmail(): string {
    return (
      (import.meta as any).env?.VITE_RESEND_FROM_EMAIL ||
      'AccessGlobal <onboarding@resend.dev>'
    );
  }

  public async sendOtpVerificationEmail(
    email: string,
    name: string,
    otpCode: string
  ): Promise<{ success: boolean; simulated?: boolean; error?: string }> {
    const apiKey = this.getApiKey();
    const fromEmail = this.getFromEmail();

    if (!apiKey) {
      console.info(
        '%c[Resend OTP Simulation] (No VITE_RESEND_API_KEY in .env):',
        'color: #124330; font-weight: bold; font-size: 14px;'
      );
      console.info(`To: ${email} | Code: ${otpCode}`);
      return { success: true, simulated: true };
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [email],
          subject: `Your AccessGlobal Verification Code: ${otpCode}`,
          html: `<p>Hello ${name}, your verification code is <strong>${otpCode}</strong></p>`,
        }),
      });

      return { success: response.ok };
    } catch (err: any) {
      console.warn('[EmailService] Resend dispatch warning:', err.message);
      return { success: false, error: err.message, simulated: true };
    }
  }
}

export const emailService = new EmailService();

