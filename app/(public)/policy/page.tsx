import PolicyAcceptance from "./PolicyAcceptance";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Privacy Policy | Verse AI",
  description: "Privacy Policy for Verse AI SaaS Platform",
};

const PrivacyPolicyPage = () => {
  const effectiveDate = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Privacy Policy
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
                This policy explains how Verse AI collects, uses, and protects
                data when you use our Services.
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm text-white/80">
              <span className="text-white/60">Effective</span>
              <span className="font-medium">{effectiveDate}</span>
            </div>
          </div>
        </header>

        <div className="mt-8 space-y-6">
          {/* 1. Introduction */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
            <h2 className="text-lg font-semibold sm:text-xl">
              1. Introduction
            </h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-white/80 sm:text-base">
              <p>
                Verse AI (“we,” “our,” or “us”) is a Software-as-a-Service
                (SaaS) platform that enables business owners to connect their
                Facebook Pages, Instagram accounts, and WhatsApp Business
                accounts to automate customer conversations using AI-powered
                chatbots.
              </p>
              <p>
                This Privacy Policy explains how we collect, use, store, share,
                and protect information when you use Verse AI’s website,
                application, and services (collectively, the “Services”). By
                accessing or using Verse AI, you agree to this Privacy Policy.
              </p>
            </div>
          </section>

          {/* 2. Information We Collect */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
            <h2 className="text-lg font-semibold sm:text-xl">
              2. Information We Collect
            </h2>

            <h3 className="mt-5 text-sm font-semibold tracking-wide text-white sm:text-base">
              2.1 Information You Provide
            </h3>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-sm text-white/80 marker:text-white/30 sm:text-base">
              <li>
                <strong className="text-white">Account Information:</strong>{" "}
                name, email address, password, business name
              </li>
              <li>
                <strong className="text-white">Business Profile Data:</strong>{" "}
                company details, service descriptions, FAQs, documents, and
                knowledge-base content
              </li>
              <li>
                <strong className="text-white">Connected Account Data:</strong>{" "}
                Facebook Page ID, Instagram Business ID, WhatsApp Business
                Account ID, and access tokens
              </li>
              <li>
                <strong className="text-white">Billing Information:</strong>{" "}
                subscription status, invoices, and transaction metadata
                (payments handled by Stripe; no card data stored)
              </li>
              <li>
                <strong className="text-white">
                  Calendar Data (optional):
                </strong>
                appointment details synced via Google Calendar
              </li>
            </ul>

            <h3 className="mt-6 text-sm font-semibold tracking-wide text-white sm:text-base">
              2.2 Messages and Communication Data
            </h3>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-sm text-white/80 marker:text-white/30 sm:text-base">
              <li>Messages are received via official platform webhooks</li>
              <li>Used only to generate automated replies</li>
              <li>
                May include message text, timestamps, and sender identifiers
              </li>
              <li>
                We do not access private messages outside connected business
                accounts
              </li>
            </ul>

            <h3 className="mt-6 text-sm font-semibold tracking-wide text-white sm:text-base">
              2.3 Automatically Collected Data
            </h3>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-sm text-white/80 marker:text-white/30 sm:text-base">
              <li>IP address, device, and browser type</li>
              <li>Log files and usage analytics</li>
              <li>Cookies for authentication and performance</li>
            </ul>
          </section>

          {/* 3. How We Use Information */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
            <h2 className="text-lg font-semibold sm:text-xl">
              3. How We Use Information
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-sm text-white/80 marker:text-white/30 sm:text-base">
              <li>Operate and maintain the Verse AI platform</li>
              <li>Authenticate users and manage accounts</li>
              <li>Generate AI-powered automated responses</li>
              <li>Send and receive messages using official APIs</li>
              <li>Create appointment bookings and payment links</li>
              <li>Process subscriptions and billing</li>
              <li>Improve security, performance, and reliability</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          {/* 4. AI & Automated Decision-Making */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
            <h2 className="text-lg font-semibold sm:text-xl">
              4. AI &amp; Automated Decision-Making
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-sm text-white/80 marker:text-white/30 sm:text-base">
              <li>
                Automated responses use only business-provided knowledge bases
              </li>
              <li>
                Private conversations are not used for public or shared model
                training
              </li>
              <li>
                Business owners are responsible for accuracy and compliance of
                responses
              </li>
            </ul>
          </section>

          {/* 5. Meta Platform Data Usage */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
            <h2 className="text-lg font-semibold sm:text-xl">
              5. Meta Platform Data Usage (App Review Compliance)
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-sm text-white/80 marker:text-white/30 sm:text-base">
              <li>Access only after explicit authorization</li>
              <li>Used strictly for messaging automation</li>
              <li>No selling, renting, or misuse of Meta data</li>
              <li>No advertising or unrelated analytics</li>
              <li>Secure storage and revocation of access tokens</li>
              <li>Full compliance with Meta Developer Policies</li>
            </ul>
          </section>

          {/* 6. Data Sharing */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
            <h2 className="text-lg font-semibold sm:text-xl">
              6. Data Sharing
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
              We do not sell personal or platform data.
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-sm text-white/80 marker:text-white/30 sm:text-base">
              <li>Meta APIs (message delivery)</li>
              <li>Stripe (payments)</li>
              <li>Google Calendar (appointments)</li>
              <li>Cloud infrastructure providers</li>
              <li>Legal authorities if required</li>
              <li>Business transfers (merger or acquisition)</li>
            </ul>
          </section>

          {/* 7. Data Retention */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
            <h2 className="text-lg font-semibold sm:text-xl">
              7. Data Retention
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-sm text-white/80 marker:text-white/30 sm:text-base">
              <li>Data retained while the account is active</li>
              <li>Messages stored temporarily for processing and audits</li>
              <li>
                Data deleted upon account deletion unless legally required
              </li>
            </ul>
          </section>

          {/* 8. User Rights */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
            <h2 className="text-lg font-semibold sm:text-xl">8. User Rights</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-sm text-white/80 marker:text-white/30 sm:text-base">
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Request data deletion</li>
              <li>Restrict or object to processing</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
              Requests can be sent to{" "}
              <strong className="text-white">[your support email]</strong>.
            </p>
          </section>

          {/* 9–13 */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
            <h2 className="text-lg font-semibold sm:text-xl">
              9. Data Security
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
              We use encryption, secure APIs, access controls, and continuous
              monitoring. However, no system is 100% secure.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
            <h2 className="text-lg font-semibold sm:text-xl">
              10. Children’s Privacy
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
              Verse AI is not intended for users under 18.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
            <h2 className="text-lg font-semibold sm:text-xl">
              11. International Data Transfers
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
              Data may be processed outside your country in compliance with
              applicable laws.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
            <h2 className="text-lg font-semibold sm:text-xl">
              12. Changes to This Policy
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
              Updates will be posted on this page with a revised effective date.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
            <h2 className="text-lg font-semibold sm:text-xl">
              13. Contact Information
            </h2>
            <div className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
              <p>
                <strong className="text-white">Verse AI</strong>
                <br />
                Email: drzraju@gmail.com
                <br />
                Website: verseai.com
              </p>
            </div>
          </section>
        </div>

        <PolicyAcceptance />
      </main>
    </div>
  );
};

export default PrivacyPolicyPage;
