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
  ExpiredRoot: "World ID 驗證已過期（root 過期），請重新掃碼後立刻送出",
  ProofInvalid: "World ID proof 無效：action、app_id 或 signal 與合約不一致",
  NonExistentRoot: "World ID root 不存在於這條鏈上（環境或鏈設定錯誤）",
  // CryptoWill
  WillAlreadyActive: "這個地址已經有一份進行中的遺囑",
  ZeroAmount: "遺產金額必須大於 0",
  ZeroPeriod: "三個時間參數都必須大於 0",
  InvalidHeirNullifier: "繼承人 nullifier 無效",
  HeirIsOwner: "繼承人不能是你自己",
  NotOwner: "只有遺囑的委託人可以執行這個操作",
  NullifierMismatch: "World ID 身分與遺囑登記的不符",
  InvalidStatus: "遺囑目前的狀態不允許這個操作",
  ChallengeWindowClosed: "挑戰期已結束，無法再 check-in 或取消",
  ChallengeWindowOpen: "挑戰期尚未結束，還不能執行",
  NotClaimableYet: "還沒到可以認領的時間",
  ZeroPayoutAddress: "收款地址不能是 0",
  TransferFailed: "轉帳失敗：收款地址無法接收 ETH",
};

export function explainError(err: unknown): string {
  if (err instanceof BaseError) {
    const reverted = err.walk((e) => e instanceof ContractFunctionRevertedError);
    if (reverted instanceof ContractFunctionRevertedError) {
      const name = reverted.data?.errorName;
      if (name && MESSAGES[name]) return MESSAGES[name];
      return reverted.shortMessage;
    }
    if (err.walk((e) => e instanceof UserRejectedRequestError)) return "你在錢包中取消了這筆交易";
    return err.shortMessage;
  }
  return err instanceof Error ? err.message : String(err);
}
