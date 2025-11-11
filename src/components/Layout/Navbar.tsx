import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  // get today's date in readable format
  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-hero shadow-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🥭</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white font-poppins">Aam Wala</h1>
                <p className="text-xs text-white/80">Business Management</p>
              </div>
            </Link>
          </div>

          {/* Center - Current Date */}
          <div className="hidden md:block">
            <div className="bg-white/10 px-4 py-2 rounded-lg">
              <p className="text-white text-sm font-medium">{today}</p>
            </div>
          </div>

          {/* Right - User Info and Logout */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-lg">
              <User className="h-4 w-4 text-white" />
              <div className="text-white">
                <p className="text-sm font-medium">{currentUser?.fullName || 'User'}</p>
                <p className="text-xs text-white/80 capitalize">{currentUser?.role || 'guest'}</p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLogout}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;