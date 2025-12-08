
import { fetchCallReadOnlyFunction, cvToJSON, standardPrincipalCV, uintCV } from '@stacks/transactions';
import { StacksTestnet, StacksMainnet } from '@stacks/network';

const CONTRACT_ADDRESS_TESTNET = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
const CONTRACT_NAME = 'stacks-hub-avatars';

export async function getOwnedAvatar(address: string, networkType: 'mainnet' | 'testnet' = 'testnet'): Promise<number | null> {
    // In a real implementation, we would query a backend indexer or loop through tokens.
    // For this demo, we'll check if the user owns token #1 (as a simplified example)
    // or use a hypothetical 'get-balance' if the contract supported it easily.

    // Since our contract is simple SIP-009, we can't easily query "all tokens owned by X" 
    // without an indexer. 

    // However, we can check ownership of a specific token.
    // Let's check token #1 for demo purposes.

    const network = networkType === 'mainnet' ? new StacksMainnet() : new StacksTestnet();

    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS_TESTNET,
            contractName: CONTRACT_NAME,
            functionName: 'get-owner',
            functionArgs: [uintCV(1)],
            network: network as any,
            senderAddress: address,
        });

        const json = cvToJSON(result);
        // Result is (ok (some principal)) or (ok none)
        if (json.value && json.value.value === address) {
            return 1;
        }

        return null;
    } catch (e) {
        console.error("Error checking avatar ownership:", e);
        return null;
    }
}
