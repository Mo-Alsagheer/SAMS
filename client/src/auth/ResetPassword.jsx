"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useLocation, useNavigate } from "react-router-dom";
import { resetPassword } from "@/features/auth/auth";

const formSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm: z.string().min(6, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

export default function ResetPassword() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { password: "", confirm: "" },
  });
  const navigate = useNavigate();
  const location = useLocation();
  const email =
    location.state?.email || new URLSearchParams(location.search).get("email");

  async function onSubmit(data) {
    try {
      await resetPassword({ email, password: data.password });
      toast.success("Password reset successful. Please login.");
      navigate("/login", { replace: true });
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to reset password";
      toast.error(msg);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 lg:p-0">
      <div className="max-w-xl w-full bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-100 p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Reset Password
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Enter your new password for {email || "your account"}.
        </p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FieldGroup className="space-y-4">
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="space-y-2">
                  <FieldLabel className="text-slate-700 font-bold text-sm uppercase tracking-wider">
                    New Password
                  </FieldLabel>
                  <Input
                    {...field}
                    type="password"
                    className="h-12 rounded-xl"
                    placeholder="New password"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="confirm"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="space-y-2">
                  <FieldLabel className="text-slate-700 font-bold text-sm uppercase tracking-wider">
                    Confirm Password
                  </FieldLabel>
                  <Input
                    {...field}
                    type="password"
                    className="h-12 rounded-xl"
                    placeholder="Confirm password"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <div>
            <Button
              type="submit"
              className="w-full h-12 bg-blue-600 text-white rounded-xl"
            >
              Reset Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
