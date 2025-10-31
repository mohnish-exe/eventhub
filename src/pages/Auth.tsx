import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/oracle";
import { toast } from "sonner";
import { HeroGeometric } from "@/components/ui/shape-landing-hero";
import { SignInPage } from "@/components/ui/sign-in";
import { ThemeToggle } from "@/components/ThemeToggle";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Account created successfully!");
      navigate("/dashboard");
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome back!");
      navigate("/dashboard");
    }
  };

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
  };

  const handleGoogleSignIn = () => {
    toast.info("Google sign-in coming soon!");
  };

  const handleResetPassword = () => {
    toast.info("Password reset functionality coming soon!");
  };

  return (
    <div className="relative min-h-screen">
      {/* Theme Toggle - Fixed Position */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Hero Section */}
      <HeroGeometric 
        badge="EventHub Management"
        title1="Streamline Your"
        title2="College Events"
      />

      {/* Auth Section - Below Hero */}
      <div className="relative bg-[#030303] py-16">
        <div className="container mx-auto px-4 flex justify-center">
          <SignInPage
            title={
              <span className="font-light text-foreground tracking-tighter">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </span>
            }
            description={
              isSignUp 
                ? "Join EventHub and start managing your college events today" 
                : "Access your account and continue managing your events"
            }
            isSignUp={isSignUp}
            onSignIn={handleSignIn}
            onGoogleSignIn={handleGoogleSignIn}
            onResetPassword={handleResetPassword}
            onCreateAccount={handleSignUp}
            onToggleMode={handleToggleMode}
          />
        </div>
      </div>
    </div>
  );
};

export default Auth;
