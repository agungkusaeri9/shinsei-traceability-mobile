import { useAcceptanceFlow } from '../../../hooks/useAcceptanceFlow';
import { submitQaAssyAcceptance } from '../services/qaAssyService';

export const useQaAcceptanceFlow = () =>
  useAcceptanceFlow({
    submitFn: submitQaAssyAcceptance,
    successTitle: 'QA Acceptance',
    errorTitle: 'Gagal memproses QA Assy Acceptance',
  });
