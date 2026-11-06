// functions/api/assess.js
// Cloudflare Pages Function: ISO 42001 & EU AI Act Executive Lead Auditor API

export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const data = await request.json();
    const {
      score = 0,
      failedControls = [],
      passedControls = [],
      language = 'en',
      company = 'Confidential Enterprise',
      name = 'Enterprise Leader',
      role = 'Executive'
    } = data;

    const failedCount = failedControls.length;
    const criticalFailed = failedControls.filter(c => c.risk_level === 'Critical' || c.risk_level === 'High');

    // System prompt for ISO 42001 Lead Auditor
    const systemPrompt = `You are the Lead Auditor for ISO/IEC 42001:2023 and the EU AI Act (Regulation 2024/1689) at OLTREVISTA Sovereign AI.
Analyze the following corporate audit diagnostic and output exactly three distinct bullet points in language '${language}':
1. Regulatory Exposure: Specific legal penalties under EU AI Act (Art. 99, up to €35M or 7% turnover) and ISO 42001 non-conformity risks.
2. Operational Risk: Real-world business impact, credit / liability exposure, M&A due diligence friction, and operational liabilities.
3. Immediate Remediation: Prioritized tactical next steps, recommending OLTREVISTA Executive Audit Report or ZUKWEND Local-First Sovereign Agent (€249) where applicable.

Format your output strictly as a JSON object with keys:
"regulatoryExposure", "operationalRisk", "immediateRemediation".
Do not wrap in markdown quotes or codeblocks, return raw JSON only.`;

    const userPrompt = `Company: ${company}
Role: ${role}
Risk Exposure Score: ${score}%
Failed Controls Count: ${failedCount}
Critical/High Breaches: ${criticalFailed.map(c => `${c.code}: ${c.name}`).join('; ') || 'None'}
Passed Controls Count: ${passedControls.length}`;

    let summary = null;

    // 1. Try Gemini 1.5 Flash if GEMINI_API_KEY is available
    if (env && env.GEMINI_API_KEY) {
      try {
        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;
        const geminiResp = await fetch(geminiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { text: `${systemPrompt}\n\nClient Audit Data:\n${userPrompt}` }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: 'application/json'
            }
          })
        });

        if (geminiResp.ok) {
          const geminiData = await geminiResp.json();
          const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            try {
              summary = JSON.parse(rawText);
            } catch (e) {
              summary = { raw: rawText };
            }
          }
        }
      } catch (err) {
        console.error('Gemini API execution error:', err);
      }
    }

    // 2. High-grade deterministic fallback if AI key absent or upstream fails
    if (!summary || !summary.regulatoryExposure) {
      summary = generateDeterministicSummary(score, failedCount, criticalFailed.length, language, company);
    }

        const overdue = parseFloat(data.overdue) || 1850000;
    const dso = parseInt(data.dso, 10) || 74;
    const sector = data.sector || 'mfg';
    const excessDays = Math.max(0, dso - 30);
    const statutoryRate = 0.125;
    const slaPenalties = Math.round((overdue * (statutoryRate / 365)) * excessDays);
    const wacc = 0.095;
    const immobilizedCapital = Math.round((overdue * (wacc / 365)) * excessDays);
    const costOfInaction = slaPenalties + immobilizedCapital;
    const roiMultiple = Math.max(1, Math.round(costOfInaction / 249));

    return new Response(JSON.stringify({
      success: true,
      summary,
      score,
      slaPenalties,
      immobilizedCapital,
      costOfInaction,
      roiMultiple,
      failedCount,
      criticalCount: criticalFailed.length,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Audit processing failed'
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

function generateDeterministicSummary(score, failedCount, criticalCount, lang, company) {
  const dict = {
    en: {
      regulatoryExposure: `Systemic diagnostic identifies ${failedCount} control deviations (${criticalCount} high-severity breaches). Under EU AI Act Regulation (EU) 2024/1689 (Arts. 9, 14, 15 & 99), unaddressed high-risk gaps trigger statutory enforcement liabilities up to €35,000,000 or 7% of global annual turnover, alongside ISO/IEC 42001 certification refusal.`,
      operationalRisk: `Unverified AI decision pathways and missing risk logs expose ${company} to credit recovery disputes, automated profiling invalidation, vendor audit friction, and enterprise M&A due diligence haircuts.`,
      immediateRemediation: `Isolate non-compliant pipeline modules. Secure an official OLTREVISTA Executive Audit Report for full evidentiary gap closure, or deploy ZUKWEND Local-First Sovereign Engine (€249) to eliminate cloud data leakage immediately.`
    },
    de: {
      regulatoryExposure: `Diagnose identifiziert ${failedCount} Kontrollabweichungen (${criticalCount} kritische/hohe Verstöße). Nach EU AI Act (VO (EU) 2024/1689 Art. 9, 14, 15 u. 99) drohen bei ungeprüften Hochrisikosystemen Bußgelder von bis zu 35.000.000 € oder 7 % des weltweiten Jahresumsatzes sowie die Verweigerung der ISO/IEC 42001-Zertifizierung.`,
      operationalRisk: `Fehlende technische Dokumentation und unzureichende Aufsicht gefährden die operative Haftung von ${company}, führen zu Reibungen bei B2B-Audits und entwerten Unternehmensbewertungen bei M&A-Prüfungen.`,
      immediateRemediation: `Schließen Sie offene Kontrolllücken unverzüglich. Beantragen Sie den offiziellen OLTREVISTA Executive Audit Report zur lückenlosen Nachweiserbringung oder nutzen Sie ZUKWEND Local-First (249 €) für risikofreie Datenverarbeitung.`
    },
    it: {
      regulatoryExposure: `La diagnostica rileva ${failedCount} scostamenti di controllo (${criticalCount} violazioni critiche/alte). Ai sensi del Regolamento UE 2024/1689 (Art. 9, 14, 15 e 99), i sistemi ad alto rischio privi di conformità espongono ${company} a sanzioni pecuniarie fino a 35.000.000 € o al 7% del fatturato annuo globale, oltre al mancato rilascio ISO/IEC 42001.`,
      operationalRisk: `La mancata registrazione dei log e l'assenza di supervisione umana esponenziale aumentano la responsabilità civile verso terzi, bloccano le procedure di credit management e ostacolano le due diligence M&A.`,
      immediateRemediation: `Circoscrivere i moduli non conformi. Attivare il Report di Audit Executive di OLTREVISTA per la bonifica documentale o implementare ZUKWEND Local-First (€249) per azzerare il trasferimento cloud di dati sensibili.`
    },
    es: {
      regulatoryExposure: `El diagnóstico identifica ${failedCount} desviaciones de control (${criticalCount} brechas críticas/altas). Conforme al EU AI Act (Reglamento UE 2024/1689 Arts. 9, 14, 15 y 99), los sistemas de alto riesgo no conformes exponen a ${company} a multas de hasta 35.000.000 € o el 7% de la facturación global anual y denegación de ISO/IEC 42001.`,
      operationalRisk: `La falta de trazabilidad y gobernanza expone a la empresa a litigios de crédito, impugnación de decisiones automatizadas y contingencias graves en procesos de auditoría B2B o M&A.`,
      immediateRemediation: `Aislar los vectores vulnerables. Solicitar el Informe de Auditoría Ejecutiva de OLTREVISTA o adoptar ZUKWEND Local-First (249 €) para garantizar soberanía de datos sin fuga a la nube.`
    },
    fr: {
      regulatoryExposure: `Le diagnostic met en évidence ${failedCount} écarts de contrôle (${criticalCount} manquements critiques/élevés). Selon l'AI Act européen (Règlement UE 2024/1689, art. 9, 14, 15 et 99), ces non-conformités exposent ${company} à des amendes pouvant atteindre 35 000 000 € ou 7 % du chiffre d'affaires mondial ainsi qu'au rejet de l'ISO/IEC 42001.`,
      operationalRisk: `L'absence de traçabilité et de contrôle humain direct fragilise la responsabilité de l'entreprise, bloque les processus de recouvrement et déprécie les audits M&A.`,
      immediateRemediation: `Cloisonner immédiatement les modules à risque. Commander le Rapport d'Audit Exécutif OLTREVISTA pour mise en conformité formelle ou déployer ZUKWEND Local-First (249 €) pour sécuriser vos données en local.`
    },
    pt: {
      regulatoryExposure: `O diagnóstico identifica ${failedCount} desvios de controlo (${criticalCount} violações críticas/altas). Ao abrigo do EU AI Act (Regulamento UE 2024/1689 Arts. 9, 14, 15 e 99), a falta de conformidade expõe a ${company} a coimas até 35.000.000 € ou 7% do volume de negócios global e indeferimento da ISO/IEC 42001.`,
      operationalRisk: `A ausência de registos técnicos estruturados e supervisão gera atritos em auditorias de clientes, risco de litígios de crédito e desvalorização em auditorias de M&A.`,
      immediateRemediation: `Isolar os componentes não conformes. Solicitar o Relatório de Auditoria Executiva da OLTREVISTA ou adotar o ZUKWEND Local-First (249 €) para soberania e proteção de dados imediata.`
    }
  };

  const selected = dict[lang] || dict['en'];
  return selected;
}
