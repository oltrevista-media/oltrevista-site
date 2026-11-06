// functions/api/lead-notify.js
// Cloudflare Pages Function: Google Sheets CRM Webhook Dispatch & Lead Capture v3.67

export async function onRequestPost(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const payload = await context.request.json();
    const googleSheetsWebhookUrl = "https://script.google.com/macros/s/AKfycbwjZUzhAXEPMdebIgrURYt9w2WqckIMny3XjjsRiaItG28wuPX3YR4MJZH84mLbELi-LA/exec";
    
    // Forward payload to Google Apps Script Webhook
    const response = await fetch(googleSheetsWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: payload.name || "N/D",
        email: payload.email || "N/D",
        company: payload.company || "N/D",
        sector: payload.sector || "N/D",
        revenue: payload.revenue || (payload.overdue ? "€" + Number(payload.overdue).toLocaleString() : "N/D"),
        dso: payload.dso || "N/D",
        slaPenalties: payload.slaPenalties || "N/D"
      })
    });
    
    return new Response(JSON.stringify({ result: "success", status: "dispatched_to_google_sheet" }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (err) {
    return new Response(JSON.stringify({ result: "error", error: err.message }), {
      status: 500,
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
