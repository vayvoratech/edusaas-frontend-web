// Generates a printable certificate PDF in the browser (no backend file needed).
// jsPDF is lazy-loaded so it stays out of the main bundle until a download happens.

const PAGE_W = 297; // A4 landscape, mm
const PAGE_H = 210;

const formatDate = (value) => {
  const d = value ? new Date(value) : new Date();
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};

/**
 * Build and download a certificate PDF.
 * @param {Object} cert Certificate record from GET /api/certificates
 * @param {string} studentName Display name of the student
 * @param {string} courseName Title of the completed course shown on the certificate
 */
export async function downloadCertificatePdf(cert, studentName = 'Student', courseName = 'Course Completion') {
  if (!cert) return;

  const { jsPDF } = await import('jspdf');

  const code = cert.certificate_code || cert.code || 'CERTIFICATE';
  const course = courseName || cert.course_name || cert.course_title || cert.title || cert.program || 'Course Completion';
  const issuedDate = formatDate(cert.issued_date || cert.issued_at);

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Background
  doc.setFillColor(249, 250, 251); // slate-50
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');

  // Outer + inner decorative border
  doc.setDrawColor(30, 64, 175); // blue-900-ish
  doc.setLineWidth(1.2);
  doc.rect(10, 10, PAGE_W - 20, PAGE_H - 20);

  doc.setDrawColor(16, 185, 129); // green accent
  doc.setLineWidth(0.4);
  doc.rect(14, 14, PAGE_W - 28, PAGE_H - 28);

  // Header
  doc.setTextColor(71, 85, 105); // slate-600
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.text('EDUPLATFORM', PAGE_W / 2, 32, { align: 'center' });

  doc.setFont('times', 'bold');
  doc.setTextColor(30, 41, 59); // slate-800
  doc.setFontSize(34);
  doc.text('Certificate of Achievement', PAGE_W / 2, 55, { align: 'center' });

  // Recipient
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('This certificate is proudly presented to', PAGE_W / 2, 82, { align: 'center' });

  doc.setFont('times', 'bolditalic');
  doc.setFontSize(30);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(studentName, PAGE_W / 2, 100, { align: 'center' });

  // Course line
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(71, 85, 105);
  doc.text('for successfully completing', PAGE_W / 2, 116, { align: 'center' });

  doc.setFont('times', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(30, 64, 175); // blue-800
  doc.text(doc.splitTextToSize(course, PAGE_W - 100), PAGE_W / 2, 130, { align: 'center' });

  // Issue date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text(`Issued on ${issuedDate}`, PAGE_W / 2, 148, { align: 'center' });

  // Footer: code left, signature line right
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Certificate ID: ${code}`, 20, PAGE_H - 24);

  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.3);
  doc.line(PAGE_W - 90, PAGE_H - 30, PAGE_W - 25, PAGE_H - 30);
  doc.text('Authorized Signature', PAGE_W - 57.5, PAGE_H - 24, { align: 'center' });

  // Filename: Certificate_<code>_<today>.pdf (code may contain / etc.)
  const safeCode = String(code).replace(/[^a-z0-9_-]+/gi, '_');
  doc.save(`Certificate_${safeCode}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
