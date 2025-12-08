'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Rocket, Loader2 } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { generateSip010Contract } from '@/lib/contracts';
import { getUserSession } from '@/lib/stacks-client';

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';

// Simple toast replacement if not exists
const toast = (msg: string) => alert(msg);

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Token name must be at least 2 characters.",
    }),
    symbol: z.string().min(2, {
        message: "Symbol must be at least 2 characters.",
    }).max(10),
    decimals: z.coerce.number().min(0).max(18),
    supply: z.coerce.number().positive(),
    uri: z.string().url().optional().or(z.literal('')),
});

import { useLaunchpadStore } from '@/store/useLaunchpadStore';

export default function ClientLaunchpad() {
    const { user } = useWallet();
    const [isDeploying, setIsDeploying] = useState(false);
    const { launchData, setLaunchData } = useLaunchpadStore();

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

    // Sync form changes to store
    const { watch } = form;
    const subscription = watch((value) => {
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
                    console.log('Contract deployed:', data);
                    setIsDeploying(false);
                    toast("Contract deployment started!");
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

    return (
        <div className="container max-w-2xl py-10 px-4">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Token Launchpad</h1>
                    <p className="text-muted-foreground">
                        Launch your own SIP-010 fungible token on Stacks in seconds. No coding required.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Token Details</CardTitle>
                        <CardDescription>
                            Define the properties of your new Bitcoin-secured asset.
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
                                            <FormDescription>
                                                Amount of tokens to mint to your wallet immediately.
                                            </FormDescription>
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
                                            <FormDescription>
                                                Link to a JSON file containing token metadata (image, description).
                                            </FormDescription>
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
                                            Deploy Token
                                        </>
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
