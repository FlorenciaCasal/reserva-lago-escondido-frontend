import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ToastProvider } from "@/components/ui/Toast";
import Footer from "@/components/Footer";
import { Montserrat } from "next/font/google";
import MaintenancePage from "@/components/MaintenancePage";

export const metadata: Metadata = {
  title: "Reserva Natural Lago Escondido",
  description: "Reserva Natural Lago Escondido",
  metadataBase: new URL(process.env.APP_ORIGIN ?? "http://localhost:3000"),
};

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
});

const MAINTENANCE =
  process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  // ⛔ MODO MANTENIMIENTO
  if (MAINTENANCE) {
    return (
      <html lang="es" className={montserrat.variable}>
        <body className="min-h-dvh antialiased">
          <MaintenancePage />
        </body>
      </html>
    );
  }

  // ✅ SITIO NORMAL
  return (
    <html lang="es" className={montserrat.variable}>
      <body
        className="min-h-dvh flex flex-col antialiased">
        <ToastProvider>
          <Navbar />
          <main className="flex-1 min-h-0 flex flex-col">
            {children}
          </main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
