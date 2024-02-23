import { NextRequest, NextResponse } from "next/server";

interface State {
  count: number;
  incs: number;
  decs: number;
  clicks: number;
}

const HOST = process.env["HOST"] ?? "https://stateful-counter-demo.vercel.app";

function deriveState(serializedState: string | undefined, buttonIndex: number) {
  let state : State;
  if (!serializedState) {
    state = {
      count: 0,
      incs: 0,
      decs: 0,
      clicks: 0,
    };
  } else {
    state = JSON.parse(decodeURIComponent(serializedState));
  }
  if (buttonIndex === 1) {
    state.count++;
    state.incs++;
  }
  if (buttonIndex === 2) {
    state.count--;
    state.decs++;
  }
  state.clicks++;
  return state;
}

export async function POST(req: NextRequest) {
  const {
    untrustedData: { buttonIndex, state },
  } = await req.json();

  const newState = deriveState(state, buttonIndex);
  const postUrl = `${HOST}/api/count`;
  const imageUrl = `${HOST}/api/images/count?state=${encodeURIComponent(JSON.stringify(newState))}`;

  let buttons = [
    `<meta name="fc:frame:button:1" content="+" />`,
  ];

  if (newState.count > 0) {
    buttons.push(`<meta name="fc:frame:button:2" content="-" />`);
  }

  return new NextResponse(
    `<!DOCTYPE html>
      <html>
        <head>
          <meta property="og:title" content="Stateful Counter" />
          <meta property="og:image" content="${imageUrl}" />
          <meta name="fc:frame" content="vNext" />
          <meta name="fc:frame:image" content="${imageUrl}" />
          <meta name="fc:frame:post_url" content="${postUrl}" />
          <meta name="fc:frame:state" content="${encodeURIComponent(JSON.stringify(newState))}" />
          ${buttons.join("\n")}
        </head>
        <body></body>
      </html>`,
    {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      },
    },
  );

}

export const GET = POST;
