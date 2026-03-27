import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | TownsHub Marketing AI',
  description: 'Terms and conditions for using the TownsHub Marketing AI platform.',
}

export default function TermsPage() {
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
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Terms of Service</h1>
          <p className="text-slate-400 text-sm">Last updated: 27 March 2026 · Effective date: 27 March 2026</p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using TownsHub Marketing AI (the "Service"), operated by <strong className="text-white">TownsHub Limited</strong>,
              a company registered in England and Wales ("TownsHub", "we", "us"), you agree to be bound by these Terms of Service
              ("Terms"). If you do not agree to these Terms, do not use the Service.
            </p>
            <p className="mt-3">
              These Terms constitute a legally binding agreement. We recommend you read them carefully and retain a copy for your records.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Description of Service</h2>
            <p>
              TownsHub Marketing AI is a software-as-a-service (SaaS) platform that uses artificial intelligence to help users
              generate, repurpose, and distribute marketing content across multiple channels and platforms. Features include
              content generation in multiple formats, distribution planning, podcast RSS generation, press release creation,
              and an AI marketing assistant.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Eligibility</h2>
            <p>You must be at least 18 years of age to use this Service. By registering, you represent and warrant that:</p>
            <ul className="mt-3 space-y-1.5 list-disc pl-5">
              <li>You are at least 18 years old.</li>
              <li>You have the legal capacity to enter into a binding contract.</li>
              <li>You are not located in a jurisdiction where use of the Service is prohibited by law.</li>
              <li>The information you provide during registration is accurate and complete.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Account Registration & Security</h2>
            <p>
              To access the Service, you must create an account. You are responsible for maintaining the confidentiality
              of your login credentials and for all activity that occurs under your account. You agree to:
            </p>
            <ul className="mt-3 space-y-1.5 list-disc pl-5">
              <li>Provide accurate, current, and complete information during registration.</li>
              <li>Promptly update your account information if it changes.</li>
              <li>Keep your password secure and not share it with third parties.</li>
              <li>Notify us immediately at <a href="mailto:support@townshub.com" className="text-sky-400 hover:underline">support@townshub.com</a> of any unauthorised use of your account.</li>
            </ul>
            <p className="mt-3">
              We reserve the right to suspend or terminate accounts that violate these Terms or are used fraudulently.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Subscription Plans & Payments</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-medium mb-2">5.1 Plans</h3>
                <p>
                  We offer multiple subscription tiers including a Free plan and paid plans (Starter, Pro, Business).
                  Plan details, pricing, and generation limits are described on the{' '}
                  <Link href="/pricing" className="text-sky-400 hover:underline">Pricing page</Link> and may be updated from time to time.
                </p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-2">5.2 Billing</h3>
                <p>
                  Paid subscriptions are billed on a monthly or annual basis. Payments are processed by our third-party
                  providers (Stripe and PayPal). By subscribing, you authorise recurring charges to your chosen payment method.
                </p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-2">5.3 Cancellation</h3>
                <p>
                  You may cancel your subscription at any time via your Account Settings or by contacting support.
                  Cancellations take effect at the end of the current billing period. No refunds are issued for unused
                  portions of a billing period except where required by applicable law.
                </p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-2">5.4 Refunds</h3>
                <p>
                  Refund requests made within 7 days of the initial purchase will be considered on a case-by-case basis.
                  To request a refund, email <a href="mailto:support@townshub.com" className="text-sky-400 hover:underline">support@townshub.com</a>.
                  Refunds are not available after 7 days from purchase.
                </p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-2">5.5 Price Changes</h3>
                <p>
                  We may change subscription prices with at least 30 days' notice. Continued use of the Service after
                  a price change constitutes acceptance of the new pricing.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Acceptable Use</h2>
            <p>You agree not to use the Service to:</p>
            <ul className="mt-3 space-y-1.5 list-disc pl-5">
              <li>Generate, distribute, or promote illegal, harmful, defamatory, obscene, or fraudulent content.</li>
              <li>Infringe the intellectual property rights of any third party.</li>
              <li>Violate any applicable local, national, or international law or regulation.</li>
              <li>Send spam, unsolicited messages, or engage in deceptive marketing practices.</li>
              <li>Attempt to gain unauthorised access to the platform, its servers, or other users' accounts.</li>
              <li>Use automated bots, scrapers, or other tools to extract data from the Service without authorisation.</li>
              <li>Resell, sublicense, or commercially exploit the Service without our written consent.</li>
              <li>Interfere with or disrupt the integrity or performance of the Service.</li>
            </ul>
            <p className="mt-3">
              We reserve the right to investigate and, where appropriate, suspend or terminate access for violations of these policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Intellectual Property</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-medium mb-2">7.1 Our Platform</h3>
                <p>
                  The TownsHub platform, including its design, code, trademarks, logos, and features, is owned by TownsHub Limited
                  and protected by intellectual property laws. Nothing in these Terms grants you any rights to our IP except
                  the limited licence to use the Service.
                </p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-2">7.2 Your Content</h3>
                <p>
                  You retain ownership of any content you input into the platform ("Input"). You grant us a limited,
                  non-exclusive licence to process your Input solely to provide the Service. You are solely responsible
                  for ensuring your Input does not infringe third-party rights.
                </p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-2">7.3 AI-Generated Content</h3>
                <p>
                  Content generated by the AI ("Output") is provided to you for your use, subject to these Terms.
                  You are responsible for reviewing, editing, and ensuring the accuracy and legality of any Output
                  before publishing or distributing it. We make no warranties regarding the originality, accuracy,
                  or fitness for purpose of any AI-generated content.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Disclaimers</h2>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <p>
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED,
                INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
                NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
              </p>
              <p className="mt-3">
                AI-generated content may be inaccurate, incomplete, or unsuitable for your purposes. You should always
                review and verify content before publishing. We are not responsible for any decisions made based on AI output.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, TownsHub Limited shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages, including but not limited to loss of profits,
              revenue, data, or business opportunities, arising out of or in connection with your use of the Service.
            </p>
            <p className="mt-3">
              Our total aggregate liability to you for any claims arising under these Terms shall not exceed the greater
              of (a) the amount you paid us in the 12 months preceding the claim, or (b) £100 (one hundred pounds sterling).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless TownsHub Limited and its officers, directors, employees,
              and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable
              legal fees) arising out of or in connection with your use of the Service, your violation of these Terms,
              or your infringement of any third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Third-Party Services</h2>
            <p>
              The Service integrates with third-party platforms and services (e.g. Stripe, PayPal, Google Analytics).
              Your use of those services is subject to their respective terms and privacy policies. We are not responsible
              for the availability, accuracy, or practices of third-party services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">12. Service Availability & Modifications</h2>
            <p>
              We aim for high availability but do not guarantee uninterrupted access to the Service. We reserve the right to:
            </p>
            <ul className="mt-3 space-y-1.5 list-disc pl-5">
              <li>Modify, suspend, or discontinue any feature or the Service with reasonable notice.</li>
              <li>Perform scheduled or emergency maintenance that may temporarily affect availability.</li>
              <li>Update these Terms at any time, with notification of material changes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">13. Termination</h2>
            <p>
              Either party may terminate the agreement at any time. You may close your account from Account Settings.
              We may terminate or suspend your account immediately, without prior notice, if you breach these Terms.
              Upon termination, your right to use the Service ceases and we will handle your data in accordance with our{' '}
              <Link href="/privacy" className="text-sky-400 hover:underline">Privacy Policy</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">14. Governing Law & Dispute Resolution</h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of England and Wales. Any disputes
              arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the
              courts of England and Wales.
            </p>
            <p className="mt-3">
              Before commencing legal proceedings, we encourage you to contact us at{' '}
              <a href="mailto:support@townshub.com" className="text-sky-400 hover:underline">support@townshub.com</a>{' '}
              to resolve disputes amicably.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">15. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. We will notify you of material changes by email or via
              a notice on the platform at least 14 days before the changes take effect. Your continued use of the
              Service after the effective date constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">16. Contact</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <p className="text-white font-semibold mb-2">TownsHub Limited</p>
              <p>Support: <a href="mailto:support@townshub.com" className="text-sky-400 hover:underline">support@townshub.com</a></p>
              <p>Legal: <a href="mailto:legal@townshub.com" className="text-sky-400 hover:underline">legal@townshub.com</a></p>
            </div>
          </section>
        </div>

        {/* Footer links */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-wrap gap-4 text-xs text-slate-500">
          <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
          <Link href="/cookies" className="hover:text-slate-300 transition-colors">Cookie Policy</Link>
          <Link href="/" className="hover:text-slate-300 transition-colors">← Back to App</Link>
        </div>
      </main>
    </div>
  )
}
