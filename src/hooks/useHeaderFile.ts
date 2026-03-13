import { useState, useEffect, useCallback } from 'react';

const DB_NAME = 'question-paper-generator';
const DB_VERSION = 1;
const STORE_NAME = 'header-file';
const FILE_KEY = 'header';

const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

interface StoredFile {
  blob: Blob;
  name: string;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readFromDb(): Promise<File | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(FILE_KEY);
    request.onsuccess = () => {
      const stored = request.result as StoredFile | undefined;
      if (!stored) {
        resolve(null);
        return;
      }
      resolve(new File([stored.blob], stored.name, { type: stored.blob.type }));
    };
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

async function writeToDb(file: File): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const stored: StoredFile = { blob: file, name: file.name };
    const request = tx.objectStore(STORE_NAME).put(stored, FILE_KEY);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

async function deleteFromDb(): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const request = tx.objectStore(STORE_NAME).delete(FILE_KEY);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

interface UseHeaderFileResult {
  headerFile: File | null;
  uploadError: string | null;
  setHeaderFile: (file: File) => Promise<void>;
  clearHeaderFile: () => Promise<void>;
}

export const useHeaderFile = (): UseHeaderFileResult => {
  const [headerFile, setHeaderFileState] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    readFromDb()
      .then((file) => setHeaderFileState(file))
      .catch(() => {
        // IndexedDB unavailable — silently fall back to no persistence
      });
  }, []);

  const setHeaderFile = useCallback(async (file: File) => {
    setUploadError(null);

    if (file.type !== 'application/pdf') {
      setUploadError('Only PDF files are supported.');
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setUploadError('File must be 2 MB or smaller.');
      return;
    }

    setHeaderFileState(file);
    await writeToDb(file).catch(() => {
      // Persist failed — file is still usable in-memory for this session
    });
  }, []);

  const clearHeaderFile = useCallback(async () => {
    setUploadError(null);
    setHeaderFileState(null);
    await deleteFromDb().catch(() => {});
  }, []);

  return { headerFile, uploadError, setHeaderFile, clearHeaderFile };
};
