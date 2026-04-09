"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { login } from "@/features/auth/auth";
import { useNavigate } from "react-router-dom";

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
  async function onSubmit(data) {
    try {
      const result = await login(data);

      localStorage.setItem("token", result.accessToken);
      localStorage.setItem("user", JSON.stringify(result.user));

      toast.success("Login successful");

      const role = result.user.role;

      if (role === "DIRECTOR") {
        navigate("/director");
      } else if (role === "USER") {
        navigate("/home");
      } else if (role === "EXECUTIVE") {
        navigate("/executive");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  }

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Welcome to our website</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="form-rhf-demo-email"
                    aria-invalid={fieldState.invalid}
                    placeholder="enter your email"
                    autoComplete="off"
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
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-password">
                    Password
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-rhf-demo-password"
                    type="password"
                    aria-invalid={fieldState.invalid}
                    placeholder="enter your password"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button
            className={"bg-primary hover:bg-primary/90"}
            type="submit"
            form="form-rhf-demo"
          >
            Submit
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
