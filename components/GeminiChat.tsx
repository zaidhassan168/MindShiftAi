'use client';

import React, { useEffect, useRef } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import { Send, Paperclip, Mic, Image } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Markdown from 'react-markdown';
import { useChat } from 'ai/react';

export default function GeminiChat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/geminiChat'
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any); // 'as any' is used here to bypass the typing issue
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto h-screen flex flex-col dark:bg-gray-900 rounded-lg shadow-md">
      <div className="dark:bg-gray-800 p-4 flex items-center justify-between rounded-t-lg">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Chat Assistant</h1>
        <Button variant="outline" size="sm" onClick={() => { localStorage.removeItem('messages'); location.reload(); }}>
          Clear Chat
        </Button>
      </div>
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar rounded-b-lg">
        {messages.map((message, index) => (
          <div key={index} className={`flex items-start gap-4 ${message.role === "user" ? "justify-end" : ""}`}>
            <Avatar className={`w-8 h-8 ${message.role === "user" ? "order-2" : ""}`}>
              <AvatarImage src={message.role === "user" ? "/placeholder-user.jpg" : "/placeholder-assistant.jpg"} alt={message.role} />
              <AvatarFallback>{message.role.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className={`rounded-lg p-3 text-sm max-w-[70%] ${message.role === "user" ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100" : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"}`}>
            <Markdown
                components={{
                  code(props) {
                    const { children, className, node } = props
                    const match = /language-(\w+)/.exec(className || '')
                    return match ? (
                      <SyntaxHighlighter
                        PreTag="div"
                        language={match[1]}
                        style={oneDark}
                        className="rounded-md text-sm"
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={`${className} bg-gray-200 dark:bg-gray-700 rounded px-1 py-0.5`} {...props}>
                        {children}
                      </code>
                    )
                  }
                }}
              >
                {message.content}
              </Markdown>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Paperclip className="h-5 w-5 text-gray-500" />
          </Button>
          <Button variant="ghost" size="icon">
            <Image className="h-5 w-5 text-gray-500" />
          </Button>
          <Input
            type="text"
            placeholder="Type your message..."
            className="flex-1 text-sm rounded-lg"
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <Button variant="ghost" size="icon">
            <Mic className="h-5 w-5 text-gray-500" />
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="bg-green-500 hover:bg-green-600 text-white rounded-lg">
            {isLoading ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}