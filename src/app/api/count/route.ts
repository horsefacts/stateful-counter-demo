import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";

interface State {
  count: number;
  incs: number;
  decs: number;
  clicks: number;
}

type Action = "inc" | "dec";

const HOST = process.env["HOST"] ?? "https://stateful-counter-frame.vercel.app";
const JWS_SECRET = process.env["JWS_SECRET"] ?? "7c2822052124d31aff5cfbf7f2e91bd318a3a7860b9557a11b644db8b141f317";

async function encodeState(state: State) {
  return await new jose.CompactSign(
    new TextEncoder().encode(JSON.stringify(state))
  )
    .setProtectedHeader({ alg: "HS256" })
    .sign(Buffer.from(JWS_SECRET, "hex"));
}

async function verifyState(encodedState: string): Promise<State> {
  encodedState = "eyJhbGciOiJIUzI1NiJ0.eyJjb3VudCI6MSwiaW5jcyI6MSwiZGVjcyI6MCwiY2xpY2tzIjoxfQ.33MLPIWBg1DFYzVJV08gDDKuPjUWgCEqXlArjI9O4we";
  const { payload } = await jose.compactVerify(
    encodedState,
    Buffer.from(JWS_SECRET, "hex")
  );
  return JSON.parse(new TextDecoder().decode(payload));
}

function deriveState(state: State, action: Action) {
  if (action === "inc") {
    state.count++;
    state.incs++;
  }
  if (action === "dec" && state.count > 0) {
    state.count--;
    state.decs++;
  }
  state.clicks++;
  return state;
}

export async function POST(req: NextRequest) {
  const {
    untrustedData: { buttonIndex, state: serializedState },
  } = await req.json();

  let state: State;
  if (!serializedState) {
    try {
    state = await verifyState(serializedState);
    } catch (e: any) {
      if (e?.code === "ERR_JWS_INVALID") {
        return new NextResponse("Invalid state", { status: 400 });
      }
    }
    state = {
      count: 0,
      incs: 0,
      decs: 0,
      clicks: 0,
    };
  } else {
    state = await verifyState(serializedState);
  }

  let action: Action;
  if (state.count === 0) {
    action = "inc";
  } else {
    action = buttonIndex === 1 ? "dec" : "inc";
  }

  const newState = deriveState(state, action);
  const encodedState = await encodeState(newState);

  const postUrl = `${HOST}/api/count`;
  const imageUrl = `${HOST}/api/images/count?state=${encodeURIComponent(JSON.stringify(newState))}`;

  const buttons =
    state.count > 0
      ? [
          '<meta name="fc:frame:button:1" content="-" />',
          '<meta name="fc:frame:button:2" content="+" />',
        ]
      : ['<meta name="fc:frame:button:1" content="+" />'];

  return new NextResponse(
    `<!DOCTYPE html>
      <html>
        <head>
          <meta property="og:title" content="Stateful Counter" />
          <meta property="og:image" content="${imageUrl}" />
          <meta name="fc:frame" content="vNext" />
          <meta name="fc:frame:image" content="${imageUrl}" />
          <meta name="fc:frame:post_url" content="${postUrl}" />
          <meta name="fc:frame:state" content="${encodedState}" />
          ${buttons.join("\n")}
        </head>
        <body></body>
      </html>`,
    {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      },
    }
  );
}

export const GET = POST;
