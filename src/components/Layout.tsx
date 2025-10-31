import { ReactNode, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, Session } from "@/integrations/oracle";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Building2, LogOut, BarChart3, UserCog } from "lucide-react";
import EventHubFooter from "@/components/ui/eventhub-footer";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState("events");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const navItems = [
    { id: "events", label: "Events", icon: Calendar, path: "/" },
    { id: "classrooms", label: "Classrooms", icon: Building2, path: "/classrooms" },
    { id: "clubs", label: "Clubs", icon: Users, path: "/clubs" },
    { id: "analytics", label: "Analytics", icon: BarChart3, path: "/analytics" },
    { id: "profile", label: "Profile", icon: UserCog, path: "/profile" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Event Management</h1>
          </div>

          {session && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {session.user.email}
              </span>
              <Button onClick={handleSignOut} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          )}
        </div>

        {session && (
          <nav className="border-t">
            <div className="container mx-auto px-4">
              <div className="flex gap-1 overflow-x-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.id}
                      variant={activeTab === item.id ? "default" : "ghost"}
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => {
                        setActiveTab(item.id);
                        navigate(item.path);
                      }}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{item.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          </nav>
        )}
      </header>

      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
};

export default Layout;
