// OLTREVISTA Standalone Radar Scanner & Sovereign Audit Logic v3.66
// Whitelisted against translation

const BRAND_CONSTANTS = Object.freeze({
  BRAND_NAME: "OLTREVISTA",
  BRAND_PRODUCT: "ZUKWEND",
  BRAND_TAGLINE: "See Beyond"
});

const ATECO_BENCHMARKS = {
  mfg: { code: 'ATECO 25.62 [General Mechanics & Engineering]', avgDso: 78, bottomPct: 22 },
  pkg: { code: 'ATECO 22.22 & 28.96 [Packaging & Rubber Machinery]', avgDso: 82, bottomPct: 25 },
  con: { code: 'ATECO 41.20 [Construction & Building Materials]', avgDso: 95, bottomPct: 35 },
  ele: { code: 'ATECO 26.11 [Electronics & Industrial Equipment]', avgDso: 71, bottomPct: 18 },
  log: { code: 'ATECO 49.41 [Freight Logistics & Distribution]', avgDso: 64, bottomPct: 15 },
  srv: { code: 'ATECO 62.01 [Tech, IT & Professional Services]', avgDso: 58, bottomPct: 12 },
  trd: { code: 'ATECO 46.90 [Wholesale & Industrial Trade]', avgDso: 68, bottomPct: 16 }
};

// Feature 1: Print & Shareable Hash
function printAuditSummary() {
  document.body.classList.add('is-printing-dossier');
  window.print();
  setTimeout(() => {
    document.body.classList.remove('is-printing-dossier');
  }, 500);
}

function serializeAuditState() {
  const sector = document.getElementById('radarSector') ? document.getElementById('radarSector').value : 'mfg';
  const jurisdiction = document.getElementById('radarJurisdiction') ? document.getElementById('radarJurisdiction').value : 'eu';
  const revenue = document.getElementById('radarRevenue') ? document.getElementById('radarRevenue').value : 'tier2';
  const overdue = document.getElementById('sliderOverdue') ? document.getElementById('sliderOverdue').value : 1850000;
  const dso = document.getElementById('sliderDso') ? document.getElementById('sliderDso').value : 74;
  return `#sector=${encodeURIComponent(sector)}&jurisdiction=${encodeURIComponent(jurisdiction)}&rev=${encodeURIComponent(revenue)}&overdue=${encodeURIComponent(overdue)}&dso=${encodeURIComponent(dso)}`;
}

function copyShareableAuditLink() {
  const hash = serializeAuditState();
  const url = window.location.origin + window.location.pathname + hash;
  window.location.hash = hash;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      const txt = document.getElementById('txtCopyLink');
      if (txt) {
        const orig = txt.innerText;
        txt.innerText = '✓ Link Copied!';
        setTimeout(() => { txt.innerText = orig; }, 2500);
      }
    }).catch(() => {
      prompt('Shareable Audit Link (copy below):', url);
    });
  } else {
    prompt('Shareable Audit Link (copy below):', url);
  }
}

function restoreAuditStateFromHash() {
  if (!window.location.hash || window.location.hash.length < 2) return;
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  if (params.has('sector') && document.getElementById('radarSector')) {
    document.getElementById('radarSector').value = params.get('sector');
  }
  if (params.has('jurisdiction') && document.getElementById('radarJurisdiction')) {
    document.getElementById('radarJurisdiction').value = params.get('jurisdiction');
  }
  if (params.has('rev') && document.getElementById('radarRevenue')) {
    document.getElementById('radarRevenue').value = params.get('rev');
  }
  if (params.has('overdue') && document.getElementById('sliderOverdue')) {
    document.getElementById('sliderOverdue').value = params.get('overdue');
  }
  if (params.has('dso') && document.getElementById('sliderDso')) {
    document.getElementById('sliderDso').value = params.get('dso');
  }
  recalculateAudit(true);
}

// Section C: Hybrid Controls (Synchronized Slider + Direct Text Input + Preset Chips)
function applyRevenuePreset(overdueAmount, revenueTier) {
  const slider = document.getElementById('sliderOverdue');
  const revSelect = document.getElementById('radarRevenue');
  if (slider) slider.value = overdueAmount;
  if (revSelect && revenueTier) revSelect.value = revenueTier;
  recalculateAudit(true);
}

function applyDsoPreset(days) {
  const slider = document.getElementById('sliderDso');
  if (slider) slider.value = days;
  recalculateAudit(true);
}

function onDirectOverdueInput(valStr) {
  const num = parseFloat(String(valStr).replace(/[^0-9.]/g, '')) || 0;
  const clamped = Math.min(20000000, Math.max(50000, num));
  const slider = document.getElementById('sliderOverdue');
  if (slider) slider.value = clamped;
  recalculateAudit(false);
}

function onDirectOverdueChange(valStr) {
  const num = parseFloat(String(valStr).replace(/[^0-9.]/g, '')) || 0;
  const clamped = Math.min(20000000, Math.max(50000, num));
  const slider = document.getElementById('sliderOverdue');
  if (slider) slider.value = clamped;
  recalculateAudit(true);
}

function onDirectDsoInput(valStr) {
  const num = parseInt(String(valStr).replace(/[^0-9]/g, ''), 10) || 0;
  const clamped = Math.min(120, Math.max(30, num));
  const slider = document.getElementById('sliderDso');
  if (slider) slider.value = clamped;
  recalculateAudit(false);
}

function onDirectDsoChange(valStr) {
  const num = parseInt(String(valStr).replace(/[^0-9]/g, ''), 10) || 0;
  const clamped = Math.min(120, Math.max(30, num));
  const slider = document.getElementById('sliderDso');
  if (slider) slider.value = clamped;
  recalculateAudit(true);
}

// Comprehensive Audit Recalculation Engine
function recalculateAudit(syncInputs = true) {
  const overdueEl = document.getElementById('sliderOverdue');
  const dsoEl = document.getElementById('sliderDso');
  if (!overdueEl || !dsoEl) return;

  const overdue = parseFloat(overdueEl.value) || 1850000;
  const dso = parseInt(dsoEl.value, 10) || 74;
  const sectorEl = document.getElementById('radarSector');
  const sector = sectorEl ? sectorEl.value : 'mfg';
  const jurisdictionEl = document.getElementById('radarJurisdiction');
  const jurisdiction = jurisdictionEl ? jurisdictionEl.value : 'eu';
  const revenueEl = document.getElementById('radarRevenue');
  const revenue = revenueEl ? revenueEl.value : 'tier2';

  if (syncInputs) {
    const inputOverdue = document.getElementById('inputOverdue');
    if (inputOverdue) inputOverdue.value = '€' + overdue.toLocaleString();
    const inputDso = document.getElementById('inputDso');
    if (inputDso) inputDso.value = dso + ' Days';
  }

  const txtOverdue = document.getElementById('txtOverdueDisplay');
  if (txtOverdue) txtOverdue.innerText = '€' + overdue.toLocaleString();
  const txtDso = document.getElementById('txtDsoDisplay');
  if (txtDso) txtDso.innerText = dso + ' Days';

  const excessDays = Math.max(0, dso - 30);
  const statutoryRate = 0.125;
  const slaPenalties = Math.round((overdue * (statutoryRate / 365)) * excessDays);
  const wacc = 0.095;
  const immobilizedCapital = Math.round((overdue * (wacc / 365)) * excessDays);

  let duplicationPct = 25.0;
  if (sector === 'mfg' || sector === 'con') duplicationPct += 12.5;
  if (sector === 'pkg' || sector === 'log') duplicationPct += 8.5;
  if (revenue === 'tier3' || revenue === 'tier4') duplicationPct += 5.0;

  if (document.getElementById('kpiSlaPenalties')) {
    document.getElementById('kpiSlaPenalties').innerText = '€' + slaPenalties.toLocaleString();
  }
  if (document.getElementById('kpiImmobilizedCapital')) {
    document.getElementById('kpiImmobilizedCapital').innerText = '€' + immobilizedCapital.toLocaleString();
  }
  if (document.getElementById('kpiVatDuplication')) {
    document.getElementById('kpiVatDuplication').innerText = duplicationPct.toFixed(1) + '%';
  }

  // Synchronize 2x2 A4 Print Dossier KPI Grid
  if (document.getElementById('dossierKpiOverdue')) {
    document.getElementById('dossierKpiOverdue').innerText = '€' + overdue.toLocaleString();
  }
  if (document.getElementById('dossierKpiDso')) {
    document.getElementById('dossierKpiDso').innerText = dso + ' Days (vs 30d EU Limit)';
  }
  if (document.getElementById('dossierKpiSla')) {
    document.getElementById('dossierKpiSla').innerText = '€' + slaPenalties.toLocaleString();
  }
  if (document.getElementById('dossierKpiImmobilized')) {
    document.getElementById('dossierKpiImmobilized').innerText = '€' + immobilizedCapital.toLocaleString();
  }

  // Feature 2: Price Anchoring on Cost of Inaction
  const totalLoss = slaPenalties + immobilizedCapital;
  const roiMultiple = Math.max(1, Math.round(totalLoss / 249));
  if (document.getElementById('txtCostOfInaction')) {
    document.getElementById('txtCostOfInaction').innerText = '€' + totalLoss.toLocaleString();
  }
  if (document.getElementById('txtRoiMultiple')) {
    document.getElementById('txtRoiMultiple').innerText = roiMultiple.toLocaleString();
  }

  // Feature 4: ATECO Peer Benchmark Comparison
  const bench = (typeof ATECO_BENCHMARKS !== 'undefined' && ATECO_BENCHMARKS[sector]) ? ATECO_BENCHMARKS[sector] : { code: 'ATECO 25.62 [General Mechanics]', avgDso: 78, bottomPct: 22 };
  const maxDays = 120;
  const statutoryDays = 30;
  const userPct = Math.min(100, Math.max(5, Math.round((dso / maxDays) * 100)));
  const sectorPct = Math.min(100, Math.max(5, Math.round((bench.avgDso / maxDays) * 100)));

  if (document.getElementById('txtSectorAvgLbl')) {
    document.getElementById('txtSectorAvgLbl').innerText = '● Sector Avg: ' + bench.avgDso + 'd';
  }
  if (document.getElementById('txtUserDsoLbl')) {
    document.getElementById('txtUserDsoLbl').innerText = '● Your DSO: ' + dso + 'd';
  }
  const barUser = document.getElementById('barUserDso');
  if (barUser) {
    barUser.style.width = userPct + '%';
    if (dso <= statutoryDays) {
      barUser.style.background = '#10b981';
      if (document.getElementById('txtBenchmarkRanking')) {
        document.getElementById('txtBenchmarkRanking').innerText = 'Compliant / Low Exposure';
        document.getElementById('txtBenchmarkRanking').style.color = '#34d399';
        document.getElementById('txtBenchmarkRanking').style.background = 'rgba(16, 185, 129, 0.15)';
        document.getElementById('txtBenchmarkRanking').style.borderColor = 'rgba(16, 185, 129, 0.3)';
      }
      if (document.getElementById('txtBenchmarkWarning')) {
        document.getElementById('txtBenchmarkWarning').innerText = 'DSO of ' + dso + ' Days is fully compliant with the 30-day statutory ceiling under the 2026 EU Late Payment Regulation. Excellent capital velocity.';
      }
    } else if (dso <= bench.avgDso) {
      barUser.style.background = '#fbbf24';
      const excess = dso - statutoryDays;
      if (document.getElementById('txtBenchmarkRanking')) {
        document.getElementById('txtBenchmarkRanking').innerText = 'Better Than Sector Avg (' + bench.avgDso + 'd)';
        document.getElementById('txtBenchmarkRanking').style.color = '#fbbf24';
        document.getElementById('txtBenchmarkRanking').style.background = 'rgba(245, 158, 11, 0.15)';
        document.getElementById('txtBenchmarkRanking').style.borderColor = 'rgba(245, 158, 11, 0.3)';
      }
      if (document.getElementById('txtBenchmarkWarning')) {
        document.getElementById('txtBenchmarkWarning').innerText = 'DSO of ' + dso + ' Days outperforms the ' + bench.code + ' sector average (' + bench.avgDso + 'd), but incurs avoidable statutory interest by exceeding the EU 30-day statutory limit by ' + excess + ' days.';
      }
    } else {
      barUser.style.background = '#ef4444';
      if (document.getElementById('txtBenchmarkRanking')) {
        document.getElementById('txtBenchmarkRanking').innerText = 'Bottom ' + bench.bottomPct + '% of Sector';
        document.getElementById('txtBenchmarkRanking').style.color = '#f87171';
        document.getElementById('txtBenchmarkRanking').style.background = 'rgba(239, 68, 68, 0.15)';
        document.getElementById('txtBenchmarkRanking').style.borderColor = 'rgba(239, 68, 68, 0.3)';
      }
      if (document.getElementById('txtBenchmarkWarning')) {
        document.getElementById('txtBenchmarkWarning').innerText = 'DSO of ' + dso + ' Days places your company in the bottom ' + bench.bottomPct + '% of ' + bench.code + '. Statutory interest penalties and capital immobilization severely threaten operating margin.';
      }
    }
  }
  if (document.getElementById('barSectorMarker')) {
    document.getElementById('barSectorMarker').style.left = sectorPct + '%';
  }

  // Master Hub specific elements
  if (document.getElementById('scoreDisplayVal')) {
    let jurisdictionMultiplier = (jurisdiction === 'eu' || jurisdiction === 'dach') ? 1.15 : 1.0;
    let sectorMultiplier = (sector === 'mfg' || sector === 'con') ? 1.2 : 1.0;
    let score = Math.min(100, Math.round(((excessDays / 90) * 75 + 20) * jurisdictionMultiplier * sectorMultiplier));
    document.getElementById('scoreDisplayVal').innerText = score + ' / 100';

    const badge = document.getElementById('badgeRiskStatus');
    const matrixPassed = document.getElementById('matrixPassedCount');
    if (badge && matrixPassed) {
      badge.className = 'risk-badge';
      if (score <= 35) {
        badge.classList.add('badge-risk-low');
        badge.innerText = 'LOW RISK / COMPLIANT';
        matrixPassed.innerText = '34 Passed / 4 Gaps';
        matrixPassed.style.color = '#34d399';
      } else if (score <= 65) {
        badge.classList.add('badge-risk-med');
        badge.innerText = 'MEDIUM / ATTENTION REQUIRED';
        matrixPassed.innerText = '28 Passed / 10 Gaps';
        matrixPassed.style.color = '#fbbf24';
      } else {
        badge.classList.add('badge-risk-crit');
        badge.innerText = 'CRITICAL / SEVERE PENALTY THREAT';
        matrixPassed.innerText = '21 Passed / 17 Gaps';
        matrixPassed.style.color = '#f87171';
      }
    }
  }
}

// Section E: Mandatory Serverless Fetch Binding to POST /api/assess
function showRadarLoadingState(message) {
  const statusEl = document.getElementById('radarApiStatus') || document.getElementById('btnModalSubmit') || document.getElementById('btnRunRadarAssessment') || document.getElementById('btnRunRadarAudit');
  if (statusEl) {
    statusEl.dataset.originalText = statusEl.innerText || statusEl.value;
    statusEl.innerText = message || "Connecting to Sovereign Local-First Engine via Cloudflare Worker...";
    statusEl.disabled = true;
  }
  const errBox = document.getElementById('radarApiError');
  if (errBox) errBox.style.display = 'none';
}

function hideRadarLoadingState() {
  const statusEl = document.getElementById('radarApiStatus') || document.getElementById('btnModalSubmit') || document.getElementById('btnRunRadarAssessment') || document.getElementById('btnRunRadarAudit');
  if (statusEl && statusEl.dataset.originalText) {
    statusEl.innerText = statusEl.dataset.originalText;
    statusEl.disabled = false;
  }
}

function showRadarErrorState(errorMessage) {
  console.error("Radar Audit API Error:", errorMessage);
  const errBox = document.getElementById('radarApiError');
  if (errBox) {
    errBox.innerText = `Audit Connection Error: ${errorMessage}. Cloudflare Worker endpoint /api/assess unreachable.`;
    errBox.style.display = 'block';
  } else {
    alert(`Audit Connection Error: ${errorMessage}. Cloudflare Worker endpoint /api/assess unreachable.`);
  }
}

function renderAuditResults(data) {
  if (!data || !data.success) {
    showRadarErrorState(data?.error || "Malformed audit response from serverless engine.");
    return;
  }
  const summary = data.summary || {};
  const sec1 = document.getElementById('execSec1Text');
  const sec2 = document.getElementById('execSec2Text');
  const sec3 = document.getElementById('execSec3Text');
  if (sec1) sec1.innerText = summary.regulatoryExposure || 'Regulatory exposure verified.';
  if (sec2) sec2.innerText = summary.operationalRisk || 'Operational risk assessment computed.';
  if (sec3) sec3.innerText = summary.immediateRemediation || 'Remediation protocols ready for deployment.';

  if (data.slaPenalties !== undefined && document.getElementById('kpiSlaPenalties')) {
    document.getElementById('kpiSlaPenalties').innerText = '€' + data.slaPenalties.toLocaleString();
  }
  if (data.immobilizedCapital !== undefined && document.getElementById('kpiImmobilizedCapital')) {
    document.getElementById('kpiImmobilizedCapital').innerText = '€' + data.immobilizedCapital.toLocaleString();
  }
  if (data.costOfInaction !== undefined && document.getElementById('txtCostOfInaction')) {
    document.getElementById('txtCostOfInaction').innerText = '€' + data.costOfInaction.toLocaleString();
  }
  if (data.roiMultiple !== undefined && document.getElementById('txtRoiMultiple')) {
    document.getElementById('txtRoiMultiple').innerText = data.roiMultiple.toLocaleString();
  }

  if (typeof closeLeadModal === 'function') closeLeadModal();
  const card = document.getElementById('execSummaryCard');
  if (card) {
    card.classList.add('active');
    card.scrollIntoView({ behavior: 'smooth' });
  }
}

async function runRadarAssessment(params) {
  showRadarLoadingState("Connecting to Sovereign Local-First Engine via Cloudflare Worker...");
  try {
    const response = await fetch('/api/assess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!response.ok) throw new Error(`API HTTP ${response.status}`);
    const data = await response.json();
    renderAuditResults(data);
  } catch (err) {
    showRadarErrorState(err.message);
  } finally {
    hideRadarLoadingState();
  }
}

function runCurrentRadarAudit() {
  const failed = typeof CONTROLS_DATA !== 'undefined' ? CONTROLS_DATA.filter(c => controlStates[c.id] === 'noncompliant') : [];
  const passed = typeof CONTROLS_DATA !== 'undefined' ? CONTROLS_DATA.filter(c => controlStates[c.id] === 'compliant') : [];
  const score = document.getElementById('scoreDisplay') ? (parseInt(document.getElementById('scoreDisplay').innerText, 10) || 0) : 0;
  const sector = document.getElementById('radarSector') ? document.getElementById('radarSector').value : 'mfg';
  const overdue = document.getElementById('sliderOverdue') ? document.getElementById('sliderOverdue').value : 1850000;
  const dso = document.getElementById('sliderDso') ? document.getElementById('sliderDso').value : 74;
  const lang = (typeof currentLang !== 'undefined') ? currentLang : 'en';

  const params = {
    score,
    sector,
    overdue,
    dso,
    failedCount: failed.length,
    failedControls: failed,
    passedControls: passed,
    language: lang,
    company: 'Enterprise Audit Reviewer',
    name: 'Executive Auditor',
    role: 'Audit Director'
  };
  return runRadarAssessment(params);
}

// Feature 3: YouTube 1080p HD Player initialization
function onYouTubeIframeAPIReady() {
  if (document.getElementById('zukwend-demo-player')) {
    new YT.Player('zukwend-demo-player', {
      events: {
        'onReady': function(e) { e.target.setPlaybackQuality('hd1080'); },
        'onStateChange': function(e) { if (e.data === YT.PlayerState.PLAYING) e.target.setPlaybackQuality('hd1080'); }
      }
    });
  }
}

// Section F: Corporate Email Validation Filter & Instant Executive Unlock (v3.67)
const CONSUMER_EMAIL_REGEX = /@(gmail\.com|yahoo\.|hotmail\.|outlook\.|icloud\.com|proton\.|protonmail\.|aol\.com|live\.com|yandex\.|mail\.ru|tempmail|mailinator|10minutemail)/i;

function validateCorporateEmail(email) {
  if (!email || typeof email !== 'string') return { valid: false, reason: "empty" };
  const trimmed = email.trim();
  // Tier 1: Syntax check (must have @ and dot in domain)
  const rfcSyntaxRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!rfcSyntaxRegex.test(trimmed)) return { valid: false, reason: "invalid_syntax" };
  
  // Tier 2: Consumer & disposable domain blacklist
  const consumerDomainRegex = /@(gmail\.com|yahoo\.|hotmail\.|outlook\.|icloud\.com|proton\.|protonmail\.|aol\.com|live\.com|yandex\.|mail\.ru|tempmail|mailinator|10minutemail)/i;
  if (consumerDomainRegex.test(trimmed)) return { valid: false, reason: "consumer_domain" };

  return { valid: true };
}

function unlockExecutiveDossierInstant(leadPayload) {
  // 1. Close lead capture modal instantly
  if (typeof closeLeadModal === 'function') closeLeadModal();
  const modal = document.getElementById('leadModal');
  if (modal) modal.style.display = 'none';

  // 2. Send background fetch to /api/lead-notify (asynchronous, non-blocking)
  try {
    fetch('/api/lead-notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadPayload)
    }).catch(err => console.warn('Lead dispatch background notice:', err));
  } catch (e) {
    console.warn('Lead dispatch error:', e);
  }

  // 3. Instantly unlock full Executive Dossier view on /radar_scanner/ screen
  const card = document.getElementById('execSummaryCard');
  if (card) {
    card.classList.add('active');
    card.scrollIntoView({ behavior: 'smooth' });
  }

  // Populate preliminary dossier content immediately so print dialog captures populated data
  const sec1 = document.getElementById('execSec1Text');
  const sec2 = document.getElementById('execSec2Text');
  const sec3 = document.getElementById('execSec3Text');
  const failedCount = leadPayload.failedCount || 0;
  const score = leadPayload.score || 0;
  const slaPenalties = leadPayload.slaPenalties || '€0';
  const sector = (leadPayload.sector || 'mfg').toUpperCase();

  if (sec1 && (!sec1.innerText || sec1.innerText.includes('Analyzing'))) {
    sec1.innerText = `Critical ISO 42001 & EU AI Act Annex III liabilities detected (${failedCount} control gaps). Statutory exposure under Regulation 2024/1689 Art. 99 requires executive oversight.`;
  }
  if (sec2 && (!sec2.innerText || sec2.innerText.includes('Evaluating'))) {
    sec2.innerText = `Operational risk profile evaluated at ${score}% risk index. Immobilized working capital and SLA penalties estimated at ${slaPenalties} across sector ${sector}.`;
  }
  if (sec3 && (!sec3.innerText || sec3.innerText.includes('Prioritizing'))) {
    sec3.innerText = `Immediate sovereign air-gapped remediation recommended: deploy local-first execution to isolate data and eliminate recurring SaaS governance exposure.`;
  }

    // Synchronize 2x2 A4 Print Dossier KPI Grid upon unlock
  if (document.getElementById('dossierKpiOverdue')) {
    const overdueVal = leadPayload.overdue || (document.getElementById('sliderOverdue') ? document.getElementById('sliderOverdue').value : 1850000);
    document.getElementById('dossierKpiOverdue').innerText = '€' + Number(overdueVal).toLocaleString();
  }
  if (document.getElementById('dossierKpiDso')) {
    const dsoVal = leadPayload.dso || (document.getElementById('sliderDso') ? document.getElementById('sliderDso').value + ' Days' : '74 Days');
    document.getElementById('dossierKpiDso').innerText = dsoVal + ' (vs 30d EU Limit)';
  }
  if (document.getElementById('dossierKpiSla')) {
    document.getElementById('dossierKpiSla').innerText = leadPayload.slaPenalties || (document.getElementById('kpiSlaPenalties') ? document.getElementById('kpiSlaPenalties').innerText : '€24,812');
  }
  if (document.getElementById('dossierKpiImmobilized')) {
    document.getElementById('dossierKpiImmobilized').innerText = document.getElementById('kpiImmobilizedCapital') ? document.getElementById('kpiImmobilizedCapital').innerText : '€211,849';
  }

  // 4. Trigger PDF print/download dialogue (window.print()) within 0.1s
  setTimeout(() => {
    document.body.classList.add('is-printing-dossier');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('is-printing-dossier');
    }, 500);
  }, 100);

  // 5. Update modal copy
  const modalSubtitle = document.getElementById('txtModalSubtitle');
  if (modalSubtitle) {
    modalSubtitle.innerText = "Dossier unlocked and generated. Executive copy archived in CRM for priority review.";
  }

  // Also trigger runRadarAssessment in background to update AI synthesis from Cloudflare Worker /api/assess
  if (typeof runRadarAssessment === 'function') {
    runRadarAssessment(leadPayload).catch(err => console.warn('Background assessment sync:', err));
  }
}

// Export to window
if (typeof window !== 'undefined') {
  window.BRAND_CONSTANTS = BRAND_CONSTANTS;
  window.ATECO_BENCHMARKS = ATECO_BENCHMARKS;
  window.printAuditSummary = printAuditSummary;
  window.serializeAuditState = serializeAuditState;
  window.copyShareableAuditLink = copyShareableAuditLink;
  window.restoreAuditStateFromHash = restoreAuditStateFromHash;
  window.applyRevenuePreset = applyRevenuePreset;
  window.applyDsoPreset = applyDsoPreset;
  window.onDirectOverdueInput = onDirectOverdueInput;
  window.onDirectOverdueChange = onDirectOverdueChange;
  window.onDirectDsoInput = onDirectDsoInput;
  window.onDirectDsoChange = onDirectDsoChange;
  window.recalculateAudit = recalculateAudit;
  window.showRadarLoadingState = showRadarLoadingState;
  window.hideRadarLoadingState = hideRadarLoadingState;
  window.showRadarErrorState = showRadarErrorState;
  window.renderAuditResults = renderAuditResults;
  window.runRadarAssessment = runRadarAssessment;
  window.runCurrentRadarAudit = runCurrentRadarAudit;
  window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
  window.validateCorporateEmail = validateCorporateEmail;
  window.unlockExecutiveDossierInstant = unlockExecutiveDossierInstant;
}
