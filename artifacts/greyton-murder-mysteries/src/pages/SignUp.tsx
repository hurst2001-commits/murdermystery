import { SignUp } from '@clerk/react';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

export default function SignUpPage() {
  return (
    <div className="case-auth flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold tracking-tight">Create an Account</h1>
          <p className="text-muted-foreground mt-2">Join to manage your experiences.</p>
        </div>
        <SignUp 
          path={`${basePath}/sign-up`}
          routing="path" 
          signInUrl={`${basePath}/sign-in`}
          forceRedirectUrl={`${basePath}/admin`}
          appearance={{
            elements: {
              rootBox: "w-full mx-auto",
              card: "bg-card border-border shadow-xl rounded-xl w-full",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
              footerActionLink: "text-primary hover:text-primary/90",
            }
          }}
        />
      </div>
    </div>
  );
}
