import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getCatalogueAccess } from "@/lib/catalogue-access";
import { ProductListProvider } from "@/components/ProductListProvider";
import ProductOptionsModal from "@/components/ProductOptionsModal";
import ProductListDrawer from "@/components/ProductListDrawer";

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
  const access = await getCatalogueAccess();

  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>
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
