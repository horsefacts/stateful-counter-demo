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
  let state: State;
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
        <div
          style={{
            color: "white",
            fontStyle: "normal",
            letterSpacing: "-0.025em",
            lineHeight: 1.4,
            marginTop: 10,
            padding: "0 120px",
            whiteSpace: "pre-wrap",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h1 style={{ fontSize: 200 }}>{state.count}</h1>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 36, marginLeft: 150 }}>
            {JSON.stringify(state, null, 2)}
          </div>
        </div>
      </Card>
    ),
    {
      width: 800,
      height: 420,
    }
  );
}
