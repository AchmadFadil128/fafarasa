import "./globals.css";
import { ReactNode } from "react";
import { metadata } from "./metadata";
import ClientLayout from "./ClientLayout";
import Providers from "../components/Providers";

export { metadata };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className="antialiased bg-white text-[#222222] min-h-screen">
        <Providers>
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
