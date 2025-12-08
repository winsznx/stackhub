import { openContractCall } from '@stacks/connect';
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import { PostConditionMode, Pc } from '@stacks/transactions';
import { getUserSession } from './stacks-client';

export const CONTRACT_ADDRESS_TESTNET = 'ST31DP8F8CF2GXSZBHHHK5J6Y061744E1TP7FRGHT';
const CONTRACT_ADDRESS_MAINNET = 'SP31DP8F8CF2GXSZBHHHK5J6Y061744E1TP7FRGHT'; // Placeholder

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

  const postCondition = Pc.principal(userAddress).willSendLte(100000000).ustx();

  return new Promise((resolve, reject) => {
    openContractCall({
      contractAddress,
      contractName: CONTRACT_NAME,
      functionName: 'mint',
      functionArgs: [],
      network,
      stxAddress: userAddress,
      postConditions: [postCondition],
      postConditionMode: PostConditionMode.Deny,
      userSession,
      onFinish: (data) => resolve(data),
      onCancel: () => reject('User cancelled'),
    });
  });
}

export function generateSip010Contract(name: string, symbol: string, decimals: number, supply: number, uri: string) {
  // Hardcoded Launchpad addresses for permissions
  // In a real generic generator, this would be a parameter.
  const LAUNCHPAD_TESTNET = `${CONTRACT_ADDRESS_TESTNET}.launchpad`;
  const LAUNCHPAD_MAINNET = `${CONTRACT_ADDRESS_MAINNET}.launchpad`;

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
    ;; Allow Contract Owner OR Launchpad to mint
    (asserts! (or (is-eq tx-sender contract-owner) (is-eq tx-sender '${LAUNCHPAD_TESTNET}') (is-eq tx-sender '${LAUNCHPAD_MAINNET}')) err-owner-only)
    (ft-mint? ${symbol.toLowerCase()} amount recipient)
  )
)

(define-public (burn (amount uint) (sender principal))
  (begin
    ;; Allow Contract Owner OR Launchpad to burn from AUTHORIZED sender
    ;; The Launchpad will call this. We need to trust the Launchpad.
    ;; Ideally Launchpad uses 'transfer' to itself then burns, but 'burn' from user is fine if user checks via Launchpad
    ;; Actually, standard SIP-010 doesn't have public burn. But our custom trait requires it.
    (asserts! (or (is-eq tx-sender contract-owner) (is-eq tx-sender '${LAUNCHPAD_TESTNET}') (is-eq tx-sender '${LAUNCHPAD_MAINNET}')) err-owner-only)
    (ft-burn? ${symbol.toLowerCase()} amount sender)
  )
)
  `;
}
