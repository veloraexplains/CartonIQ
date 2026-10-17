import { Printer } from '@capgo/capacitor-printer';

export const triggerPrint = async () => {
  try {
    // 1. Find the white paper container
    const elements = Array.from(document.querySelectorAll('div'));
    let paperElement = null;
    let maxArea = 0;

    elements.forEach(el => {
      const style = window.getComputedStyle(el);
      if (style.backgroundColor === 'rgb(255, 255, 255)' || el.classList.contains('bg-white')) {
        const rect = el.getBoundingClientRect();
        const area = rect.width * rect.height;
        if (area > maxArea) {
          maxArea = area;
          paperElement = el;
        }
      }
    });

    if (!paperElement) {
      alert('Could not find the document to print.');
      return;
    }

    // 2. Create a style tag for beautiful, colorful printing
    const style = document.createElement('style');
    style.id = 'print-style-temp';
    style.innerHTML = `
      @media print {
        /* Hide everything else */
        body * { visibility: hidden !important; background: transparent !important; }
        
        /* Show only the paper */
        .printing-paper, .printing-paper * { visibility: visible !important; }
        
        /* FORCE COLORS TO PRINT */
        .printing-paper, .printing-paper * { 
          -webkit-print-color-adjust: exact !important; 
          print-color-adjust: exact !important;
        }
        
        /* Position the paper at the top left of the page */
        .printing-paper { 
          position: absolute !important; 
          left: 0 !important; 
          top: 0 !important; 
          width: 100% !important; 
          background: #ffffff !important;
          margin: 0 !important; 
          padding: 20px !important;
          border: none !important;
          box-shadow: none !important;
        }

        /* ✨ THE FIXES ✨ */
        
        /* 1. Hide the app buttons (WhatsApp, Print, etc.) so they don't show as empty boxes */
        .printing-paper button, 
        .printing-paper .flex.gap-2 {
          display: none !important;
        }

        /* 2. Make the Table Headers YELLOW with dark text */
        .printing-paper table th {
          background-color: #fbbf24 !important; /* Beautiful Yellow */
          color: #000000 !important; /* Black text */
          font-weight: bold !important;
          border: 1px solid #d97706 !important; /* Slightly darker yellow border */
        }
        
        /* 3. Style the table rows */
        .printing-paper table td {
          border-bottom: 1px solid #e2e8f0 !important;
          color: #1e293b !important;
        }
        
        /* 4. Add subtle background to the info boxes */
        .printing-paper div[class*="bg-slate-"] {
          background-color: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
        }

        /* 5. Keep the Orange Total */
        .printing-paper div[class*="text-amber-"], 
        .printing-paper span[class*="text-amber-"] {
          color: #ea580c !important;
          font-weight: bold !important;
        }
      }
    `;
    document.head.appendChild(style);
    paperElement.classList.add('printing-paper');

    // 3. Trigger the native print
    await Printer.printWebView({
      name: 'CartonIQ Document'
    });

    // 4. Clean up
    setTimeout(() => {
      document.getElementById('print-style-temp')?.remove();
      paperElement.classList.remove('printing-paper');
    }, 2000);

  } catch (error) {
    console.error('Print error:', error);
    alert('Could not open print dialog.');
  }
};
