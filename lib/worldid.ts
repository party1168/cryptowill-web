import type { IDKitResult } from "@worldcoin/idkit";
import { decodeAbiParameters, isAddress, keccak256, stringToHex, type Hex } from "viem";

/** Arguments every CryptoWill World ID entrypoint takes, decoded from a v3 legacy IDKit result. */
export type ProofArgs = {
  root: bigint;
  nullifierHash: bigint;
  proof: readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint];
};

/** Same as the contract's ByteHasher.hashToField: keccak256(bytes) >> 8. */
export function hashToField(bytes: Hex): bigint {
  return BigInt(keccak256(bytes)) >> 8n;
}

/**
 * Signal hash the contract will recompute. Addresses are hashed as their 20 raw bytes, matching both
 * IDKit's hashSignal and Solidity abi.encodePacked(address); anything else is hashed as UTF-8 text.
 */
export function expectedSignalHash(signal: string): bigint {
  return hashToField(isAddress(signal, { strict: false }) ? (signal as Hex) : stringToHex(signal));
}

/**
 * Validates an IDKit result against what the contract will check, then decodes it. Throwing here
 * gives a precise error instead of an opaque ProofInvalid from the Router after the user signed a tx.
 */
export function toProofArgs(result: IDKitResult, action: string, signal: string): ProofArgs {
  if (!("protocol_version" in result) || result.protocol_version !== "3.0") {
    throw new Error("World ID 回傳的不是 v3 legacy proof，無法在鏈上驗證（檢查 allow_legacy_proofs / orbLegacy）");
  }
  if (result.action !== undefined && result.action !== action) {
    throw new Error(`World ID action 不符：預期 ${action}，實際 ${result.action}`);
  }
  const item = result.responses[0];
  if (!item) throw new Error("World ID 回傳內容缺少 responses");
  if (!item.signal_hash || BigInt(item.signal_hash) !== expectedSignalHash(signal)) {
    throw new Error("signal_hash 與合約預期不一致：前端傳給 IDKit 的 signal 編碼錯誤");
  }

  const [proof] = decodeAbiParameters([{ type: "uint256[8]" }], item.proof as Hex);
  return {
    root: BigInt(item.merkle_root),
    nullifierHash: BigInt(item.nullifier),
    proof: proof as ProofArgs["proof"],
  };
}
