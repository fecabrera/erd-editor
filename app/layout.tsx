import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "../src/style.css";

export const metadata: Metadata = {
  title: "Schema Studio",
  description: "Edit DBML and export database diagrams as PNG or JPG.",
};

export const viewport: Viewport = { themeColor: "#ffffff" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="overflow-hidden bg-ui-canvas font-ui text-ui-size/[normal] text-ui-ink">
        {children}
      </body>
    </html>
  );
}
