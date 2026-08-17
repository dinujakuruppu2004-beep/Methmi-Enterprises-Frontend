import Script from "next/script";
import { siteConfig } from "@/lib/site-config";

export default function GoogleAnalytics() {
  const id = siteConfig.gaMeasurementId;

  // Renders nothing (and breaks nothing) when no Measurement ID is set.
  if (!id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}');
        `}
      </Script>
    </>
  );
}
