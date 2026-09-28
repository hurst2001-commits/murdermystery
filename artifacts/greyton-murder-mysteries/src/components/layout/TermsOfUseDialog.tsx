import { LegalDocumentDialog } from './LegalDocumentDialog';
import termsText from '@/content/terms-of-use.txt?raw';

export function TermsOfUseDialog() {
  return <LegalDocumentDialog text={termsText} />;
}