import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../src/style.css";
import { themeBootstrapScript, themeColors } from "../src/theme";

export const metadata: Metadata = {
  title: "Schema Studio",
  description: "Edit DBML and export database diagrams as PNG or JPG.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="theme-color"
          content={themeColors.light}
          suppressHydrationWarning
        />
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body className="overflow-hidden bg-ui-canvas font-ui text-ui-size/[normal] text-ui-ink">
        {children}
      </body>
    </html>
  );
}
