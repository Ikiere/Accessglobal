/**
 * Resend Email Service
 * Handles transactional emails (OTP Account Verification, Order Confirmation)
 * using the Resend API with responsive HTML email templates.
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

  /**
   * Send a 6-digit OTP Account Verification Email via Resend
   */
  public async sendOtpVerificationEmail(
    email: string,
    name: string,
    otpCode: string
  ): Promise<{ success: boolean; simulated?: boolean; error?: string }> {
    const apiKey = this.getApiKey();
    const fromEmail = this.getFromEmail();

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Your AccessGlobal Account</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Brand Header -->
          <tr>
            <td style="background-color: #124330; padding: 32px 40px; text-align: left;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="display: inline-block; width: 10px; height: 10px; border-radius: 2px; background-color: #34d399; margin-right: 8px;"></span>
                    <span style="font-size: 20px; font-weight: 700; letter-spacing: -0.5px; color: #ffffff;">AccessGlobal</span>
                    <span style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #6ee7b7; margin-top: 4px;">Verified Workshop Network</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h1 style="font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0; letter-spacing: -0.3px;">
                Confirm Your Account Registration
              </h1>
              <p style="font-size: 15px; line-height: 24px; color: #475569; margin: 0 0 24px 0;">
                Hello <strong>${name || 'Maker'}</strong>, thank you for joining AccessGlobal. To verify your email address and activate your account for direct-from-workshop ordering, please enter this 6-digit confirmation code:
              </p>

              <!-- OTP Code Display Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fbf8f3; border: 1px solid #e5dac9; border-radius: 12px; margin: 28px 0; text-align: center;">
                <tr>
                  <td style="padding: 24px;">
                    <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: #78350f; margin-bottom: 8px;">
                      Verification Security Code
                    </div>
                    <div style="font-family: 'Courier New', Courier, monospace, 'IBM Plex Mono'; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #124330; user-select: all;">
                      ${otpCode}
                    </div>
                    <div style="font-size: 12px; color: #92400e; margin-top: 8px;">
                      Valid for the next 15 minutes
                    </div>
                  </td>
                </tr>
              </table>

              <p style="font-size: 13px; line-height: 20px; color: #64748b; margin: 0 0 20px 0;">
                If you did not initiate this account creation on AccessGlobal, you can safely ignore this email. No account will be activated without this verification code.
              </p>

              <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; font-size: 12px; color: #94a3b8; line-height: 18px;">
                Security Note: AccessGlobal personnel will never ask you for this security code via phone, chat, or social media.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
              © ${new Date().getFullYear()} AccessGlobal Platform. Direct-from-workshop provenance, pre-cleared customs, bonded global transit.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    if (!apiKey) {
      console.info(
        '%c[Resend OTP Simulation] (No VITE_RESEND_API_KEY detected in .env):',
        'color: #124330; font-weight: bold; font-size: 14px;'
      );
      console.info(`To: ${email}`);
      console.info(`OTP Code: ${otpCode}`);
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
          html: htmlContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Resend error status ${response.status}`);
      }

      return { success: true };
    } catch (err: any) {
      console.warn('[EmailService] Failed to send OTP via Resend:', err.message);
      // Fallback gracefully so registration does not hang
      return { success: false, error: err.message, simulated: true };
    }
  }

  /**
   * Send an Order Confirmation Email with itemized receipt via Resend
   */
  public async sendOrderConfirmationEmail(
    order: OrderConfirmationData
  ): Promise<{ success: boolean; simulated?: boolean; error?: string }> {
    const apiKey = this.getApiKey();
    const fromEmail = this.getFromEmail();

    const itemsRows = order.items
      .map(
        (it) => `
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #0f172a;">
            <strong>${it.title}</strong>
            ${it.maker ? `<br><span style="font-size: 12px; color: #64748b;">Workshop: ${it.maker}</span>` : ''}
          </td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; text-align: center; color: #334155;">
            ${it.quantity}
          </td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; text-align: right; color: #0f172a; font-family: monospace;">
            $${it.price.toLocaleString()}
          </td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; text-align: right; color: #0f172a; font-weight: 600; font-family: monospace;">
            $${(it.price * it.quantity).toLocaleString()}
          </td>
        </tr>
      `
      )
      .join('');

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AccessGlobal Order Confirmed #${order.orderId}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Brand Header -->
          <tr>
            <td style="background-color: #124330; padding: 32px 40px; text-align: left;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="display: inline-block; width: 10px; height: 10px; border-radius: 2px; background-color: #34d399; margin-right: 8px;"></span>
                    <span style="font-size: 20px; font-weight: 700; letter-spacing: -0.5px; color: #ffffff;">AccessGlobal</span>
                    <span style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #6ee7b7; margin-top: 4px;">Bonded Order Confirmation</span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 6px 12px; background-color: rgba(255, 255, 255, 0.15); border-radius: 6px; font-family: monospace; font-size: 12px; color: #ffffff;">
                      #${order.orderId}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h1 style="font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">
                Order Confirmed & Queued with Makers
              </h1>
              <p style="font-size: 15px; line-height: 24px; color: #475569; margin: 0 0 24px 0;">
                Thank you, <strong>${order.customerName}</strong>. Your order has been registered in the AccessGlobal network. Our verified master craftspeople are preparing your pieces under pre-cleared international customs protocol.
              </p>

              <!-- Order Metadata Grid -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 10px; padding: 16px; margin-bottom: 28px; border: 1px solid #e2e8f0;">
                <tr>
                  <td width="50%" style="font-size: 12px; color: #64748b; padding: 4px 8px;">
                    Order Reference: <strong style="color: #0f172a; font-family: monospace;">${order.orderId}</strong>
                  </td>
                  <td width="50%" style="font-size: 12px; color: #64748b; padding: 4px 8px;">
                    Status: <strong style="color: #059669;">Customs Pre-Cleared (Bonded)</strong>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="font-size: 12px; color: #64748b; padding: 4px 8px;">
                    Date: <strong style="color: #0f172a;">${order.createdAt}</strong>
                  </td>
                  <td width="50%" style="font-size: 12px; color: #64748b; padding: 4px 8px;">
                    Destination: <strong style="color: #0f172a;">${order.shippingAddress || 'Registered Address'}</strong>
                  </td>
                </tr>
              </table>

              <!-- Itemized Receipt Table -->
              <h3 style="font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a; margin: 0 0 12px 0;">
                Itemized Manifest
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
                <thead style="background-color: #f1f5f9;">
                  <tr>
                    <th style="padding: 10px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #475569;">Description</th>
                    <th style="padding: 10px 16px; text-align: center; font-size: 12px; font-weight: 600; color: #475569;">Qty</th>
                    <th style="padding: 10px 16px; text-align: right; font-size: 12px; font-weight: 600; color: #475569;">Unit</th>
                    <th style="padding: 10px 16px; text-align: right; font-size: 12px; font-weight: 600; color: #475569;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
              </table>

              <!-- Totals Breakdown -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td align="right" style="padding: 4px 0; font-size: 13px; color: #64748b;">Subtotal:</td>
                  <td align="right" width="100" style="padding: 4px 0; font-size: 13px; color: #0f172a; font-family: monospace;">$${order.subtotal.toLocaleString()}</td>
                </tr>
                <tr>
                  <td align="right" style="padding: 4px 0; font-size: 13px; color: #64748b;">Customs Duty & Clearance:</td>
                  <td align="right" width="100" style="padding: 4px 0; font-size: 13px; color: #059669; font-family: monospace;">Pre-cleared</td>
                </tr>
                <tr>
                  <td align="right" style="padding: 4px 0; font-size: 13px; color: #64748b;">Insured Global Shipping:</td>
                  <td align="right" width="100" style="padding: 4px 0; font-size: 13px; color: #059669; font-family: monospace;">Free</td>
                </tr>
                <tr>
                  <td align="right" style="padding: 12px 0 0 0; font-size: 16px; font-weight: 700; color: #0f172a; border-top: 2px solid #e2e8f0;">Total Bonded Amount:</td>
                  <td align="right" width="100" style="padding: 12px 0 0 0; font-size: 18px; font-weight: 700; color: #124330; font-family: monospace; border-top: 2px solid #e2e8f0;">$${order.total.toLocaleString()}</td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard" style="display: inline-block; background-color: #124330; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 14px 32px; border-radius: 10px; box-shadow: 0 2px 4px rgba(18, 67, 48, 0.2);">
                      Track Order in Customer Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
              © ${new Date().getFullYear()} AccessGlobal Platform. Direct-from-workshop provenance, pre-cleared customs, bonded global transit.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    if (!apiKey) {
      console.info(
        '%c[Resend Order Email Simulated] (No VITE_RESEND_API_KEY detected in .env):',
        'color: #124330; font-weight: bold; font-size: 14px;'
      );
      console.info(`To: ${order.customerEmail}`);
      console.info(`Order: #${order.orderId} - Total: $${order.total}`);
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
          to: [order.customerEmail],
          subject: `Order Confirmed: #${order.orderId} - AccessGlobal Network`,
          html: htmlContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Resend error status ${response.status}`);
      }

      return { success: true };
    } catch (err: any) {
      console.warn('[EmailService] Failed to send order email via Resend:', err.message);
      return { success: false, error: err.message, simulated: true };
    }
  }
}

export const emailService = new EmailService();

