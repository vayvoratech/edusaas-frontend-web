// Small helpers used by the various "Export CSV / Export PDF" buttons in the app.
// CSV: builds a CSV blob and triggers a download.
// PDF: just `window.print()` against a print-only stylesheet that the page sets up.

export function toCsv(rows) {
  const esc = (v) => {
    if (v == null) return '';
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return rows.map((r) => r.map(esc).join(',')).join('\r\n');
}

export function downloadCsv(filename, rows) {
  const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const todayStamp = () => new Date().toISOString().slice(0, 10);

// A reusable <style> block that hides everything except #print-area when printing.
// Pages render <PrintStyles /> and put their printable content inside id="print-area".
export const printStyleHtml = `
  @media print {
    body * { visibility: hidden !important; }
    #print-area, #print-area * { visibility: visible !important; }
    #print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 16px; }
    .no-print { display: none !important; }
    .recharts-wrapper { page-break-inside: avoid; }
  }
`;
