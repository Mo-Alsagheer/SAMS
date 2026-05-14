// Mock data for the SAMS LMS member experience.
// Replace with real API calls once the backend is ready.

export const committee = {
  id: "frontend-2026",
  name: "Frontend Engineering Committee",
  description:
    "A 12-week journey covering modern web development from React fundamentals to production-grade architecture.",
  director: "Sarah Mitchell",
  totalSessions: 8,
};

export const sessions = [
  {
    id: "s1",
    order: 1,
    title: "Foundations of Modern Web",
    description:
      "Introduction to the modern web stack: HTML semantics, CSS architecture, and the JavaScript runtime.",
    date: "2026-04-12T18:00:00Z",
    duration: "90 min",
    status: "completed",
    attended: true,
    resources: [
      {
        id: "r1",
        name: "Slides — Foundations.pdf",
        type: "pdf",
        url: "#",
        size: "2.4 MB",
      },
      { id: "r2", name: "Reading list", type: "link", url: "#" },
    ],
    tasks: [
      {
        id: "t1",
        sessionId: "s1",
        title: "Build a semantic landing page",
        description:
          "Use only semantic HTML and modern CSS to recreate the provided design.",
        dueDate: "2026-04-19T23:59:00Z",
        status: "graded",
        score: 5,
        maxScore: 5,
        submissionUrl: "#",
      },
    ],
    recordingUrl: "#",
  },
  {
    id: "s2",
    order: 2,
    title: "React Mental Model",
    description:
      "Components, props, state, and the rendering lifecycle. Hooks deep-dive.",
    date: "2026-04-19T18:00:00Z",
    duration: "90 min",
    status: "completed",
    attended: true,
    resources: [
      {
        id: "r3",
        name: "React mental model.pdf",
        type: "pdf",
        url: "#",
        size: "3.1 MB",
      },
    ],
    tasks: [
      {
        id: "t2",
        sessionId: "s2",
        title: "Reusable form components",
        description:
          "Build a small form library with controlled inputs and validation.",
        dueDate: "2026-04-26T23:59:00Z",
        status: "graded",
        score: 4,
        maxScore: 5,
        submissionUrl: "#",
      },
    ],
    recordingUrl: "#",
  },
  {
    id: "s3",
    order: 3,
    title: "State Management Patterns",
    description:
      "From useState to global stores. When to reach for context, query, or Zustand.",
    date: "2026-04-26T18:00:00Z",
    duration: "90 min",
    status: "completed",
    attended: false,
    resources: [
      {
        id: "r4",
        name: "State patterns notes.pdf",
        type: "pdf",
        url: "#",
        size: "1.8 MB",
      },
    ],
    tasks: [
      {
        id: "t3",
        sessionId: "s3",
        title: "Refactor the cart store",
        description:
          "Migrate the provided cart implementation to a global store pattern.",
        dueDate: "2026-05-03T23:59:00Z",
        status: "submitted",
        maxScore: 5,
        submissionUrl: "#",
      },
    ],
    recordingUrl: "#",
  },
  {
    id: "s4",
    order: 4,
    title: "Routing & Data Loading",
    description:
      "File-based routing, loaders, server functions, and SSR fundamentals.",
    date: "2026-05-12T18:00:00Z",
    duration: "90 min",
    status: "live",
    meetingActive: true,
    resources: [
      {
        id: "r5",
        name: "Pre-read.pdf",
        type: "pdf",
        url: "#",
        size: "1.2 MB",
      },
    ],
    tasks: [
      {
        id: "t4",
        sessionId: "s4",
        title: "Build a multi-route dashboard",
        description:
          "Implement nested routes with loaders and an authenticated boundary.",
        dueDate: "2026-05-19T23:59:00Z",
        status: "pending",
        maxScore: 5,
      },
    ],
  },
  {
    id: "s5",
    order: 5,
    title: "Design Systems in Practice",
    description:
      "Tokens, theming, accessible components, and shipping a design system.",
    date: "2026-05-19T18:00:00Z",
    duration: "90 min",
    status: "upcoming",
    resources: [],
    tasks: [],
  },
  {
    id: "s6",
    order: 6,
    title: "Performance & Profiling",
    description: "Web vitals, profiling React, and shipping fast UIs.",
    date: "2026-05-26T18:00:00Z",
    duration: "90 min",
    status: "upcoming",
    resources: [],
    tasks: [],
  },
  {
    id: "s7",
    order: 7,
    title: "Testing Strategies",
    description:
      "Unit, integration, and end-to-end. Confidence vs. coverage.",
    date: "2026-06-02T18:00:00Z",
    duration: "90 min",
    status: "locked",
    resources: [],
    tasks: [],
  },
  {
    id: "s8",
    order: 8,
    title: "Capstone Showcase",
    description:
      "Present your final project to the committee and panel.",
    date: "2026-06-09T18:00:00Z",
    duration: "120 min",
    status: "locked",
    resources: [],
    tasks: [],
  },
];

export function getSession(id) {
  return sessions.find((s) => s.id === id);
}

export function getScore() {
  const attendancePoints =
    sessions.filter((s) => s.attended).length * 5;

  const taskPoints = sessions
    .flatMap((s) => s.tasks)
    .reduce((sum, t) => sum + (t.score ?? 0), 0);

  const maxAttendance = sessions.length * 5;

  const maxTasks = sessions
    .flatMap((s) => s.tasks)
    .reduce((sum, t) => sum + t.maxScore, 0);

  return {
    total: attendancePoints + taskPoints,
    max: maxAttendance + maxTasks,
    attendance: attendancePoints,
    attendanceMax: maxAttendance,
    tasks: taskPoints,
    tasksMax: maxTasks,
    sessionsAttended: sessions.filter((s) => s.attended).length,
    totalSessions: sessions.length,
  };
}