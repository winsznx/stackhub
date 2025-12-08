'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { Input } from '@/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs';
import { useWallet } from '@/hooks/useWallet';
import { CONTRACTS } from '@/lib/contracts';
import { readContract } from '@/lib/stacks';
import { contractPrincipalCV, uintCV, contractPrincipalCVFromAddress } from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import { getUserSession } from '@/lib/stacks-client';
import { Loader2, ArrowRightLeft, TrendingUp } from 'lucide-react';

interface TokenState {
    creator: string;
    supply: number;
    stxReserve: number;
    active: boolean;
    targetSupply: number;
}

interface TokenTradingInterfaceProps {
    tokenPrincipal: string; // e.g. ST123...token-name
}

export function TokenTradingInterface({ tokenPrincipal }: TokenTradingInterfaceProps) {
    const { user } = useWallet();
    const [tokenState, setTokenState] = useState<TokenState | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [amount, setAmount] = useState('');
    const [isTrading, setIsTrading] = useState(false);

    // Parse principal
    const [contractAddress, contractName] = tokenPrincipal.split('.');

    // Fetch Token Data
    const fetchData = async () => {
        try {
            const [launchpadAddress, launchpadName] = CONTRACTS.TESTNET.LAUNCHPAD.split('.');

            // Call get-token-details on Launchpad
            const data = await readContract(
                launchpadAddress,
                launchpadName,
                'get-token-details',
                [contractPrincipalCV(contractAddress, contractName)],
                'testnet'
            );

            if (data && data.value) {
                // Parse tuple
                // Clarity returns objects with type indicators usually, cvToJSON cleans it up
                // { value: { value: { supply: { value: '0' }, ... } } } - depends on cvToJSON depth
                // Usually cvToJSON returns simplified JSON if configured or raw.
                // Let's assume standard cvToJSON output structure
                const details = data.value.value;
                setTokenState({
                    creator: details.creator.value,
                    supply: parseInt(details.supply.value),
                    stxReserve: parseInt(details['stx-reserve'].value),
                    active: details.active.value,
                    targetSupply: parseInt(details['target-supply'].value)
                });
            }
        } catch (e) {
            console.error("Failed to fetch token data", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // Refresh every 10s
        return () => clearInterval(interval);
    }, [tokenPrincipal]);

    const handleBuy = async () => {
        if (!amount || isNaN(Number(amount))) return;
        setIsTrading(true);
        const stxAmount = Math.floor(Number(amount) * 1000000); // STX to uSTX

        const [launchpadAddress, launchpadName] = CONTRACTS.TESTNET.LAUNCHPAD.split('.');

        openContractCall({
            contractAddress: launchpadAddress,
            contractName: launchpadName,
            functionName: 'buy',
            functionArgs: [
                contractPrincipalCV(contractAddress, contractName),
                uintCV(stxAmount)
            ],
            network: undefined, // Defaults
            userSession: getUserSession(),
            onFinish: () => {
                alert("Buy Tx Sent!");
                setIsTrading(false);
                setAmount('');
            },
            onCancel: () => setIsTrading(false)
        });
    };

    const handleSell = async () => {
        if (!amount || isNaN(Number(amount))) return;
        setIsTrading(true);
        // Tokens have decimals? Assuming 6 for launchpad standard curve logic usually
        // But supply in contract is raw uint.
        // Assuming user inputs "10 tokens".
        const tokenAmount = Math.floor(Number(amount));

        const [launchpadAddress, launchpadName] = CONTRACTS.TESTNET.LAUNCHPAD.split('.');

        openContractCall({
            contractAddress: launchpadAddress,
            contractName: launchpadName,
            functionName: 'sell',
            functionArgs: [
                contractPrincipalCV(contractAddress, contractName),
                uintCV(tokenAmount)
            ],
            network: undefined,
            userSession: getUserSession(),
            onFinish: () => {
                alert("Sell Tx Sent!");
                setIsTrading(false);
                setAmount('');
            },
            onCancel: () => setIsTrading(false)
        });
    };

    // Calculate Price: 1000 + supply/1000 (in uSTX)
    const currentPriceInUstx = tokenState ? (1000 + (tokenState.supply / 1000)) : 1000;
    const currentPriceStx = currentPriceInUstx / 1000000;

    if (isLoading) {
        return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
    }

    if (!tokenState) {
        return <div className="p-10 text-center">Token not found or not registered on Launchpad.</div>;
    }

    const progress = Math.min((tokenState.supply / tokenState.targetSupply) * 100, 100);

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Left Column: Stats & Chart */}
            <div className="md:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {contractName} <span className="text-muted-foreground text-sm font-normal">({contractAddress.slice(0, 6)}...{contractAddress.slice(-4)})</span>
                        </CardTitle>
                        <CardDescription>Created by {tokenState.creator}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <div className="text-sm text-muted-foreground">Price</div>
                            <div className="text-xl font-bold">{currentPriceStx.toFixed(6)} STX</div>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <div className="text-sm text-muted-foreground">Market Cap</div>
                            <div className="text-xl font-bold">{(currentPriceStx * tokenState.supply).toLocaleString()} STX</div>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <div className="text-sm text-muted-foreground">Supply</div>
                            <div className="text-xl font-bold">{tokenState.supply.toLocaleString()}</div>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <div className="text-sm text-muted-foreground">Reserve</div>
                            <div className="text-xl font-bold">{(tokenState.stxReserve / 1000000).toLocaleString()} STX</div>
                        </div>
                    </CardContent>
                </Card>

                {/* Bonding Curve Progress */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            Bonding Curve Progress
                        </CardTitle>
                        <CardDescription>
                            When supply reaches {tokenState.targetSupply.toLocaleString()}, liquidity migrates to DEX.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-4 w-full bg-secondary rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-500 transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="mt-2 text-right text-sm text-muted-foreground">{progress.toFixed(2)}%</div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: Trade Form */}
            <div>
                <Card className="h-full border-primary/20">
                    <CardHeader>
                        <CardTitle>Trade</CardTitle>
                        <CardDescription>Swap STX for {contractName}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="buy" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="buy" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">Buy</TabsTrigger>
                                <TabsTrigger value="sell" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">Sell</TabsTrigger>
                            </TabsList>
                            <TabsContent value="buy" className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Amount (STX)</label>
                                    <Input
                                        type="number"
                                        placeholder="0.0"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Est. Tokens: {amount ? (Number(amount) / currentPriceStx).toFixed(2) : '0.00'}
                                </div>
                                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleBuy} disabled={isTrading}>
                                    {isTrading ? <Loader2 className="animate-spin" /> : "Buy Stats"}
                                </Button>
                            </TabsContent>
                            <TabsContent value="sell" className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Amount ({contractName})</label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Est. STX: {amount ? (Number(amount) * currentPriceStx).toFixed(6) : '0.00'}
                                </div>
                                <Button className="w-full bg-red-600 hover:bg-red-700" onClick={handleSell} disabled={isTrading}>
                                    {isTrading ? <Loader2 className="animate-spin" /> : "Sell Tokens"}
                                </Button>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
