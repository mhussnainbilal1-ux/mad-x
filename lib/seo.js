const fallbackSiteUrl = "https://madxsports.com";

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || fallbackSiteUrl
).replace(/\/$/, "");

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteUrl}/#organization`,
  name: "MADX Sports",
  url: siteUrl,
  logo: `${siteUrl}/images/common/logo2.png`,
  email: "admin.madx@gmail.com",
  telephone: "+92 304 4989753",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Sialkot",
    addressRegion: "Punjab",
    addressCountry: "PK",
  },
};
