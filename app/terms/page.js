export const metadata = { title: "Terms" };
export default function Page() {
  return (
    <main>
      <section className="pageHero">
        <div className="shell">
          <h1>Website Terms</h1>
          <p>
            Template content for your website. Review with a qualified
            professional before publishing.
          </p>
        </div>
      </section>
      <section className="section">
        <article className="shell legal">
          <h2>Website information</h2>
          <p>
            Product details, lead times, MOQs and capabilities shown on this
            website are indicative and subject to written quotation and
            confirmation.
          </p>
          <h2>Intellectual property</h2>
          <p>
            Customers are responsible for ensuring they have permission to use
            all logos, artwork and protected product designs submitted for
            manufacturing.
          </p>
          <h2>Quotations and orders</h2>
          <p>
            No website submission creates a binding order. Commercial terms are
            established through written quotations, invoices and order
            confirmations.
          </p>
          <h2>Limitation</h2>
          <p>Website content may be updated or corrected without notice.</p>
        </article>
      </section>
    </main>
  );
}
