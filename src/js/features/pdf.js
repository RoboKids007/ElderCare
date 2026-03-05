import { jsPDF } from "jspdf";
import { APP_CONFIG } from "../config/appConfig.js";

function safeFilename(name) {
  return (name || "elder")
    .replace(/[^a-z0-9\-_]+/gi, "_")
    .slice(0, 40);
}

export function exportReportPDF({ reportText, elderName }) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const margin = 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = pageWidth - margin * 2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(APP_CONFIG.pdf.title, margin, 52);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text(APP_CONFIG.pdf.subtitle, margin, 70);
  doc.setTextColor(0);

  doc.setFont("courier", "normal");
  doc.setFontSize(9.5);

  const lines = doc.splitTextToSize(reportText, maxWidth);
  let y = 92;

  for (const line of lines) {
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += 12;
  }

  const file = `${APP_CONFIG.pdf.filePrefix}${safeFilename(elderName)}.pdf`;
  doc.save(file);
}
