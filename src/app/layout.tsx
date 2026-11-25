import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import localFont from "next/font/local";
import AuthProvider from "@providers/Auth";
import QueryClientProviderApp from "@providers/QueryClientApp";

// Fontes hospedadas no projeto (src/app/fonts, subset latin, licença OFL) em vez de next/font/google.
// O next/font/google baixa o CSS do Google Fonts a cada build, e quando o Google devolve uma URL de
// arquivo sem extensão o loader do Next 14 quebra com "Cannot read properties of null (reading '1')".
// Os argumentos precisam ser literais: o next/font os avalia na compilação.
const barlow = localFont({
  src: [
    { path: "./fonts/barlow-100.woff2", weight: "100", style: "normal" },
    { path: "./fonts/barlow-200.woff2", weight: "200", style: "normal" },
    { path: "./fonts/barlow-300.woff2", weight: "300", style: "normal" },
    { path: "./fonts/barlow-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/barlow-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/barlow-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/barlow-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/barlow-800.woff2", weight: "800", style: "normal" },
    { path: "./fonts/barlow-900.woff2", weight: "900", style: "normal" }
  ],
  fallback: ["system-ui", "arial"],
  variable: "--font-family-barlow"
});
const unbounded = localFont({
  src: "./fonts/unbounded-variable.woff2",
  weight: "200 900",
  fallback: ["system-ui", "arial"],
  variable: "--font-family-unbounded"
});
const workSans = localFont({
  src: "./fonts/work-sans-variable.woff2",
  weight: "100 900",
  fallback: ["system-ui", "arial"],
  adjustFontFallback: false,
  variable: "--font-family-workSans"
});

export const viewport = {
  width: "device-width",
  initialScale: 1
};

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
    <html
      lang="pt-br"
      className={`${workSans.variable} ${barlow.variable} ${unbounded.variable}`}
    >
      <QueryClientProviderApp>
        <head>
          <link
            rel="shortcut icon"
            href="sicol-logo.svg"
            type="image/svg+xml"
          />
        </head>
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
