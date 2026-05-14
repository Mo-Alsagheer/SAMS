import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
  bgColor = "bg-white", 
  titleColor = "", 
  labelColor = "",
  submitClassName = "", 
  renderCustomField 
}) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
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
    if (field.type === "custom" && renderCustomField) {
      return renderCustomField(field, watch, setValue);
    }

    switch (field.type) {
      case "textarea":
        return <Textarea {...register(field.name)} placeholder={field.placeholder} />;
      case "select":
        return (
          <select {...register(field.name)} className="w-full border rounded p-2">
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      case "number":
        return <Input type="number" {...register(field.name, { valueAsNumber: true })} placeholder={field.placeholder} />;
      default:
        return <Input type={field.type || "text"} {...register(field.name)} placeholder={field.placeholder} />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-lg ${bgColor}`}>
        <DialogHeader>
          <DialogTitle className={titleColor}>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
          {fields.map((field) => (
            <div className="space-y-2" key={field.name}>
              <Label className={labelColor}>{field.label}</Label>

              {renderField(field)}

              {errors[field.name] && (
                <p className="text-red-500 text-sm">
                  {errors[field.name]?.message}
                </p>
              )}
            </div>
          ))}

          <DialogFooter>
            <Button variant="outline" onClick={onClose} type="button"  className={submitClassName}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className={submitClassName} 
            >
              {isSubmitting ? "Submitting..." : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}