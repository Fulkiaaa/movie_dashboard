import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});
import Header from "@/components/Header";
import CookieBanner from "@/components/CookieBanner";

export const metadata: Metadata = {
  title: "SeenIt - Votre dashboard de films",
  description: "Découvrez, swipez et gérez vos films préférés",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={outfit.variable}>
      <body className="antialiased">
        {/* Background orbs — donnent de la profondeur aux effets glass */}
        <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
          <div className="absolute inset-0 bg-[#F6F4F1]" />
          <div className="absolute -top-60 -right-60 w-[900px] h-[900px] rounded-full bg-[#F95C4B]/[0.09] blur-[130px]" />
          <div className="absolute -bottom-60 -left-60 w-[800px] h-[800px] rounded-full bg-[#D4A843]/[0.10] blur-[110px]" />
          <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] rounded-full bg-[#6B9472]/[0.07] blur-[90px]" />
          <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] rounded-full bg-[#F95C4B]/[0.05] blur-[100px]" />
        </div>
        <AuthProvider>
          <Header />
          {children}
          <CookieBanner />
        </AuthProvider>
      </body>
    </html>
  );
}
