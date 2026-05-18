import { Outlet, Link, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Briefcase, Menu, X, User, LogOut, Sun, Moon } from "lucide-react";
import { AuthProvider, useAuth } from "./AuthContext";
import { SplashScreen } from "./SplashScreen";

function Navigation() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains("dark");
  });

  const toggleDarkMode = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    }
  }, []);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 dark:bg-slate-900 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 group"
          >
            <div className="bg-blue-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg dark:text-white">MicroIntern</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/marketplace"
              className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
            >
              Browse Tasks
            </Link>
            {user?.role === "student" && (
              <Link
                to="/student"
                className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
              >
                My Dashboard
              </Link>
            )}
            {user?.role === "company" && (
              <Link
                to="/company"
                className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
              >
                Company Dashboard
              </Link>
            )}
            
            {location.pathname.startsWith("/system-admin") && (
              <Link
                to="/system-admin-portal"
                className="text-blue-600 font-bold border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
              >
                System Control
              </Link>
            )}
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all hover:scale-105 active:scale-95 flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400 animate-spin-slow" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>

            {!user ? (
              <>
                <Button variant="outline" size="sm" asChild className="dark:border-slate-700 dark:text-white dark:hover:bg-slate-800">
                  <Link to="/signin">Sign In</Link>
                </Button>
                <Button size="sm" asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Link to="/signup">Get Started</Link>
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <User className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={logout} className="dark:text-slate-300 dark:hover:bg-slate-800">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>
            <button
              className="p-2 dark:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t dark:border-slate-800">
            <Link
              to="/marketplace"
              className="block text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Tasks
            </Link>
            <div className="flex flex-col gap-2 pt-2">
              {!user ? (
                <>
                  <Button variant="outline" size="sm" className="flex-1 dark:border-slate-700 dark:text-white" asChild>
                    <Link to="/signin" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                  </Button>
                  <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" asChild>
                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" className="w-full justify-start dark:text-slate-300 dark:hover:bg-slate-800" onClick={() => { logout(); setMobileMenuOpen(false); }}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout ({user.email})
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export function Root() {
  const [showSplash, setShowSplash] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Show splash whenever we navigate to the home page "/"
    if (location.pathname === "/") {
      setShowSplash(true);
    }
  }, [location.pathname]);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-slate-50">
        {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
        <Navigation />

        {/* Main Content */}
        <main className="flex-1">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-slate-900 text-slate-300 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-lg text-white">
                    MicroIntern
                  </span>
                </div>
                <p className="text-sm mb-4">
                  Connecting students with flexible micro-internship opportunities.
                  Fair, transparent, and secure task distribution.
                </p>
              </div>
            </div>
            <div className="border-t border-slate-800 mt-8 pt-8 text-sm text-center">
              <p>© 2026 MicroIntern. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}