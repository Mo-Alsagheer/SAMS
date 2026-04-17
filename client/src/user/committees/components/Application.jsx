import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { getCommittees } from "@/features/committee/committee";
import { submitApplication } from "@/features/application/application";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Briefcase,
  User,
  Mail,
  Phone,
  Linkedin,
  Link2,
  CheckCircle2,
} from "lucide-react";

// 1. الـ Schema لازم تطابق الحقول اللي بنجمعها
const formSchema = z.object({
  committeeName: z.string().min(1, "Please select a committee"),
  fullName: z.string().min(5, "Full name must be at least 5 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^01[0125]\d{8}$/, "Invalid Egyptian phone number"),
  linkedinLink: z.string().url("Please enter a valid LinkedIn URL"),
  cvLink: z.string().url("Please enter a valid CV link"),
  targetRole: z.enum(["MEMBER", "DIRECTOR", "EXECUTIVE"]),
});

const Application = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [committees, setCommittees] = useState([]);
  const [selectedCommitteeData, setSelectedCommitteeData] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      committeeName: "",
      fullName: "",
      email: "",
      phone: "",
      linkedinLink: "",
      cvLink: "",
      targetRole: "MEMBER",
    },
  });

  // تحميل اللجان وتحديد اللجنة المختارة من الـ URL
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getCommittees();
        setCommittees(data);

        if (id && data.length > 0) {
          const selected = data.find(
            (com) => String(com._id || com.id) === String(id),
          );
          if (selected) {
            form.setValue("committeeName", selected.name);
            setSelectedCommitteeData(selected);
          }
        }
      } catch (error) {
        console.error("Error loading committees:", error);
      }
    };
    loadData();
  }, [id, form]);

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      // 2. تحويل البيانات لشكل الـ API (Mapping)
      const apiData = {
        committeeId:
          selectedCommitteeData?._id || selectedCommitteeData?.id || id,
        name: values.fullName, // تحويل من fullName لـ name للسيرفر
        email: values.email,
        phone: values.phone,
        linkedinLink: values.linkedinLink,
        cvLink: values.cvLink,
        targetRole: values.targetRole,
      };

      console.log("Sending to API:", apiData);

      await submitApplication(apiData);
      setIsSubmitted(true);

      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error) {
      // إظهار تفاصيل الخطأ بدقة
      const errorMessage =
        error.response?.data?.message || "Something went wrong";
      alert(
        "❌ Error: " +
          (Array.isArray(errorMessage)
            ? errorMessage.join(", ")
            : errorMessage),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-grow flex justify-center items-center p-4 pt-24 pb-10">
        {isSubmitted ? (
          <Card className="w-full max-w-md border-none shadow-2xl rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 text-white overflow-hidden animate-in fade-in zoom-in duration-500">
            <CardContent className="pt-10 pb-8 px-6 text-center space-y-6">
              <div className="flex justify-center">
                <div className="bg-white/20 p-4 rounded-full">
                  <CheckCircle2
                    size={60}
                    className="text-blue-100 animate-bounce"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black italic">Success!</h2>
                <p className="text-blue-100 font-medium text-lg">
                  Your Application Submitted and will be reviewed soon.
                </p>
                <p className="text-blue-200/60 text-sm italic">
                  Redirecting to home...
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full max-w-md border-none shadow-2xl rounded-3xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 overflow-hidden">
            <CardHeader className="pt-6 pb-2 text-center">
              <CardTitle className="text-2xl font-black text-white">
                Apply to <span className="text-blue-300">IEEE</span>
              </CardTitle>
              <p className="text-sm text-blue-100/80 font-medium mt-1">
                Join our community today
              </p>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="committeeName"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-sm font-bold text-blue-50 ml-1">
                            Committee
                          </FormLabel>
                          <Select
                            onValueChange={(val) => {
                              field.onChange(val);
                              const selected = committees.find(
                                (c) => c.name === val,
                              );
                              setSelectedCommitteeData(selected);
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full h-10 bg-white border-none rounded-xl text-blue-900">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white border-blue-100 rounded-xl">
                              {committees.map((com) => (
                                <SelectItem
                                  key={String(com._id || com.id)}
                                  value={com.name}
                                >
                                  {com.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-300 text-[10px]" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="targetRole"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-sm font-bold text-blue-50 ml-1">
                            Target Role
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full h-10 bg-white border-none rounded-xl text-blue-900">
                                <SelectValue placeholder="Role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white border-blue-100 rounded-xl">
                              <SelectItem value="MEMBER">Member</SelectItem>
                              <SelectItem value="DIRECTOR">Director</SelectItem>
                              <SelectItem value="EXECUTIVE">
                                Executive
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-300 text-[10px]" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-sm font-semibold text-blue-50 ml-1">
                          Full Name
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500"
                              size={14}
                            />
                            <Input
                              placeholder="Enter your name"
                              {...field}
                              className="pl-9 h-10 bg-white border-none rounded-xl text-sm text-blue-900"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-300 text-[10px]" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-sm font-semibold text-blue-50 ml-1">
                            Email
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500"
                                size={14}
                              />
                              <Input
                                placeholder="mail@example.com"
                                {...field}
                                className="pl-9 h-10 bg-white border-none rounded-xl text-sm text-blue-900"
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-300 text-[10px]" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-sm font-semibold text-blue-50 ml-1">
                            Phone
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500"
                                size={14}
                              />
                              <Input
                                placeholder="01xxxxxxxxx"
                                {...field}
                                className="pl-9 h-10 bg-white border-none rounded-xl text-sm text-blue-900"
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-300 text-[10px]" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="linkedinLink"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-sm font-semibold text-blue-50 ml-1">
                          LinkedIn Profile
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Linkedin
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500"
                              size={14}
                            />
                            <Input
                              placeholder="https://linkedin.com/..."
                              {...field}
                              className="pl-9 h-10 bg-white border-none rounded-xl text-sm text-blue-900"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-300 text-[10px]" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cvLink"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-sm font-semibold text-blue-50 ml-1">
                          CV Link
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Link2
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500"
                              size={14}
                            />
                            <Input
                              placeholder="Drive or Dropbox link"
                              {...field}
                              className="pl-9 h-10 bg-white border-none rounded-xl text-sm text-blue-900"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-300 text-[10px]" />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 mt-4 text-sm font-bold bg-white text-blue-700 hover:bg-blue-50 rounded-xl shadow-xl transition-all"
                  >
                    {loading ? "Sending..." : "Submit Application"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Application;
