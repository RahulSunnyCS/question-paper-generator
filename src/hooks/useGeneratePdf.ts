import { useCallback, useState } from 'react';
import type { Paper } from '@/types/paper';

const DEFAULT_FILENAME = 'question-paper.pdf';

const sanitizeFilename = (value: string) =>
  value
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const getPdfFilename = (paper: Paper) => {
  const title = (paper as Paper & { title?: string }).title ?? paper.paperTitle;
  const safeName = sanitizeFilename(title);

  return safeName ? `${safeName}.pdf` : DEFAULT_FILENAME;
};

interface UseGeneratePdfResult {
  generatePdf: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const useGeneratePdf = (paper: Paper, headerFile: File | null = null): UseGeneratePdfResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePdf = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('paper', JSON.stringify(paper));

      if (headerFile) {
        formData.append('headerPdf', headerFile, headerFile.name);
      }

      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`PDF generation failed (${response.status})`);
      }

      const pdfBlob = await response.blob();
      const objectUrl = URL.createObjectURL(pdfBlob);

      try {
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = getPdfFilename(paper);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    } catch {
      setError('Failed to download PDF.');
    } finally {
      setIsLoading(false);
    }
  }, [paper, headerFile]);

  return {
    generatePdf,
    isLoading,
    error,
  };
};
