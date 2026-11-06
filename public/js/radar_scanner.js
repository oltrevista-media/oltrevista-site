// OLTREVISTA Standalone Radar Scanner & Audit Logic v3.63
// Whitelisted against translation

const ATECO_BENCHMARKS = {
  mfg: { code: 'ATECO 25.62 [General Mechanics & Engineering]', avgDso: 78, bottomPct: 22 },
  pkg: { code: 'ATECO 22.22 & 28.96 [Packaging & Rubber Machinery]', avgDso: 82, bottomPct: 25 },
  con: { code: 'ATECO 41.20 [Construction & Building Materials]', avgDso: 95, bottomPct: 35 },
  ele: { code: 'ATECO 26.11 [Electronics & Industrial Equipment]', avgDso: 71, bottomPct: 18 },
  log: { code: 'ATECO 49.41 [Freight Logistics & Distribution]', avgDso: 64, bottomPct: 15 },
  srv: { code: 'ATECO 62.01 [Tech, IT & Professional Services]', avgDso: 58, bottomPct: 12 },
  trd: { code: 'ATECO 46.90 [Wholesale & Industrial Trade]', avgDso: 68, bottomPct: 16 }
};

function printAuditSummary() {
  window.print();
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
  if (typeof recalculateAudit === 'function') {
    recalculateAudit();
  }
}

if (typeof window !== 'undefined') {
  window.ATECO_BENCHMARKS = ATECO_BENCHMARKS;
  window.printAuditSummary = printAuditSummary;
  window.serializeAuditState = serializeAuditState;
  window.copyShareableAuditLink = copyShareableAuditLink;
  window.restoreAuditStateFromHash = restoreAuditStateFromHash;
}
