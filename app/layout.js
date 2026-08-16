import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
