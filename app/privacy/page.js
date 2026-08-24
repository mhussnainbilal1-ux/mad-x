export const metadata = { title: "Privacy Policy" };
export default function Page() {
  return (
    <main>
      <section className="pageHero"
       style={{
        background: `
        linear-gradient(
          90deg,
          rgba(6, 17, 32, 0.98) 0%,
          rgba(6, 17, 32, 0.75) 35%,
          rgba(6, 17, 32, 0.35) 70%,
          rgba(6, 17, 32, 0) 100%
        ),
          url("/images/factory/banner-faq.png") center/cover no-repeat
        `,
        minHeight:"500px"
      }}
      >
        <div className="shell">
          <h1>Privacy Policy</h1>
          <p>
            Template content for your website. Review with a qualified
            professional before publishing.
          </p>
        </div>
      </section>
      <section className="section">
        <article className="shell legal">
          <h2>Information we collect</h2>
          <p>
            We may collect contact details, company information and product
            requirements submitted through website forms.
          </p>
          <h2>How information is used</h2>
          <p>
            Information may be used to respond to inquiries, prepare quotations,
            manage sampling and production discussions, and improve our
            services.
          </p>
          <h2>Data sharing</h2>
          <p>
            We do not sell personal data. Information may be shared with service
            providers where necessary to operate the website or fulfill business
            requests.
          </p>
          <h2>Website analytics</h2>
          <p>
            We may use Google Analytics to understand website visits, traffic
            sources, device categories and interactions with our pages. We do
            not send names, email addresses, messages or uploaded files to
            Google Analytics.
          </p>
          <h2>Private catalogue access</h2>
          <p>
            When a private catalogue key is used, we may record its usage time,
            approximate city, region and country, an anonymized network
            identifier, and basic browser information for access security and
            auditing. Where hosting location headers are unavailable, the
            network address may be sent to an IP-geolocation provider to obtain
            an approximate location. Access keys are protected with hashing and
            encryption and are available only through the authenticated
            administration area.
          </p>
          <h2>Contact</h2>
          <p>For privacy questions, contact admin.madx@gmail.com.</p>
        </article>
      </section>
    </main>
  );
}
