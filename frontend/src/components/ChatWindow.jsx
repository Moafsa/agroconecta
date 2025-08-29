import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Send, Loader2 } from 'lucide-react';
import { chatAPI } from '../lib/api';

const ChatWindow = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Olá! Sou o assistente do Agro-Conecta. Como posso ajudá-lo hoje? Conte-me sobre sua necessidade no agronegócio.',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await chatAPI.sendMessage(inputMessage);
      
      const botMessage = {
        id: Date.now() + 1,
        text: response.response || 'Desculpe, não consegui processar sua mensagem. Tente novamente.',
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Desculpe, ocorreu um erro. Nossa equipe foi notificada e entrará em contato em breve.',
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="chat-container">
      {/* Messages Area */}
      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message-bubble ${
              message.sender === 'user' ? 'message-user' : 'message-bot'
            }`}
          >
            <p className="text-sm mb-1">{message.text}</p>
            <span className="text-xs opacity-70">
              {formatTime(message.timestamp)}
            </span>
          </div>
        ))}
        
        {isLoading && (
          <div className="message-bubble message-bot">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Processando...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="chat-input-container">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={!inputMessage.trim() || isLoading}
            className="agro-gradient text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        
        <p className="text-xs text-gray-500 mt-2 text-center">
          Conectamos você aos melhores profissionais do agronegócio
        </p>
      </div>
    </div>
  );
};

export default ChatWindow;

