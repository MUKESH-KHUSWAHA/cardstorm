import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export default function Landing() {
  const { login, register, isLoggingIn, isRegistering, loginError, registerError } = useAuth();
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ 
    email: "", 
    password: "", 
    firstName: "", 
    lastName: "" 
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(loginData);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    register(registerData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">CardStorm</h1>
          <p className="text-slate-300">Real-time multiplayer card game</p>
        </div>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-center">Welcome to CardStorm</CardTitle>
            <CardDescription className="text-slate-300 text-center">
              Join the ultimate UNO-inspired multiplayer experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-700">
                <TabsTrigger value="login" className="text-slate-300 data-[state=active]:text-white">
                  Login
                </TabsTrigger>
                <TabsTrigger value="register" className="text-slate-300 data-[state=active]:text-white">
                  Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-slate-300">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-slate-300">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      required
                    />
                  </div>
                  {loginError && (
                    <Alert className="bg-red-900/50 border-red-700">
                      <AlertDescription className="text-red-200">
                        {loginError.message}
                      </AlertDescription>
                    </Alert>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-firstName" className="text-slate-300">First Name</Label>
                      <Input
                        id="register-firstName"
                        type="text"
                        placeholder="First name"
                        value={registerData.firstName}
                        onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-lastName" className="text-slate-300">Last Name</Label>
                      <Input
                        id="register-lastName"
                        type="text"
                        placeholder="Last name"
                        value={registerData.lastName}
                        onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-slate-300">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="Enter your email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-slate-300">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Create a password (min 6 characters)"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      required
                      minLength={6}
                    />
                  </div>
                  {registerError && (
                    <Alert className="bg-red-900/50 border-red-700">
                      <AlertDescription className="text-red-200">
                        {registerError.message}
                      </AlertDescription>
                    </Alert>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    disabled={isRegistering}
                  >
                    {isRegistering ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-slate-400 text-sm">
            Experience fast-paced multiplayer card action with friends
          </p>
        </div>
      </div>
    </div>
  );
}