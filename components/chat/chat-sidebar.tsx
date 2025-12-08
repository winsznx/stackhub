"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar"
import { Button } from "@/ui/button"
import { Input } from "@/ui/input"
import { ScrollArea } from "@/ui/scroll-area"
import { Plus, Search } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data
const conversations = [
    {
        id: "SP1...ABC",
        name: "muneeb.btc",
        lastMessage: "Hey, did you see the new Stacks update?",
        time: "2m ago",
        unread: 2,
    },
    {
        id: "SP2...XYZ",
        name: "friedger.btc",
        lastMessage: "The contract is deployed.",
        time: "1h ago",
        unread: 0,
    },
    {
        id: "SP3...123",
        name: "SP3...123",
        lastMessage: "Can we trade that NFT?",
        time: "1d ago",
        unread: 0,
    },
]

export function ChatSidebar() {
    const pathname = usePathname()

    return (
        <div className="w-full md:w-80 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex flex-col h-[calc(100vh-4rem)]">
            <div className="p-4 border-b space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-lg tracking-tight">Messages</h2>
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-muted">
                        <Plus className="h-5 w-5" />
                    </Button>
                </div>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search messages..."
                        className="pl-9 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/20"
                    />
                </div>
            </div>
            <ScrollArea className="flex-1">
                <div className="flex flex-col gap-2 p-3">
                    {conversations.map((chat) => {
                        const isActive = pathname === `/chat/${chat.id}`
                        return (
                            <Link
                                key={chat.id}
                                href={`/chat/${chat.id}`}
                                className={cn(
                                    "flex items-start gap-3 p-3 rounded-xl transition-all duration-200",
                                    isActive
                                        ? "bg-primary/10 hover:bg-primary/15"
                                        : "hover:bg-muted/50"
                                )}
                            >
                                <Avatar className="border-2 border-background shadow-sm">
                                    <AvatarImage src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${chat.name}`} />
                                    <AvatarFallback>{chat.name[0].toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 overflow-hidden min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className={cn(
                                            "font-medium truncate text-sm",
                                            isActive ? "text-foreground" : "text-foreground/90"
                                        )}>
                                            {chat.name}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">{chat.time}</span>
                                    </div>
                                    <p className={cn(
                                        "text-xs truncate",
                                        isActive ? "text-foreground/80" : "text-muted-foreground"
                                    )}>
                                        {chat.lastMessage}
                                    </p>
                                </div>
                                {chat.unread > 0 && (
                                    <div className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center mt-1 shadow-sm">
                                        {chat.unread}
                                    </div>
                                )}
                            </Link>
                        )
                    })}
                </div>
            </ScrollArea>
        </div>
    )
}
