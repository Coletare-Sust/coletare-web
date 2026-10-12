/** @type {import('next').NextConfig} */
/**
 * Headers de seguranca. A CSP esta em modo Report-Only de proposito: o app usa Google Maps,
 * Firebase e scripts inline do Next, e uma politica estrita sem observacao previa poderia
 * quebrar telas. Acompanhe os relatorios no console do navegador e, quando limpo, troque a
 * chave para "Content-Security-Policy".
 */
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.coletapp.com";
const apiOrigin = new URL(apiUrl).origin;
const wsOrigin = apiOrigin.replace(/^http/, "ws");

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://*.googleapis.com https://*.gstatic.com https://*.googleusercontent.com https://firebasestorage.googleapis.com https://storage.googleapis.com",
  `connect-src 'self' ${apiOrigin} ${wsOrigin} https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com`
].join("; ");

// Muda a cada build: invalida o cache do React Query persistido no navegador apos um deploy.
const buildId = process.env.NEXT_PUBLIC_BUILD_ID || new Date().toISOString();

const securityHeaders = [
  { key: "Content-Security-Policy-Report-Only", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self)"
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains"
  }
];

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/**"
      }
    ]
  },
  output: "standalone",
  env: {
    NEXT_PUBLIC_BUILD_ID: buildId
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders
      }
    ];
  }
};

module.exports = nextConfig;
