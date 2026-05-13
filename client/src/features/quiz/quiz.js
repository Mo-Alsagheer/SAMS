import api from "../api";

// 1. تجيب أسئلة الكويز بناءً على الـ Committee ID
export async function getCommitteeQuiz(committeeId) {
  const res = await api.get(`/committees/${committeeId}/quiz`);
  return res.data;
}

// 2. تسلم إجابات الكويز عشان تتحسب وتتصحح
export async function submitQuizAnswers(committeeId, answers) {
  const res = await api.post(`/committees/${committeeId}/quiz/result`, {
    answers, // بتبعتي الـ Object اللي فيه الإجابات اللي اليوزر اختارها
  });
  return res.data;
}

/** * جزء الـ AI (لو هتحتاجيه في الـ Frontend) 
 * بناءً على الـ Endpoints اللي في الصورة
 **/

// توليد كويز جديد باستخدام الـ AI
export async function generateAIQuiz(data) {
  const res = await api.post(`/ai/quiz/generate`, data);
  return res.data;
}

// تقييم أبليكيشن معين باستخدام الـ AI
export async function evaluateApplicationWithAI(applicationId) {
  const res = await api.post(`/ai/applications/evaluate`, {
    id: applicationId,
  });
  return res.data;
}

// التفاعل مع الـ AI Interview Agent
export async function interactWithAIAgent(message) {
  const res = await api.post(`/ai/interview/agent`, {
    message,
  });
  return res.data;
}
