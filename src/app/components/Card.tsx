export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        alignItems: "center",
        background: "linear-gradient(to right, #432889, #17101F)",
        backgroundSize: "100% 100%",
        display: "flex",
        flexDirection: "column",
        flexWrap: "nowrap",
        height: "100%",
        justifyContent: "center",
        width: "100%",
      }}
    >
      {children}
    </div>
  );
}
