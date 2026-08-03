import InquiryForm from "@/components/InquiryForm";
export const metadata = { title: "Request a Quote" };
export default function Page() {
  return (
    <main>
      <section className="pageHero wholesaleHero"
        style={{
          background: `
          linear-gradient(
            90deg,
            rgba(6, 17, 32, 0.98) 0%,
            rgba(6, 17, 32, 0.75) 35%,
            rgba(6, 17, 32, 0.35) 70%,
            rgba(6, 17, 32, 0) 100%
          ),
            url("/images/factory/banner-quote.png") center/cover no-repeat
          `,
          minHeight:"500px"
        }}
      >
        <div className="shell">
          <span className="kicker">REQUEST A QUOTE</span>
          <h1>Start your private-label project.</h1>
          <p>
            Provide as much detail as possible. Product references, artwork and
            tech packs can be discussed after your initial inquiry.
          </p>
        </div>
      </section>
      <section className="section cream">
        <div className="shell formLayout">
          <div>
            <span className="kicker dark">Before you submit</span>
            <h2>Information that improves quotation accuracy</h2>
            <ul className="checkList">
              <li>Product type and estimated order quantity</li>
              <li>Target materials and quality level</li>
              <li>Logo application and artwork requirements</li>
              <li>Sizes, colors and packaging needs</li>
              <li>Destination country and desired timeline</li>
            </ul>
          </div>
          <InquiryForm />
        </div>
      </section>
    </main>
  );
}
