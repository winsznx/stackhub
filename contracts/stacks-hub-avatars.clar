
;; stacks-hub-avatars.clar
;; SIP-009 NFT Contract for StacksHub Profile Avatars
;; Allows minting of 100 unique avatars to be used as profile pictures

(impl-trait .sip009-nft-trait.sip009-nft-trait)

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-token-owner (err u101))
(define-constant err-token-exists (err u102))
(define-constant err-token-not-found (err u103))
(define-constant err-sold-out (err u104))

(define-constant MINT-PRICE u100000000) ;; 100 STX
(define-constant MAX-SUPPLY u100)

;; Data Vars
(define-data-var last-token-id uint u0)
(define-data-var base-uri (string-ascii 210) "/avatars/")

;; NFT Definition
(define-non-fungible-token stackshub-avatar uint)

;; Read-only functions

(define-read-only (get-last-token-id)
  (ok (var-get last-token-id))
)

(define-read-only (get-token-uri (token-id uint))
  (ok (as-max-len? (concat (concat (var-get base-uri) (uint-to-string token-id)) ".svg") u256))
)

(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? stackshub-avatar token-id))
)

;; Minting Function
(define-public (mint)
  (let
    (
      (next-id (+ (var-get last-token-id) u1))
    )
    ;; Checks
    (asserts! (<= next-id MAX-SUPPLY) err-sold-out)
    
    ;; Pay mint price to owner
    (try! (stx-transfer? MINT-PRICE tx-sender contract-owner))
    
    ;; Mint NFT
    (try! (nft-mint? stackshub-avatar next-id tx-sender))
    
    ;; Update state
    (var-set last-token-id next-id)
    (ok next-id)
  )
)

;; SIP-009 Transfer
(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) err-not-token-owner)
    (nft-transfer? stackshub-avatar token-id sender recipient)
  )
)

;; Admin functions
(define-public (set-base-uri (new-uri (string-ascii 210)))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set base-uri new-uri)
    (ok true)
  )
)

;; Helper to convert int to ascii (simplified for demo)
;; Helper to convert uint to string (supports up to 999)
(define-private (uint-to-string (value uint))
  (if (<= value u9)
    (get-digit value)
    (if (<= value u99)
      (unwrap-panic (as-max-len? (concat (get-digit (/ value u10)) (get-digit (mod value u10))) u2))
      (unwrap-panic (as-max-len? (concat (unwrap-panic (as-max-len? (concat (get-digit (/ value u100)) (get-digit (/ (mod value u100) u10))) u2)) (get-digit (mod value u10))) u3))
    )
  )
)

(define-private (get-digit (i uint))
  (if (is-eq i u0) "0"
  (if (is-eq i u1) "1"
  (if (is-eq i u2) "2"
  (if (is-eq i u3) "3"
  (if (is-eq i u4) "4"
  (if (is-eq i u5) "5"
  (if (is-eq i u6) "6"
  (if (is-eq i u7) "7"
  (if (is-eq i u8) "8"
  (if (is-eq i u9) "9"
  "0"))))))))))
)
