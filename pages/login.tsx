import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Building, Users, Shield } from "lucide-react";

export default function Login() {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const { login, isLoggingIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      await login(credentials);
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Building className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Invoice Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Investor Transaction Tracking System
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  required
                  disabled={isLoggingIn}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  required
                  disabled={isLoggingIn}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-950/30">
          <CardContent className="pt-6">
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-semibold mb-2 flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Demo Accounts:
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Shield className="mr-1 h-3 w-3" />
                    admin
                  </span>
                  <span className="font-mono bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">admin123</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>user_aghk</span>
                  <span className="font-mono bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">user123</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>user_viksa</span>
                  <span className="font-mono bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">user123</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>user_multi</span>
                  <span className="font-mono bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">user123</span>
                </div>
              </div>
              <p className="text-xs mt-3 text-blue-600 dark:text-blue-300">
                Admin has full access • Users have project-specific access
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}