import { SignIn } from '@clerk/react';
import { Link } from 'wouter';
import './SignIn.css';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

export default function SignInPage() {
  return (
    <section className="case-signin flex-1" aria-labelledby="signin-heading">
      <div className="case-signin-scene">
        <Link href="/" className="case-signin-brand" aria-label="Greyton Murder Mysteries home">
          <img src="/greyton-logo.png" alt="Greyton Murder Mysteries" />
        </Link>
      </div>
      <div className="case-signin-panel">
        <div className="case-signin-panel-inner">
          <div className="case-signin-heading">
            <span className="case-signin-rule" aria-hidden="true" />
            <h1 id="signin-heading">Welcome Back</h1>
            <p>Sign in to manage bookings and content.</p>
          </div>
          <SignIn
            path={`${basePath}/sign-in`}
            routing="path"
            signUpUrl={`${basePath}/sign-up`}
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
