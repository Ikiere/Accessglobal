// Vercel Serverless Function: Transactional Email Relay via Resend API
// Handles POST /api/send-email securely server-side without CORS or client-side exposure

export default async function handler(req: any, res: any) {
  // CORS Configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed. Please send a POST request with email payload.',
    });
  }

  try {
    const apiKey =
      process.env.VITE_RESEND_API_KEY ||
      process.env.RESEND_API_KEY ||
      '';

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'Resend API key is not configured on the server.',
      });
    }

    let payload = req.body;
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch {
        // use as-is if parsing fails
      }
    }

    const { from, to, subject, html, text, reply_to } = payload || {};

    if (!to || (Array.isArray(to) && to.length === 0)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required recipient parameter "to".',
      });
    }

    if (!subject) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter "subject".',
      });
    }

    if (!html && !text) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: either "html" or "text" must be provided.',
      });
    }

    const fromEmail = from || 'AccessGlobal <onboarding@resend.dev>';
    const recipients = Array.isArray(to) ? to : [to];

    // Forward to Resend API server-side
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: recipients,
        subject,
        html,
        text,
        reply_to,
      }),
    });

    const resendData = await resendResponse.json().catch(() => ({}));

    if (!resendResponse.ok) {
      return res.status(resendResponse.status).json({
        success: false,
        status: resendResponse.status,
        error: resendData.message || `Resend dispatch failed with status ${resendResponse.status}`,
        details: resendData,
      });
    }

    return res.status(200).json({
      success: true,
      id: resendData.id,
      resendData,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while dispatching email via Resend.',
    });
  }
}

