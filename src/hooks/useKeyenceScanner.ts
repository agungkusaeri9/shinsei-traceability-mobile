import { useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { keyenceScanner } from '../native/keyenceScanner';
import { showError } from '../services/toastService';
import { getErrorMessage } from '../utils/errorMessage';

type UseKeyenceScannerOptions = {
  onScan: (value: string) => void;
  enabled?: boolean;
};

export const useKeyenceScanner = ({
  onScan,
  enabled = true,
}: UseKeyenceScannerOptions) => {
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useFocusEffect(
    useCallback(() => {
      if (!enabled) {
        return undefined;
      }
      if (!keyenceScanner.isAvailable) {
        showError('Scanner KEYENCE tidak tersedia pada perangkat ini');
        return undefined;
      }

      let active = true;
      const unsubscribe = keyenceScanner.subscribe(event => {
        const value = event.data.trim();
        if (active && value) {
          onScanRef.current(value);
        }
      });

      keyenceScanner
        .initialize()
        .then(result => {
          if (active && !result.ready) {
            showError(`Scanner KEYENCE belum siap (${result.status})`);
          }
        })
        .catch(error => {
          if (active) {
            showError(
              getErrorMessage(error, 'Gagal mengaktifkan scanner KEYENCE'),
            );
          }
        });

      return () => {
        active = false;
        unsubscribe();
        keyenceScanner.release().catch(() => undefined);
      };
    }, [enabled]),
  );
};
