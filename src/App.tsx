import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/oracle";
import { Session } from "@/integrations/oracle";
import { ThemeProvider } from "next-themes";
import DashboardLayout from "./components/DashboardLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import Classrooms from "./pages/Classrooms";
import Clubs from "./pages/Clubs";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { ErrorBoundary } from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <Routes>
              <Route path="/auth" element={session ? <Navigate to="/dashboard" replace /> : <Auth />} />
              <Route
                path="/dashboard"
                element={
                  session ? (
                    <DashboardLayout>
                      <Dashboard />
                    </DashboardLayout>
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                }
              />
              <Route
                path="/"
                element={
                  session ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                }
              />
              <Route
                path="/events"
                element={
                  session ? (
                    <DashboardLayout>
                      <Events />
                    </DashboardLayout>
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                }
              />
              <Route
                path="/classrooms"
                element={
                  session ? (
                    <DashboardLayout>
                      <Classrooms />
                    </DashboardLayout>
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                }
              />
              <Route
                path="/clubs"
                element={
                  session ? (
                    <DashboardLayout>
                      <Clubs />
                    </DashboardLayout>
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                }
              />
              <Route
                path="/analytics"
                element={
                  session ? (
                    <DashboardLayout>
                      <Analytics />
                    </DashboardLayout>
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                }
              />
              <Route
                path="/profile"
                element={
                  session ? (
                    <DashboardLayout>
                      <Profile />
                    </DashboardLayout>
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
