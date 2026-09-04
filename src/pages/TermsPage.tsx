// Plain-language terms shown at signup and linked from the agreement
// checkbox there (see SignupPage.tsx). Not a substitute for a lawyer-drafted
// policy before a real public launch — this exists so the marketing-email
// consent bundled into account creation is actually disclosed somewhere,
// not just implied by a checkbox label.
export function TermsPage() {
  return (
    <div className="page">
      <h1>Terms & Conditions</h1>
      <p>Last updated: {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long" })}</p>

      <h2>Your account</h2>
      <p>
        You need an account to browse the shop, use the cart, and place orders. You're responsible for
        keeping your password private and for what happens under your account.
      </p>

      <h2>Orders and payment</h2>
      <p>
        Zuri Express currently accepts bank transfer and cash on delivery — there's no card payment yet.
        An order is confirmed once we've verified your payment.
      </p>

      <h2>Emails from us</h2>
      <p>
        By creating an account, you agree to receive emails related to your account and orders (like
        email verification, order confirmations, and delivery updates), as well as occasional
        promotional emails from Zuri Express about new products, restocks, and offers.
      </p>
      <p>
        Every promotional email includes an unsubscribe link — using it stops future promotional emails
        at any time. Account and order emails aren't affected, since those relate directly to using the
        service.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms as the store grows. Continuing to use Zuri Express after a change means
        you accept the update.
      </p>
    </div>
  );
}
