'use client';

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/ui/button"
import { ClientWalletWrapper } from "@/components/client-wallet-wrapper"
import { Logo } from "@/components/ui/logo"
import { Rocket, ShoppingBag, Settings, LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"

export function SiteHeader() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname?.startsWith(path);

    return (
        <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl mr-6">
                    <Logo className="size-8" />
                    <span className="hidden md:inline-block">StacksHub</span>
                </Link>
                <nav className="flex items-center gap-1 md:gap-2 flex-1 overflow-x-auto no-scrollbar">
                    <Link href="/chat">
                        <Button variant={isActive('/chat') ? "secondary" : "ghost"} size="sm" className="gap-2">
                            <LayoutDashboard className="size-4" />
                            Chat
                        </Button>
                    </Link>
                    <Link href="/launchpad">
                        <Button variant={isActive('/launchpad') ? "secondary" : "ghost"} size="sm" className="gap-2">
                            <Rocket className="size-4" />
                            Launchpad
                        </Button>
                    </Link>
                    <Link href="/marketplace">
                        <Button variant={isActive('/marketplace') ? "secondary" : "ghost"} size="sm" className="gap-2">
                            <ShoppingBag className="size-4" />
                            Marketplace
                        </Button>
                    </Link>
                    <Link href="/settings">
                        <Button variant={isActive('/settings') ? "secondary" : "ghost"} size="sm" className="gap-2">
                            <Settings className="size-4" />
                            Settings
                        </Button>
                    </Link>
                </nav>
                <div className="flex items-center gap-4">
                    {pathname === '/' && (
                        <Button variant="outline" className="hidden sm:flex" asChild>
                            <Link href="/chat">
                                Launch App
                            </Link>
                        </Button>
                    )}
                    <ClientWalletWrapper />
                </div>
            </div>
        </header>
    )
}
