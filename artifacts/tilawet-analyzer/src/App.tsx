import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Switch, Route, useLocation, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TilawetApp } from "@/pages/TilawetApp";
import { setCurrentUserId } from "@/lib/historyStore";

const queryClient = new QueryClient();

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#CCFF00",
    colorForeground: "#f2f2f2",
    colorMutedForeground: "#888898",
    colorDanger: "#ef4444",
    colorBackground: "#111118",
    colorInput: "#1a1a24",
    colorInputForeground: "#f2f2f2",
    colorNeutral: "#2a2a3a",
    fontFamily: "Inter, system-ui, sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-[#111118] border border-white/10 rounded-2xl w-[440px] max-w-full overflow-hidden shadow-2xl",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-white font-bold",
    headerSubtitle: "text-[#888898]",
    socialButtonsBlockButtonText: "text-white/80",
    formFieldLabel: "text-white/70 text-sm",
    footerActionLink: "text-[#CCFF00] hover:opacity-80",
    footerActionText: "text-white/40",
    dividerText: "text-white/30",
    identityPreviewEditButton: "text-[#CCFF00]",
    formFieldSuccessText: "text-green-400",
    alertText: "text-white/80",
    logoBox: "mb-2",
    logoImage: "h-8 w-auto",
    socialButtonsBlockButton: "border-white/10 bg-white/5 hover:bg-white/10 text-white",
    formButtonPrimary: "bg-[#CCFF00] text-black font-bold hover:bg-[#CCFF00]/90",
    formFieldInput: "bg-[#1a1a24] border-white/10 text-white",
    footerAction: "border-t border-white/5",
    dividerLine: "bg-white/10",
    alert: "border-white/10 bg-white/5",
    otpCodeFieldInput: "bg-[#1a1a24] border-white/10 text-white",
    formFieldRow: "",
    main: "",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#0a0a0f] px-4">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#0a0a0f] px-4">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function ClerkStateSync() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      setCurrentUserId(userId);
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey ?? ""}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Hoş Geldiniz",
            subtitle: "Hesabınıza giriş yapın",
          },
        },
        signUp: {
          start: {
            title: "Hesap Oluştur",
            subtitle: "ilimsaray.com'a üye olun",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkStateSync />
        <TooltipProvider>
          <div className="dark">
            <Switch>
              <Route path="/sign-in/*?" component={SignInPage} />
              <Route path="/sign-up/*?" component={SignUpPage} />
              <Route component={TilawetApp} />
            </Switch>
            <Toaster />
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}
