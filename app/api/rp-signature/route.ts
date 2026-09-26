import { NextResponse } from "next/server";
import { signRequest } from "@worldcoin/idkit-core/signing";
import { isWorldIdAction } from "@/lib/constants";

// RP signatures must be produced server-side: the signing key never reaches the client (TD-003).
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const rp_id = process.env.WORLD_ID_RP_ID;
  const signingKeyHex = process.env.WORLD_ID_SIGNING_KEY;
  if (!rp_id || !signingKeyHex) {
    return NextResponse.json(
      { error: "Server missing WORLD_ID_RP_ID / WORLD_ID_SIGNING_KEY (see .env.example)" },
      { status: 500 },
    );
  }

  const body = await request.json().catch(() => null);
  const action = body?.action;
  // Only ever sign the two locked CryptoWill actions; anything else would turn this into a signing oracle.
  if (!isWorldIdAction(action)) {
    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  }

  const rpSig = signRequest({ signingKeyHex, action });
  return NextResponse.json({
    action,
    rp_context: {
      rp_id,
      nonce: rpSig.nonce,
      created_at: rpSig.createdAt,
      expires_at: rpSig.expiresAt,
      signature: rpSig.sig,
    },
  });
}
