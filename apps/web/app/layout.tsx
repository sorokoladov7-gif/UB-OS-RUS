import type { Metadata } from "next";
export const metadata: Metadata = { title: "UB OS-RUS", description: "Universal Business Operating System" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ru"><body>{children}</body></html>; }
