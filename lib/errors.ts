import { BaseError, ContractFunctionRevertedError, parseAbi, UserRejectedRequestError } from "viem";
import { cryptoWillAbi } from "./abi";

/** WorldIDRouter errors bubble up through CryptoWill; adding them lets viem decode them by name. */
const worldIdRouterErrorsAbi = parseAbi([
  "error ExpiredRoot()",
  "error ProofInvalid()",
  "error NonExistentRoot()",
]);

export const cryptoWillAbiWithRouterErrors = [...cryptoWillAbi, ...worldIdRouterErrorsAbi] as const;

const MESSAGES: Record<string, string> = {
  // WorldIDRouter (TD-006)
  ExpiredRoot: "World ID verification expired (stale root). Scan again and submit right away.",
  ProofInvalid: "Invalid World ID proof: action, app_id or signal does not match the contract.",
  NonExistentRoot: "World ID root not found on this chain (wrong environment or chain).",
  // CryptoWill
  WillAlreadyActive: "This address already has an active will.",
  ZeroAmount: "The will amount must be greater than 0.",
  ZeroPeriod: "All three time periods must be greater than 0.",
  InvalidHeirNullifier: "Invalid heir nullifier.",
  HeirIsOwner: "You cannot name yourself as the heir.",
  NotOwner: "Only the owner of this will can do this.",
  NullifierMismatch: "This World ID does not match the one registered on the will.",
  InvalidStatus: "The will's current status does not allow this action.",
  ChallengeWindowClosed: "The challenge period is over; check-in and cancel are no longer possible.",
  ChallengeWindowOpen: "The challenge period has not ended yet.",
  NotClaimableYet: "This will cannot be claimed yet.",
  ZeroPayoutAddress: "The payout address cannot be the zero address.",
  TransferFailed: "Transfer failed: the payout address cannot receive ETH.",
};

export function explainError(err: unknown): string {
  if (err instanceof BaseError) {
    const reverted = err.walk((e) => e instanceof ContractFunctionRevertedError);
    if (reverted instanceof ContractFunctionRevertedError) {
      const name = reverted.data?.errorName;
      if (name && MESSAGES[name]) return MESSAGES[name];
      return reverted.shortMessage;
    }
    if (err.walk((e) => e instanceof UserRejectedRequestError)) return "You rejected the transaction in your wallet.";
    return err.shortMessage;
  }
  return err instanceof Error ? err.message : String(err);
}
