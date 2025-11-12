import type { Metadata } from "next"
import localFont from "next/font/local"
import { Analytics as VercelAnalytics } from "@vercel/analytics/next"
import Script from "next/script"
import "./globals.css"

const toyotaFont = localFont({
  src: [
    { path: "./fonts/ToyotaType-Light.ttf", weight: "300", style: "normal" },
    { path: "./fonts/ToyotaType-Book.ttf", weight: "400", style: "normal" },
    { path: "./fonts/ToyotaType-BookIt.ttf", weight: "400", style: "italic" },
    { path: "./fonts/ToyotaType-Semibold.ttf", weight: "600", style: "normal" },
    { path: "./fonts/ToyotaType-SemiboldIt.ttf", weight: "600", style: "italic" },
    { path: "./fonts/ToyotaType-Bold.ttf", weight: "700", style: "normal" },
    { path: "./fonts/ToyotaType-BoldIt.ttf", weight: "700", style: "italic" },
  ],
  variable: "--font-toyota",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "sans-serif"],
})

export const metadata: Metadata = {
  title: "Toyota Drumtao",
  description: "An exciting microsite experience by Toyota.",
  generator: "Craftech360",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID

  return (
    <html lang="en">
      <head>
        {/* ✅ Google Analytics (GA4) */}
        {GA_ID && (
          <>
            {/* Load GA script */}
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            />
            {/* Init GA */}
            <Script
              id="gtag-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
      </head>
      <body className={`${toyotaFont.variable} font-sans antialiased`}>
        {children}
        {/* ✅ Vercel Analytics still works */}
        <VercelAnalytics />
      </body>
    </html>
  )
}
