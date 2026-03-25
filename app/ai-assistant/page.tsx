'use client';

import { useChat } from 'ai/react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AuthGuard from '@/components/AuthGuard';
import { useEffect, useRef } from 'react';
import { useUser } from '@/hooks/useUser';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function AIAssistant() {
  const { user } = useUser();
  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    api: '/api/chat',
    body: {
      userProfile: user
        ? {
            name: user.name,
            age: user.age,
            weight: user.weight,
            diabetesType: user.diabetesType,
          }
        : null,
    },
    onError: (error) => {
      console.error('Chat error:', error);
      try {
        const errObj = JSON.parse(error.message);
        alert('Error: ' + (errObj.details || errObj.error || error.message));
      } catch (e) {
        alert('Failed to send message: ' + error.message);
      }
    },
    onFinish: (message) => {
      console.log('Chat finished:', message);
    },
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSuggestedQuestion = (question: string) => {
    if (isLoading) return;
    append({ role: 'user', content: question });
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const suggestedQuestions =
    user?.diabetesType === 'Type 1 Diabetes'
      ? [
          'How to manage insulin levels?',
          'What are good snacks for Type 1 diabetes?',
          'How does exercise affect my blood sugar?',
          'Plan a balanced meal for me',
        ]
      : user?.diabetesType === 'Type 2 Diabetes'
        ? [
            'Plan a 1500 calorie diabetic-friendly diet',
            'How to lower morning blood sugar?',
            'Suggest a low-carb snack',
            'Explain Type 2 diabetes simply',
          ]
        : user?.diabetesType === 'Gestational Diabetes'
          ? [
              'Pregnancy-safe meals for gestational diabetes',
              'How to manage blood sugar during pregnancy?',
              'Safe exercises for gestational diabetes',
              "Snack ideas that won't spike blood sugar",
            ]
          : [
              'Plan a healthy balanced diet',
              'Is it safe for me to eat bananas?',
              'Suggest a healthy low-sugar snack',
              'What are early signs of diabetes?',
            ];

  return (
    <AuthGuard>
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50">
        <header className="bg-white border-b px-6 py-4 flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Sparkles className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Diabeto AI Assistant</h1>
            <p className="text-sm text-gray-500">Ask me anything about your health & diet</p>
          </div>
        </header>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-10">
                <div className="bg-white p-6 rounded-xl shadow-sm inline-block mb-6">
                  <Bot className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-lg font-semibold mb-2">How can I help you today?</h2>
                  <p className="text-gray-500 max-w-sm">
                    I can help you plan meals, understand nutrition, and answer questions about
                    diabetes management.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl mx-auto">
                  {suggestedQuestions.map((q, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      className="justify-start h-auto py-3 px-4 text-left whitespace-normal"
                      onClick={() => handleSuggestedQuestion(q)}
                      disabled={isLoading}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <Avatar className="h-8 w-8 mt-1">
                  {m.role === 'user' ? (
                    <>
                      <AvatarImage src="/user-avatar.png" />
                      <AvatarFallback className="bg-blue-600 text-white">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </>
                  ) : (
                    <>
                      <AvatarFallback className="bg-green-600 text-white">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </>
                  )}
                </Avatar>
                <Card
                  className={`max-w-[80%] ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <CardContent className="p-3 text-sm leading-relaxed overflow-x-auto overflow-wrap-break-word break-words">
                    {m.role === 'user' ? (
                      m.content
                    ) : (
                      <div className="markdown-body text-sm space-y-2 [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>li]:mb-1 [&>h1]:text-lg [&>h1]:font-bold [&>h1]:mb-2 [&>h2]:text-base [&>h2]:font-bold [&>h2]:mb-2 [&>h3]:text-sm [&>h3]:font-bold [&>h3]:mb-1 [&>code]:bg-gray-100 [&>code]:px-1 [&>code]:rounded [&>pre]:bg-gray-100 [&>pre]:p-2 [&>pre]:rounded [&>pre>code]:bg-transparent [&>blockquote]:border-l-4 [&>blockquote]:border-gray-300 [&>blockquote]:pl-3 [&>blockquote]:italic [&>table]:w-full [&>table]:border-collapse [&>th]:border [&>th]:border-gray-300 [&>th]:p-2 [&>th]:bg-gray-50 [&>td]:border [&>td]:border-gray-300 [&>td]:p-2">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback className="bg-green-600 text-white">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white p-3 rounded-lg border border-gray-200 text-sm text-gray-400">
                  Diabeto is thinking...
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 bg-white border-t">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
