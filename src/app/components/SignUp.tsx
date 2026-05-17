import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building2,
  GraduationCap,
  User,
  Phone,
  Briefcase,
  Loader2,
  Calendar,
  Upload
} from "lucide-react";
import { useAuth } from "./AuthContext";

export function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState<"student" | "company">("student");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  // Student form state
  const [studentData, setStudentData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    phone: "",
    university: "",
    major: "",
    graduation_year: "",
    id_card_url: "",
  });

  const [isUploading, setIsUploading] = useState(false);

  const handleIdCardUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(import.meta.env.VITE_API_URL + "/upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        setStudentData({ ...studentData, id_card_url: result.url });
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
    }
  };

  // Company form state
  const [companyData, setCompanyData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    company_name: "",
    industry: "",
    company_size: "",
    contact_first_name: "",
    contact_last_name: "",
    phone: "",
    website: "",
  });

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const data = userType === "student" ? studentData : companyData;

    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (userType === "student") {
      const allowedDomains = ['.edu', '.in', '.ac.in'];
      const isAllowed = allowedDomains.some(domain => data.email.toLowerCase().endsWith(domain));
      if (!isAllowed) {
        setError("Invalid email domain. Students must use a valid university email (.edu, .in, .ac.in).");
        setIsLoading(false);
        return;
      }
    } else if (userType === "company") {
      const genericDomains = ['@gmail.com', '@yahoo.com', '@hotmail.com', '@outlook.com', '@aol.com'];
      const isGeneric = genericDomains.some(domain => data.email.toLowerCase().endsWith(domain));
      if (isGeneric) {
        setError("Invalid email domain. Companies must use an official corporate email.");
        setIsLoading(false);
        return;
      }
    }

    try {
      const response = await fetch(import.meta.env.VITE_API_URL + "/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, role: userType }),
      });

      const result = await response.json();

      if (response.ok) {
        // Automatically login after successful signup
        const loginResponse = await fetch(import.meta.env.VITE_API_URL + "/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.email, password: data.password }),
        });
        const loginData = await loginResponse.json();
        if (loginResponse.ok) {
          login(loginData);
          navigate(userType === "student" ? "/student" : "/company");
        } else {
          navigate("/signin");
        }
      } else {
        setError(result.error || result.message || "Registration failed");
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

      {/* Sign Up Form */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Your Account</h1>
          <p className="text-slate-600">
            Join thousands of students and companies on MicroIntern
          </p>
        </div>

        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Sign Up</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm text-center">
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

              {/* Student Sign Up */}
              <TabsContent value="student">
                <form onSubmit={handleSignUp} className="space-y-4 mt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="student-firstname">First Name</Label>
                      <Input
                        id="student-firstname"
                        type="text"
                        placeholder="John"
                        className="mt-2"
                        value={studentData.first_name}
                        onChange={(e) => setStudentData({ ...studentData, first_name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="student-lastname">Last Name</Label>
                      <Input
                        id="student-lastname"
                        type="text"
                        placeholder="Doe"
                        className="mt-2"
                        value={studentData.last_name}
                        onChange={(e) => setStudentData({ ...studentData, last_name: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="student-email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </Label>
                    <Input
                      id="student-email"
                      type="email"
                      placeholder="student@university.edu"
                      className="mt-2"
                      value={studentData.email}
                      onChange={(e) => setStudentData({ ...studentData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="student-phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="student-phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      className="mt-2"
                      value={studentData.phone}
                      onChange={(e) => setStudentData({ ...studentData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="student-university">University/College</Label>
                    <Input
                      id="student-university"
                      type="text"
                      placeholder="e.g., MIT, Stanford"
                      className="mt-2"
                      value={studentData.university}
                      onChange={(e) => setStudentData({ ...studentData, university: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="student-major">Major/Field of Study</Label>
                      <Input
                        id="student-major"
                        type="text"
                        placeholder="e.g., Computer Science"
                        className="mt-2"
                        value={studentData.major}
                        onChange={(e) => setStudentData({ ...studentData, major: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="student-grad" className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Graduation Year
                      </Label>
                      <Input
                        id="student-grad"
                        type="number"
                        placeholder="e.g., 2027"
                        className="mt-2"
                        value={studentData.graduation_year}
                        onChange={(e) => setStudentData({ ...studentData, graduation_year: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <Label className="flex items-center gap-2 text-blue-800 font-bold mb-2">
                      <Upload className="w-4 h-4" />
                      Verify Your Student Identity
                    </Label>
                    <p className="text-xs text-blue-600 mb-3">Upload your college ID card for verification.</p>
                    <div className="flex items-center gap-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleIdCardUpload}
                        required
                        className="bg-white"
                      />
                      {isUploading && <Loader2 className="w-5 h-5 animate-spin text-blue-600" />}
                    </div>
                    {studentData.id_card_url && (
                      <p className="mt-2 text-xs text-green-600 font-medium flex items-center gap-1">
                        ✓ ID Card Uploaded
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="student-password" className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Password
                    </Label>
                    <div className="relative mt-2">
                      <Input
                        id="student-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        className="pr-10"
                        value={studentData.password}
                        onChange={(e) => setStudentData({ ...studentData, password: e.target.value })}
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

                  <div>
                    <Label htmlFor="student-confirm-password">
                      Confirm Password
                    </Label>
                    <div className="relative mt-2">
                      <Input
                        id="student-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter your password"
                        className="pr-10"
                        value={studentData.confirmPassword}
                        onChange={(e) => setStudentData({ ...studentData, confirmPassword: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button className="w-full" size="lg" type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Student Account"
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Company Sign Up */}
              <TabsContent value="company">
                <form onSubmit={handleSignUp} className="space-y-4 mt-6">
                  <div>
                    <Label htmlFor="company-name" className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Company Name
                    </Label>
                    <Input
                      id="company-name"
                      type="text"
                      placeholder="Your Company Inc."
                      className="mt-2"
                      value={companyData.company_name}
                      onChange={(e) => setCompanyData({ ...companyData, company_name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="company-industry" className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Industry
                    </Label>
                    <Input
                      id="company-industry"
                      type="text"
                      placeholder="e.g., Technology, Marketing"
                      className="mt-2"
                      value={companyData.industry}
                      onChange={(e) => setCompanyData({ ...companyData, industry: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="company-size">Company Size</Label>
                    <select
                      id="company-size"
                      className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={companyData.company_size}
                      onChange={(e) => setCompanyData({ ...companyData, company_size: e.target.value })}
                      required
                    >
                      <option value="">Select company size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="500+">500+ employees</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contact-firstname" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Contact First Name
                      </Label>
                      <Input
                        id="contact-firstname"
                        type="text"
                        placeholder="Jane"
                        className="mt-2"
                        value={companyData.contact_first_name}
                        onChange={(e) => setCompanyData({ ...companyData, contact_first_name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-lastname">Contact Last Name</Label>
                      <Input
                        id="contact-lastname"
                        type="text"
                        placeholder="Smith"
                        className="mt-2"
                        value={companyData.contact_last_name}
                        onChange={(e) => setCompanyData({ ...companyData, contact_last_name: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="company-email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Company Email Address
                    </Label>
                    <Input
                      id="company-email"
                      type="email"
                      placeholder="you@company.com"
                      className="mt-2"
                      value={companyData.email}
                      onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="company-phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="company-phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      className="mt-2"
                      value={companyData.phone}
                      onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="company-website">Company Website</Label>
                    <Input
                      id="company-website"
                      type="url"
                      placeholder="https://www.yourcompany.com"
                      className="mt-2"
                      value={companyData.website}
                      onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="company-password" className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Password
                    </Label>
                    <div className="relative mt-2">
                      <Input
                        id="company-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        className="pr-10"
                        value={companyData.password}
                        onChange={(e) => setCompanyData({ ...companyData, password: e.target.value })}
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

                  <div>
                    <Label htmlFor="company-confirm-password">
                      Confirm Password
                    </Label>
                    <div className="relative mt-2">
                      <Input
                        id="company-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter your password"
                        className="pr-10"
                        value={companyData.confirmPassword}
                        onChange={(e) => setCompanyData({ ...companyData, confirmPassword: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button className="w-full" size="lg" type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Company Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-slate-500">
                  Already have an account?
                </span>
              </div>
            </div>

            <Button variant="outline" className="w-full" asChild>
              <Link to="/signin">Sign In</Link>
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-500 mt-6">
          By creating an account, you acknowledge that MicroIntern is a marketplace
          platform and agree to our 5% commission model on all transactions.
        </p>
      </div>
    </div>
  );
}

