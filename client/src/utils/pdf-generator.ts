import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { OutputType } from '@/types';

// Function to generate a PDF from a specific element
export async function generatePdfFromElement(
  elementId: string,
  fileName: string = 'document.pdf'
): Promise<void> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with ID ${elementId} not found`);
      return;
    }

    // Create canvas from the element
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // To handle images from different origins
      logging: false,
    });

    // Calculate dimensions to maintain aspect ratio
    const imgWidth = 210; // A4 width in mm (210mm)
    const pageHeight = 297; // A4 height in mm (297mm)
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Add canvas content to PDF
    let position = 0;
    pdf.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', 0, position, imgWidth, imgHeight);
    
    // If content spans multiple pages
    let heightLeft = imgHeight - pageHeight;
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Save the PDF
    pdf.save(fileName);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
}

// Function to generate appropriate filename based on output type
export function getFileNameForOutputType(type: OutputType): string {
  const timestamp = new Date().toISOString().slice(0, 10);
  
  switch (type) {
    case 'implementation':
      return `implementation-plan-${timestamp}.pdf`;
    case 'cost':
      return `cost-estimate-${timestamp}.pdf`;
    case 'design':
      return `design-concept-${timestamp}.pdf`;
    case 'business':
      return `business-case-${timestamp}.pdf`;
    case 'ai':
      return `ai-considerations-${timestamp}.pdf`;
    default:
      return `solution-output-${timestamp}.pdf`;
  }
}