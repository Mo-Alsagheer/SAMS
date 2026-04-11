import StatCard from "@/components/shared/StatCard";
import {
  Users,
  BookOpen,
  ClipboardList,
  Calendar,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import AddCommittee from "@/executive/components/AddCommittee";
const recentApplicants = [
  { name: "Ahmed Hassan", committee: "AI & ML", status: "pending", cv: true },
  {
    name: "Sara Mohamed",
    committee: "Web Dev",
    status: "interviewing",
    cv: true,
  },
  { name: "Omar Ali", committee: "Design", status: "accepted", cv: false },
  {
    name: "Nour Khaled",
    committee: "Mobile Dev",
    status: "rejected",
    cv: true,
  },
  {
    name: "Youssef Tarek",
    committee: "Cybersecurity",
    status: "pending",
    cv: true,
  },
];

const committees = [
  {
    name: "AI & Machine Learning",
    members: 24,
    capacity: 30,
    director: "Dr. Fatima",
  },
  {
    name: "Web Development",
    members: 18,
    capacity: 25,
    director: "Eng. Karim",
  },
  { name: "Cybersecurity", members: 15, capacity: 20, director: "Prof. Nadia" },
  {
    name: "Mobile Development",
    members: 12,
    capacity: 20,
    director: "Eng. Tamer",
  },
];

const statusColor = {
  pending: "bg-warning/10 text-warning border-warning/20",
  interviewing: "bg-info/10 text-info border-info/20",
  accepted: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

const Dashboard = () => (
  <div className="  space-y-6">
    <div className="grid gap-2 grid-cols-1 md:grid-cols-4">
      <StatCard
        title="Total Users"
        value="3,247"
        icon={Users}
        color="secondary"
        trend={{ value: 12, positive: true }}
      />
      <StatCard
        title="Active Committees"
        value={8}
        icon={BookOpen}
        color="secondary"
      />
      <StatCard
        title="Pending Applications"
        value={42}
        icon={ClipboardList}
        color="secondary"
        trend={{ value: 8, positive: true }}
      />
      <StatCard
        title="Upcoming Events"
        value={5}
        icon={Calendar}
        color="secondary"
      />
    </div>

    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="section-title">Recent Applicants</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary">
            View All
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentApplicants.map((a, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 border-b last:border-0"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-muted text-xs">
                    {a.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{a.name}</p>
                  <p className="text-xs text-muted-foreground">{a.committee}</p>
                </div>
              </div>
              <Badge variant="outline" className={statusColor[a.status]}>
                {a.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="section-title">Committee Capacity</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary">
            Manage
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {committees.map((c, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Director: {c.director}
                  </p>
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {c.members}/{c.capacity}
                </span>
              </div>
              <Progress
                value={(c.members / c.capacity) * 100}
                className="h-2"
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>

    <div className="grid gap-5 lg:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="section-title flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-success" /> Recruitment Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Applications</span>
              <span className="font-semibold">156</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Interviews Done</span>
              <span className="font-semibold">89</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Accepted</span>
              <span className="font-semibold text-success">67</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Rejection Rate</span>
              <span className="font-semibold text-destructive">23%</span>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="section-title flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-primary" /> Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <AddCommittee />
          <Button className="w-full justify-start" variant="outline" size="sm">
            Assign Director
          </Button>
          <Button className="w-full justify-start" variant="outline" size="sm">
            Schedule Event
          </Button>
          <Button className="w-full justify-start" variant="outline" size="sm">
            Review CVs
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="section-title flex items-center gap-2">
            <Calendar className="h-4 w-4 text-accent" /> Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { name: "Orientation Day", date: "Mar 10", type: "All" },
            { name: "AI Workshop", date: "Mar 12", type: "AI & ML" },
            { name: "Hackathon Kickoff", date: "Mar 15", type: "All" },
          ].map((e, i) => (
            <div
              key={i}
              className="flex justify-between items-center py-1.5 border-b last:border-0"
            >
              <div>
                <p className="text-sm font-medium">{e.name}</p>
                <p className="text-xs text-muted-foreground">{e.type}</p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {e.date}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  </div>
);

export default Dashboard;
