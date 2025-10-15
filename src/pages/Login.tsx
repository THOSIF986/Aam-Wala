import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { LogIn, Leaf } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "clerk">("admin");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    try {
      // Mock authentication
      if (username && password) {
        localStorage.setItem("user", JSON.stringify({ username, role }));
        toast({
          title: "Login Successful",
          description: `Welcome back, ${username}!`,
        });
        navigate("/");
      } else {
        throw new Error("Please fill in all fields");
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4 font-poppins">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
            <span className="text-3xl">🥭</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Aam Wala</h1>
          <p className="text-white/80">Business Management System</p>
        </div>

        <Card className="shadow-card border-white/20 backdrop-blur-sm bg-white/10">
          <CardHeader className="text-center">
            <CardTitle className="text-white flex items-center justify-center gap-2">
              <LogIn className="h-5 w-5" />
              Login to Continue
            </CardTitle>
            <CardDescription className="text-white/70">
              Enter your credentials to access the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-white">Role</Label>
                <Select value={role} onValueChange={(value: "admin" | "clerk") => setRole(value)}>
                  <SelectTrigger className="bg-white/20 border-white/30 text-white">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="clerk">Clerk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full bg-white text-primary hover:bg-white/90 font-semibold"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-white/70">
                Demo Credentials: admin/admin or clerk/clerk
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;