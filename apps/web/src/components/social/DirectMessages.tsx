'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  MessageCircle,
  Send,
  Loader2,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DirectMessagesProps {
  userId: string;
}

export default function DirectMessages({ userId }: DirectMessagesProps) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      // Poll for new messages every 5 seconds
      const interval = setInterval(() => {
        fetchMessages(selectedConversation.id, true);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/social/messages');
      const data = await res.json();

      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`/api/social/messages/${conversationId}`);
      const data = await res.json();

      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const recipientId = selectedConversation.participant1.id === userId
        ? selectedConversation.participant2.id
        : selectedConversation.participant1.id;

      const res = await fetch('/api/social/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId,
          content: newMessage.trim(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        setNewMessage('');
        fetchMessages(selectedConversation.id, true);
        fetchConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipant = (conversation: any) => {
    return conversation.participant1.id === userId
      ? conversation.participant2
      : conversation.participant1;
  };

  const formatMessageTime = (date: string) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
    }
    return messageDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="shadow-lg border-2 h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedConversation && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedConversation(null)}
                className="lg:hidden"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <CardTitle className="text-2xl">
              {selectedConversation
                ? (() => {
                    const other = getOtherParticipant(selectedConversation);
                    return other.firstName && other.lastName
                      ? `${other.firstName} ${other.lastName}`
                      : other.username;
                  })()
                : 'Messages'}
            </CardTitle>
          </div>
          {selectedConversation && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchMessages(selectedConversation.id)}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0 flex">
        {/* Conversations List */}
        <div className={`w-full lg:w-80 border-r overflow-y-auto ${selectedConversation ? 'hidden lg:block' : ''}`}>
          {loading && conversations.length === 0 ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12 px-4 text-slate-500">
              <MessageCircle className="w-16 h-16 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No messages yet</p>
              <p className="text-sm mt-1">Start chatting with your friends</p>
            </div>
          ) : (
            <div>
              {conversations.map((conversation) => {
                const other = getOtherParticipant(conversation);
                const displayName = other.firstName && other.lastName
                  ? `${other.firstName} ${other.lastName}`
                  : other.username;

                return (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`flex items-center gap-3 p-4 border-b cursor-pointer hover:bg-slate-50 transition-colors ${
                      selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      {other.avatar ? (
                        <img src={other.avatar} alt={displayName} className="object-cover" />
                      ) : (
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-full h-full flex items-center justify-center text-white font-bold text-lg">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-sm truncate">{displayName}</p>
                        {conversation.lastMessageAt && (
                          <span className="text-xs text-slate-500">
                            {formatMessageTime(conversation.lastMessageAt)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500 truncate">
                          {conversation.lastMessage || 'No messages yet'}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="destructive" className="ml-2 h-5 min-w-5 px-1">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Messages View */}
        {selectedConversation ? (
          <div className={`flex-1 flex flex-col ${selectedConversation ? '' : 'hidden lg:flex'}`}>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading && messages.length === 0 ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <MessageCircle className="w-16 h-16 mx-auto mb-3 opacity-20" />
                  <p className="font-medium">No messages yet</p>
                  <p className="text-sm mt-1">Send a message to start the conversation</p>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isOwn = message.senderId === userId;
                  const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;

                  return (
                    <div
                      key={message.id}
                      className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}
                    >
                      {showAvatar && !isOwn && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          {selectedConversation && (() => {
                            const other = getOtherParticipant(selectedConversation);
                            const displayName = other.firstName && other.lastName
                              ? `${other.firstName} ${other.lastName}`
                              : other.username;
                            return other.avatar ? (
                              <img src={other.avatar} alt={displayName} className="object-cover" />
                            ) : (
                              <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-full h-full flex items-center justify-center text-white font-bold text-xs">
                                {displayName.charAt(0).toUpperCase()}
                              </div>
                            );
                          })()}
                        </Avatar>
                      )}
                      {!showAvatar && !isOwn && <div className="w-8" />}

                      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
                        <div
                          className={`rounded-2xl px-4 py-2 ${
                            isOwn
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                              : 'bg-slate-100 text-slate-900'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                        </div>
                        {(showAvatar || index === messages.length - 1) && (
                          <span className="text-xs text-slate-500 mt-1 px-2">
                            {formatMessageTime(message.createdAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  disabled={sending}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center text-slate-500">
            <div className="text-center">
              <MessageCircle className="w-24 h-24 mx-auto mb-4 opacity-20" />
              <p className="font-medium">Select a conversation</p>
              <p className="text-sm mt-1">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
