// Shared by client and server. Locked strings — must match the contract constructor args byte-for-byte.

export const ALIVE_ACTION = "cryptowill-alive-check";
export const CLAIM_ACTION = "cryptowill-heir-claim";
export const WORLD_ID_ACTIONS = [ALIVE_ACTION, CLAIM_ACTION] as const;
export type WorldIdAction = (typeof WORLD_ID_ACTIONS)[number];

export function isWorldIdAction(value: unknown): value is WorldIdAction {
  return WORLD_ID_ACTIONS.includes(value as WorldIdAction);
}

/**
 * Signal for the heir's registration scan at will creation (TD-008). Deliberately not an address:
 * IDKit hashes it as UTF-8 text, so the resulting proof can never satisfy initiateClaim, whose signal
 * is the 20-byte payout address. Only the nullifier from this scan is used.
 */
export const HEIR_REGISTER_SIGNAL = "cryptowill-heir-register";
