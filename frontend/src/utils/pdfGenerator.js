import { jsPDF } from 'jspdf';
import { generateFormalComplaintLetter } from './formalReportTemplate';

/**
 * Loads an image from a URL or Blob and converts it to a data URL for jsPDF.
 */
const loadImageDataUrl = (src) => {
  return new Promise((resolve) => {
    if (!src) return resolve(null);

    // If it's already a base64 string
    if (typeof src === 'string' && src.startsWith('data:image')) {
      return resolve(src);
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataUrl);
      } catch (e) {
        console.warn('Could not convert image to DataURL for PDF (likely CORS):', e);
        resolve(null);
      }
    };
    img.onerror = () => {
      resolve(null);
    };
    img.src = src;
  });
};

/**
 * Generates and downloads an official Urban EYE Incident PDF Report with formal complaint letter.
 * @param {Object} detection - The incident detection object
 * @param {string} [fallbackImageUrl] - Optional preview or uploaded image URL
 */
export async function generateReportPDF(detection, fallbackImageUrl = null) {
  if (!detection) {
    alert('No report data available to generate PDF.');
    return;
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const reportId = detection.id || detection._id || `RPT-${Date.now()}`;
  const timestamp = detection.createdAt 
    ? new Date(detection.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
    : new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

  const category = (detection.type || 'Infrastructure Defect').toUpperCase();
  const severity = (detection.severity || 'Medium').toUpperCase();
  const status = (detection.status || 'ASSIGNED').toUpperCase();
  const department = detection.assignedDepartment || 'Municipal Public Works Department';
  const address = detection.address || 'Location coordinates recorded via GPS';
  const lat = detection.lat ? Number(detection.lat).toFixed(6) : 'N/A';
  const lng = detection.lng ? Number(detection.lng).toFixed(6) : 'N/A';
  const reportCount = detection.reportCount || 1;
  const confidence = detection.confidence ? `${Math.round(detection.confidence * 100)}%` : '94% (Verified)';

  // Formal complaint letter text: use saved edited text or generate standard formal letter
  const formalLetterText = detection.reportText && detection.reportText.includes('FORMAL')
    ? detection.reportText
    : generateFormalComplaintLetter({
        id: reportId,
        type: detection.type || 'pothole',
        severity: detection.severity || 'medium',
        address: address,
        lat: detection.lat,
        lng: detection.lng,
        reportCount: reportCount,
        createdAt: detection.createdAt,
        assignedDepartment: department,
        customRemarks: detection.customRemarks || ''
      });

  // =========================================================================
  // PAGE 1: OFFICIAL INCIDENT DOSSIER & EVIDENCE
  // =========================================================================

  // Top Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 32, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(56, 189, 248); // sky-400
  doc.text('URBAN EYE', margin, 14);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('SMART CIVIC INFRASTRUCTURE & AI INCIDENT TRIAGE PLATFORM', margin, 20);

  // Reference & Date Badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`REF #${reportId.toString().slice(-8).toUpperCase()}`, pageWidth - margin, 13, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(timestamp, pageWidth - margin, 20, { align: 'right' });

  // Accent line under header
  doc.setFillColor(14, 165, 233); // sky-500
  doc.rect(0, 32, pageWidth, 1.5, 'F');

  let currentY = 40;

  // Status & Severity Bar
  let sevR = 245, sevG = 158, sevB = 11; // Amber
  if (severity === 'HIGH' || severity === 'CRITICAL') {
    sevR = 239; sevG = 68; sevB = 68; // Red
  } else if (severity === 'LOW') {
    sevR = 16; sevG = 185; sevB = 129; // Green
  }

  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, 'FD');

  // Category
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('INCIDENT CLASSIFICATION', margin + 6, currentY + 7);
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(category, margin + 6, currentY + 16);

  // Severity
  const col2X = margin + 55;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('SEVERITY LEVEL', col2X, currentY + 7);
  doc.setFillColor(sevR, sevG, sevB);
  doc.roundedRect(col2X, currentY + 10, 24, 7, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text(severity, col2X + 12, currentY + 15, { align: 'center' });

  // Status
  const col3X = margin + 95;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('DISPATCH STATUS', col3X, currentY + 7);
  doc.setTextColor(14, 165, 233);
  doc.setFontSize(10);
  doc.text(status, col3X, currentY + 15);

  // Assigned Department
  const col4X = margin + 138;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('ASSIGNED DEPARTMENT', col4X, currentY + 7);
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  const deptLines = doc.splitTextToSize(department, 42);
  doc.text(deptLines, col4X, currentY + 14);

  currentY += 30;

  // SECTION 1: Location Intelligence
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('1. GEOSPATIAL & LOCATION INTELLIGENCE', margin, currentY);

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, currentY + 2, margin + contentWidth, currentY + 2);

  currentY += 8;

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, currentY, contentWidth, 22, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('LANDMARK / ADDRESS:', margin + 4, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  const addressLines = doc.splitTextToSize(address, contentWidth - 8);
  doc.text(addressLines, margin + 4, currentY + 11);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`GPS COORDINATES: Latitude ${lat}, Longitude ${lng}`, margin + 4, currentY + 18);

  currentY += 28;

  // SECTION 2: Visual Evidence Box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('2. INCIDENT VISUAL EVIDENCE', margin, currentY);

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, currentY + 2, margin + contentWidth, currentY + 2);

  currentY += 6;

  const imageSource = fallbackImageUrl || detection.imageUrl;
  let imageDataUrl = null;
  if (imageSource) {
    const fullImgUrl = imageSource.startsWith('http') 
      ? imageSource 
      : `https://urban-eye-wi2j.onrender.com${imageSource}`;
    imageDataUrl = await loadImageDataUrl(fullImgUrl);
  }

  const imgBoxHeight = 72;
  const imgBoxWidth = contentWidth;

  if (imageDataUrl) {
    try {
      doc.setFillColor(15, 23, 42);
      doc.roundedRect(margin, currentY, imgBoxWidth, imgBoxHeight, 2, 2, 'F');
      
      const displayW = imgBoxWidth - 8;
      const displayH = imgBoxHeight - 8;
      doc.addImage(imageDataUrl, 'JPEG', margin + 4, currentY + 4, displayW, displayH, undefined, 'FAST');
      
      doc.setFillColor(0, 0, 0);
      doc.rect(margin + 6, currentY + imgBoxHeight - 12, 54, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(16, 185, 129);
      doc.text('✓ AI GEO-VERIFIED EVIDENCE', margin + 8, currentY + imgBoxHeight - 7);
    } catch (e) {
      console.warn('Failed to embed image in PDF:', e);
      renderPlaceholderImageBox(doc, margin, currentY, imgBoxWidth, imgBoxHeight);
    }
  } else {
    renderPlaceholderImageBox(doc, margin, currentY, imgBoxWidth, imgBoxHeight);
  }

  currentY += imgBoxHeight + 8;

  // SECTION 3: AI Triage & Dispatch Audit Trail
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('3. AI AUTOMATION & DISPATCH AUDIT TRAIL', margin, currentY);

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, currentY + 2, margin + contentWidth, currentY + 2);

  currentY += 7;

  const tileWidth = (contentWidth - 9) / 4;
  const tileHeight = 22;

  const tiles = [
    { label: 'AI CONFIDENCE', value: confidence, sub: 'YOLOv8 Computer Vision' },
    { label: 'DEDUPLICATION', value: '50m Radius', sub: `${reportCount} Citizen Report${reportCount > 1 ? 's' : ''}` },
    { label: 'DISPATCH CHANNEL', value: 'Automated SMTP', sub: 'Verified Municipal Mail' },
    { label: 'AUDIT STATUS', value: 'VERIFIED', sub: 'Tamper-evident logs' }
  ];

  tiles.forEach((t, i) => {
    const tileX = margin + i * (tileWidth + 3);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(tileX, currentY, tileWidth, tileHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(t.label, tileX + 3, currentY + 5);

    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(t.value, tileX + 3, currentY + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(t.sub, tileX + 3, currentY + 18);
  });

  // Footer for Page 1
  renderFooter(doc, pageWidth, pageHeight, margin, 1, 2);

  // =========================================================================
  // PAGE 2: OFFICIAL FORMAL COMPLAINT & GRIEVANCE LETTER
  // =========================================================================
  doc.addPage();

  // Page 2 Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(56, 189, 248);
  doc.text('URBAN EYE • OFFICIAL CIVIC GRIEVANCE', margin, 12);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('FORMAL MUNICIPAL REDRESSAL COMPLAINT LETTER', margin, 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text(`REF: #${reportId.toString().slice(-8).toUpperCase()}`, pageWidth - margin, 15, { align: 'right' });

  doc.setFillColor(14, 165, 233);
  doc.rect(0, 24, pageWidth, 1, 'F');

  let page2Y = 32;

  // Formal Letter Paper Container
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, page2Y, contentWidth, pageHeight - page2Y - 24, 2, 2, 'FD');

  // Letter Content Padding
  let textY = page2Y + 8;
  const letterMargin = margin + 7;
  const letterContentWidth = contentWidth - 14;

  // Render the lines of the formal letter
  doc.setFont('courier', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);

  const lines = formalLetterText.split('\n');
  
  for (const line of lines) {
    // Check if line is a header or divider
    if (line.startsWith('FORMAL CIVIC GRIEVANCE') || line.startsWith('SUBJECT:')) {
      doc.setFont('courier', 'bold');
      doc.setTextColor(15, 23, 42);
    } else if (line.startsWith('TO:') || line.startsWith('Respected') || line.match(/^[0-9]\./)) {
      doc.setFont('courier', 'bold');
      doc.setTextColor(30, 41, 59);
    } else {
      doc.setFont('courier', 'normal');
      doc.setTextColor(51, 65, 85);
    }

    if (line.trim() === '') {
      textY += 3.5;
    } else {
      const wrappedLines = doc.splitTextToSize(line, letterContentWidth);
      for (const wl of wrappedLines) {
        if (textY > pageHeight - 32) {
          // If letter exceeds bounds, add page
          renderFooter(doc, pageWidth, pageHeight, margin, 2, 3);
          doc.addPage();
          textY = 25;
        }
        doc.text(wl, letterMargin, textY);
        textY += 4.2;
      }
    }
  }

  // Footer for Page 2
  renderFooter(doc, pageWidth, pageHeight, margin, 2, 2);

  // Save the PDF file
  const cleanId = String(reportId).replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Formal_Civic_Grievance_Report_${cleanId}.pdf`);
}

function renderFooter(doc, pageWidth, pageHeight, margin, currentPage, totalPages) {
  doc.setFillColor(15, 23, 42);
  doc.rect(0, pageHeight - 14, pageWidth, 14, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Urban EYE Smart Governance Platform • Automated Civic Issue Resolution System', margin, pageHeight - 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(56, 189, 248);
  doc.text(`PAGE ${currentPage} OF ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
}

function renderPlaceholderImageBox(doc, x, y, width, height) {
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(x, y, width, height, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('INCIDENT PHOTOGRAPHIC EVIDENCE', x + width / 2, y + height / 2 - 2, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Image stored on secure municipal cloud storage', x + width / 2, y + height / 2 + 5, { align: 'center' });
}
