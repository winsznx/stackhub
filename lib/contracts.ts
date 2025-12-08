import { openContractCall } from '@stacks/connect';
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import { PostConditionMode, Pc } from '@stacks/transactions';
import { getUserSession } from './stacks-client';

const CONTRACT_ADDRESS_TESTNET = 'ST31DP8F8CF2GXSZBHHHK5J6Y061744E1TP7FRGHT';
const CONTRACT_ADDRESS_MAINNET = 'SP1...'; // To be deployed

export const CONTRACTS = {
  TESTNET: {
    AVATARS: `${CONTRACT_ADDRESS_TESTNET}.stacks-hub-avatars`,
    MARKETPLACE: `${CONTRACT_ADDRESS_TESTNET}.marketplace`,
    LAUNCHPAD: `${CONTRACT_ADDRESS_TESTNET}.launchpad`,
    REPUTATION: `${CONTRACT_ADDRESS_TESTNET}.reputation`,
  },
  MAINNET: {
    AVATARS: `${CONTRACT_ADDRESS_MAINNET}.stacks-hub-avatars`,
    MARKETPLACE: `${CONTRACT_ADDRESS_MAINNET}.marketplace`,
    LAUNCHPAD: `${CONTRACT_ADDRESS_MAINNET}.launchpad`,
    REPUTATION: `${CONTRACT_ADDRESS_MAINNET}.reputation`,
  }
};

const CONTRACT_NAME = 'stacks-hub-avatars';

export async function mintAvatar(networkType: 'testnet' | 'mainnet' = 'testnet') {
  const userSession = getUserSession();
  const network = networkType === 'mainnet' ? new StacksMainnet() : new StacksTestnet();
  const contractAddress = networkType === 'mainnet' ? CONTRACT_ADDRESS_MAINNET : CONTRACT_ADDRESS_TESTNET;
  const userAddress = userSession.loadUserData().profile.stxAddress[networkType];

  // Define Post Condition: User transfers 100 STX to Contract Owner (Deployer)
  // Since we don't know the exact deployer in all cases/envs, we can use allow mode OR specific PC if we know.
  // The contract transfers 100 STX from sender to owner.
  // If sender == owner, it's a self transfer.
  // We'll use a Standard STX Post Condition.

  // Use willSendLte to handle both:
  // 1. Normal users sending 100 STX to the owner.
  // 2. The owner minting (sending 100 STX to themselves), which Stacks registers as 0 sent.
  const postCondition = Pc.principal(userAddress).willSendLte(100000000).ustx();

  // Ensure we are passing the explicit address we expect to sign with
  // This helps the wallet select the correct account if multiple are present
  // or prevents using a Mainnet address for a Testnet transaction

  return new Promise((resolve, reject) => {
    openContractCall({
      contractAddress,
      contractName: CONTRACT_NAME,
      functionName: 'mint',
      functionArgs: [],
      network,
      stxAddress: userAddress, // Force wallet to use this address
      postConditions: [postCondition],
      postConditionMode: PostConditionMode.Deny,
      userSession,
      onFinish: (data) => resolve(data),
      onCancel: () => reject('User cancelled'),
    });
  });
}

export function generateSip010Contract(name: string, symbol: string, decimals: number, supply: number, uri: string) {
  // Basic SIP-010 template
  return `
;; ${name} Token
(impl-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)

(define-fungible-token ${symbol.toLowerCase()} u${supply})

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-token-owner (err u101))

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) err-not-token-owner)
    (try! (ft-transfer? ${symbol.toLowerCase()} amount sender recipient))
    (match memo to-print (print to-print) 0x)
    (ok true)
  )
)

(define-read-only (get-name)
  (ok "${name}")
)

(define-read-only (get-symbol)
  (ok "${symbol}")
)

(define-read-only (get-decimals)
  (ok u${decimals})
)

(define-read-only (get-balance (who principal))
  (ok (ft-get-balance ${symbol.toLowerCase()} who))
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply ${symbol.toLowerCase()}))
)

(define-read-only (get-token-uri)
  (ok (some "${uri}"))
)

(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ft-mint? ${symbol.toLowerCase()} amount recipient)
  )
)
  `;
}
