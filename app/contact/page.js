import InquiryForm from "@/components/InquiryForm";
export const metadata = {
  title: "Contact",
  description:
    "Contact the MADX Sports manufacturing team in Sialkot to discuss product development, sampling, private labeling and quotations.",
  alternates: { canonical: "/contact" },
};
export default function Page() {
  return (
    <main>
      <section
        className="pageHero"
        style={{
          background: `
        linear-gradient(
          90deg,
          rgba(6, 17, 32, 0.98) 0%,
          rgba(6, 17, 32, 0.75) 35%,
          rgba(6, 17, 32, 0.35) 70%,
          rgba(6, 17, 32, 0) 100%
        ),
          url("/images/factory/banner-contact.png") center/cover no-repeat
        `,
          minHeight: "500px",
        }}
      >
        <div className="shell">
          <span className="kicker">CONTACT</span>
          <h1>Let’s discuss your product range.</h1>
          <p>
            Send your requirements and we will help organize the next steps for
            sampling or quotation.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="shell formLayout">
          <div>
            <span className="kicker dark">Business inquiries</span>
            <h2>Speak with our manufacturing team</h2>
            <div className="contactCard">
              <b>Email</b>
               <span>admin.madx@gmail.com</span>
            </div>
            <div className="contactCard">
              <b>WhatsApp</b>
              <span>+92 304 4989753</span>
            </div>
            <div className="contactCard">
              <b>Location</b>
              <span>Sialkot, Punjab, Pakistan</span>
            </div>
            <div className="contactCard">
              <b>Business hours</b>
              <span>Monday–Saturday, 9:00–18:00 PKT</span>
            </div>
          </div>
          <InquiryForm source="Contact Us" />
        </div>
      </section>
    </main>
  );
}
