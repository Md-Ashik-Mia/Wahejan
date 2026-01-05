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
    <main className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">
        Effective Date: <strong>{effectiveDate}</strong>
      </p>

      {/* 1. Introduction */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
        <p>
          Verse AI (“we,” “our,” or “us”) is a Software-as-a-Service (SaaS)
          platform that enables business owners to connect their Facebook Pages,
          Instagram accounts, and WhatsApp Business accounts to automate customer
          conversations using AI-powered chatbots.
        </p>
        <p className="mt-2">
          This Privacy Policy explains how we collect, use, store, share, and
          protect information when you use Verse AI’s website, application, and
          services (collectively, the “Services”). By accessing or using Verse
          AI, you agree to this Privacy Policy.
        </p>
      </section>

      {/* 2. Information We Collect */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          2. Information We Collect
        </h2>

        <h3 className="font-semibold mt-4">2.1 Information You Provide</h3>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>
            <strong>Account Information:</strong> name, email address, password,
            business name
          </li>
          <li>
            <strong>Business Profile Data:</strong> company details, service
            descriptions, FAQs, documents, and knowledge-base content
          </li>
          <li>
            <strong>Connected Account Data:</strong> Facebook Page ID, Instagram
            Business ID, WhatsApp Business Account ID, and access tokens
          </li>
          <li>
            <strong>Billing Information:</strong> subscription status, invoices,
            and transaction metadata (payments handled by Stripe; no card data
            stored)
          </li>
          <li>
            <strong>Calendar Data (optional):</strong> appointment details synced
            via Google Calendar
          </li>
        </ul>

        <h3 className="font-semibold mt-4">
          2.2 Messages and Communication Data
        </h3>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Messages are received via official platform webhooks</li>
          <li>Used only to generate automated replies</li>
          <li>
            May include message text, timestamps, and sender identifiers
          </li>
          <li>
            We do not access private messages outside connected business accounts
          </li>
        </ul>

        <h3 className="font-semibold mt-4">
          2.3 Automatically Collected Data
        </h3>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>IP address, device, and browser type</li>
          <li>Log files and usage analytics</li>
          <li>Cookies for authentication and performance</li>
        </ul>
      </section>

      {/* 3. How We Use Information */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          3. How We Use Information
        </h2>
        <ul className="list-disc pl-6 space-y-1">
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
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          4. AI & Automated Decision-Making
        </h2>
        <ul className="list-disc pl-6 space-y-1">
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
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          5. Meta Platform Data Usage (App Review Compliance)
        </h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Access only after explicit authorization</li>
          <li>Used strictly for messaging automation</li>
          <li>No selling, renting, or misuse of Meta data</li>
          <li>No advertising or unrelated analytics</li>
          <li>Secure storage and revocation of access tokens</li>
          <li>Full compliance with Meta Developer Policies</li>
        </ul>
      </section>

      {/* 6. Data Sharing */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">6. Data Sharing</h2>
        <p>We do not sell personal or platform data.</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Meta APIs (message delivery)</li>
          <li>Stripe (payments)</li>
          <li>Google Calendar (appointments)</li>
          <li>Cloud infrastructure providers</li>
          <li>Legal authorities if required</li>
          <li>Business transfers (merger or acquisition)</li>
        </ul>
      </section>

      {/* 7. Data Retention */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">7. Data Retention</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Data retained while the account is active</li>
          <li>Messages stored temporarily for processing and audits</li>
          <li>Data deleted upon account deletion unless legally required</li>
        </ul>
      </section>

      {/* 8. User Rights */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">8. User Rights</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Access your personal data</li>
          <li>Correct inaccurate information</li>
          <li>Request data deletion</li>
          <li>Restrict or object to processing</li>
          <li>Withdraw consent at any time</li>
        </ul>
        <p className="mt-2">
          Requests can be sent to <strong>[your support email]</strong>.
        </p>
      </section>

      {/* 9–13 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">9. Data Security</h2>
        <p>
          We use encryption, secure APIs, access controls, and continuous
          monitoring. However, no system is 100% secure.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">10. Children’s Privacy</h2>
        <p>Verse AI is not intended for users under 18.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          11. International Data Transfers
        </h2>
        <p>
          Data may be processed outside your country in compliance with
          applicable laws.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          12. Changes to This Policy
        </h2>
        <p>
          Updates will be posted on this page with a revised effective date.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">13. Contact Information</h2>
        <p>
          <strong>Verse AI</strong>
          <br />
          Email: [your support email]
          <br />
          Website: [your website URL]
        </p>
      </section>

      <PolicyAcceptance />
    </main>
  );
};

export default PrivacyPolicyPage;
