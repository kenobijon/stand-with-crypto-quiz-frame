import { NextRequest, NextResponse } from "next/server";
import { Message, getSSLHubRpcClient } from "@farcaster/hub-nodejs";
import { FrameRequest } from "../../types/farcasterTypes";

// const POST_URL = "https://keiretsu-frame-airdrop.vercel.app/api/frame";
const VISIT_URL = "https://keiretsu-frame-airdrop.vercel.app/api/frame";
const TOGGLE_URL = "https://keiretsu-frame-airdrop.vercel.app/api/toggle";
const POST_URL = "https://keiretsu-frame-airdrop.vercel.app/api/q2-answer";
const Q2_IMAGE_URL = "https://keiretsu-frame-airdrop.vercel.app/g20-q.png";

export async function POST(req: NextRequest, res: NextResponse) {
  console.log("POST received at /api/q2");

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

  let html =
    `<!DOCTYPE html><html><head>` +
    `<meta property="fc:frame" content="vNext" />` +
    `<meta property="fc:frame:image" content="${Q2_IMAGE_URL}" />` +
    `<meta property="fc:frame:button:1" content="25%" />` +
    `<meta property="fc:frame:button:2" content="52%" />` +
    `<meta property="fc:frame:button:3" content="67%" />` +
    `<meta property="fc:frame:button:4" content="83%" />` +
    `<meta property="fc:frame:post_url" content="${POST_URL}" />` +
    `</head></html>`;

  return new Response(html, { headers: { "Content-Type": "text/html" } });
}

export const dynamic = "force-dynamic";
