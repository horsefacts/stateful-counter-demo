import { NextRequest, NextResponse } from "next/server";

interface State {
  count: number;
  incs: number;
  decs: number;
  clicks: number;
}

type Action = 'inc' | 'dec';

const HOST = process.env["HOST"] ?? "https://stateful-counter-frame.vercel.app";

function deriveState(state: State, action: Action) {
  if (action === 'inc') {
    state.count++;
    state.incs++;
  }
  if (action === 'dec' && state.count > 0) {
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

  let action : Action;
  if (state.count === 0) {
    action = 'inc';
  } else {
    action = buttonIndex === 1 ? 'dec' : 'inc';
  }

  const newState = deriveState(state, action);

  const postUrl = `${HOST}/api/count`;
  const imageUrl = `${HOST}/api/images/count?state=${encodeURIComponent(JSON.stringify(newState))}`;

  const buttons = (state.count > 0) ? [
    '<meta name="fc:frame:button:1" content="-" />',
    '<meta name="fc:frame:button:2" content="+" />',
  ] : [
    '<meta name="fc:frame:button:1" content="+" />',
  ];

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
