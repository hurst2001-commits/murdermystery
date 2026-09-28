import { SignUp } from '@clerk/react';
import { Link } from 'wouter';
import './SignIn.css';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

export default function SignUpPage() {
  return (
    <section className="case-signin flex-1" aria-labelledby="signup-heading">
      <div className="case-signin-scene">
        <Link href="/" className="case-signin-brand" aria-label="Greyton Murder Mysteries home">
          <img src="/greyton-logo.png" alt="Greyton Murder Mysteries" />
        </Link>
      </div>
      <div className="case-signin-panel">
        <div className="case-signin-panel-inner">
          <div className="case-signin-heading">
            <span className="case-signin-rule" aria-hidden="true" />
            <h1 id="signup-heading">Create an Account</h1>
            <p>Join to manage your experiences.</p>
          </div>
          <SignUp
            path={`${basePath}/sign-up`}
            routing="path"
            signInUrl={`${basePath}/sign-in`}
            forceRedirectUrl={`${basePath}/admin`}
            appearance={{
              elements: {
                rootBox: 'case-signin-clerk-root',
                cardBox: 'case-signin-clerk-box',
                card: 'case-signin-clerk-card',
                footer: 'case-signin-clerk-footer',
                main: 'case-signin-clerk-main',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                logoBox: 'hidden',
                socialButtonsBlockButton: 'case-signin-google',
                socialButtonsBlockButtonText: 'case-signin-google-text',
                dividerText: 'case-signin-divider-text',
                dividerLine: 'case-signin-divider-line',
                formFieldLabel: 'case-signin-field-label',
                formFieldInput: 'case-signin-field-input',
                otpCodeFieldInput: 'case-signin-otp-input',
                formButtonPrimary: 'case-signin-submit',
                footerAction: 'case-signin-footer-action',
                footerActionText: 'case-signin-footer-text',
                footerActionLink: 'case-signin-footer-link',
                formFieldAction: 'case-signin-field-action',
                formFieldHintText: 'case-signin-hint',
                formFieldSuccessText: 'case-signin-success',
                backLink: 'case-signin-back-link',
                alternativeMethodsBlockButton: 'case-signin-alt-method',
                identityPreview: 'case-signin-identity',
                identityPreviewText: 'case-signin-identity-text',
              },
            }}
          />
        </div>
      </div>
    </section>
  );
}
