import type { Metadata } from "next";
import { Open_Sans, Quicksand } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { Toaster } from "@/components/ui/sonner";

const openSans = Open_Sans({
  subsets: ["latin", "vietnamese"],
  variable: "--font-open-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const quicksand = Quicksand({
  subsets: ["latin", "vietnamese"],
  variable: "--font-quicksand",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "Verendar - Quan ly xe ca nhan thong minh",
  description:
    "Verendar la app quan ly xe ca nhan, nhac nho thay the phu tung va dieu huong den garage gan nhat qua map.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${openSans.variable} ${quicksand.variable}`} suppressHydrationWarning>
      <body>
        <Providers>
          {children}
          <Toaster position="bottom-center" richColors closeButton />
        </Providers>
      </body>
    </html>
  );
}
