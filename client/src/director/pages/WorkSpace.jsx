import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Map,
  FileVideo,
  FileText,
  Upload,
  Calendar,
  Plus,
  Play,
  Download,
  Eye,
  Clock,
  CheckCircle,
  Presentation,
} from "lucide-react";

const roadmapData = [
  { week: 1, title: "Introduction & Setup", status: "completed" },
  { week: 2, title: "Data Structures & NumPy", status: "completed" },
  { week: 3, title: "Machine Learning Basics", status: "current" },
  { week: 4, title: "Neural Networks", status: "upcoming" },
];

const resources = [
  { id: 1, name: "Week 1 - Python Intro.pptx", type: "ppt" },
  { id: 2, name: "NumPy Tutorial.mp4", type: "video" },
  { id: 3, name: "ML Cheatsheet.pdf", type: "pdf" },
];

const sessions = [
  { id: 1, title: "ML Basics Workshop", date: "Mar 8", time: "4:00 PM" },
  { id: 2, title: "Regression Lab", date: "Mar 10", time: "2:00 PM" },
];

const typeIcons = {
  ppt: Presentation,
  video: FileVideo,
  pdf: FileText,
};

function WorkSpace() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Committee Workspace</h1>

      <Tabs defaultValue="roadmap">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="roadmap">
            <Map className="w-4 h-4 mr-1" />
            Roadmap
          </TabsTrigger>

          <TabsTrigger value="resources">
            <FileText className="w-4 h-4 mr-1" />
            Resources
          </TabsTrigger>

          <TabsTrigger value="sessions">
            <Calendar className="w-4 h-4 mr-1" />
            Sessions
          </TabsTrigger>
        </TabsList>

        {/* ROADMAP */}
        <TabsContent value="roadmap">
          <Card>
            <CardHeader>
              <CardTitle>Season Roadmap</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              {roadmapData.map((item) => (
                <div
                  key={item.week}
                  className="flex items-center justify-between border rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    {item.status === "completed" && (
                      <CheckCircle className="text-green-500 w-5 h-5" />
                    )}

                    <div>
                      <p className="font-medium">Week {item.week}</p>
                      <p className="text-sm text-gray-500">{item.title}</p>
                    </div>
                  </div>

                  <Badge>{item.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* RESOURCES */}
        <TabsContent value="resources">
          <Card>
            <CardHeader className="flex flex-row justify-between">
              <CardTitle>Resources</CardTitle>

              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Upload className="w-4 h-4 mr-1" />
                    Upload
                  </Button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Resource</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div>
                      <Label>File Name</Label>
                      <Input placeholder="File name" />
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Textarea />
                    </div>

                    <Button className="w-full">Upload</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>

            <CardContent className="space-y-3">
              {resources.map((r) => {
                const Icon = typeIcons[r.type] || FileText;

                return (
                  <div
                    key={r.id}
                    className="flex items-center justify-between border p-3 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />

                      <p className="text-sm font-medium">{r.name}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost">
                        <Eye className="w-4 h-4" />
                      </Button>

                      <Button size="icon" variant="ghost">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SESSIONS */}
        <TabsContent value="sessions">
          <Card>
            <CardHeader className="flex justify-between flex-row">
              <CardTitle>Sessions</CardTitle>

              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                New
              </Button>
            </CardHeader>

            <CardContent className="space-y-3">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="flex justify-between border p-3 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{s.title}</p>
                    <p className="text-sm text-gray-500">
                      {s.date} — {s.time}
                    </p>
                  </div>

                  <Badge>Session</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default WorkSpace;
