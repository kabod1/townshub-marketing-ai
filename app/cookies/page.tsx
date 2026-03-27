import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy | TownsHub Marketing AI',
  description: 'Information about how TownsHub uses cookies and how to manage your preferences.',
}

export default function CookiePolicyPage() {
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
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Cookie Policy</h1>
          <p className="text-slate-400 text-sm">Last updated: 27 March 2026</p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. What Are Cookies?</h2>
            <p>
              Cookies are small text files placed on your device when you visit a website. They are widely used to make
              websites work efficiently, to remember your preferences, and to provide information to site owners.
              Similar technologies such as local storage and session storage may also be used for the same purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Cookies</h2>
            <p>
              TownsHub uses cookies in three categories. Your consent is required for non-essential cookies before they are set.
            </p>

            <div className="mt-5 space-y-4">

              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="bg-emerald-500/10 border-b border-slate-800 px-5 py-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <h3 className="text-white font-semibold text-sm">Essential Cookies</h3>
                  <span className="ml-auto text-xs text-slate-400">Always Active · No consent required</span>
                </div>
                <div className="p-5">
                  <p className="text-xs text-slate-400 mb-4">
                    These cookies are strictly necessary for the website to function. They enable authentication,
                    security, and session management. Without them, you cannot log in or use the platform.
                  </p>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="text-left py-2 pr-4 text-slate-400 font-medium">Cookie Name</th>
                        <th className="text-left py-2 pr-4 text-slate-400 font-medium">Provider</th>
                        <th className="text-left py-2 pr-4 text-slate-400 font-medium">Purpose</th>
                        <th className="text-left py-2 text-slate-400 font-medium">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="space-y-1">
                      {[
                        ['sb-*-auth-token', 'Supabase', 'Authentication session token', '1 hour (auto-refreshed)'],
                        ['sb-*-auth-token-code-verifier', 'Supabase', 'OAuth PKCE flow security', 'Session'],
                        ['townshub_cookie_consent', 'TownsHub', 'Stores your cookie preferences (local storage)', 'Persistent'],
                      ].map(([name, provider, purpose, duration]) => (
                        <tr key={name} className="border-b border-slate-800/50">
                          <td className="py-2 pr-4 font-mono text-sky-400">{name}</td>
                          <td className="py-2 pr-4 text-slate-300">{provider}</td>
                          <td className="py-2 pr-4 text-slate-400">{purpose}</td>
                          <td className="py-2 text-slate-400">{duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="bg-sky-500/10 border-b border-slate-800 px-5 py-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                  <h3 className="text-white font-semibold text-sm">Analytics Cookies</h3>
                  <span className="ml-auto text-xs text-slate-400">Consent Required</span>
                </div>
                <div className="p-5">
                  <p className="text-xs text-slate-400 mb-4">
                    These cookies help us understand how visitors interact with TownsHub so we can improve the platform.
                    They collect anonymised information about pages visited, time on site, and traffic sources.
                    We only set these if you consent.
                  </p>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="text-left py-2 pr-4 text-slate-400 font-medium">Cookie Name</th>
                        <th className="text-left py-2 pr-4 text-slate-400 font-medium">Provider</th>
                        <th className="text-left py-2 pr-4 text-slate-400 font-medium">Purpose</th>
                        <th className="text-left py-2 text-slate-400 font-medium">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['_ga', 'Google Analytics', 'Distinguishes unique users', '2 years'],
                        ['_ga_*', 'Google Analytics', 'Maintains session state', '2 years'],
                        ['_gid', 'Google Analytics', 'Identifies user session', '24 hours'],
                        ['_gat', 'Google Analytics', 'Throttles request rate', '1 minute'],
                      ].map(([name, provider, purpose, duration]) => (
                        <tr key={name} className="border-b border-slate-800/50">
                          <td className="py-2 pr-4 font-mono text-sky-400">{name}</td>
                          <td className="py-2 pr-4 text-slate-300">{provider}</td>
                          <td className="py-2 pr-4 text-slate-400">{purpose}</td>
                          <td className="py-2 text-slate-400">{duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="bg-violet-500/10 border-b border-slate-800 px-5 py-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-400"></span>
                  <h3 className="text-white font-semibold text-sm">Marketing Cookies</h3>
                  <span className="ml-auto text-xs text-slate-400">Consent Required</span>
                </div>
                <div className="p-5">
                  <p className="text-xs text-slate-400 mb-4">
                    Marketing cookies are used to track visitors across websites to display relevant advertisements.
                    Currently we do not run advertising campaigns, but this may change in the future.
                    These cookies are only set if you explicitly consent.
                  </p>
                  <p className="text-xs text-slate-500 italic">No marketing cookies are currently active.</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Managing Your Cookie Preferences</h2>
            <p>You can manage your cookie preferences in several ways:</p>
            <div className="mt-4 space-y-3">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <p className="text-white font-semibold text-sm mb-1">Cookie Banner</p>
                <p className="text-xs text-slate-400">
                  When you first visit TownsHub, a cookie banner allows you to accept all cookies, reject non-essential
                  cookies, or customise your preferences. Your choice is saved and respected on all future visits.
                </p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <p className="text-white font-semibold text-sm mb-1">Browser Settings</p>
                <p className="text-xs text-slate-400">
                  Most browsers allow you to control cookies through their settings. You can set your browser to refuse
                  cookies or delete certain cookies. Note that disabling essential cookies may affect the functionality
                  of TownsHub (e.g., you may not be able to log in).
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    { name: 'Chrome', url: 'https://support.google.com/chrome/answer/95647' },
                    { name: 'Firefox', url: 'https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop' },
                    { name: 'Safari', url: 'https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac' },
                    { name: 'Edge', url: 'https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge' },
                  ].map(({ name, url }) => (
                    <a key={name} href={url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-sky-400 hover:underline bg-slate-800 px-2 py-1 rounded">
                      {name} →
                    </a>
                  ))}
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <p className="text-white font-semibold text-sm mb-1">Opt-Out of Google Analytics</p>
                <p className="text-xs text-slate-400">
                  You can opt out of Google Analytics across all websites by installing the{' '}
                  <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer"
                    className="text-sky-400 hover:underline">Google Analytics Opt-out Browser Add-on</a>.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Local Storage</h2>
            <p>
              In addition to cookies, we use browser local storage to save your cookie consent preferences
              (key: <span className="font-mono text-sky-400 text-xs">townshub_cookie_consent</span>).
              This is essential for honouring your choices across visits and does not transmit data to our servers.
              You can clear local storage via your browser's developer tools or by clearing all site data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Changes to This Policy</h2>
            <p>
              We may update this Cookie Policy to reflect changes in the cookies we use or for other operational,
              legal, or regulatory reasons. We will notify you of any material changes through the platform or by email.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Contact Us</h2>
            <p>
              If you have any questions about our use of cookies, please contact us at{' '}
              <a href="mailto:privacy@townshub.com" className="text-sky-400 hover:underline">privacy@townshub.com</a>.
            </p>
          </section>
        </div>

        {/* Footer links */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-wrap gap-4 text-xs text-slate-500">
          <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
          <Link href="/" className="hover:text-slate-300 transition-colors">← Back to App</Link>
        </div>
      </main>
    </div>
  )
}
