import { type ReactNode, useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider, Show, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import {
  Redirect,
  Route,
  Router as WouterRouter,
  Switch,
  useLocation,
} from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Home from '@/pages/Home';
import CustomMystery from '@/pages/CustomMystery';
import Book from '@/pages/Book';
import PublicEvent from '@/pages/PublicEvent';
import AdminDashboard from '@/pages/AdminDashboard';
import SignInPage from '@/pages/SignIn';
import SignUpPage from '@/pages/SignUp';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const externalDeployment = import.meta.env.VITE_EXTERNAL_DEPLOYMENT === 'true';
const clerkPubKey = externalDeployment
  ? import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
  : publishableKeyFromHost(
      window.location.hostname,
      import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
    );
const clerkProxyUrl = externalDeployment
  ? undefined
  : import.meta.env.VITE_CLERK_PROXY_URL;

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || '/'
    : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/greyton-logo.png`,
  },
  variables: {
    colorPrimary: '#a34245',
    colorForeground: '#ebddc5',
    colorMutedForeground: '#b9a88d',
    colorBackground: '#2b241e',
    colorInput: '#392f26',
    colorInputForeground: '#ebddc5',
    colorDanger: '#bf6262',
    colorNeutral: '#927a5d',
    fontFamily: '"DM Sans", sans-serif',
    borderRadius: '0.2rem',
  },
};

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const previousUserId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    return addListener(({ user }) => {
      const nextUserId = user?.id ?? null;
      if (
        previousUserId.current !== undefined &&
        previousUserId.current !== nextUserId
      ) {
        queryClient.clear();
      }
      previousUserId.current = nextUserId;
    });
  }, [addListener]);

  return null;
}

function NavigationEffects() {
  const [location] = useLocation();

  useEffect(() => {
    const scrollToDestination = () => {
      const sectionId = window.location.hash.slice(1);
      if (sectionId) {
        document
          .getElementById(sectionId)
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const frame = window.requestAnimationFrame(scrollToDestination);
    window.addEventListener('hashchange', scrollToDestination);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('hashchange', scrollToDestination);
    };
  }, [location]);

  return null;
}

function ProtectedAdmin() {
  return (
    <>
      <Show when="signed-in">
        <AdminDashboard />
      </Show>
      <Show when="signed-out">
        <Redirect to="/sign-in" />
      </Show>
    </>
  );
}

function Router() {
  const [location] = useLocation();
  const isAdmin = location.startsWith('/admin');
  const isAuthRoute =
    location.startsWith('/sign-in') || location.startsWith('/sign-up');

  return (
    <div className="noise-bg flex min-h-[100dvh] flex-col bg-background text-foreground">
      <div className="mist-overlay" aria-hidden="true" />
      {!isAdmin && !isAuthRoute && <Navbar />}
      <main className="flex flex-1 flex-col">
        <RoutedErrorBoundary>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/custom" component={CustomMystery} />
            <Route path="/book" component={Book} />
            <Route path="/public-event" component={PublicEvent} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route path="/admin" component={ProtectedAdmin} />
            <Route component={NotFound} />
          </Switch>
        </RoutedErrorBoundary>
      </main>
      {!isAdmin && !isAuthRoute && <Footer />}
    </div>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <NavigationEffects />
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;