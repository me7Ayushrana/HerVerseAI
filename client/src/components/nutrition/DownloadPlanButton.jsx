import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Download } from 'lucide-react';

export default function DownloadPlanButton({ targetId = 'nutrition-plan-pdf', filename = 'herverse-diet-plan.pdf' }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    const element = document.getElementById(targetId);
    if (!element) {
      alert('Plan preview element not found.');
      return;
    }

    setIsGenerating(true);
    try {
      // Temporarily expand all collapsible steps to ensure they are captured in the PDF
      const expandableButtons = element.querySelectorAll('button');
      expandableButtons.forEach(btn => {
        if (btn.innerText.includes('Show Recipe Steps')) {
          btn.click();
        }
      });

      // Wait a short duration for DOM animations to complete
      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(filename);
    } catch (err) {
      console.error('PDF Generation error:', err);
      alert('Could not generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className="text-xs font-bold text-white bg-primary hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-5 py-3 flex items-center gap-2 shadow-sm transition-all-smooth active:scale-95 cursor-pointer"
    >
      <Download size={14} className={isGenerating ? 'animate-bounce' : ''} />
      <span>{isGenerating ? 'Exporting PDF...' : 'Download PDF Plan'}</span>
    </button>
  );
}
