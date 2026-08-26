import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getCatalogueAccess } from "@/lib/catalogue-access";
import { ProductListProvider } from "@/components/ProductListProvider";
import ProductOptionsModal from "@/components/ProductOptionsModal";
import ProductListDrawer from "@/components/ProductListDrawer";
import { organizationJsonLd, siteUrl } from "@/lib/seo";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import VisitorActivityTracker from "@/components/VisitorActivityTracker";
import { headers } from "next/headers";
import {
  getVisitorLocation,
  isTrackableForeignVisitor,
} from "@/lib/visitor-location";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MADX Sports | OEM Combat Sports Manufacturer",
    template: "%s | MADX Sports",
  },
  description:
    "OEM and private-label MMA, boxing, BJJ and fitness gear manufacturer in Sialkot, Pakistan.",
  applicationName: "MADX Sports",
  authors: [{ name: "MADX Sports", url: siteUrl }],
  creator: "MADX Sports",
  publisher: "MADX Sports",
  keywords: [
    "combat sports manufacturer",
    "boxing equipment manufacturer",
    "MMA gear manufacturer",
    "private label sportswear",
    "OEM sports equipment",
    "Sialkot sports manufacturer",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "MADX Sports",
    title: "MADX Sports | OEM Combat Sports Manufacturer",
    description:
      "OEM and private-label MMA, boxing, BJJ and fitness gear manufacturer in Sialkot, Pakistan.",
    url: siteUrl,
    images: [
      {
        url: "/images/slider/slide1.png",
        alt: "MADX Sports private-label combat sports manufacturing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MADX Sports | OEM Combat Sports Manufacturer",
    description:
      "OEM and private-label MMA, boxing, BJJ and fitness gear manufacturer in Sialkot, Pakistan.",
    images: ["/images/slider/slide1.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/images/common/favicon.png",
    shortcut: "/images/common/favicon.png",
    apple: "/images/common/favicon.png",
  },
};

export default async function RootLayout({ children }) {
  const access = await getCatalogueAccess();
  const location = getVisitorLocation(await headers());
  const trackActivity = isTrackableForeignVisitor(location);

  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>
        <GoogleAnalytics />
        {trackActivity && <VisitorActivityTracker />}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <ProductListProvider canUseProductLists={access.hasAdminAccess}>
          <Header hasCatalogueAccess={access.hasCatalogueAccess} />
          {children}
          <Footer />
          {access.hasAdminAccess && (
            <>
              <ProductOptionsModal />
              <ProductListDrawer />
            </>
          )}
        </ProductListProvider>
      </body>
    </html>
  );
}
