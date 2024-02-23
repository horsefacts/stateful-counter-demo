import { Metadata } from "next";

const HOST = process.env["HOST"] ?? "https://example.com";

const postUrl = `${HOST}/api/count`;

export async function generateMetadata(): Promise<Metadata> {
  const imageUrl = `${HOST}/api/images/count`;
  return {
    title: "Stateful Counter",
    description: "A stateful counter demo",
    openGraph: {
      title: "Stateful Counter",
      images: [imageUrl],
    },
    other: {
      "fc:frame": "vNext",
      "fc:frame:image": imageUrl,
      "fc:frame:post_url": postUrl,
      "fc:frame:button:1": "+",
    },
  };
}

export default function Home() {
  return (
    <main className="flex flex-col text-center lg:p-16">
      <h1>Stateful Counter Demo</h1>
    </main>
  );
}
