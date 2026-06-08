"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import loginIcon from "../assets/loginIcon.svg";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { login } from "@/features/auth/auth";
import { useNavigate, Link } from "react-router-dom";
import {
  getCurrentUser,
  getHomeRouteForRole,
  isAuthenticated,
  setAuthSession,
} from "@/features/auth/session";

const formSchema = z.object({
  email: z.string().email("Enter a valid email").nonempty("Enter Your Email"),
  password: z
    .string()
    .nonempty("Enter Your Password")
    .min(3, "enter at least 3 characters"),
});

export default function Login() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const navigate = useNavigate();

  React.useEffect(() => {
    const user = getCurrentUser();

    if (isAuthenticated() && user?.role) {
      navigate(getHomeRouteForRole(user.role), {
        replace: true,
      });
    }
  }, [navigate]);

  async function onSubmit(data) {
    try {
      const result = await login(data);
      if (result && result.accessToken) {
        setAuthSession(result.accessToken);
        toast.success("Login successful");
        const targetRoute = getHomeRouteForRole(result.user.role);
        setTimeout(() => {
          navigate(targetRoute, { replace: true });
        }, 100);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 lg:p-0">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[2.5rem] overflow-hidden shadow-[0_0_60px_-10px_rgba(37,99,235,0.4)] border border-slate-100">
        <div className="relative hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 p-12 text-white">
          <div className="absolute top-10 left-10 flex items-center gap-2">
            <span className="font-bold text-xl tracking-tight text-white uppercase">
              IEEE
            </span>
          </div>

          <div className="relative z-10 text-center space-y-8">
            <h2 className="text-4xl font-black tracking-tighter leading-tight">
              Manage Your <br />
              <span className="text-cyan-300 italic uppercase">
                Committees Now.
              </span>
            </h2>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <img
                src={loginIcon}
                alt="Student Activity Illustration"
                className="relative rounded-2xl w-full max-w-sm mx-auto transform transition duration-500 hover:scale-105 shadow-xl shadow-blue-900/30"
              />
            </div>

            <p className="text-blue-100/80 font-medium max-w-xs mx-auto">
              Unlock your leadership potential and streamline your committee's
              work.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center p-8 lg:p-16">
          <div className="w-full max-w-md space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                Welcome to IEEE
              </h1>
              <p className="text-slate-500 font-medium text-sm">
                Please enter your credentials to access the platform.
              </p>
            </div>

            <form
              id="form-rhf-demo"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <FieldGroup className="space-y-4">
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="space-y-2"
                    >
                      <FieldLabel className="text-slate-700 font-bold text-sm uppercase tracking-wider">
                        Email
                      </FieldLabel>
                      <Input
                        {...field}
                        autoComplete="off"
                        className="h-12 rounded-xl border-slate-200 focus-visible:ring-blue-300 focus:border-blue-400 focus:ring-blue-300 transition-all outline-none"
                        placeholder="Yourname@gmail.com"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="space-y-2"
                    >
                      <FieldLabel className="text-slate-700 font-bold text-sm uppercase tracking-wider">
                        Password
                      </FieldLabel>
                      <Input
                        {...field}
                        type="password"
                        className="h-12 rounded-xl border-slate-200 focus-visible:ring-blue-300 focus:border-blue-400 focus:ring-blue-300 transition-all outline-none"
                        placeholder="••••••••"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>

              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="space-y-4 pt-2">
                <Button
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
                  type="submit"
                >
                  Enter Platform
                </Button>

                <div className="text-center">
                  <p className="text-xs text-slate-500">
                    Need help? Contact your director or admin.
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
