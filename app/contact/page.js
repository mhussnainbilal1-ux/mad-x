import InquiryForm from "@/components/InquiryForm";
export const metadata = { title: "Contact" };
export default function Page() {
  return (
    <main>
      <section className="pageHero">
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
              <span>sales@ironcladfightwear.com</span>
            </div>
            <div className="contactCard">
              <b>WhatsApp</b>
              <span>+92 300 0000000</span>
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
          <InquiryForm />
        </div>
      </section>
    </main>
  );
}
