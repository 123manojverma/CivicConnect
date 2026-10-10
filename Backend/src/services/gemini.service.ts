import { GoogleGenerativeAI } from '@google/generative-ai';
import { serverConfig } from '../config';

const genAI = new GoogleGenerativeAI(serverConfig.GEMINI_API_KEY);

export async function generateIssueDescriptionService(title: string, category: string, location: string): Promise<string> {
    if (!serverConfig.GEMINI_API_KEY) {
        return `Issue reported: ${title} in the ${category} category at ${location}. Please investigate and resolve at the earliest.`;
    }
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Generate a clear, concise civic issue description (2-3 sentences max) for:
Title: ${title}
Category: ${category}  
Location: ${location}
Make it formal and suitable for government/NGO review. No markdown.`;
    const result = await model.generateContent(prompt);
    return result.response.text();
}

export async function analyzIssueImageService(imageUrl: string): Promise<string> {
    if (!serverConfig.GEMINI_API_KEY) {
        return "Image analysis not available.";
    }
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Analyze this civic infrastructure image and describe the problem briefly in 1-2 sentences. Focus on severity and type of issue.`;
    const result = await model.generateContent([
        prompt,
        { inlineData: { mimeType: 'image/jpeg', data: imageUrl } }
    ]);
    return result.response.text();
}

export async function chatWithGeminiService(message: string, context?: string): Promise<string> {
    if (!serverConfig.GEMINI_API_KEY) {
        return "AI assistant is not configured. Please add GEMINI_API_KEY to environment variables.";
    }
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = context 
        ? `You are a CivicConnect assistant helping citizens with civic issues. Context: ${context}\n\nUser: ${message}\nAssistant:`
        : `You are a CivicConnect assistant helping citizens with civic issues. User: ${message}\nAssistant:`;
    const result = await model.generateContent(prompt);
    return result.response.text();
}
