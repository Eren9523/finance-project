import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

export async function exportToPDF(
  element: HTMLElement,
  filename: string = '业务模型智能推荐综合报告.pdf'
): Promise<void> {
  if (!element) return;

  // Save original inline styles to restore later
  const originalWidth = element.style.width;
  const originalMaxWidth = element.style.maxWidth;
  const originalMargin = element.style.margin;
  const originalPadding = element.style.padding;
  const originalOverflow = element.style.overflow;
  const originalMaxHeight = element.style.maxHeight;
  const originalHeight = element.style.height;
  const originalBoxShadow = element.style.boxShadow;
  const originalBorderRadius = element.style.borderRadius;

  const parent = element.parentElement;
  const parentOriginalOverflow = parent ? parent.style.overflow : '';
  const parentOriginalPadding = parent ? parent.style.padding : '';

  try {
    // Standard printable width for clean A4 conversion (800px)
    const exportWidth = 800;

    // Apply print-optimized styles to target element so it occupies full width without dead space
    element.style.width = `${exportWidth}px`;
    element.style.maxWidth = `${exportWidth}px`;
    element.style.margin = '0 auto';
    element.style.padding = '32px';
    element.style.overflow = 'visible';
    element.style.maxHeight = 'none';
    element.style.height = 'auto';
    element.style.boxShadow = 'none';
    element.style.borderRadius = '0px';

    if (parent) {
      parent.style.overflow = 'visible';
      parent.style.padding = '0';
    }

    // Force recalculation
    const fullWidth = exportWidth;
    const fullHeight = Math.max(element.scrollHeight, element.offsetHeight);

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: fullWidth,
      height: fullHeight,
      windowWidth: fullWidth,
      windowHeight: fullHeight,
      scrollX: 0,
      scrollY: 0,
    });

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210 mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297 mm

    const margin = 10; // 10mm margins
    const printWidth = pdfWidth - margin * 2; // 190mm
    const printHeight = pdfHeight - margin * 2; // 277mm

    // Calculate canvas pixel height corresponding to one A4 printable page
    const pageCanvasHeight = (canvas.width * printHeight) / printWidth;
    const totalPages = Math.ceil(canvas.height / pageCanvasHeight);

    for (let i = 0; i < totalPages; i++) {
      const srcY = i * pageCanvasHeight;
      const sliceHeight = Math.min(pageCanvasHeight, canvas.height - srcY);

      // Create a dedicated canvas tile for this page slice
      const tileCanvas = document.createElement('canvas');
      tileCanvas.width = canvas.width;
      tileCanvas.height = sliceHeight;

      const ctx = tileCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, tileCanvas.width, tileCanvas.height);
        ctx.drawImage(
          canvas,
          0,
          srcY,
          canvas.width,
          sliceHeight,
          0,
          0,
          canvas.width,
          sliceHeight
        );
      }

      const imgData = tileCanvas.toDataURL('image/jpeg', 0.98);
      const printTileHeight = (sliceHeight * printWidth) / canvas.width;

      if (i > 0) {
        pdf.addPage();
      }

      pdf.addImage(imgData, 'JPEG', margin, margin, printWidth, printTileHeight);

      // Add Page Footers (Use standard ASCII format to prevent font encoding garble)
      pdf.setFontSize(8);
      pdf.setTextColor(140, 140, 140);
      pdf.text(
        `Page ${i + 1} / ${totalPages}`,
        pdfWidth / 2,
        pdfHeight - 4,
        { align: 'center' }
      );
    }

    pdf.save(filename);
  } catch (err) {
    console.error('PDF export failed:', err);
    throw err;
  } finally {
    // Restore original element inline styles
    element.style.width = originalWidth;
    element.style.maxWidth = originalMaxWidth;
    element.style.margin = originalMargin;
    element.style.padding = originalPadding;
    element.style.overflow = originalOverflow;
    element.style.maxHeight = originalMaxHeight;
    element.style.height = originalHeight;
    element.style.boxShadow = originalBoxShadow;
    element.style.borderRadius = originalBorderRadius;
    if (parent) {
      parent.style.overflow = parentOriginalOverflow;
      parent.style.padding = parentOriginalPadding;
    }
  }
}


