import { useAcceptanceFlow } from '../../../hooks/useAcceptanceFlow';
import { submitSmtAcceptance } from '../services/smtService';

export const useSmtAcceptanceFlow = () =>
  useAcceptanceFlow({
    submitFn: submitSmtAcceptance,
    successTitle: 'SMT Acceptance',
    errorTitle: 'Gagal memproses SMT Acceptance',
  });
