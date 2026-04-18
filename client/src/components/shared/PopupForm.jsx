import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function PopupForm({
  open,
  onClose,
  schema,
  defaultValues,
  fields,
  onSubmit,
  title,
  submitLabel = "Submit",
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const submitHandler = async (data) => {
    await onSubmit(data);
    onClose();
  };

  const renderField = (field) => {
    switch (field.type) {
      case "textarea":
        return <Textarea {...register(field.name)} />;

      case "select":
        return (
          <select
            {...register(field.name)}
            className="w-full border rounded p-2"
          >
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );

      case "number":
        return (
          <Input
            type="number"
            {...register(field.name, { valueAsNumber: true })}
          />
        );
      case "datetime-local":
        return(
        <Input type="datetime-local"
         {...register(field.name)}
          />
        );
      case "checkbox":
        return (
          <input
            type="checkbox"
            {...register(field.name)}
            className="h-4 w-4"
          />
        );
      case "readonly":
        return (
          <Input
            {...register(field.name)}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
          />
        );
      default:
        return <Input type="text" {...register(field.name)} />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
          {fields.map((field) => (
            <div className="space-y-2" key={field.name}>
              <Label>{field.label}</Label>

              {renderField(field)}

              {errors[field.name] && (
                <p className="text-red-500 text-sm">
                  {errors[field.name]?.message}
                </p>
              )}
            </div>
          ))}

          <DialogFooter>
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
