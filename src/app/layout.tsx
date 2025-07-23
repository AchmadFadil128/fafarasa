import { ReactNode } from "react";
import { metadata } from "./metadata";
import ClientLayout from "./ClientLayout";

export { metadata };

export default function RootLayout({ children }: { children: ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>;
}