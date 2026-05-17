import { Outlet, Link, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Briefcase, Menu, X, User, LogOut } from "lucide-react";
import { AuthProvider, useAuth } from "./AuthContext";
import { SplashScreen } from "./SplashScreen";

function Navigation() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 group"
            onClick={() => {
              if (location.pathname === "/") {
                setShowSplash(true);
              }
            }}
          >
            <div className="bg-blue-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg">MicroIntern</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/marketplace"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Browse Tasks
            </Link>
            {user?.role === "student" && (
              <Link
                to="/student"
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                My Dashboard
              </Link>
            )}
            {user?.role === "company" && (
              <Link
                to="/company"
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                Company Dashboard
              </Link>
            )}
            
            {location.pathname.startsWith("/system-admin") && (
              <Link
                to="/system-admin-portal"
                className="text-blue-600 font-bold border-b-2 border-blue-600"
              >
                System Control
              </Link>
            )}
            
            {!user ? (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/signin">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/signup">Get Started</Link>
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <User className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t">
            <Link
              to="/marketplace"
              className="block text-slate-600 hover:text-slate-900 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Tasks
            </Link>
            <div className="flex flex-col gap-2 pt-2">
              {!user ? (
                <>
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link to="/signin" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                  </Button>
                  <Button size="sm" className="flex-1" asChild>
                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => { logout(); setMobileMenuOpen(false); }}>
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
                  Fair, transparent, and secure task distribution with 5% commission.
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