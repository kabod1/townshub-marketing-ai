import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | TownsHub Marketing AI',
  description: 'How TownsHub Limited collects, uses, and protects your personal data.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      {/* Nav */}
      <header className="border-b border-slate-800 sticky top-0 z-10 bg-slate-950/90 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="TownsHub" className="h-8 w-auto" />
            <span className="text-white font-semibold text-sm">TownsHub</span>
          </Link>
          <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors">← Back to App</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Privacy Policy</h1>
          <p className="text-slate-400 text-sm">Last updated: 27 March 2026 · Effective date: 27 March 2026</p>
        </div>

        <div className="prose prose-invert prose-sm max-w-none space-y-8">

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Who We Are</h2>
            <p>
              TownsHub Marketing AI is operated by <strong className="text-white">TownsHub Limited</strong> ("TownsHub", "we", "us", "our"),
              a company registered in England and Wales. We are the data controller for personal data processed through the
              TownsHub Marketing AI platform accessible at townshub-app.vercel.app and any associated domains.
            </p>
            <p className="mt-3">
              <strong className="text-white">Contact us:</strong>{' '}
              <a href="mailto:privacy@townshub.com" className="text-sky-400 hover:underline">privacy@townshub.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. What Data We Collect</h2>
            <p>We collect and process the following categories of personal data:</p>
            <div className="mt-4 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <p className="font-semibold text-white text-sm mb-1">Account Data</p>
                <p className="text-xs text-slate-400">Full name, email address, encrypted password, account creation date, and subscription plan.</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <p className="font-semibold text-white text-sm mb-1">Payment Data</p>
                <p className="text-xs text-slate-400">Billing details processed by Stripe or PayPal. We do not store full card numbers — only payment provider customer IDs and subscription identifiers.</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <p className="font-semibold text-white text-sm mb-1">Usage Data</p>
                <p className="text-xs text-slate-400">Content generation history, topics and prompts submitted, number of generations used, and feature interactions.</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <p className="font-semibold text-white text-sm mb-1">Technical Data</p>
                <p className="text-xs text-slate-400">IP address, browser type and version, device type, operating system, referring URLs, and pages visited (collected via Google Analytics where consented).</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <p className="font-semibold text-white text-sm mb-1">Communications Data</p>
                <p className="text-xs text-slate-400">Any messages you send to our support team and AI assistant chat history.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. How We Use Your Data</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900">
                    <th className="border border-slate-800 px-3 py-2 text-left text-white font-semibold">Purpose</th>
                    <th className="border border-slate-800 px-3 py-2 text-left text-white font-semibold">Legal Basis (UK GDPR)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Provide and operate the service', 'Contract (Art. 6(1)(b))'],
                    ['Process payments and manage subscriptions', 'Contract (Art. 6(1)(b))'],
                    ['Send transactional emails (password reset, receipts)', 'Contract (Art. 6(1)(b))'],
                    ['Respond to support enquiries', 'Legitimate interests (Art. 6(1)(f))'],
                    ['Improve and develop the platform', 'Legitimate interests (Art. 6(1)(f))'],
                    ['Analyse usage and site performance (Google Analytics)', 'Consent (Art. 6(1)(a))'],
                    ['Comply with legal obligations', 'Legal obligation (Art. 6(1)(c))'],
                    ['Prevent fraud and ensure security', 'Legitimate interests (Art. 6(1)(f))'],
                  ].map(([purpose, basis]) => (
                    <tr key={purpose} className="border-b border-slate-800">
                      <td className="border border-slate-800 px-3 py-2">{purpose}</td>
                      <td className="border border-slate-800 px-3 py-2 text-sky-400">{basis}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Third-Party Processors</h2>
            <p>We share data with the following trusted third-party processors who act on our instructions:</p>
            <div className="mt-4 space-y-3">
              {[
                { name: 'Supabase', role: 'Database, authentication, and file storage', location: 'EU (AWS eu-west-1)', link: 'https://supabase.com/privacy' },
                { name: 'Stripe', role: 'Payment processing', location: 'USA (SCCs apply)', link: 'https://stripe.com/privacy' },
                { name: 'PayPal', role: 'Payment processing', location: 'USA (SCCs apply)', link: 'https://www.paypal.com/uk/legalhub/privacy-full' },
                { name: 'Google Analytics', role: 'Website analytics (consent-gated)', location: 'USA (SCCs apply)', link: 'https://policies.google.com/privacy' },
                { name: 'Vercel', role: 'Application hosting and edge network', location: 'USA/EU (SCCs apply)', link: 'https://vercel.com/legal/privacy-policy' },
                { name: 'OpenAI / n8n', role: 'AI content generation processing', location: 'USA (SCCs apply)', link: 'https://openai.com/policies/privacy-policy' },
              ].map(({ name, role, location, link }) => (
                <div key={name} className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-4 gap-2">
                  <div>
                    <p className="text-white text-sm font-semibold">{name}</p>
                    <p className="text-slate-400 text-xs">{role} · {location}</p>
                  </div>
                  <a href={link} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-400 hover:underline shrink-0">Privacy Policy →</a>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. International Data Transfers</h2>
            <p>
              Some processors are based outside the UK/EEA. Where data is transferred to third countries (e.g. the USA),
              we rely on Standard Contractual Clauses (SCCs) approved by the UK ICO or the European Commission,
              or we transfer to countries with an adequacy decision. By using our service, you acknowledge these transfers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Data Retention</h2>
            <p>We retain your personal data for as long as your account is active or as needed to provide services. Specifically:</p>
            <ul className="mt-3 space-y-2 list-disc pl-5">
              <li>Account data: retained until account deletion, then deleted within 30 days.</li>
              <li>Payment records: retained for 7 years to comply with UK financial regulations.</li>
              <li>Usage/content data: retained for the duration of your account plus 12 months.</li>
              <li>Support communications: retained for 3 years after last interaction.</li>
              <li>Analytics data: retained per Google Analytics' default retention period (26 months).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Your Rights Under UK GDPR</h2>
            <p>You have the following rights regarding your personal data:</p>
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              {[
                { right: 'Right of Access', desc: 'Request a copy of all personal data we hold about you.' },
                { right: 'Right to Rectification', desc: 'Request correction of inaccurate or incomplete data.' },
                { right: 'Right to Erasure', desc: 'Request deletion of your data ("right to be forgotten").' },
                { right: 'Right to Restriction', desc: 'Request we restrict processing of your data in certain circumstances.' },
                { right: 'Right to Portability', desc: 'Receive your data in a structured, machine-readable format.' },
                { right: 'Right to Object', desc: 'Object to processing based on legitimate interests or for direct marketing.' },
                { right: 'Withdraw Consent', desc: 'Withdraw consent for analytics/marketing cookies at any time.' },
                { right: 'Right to Complain', desc: 'Lodge a complaint with the ICO (ico.org.uk) if unsatisfied with our response.' },
              ].map(({ right, desc }) => (
                <div key={right} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <p className="text-white text-sm font-semibold mb-1">{right}</p>
                  <p className="text-slate-400 text-xs">{desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-4">
              To exercise any of these rights, email us at{' '}
              <a href="mailto:privacy@townshub.com" className="text-sky-400 hover:underline">privacy@townshub.com</a>.
              We will respond within 30 days. You can also delete your account directly from your{' '}
              <Link href="/account" className="text-sky-400 hover:underline">Account Settings</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Cookies</h2>
            <p>
              We use essential cookies required for the service to function (authentication sessions) and optional
              analytics/marketing cookies which require your consent. You can manage your cookie preferences at any
              time via the cookie banner or by reading our{' '}
              <Link href="/cookies" className="text-sky-400 hover:underline">Cookie Policy</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Security</h2>
            <p>
              We implement appropriate technical and organisational measures to protect your personal data, including
              encryption in transit (TLS), encrypted storage, access controls, and regular security reviews.
              However, no method of transmission over the internet is 100% secure. If you discover a security
              vulnerability, please contact{' '}
              <a href="mailto:security@townshub.com" className="text-sky-400 hover:underline">security@townshub.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Children</h2>
            <p>
              Our service is not directed at children under 18 years of age. We do not knowingly collect personal
              data from children. If you believe we have inadvertently collected data from a child, please contact
              us immediately at{' '}
              <a href="mailto:privacy@townshub.com" className="text-sky-400 hover:underline">privacy@townshub.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Material changes will be notified by email or
              by a prominent notice on the platform at least 14 days before taking effect. The "Last updated" date
              at the top of this page indicates when the policy was last revised.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">12. Contact & Complaints</h2>
            <p>For any privacy-related queries or to exercise your rights:</p>
            <div className="mt-3 bg-slate-900 border border-slate-800 rounded-xl p-5">
              <p className="text-white font-semibold mb-2">TownsHub Limited</p>
              <p>Email: <a href="mailto:privacy@townshub.com" className="text-sky-400 hover:underline">privacy@townshub.com</a></p>
              <p className="mt-3 text-xs text-slate-500">
                If you are not satisfied with our response, you have the right to lodge a complaint with the
                UK Information Commissioner's Office (ICO) at{' '}
                <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">ico.org.uk</a>.
              </p>
            </div>
          </section>
        </div>

        {/* Footer links */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-wrap gap-4 text-xs text-slate-500">
          <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
          <Link href="/cookies" className="hover:text-slate-300 transition-colors">Cookie Policy</Link>
          <Link href="/" className="hover:text-slate-300 transition-colors">← Back to App</Link>
        </div>
      </main>
    </div>
  )
}
