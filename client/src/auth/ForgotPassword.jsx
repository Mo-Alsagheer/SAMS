"use client";

import React, { useState } from "react";
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
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "@/features/auth/auth";

const formSchema = z.object({
  email: z.string().email("Enter a valid email").nonempty("Enter Your Email"),
});

export default function ForgotPassword() {
  const [isSent, setIsSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });
  const navigate = useNavigate();

  async function onSubmit(data) {
    try {
      const response = await forgotPassword(data.email);
      setSentEmail(data.email);
      setIsSent(true);
      toast.success(response?.message || "Reset email sent. Check your inbox.");
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to send reset email";
      toast.error(msg);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 lg:p-0">
      <div className="max-w-xl w-full bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-100 p-8">
        {isSent ? (
          <div className="text-center space-y-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-50 text-blue-600">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
              </svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">Check your email</h2>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                We sent a password reset link to <strong className="text-slate-700">{sentEmail}</strong>. Please check your inbox and click the link to reset your password.
              </p>
            </div>
            <Button
              onClick={() => navigate("/login")}
              className="w-full h-12 bg-blue-600 text-white rounded-xl"
            >
              Back to Login
            </Button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Forgot Password
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Enter your email and we'll send instructions to reset your password.
            </p>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FieldGroup className="space-y-4">
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="space-y-2">
                      <FieldLabel className="text-slate-700 font-bold text-sm uppercase tracking-wider">
                        Email
                      </FieldLabel>
                      <Input
                        {...field}
                        autoComplete="off"
                        className="h-12 rounded-xl border-slate-200 focus-visible:ring-blue-300 focus:border-blue-400 focus:ring-blue-300 transition-all outline-none"
                        placeholder="you@example.com"
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
                  Send Reset Email
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
