import { useNavigate } from "react-router-dom";
import { useProject } from "../contexts/ProjectContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useState } from "react";
import { toast } from "../hooks/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";

const Logo = () => (
  <div className="flex justify-center mb-2">
    <div className="bg-primary/10 dark:bg-primary/20 rounded-full p-3 inline-flex">
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="20"
          cy="20"
          r="20"
          fill="currentColor"
          className="text-primary"
        />
        <text
          x="50%"
          y="55%"
          textAnchor="middle"
          fill="#fff"
          fontSize="18"
          fontWeight="bold"
          dy=".3em"
        >
          P
        </text>
      </svg>
    </div>
  </div>
);

// Words related to project management platform
const bgWords = [
  "Project",
  "Task",
  "Team",
  "Deadline",
  "Sprint",
  "Kanban",
  "Agile",
  "Plan",
  "Goal",
  "Progress",
  "Collaboration",
  "Milestone",
  "Dashboard",
  "Timeline",
  "Update",
  "Feedback",
  "Release",
  "Backlog",
  "Priority",
  "Design",
  "Code",
  "Test",
  "Deploy",
  "Review",
  "Bug",
  "Feature",
  "Client",
  "Scope",
  "Estimate",
  "Schedule",
  "Resource",
  "Risk",
  "Status",
  "Report",
  "Strategy",
  "Vision",
  "Support",
  "Quality",
  "Iteration",
  "Scrum",
  "Burndown",
  "Velocity",
  "Epic",
  "User Story",
  "Dependency",
  "Issue",
  "Acceptance",
  "Release",
  "Workflow",
];

const Index = () => {
  const navigate = useNavigate();
  const { currentUser, isLoading, login, signup } = useProject();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  if (currentUser) {
    navigate("/dashboard");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login({
        email: loginEmail,
        password: loginPassword,
      });
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description:
          error instanceof Error
            ? error.message
            : "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signup({
        name: signupName,
        email: signupEmail,
        password: signupPassword,
      });
      toast({
        title: "Signup successful",
        description: "Welcome to Projexia!",
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Signup failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const cols = 25; // horizontal words count
  const rows = 40; // vertical rows count

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background to-muted dark:from-background dark:to-[#18181b] overflow-hidden">
      {/* Background words full page */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 w-full h-full"
        style={{ zIndex: 0 }}
      >
        {[...Array(rows)].map((_, rowIdx) => {
          const isOffset = rowIdx % 2 === 1;
          return (
            <div
              key={rowIdx}
              style={{
                display: "flex",
                justifyContent: "space-around",
                marginBottom: "60px", // vertical space between lines
              }}
            >
              {[...Array(cols)].map((_, colIdx) => {
                const wordIndex = rowIdx * cols + colIdx;
                const word = bgWords[wordIndex % bgWords.length];
                return (
                  <span
                    key={colIdx}
                    style={{
                      transform: "rotate(-45deg)",
                      opacity: 0.15,
                      userSelect: "none",
                      color: "#9ca3af",
                      fontWeight: "700",
                      fontSize: "1.4rem",
                      whiteSpace: "nowrap",
                      marginTop: isOffset ? "20px" : "0",
                      textAlign: "center",
                      marginRight: "8px", // reduce horizontal spacing
                    }}
                  >
                    {word}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Login / Signup card */}
      <div className="relative w-full max-w-sm p-0 z-10">
        <div className="rounded-2xl shadow-xl bg-white/90 dark:bg-zinc-900/90 border border-border px-5 py-7 sm:px-7 sm:py-8 space-y-7">
          <Logo />
          <div className="text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-primary">
              Projexia
            </h1>
            <p className="mt-1 text-base text-muted-foreground">
              Your projects, perfectly organized.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                Welcome
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="flex items-center justify-center">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                Continue With
              </span>
            </div>
          </div>
          {/* Social login options */}
          <div className="flex flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200 font-semibold shadow-sm rounded-lg py-2"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_17_40)">
                  <path
                    d="M47.5 24.5C47.5 22.6 47.3 20.8 47 19H24V29.1H37.4C36.7 32.2 34.7 34.7 31.8 36.4V42.1H39.5C44 38.1 47.5 32.1 47.5 24.5Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M24 48C30.6 48 36.1 45.9 39.5 42.1L31.8 36.4C29.9 37.6 27.3 38.4 24 38.4C17.7 38.4 12.2 34.3 10.3 28.7H2.3V34.6C5.7 41.1 14.1 48 24 48Z"
                    fill="#34A853"
                  />
                  <path
                    d="M10.3 28.7C9.8 27.5 9.5 26.2 9.5 24.8C9.5 23.4 9.8 22.1 10.3 20.9V15H2.3C0.8 18.1 0 21.4 0 24.8C0 28.2 0.8 31.5 2.3 34.6L10.3 28.7Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M24 9.6C27.7 9.6 30.7 10.9 32.7 12.7L39.7 6.1C36.1 2.7 30.6 0 24 0C14.1 0 5.7 6.9 2.3 15L10.3 20.9C12.2 15.3 17.7 9.6 24 9.6Z"
                    fill="#EA4335"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_17_40">
                    <rect width="48" height="48" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200 font-semibold shadow-sm rounded-lg py-2"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-black dark:text-white"
              >
                <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.334-5.466-5.93 0-1.31.468-2.38 1.236-3.22-.124-.304-.535-1.527.117-3.176 0 0 1.008-.322 3.3 1.23.96-.267 1.98-.399 3-.404 1.02.005 2.04.137 3 .404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.649.242 2.872.12 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.803 5.624-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.694.825.576C20.565 21.796 24 17.298 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200 font-semibold shadow-sm rounded-lg py-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <g>
                  <rect x="1" y="1" width="10.5" height="10.5" fill="#F25022" />
                  <rect
                    x="12.5"
                    y="1"
                    width="10.5"
                    height="10.5"
                    fill="#7FBA00"
                  />
                  <rect
                    x="1"
                    y="12.5"
                    width="10.5"
                    height="10.5"
                    fill="#00A4EF"
                  />
                  <rect
                    x="12.5"
                    y="12.5"
                    width="10.5"
                    height="10.5"
                    fill="#FFB900"
                  />
                </g>
              </svg>
              Microsoft
            </Button>
          </div>
          <div className="flex items-center gap-2 my-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
              or
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "login" | "signup")}
          >
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted rounded-lg p-1">
              <TabsTrigger
                value="login"
                className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <Label htmlFor="login-email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    disabled={isSubmitting}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="login-password"
                    className="text-sm font-medium"
                  >
                    Password
                  </Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    disabled={isSubmitting}
                    className="mt-1"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full py-2 text-base font-semibold rounded-lg shadow-sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-5">
                <div>
                  <Label htmlFor="signup-name" className="text-sm font-medium">
                    Name
                  </Label>
                  <Input
                    id="signup-name"
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="Enter your name"
                    required
                    disabled={isSubmitting}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="signup-email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    disabled={isSubmitting}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="signup-password"
                    className="text-sm font-medium"
                  >
                    Password
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Create a password"
                    required
                    disabled={isSubmitting}
                    className="mt-1"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full py-2 text-base font-semibold rounded-lg shadow-sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating account..." : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          {/* <div className="text-center text-xs text-muted-foreground pt-2">
            <p>
              Demo account: <span className="font-mono">demo@example.com</span>{" "}
              / <span className="font-mono">demo123</span>
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Index;
