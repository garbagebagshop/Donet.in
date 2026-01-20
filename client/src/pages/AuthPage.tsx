import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Loader2, Car, User } from "lucide-react";
import { motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  username: z.string().min(10, "Valid mobile number required"),
  password: z.string().min(6, "Minimum 6 characters"),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Name is required"),
  role: z.enum(["customer", "driver"]),
});

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useAuth();
  const [, setLocation] = useLocation();

  // Login Form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  // Register Form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", password: "", name: "", role: "customer" },
  });

  const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
    login.mutate(values, {
      onSuccess: () => setLocation("/"),
    });
  };

  const onRegisterSubmit = (values: z.infer<typeof registerSchema>) => {
    register.mutate(values, {
      onSuccess: () => {
        setIsLogin(true); // Switch to login after registration
      },
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 max-w-md mx-auto">
      <div className="w-full mb-8 text-center">
        <div className="w-16 h-16 bg-primary rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-xl shadow-primary/20">
          <span className="text-3xl font-display font-bold text-white">D</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-foreground">Donet.in</h1>
        <p className="text-muted-foreground mt-2">Professional drivers on demand</p>
      </div>

      <div className="w-full bg-white rounded-3xl p-6 shadow-xl border border-border/50">
        <div className="flex gap-2 p-1 bg-secondary rounded-xl mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              isLogin ? "bg-white text-primary shadow-sm" : "text-muted-foreground"
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              !isLogin ? "bg-white text-primary shadow-sm" : "text-muted-foreground"
            }`}
          >
            Sign Up
          </button>
        </div>

        {isLogin ? (
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <FormField
                control={loginForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input placeholder="9876543210" {...field} className="h-12 rounded-xl bg-secondary/30" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••" {...field} className="h-12 rounded-xl bg-secondary/30" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full h-12 rounded-xl text-base" disabled={login.isPending}>
                {login.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Log In
              </Button>
            </form>
          </Form>
        ) : (
          <Form {...registerForm}>
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
              <FormField
                control={registerForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} className="h-12 rounded-xl bg-secondary/30" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input placeholder="9876543210" {...field} className="h-12 rounded-xl bg-secondary/30" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••" {...field} className="h-12 rounded-xl bg-secondary/30" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={registerForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>I want to join as a...</FormLabel>
                    <div className="grid grid-cols-2 gap-3">
                      <div 
                        onClick={() => field.onChange("customer")}
                        className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-2 transition-all ${
                          field.value === "customer" 
                          ? "border-primary bg-primary/5 text-primary" 
                          : "border-border hover:border-primary/30"
                        }`}
                      >
                        <User className="w-6 h-6" />
                        <span className="text-sm font-semibold">Customer</span>
                      </div>
                      <div 
                        onClick={() => field.onChange("driver")}
                        className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-2 transition-all ${
                          field.value === "driver" 
                          ? "border-primary bg-primary/5 text-primary" 
                          : "border-border hover:border-primary/30"
                        }`}
                      >
                        <Car className="w-6 h-6" />
                        <span className="text-sm font-semibold">Driver</span>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full h-12 rounded-xl text-base" disabled={register.isPending}>
                {register.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>
          </Form>
        )}
      </div>
      
      {/* Admin Quick Link (Hidden-ish) */}
      <div 
        className="mt-8 text-xs text-muted-foreground opacity-50 hover:opacity-100 cursor-pointer"
        onClick={() => setLocation("/admin8886")}
      >
        Admin Portal
      </div>
    </div>
  );
}
