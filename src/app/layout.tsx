import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { Work_Sans as WorkSans, Barlow } from "next/font/google";
import "@/config/firebase";
import AuthProvider from "@providers/Auth";
import QueryClientProviderApp from "@providers/QueryClientApp";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  fallback: ["system-ui", "arial"],
  variable: "--font-family-barlow"
});
const workSans = WorkSans({
  subsets: ["latin"],
  fallback: ["system-ui", "arial"],
  adjustFontFallback: false,
  variable: "--font-family-workSans"
});

export const metadata = {
  title: "Coletapp",
  description: "Forma inovadora de coleta de lixo!"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br" className={`${workSans.variable} ${barlow.variable}`}>
      <QueryClientProviderApp>
        <AuthProvider>
          <body className={workSans.className}>
            <ToastContainer />
            {children}
          </body>
        </AuthProvider>
      </QueryClientProviderApp>
    </html>
  );
}
