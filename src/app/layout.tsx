import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
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
    <html lang="fr">
      <body className="antialiased bg-[#F6F4F1]">
        <AuthProvider>
          <Header />
          {children}
          <CookieBanner />
        </AuthProvider>
      </body>
    </html>
  );
}
