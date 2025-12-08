'use client';

import { Button } from '@/ui/button';
import { useWallet } from '@/hooks/useWallet';
import { truncateAddress } from '@/lib/stacks';
import { Loader2, Wallet } from 'lucide-react';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/ui/dropdown-menu"
import { LogOut, User as UserIcon, ChevronDown } from "lucide-react"
import Link from "next/link"

export function ConnectWalletButton() {
    const { user, connectWallet, disconnectWallet, isMounted } = useWallet();

    if (!isMounted) {
        return (
            <Button disabled variant="outline">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
            </Button>
        );
    }

    if (user?.isAuthenticated) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                        {user.btcName || truncateAddress(user.address)}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href={`/profile/${user.btcName || user.address}`}>
                            <UserIcon className="mr-2 h-4 w-4" />
                            Profile
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={disconnectWallet} className="text-red-500 focus:text-red-500">
                        <LogOut className="mr-2 h-4 w-4" />
                        Disconnect
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    return (
        <Button onClick={() => connectWallet()}>
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
        </Button>
    );
}
