import "./globals.css";
import { ReactNode } from "react";
import { metadata } from "./metadata";
import ClientLayout from "./ClientLayout";
import Providers from "../components/Providers";

export { metadata };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className="antialiased bg-gradient-to-br from-green-50 via-white to-emerald-50 text-gray-900 min-h-screen">
        <Providers>
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
