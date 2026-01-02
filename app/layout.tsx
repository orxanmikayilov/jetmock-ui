import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "../app/components/ClientLayout";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Mock API Server",
    description: "Advanced Mock Server Dashboard",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body className={`${inter.className} bg-[#0b1121] text-white`}>
        <Toaster position="top-right" />
        <ClientLayout>
            {children}
        </ClientLayout>
        </body>
        </html>
    );
}