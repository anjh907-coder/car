import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { sanitizeFilenameSegment } from '../types/project';

interface ExportPdfOptions {
  element: HTMLElement;
  teamName: string;
  projectName: string;
}

/**
 * Captures the A4 preview DOM node cleanly at high resolution and downloads a vertical A4 PDF.
 * Resets preview scaling inside html2canvas's onclone callback so the PDF always prints
 * at exact 794px A4 portrait proportions regardless of screen size.
 */
export async function exportA4ElementToPdf({
  element,
  teamName,
  projectName,
}: ExportPdfOptions): Promise<string> {
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  const safeTeam = sanitizeFilenameSegment(teamName, '우리팀');
  const safeProject = sanitizeFilenameSegment(projectName, '자율주행차');
  const filename = `${safeTeam}_${safeProject}_기획서.pdf`;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#FFFFFF',
    logging: false,
    width: 794,
    windowWidth: 1200,
    onclone: (clonedDoc) => {
      // Ensure root and body never expose Tailwind v4 oklch() computed colors to html2canvas
      clonedDoc.documentElement.style.backgroundColor = '#FFFFFF';
      clonedDoc.documentElement.style.color = '#1E293B';
      clonedDoc.body.style.backgroundColor = '#FFFFFF';
      clonedDoc.body.style.color = '#1E293B';

      const clonedTarget = clonedDoc.getElementById(element.id);
      if (clonedTarget) {
        clonedTarget.style.transform = 'none';
        clonedTarget.style.width = '794px';
        clonedTarget.style.minHeight = '1123px';
        clonedTarget.style.margin = '0';
        clonedTarget.style.boxShadow = 'none';
        clonedTarget.style.borderRadius = '0';

        // Clear any Tailwind utility colors/shadows/transforms on ancestor wrappers
        let parent = clonedTarget.parentElement;
        while (parent && parent !== clonedDoc.body) {
          parent.style.transform = 'none';
          parent.style.boxShadow = 'none';
          parent.style.borderColor = 'transparent';
          parent.style.outlineColor = 'transparent';
          parent.style.backgroundColor = '#FFFFFF';
          parent.style.color = '#1E293B';
          parent = parent.parentElement;
        }
      }

      const scaleWrapper = clonedDoc.getElementById('a4-scale-wrapper');
      if (scaleWrapper) {
        scaleWrapper.style.transform = 'none';
        scaleWrapper.style.width = '794px';
        scaleWrapper.style.height = 'auto';
      }
    },
  });

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
  const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

  const imgWidthMm = pdfWidth;
  const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width;
  const imgData = canvas.toDataURL('image/png', 1.0);

  // If the rendered content fits comfortably within ~1.03 pages, scale slightly to fit cleanly on 1 A4 page
  if (imgHeightMm <= pdfHeight * 1.04) {
    const fitRatio = imgHeightMm > pdfHeight ? pdfHeight / imgHeightMm : 1;
    const renderWidth = imgWidthMm * fitRatio;
    const renderHeight = imgHeightMm * fitRatio;
    const offsetX = (pdfWidth - renderWidth) / 2;
    pdf.addImage(imgData, 'PNG', offsetX, 0, renderWidth, renderHeight, undefined, 'FAST');
  } else {
    // Multi-page vertical pagination for very long detailed explanations
    let heightLeft = imgHeightMm;
    let positionY = 0;

    pdf.addImage(imgData, 'PNG', 0, positionY, imgWidthMm, imgHeightMm, undefined, 'FAST');
    heightLeft -= pdfHeight;

    while (heightLeft > 1) {
      positionY = heightLeft - imgHeightMm;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, positionY, imgWidthMm, imgHeightMm, undefined, 'FAST');
      heightLeft -= pdfHeight;
    }
  }

  pdf.save(filename);
  return filename;
}
