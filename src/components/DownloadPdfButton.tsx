import type { Paper } from '@/types/paper';
import { Button } from '@/components/ui/button';
import { useGeneratePdf } from '@/hooks/useGeneratePdf';

interface DownloadPdfButtonProps {
  paper: Paper;
  headerFile?: File | null;
}

export const DownloadPdfButton = ({ paper, headerFile = null }: DownloadPdfButtonProps) => {
  const { generatePdf, isLoading, error } = useGeneratePdf(paper, headerFile);

  return (
    <div className="space-y-1">
      <Button type="button" variant="outline" onClick={generatePdf} disabled={isLoading}>
        {isLoading ? (
          <>
            <span className="mr-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            Generating PDF...
          </>
        ) : (
          'Download PDF'
        )}
      </Button>
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
};
