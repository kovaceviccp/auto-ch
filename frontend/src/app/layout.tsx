import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Providers } from "@/components/Providers";
import { ToastProvider } from "@/context/ToastContext";
import { NotificationInit } from "@/components/ui/NotificationInit";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { CompareBar } from "@/components/listings/CompareBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AutoCH - Fahrzeuge kaufen und verkaufen in der Schweiz",
  description: "Die grösste Fahrzeugbörse der Schweiz. Autos, Lastwagen, Lieferwagen kaufen und verkaufen.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <ToastProvider>
            <NotificationInit />
            <Navbar />
            <main className="pb-0">{children}</main>
            <ScrollToTop />
            <CompareBar />
            <footer className="bg-gray-900 text-gray-400 py-12 mt-16">
              <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                  <h3 className="text-white font-semibold mb-3">AutoCH</h3>
                  <p className="text-sm">Die Schweizer Fahrzeugbörse</p>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-3">Fahrzeuge</h3>
                  <ul className="text-sm space-y-1">
                    <li>Personenwagen</li>
                    <li>Lieferwagen</li>
                    <li>Lastwagen</li>
                    <li>Busse</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-3">Konto</h3>
                  <ul className="text-sm space-y-1">
                    <li>Anmelden</li>
                    <li>Registrieren</li>
                    <li>Inserat aufgeben</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-3">Info</h3>
                  <ul className="text-sm space-y-1">
                    <li>Über uns</li>
                    <li>Kontakt</li>
                    <li>Datenschutz</li>
                    <li>AGB</li>
                  </ul>
                </div>
              </div>
              <div className="text-center text-sm mt-8 border-t border-gray-700 pt-8">
                © 2024 AutoCH. Alle Rechte vorbehalten.
              </div>
            </footer>
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
