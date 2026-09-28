import { LegalDocumentDialog } from './LegalDocumentDialog';
import privacyText from '@/content/privacy-policy.txt?raw';

export function PrivacyPolicyDialog() {
  return <LegalDocumentDialog text={privacyText} />;
}