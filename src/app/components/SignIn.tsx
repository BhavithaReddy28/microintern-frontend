import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Mail, Lock, Eye, EyeOff, Building2, GraduationCap, Loader2 } from "lucide-react";
import { useAuth } from "./AuthContext";

export function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<"student" | "company">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Trim email to avoid whitespace issues
    const trimmedEmail = email.trim();
    const emailDomain = trimmedEmail.split("@")[1]?.toLowerCase() ?? "";
    if (emailDomain.startsWith("gmail.")) {
      setError("Gmail accounts are not allowed. Please use your institutional or company email.");
      setIsLoading(false);
      return;
    }
    if (userType === "student") {
      const allowedStudentDomains = [/\.edu$/i, /\.in$/i, /\.ac\.in$/i];
      const isAllowed = allowedStudentDomains.some((regex) => regex.test(emailDomain));
      if (!isAllowed) {
        setError("Student accounts must use .edu, .in, or .ac.in email addresses.");
        setIsLoading(false);
        return;
      }
    }

    try {
      const response = await fetch(import.meta.env.VITE_API_URL + "/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});

      const data = await response.json();

      if (response.ok) {
        if (data.role !== userType) {
          setError(`This account is registered as a ${data.role}. Please switch tabs.`);
          return;
        }
        login(data);
        if (data.role === "student") navigate("/student");
        else navigate("/company");
      } else {
        setError(data.message || "Invalid email or password");
      }
    } catch (err) {
      setError("Failed to connect to the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            MicroIntern
          </Link>
        </div>
      </div>

      {/* Sign In Form */}
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-slate-600">
            Sign in to continue to your dashboard
          </p>
        </div>

        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}
            <Tabs
              value={userType}
              onValueChange={(value) =>
                setUserType(value as "student" | "company")
              }
              className="mb-6"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="student" className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Student
                </TabsTrigger>
                <TabsTrigger value="company" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Company
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSignIn} className="space-y-4 mt-6">
                <div>
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="mt-2"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Password
                  </Label>
                  <div className="relative mt-2">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded" />
                    <span className="text-slate-600">Remember me</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Button className="w-full" size="lg" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    `Sign In as ${userType.charAt(0).toUpperCase() + userType.slice(1)}`
                  )}
                </Button>
              </form>
            </Tabs>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-slate-500">
                  Don't have an account?
                </span>
              </div>
            </div>

            <Button variant="outline" className="w-full" asChild>
              <Link to="/signup">Create New Account</Link>
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-500 mt-6">
          By signing in, you agree to our{" "}
          <Link to="/terms" className="text-blue-600 hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="text-blue-600 hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}

