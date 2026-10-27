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
    <div className="min-h-full p-4 sm:p-6 lg:p-10 relative overflow-hidden bg-[#F6EBE8]">
      
      <div className="max-w-4xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Contact & Emergency */}
        <div className="lg:col-span-1 space-y-6">
          
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#191636] tracking-tight flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F6F6FC] border border-[#E8E2E5] flex items-center justify-center shadow-xs">
                <HelpCircle className="w-6 h-6 text-[#302B69]" />
              </div>
              <span>{t('supportTitle', 'Help & Support')}</span>
            </h1>
          </div>

          {/* Emergency Card */}
          <div className="p-6 rounded-3xl bg-white border border-[#E8E2E5] relative overflow-hidden group shadow-xs">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <ShieldAlert className="w-32 h-32 text-[#302B69]" />
            </div>
            <h3 className="text-xs font-bold text-[#302B69] uppercase tracking-widest mb-4 flex items-center space-x-2 relative z-10">
              <PhoneCall className="w-4 h-4 text-[#302B69]" />
              <span>{t('emergency', 'Emergency')}</span>
            </h3>
            <div className="relative z-10 space-y-4">
              <div className="p-3 rounded-2xl bg-[#F6F6FC] border border-[#E8E2E5]">
                <p className="text-xs text-[#57536E] font-semibold mb-1">{t('policeFireMedical', 'Police / Fire / Medical')}</p>
                <p className="text-2xl font-black text-[#191636]">112 / 911</p>
              </div>
              <div className="p-3 rounded-2xl bg-[#F6F6FC] border border-[#E8E2E5]">
                <p className="text-xs text-[#57536E] font-semibold mb-1">{t('nonEmergencyPolice', 'Non-Emergency Police')}</p>
                <p className="text-lg font-bold text-[#191636]">100 / 311</p>
              </div>
            </div>
          </div>

          {/* Contact Methods */}
          <div className="p-6 rounded-3xl bg-white border border-[#E8E2E5] space-y-6 shadow-xs">
            <h3 className="text-xs font-bold text-[#57536E] uppercase tracking-widest mb-2">{t('contactUs', 'Contact Us')}</h3>
            
            <a href="mailto:support@urbaneye.local" className="flex items-start space-x-4 group">
              <div className="w-10 h-10 rounded-xl bg-[#F6F6FC] border border-[#E8E2E5] flex items-center justify-center group-hover:bg-[#302B69] group-hover:text-white transition-colors text-[#302B69]">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#191636] group-hover:text-[#302B69] transition-colors">{t('emailSupport', 'Email Support')}</p>
                <p className="text-xs text-[#57536E] mt-1 font-mono font-medium">support@urbaneye.local</p>
              </div>
            </a>

            <div className="flex items-start space-x-4 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-[#F6F6FC] border border-[#E8E2E5] flex items-center justify-center group-hover:bg-[#302B69] group-hover:text-white transition-colors text-[#302B69]">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#191636] group-hover:text-[#302B69] transition-colors">{t('liveChat', 'Live Chat')}</p>
                <p className="text-xs text-[#57536E] mt-1 font-medium">{t('liveChatHours', 'Available 9AM - 5PM')}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: FAQ & Form */}
        <div className="lg:col-span-2 space-y-6 lg:mt-[72px]">
          
          {/* FAQ Accordion */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E2E5] shadow-xs">
            <h2 className="text-xl font-bold text-[#191636] mb-6">{t('faqTitle', 'Frequently Asked Questions')}</h2>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-[#E8E2E5] rounded-2xl overflow-hidden bg-[#F6F6FC] transition-colors">
                  <button 
                    onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
                  >
                    <span className="font-bold text-[#191636] text-sm sm:text-base">{t(faq.qKey, faq.defaultQ)}</span>
                    {openFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-[#302B69]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#8C87A6]" />
                    )}
                  </button>
                  
                  {openFaq === index && (
                    <div className="px-6 pb-5">
                      <div className="h-px w-full bg-[#E8E2E5] mb-4"></div>
                      <p className="text-sm text-[#57536E] leading-relaxed font-normal">{t(faq.aKey, faq.defaultA)}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Feedback Form */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E2E5] shadow-xs">
            <h2 className="text-xl font-bold text-[#191636] mb-2">{t('sendFeedback', 'Send Feedback')}</h2>
            <p className="text-sm text-[#57536E] mb-6 font-medium">{t('sendFeedbackSubtitle', 'Found a bug or have a suggestion? Let our developers know.')}</p>
            
            {submittedFeedback ? (
              <div className="p-4 rounded-2xl bg-[#F6F6FC] border border-[#E8E2E5] flex items-center space-x-3 text-[#191636]">
                <CheckCircle className="w-5 h-5 shrink-0 text-[#302B69]" />
                <span className="text-sm font-semibold">{t('saved', 'Thank you! Your feedback has been received.')}</span>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleFeedbackSubmit}>
                <div>
                  <label className="block text-xs font-bold text-[#57536E] uppercase tracking-wider mb-2">{t('message', 'Message')}</label>
                  <textarea 
                    rows="4" 
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder={t('describeIssuePlaceholder', 'Describe your issue or suggestion...')}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F6F6FC] border border-[#E8E2E5] text-[#191636] text-sm placeholder-[#8C87A6] focus:outline-none focus:border-[#302B69] focus:ring-2 focus:ring-[#302B69]/20 transition-all resize-none shadow-xs"
                    required
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-[#302B69] hover:bg-[#242052] text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-xs flex items-center justify-center space-x-2"
                >
                  <MessageSquare className="w-4 h-4 text-white" />
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
