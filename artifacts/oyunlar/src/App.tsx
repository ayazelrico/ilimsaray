import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import KuranKasifi from "@/pages/KuranKasifi";
import TecvidUstasi from "@/pages/TecvidUstasi";
import HarflerinYolculugu from "@/pages/HarflerinYolculugu";
import TilavetYarismasi from "@/pages/TilavetYarismasi";
import BilgiYolculugu from "@/pages/BilgiYolculugu";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/kuran-kasifi" component={KuranKasifi} />
      <Route path="/tecvid-ustasi" component={TecvidUstasi} />
      <Route path="/harflerin-yolculugu" component={HarflerinYolculugu} />
      <Route path="/tilavet-yarismasi" component={TilavetYarismasi} />
      <Route path="/bilgi-yolculugu" component={BilgiYolculugu} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark">
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
