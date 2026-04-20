import { useCallback, useEffect, useRef } from 'react';
import { processScanDataApi } from '../services/api';
import { ScanResult } from '../types';

const SCANNER_KEY_INTERVAL = 100;

export type UseScannerInputOptions = {
  deviceId: number | null;
  serverIP: string | null;
  serverPort: string | null;
  onUserIdScan?: (result: ScanResult) => void;
};

/**
 * Captures keyboard input from a barcode scanner and processes the aggregated data once typing completes.
 */
export const useScannerInput = ({
  deviceId,
  serverIP,
  serverPort,
  onUserIdScan,
}: UseScannerInputOptions) => {
  const scanBufferRef = useRef('');
  const isScanning = useRef(false);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingScan = useRef(false);
  const lastKeyTime = useRef(0);

  const resetScan = useCallback(() => {
    isScanning.current = false;
    scanBufferRef.current = '';
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
    isProcessingScan.current = false;
  }, []);

  const processScanData = useCallback(() => {
    if (isProcessingScan.current) {
      return;
    }

    if (scanBufferRef.current && deviceId && serverIP && serverPort) {
      isProcessingScan.current = true;
      const payload = scanBufferRef.current;
      console.log('スキャンされたデータ:', payload);

      processScanDataApi(serverIP, serverPort, deviceId, payload)
        .then((result: ScanResult) => {
          if (result.category === 'UserID') {
            onUserIdScan?.(result);
          }
        })
        .catch((error) => {
          console.error('Failed to process scan data:', error);
        })
        .finally(() => {
          resetScan();
          isProcessingScan.current = false;
        });
    } else {
      resetScan();
    }
  }, [deviceId, serverIP, serverPort, onUserIdScan, resetScan]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleKeyPress = (event: KeyboardEvent) => {
      const currentTime = Date.now();
      const isScanner = currentTime - lastKeyTime.current <= SCANNER_KEY_INTERVAL;

      if (!isScanning.current) {
        isScanning.current = true;
        scanBufferRef.current = '';
      }

      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }

      if (event.key.length === 1) {
        scanBufferRef.current += event.key;
      } else if (event.key === 'Enter') {
        processScanData();
        lastKeyTime.current = currentTime;
        return;
      }

      scanTimeoutRef.current = setTimeout(() => {
        if (isScanner) {
          processScanData();
        } else {
          resetScan();
        }
      }, SCANNER_KEY_INTERVAL);

      lastKeyTime.current = currentTime;
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      resetScan();
    };
  }, [processScanData, resetScan]);
};
