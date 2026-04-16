import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
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
import { Briefcase, User, Mail, Phone, Linkedin, Link2 } from "lucide-react";

const formSchema = z.object({
  committeeName: z.string().min(1, "Please select a committee"),
  fullName: z.string().min(5, "Full name must be at least 5 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^01[0125]\d{8}$/, "Invalid Egyptian phone number"),
  linkedinLink: z.string().url("Please enter a valid LinkedIn URL"),
  cvLink: z.string().url("Please enter a valid CV link"),
});

const Application = () => {
  const { committeeId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [committees, setCommittees] = useState([]);

  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchCommittees = async () => {
      try {
        const response = await axios.get(`${API_URL}/committees`);
        setCommittees(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchCommittees();
  }, [API_URL]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      committeeName: committeeId || "",
      fullName: "",
      email: "",
      phone: "",
      linkedinLink: "",
      cvLink: "",
    },
  });

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/applications`, values);
      navigate("/success");
    } catch (error) {
      alert("❌ Error: " + (error.response?.data?.message || "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      <main className="flex-grow flex justify-center items-center p-4 pt-24 pb-10">
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
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                <FormField
                  control={form.control}
                  name="committeeName"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-sm font-bold text-blue-50 ml-1">Committee Name</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full h-10 bg-white border-none rounded-xl text-blue-900 shadow-sm transition-all">
                            <div className="flex items-center gap-2">
                              <Briefcase size={14} className="text-blue-500" />
                              <SelectValue placeholder="Select Committee" />
                            </div>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white border-blue-100 rounded-xl">
                          {committees.length > 0 ? (
                            committees.map((com) => (
                              <SelectItem key={com._id || com.id} value={com.name} className="cursor-pointer text-blue-900">
                                {com.name}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-xs text-slate-400 text-center text-blue-900">Loading committees...</div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-300 text-[10px]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-sm font-semibold text-blue-50 ml-1">Full Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" size={14} />
                          <Input placeholder="Enter your name" {...field} className="pl-9 h-10 bg-white border-none rounded-xl text-sm text-blue-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-white/50 transition-all" />
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
                        <FormLabel className="text-sm font-semibold text-blue-50 ml-1">Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" size={14} />
                            <Input placeholder="mail@example.com" {...field} className="pl-9 h-10 bg-white border-none rounded-xl text-sm text-blue-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-white/50 transition-all" />
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
                        <FormLabel className="text-sm font-semibold text-blue-50 ml-1">Phone</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" size={14} />
                            <Input placeholder="01xxxxxxxxx" {...field} className="pl-9 h-10 bg-white border-none rounded-xl text-sm text-blue-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-white/50 transition-all" />
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
                      <FormLabel className="text-sm font-semibold text-blue-50 ml-1">LinkedIn Profile</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" size={14} />
                          <Input placeholder="https://linkedin.com/in/..." {...field} className="pl-9 h-10 bg-white border-none rounded-xl text-sm text-blue-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-white/50 transition-all" />
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
                      <FormLabel className="text-sm font-semibold text-blue-50 ml-1">CV Link</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" size={14} />
                          <Input placeholder="Drive or Dropbox link" {...field} className="pl-9 h-10 bg-white border-none rounded-xl text-sm text-blue-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-white/50 transition-all" />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-300 text-[10px]" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 mt-4 text-sm font-bold bg-white text-blue-700 hover:bg-blue-50 rounded-xl shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.98]"
                >
                  {loading ? "Sending..." : "Submit Application"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Application;