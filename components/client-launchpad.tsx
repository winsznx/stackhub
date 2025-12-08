'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Rocket, Loader2, CheckCircle2, ArrowRight, ExternalLink } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { generateSip010Contract, CONTRACTS } from '@/lib/contracts';
import { getUserSession } from '@/lib/stacks-client';
import { openContractCall } from '@stacks/connect';
import { contractPrincipalCV, stringAsciiCV, uintCV } from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';

import { Button } from '@/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/ui/form';
import { Input } from '@/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/ui/card';
import { useLaunchpadStore } from '@/store/useLaunchpadStore';

const toast = (msg: string) => alert(msg);

const formSchema = z.object({
    name: z.string().min(2).regex(/^[a-zA-Z0-9 ]*$/, 'Alphanumeric only'),
    symbol: z.string().min(2).max(10).regex(/^[a-zA-Z0-9]*$/, 'Alphanumeric only'),
    decimals: z.coerce.number().min(0).max(18),
    supply: z.coerce.number().positive(),
    uri: z.string().url().optional().or(z.literal('')),
});

interface DeployedTokenEnv {
    principal: string;
    name: string;
    symbol: string;
}

interface SavedToken extends DeployedTokenEnv {
    createdAt: number;
}

type DeployStep = 'FORM' | 'REGISTER' | 'DONE';

export default function ClientLaunchpad() {
    const { user } = useWallet();
    const [isDeploying, setIsDeploying] = useState(false);
    const [deployStep, setDeployStep] = useState<DeployStep>('FORM');
    const [deployedToken, setDeployedToken] = useState<DeployedTokenEnv | null>(null);
    const [savedTokens, setSavedTokens] = useState<SavedToken[]>([]);
    const [isMounted, setIsMounted] = useState(false);

    const { launchData, setLaunchData } = useLaunchpadStore();

    useEffect(() => {
        setIsMounted(true);
        try {
            const stored = localStorage.getItem('stackshub_my_tokens');
            if (stored) setSavedTokens(JSON.parse(stored));
        } catch (e) {
            console.error("Failed to load saved tokens", e);
        }
    }, []);

    const saveToken = (token: DeployedTokenEnv) => {
        const newToken: SavedToken = { ...token, createdAt: Date.now() };
        const updated = [newToken, ...savedTokens];
        setSavedTokens(updated);
        localStorage.setItem('stackshub_my_tokens', JSON.stringify(updated));
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: launchData.name || "",
            symbol: launchData.symbol || "",
            decimals: launchData.decimals || 6,
            supply: launchData.supply || 1000000,
            uri: "",
        },
    });

    const { watch } = form;
    watch((value) => {
        setLaunchData(value as any);
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user?.isAuthenticated) {
            toast("Please connect your wallet first");
            return;
        }

        setIsDeploying(true);
        const code = generateSip010Contract(
            values.name,
            values.symbol,
            values.decimals,
            values.supply,
            values.uri || "https://stackshub.app/metadata.json"
        );

        import('@stacks/connect').then(({ openContractDeploy }) => {
            const userSession = getUserSession();
            openContractDeploy({
                contractName: values.symbol.toLowerCase(),
                codeBody: code,
                onFinish: (data) => {
                    // Assuming Testnet for now
                    // For mainnet, we need to detect network
                    const address = userSession.loadUserData().profile.stxAddress.testnet;
                    const principal = `${address}.${values.symbol.toLowerCase()}`;

                    setDeployedToken({
                        principal,
                        name: values.name,
                        symbol: values.symbol
                    });
                    setDeployStep('REGISTER');
                    setIsDeploying(false);
                },
                onCancel: () => {
                    setIsDeploying(false);
                },
                userSession,
            });
        }).catch(err => {
            console.error("Failed to load stacks connect", err);
            setIsDeploying(false);
        });
    }

    function handleRegister() {
        if (!deployedToken) return;

        const [launchpadAddress, launchpadName] = CONTRACTS.TESTNET.LAUNCHPAD.split('.');
        const [tokenAddress, tokenName] = deployedToken.principal.split('.');

        openContractCall({
            contractAddress: launchpadAddress,
            contractName: launchpadName,
            functionName: 'launch-token',
            functionArgs: [
                contractPrincipalCV(tokenAddress, tokenName),
                stringAsciiCV(deployedToken.name),
                stringAsciiCV(deployedToken.symbol),
                uintCV(launchData.decimals || 6)
            ],
            network: new StacksTestnet(),
            userSession: getUserSession(),
            onFinish: (data) => {
                saveToken(deployedToken);
                setDeployStep('DONE');
            },
            onCancel: () => {
                console.log("Registration cancelled");
            }
        });
    }

    function handleReset() {
        setDeployStep('FORM');
        setDeployedToken(null);
        setLaunchData({});
        form.reset();
    }

    if (!isMounted) return null;

    return (
        <div className="container max-w-4xl py-10 px-4 space-y-10">
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Token Launchpad</h1>
                    <p className="text-muted-foreground">
                        Launch your own SIP-010 fungible token on Stacks in seconds.
                    </p>
                </div>

                {deployStep === 'FORM' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>1. Define Token</CardTitle>
                            <CardDescription>
                                Create the metadata and deploy the contract.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Token Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Bitcoin Pepe" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="symbol"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Symbol</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. PEPE" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="decimals"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Decimals</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="supply"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Initial Supply</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="uri"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Metadata URI (Optional)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="https://..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button type="submit" className="w-full" disabled={isDeploying}>
                                        {isDeploying ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Deploying...
                                            </>
                                        ) : (
                                            <>
                                                <Rocket className="mr-2 h-4 w-4" />
                                                Deploy Contract
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                )}

                {deployStep === 'REGISTER' && deployedToken && (
                    <Card className="border-green-500/50 bg-green-500/5">
                        <CardHeader>
                            <div className="flex items-center gap-2 text-green-600 mb-2">
                                <CheckCircle2 className="h-6 w-6" />
                                <span className="font-semibold">Contract Deployed</span>
                            </div>
                            <CardTitle>2. Initialize Bonding Curve</CardTitle>
                            <CardDescription>
                                Register <strong>{deployedToken.symbol}</strong> ({deployedToken.principal}) on the Launchpad to enable trading.
                            </CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button onClick={handleRegister} className="w-full gap-2" size="lg">
                                Initialize Market <ArrowRight className="h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                )}

                {deployStep === 'DONE' && deployedToken && (
                    <Card className="border-primary/50 bg-primary/5">
                        <CardHeader>
                            <div className="flex items-center gap-2 text-primary mb-2">
                                <Rocket className="h-6 w-6" />
                                <span className="font-semibold">Launch Complete!</span>
                            </div>
                            <CardTitle>Trading is Live</CardTitle>
                            <CardDescription>
                                Your token is now tradeable on the bonding curve.
                            </CardDescription>
                        </CardHeader>
                        <CardFooter className="flex gap-4">
                            <Button variant="outline" onClick={handleReset} className="flex-1">
                                Launch Another
                            </Button>
                            <Button asChild className="flex-1">
                                <Link href={`/token/${deployedToken.principal}`}>
                                    Trade Page <ExternalLink className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                )}
            </div>

            {/* Persistence Layer: My Launches */}
            {savedTokens.length > 0 && (
                <div className="border-t pt-10">
                    <h2 className="text-xl font-bold mb-6">My Launched Tokens</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {savedTokens.map((token) => (
                            <Card key={token.principal} className="overflow-hidden hover:border-primary/50 transition-colors">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg">{token.name}</CardTitle>
                                        <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                            {token.symbol}
                                        </span>
                                    </div>
                                    <CardDescription className="font-mono text-xs truncate" title={token.principal}>
                                        {token.principal}
                                    </CardDescription>
                                </CardHeader>
                                <CardFooter className="bg-muted/50 p-3 pt-3">
                                    <Button asChild variant="ghost" size="sm" className="w-full justify-between">
                                        <Link href={`/token/${token.principal}`}>
                                            Trade <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
