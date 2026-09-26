"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "cryptowill.heirNullifier";

// The heir nullifier verified in this tab (via "Find wills that name me"). Remembered so going back
// from a will page doesn't need a re-scan, and so a will page knows the viewer is its heir. Kept in
// memory too, so it still works when sessionStorage is blocked.
let saved: string | null | undefined;
const listeners = new Set<() => void>();

function read(): string | null {
  if (saved === undefined) {
    try {
      saved = sessionStorage.getItem(STORAGE_KEY);
    } catch {
      saved = null;
    }
  }
  return saved;
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  return () => listeners.delete(notify);
}

export function setVerifiedHeir(nullifier: bigint | null) {
  saved = nullifier === null ? null : nullifier.toString();
  try {
    if (saved === null) sessionStorage.removeItem(STORAGE_KEY);
    else sessionStorage.setItem(STORAGE_KEY, saved);
  } catch {}
  listeners.forEach((notify) => notify());
}

/** Heir nullifier verified in this tab, or null. Always null during SSR. */
export function useVerifiedHeir(): bigint | null {
  const value = useSyncExternalStore(subscribe, read, () => null);
  return value === null ? null : BigInt(value);
}
