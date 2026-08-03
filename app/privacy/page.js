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
          <h2>Contact</h2>
          <p>For privacy questions, contact sales@MADX.com.</p>
        </article>
      </section>
    </main>
  );
}
