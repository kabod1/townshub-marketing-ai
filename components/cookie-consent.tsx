'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Script from 'next/script'

type ConsentPrefs = { analytics: boolean; marketing: boolean }
const CONSENT_KEY = 'townshub_cookie_consent'

export function CookieConsent({ gaId }: { gaId?: string }) {
  const [show, setShow] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [prefs, setPrefs] = useState<ConsentPrefs>({ analytics: false, marketing: false })
  const [saved, setSaved] = useState<ConsentPrefs | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY)
      if (stored) setSaved(JSON.parse(stored))
      else setShow(true)
    } catch {
      setShow(true)
    }
  }, [])

  function saveConsent(consent: ConsentPrefs) {
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify(consent)) } catch {}
    setSaved(consent)
    setShow(false)
    setShowDetails(false)
  }

  return (
    <>
      {gaId && saved?.analytics && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}');
          `}</Script>
        </>
      )}

      {show && (
        <div className="fixed bottom-0 left-0 right-0 z-[9999] p-3 sm:p-5">
          <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-5 sm:p-6">
            {!showDetails ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm mb-1">We use cookies</p>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    We use essential cookies for the site to function and optional analytics cookies to improve your
                    experience. Read our{' '}
                    <Link href="/cookies" className="text-sky-400 hover:underline">Cookie Policy</Link>{' '}and{' '}
                    <Link href="/privacy" className="text-sky-400 hover:underline">Privacy Policy</Link>.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    onClick={() => setShowDetails(true)}
                    className="px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 text-xs hover:bg-slate-800 transition-colors"
                  >
                    Manage
                  </button>
                  <button
                    onClick={() => saveConsent({ analytics: false, marketing: false })}
                    className="px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 text-xs hover:bg-slate-800 transition-colors"
                  >
                    Reject Non-Essential
                  </button>
                  <button
                    onClick={() => saveConsent({ analytics: true, marketing: true })}
                    className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold transition-colors"
                  >
                    Accept All
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-white font-semibold mb-4 text-sm">Manage Cookie Preferences</h3>
                <div className="space-y-0 mb-5">
                  <div className="flex items-center justify-between py-3 border-b border-slate-800">
                    <div className="pr-4">
                      <p className="text-white text-sm font-medium">Essential Cookies</p>
                      <p className="text-slate-400 text-xs mt-0.5">Required for authentication and core site functionality. Cannot be disabled.</p>
                    </div>
                    <span className="text-xs text-slate-500 font-medium shrink-0">Always on</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-800">
                    <div className="pr-4">
                      <p className="text-white text-sm font-medium">Analytics Cookies</p>
                      <p className="text-slate-400 text-xs mt-0.5">Google Analytics — helps us understand how you use the site so we can improve it.</p>
                    </div>
                    <button
                      onClick={() => setPrefs(p => ({ ...p, analytics: !p.analytics }))}
                      aria-label="Toggle analytics cookies"
                      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${prefs.analytics ? 'bg-sky-500' : 'bg-slate-700'}`}
                    >
                      <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${prefs.analytics ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div className="pr-4">
                      <p className="text-white text-sm font-medium">Marketing Cookies</p>
                      <p className="text-slate-400 text-xs mt-0.5">Used to personalise ads and measure campaign effectiveness across platforms.</p>
                    </div>
                    <button
                      onClick={() => setPrefs(p => ({ ...p, marketing: !p.marketing }))}
                      aria-label="Toggle marketing cookies"
                      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${prefs.marketing ? 'bg-sky-500' : 'bg-slate-700'}`}
                    >
                      <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${prefs.marketing ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowDetails(false)}
                    className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 text-xs hover:bg-slate-800 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => saveConsent(prefs)}
                    className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold transition-colors"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
