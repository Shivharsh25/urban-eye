import React, { useState } from 'react';
import { HelpCircle, PhoneCall, Mail, MessageSquare, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';

export default function CitizenSupportPage() {
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    {
      q: "How do I track a report I submitted?",
      a: "Navigate to the 'My Tracking' section in the sidebar. There you will see a list of all your submitted reports along with their current resolution status (Pending, In-Progress, or Resolved)."
    },
    {
      q: "Will my identity be revealed to the public?",
      a: "No. Unless you change your privacy settings in the Preferences menu, all reports submitted to the community feed appear as 'Anonymous Citizen'."
    },
    {
      q: "What should I do in a severe emergency?",
      a: "Urban EYE is for non-emergency infrastructure reporting only. For all immediate threats to life, property, or public safety, please call 911 immediately."
    }
  ];

  return (
    <div className="min-h-screen bg-[#05080f] p-6 lg:p-10 relative overflow-hidden">
      
      {/* Background aesthetics */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Contact & Emergency */}
        <div className="lg:col-span-1 space-y-6">
          
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-cyan-400" />
              </div>
              <span>Support</span>
            </h1>
          </div>

          {/* Emergency Card */}
          <div className="glass-panel p-6 rounded-3xl bg-rose-950/20 border border-rose-900/40 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldAlert className="w-32 h-32 text-rose-500" />
            </div>
            <h3 className="text-sm font-bold text-rose-400 uppercase tracking-widest mb-4 flex items-center space-x-2 relative z-10">
              <PhoneCall className="w-4 h-4" />
              <span>Emergency</span>
            </h3>
            <div className="relative z-10 space-y-4">
              <div>
                <p className="text-xs text-slate-400 font-semibold mb-1">Police / Fire / Medical</p>
                <p className="text-2xl font-black text-white">911</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold mb-1">Non-Emergency Police</p>
                <p className="text-lg font-bold text-white">311</p>
              </div>
            </div>
          </div>

          {/* Contact Methods */}
          <div className="glass-panel p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-6">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-2">Contact Us</h3>
            
            <a href="mailto:support@urbaneye.local" className="flex items-start space-x-4 group">
              <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                <Mail className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-200">Email Support</p>
                <p className="text-xs text-slate-500 mt-1">support@urbaneye.local</p>
              </div>
            </a>

            <div className="flex items-start space-x-4 group cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <MessageSquare className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-200">Live Chat</p>
                <p className="text-xs text-slate-500 mt-1">Available 9AM - 5PM EST</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: FAQ & Form */}
        <div className="lg:col-span-2 space-y-6 lg:mt-[72px]">
          
          {/* FAQ Accordion */}
          <div className="glass-panel p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80">
            <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-slate-800 rounded-xl overflow-hidden bg-black/20">
                  <button 
                    onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
                  >
                    <span className="font-bold text-slate-200">{faq.q}</span>
                    {openFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-cyan-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-500" />
                    )}
                  </button>
                  
                  {openFaq === index && (
                    <div className="px-6 pb-5">
                      <div className="h-px w-full bg-slate-800 mb-4"></div>
                      <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Feedback Form */}
          <div className="glass-panel p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80">
            <h2 className="text-xl font-bold text-white mb-2">Send Feedback</h2>
            <p className="text-sm text-slate-400 mb-6">Found a bug or have a suggestion? Let our developers know.</p>
            
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Message</label>
                <textarea 
                  rows="4" 
                  placeholder="Describe your issue or suggestion..."
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-slate-700 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all resize-none"
                ></textarea>
              </div>
              <button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>Submit Feedback</span>
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
