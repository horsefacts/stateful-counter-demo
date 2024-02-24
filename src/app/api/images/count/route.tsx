import { ImageResponse } from "next/og";
import Card from "@/app/components/Card";
import { NextRequest } from "next/server";

interface State {
  count: number;
  incs: number;
  decs: number;
  clicks: number;
}

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const serializedState = searchParams.get("state");
  let state : State;
  if (serializedState) {
    state = JSON.parse(serializedState);
  } else {
    state = {
      count: 0,
      incs: 0,
      decs: 0,
      clicks: 0,
    };
  }
  return new ImageResponse(
    (
      <Card>
        <h1 style={{ color: "#8a63d2", fontSize: 96 }}>{state.count}</h1>
        <div style={{ display: "flex" }}>
          {JSON.stringify(state, null, 2)}
        </div>
      </Card>
    ),
    {
      width: 800,
      height: 420,
    },
  );
}
