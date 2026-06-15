import jsPDF from "jspdf";

const brand = {
  primary: [31, 41, 55],
  accent: [217, 119, 6],
  border: [226, 232, 240],
  muted: [100, 116, 139],
  soft: [255, 251, 235],
};

const safeText = (value, fallback = "-") => {
  const text = value === undefined || value === null || value === "" ? fallback : String(value);
  return text.replace(/\s+/g, " ").trim();
};

const safeFilePart = (value, fallback = "Feedback") =>
  safeText(value, fallback).replace(/[\\/:*?"<>|]+/g, "").replace(/\s+/g, "_");

const drawChrome = (doc, title) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setDrawColor(...brand.border);
  doc.setLineWidth(0.7);
  doc.roundedRect(10, 10, pageWidth - 20, pageHeight - 20, 3, 3);

  doc.setTextColor(...brand.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("ProjectHub+", 16, 24);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...brand.muted);
  doc.setFontSize(9);
  doc.text("Student feedback report", 16, 31);

  doc.setFillColor(...brand.soft);
  doc.roundedRect(16, 39, pageWidth - 32, 18, 3, 3, "F");
  doc.setTextColor(...brand.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(title, 22, 51);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...brand.muted);
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 16, pageHeight - 14);
};

const addInfoRows = (doc, rows, startY) => {
  let y = startY;
  rows.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...brand.primary);
    doc.setFontSize(10);
    doc.text(label, 22, y);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    const wrapped = doc.splitTextToSize(safeText(value), 118);
    doc.text(wrapped, 68, y);
    y += Math.max(8, wrapped.length * 5.5);
  });
  return y;
};

const addFeedbackBox = (doc, heading, feedback, startY) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const boxX = 18;
  const boxWidth = pageWidth - 36;
  const content = doc.splitTextToSize(safeText(feedback, "No feedback yet."), boxWidth - 16);
  const boxHeight = Math.min(pageHeight - startY - 30, Math.max(36, content.length * 5.5 + 22));

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...brand.primary);
  doc.setFontSize(12);
  doc.text(heading, boxX + 4, startY);

  doc.setDrawColor(...brand.border);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(boxX, startY + 7, boxWidth, boxHeight, 3, 3, "FD");
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(10);
  doc.text(content, boxX + 8, startY + 19);
};

export const downloadProjectFeedbackReport = (project) => {
  const doc = new jsPDF();
  drawChrome(doc, "Faculty Feedback Report");
  const nextY = addInfoRows(doc, [
    ["Project", project.title],
    ["Subject", project.subject],
    ["Technology", project.technology],
    ["Status", project.status],
    ["Grade", project.grade || "N/A"],
    ["Faculty", project.facultyName || "-"],
  ], 72);
  addFeedbackBox(doc, "Faculty Feedback", project.feedback, nextY + 8);
  doc.save(`${safeFilePart(project.title, "Project")}_Feedback.pdf`);
};

export const downloadCertificateFeedbackReport = (certificate) => {
  const doc = new jsPDF();
  drawChrome(doc, "Certificate Feedback Report");
  const nextY = addInfoRows(doc, [
    ["Certificate", certificate.title],
    ["Organization", certificate.organization],
    ["Category", certificate.category],
    ["Issue Date", certificate.issueDate],
    ["Status", certificate.status],
    ["Faculty", certificate.facultyName || "-"],
  ], 72);
  addFeedbackBox(doc, "Faculty Feedback", certificate.remarks, nextY + 8);
  doc.save(`${safeFilePart(certificate.title, "Certificate")}_Feedback.pdf`);
};
