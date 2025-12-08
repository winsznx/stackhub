'use client';

import { useEffect, useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { MoreVertical, Phone, Send, Video, Paperclip, Smile } from "lucide-react";
import { useChatStore } from '@/store/useChatStore';
import { useRealtime } from '@/hooks/useRealtime';
import { useWallet } from '@/hooks/useWallet';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

interface ActiveChatProps {
    conversationId: string;
}

export function ActiveChat({ conversationId }: ActiveChatProps) {
    const { messages, addMessage } = useChatStore();
    const { user } = useWallet();
    const [inputValue, setInputValue] = useState('');
    const virtuosoRef = useRef<VirtuosoHandle>(null);

    const { sendMessage } = useRealtime(conversationId);

    const currentMessages = messages[conversationId] || [];
    const displayName = conversationId.startsWith('SP') ? 'muneeb.btc' : conversationId;

    // Auto-scroll to bottom on new message
    useEffect(() => {
        if (virtuosoRef.current) {
            virtuosoRef.current.scrollToIndex({
                index: currentMessages.length - 1,
                align: 'end',
                behavior: 'smooth'
            });
        }
    }, [currentMessages.length]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || !user) return;

        const newMessage = {
            id: Date.now().toString(),
            senderAddress: user.address || '',
            recipientAddress: conversationId,
            content: inputValue,
            timestamp: Date.now(),
            isEncrypted: false,
            status: 'sent' as const
        };

        addMessage(conversationId, newMessage);
        sendMessage(conversationId, newMessage);
        setInputValue('');
    };

    return (
        <div className="flex flex-col h-full bg-background relative overflow-hidden">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background"></div>

            {/* Chat Header */}
            <header className="flex items-center justify-between p-4 border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-white/10 shadow-sm">
                        <AvatarImage src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${displayName}`} />
                        <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-semibold text-sm">{displayName}</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <p className="text-xs text-muted-foreground">Online</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary">
                        <Phone className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary">
                        <Video className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary">
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                </div>
            </header>

            {/* Messages (Virtual List) */}
            <div className="flex-1 p-4 md:p-6 min-h-0">
                {currentMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-in fade-in zoom-in duration-500">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <Smile className="h-8 w-8 text-primary/50" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-medium">No messages yet</p>
                            <p className="text-sm text-muted-foreground">Start the conversation with a wave! 👋</p>
                        </div>
                    </div>
                ) : (
                    <Virtuoso
                        ref={virtuosoRef}
                        style={{ height: '100%' }}
                        data={currentMessages}
                        followOutput
                        initialTopMostItemIndex={currentMessages.length - 1}
                        itemContent={(index, msg) => {
                            const isMe = msg.senderAddress === user?.address;
                            return (
                                <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} pb-6 px-1`}>
                                    <div
                                        className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-sm relative group ${isMe
                                            ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-br-sm shadow-orange-500/20'
                                            : 'glass-card rounded-bl-sm'
                                            }`}
                                    >
                                        <p className="text-sm leading-relaxed">{msg.content}</p>
                                        <p className={`text-[10px] mt-1.5 text-right ${isMe ? 'text-white/70' : 'text-muted-foreground'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            );
                        }}
                    />
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-transparent">
                <div className="max-w-3xl mx-auto">
                    <form onSubmit={handleSendMessage} className="flex gap-2 items-end glass-card p-2 rounded-2xl focus-within:ring-1 focus-within:ring-primary/50 transition-all shadow-lg">
                        <Button type="button" size="icon" variant="ghost" className="text-muted-foreground hover:text-primary h-10 w-10 shrink-0 rounded-xl">
                            <Paperclip className="h-5 w-5" />
                        </Button>
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-2 min-h-[40px] placeholder:text-muted-foreground/50"
                        />
                        <div className="flex gap-1">
                            <Button type="button" size="icon" variant="ghost" className="text-muted-foreground hover:text-primary h-10 w-10 shrink-0 rounded-xl">
                                <Smile className="h-5 w-5" />
                            </Button>
                            <Button type="submit" size="icon" className="h-10 w-10 shrink-0 rounded-xl shadow-md bg-primary hover:bg-primary/90 text-white" disabled={!inputValue.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
