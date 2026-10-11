import React, { useState } from 'react';
import { HelpCircle, PhoneCall, Mail, MessageSquare, ChevronDown, ChevronUp, ShieldAlert, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function CitizenSupportPage() {
  const { t } = useLanguage();
  const [openFaq, setOpenFaq] = useState(0);
  const [submittedFeedback, setSubmittedFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  const faqs = [
    {
      qKey: 'faq1Q',
      defaultQ: 'How do I track a report I submitted?',
      aKey: 'faq1A',
      defaultA: "Navigate to the 'My Tracking' section in the sidebar. There you will see a list of all your submitted reports along with their current resolution status (Pending, In-Progress, or Resolved)."
    },
    {
      qKey: 'faq2Q',
      defaultQ: 'Will my identity be revealed to the public?',
      aKey: 'faq2A',
      defaultA: "No. Unless you change your privacy settings in the Preferences menu, all reports submitted to the community feed appear as 'Anonymous Citizen'."
    },
    {
      qKey: 'faq3Q',
      defaultQ: 'What should I do in a severe emergency?',
      aKey: 'faq3A',
      defaultA: 'Urban EYE is for non-emergency infrastructure reporting only. For all immediate threats to life, property, or public safety, please call emergency services immediately.'
    }
  ];

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setSubmittedFeedback(true);
    setFeedbackText('');
    setTimeout(() => setSubmittedFeedback(false), 4000);
  };

  return (
    <div className="min-h-screen bg-white p-6 lg:p-10 relative overflow-hidden">
      
      <div className="max-w-4xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Contact & Emergency */}
        <div className="lg:col-span-1 space-y-6">
          
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <span>{t('supportTitle', 'Help & Support')}</span>
            </h1>
          </div>

          {/* Emergency Card */}
          <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 relative overflow-hidden group shadow-xs">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <ShieldAlert className="w-32 h-32 text-rose-600" />
            </div>
            <h3 className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-4 flex items-center space-x-2 relative z-10">
              <PhoneCall className="w-4 h-4" />
              <span>{t('emergency', 'Emergency')}</span>
            </h3>
            <div className="relative z-10 space-y-4">
              <div>
                <p className="text-xs text-slate-600 font-semibold mb-1">{t('policeFireMedical', 'Police / Fire / Medical')}</p>
                <p className="text-2xl font-black text-rose-700">112 / 911</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 font-semibold mb-1">{t('nonEmergencyPolice', 'Non-Emergency Police')}</p>
                <p className="text-lg font-bold text-slate-900">100 / 311</p>
              </div>
            </div>
          </div>

          {/* Contact Methods */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-6 shadow-xs">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('contactUs', 'Contact Us')}</h3>
            
            <a href="mailto:support@urbaneye.local" className="flex items-start space-x-4 group">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <Mail className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{t('emailSupport', 'Email Support')}</p>
                <p className="text-xs text-slate-500 mt-0.5">support@urbaneye.local</p>
              </div>
            </a>

            <div className="flex items-start space-x-4 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">{t('liveChat', 'Live Chat')}</p>
                <p className="text-xs text-slate-500 mt-0.5">{t('liveChatHours', 'Available 9AM - 5PM')}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: FAQ & Form */}
        <div className="lg:col-span-2 space-y-6 lg:mt-[72px]">
          
          {/* FAQ Accordion */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 mb-6">{t('faqTitle', 'Frequently Asked Questions')}</h2>
            
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/60">
                  <button 
                    onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                    className="w-full px-5 py-3.5 flex items-center justify-between text-left focus:outline-none cursor-pointer"
                  >
                    <span className="text-sm font-bold text-slate-800">{t(faq.qKey, faq.defaultQ)}</span>
                    {openFaq === index ? (
                      <ChevronUp className="w-4 h-4 text-blue-600" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  
                  {openFaq === index && (
                    <div className="px-5 pb-4">
                      <div className="h-px w-full bg-slate-200 mb-3"></div>
                      <p className="text-xs text-slate-600 leading-relaxed">{t(faq.aKey, faq.defaultA)}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Feedback Form */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 mb-1">{t('sendFeedback', 'Send Feedback')}</h2>
            <p className="text-xs text-slate-500 mb-6">{t('sendFeedbackSubtitle', 'Found a bug or have a suggestion? Let our developers know.')}</p>
            
            {submittedFeedback ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center space-x-3 text-emerald-700">
                <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
                <span className="text-sm font-medium">{t('saved', 'Thank you! Your feedback has been received.')}</span>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleFeedbackSubmit}>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">{t('message', 'Message')}</label>
                  <textarea 
                    rows="4" 
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder={t('describeIssuePlaceholder', 'Describe your issue or suggestion...')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all resize-none"
                    required
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{t('submitFeedback', 'Submit Feedback')}</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
