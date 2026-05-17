import { Link } from "react-router";
import { Button } from "./ui/button";
import { Home, Search } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="text-8xl font-bold text-blue-600 mb-2">404</div>
          <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
          <p className="text-slate-600 mb-8">
            Sorry, we couldn't find the page you're looking for. It might have
            been removed, renamed, or didn't exist in the first place.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link to="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/marketplace" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Browse Tasks
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
