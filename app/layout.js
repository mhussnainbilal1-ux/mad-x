import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: {
    default: "Ironclad Fightwear | OEM Combat Sports Manufacturer",
    template: "%s | Ironclad Fightwear",
  },
  description:
    "OEM and private-label MMA, boxing, BJJ and fitness gear manufacturer in Sialkot, Pakistan.",
};

const themeScript = `
(function () {
  try {
    var saved = localStorage.getItem('ironclad-theme');
    var theme = saved === 'light' || saved === 'dark' ? saved : 'dark';
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch (e) {
    document.documentElement.dataset.theme = 'dark';
    document.documentElement.style.colorScheme = 'dark';
  }
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
