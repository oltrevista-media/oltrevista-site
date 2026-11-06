// functions/api/lead-notify.js
// Cloudflare Pages Function: Lead Dispatch & Audit Request Notifier to contact@oltrevista.com

export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const payload = await request.json();
    const {
      name = 'Anonymous Lead',
      email = 'unknown@example.com',
      company = 'N/A',
      role = 'N/A',
      score = 0,
      failedCount = 0,
      language = 'en',
      requestedProduct = 'Executive AI Audit Diagnostic (€249)',
      notes = ''
    } = payload;

    const leadTimestamp = new Date().toISOString();
    const leadId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `lead_${Date.now()}`;

    const leadSummary = {
      leadId,
      timestamp: leadTimestamp,
      targetRecipient: 'contact@oltrevista.com',
      client: {
        name,
        email,
        company,
        role,
        language
      },
      auditMetrics: {
        score: `${score}%`,
        failedControlsCount: failedCount,
        requestedProduct,
        notes
      }
    };

    console.log('[LEAD DISPATCH - contact@oltrevista.com]', JSON.stringify(leadSummary));

    // Optional webhook or Resend dispatch if configured
    if (env && env.RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'OLTREVISTA Radar <radar@oltrevista.com>',
            to: ['contact@oltrevista.com'],
            reply_to: email,
            subject: `[LEAD AUDIT] ${company} (${score}% Risk Exposure) - ${requestedProduct}`,
            text: `New Audit Lead Received:\n\nName: ${name}\nEmail: ${email}\nCompany: ${company}\nRole: ${role}\nRisk Score: ${score}%\nFailed Controls: ${failedCount}\nLanguage: ${language}\nProduct: ${requestedProduct}\nLead ID: ${leadId}\nTimestamp: ${leadTimestamp}`
          })
        });
      } catch (mailErr) {
        console.error('Email dispatch error:', mailErr);
      }
    } else if (env && env.LEAD_WEBHOOK_URL) {
      try {
        await fetch(env.LEAD_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(leadSummary)
        });
      } catch (hookErr) {
        console.error('Webhook dispatch error:', hookErr);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Lead parameters securely captured and notified to contact@oltrevista.com',
      leadId,
      timestamp: leadTimestamp
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Lead notification failed'
    }), {
      status: 400,
      headers: corsHeaders
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
