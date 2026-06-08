import api from "../api";




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



export async function getQuizQuestions(category) {
  const res = await api.get(`/quiz/questions/${category}`);
  return res.data;
}

export async function submitQuizAnswers(category, answers) {
  const res = await api.post(`/quiz/recommendation`, {
    category, 
    answers,  
  });
  return res.data;
}