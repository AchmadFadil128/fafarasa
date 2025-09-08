import { ReactNode } from "react";
import { metadata } from "./metadata";
import ClientLayout from "./ClientLayout";
import Providers from "../components/Providers";

export { metadata };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <ClientLayout>{children}</ClientLayout>
    </Providers>
  );
}