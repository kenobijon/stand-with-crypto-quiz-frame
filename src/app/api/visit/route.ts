import { NextRequest, NextResponse } from "next/server";
import { Message, getSSLHubRpcClient } from "@farcaster/hub-nodejs";
import { FrameRequest } from "../../types/farcasterTypes";

const POST_URL = "https://stand-with-crypto-quiz-frame.vercel.app/api/visit";
const VISIT_URL = "https://stand-with-crypto-quiz-frame.vercel.app/api/visit";
const TOGGLE_URL = "https://stand-with-crypto-quiz-frame.vercel.app/api/toggle";

export async function POST(req: NextRequest, res: NextResponse) {
  console.log("POST received at /api/visit");

  const HUB_URL = process.env["HUB_URL"] || "nemes.farcaster.xyz:2283";
  const client = getSSLHubRpcClient(HUB_URL);
  let validatedMessage: Message | undefined = undefined;
  try {
    const body: FrameRequest = await req.json();
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

  console.log(`Pressed button ${buttonId} with fid ${fid}`);

  const INCORRECT_IMAGE_URL =
    "https://t4.ftcdn.net/jpg/03/87/37/09/360_F_387370928_uxePPpjy9FtcCCU3oTjHbPsKjl36mOaX.jpg";

  const CORRECT_IMAGE_URL =
    "https://i.pinimg.com/originals/fd/d0/0e/fdd00eff2cfe977daed3584f56eafbc9.gif";

  let html = "";
  if (buttonId === 1) {
    html =
      `<!DOCTYPE html><html><head>` +
      `<meta property="fc:frame" content="vNext" />` +
      `<meta property="fc:frame:image" content="${INCORRECT_IMAGE_URL}" />` +
      `<meta property="fc:frame:button:1" content="5 Million" />` +
      `<meta property="fc:frame:button:2" content="25 Million" />` +
      `<meta property="fc:frame:button:3" content="52 Million" />` +
      `<meta property="fc:frame:button:4" content="74 Million" />` +
      `<meta property="fc:frame:input:text"/>` +
      `<meta property="fc:frame:post_url" content="${POST_URL}" />` +
      `</head></html>`;
  } else if (buttonId === 2) {
    html =
      `<!DOCTYPE html><html><head>` +
      `<meta property="fc:frame" content="vNext" />` +
      `<meta property="fc:frame:image" content="${INCORRECT_IMAGE_URL}" />` +
      `<meta property="fc:frame:button:1" content="5 Million" />` +
      `<meta property="fc:frame:button:2" content="25 Million" />` +
      `<meta property="fc:frame:button:3" content="52 Million" />` +
      `<meta property="fc:frame:button:4" content="74 Million" />` +
      `<meta property="fc:frame:post_url" content="${POST_URL}" />` +
      `</head></html>`;
  } else if (buttonId === 3) {
    html =
      `<!DOCTYPE html><html><head>` +
      `<meta property="fc:frame" content="vNext" />` +
      `<meta property="fc:frame:image" content="${CORRECT_IMAGE_URL}" />` +
      `<meta property="fc:frame:button:1" content="Visit Stand With Crypto!" />` +
      `<meta property="fc:frame:post_url" content="${VISIT_URL}" />` +
      `</head></html>`;
  } else if (buttonId === 4) {
    html =
      `<!DOCTYPE html><html><head>` +
      `<meta property="fc:frame" content="vNext" />` +
      `<meta property="fc:frame:image" content="${INCORRECT_IMAGE_URL}" />` +
      `<meta property="fc:frame:button:1" content="5 Million" />` +
      `<meta property="fc:frame:button:2" content="25 Million" />` +
      `<meta property="fc:frame:button:3" content="52 Million" />` +
      `<meta property="fc:frame:button:4" content="74 Million" />` +
      `<meta property="fc:frame:post_url" content="${POST_URL}" />` +
      `</head></html>`;
  }

  return new Response(html, { headers: { "Content-Type": "text/html" } });
}

export const dynamic = "force-dynamic";
