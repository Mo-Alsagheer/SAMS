"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import loginIcon from "../assets/loginIcon.svg";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { login } from "@/features/auth/auth";
import { useNavigate, Link } from "react-router-dom";
import {
  getCurrentUser,
  getHomeRouteForRole,
  isAuthenticated,
  setAuthSession,
} from "@/features/auth/session";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import logo from "@/assets/ieee__logo_white.png";

const formSchema = z.object({
  email: z.string().email("Enter a valid email").nonempty("Enter Your Email"),
  password: z.string().nonempty("Enter Your Password").min(3, "enter at least 3 characters"),
});

export default function Login() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });
  const navigate = useNavigate();

  React.useEffect(() => {
    const user = getCurrentUser();
    if (isAuthenticated() && user?.role) {
      navigate(getHomeRouteForRole(user.role), { replace: true });
    }
  }, [navigate]);

  async function onSubmit(data) {
    try {
      const result = await login(data);
      if (result && result.accessToken) {
        setAuthSession(result.accessToken);
        toast.success("Login successful");
        const targetRoute = getHomeRouteForRole(result.user.role);
        setTimeout(() => { navigate(targetRoute, { replace: true }); }, 100);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-50 pt-20">
      <Navbar />

       <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[2rem] overflow-hidden shadow-[0_0_50px_-12px_rgba(37,99,235,0.25)] border border-slate-100 min-h-[500px] relative">
          
          <div className="relative hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white">
            
            <div className="absolute top-6 left-6 flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg overflow-hidden flex items-center justify-center">
                <img
                  src={logo}
                  alt="IEEE Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="font-bold text-xl tracking-tight text-white uppercase">
                IEEE
              </span>
            </div>

            <div className="relative z-10 text-center space-y-4 pt-6">
              <h2 className="text-3xl font-black tracking-tighter leading-tight">
                Manage Your <br />
                <span className="text-cyan-300 italic uppercase">Committees Now.</span>
              </h2>
              <div className="w-full max-w-[220px] mx-auto">
                <img src={loginIcon} alt="Illustration" className="w-full h-auto" />
              </div>
              <p className="text-blue-100/80 font-medium text-xs max-w-[220px] mx-auto leading-relaxed">
                Unlock your leadership potential and streamline your committee's work.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center p-8 lg:p-12">
            <div className="w-full max-w-[360px] space-y-6">
              <div className="space-y-1">
                <h1 className="text-2xl font-black text-slate-900">Welcome to IEEE</h1>
                <p className="text-slate-500 font-medium text-sm">Please enter your credentials.</p>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FieldGroup className="space-y-4">
                  <Controller 
                    name="email" 
                    control={form.control} 
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel className="text-slate-700 font-bold text-xs tracking-wider">EMAIL</FieldLabel>
                        <Input { ...field } className="h-12 rounded-xl text-base" placeholder="name@gmail.com" />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )} 
                  />
                  
                  <Controller 
                    name="password" 
                    control={form.control} 
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel className="text-slate-700 font-bold text-xs tracking-wider">PASSWORD</FieldLabel>
                        <Input { ...field } type="password" className="h-12 rounded-xl text-base" placeholder="••••••••" />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )} 
                  />
                </FieldGroup>
                
                <Link 
                  to="/forgot-password" 
                  className="block text-right text-xs text-blue-600 hover:underline font-medium"
                >
                  Forgot password?
                </Link>

                <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-base transition-all active:scale-[0.98]" type="submit">
                  Enter Platform
                </Button>
              </form>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}