import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TilawetApp } from "@/pages/TilawetApp";
import { ApiKeyModal } from "@/components/ApiKeyModal";

const queryClient = new QueryClient();

function App() {
  const [apiKey, setApiKey] = useState<string>(() => {
    return sessionStorage.getItem("openai_api_key") || "";
  });
  const [showApiModal, setShowApiModal] = useState(false);

  useEffect(() => {
    if (!apiKey) {
      setShowApiModal(true);
    }
  }, [apiKey]);

  const handleApiKeySubmit = (key: string) => {
    sessionStorage.setItem("openai_api_key", key);
    setApiKey(key);
    setShowApiModal(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark">
          <TilawetApp apiKey={apiKey} onRequestApiKey={() => setShowApiModal(true)} />
          {showApiModal && (
            <ApiKeyModal
              onSubmit={handleApiKeySubmit}
              onClose={() => apiKey && setShowApiModal(false)}
            />
          )}
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
