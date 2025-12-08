'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { Loader2, Zap } from 'lucide-react';
import { mintAvatar, CONTRACTS } from '@/lib/contracts';
import { useWallet } from '@/hooks/useWallet';
import { fetchCallReadOnlyFunction, uintCV, cvToJSON } from '@stacks/transactions';
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import { env } from '@/lib/config';
import { getStxBalance } from '@/lib/stacks';
import { useToast } from '@/hooks/use-toast';

// Mock list of 100 avatars (In production, we would fetch metadata)
// For now, we assume standard naming 1.svg ... 100.svg
const AVATARS = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    name: `StacksHub Avatar #${i + 1}`,
    image: `/avatars/${i + 1}.svg`
}));

export function Marketplace() {
    const { user } = useWallet();
    const [mintingId, setMintingId] = useState<number | null>(null);
    const [lastTokenId, setLastTokenId] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchContractState();
    }, []);

    const fetchContractState = async () => {
        try {
            const network = env.NEXT_PUBLIC_STACKS_NETWORK === 'mainnet' ? new StacksMainnet() : new StacksTestnet();
            // Polyfill fetch for network if missing
            if (!(network as any).fetchFn) {
                (network as any).fetchFn = fetch;
            }

            const contractAddress = env.NEXT_PUBLIC_STACKS_NETWORK === 'mainnet' ? CONTRACTS.MAINNET.AVATARS : CONTRACTS.TESTNET.AVATARS;
            const [address, name] = contractAddress.split('.');

            const result = await fetchCallReadOnlyFunction({
                contractAddress: address,
                contractName: name,
                functionName: 'get-last-token-id',
                functionArgs: [],
                network: network as any,
                senderAddress: address
            });

            const json = cvToJSON(result);
            if (json.value) {
                setLastTokenId(parseInt(json.value.value));
            }
        } catch (e) {
            console.error("Failed to fetch contract state", e);
        } finally {
            setIsLoading(false);
        }
    };

    const { toast } = useToast();

    const handleMint = async (id: number) => {
        if (!user) return;

        try {
            const balance = await getStxBalance(user.address, env.NEXT_PUBLIC_STACKS_NETWORK as any);
            if (balance < 100000000) {
                toast({
                    title: "Insufficient Balance",
                    description: "You need 100 STX to mint an avatar.",
                    variant: "destructive"
                });
                return;
            }

            setMintingId(id);
            await mintAvatar(env.NEXT_PUBLIC_STACKS_NETWORK as any);
            toast({
                title: "Mint Transaction Sent",
                description: "Your transaction has been broadcast to the network.",
            });
        } catch (e) {
            console.error(e);
            toast({
                title: "Mint Failed",
                description: "Transaction was cancelled or failed.",
                variant: "destructive"
            });
        } finally {
            setMintingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Supply</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">100</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Minted</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">{lastTokenId}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Remaining</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{100 - lastTokenId}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Price</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">100 STX</div>
                    </CardContent>
                </Card>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {AVATARS.map((avatar) => {
                    const isMinted = avatar.id <= lastTokenId;
                    const isNext = avatar.id === lastTokenId + 1;

                    return (
                        <Card key={avatar.id} className={`overflow-hidden transition-all hover:shadow-md ${isMinted ? 'opacity-75 bg-muted/50' : ''}`}>
                            <div className="aspect-square relative bg-secondary/20 p-4 flex items-center justify-center">
                                <img
                                    src={`/avatars/${avatar.id}.svg`}
                                    alt={avatar.name}
                                    className="w-full h-full object-contain transition-transform hover:scale-105"
                                    loading="lazy"
                                />
                                {isMinted && (
                                    <div className="absolute top-2 right-2">
                                        <Badge variant="secondary">Owned</Badge>
                                    </div>
                                )}
                            </div>
                            <CardFooter className="p-3">
                                {isMinted ? (
                                    <Button variant="ghost" className="w-full" disabled>
                                        Sold Out
                                    </Button>
                                ) : (
                                    <Button
                                        className="w-full"
                                        disabled={!isNext || mintingId !== null}
                                        onClick={() => handleMint(avatar.id)}
                                    >
                                        {mintingId === avatar.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Zap className="mr-2 h-4 w-4" />
                                                {isNext ? 'Mint (100 STX)' : 'Locked'}
                                            </>
                                        )}
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
