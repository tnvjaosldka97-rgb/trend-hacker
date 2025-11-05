import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import ExpertProfile from "./pages/ExpertProfile";
import ETFAnalyzer from "./pages/ETFAnalyzer";
import Subscription from "./pages/Subscription";
import AIReportSample from "./pages/AIReportSample";
import MobileBlocker from "./components/MobileBlocker";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path="/expert/:id" component={ExpertProfile} />
      <Route path="/etf" component={ETFAnalyzer} />
      <Route path="/subscription" component={Subscription} />
      <Route path="/ai-report-sample" component={AIReportSample} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <MobileBlocker>
            <Router />
          </MobileBlocker>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
