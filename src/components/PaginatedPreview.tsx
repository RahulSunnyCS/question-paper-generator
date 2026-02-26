import { useCallback, useEffect, useRef, useState } from 'react';
import { Paper } from '../types/paper';
import { QuestionPaperPrintLayout } from './QuestionPaperPrintLayout';
import './PaginatedPreview.css';

interface PaginatedPreviewProps {
  paper: Paper;
  enableRefreshButton?: boolean;
}

type PagedPreviewer = {
  preview: (content: Element, stylesheets?: string[], renderTo?: Element) => Promise<unknown>;
};

declare global {
  interface Window {
    Paged?: {
      Previewer: new () => PagedPreviewer;
    };
  }
}

const PAGED_SCRIPT_ID = 'pagedjs-polyfill';
const PAGED_SCRIPT_SRC = 'https://unpkg.com/pagedjs/dist/paged.polyfill.js';

const waitForPaged = async () => {
  if (window.Paged?.Previewer) {
    return window.Paged;
  }

  const existingScript = document.getElementById(PAGED_SCRIPT_ID) as HTMLScriptElement | null;

  if (existingScript) {
    await new Promise<void>((resolve, reject) => {
      if (window.Paged?.Previewer) {
        resolve();
        return;
      }

      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Paged.js script.')), {
        once: true,
      });
    });

    if (!window.Paged?.Previewer) {
      throw new Error('Paged.js script loaded, but Previewer is unavailable.');
    }

    return window.Paged;
  }

  const script = document.createElement('script');
  script.id = PAGED_SCRIPT_ID;
  script.src = PAGED_SCRIPT_SRC;
  script.async = true;

  await new Promise<void>((resolve, reject) => {
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paged.js script.'));
    document.head.appendChild(script);
  });

  if (!window.Paged?.Previewer) {
    throw new Error('Paged.js script loaded, but Previewer is unavailable.');
  }

  return window.Paged;
};

const waitForFonts = async () => {
  if (!('fonts' in document)) {
    return;
  }

  await document.fonts.ready;
};

export const PaginatedPreview = ({ paper, enableRefreshButton = true }: PaginatedPreviewProps) => {
  const sourceRef = useRef<HTMLDivElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const runIdRef = useRef(0);
  const [manualRefreshTick, setManualRefreshTick] = useState(0);

  const renderPagination = useCallback(async () => {
    const sourceNode = sourceRef.current;
    const previewNode = previewRef.current;

    if (!sourceNode || !previewNode) {
      return;
    }

    runIdRef.current += 1;
    const currentRun = runIdRef.current;

    previewNode.replaceChildren();

    await waitForFonts();
    const paged = await waitForPaged();

    if (currentRun !== runIdRef.current) {
      return;
    }

    const previewer = new paged.Previewer();

    await previewer.preview(sourceNode, [], previewNode);

    if (currentRun !== runIdRef.current) {
      previewNode.replaceChildren();
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void renderPagination();
    }, 500);

    return () => {
      window.clearTimeout(timeoutId);
      runIdRef.current += 1;
    };
  }, [paper, manualRefreshTick, renderPagination]);

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-800">Print Preview</h2>
        {enableRefreshButton && (
          <button
            type="button"
            onClick={() => setManualRefreshTick((value) => value + 1)}
            className="rounded border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Refresh Preview
          </button>
        )}
      </div>

      <div ref={previewRef} className="paged-preview-output rounded border border-slate-200 bg-slate-100 p-4" />
      <div ref={sourceRef} className="paged-preview-source" aria-hidden="true">
        <QuestionPaperPrintLayout paper={paper} />
      </div>
    </section>
  );
};
