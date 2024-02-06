import { NextRequest, NextResponse } from "next/server";
import { Message, getSSLHubRpcClient } from "@farcaster/hub-nodejs";
import { FrameRequest } from "../../types/farcasterTypes";

const POST_URL =
  "https://stand-with-crypto-quiz-frame.vercel.app/api/q3-answer";
const VISIT_URL = "https://stand-with-crypto-quiz-frame.vercel.app/api/frame";
const TOGGLE_URL = "https://stand-with-crypto-quiz-frame.vercel.app/api/toggle";
const Q2_URL = "https://stand-with-crypto-quiz-frame.vercel.app/api/q2";
const Q3_IMAGE_URL = "https://stand-with-crypto-quiz-frame.vercel.app/jobs.png";

export async function POST(req: NextRequest, res: NextResponse) {
  console.log("POST received at /api/q3");

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
    `<meta property="fc:frame:image" content="${Q3_IMAGE_URL}" />` +
    `<meta property="fc:frame:button:1" content="100k" />` +
    `<meta property="fc:frame:button:2" content="2M" />` +
    `<meta property="fc:frame:button:3" content="4M" />` +
    `<meta property="fc:frame:button:4" content="7M" />` +
    `<meta property="fc:frame:post_url" content="${POST_URL}" />` +
    `</head></html>`;

  return new Response(html, { headers: { "Content-Type": "text/html" } });
}

export const dynamic = "force-dynamic";
