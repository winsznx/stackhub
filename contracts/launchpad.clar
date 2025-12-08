;; launchpad.clar
;; Bonding Curve Launchpad for StacksHub
;; Users deploy a token, register it here, and then trade against the curve.

(use-trait sip010-ft-trait .sip010-ft-trait.sip010-ft-trait)

(define-trait launchable-token-trait
  (
    (mint (uint principal) (response bool uint))
    (burn (uint principal) (response bool uint))
  )
)

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_UNKNOWN_TOKEN (err u100))
(define-constant ERR_SLIPPAGE (err u101))
(define-constant ERR_TRANSFER_FAILED (err u102))

;; launchpad.clar
;; Bonding Curve Launchpad for StacksHub
;; Production ready: Events, Creator Tracking, Linear Curve

(use-trait sip010-ft-trait .sip010-ft-trait.sip010-ft-trait)

(define-trait launchable-token-trait
  (
    (mint (uint principal) (response bool uint))
    (burn (uint principal) (response bool uint))
  )
)

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_UNKNOWN_TOKEN (err u100))
(define-constant ERR_SLIPPAGE (err u101))
(define-constant ERR_TRANSFER_FAILED (err u102))

;; Data Maps
;; Map: TokenPrincipal -> State
(define-map token-state 
  principal 
  { 
    creator: principal,
    supply: uint, 
    stx-reserve: uint, 
    active: bool,
    target-supply: uint
  }
)

;; Register a new token
;; We pass descriptive args just for the event log, so indexers can pick it up easily
(define-public (launch-token (token-contract <launchable-token-trait>) (name (string-ascii 32)) (symbol (string-ascii 10)) (decimals uint))
  (let
    (
      (token-principal (contract-of token-contract))
    )
    (begin
        (map-set token-state token-principal { 
            creator: tx-sender, 
            supply: u0, 
            stx-reserve: u0, 
            active: true,
            target-supply: u1000000000 ;; e.g. 1B tokens cap for curve
        })
        
        ;; Emit Event for Indexers
        (print {
            event: "token-launch",
            token: token-principal,
            creator: tx-sender,
            name: name,
            symbol: symbol,
            decimals: decimals,
            time: block-height
        })
        
        (ok true)
    )
  )
)

;; Buy Tokens
;; Input: STX Amount
;; Output: Token Amount based on Linear Curve
(define-public (buy (token-contract <launchable-token-trait>) (stx-amount uint))
  (let
    (
      (token-principal (contract-of token-contract))
      (state (unwrap! (map-get? token-state token-principal) ERR_UNKNOWN_TOKEN))
      (current-supply (get supply state))
      (current-reserve (get stx-reserve state))
      
      ;; Price Calculation (Linear)
      ;; P = 1 uSTX + (supply / 100000)
      ;; This makes it cheaper at start.
      (price (get-current-price current-supply)) 
      (tokens-out (/ (* stx-amount u1000000) price)) ;; Scaling for integer math
    )
    (begin
        ;; 1. User sends STX to contract
        (try! (stx-transfer? stx-amount tx-sender (as-contract tx-sender)))
        
        ;; 2. Contract mints Tokens to User
        (try! (contract-call? token-contract mint tokens-out tx-sender))
        
        ;; 3. Update State
        (map-set token-state token-principal 
            { 
               creator: (get creator state),
               supply: (+ current-supply tokens-out), 
               stx-reserve: (+ current-reserve stx-amount),
               active: true,
               target-supply: (get target-supply state)
            }
        )
        
        ;; 4. Emit Event
        (print {
            event: "token-buy",
            token: token-principal,
            buyer: tx-sender,
            stx_in: stx-amount,
            tokens_out: tokens-out,
            new_price: price,
            new_supply: (+ current-supply tokens-out)
        })
        
        (ok tokens-out)
    )
  )
)

;; Sell Tokens
(define-public (sell (token-contract <launchable-token-trait>) (token-amount uint))
  (let
    (
      (token-principal (contract-of token-contract))
      (state (unwrap! (map-get? token-state token-principal) ERR_UNKNOWN_TOKEN))
      (current-supply (get supply state))
      (current-reserve (get stx-reserve state))
      
      (price (get-current-price current-supply))
      ;; STX out = tokens * price
      (stx-out (/ (* token-amount price) u1000000))
    )
    (begin
        ;; 1. Burn user tokens
        (try! (contract-call? token-contract burn token-amount tx-sender))
        
        ;; 2. Send STX from contract to user
        (try! (as-contract (stx-transfer? stx-out tx-sender contract-caller)))
        
        ;; 3. Update State
        (map-set token-state token-principal 
            { 
               creator: (get creator state),
               supply: (- current-supply token-amount), 
               stx-reserve: (- current-reserve stx-out),
               active: true,
               target-supply: (get target-supply state)
            }
        )
        
        ;; 4. Emit Event
        (print {
            event: "token-sell",
            token: token-principal,
            seller: tx-sender,
            tokens_in: token-amount,
            stx_out: stx-out,
            new_price: price,
            new_supply: (- current-supply token-amount)
        })
        
        (ok stx-out)
    )
  )
)

(define-read-only (get-current-price (supply uint))
    ;; Linear: P = 1000 uSTX + (supply / 1000)
    (+ u1000 (/ supply u1000))
)

(define-read-only (get-token-details (token principal))
    (ok (map-get? token-state token))
)
