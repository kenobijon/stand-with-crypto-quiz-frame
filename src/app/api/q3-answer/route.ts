import { NextRequest, NextResponse } from "next/server";
import { Message, getSSLHubRpcClient } from "@farcaster/hub-nodejs";
import { FrameRequest } from "../../types/farcasterTypes";

const POST_URL = "https://keiretsu-frame-airdrop.vercel.app/api/q2-answer";
const VISIT_URL = "https://keiretsu-frame-airdrop.vercel.app/api/frame";
const TOGGLE_URL = "https://keiretsu-frame-airdrop.vercel.app/api/toggle";
const Q2_URL = "https://keiretsu-frame-airdrop.vercel.app/api/q2";
const END_URL = "https://keiretsu-frame-airdrop.vercel.app/api/end";
const Q3_URL = "https://keiretsu-frame-airdrop.vercel.app/api/q3";

export async function POST(req: NextRequest, res: NextResponse) {
  console.log("POST received at /api/frame");

  const HUB_URL = process.env["HUB_URL"] || "nemes.farcaster.xyz:2283";
  const client = getSSLHubRpcClient(HUB_URL);
  let validatedMessage: Message | undefined = undefined;
  try {
    const body: FrameRequest = await req.json();
    console.log(body);
    const frameMessage = Message.decode(
      Buffer.from(body?.trustedData?.messageBytes || "", "hex")
    );
    const result = await client.validateMessage(frameMessage);
    if (result.isOk() && result.value.valid) {
      validatedMessage = result.value.message;
    }

    // Also validate the frame url matches the expected url
    let urlBuffer = validatedMessage?.data?.frameActionBody?.url || [];
    const urlString = Buffer.from(urlBuffer).toString("utf-8");
    if (!urlString.startsWith(process.env["HOST"] || "")) {
      throw new Error(`Invalid frame url: ${urlBuffer}`);
    }
  } catch (e) {
    throw new Error(`Failed to validate message: ${e}`);
  }

  console.log(validatedMessage);

  const buttonId = validatedMessage?.data?.frameActionBody?.buttonIndex || 0;
  const fid = validatedMessage?.data?.fid || 0;

  const INCORRECT_IMAGE_URL =
    "https://t4.ftcdn.net/jpg/03/87/37/09/360_F_387370928_uxePPpjy9FtcCCU3oTjHbPsKjl36mOaX.jpg";

  const CORRECT_IMAGE_URL =
    "https://i.pinimg.com/originals/fd/d0/0e/fdd00eff2cfe977daed3584f56eafbc9.gif";

  let html = "";
  if (buttonId === 3) {
    html =
      `<!DOCTYPE html><html><head>` +
      `<meta property="fc:frame" content="vNext" />` +
      `<meta property="fc:frame:image" content="${CORRECT_IMAGE_URL}" />` +
      `<meta property="fc:frame:button:1" content="Next" />` +
      `<meta property="fc:frame:post_url" content="${END_URL}" />` +
      `</head></html>`;
  } else {
    html =
      `<!DOCTYPE html><html><head>` +
      `<meta property="fc:frame" content="vNext" />` +
      `<meta property="fc:frame:image" content="${INCORRECT_IMAGE_URL}" />` +
      `<meta property="fc:frame:button:1" content="Try Again" />` +
      `<meta property="fc:frame:post_url" content="${Q3_URL}" />` +
      `</head></html>`;
  }

  return new Response(html, { headers: { "Content-Type": "text/html" } });
}

export const dynamic = "force-dynamic";
