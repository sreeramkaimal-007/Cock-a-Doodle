import React from 'react';
import { Shield, X } from 'lucide-react';

interface PrivacyPolicyModalProps {
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="w-full max-w-lg max-h-[88vh] bg-slate-900 border-2 border-amber-400/80 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-yellow-400" />
            <h2 className="font-pixel-arcade text-xs sm:text-sm text-yellow-400">
              PRIVACY POLICY & ADS INFO
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
            aria-label="Close Privacy Policy"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-body">
          <section>
            <h3 className="font-pixel-arcade text-[10px] text-amber-300 mb-1">
              1. ACCOUNT & GAME PROGRESS DATA
            </h3>
            <p>
              Cock a Doodle uses Google Firebase Authentication and Cloud Firestore to register players,
              verify email addresses, and save campaign progress, unlocked stages, coins, and skins.
              We store only your account identifier, email address, display name, and in-game save state.
            </p>
          </section>

          <section>
            <h3 className="font-pixel-arcade text-[10px] text-amber-300 mb-1">
              2. GOOGLE ADSENSE & COOKIES
            </h3>
            <p>
              This website may display advertisements served by Google AdSense. Third-party vendors,
              including Google, use cookies to serve ads based on a user&apos;s prior visits to this
              website or other websites. Google&apos;s use of advertising cookies enables it and its
              partners to serve ads to users based on their visit to this site and/or other sites on
              the Internet.
            </p>
            <p className="mt-2">
              Users may opt out of personalized advertising by visiting{' '}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-400 underline hover:text-yellow-300"
              >
                Google Ads Settings
              </a>
              .
            </p>
          </section>

          <section>
            <h3 className="font-pixel-arcade text-[10px] text-amber-300 mb-1">
              3. LOCAL STORAGE
            </h3>
            <p>
              Browser local storage is used alongside your verified cloud profile to keep audio
              preferences, control settings, and progress responsive during gameplay.
            </p>
          </section>

          <section>
            <h3 className="font-pixel-arcade text-[10px] text-amber-300 mb-1">
              4. CONTACT
            </h3>
            <p>
              For account, privacy, or data-removal inquiries, please contact the game administrator
              using the support contact listed on this website.
            </p>
          </section>
        </div>

        <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-pixel-arcade text-[10px] font-bold border-2 border-amber-600 cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
