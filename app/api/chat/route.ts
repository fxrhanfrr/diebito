import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenerativeAIStream, Message, StreamingTextResponse } from 'ai';

// Create an instance of the Google Generative AI SDK
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');

export const runtime = 'edge'; // Required for Cloudflare Pages

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            console.error('API Key is missing in process.env');
            throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not set');
        }

        const { messages } = await req.json();

        const start = messages.length > 0 ? messages[messages.length - 1].content.substring(0, 20) : 'empty';
        console.log(`Processing chat. Msg count: ${messages.length}. Last msg starts with: ${start}`);

        const geminiStream = await genAI
            .getGenerativeModel({ model: 'gemini-flash-latest' })
            .generateContentStream(buildGoogleGenAIPrompt(messages));

        const stream = GoogleGenerativeAIStream(geminiStream);

        return new StreamingTextResponse(stream);
    } catch (error: any) {
        console.error('Error in AI Chat Route:', error);
        return new Response(JSON.stringify({ error: 'Failed to process chat request', details: error.message || String(error) }), { status: 500 });
    }
}

function buildGoogleGenAIPrompt(messages: Message[]) {
    return {
        contents: messages
            .filter((message) => message.role === 'user' || message.role === 'assistant')
            .map((message) => ({
                role: message.role === 'user' ? 'user' : 'model',
                parts: [{ text: message.content }],
            })),
    };
}
