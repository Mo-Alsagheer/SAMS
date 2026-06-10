import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/features/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Bot, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight, 
  RefreshCw, 
  Sparkles, 
  Trophy, 
  TrendingUp, 
  Heart, 
  MessageSquare,
  Users,
  Compass
} from "lucide-react";

export default function PracticeInterview() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("setup"); // 'setup' | 'interview' | 'finished'
  const [selectedClub, setSelectedClub] = useState("hr");
  const [sessionId] = useState(() => `sess_${Math.random().toString(36).substr(2, 9)}`);
  
  // Voice & Speech States
  const [isRecording, setIsRecording] = useState(false);
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [currentQuestionText, setCurrentQuestionText] = useState("");
  
  // Quiz/Flow States
  const [isProcessing, setIsProcessing] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [results, setResults] = useState(null);
  
  // References
  const recognitionRef = useRef(null);
  const speechTimeoutRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recObj = new SpeechRecognition();
      recObj.continuous = true;
      recObj.interimResults = true;
      recObj.lang = "en-US";

      recObj.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript(finalTranscript || interimTranscript);
      };

      recObj.onerror = (e) => {
        console.error("Speech recognition error", e);
        if (e.error === "not-allowed") {
          toast.error("Microphone permission denied. Please allow microphone access.");
        }
      };

      recObj.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recObj;
    }
  }, []);

  // Text to Speech
  const speakText = (text, callback) => {
    if (muted) {
      if (callback) callback();
      return;
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      
      const voices = window.speechSynthesis.getVoices();
      const defaultVoice = voices.find(v => v.lang.startsWith("en-") && v.name.includes("Google")) || 
                           voices.find(v => v.lang.startsWith("en-")) || 
                           voices[0];
      if (defaultVoice) {
        utterance.voice = defaultVoice;
      }

      utterance.onstart = () => {
        setAgentSpeaking(true);
      };
      
      utterance.onend = () => {
        setAgentSpeaking(false);
        if (callback) callback();
      };

      utterance.onerror = (e) => {
        console.error("Speech synthesis error", e);
        setAgentSpeaking(false);
        if (callback) callback();
      };

      window.speechSynthesis.speak(utterance);
    } else {
      if (callback) callback();
    }
  };

  // Start the interview
  const handleStartInterview = async () => {
    setIsProcessing(true);
    setPhase("interview");
    setTranscript("");
    setCurrentQuestionText("Initializing agent...");
    setQuestionCount(1);

    try {
      const res = await api.post("/ai/interview/agent", {
        sid: sessionId,
        club: selectedClub,
        action: "start"
      });

      if (res.data && res.data.text) {
        setCurrentQuestionText(res.data.text);
        speakText(res.data.text, () => {
          startListening();
        });
      } else if (res.data && res.data.error) {
        toast.error(res.data.error);
        setPhase("setup");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to start the interview agent.");
      setPhase("setup");
    } finally {
      setIsProcessing(false);
    }
  };

  // Start listening to mic
  const startListening = () => {
    if (!recognitionRef.current) {
      toast.error("Web Speech API is not supported in this browser. Please use Chrome or Edge.");
      return;
    }
    try {
      window.speechSynthesis.cancel();
      setAgentSpeaking(false);
      setTranscript("");
      recognitionRef.current.start();
      setIsRecording(true);
      toast.info("Listening... Speak into your mic.");
    } catch (e) {
      console.error(e);
    }
  };

  // Stop listening to mic
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  // Submit spoken answer to agent
  const handleSubmitAnswer = async () => {
    if (!transcript.trim()) {
      toast.warning("Please say something before submitting.");
      return;
    }
    
    stopListening();
    setIsProcessing(true);

    try {
      const res = await api.post("/ai/interview/agent", {
        sid: sessionId,
        club: selectedClub,
        action: "chat",
        message: transcript
      });

      if (res.data) {
        setTranscript("");
        
        if (res.data.result) {
          // Interview is completed
          setCurrentQuestionText("Interview finished! Loading results...");
          speakText("Thank you, the interview is now finished. Let's look at your evaluation report.", () => {
            setResults(res.data.result);
            setPhase("finished");
          });
        } else if (res.data.text) {
          setQuestionCount(prev => prev + 1);
          setCurrentQuestionText(res.data.text);
          speakText(res.data.text, () => {
            startListening();
          });
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to send answer to agent.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Skip / trigger fallback voice synthesis loading
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
    return () => {
      window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-6xl mx-auto w-full">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
            <Bot className="h-8 w-8 text-primary animate-pulse" />
            AI Practice Interview Agent
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mt-1">
            Conduct a highly interactive, simulated voice-to-voice interview to prep for committee roles.
          </p>
        </div>
        
        {phase === "interview" && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setMuted(!muted)}
              className="rounded-full"
            >
              {muted ? <VolumeX className="h-4 w-4 text-destructive" /> : <Volume2 className="h-4 w-4 text-green-500" />}
            </Button>
            <Badge variant="outline" className="px-3 py-1 bg-card shadow-sm border-primary/20">
              Question {questionCount} of 5
            </Badge>
          </div>
        )}
      </div>

      {/* SETUP PHASE */}
      {phase === "setup" && (
        <Card className="border border-border/80 shadow-lg bg-card/60 backdrop-blur-md overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Bot className="w-96 h-96" />
          </div>
          <CardHeader className="space-y-2 relative z-10">
            <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              Configure Your Practice Interview Session
            </CardTitle>
            <CardDescription className="text-sm md:text-base">
              Choose the target committee domain to train. The agent will tailor its questions based on that specialization.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { id: "hr", name: "Human Resources", icon: Users, desc: "Recruitment, onboarding, team culture, conflict resolution." },
                { id: "pr", name: "Public Relations", icon: Compass, desc: "Branding, communications strategy, media, reputation management." },
                { id: "frontend", name: "Frontend Development", icon: Bot, desc: "React, UI/UX, web design, responsive interfaces." },
                { id: "backend", name: "Backend Development", icon: Bot, desc: "API structures, SQL databases, server design, systems." },
                { id: "graphic", name: "Graphic Design", icon: Sparkles, desc: "Visual storytelling, Adobe Suite, creative typography." },
                { id: "socialmedia", name: "Social Media", icon: Users, desc: "Content marketing, engagement analytics, digital visibility." },
              ].map((club) => {
                const Icon = club.icon;
                const isSelected = selectedClub === club.id;
                return (
                  <button
                    key={club.id}
                    onClick={() => setSelectedClub(club.id)}
                    className={`flex flex-col text-left p-4 rounded-xl border transition-all duration-300 relative overflow-hidden cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-md shadow-primary/5 ring-1 ring-primary"
                        : "border-border/60 bg-card hover:bg-accent/40 hover:border-border/80"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${isSelected ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground"}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-semibold text-sm md:text-base">{club.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{club.desc}</p>
                  </button>
                );
              })}
            </div>

            <div className="rounded-xl border bg-accent/30 p-4 space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2 text-foreground">
                <AlertCircle className="h-4 w-4 text-primary" />
                Mic & Sound Check
              </h4>
              <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
                <li>Make sure you are in a quiet room and your microphone is plugged in.</li>
                <li>The agent will speak each question out loud using Text-to-Speech (TTS).</li>
                <li>When the visualizer glows <strong>green</strong>, it is your turn to speak. Speak clearly into the microphone.</li>
                <li>You can review the transcribed text on the screen before sending.</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="z-10 relative border-t border-border/40 pt-6 flex justify-end">
            <Button size="lg" className="px-8 flex items-center gap-2 shadow-lg hover:shadow-primary/20" onClick={handleStartInterview}>
              <Play className="h-4 w-4 fill-current" />
              Start Voice Interview
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* INTERVIEW ACTIVE PHASE */}
      {phase === "interview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agent Visualizer & Prompt */}
          <Card className="lg:col-span-2 border border-border/80 shadow-xl bg-card/60 backdrop-blur-md flex flex-col min-h-[450px]">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Live Interview Session
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center items-center p-6 space-y-8">
              {/* Pulsing Visualizer Circle */}
              <div className="relative flex justify-center items-center w-48 h-48">
                {/* Speaking Wave rings */}
                {agentSpeaking && (
                  <>
                    <div className="absolute w-44 h-44 rounded-full bg-primary/20 animate-ping duration-1000" />
                    <div className="absolute w-36 h-36 rounded-full bg-primary/30 animate-pulse duration-700" />
                  </>
                )}
                {/* Recording Wave rings */}
                {isRecording && (
                  <>
                    <div className="absolute w-44 h-44 rounded-full bg-emerald-500/20 animate-ping duration-1000" />
                    <div className="absolute w-36 h-36 rounded-full bg-emerald-500/30 animate-pulse duration-700" />
                  </>
                )}
                {/* Agent Avatar Circle */}
                <div className={`z-10 w-28 h-28 rounded-full flex items-center justify-center border-2 shadow-lg transition-all duration-500 ${
                  agentSpeaking 
                    ? "border-primary bg-primary/10 shadow-primary/20" 
                    : isRecording 
                      ? "border-emerald-500 bg-emerald-500/10 shadow-emerald-500/20 scale-105" 
                      : "border-border bg-accent"
                }`}>
                  {agentSpeaking ? (
                    <Volume2 className="w-12 h-12 text-primary animate-bounce" />
                  ) : isRecording ? (
                    <Mic className="w-12 h-12 text-emerald-500 animate-pulse" />
                  ) : (
                    <Bot className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Agent's voice status label */}
              <div className="text-center">
                <p className={`font-semibold tracking-wider text-xs uppercase ${
                  agentSpeaking 
                    ? "text-primary animate-pulse" 
                    : isRecording 
                      ? "text-emerald-500 animate-pulse" 
                      : "text-muted-foreground"
                }`}>
                  {isProcessing 
                    ? "AI is evaluating..." 
                    : agentSpeaking 
                      ? "AI agent is speaking..." 
                      : isRecording 
                        ? "Listening... Speak now!" 
                        : "Ready to continue"}
                </p>
              </div>

              {/* Current Question / Subtitle */}
              <div className="w-full bg-accent/40 rounded-xl p-4 md:p-6 border border-border/40 text-center">
                {isProcessing && !currentQuestionText ? (
                  <div className="flex items-center justify-center gap-3 py-4">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-muted-foreground text-sm font-medium">Connecting with agent...</span>
                  </div>
                ) : (
                  <p className="text-sm md:text-base font-medium text-foreground leading-relaxed">
                    "{currentQuestionText}"
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* User Input & Transcript */}
          <Card className="border border-border/80 shadow-xl bg-card/60 backdrop-blur-md flex flex-col h-full">
            <CardHeader>
              <CardTitle className="text-md flex items-center gap-2">
                <Mic className="h-4 w-4 text-emerald-500" />
                Spoken Input / Transcript
              </CardTitle>
              <CardDescription>
                Review and submit your spoken answers here.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between space-y-4">
              <div className="flex-1 bg-accent/30 rounded-xl p-4 border border-border/40 overflow-y-auto max-h-[200px] lg:max-h-none min-h-[150px] relative">
                {transcript ? (
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{transcript}</p>
                ) : (
                  <span className="text-xs text-muted-foreground italic absolute inset-0 flex items-center justify-center">
                    {isRecording ? "Listening to mic..." : "Your speech transcription will appear here."}
                  </span>
                )}
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex gap-2">
                  {isRecording ? (
                    <Button 
                      variant="destructive" 
                      className="flex-1 flex items-center justify-center gap-2 py-6 rounded-xl"
                      onClick={stopListening}
                    >
                      <MicOff className="h-5 w-5" />
                      Stop Mic
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="flex-1 flex items-center justify-center gap-2 py-6 rounded-xl border-emerald-500 text-emerald-500 hover:bg-emerald-500/10"
                      disabled={agentSpeaking || isProcessing}
                      onClick={startListening}
                    >
                      <Mic className="h-5 w-5" />
                      Start Mic
                    </Button>
                  )}

                  <Button 
                    className="flex-1 flex items-center justify-center gap-2 py-6 rounded-xl shadow-md"
                    disabled={isProcessing || !transcript.trim()}
                    onClick={handleSubmitAnswer}
                  >
                    Send Answer
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex justify-between items-center text-[10px] text-muted-foreground px-1">
                  <span>Microphone: Auto-detected</span>
                  {agentSpeaking && <span>Wait for AI to finish speaking</span>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* FINISHED REPORT PHASE */}
      {phase === "finished" && results && (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* OVERALL SCORE & RADIAL GAUGE */}
            <Card className="border border-border/80 shadow-xl bg-card/60 backdrop-blur-md overflow-hidden relative flex flex-col justify-center items-center p-6 text-center">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Trophy className="w-48 h-48" />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Interview Verdict</CardTitle>
              </CardHeader>
              
              {/* Circular Gauge */}
              <div className="relative w-36 h-36 flex items-center justify-center my-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    className="text-muted/20"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className="text-primary transition-all duration-1000 ease-out"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - results.overall / 100)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-foreground">{results.overall}</span>
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Overall Score</span>
                </div>
              </div>

              <div className="mt-2 space-y-2 w-full">
                <div className="flex justify-center">
                  <Badge 
                    className={`text-xs px-4 py-1.5 uppercase font-bold rounded-full border shadow-sm ${
                      results.verdict === "accepted" 
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                        : results.verdict === "maybe"
                          ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                          : "bg-destructive/10 text-destructive border-destructive/20"
                    }`}
                  >
                    {results.verdict}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground px-4 py-2 bg-accent/40 rounded-lg">
                  Values represent core soft skills and technical proficiency alignment.
                </p>
              </div>
            </Card>

            {/* BREAKDOWN SCORING PROGRESS BARS */}
            <Card className="lg:col-span-2 border border-border/80 shadow-xl bg-card/60 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Detailed Metrics Breakdown
                </CardTitle>
                <CardDescription>
                  Scores out of 100 based on standard evaluation rubrics.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {[
                  { key: "motivation", label: "Motivation & Drive", color: "bg-primary" },
                  { key: "skills", label: "Technical Proficiency / Core Skills", color: "bg-purple-600" },
                  { key: "communication", label: "Communication Clarity", color: "bg-blue-600" },
                  { key: "teamwork", label: "Teamwork & Synergy", color: "bg-pink-600" },
                  { key: "fit", label: "Cultural Fit & Alignment", color: "bg-emerald-600" },
                ].map((scoreObj) => {
                  const scoreValue = results.scores?.[scoreObj.key] || 0;
                  return (
                    <div key={scoreObj.key} className="space-y-1">
                      <div className="flex justify-between text-xs md:text-sm font-semibold">
                        <span className="text-foreground">{scoreObj.label}</span>
                        <span className="text-muted-foreground">{scoreValue} / 100</span>
                      </div>
                      <div className="h-3 w-full bg-accent/60 rounded-full overflow-hidden border border-border/30">
                        <div 
                          className={`h-full ${scoreObj.color} rounded-full transition-all duration-1000`} 
                          style={{ width: `${scoreValue}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

          </div>

          {/* STRENGTHS, IMPROVEMENTS & SUMMARY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Strengths Card */}
            <Card className="border border-border/80 shadow-lg bg-card/60 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center gap-3 border-b border-border/40 pb-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <CardTitle className="text-md">Key Strengths</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-3">
                  {results.strengths?.map((strength, idx) => (
                    <li key={idx} className="flex gap-2 text-sm text-foreground items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Improvements Card */}
            <Card className="border border-border/80 shadow-lg bg-card/60 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center gap-3 border-b border-border/40 pb-3">
                <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
                  <Heart className="h-5 w-5" />
                </div>
                <CardTitle className="text-md">Areas of Improvement</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-3">
                  {results.improvements?.map((area, idx) => (
                    <li key={idx} className="flex gap-2 text-sm text-foreground items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 shrink-0" />
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

          </div>

          {/* SUMMARY STATEMENT */}
          <Card className="border border-border/80 shadow-lg bg-card/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center gap-3 border-b border-border/40 pb-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <MessageSquare className="h-5 w-5" />
              </div>
              <CardTitle className="text-md">AI Interview Evaluation Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 text-sm md:text-base leading-relaxed text-foreground italic">
              "{results.summary}"
            </CardContent>
            <CardFooter className="border-t border-border/40 pt-4 flex gap-4 justify-end">
              <Button variant="outline" onClick={() => setPhase("setup")} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Practice Again
              </Button>
              <Button onClick={() => navigate("/member")} className="shadow-lg">
                Back to Dashboard
              </Button>
            </CardFooter>
          </Card>

        </div>
      )}
    </div>
  );
}
