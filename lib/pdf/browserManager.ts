import { chromium, type Browser } from 'playwright';

let browserPromise: Promise<Browser> | null = null;
let isCleanupRegistered = false;

const registerCleanupHooks = (): void => {
  if (isCleanupRegistered) {
    return;
  }

  const closeBrowser = async (): Promise<void> => {
    if (!browserPromise) {
      return;
    }

    try {
      const activeBrowser = await browserPromise;
      await activeBrowser.close();
      console.info('[pdf] Chromium browser closed.');
    } catch (error) {
      console.error('[pdf] Failed to close Chromium browser cleanly.', error);
    } finally {
      browserPromise = null;
    }
  };

  process.once('beforeExit', () => {
    void closeBrowser();
  });

  process.once('SIGINT', () => {
    void closeBrowser();
  });

  process.once('SIGTERM', () => {
    void closeBrowser();
  });

  isCleanupRegistered = true;
};

const launchBrowser = async (): Promise<Browser> => {
  console.info('[pdf] Launching Chromium browser instance...');

  return chromium.launch({
    headless: true,
    args: ['--disable-dev-shm-usage', '--font-render-hinting=none'],
  });
};

export const getBrowser = async (): Promise<Browser> => {
  registerCleanupHooks();

  if (!browserPromise) {
    browserPromise = launchBrowser().catch((error) => {
      browserPromise = null;
      console.error('[pdf] Chromium launch failed.', error);
      throw error;
    });
  }

  return browserPromise;
};
