import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import {
  ArrowLeft, FileText, ExternalLink, CheckCircle, XCircle, PauseCircle,
  User, Mail, Clock
} from "lucide-react";
import { getInitials } from "@/utils/getInitials";

 const applicationsData = [
    {
      id: 1,
      applicant: "Layla Hassan",
      email: "layla.hassan@uni.edu",
      photo: "https://i.pravatar.cc/40?img=1",
      status: "Pending",
      applied: "2026-03-09",
    },
    {
      id: 2,
      applicant: "Sara Ahmed",
      email: "sara.ahmed@uni.edu",
      photo: "https://i.pravatar.cc/40?img=2",
      status: "Accepted",
      applied: "2026-03-05",
    },
    {
      id: 3,
      applicant: "Layan Khaled",
      email: "layan.khaled@uni.edu",
      photo: "https://i.pravatar.cc/40?img=3",
      status: "Interviewing",
      applied: "2026-03-11",
    },
    {
      id: 4,
      applicant: "Arwa Mostafa",
      email: "arwa.mostafa@uni.edu",
      photo: "https://i.pravatar.cc/40?img=4",
      status: "Rejected",
      applied: "2026-02-28",
    },
    {
      id: 5,
      applicant: "Omar Adel",
      email: "omar.adel@uni.edu",
      photo: "https://i.pravatar.cc/40?img=5",
      status: "Accepted",
      applied: "2026-03-02",
    },
    {
      id: 6,
      applicant: "Nour Ali",
      email: "nour.ali@uni.edu",
      photo: "https://i.pravatar.cc/40?img=6",
      status: "Pending",
      applied: "2026-03-12",
    },
    {
      id: 7,
      applicant: "Youssef Mahmoud",
      email: "youssef.mahmoud@uni.edu",
      photo: "https://i.pravatar.cc/40?img=7",
      status: "Interviewing",
      applied: "2026-03-08",
    },
    {
      id: 8,
      applicant: "Hana Samir",
      email: "hana.samir@uni.edu",
      photo: "https://i.pravatar.cc/40?img=8",
      status: "Pending",
      applied: "2026-03-06",
    },
    {
      id: 9,
      applicant: "Kareem Tarek",
      email: "kareem.tarek@uni.edu",
      photo: "https://i.pravatar.cc/40?img=9",
      status: "Rejected",
      applied: "2026-02-25",
    },
    {
      id: 10,
      applicant: "Salma Ibrahim",
      email: "salma.ibrahim@uni.edu",
      photo: "https://i.pravatar.cc/40?img=10",
      status: "Accepted",
      applied: "2026-03-03",
    },
    {
      id: 11,
      applicant: "Ali Hassan",
      email: "ali.hassan@uni.edu",
      photo: "https://i.pravatar.cc/40?img=11",
      status: "Pending",
      applied: "2026-03-10",
    },
    {
      id: 12,
      applicant: "Farah Nabil",
      email: "farah.nabil@uni.edu",
      photo: "https://i.pravatar.cc/40?img=12",
      status: "Interviewing",
      applied: "2026-03-07",
    },
    {
      id: 13,
      applicant: "Ahmed Samy",
      email: "ahmed.samy@uni.edu",
      photo: "https://i.pravatar.cc/40?img=13",
      status: "Accepted",
      applied: "2026-03-04",
    },
    {
      id: 14,
      applicant: "Mona Khaled",
      email: "mona.khaled@uni.edu",
      photo: "https://i.pravatar.cc/40?img=14",
      status: "Rejected",
      applied: "2026-02-22",
    },
    {
      id: 15,
      applicant: "Tarek Fathy",
      email: "tarek.fathy@uni.edu",
      photo: "https://i.pravatar.cc/40?img=15",
      status: "Pending",
      applied: "2026-03-13",
    },
    {
      id: 16,
      applicant: "Nadine Yasser",
      email: "nadine.yasser@uni.edu",
      photo: "https://i.pravatar.cc/40?img=16",
      status: "Interviewing",
      applied: "2026-03-01",
    },
    {
      id: 17,
      applicant: "Mohamed Ashraf",
      email: "mohamed.ashraf@uni.edu",
      photo: "https://i.pravatar.cc/40?img=17",
      status: "Accepted",
      applied: "2026-03-02",
    },
    {
      id: 18,
      applicant: "Aya Gamal",
      email: "aya.gamal@uni.edu",
      photo: "https://i.pravatar.cc/40?img=18",
      status: "Pending",
      applied: "2026-03-14",
    },
    {
      id: 19,
      applicant: "Yara Mostafa",
      email: "yara.mostafa@uni.edu",
      photo: "https://i.pravatar.cc/40?img=19",
      status: "Rejected",
      applied: "2026-02-20",
    },
    {
      id: 20,
      applicant: "Hassan Ali",
      email: "hassan.ali@uni.edu",
      photo: "https://i.pravatar.cc/40?img=20",
      status: "Accepted",
      applied: "2026-03-06",
    },
  ];

const statusConfig = {
  pending: { label: "Pending Review", class: "bg-warning/10 text-warning border-warning/20" },
  interviewing: { label: "Interviewing", class: "bg-info/10 text-info border-info/20" },
  accepted: { label: "Accepted", class: "bg-success/10 text-success border-success/20" },
  rejected: { label: "Rejected", class: "bg-destructive/10 text-destructive border-destructive/20" },
  hold: { label: "On Hold", class: "bg-muted text-muted-foreground" },
};

const ApplicationDetails = () => {
   
const { id } = useParams();

const app = applicationsData.find(
  (item) => item.id === Number(id)
);
  return (
    <div className="bg-amber-200" >{app.name}
      <div className="space-y-5">
        {/* Back + Decision bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Link to="/director/applications">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back to Applications
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={statusConfig[app.status] + " text-sm px-3 py-1"}>
              {statusConfig[app.status]}
            </Badge>
            <Button size="sm" className="bg-success hover:bg-success/90 text-success-foreground gap-1.5">
              <CheckCircle className="h-4 w-4" /> Accept
            </Button>
            <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10 gap-1.5">
              <XCircle className="h-4 w-4" /> Reject
            </Button>
          
            <Button size="sm" variant="outline" className="gap-1.5">
              <User className="h-4 w-4" /> Request Human Interview
            </Button>
          </div>
        </div>

        {/* Applicant profile card */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex flex-col md:flex-row gap-5">
              <Avatar className="h-20 w-20 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-display font-bold">
                  {getInitials(app.applicant)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <div>
                  <h2 className="text-xl font-display font-bold">{app.name}</h2>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {app.email}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Applied {new Date(app.appliedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{app.bio}</p>
                <div className="flex gap-2">
                  <a href={app.cvUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <FileText className="h-3.5 w-3.5" /> View CV
                    </Button>
                  </a>
                  <a href={app.linkedinUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <ExternalLink className="h-3.5 w-3.5" /> LinkedIn
                    </Button>
                  </a>
                </div>
              </div>
              <div className="flex gap-4 md:flex-col md:items-end shrink-0">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Cv Score</p>
                  <p className="text-3xl font-display font-bold text-primary">{app.cvScore}</p>
                </div>
               
              </div>
            </div>
          </CardContent>
        </Card>

    
       
      </div>
    </div>
  );
};

export default ApplicationDetails;
