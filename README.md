# MADX Sports — Next.js Manufacturer Website

A complete quotation-only website for an MMA, boxing, BJJ and fitness gear manufacturer. Customers can browse products and submit inquiries, but cannot place online orders.

## Pages

- Home
- Products catalogue
- Dynamic product detail pages
- About
- Wholesale / Private Label
- Factory Tour
- Gallery
- Insights / Blog
- FAQ
- Contact
- Request a Quote
- Privacy Policy
- Terms

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Google Analytics 4

Copy the four GA4 values from `.env.example` into `.env.local` for development
and into your hosting provider's environment settings for production. The
service-account email must have Viewer access to the GA4 property, and the
Google Analytics Data API must be enabled in its Google Cloud project.

Tracking remains disabled if `NEXT_PUBLIC_GA_MEASUREMENT_ID` is empty. The
protected `/dashboard/analytics` report shows setup guidance until all three
server reporting credentials are present.

## Before launch

1. Replace demo company name, email, phone and address.
2. Replace Unsplash demo images with your own product and factory photography.
3. Connect `components/InquiryForm.js` to your .NET API, email service or CRM.
4. Review Privacy and Terms pages with a qualified professional.
5. Add your real domain and GA4 credentials.

## CRM email campaigns

CRM campaigns can send through Gmail SMTP or the Resend HTTP API. Gmail is used
when both Gmail variables are present. Configure a Google App Password, not the
account's normal password:

```bash
GMAIL_USER=youraddress@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
CAMPAIGN_FROM_NAME="Madx Sports"
CAMPAIGN_REPLY_TO=youraddress@gmail.com
```

Alternatively, configure Resend:

```bash
RESEND_API_KEY=...
CAMPAIGN_FROM_EMAIL="Madx Sports <sales@your-verified-domain.com>"
CAMPAIGN_REPLY_TO=sales@your-verified-domain.com
```

`RESEND_FROM_EMAIL` is also accepted as a fallback for the sender. The sending
domain must be verified with Resend. Draft campaigns can be created and reviewed
without email-provider configuration.
