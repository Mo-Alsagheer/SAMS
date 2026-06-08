import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QuizCard from "../components/QuizCard";
import { useQuiz } from "../../../hooks/useQuiz";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { toast } from "sonner";
import { Loader2, Layers, ShieldAlert, Palette } from "lucide-react"; 
import { getQuizQuestions, submitQuizAnswers } from "@/features/quiz/quiz"; 

function Quiz() {
  const { category } = useParams(); 
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    currentQuestion,
    selectedOption,
    selectAnswer,
    next,
    back,
    isFirst,
    isLast,
    progress,
    answers,
  } = useQuiz(questions);

  useEffect(() => {
    if (!category) return;

    const loadQuizQuestions = async () => {
      try {
        setLoading(true);
        const data = await getQuizQuestions(category);
        setQuestions(data.questions || data);
      } catch (error) {
        console.error("Error loading quiz questions:", error);
        toast.error("Failed to load quiz questions.");
      } finally {
        setLoading(false);
      }
    };

    loadQuizQuestions();
  }, [category]);

  async function handleNext() {
    const result = next();
    
    if (result || isLast) {
      const finalAnswers = result || answers; 
      
      try {
        setSubmitting(true);
        const formattedAnswers = questions.map((q, index) => {
        
          const rawAnswer = finalAnswers[index] !== undefined ? finalAnswers[index] : selectedOption;
          
          let extractedValue = "";

          if (rawAnswer && typeof rawAnswer === "object") {
            extractedValue = rawAnswer.id || rawAnswer.text || rawAnswer.value || "";
          } else {
            extractedValue = rawAnswer;
          }

          let finalAnswerId = "";

          if (typeof extractedValue === "number") {
            finalAnswerId = q.answers[extractedValue]?.id || String.fromCharCode(65 + extractedValue);
          } else if (typeof extractedValue === "string" && extractedValue.length > 1) {
            
            const foundIndex = q.answers.findIndex(a => a.text === extractedValue || a.id === extractedValue);
            finalAnswerId = foundIndex !== -1 ? String.fromCharCode(65 + foundIndex) : extractedValue;
          } else {
            finalAnswerId = extractedValue;
          }
   const cleanAnswerId = String(finalAnswerId).toUpperCase().trim();

          return {
            questionId: Number(index + 1), 
            answerId: cleanAnswerId || "A" 
          };
        });

        console.log("🚀 FINAL SANITIZED PAYLOAD:", category, formattedAnswers);

        
        const responseData = await submitQuizAnswers(category, formattedAnswers);
        
        console.log("✅ API Success Response:", responseData);
        toast.success("Quiz completed successfully!");
        
        
        navigate("/result", { state: { result: responseData } });

      } catch (error) {
        console.error(" Quiz submission failed:", error);
        const serverMessage = error.response?.data?.error?.message || error.response?.data?.message || error.message || "Failed to submit quiz.";
        toast.error(serverMessage);
      } finally {
        setSubmitting(false);
      }
    }
  }

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center pt-24 pb-12 px-4">
          <div className="text-center mb-8 space-y-2">
            <h1 className="text-3xl font-black text-blue-950">SAMS Evaluation Quiz</h1>
            <p className="text-slate-500 text-sm max-w-sm">
              Please select a category below to start the evaluation quiz and discover your recommended committee.
            </p>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-3 max-w-3xl w-full">
            <div onClick={() => navigate("/quiz/Technical")} className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all flex flex-col items-center text-center gap-3 group">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Layers size={28} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Technical</h3>
                <p className="text-slate-400 text-xs font-medium mt-1">Frontend, Backend, Mobile, GameDev, Data, ML</p>
              </div>
            </div>

            <div onClick={() => navigate("/quiz/Operation")} className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-purple-500 hover:shadow-md cursor-pointer transition-all flex flex-col items-center text-center gap-3 group">
              <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <ShieldAlert size={28} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Operation</h3>
                <p className="text-slate-400 text-xs font-medium mt-1">HR, PR, Logistics</p>
              </div>
            </div>

            <div onClick={() => navigate("/quiz/Media")} className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-pink-500 hover:shadow-md cursor-pointer transition-all flex flex-col items-center text-center gap-3 group">
              <div className="p-4 bg-pink-50 text-pink-600 rounded-2xl group-hover:bg-pink-600 group-hover:text-white transition-colors">
                <Palette size={28} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Media</h3>
                <p className="text-slate-400 text-xs font-medium mt-1">Graphic Design, Social Media, PV</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-blue-800 animate-spin" />
          <p className="text-slate-500 font-medium text-sm">Loading {category} Questions...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-grow flex items-center justify-center pt-20 pb-8 px-4">
        <div className="w-full max-w-lg bg-white shadow-[0_15px_40px_rgba(30,58,138,0.08)] rounded-2xl p-6 space-y-6 border border-slate-100">
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-blue-800 font-black text-2xl italic tracking-tighter">
                  {currentQuestion ? String(currentQuestion.id || currentQuestion._id).padStart(2, "0") : "01"}
                </span>
                <span className="text-slate-400 font-bold text-sm"> / {questions.length}</span>
              </div>
              <div className="text-slate-400 font-bold text-[15px] uppercase tracking-widest">{Math.round(progress)}%</div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-700 to-blue-900 h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          <div className="py-2">
            {currentQuestion && (
              <QuizCard {...currentQuestion} onSelect={selectAnswer} selectedOption={selectedOption} />
            )}
          </div>

          <div className="flex justify-between gap-4 pt-4 border-t border-slate-50">
            <button onClick={back} disabled={isFirst || submitting} className={`px-4 py-2 text-base font-bold transition-all ${isFirst || submitting ? "text-slate-300 cursor-not-allowed" : "text-slate-500 hover:text-blue-800"}`}>
              ← Prev
            </button>
            <button onClick={handleNext} disabled={!selectedOption || submitting} className={`px-6 py-3 rounded-xl text-white text-base font-bold transition-all shadow-md transform active:scale-95 flex items-center gap-2 ${selectedOption && !submitting ? "bg-blue-800 hover:bg-blue-900 shadow-blue-900/10" : "bg-slate-300 cursor-not-allowed shadow-none"}`}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : isLast ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Quiz;