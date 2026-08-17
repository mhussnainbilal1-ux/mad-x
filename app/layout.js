import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { hasCatalogueAccess } from "@/lib/catalogue-access";

export const metadata = {
  title: {
    default: "MADX Sports | OEM Combat Sports Manufacturer",
    template: "%s | MADX Sports",
  },
  description:
    "OEM and private-label MMA, boxing, BJJ and fitness gear manufacturer in Sialkot, Pakistan.",
  icons: {
    icon: "/images/common/favicon.png",
    shortcut: "/images/common/favicon.png",
    apple: "/images/common/favicon.png",
  },
};

export default async function RootLayout({ children }) {
  const hasAccess = await hasCatalogueAccess();

  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>
        <Header hasCatalogueAccess={hasAccess} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
