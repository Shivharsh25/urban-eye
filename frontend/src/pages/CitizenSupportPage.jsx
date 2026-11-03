import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Headphones, 
  Search, 
  AlertTriangle, 
  Phone, 
  Droplets, 
  PlusCircle, 
  Compass, 
  Bell, 
  Shield, 
  MessageSquare, 
  ChevronRight, 
  ChevronUp, 
  ChevronDown, 
  Mail, 
  Wrench, 
  PhoneCall, 
  ExternalLink, 
  Check, 
  X, 
  Send, 
  Star, 
  FileText, 
  HelpCircle,
  ThumbsUp,
  BookOpen,
  Info
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function CitizenSupportPage() {
  const { t } = useLanguage();

  // Search query for FAQs
  const [searchQuery, setSearchQuery] = useState('');

  // FAQ Accordion open index (default index 0 open)
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Active modals: 'chat' | 'bug' | 'callback' | 'feedback' | 'resource' | null
  const [activeModal, setActiveModal] = useState(null);
  const [resourceModalContent, setResourceModalContent] = useState(null);

  // Feedback state
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');

  // Callback request state
  const [callbackData, setCallbackData] = useState({ name: '', phone: '', timeSlot: 'Morning (9 AM - 12 PM)' });

  // Technical bug report state
  const [bugData, setBugData] = useState({ category: 'App Crash / Lag', description: '' });

  // Live Chat state
  const [chatMessages, setChatMessages] = useState([
    { sender: 'agent', text: 'Hello! I am Urban EYE Civic Support. How can I assist you today?' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Toast message
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  // FAQs list matching the screenshot
  const faqs = [
    {
      q: 'How do I submit a report?',
      a: "Go to Report Issue, select the issue category (e.g., road, water, sanitation), add details and photos, choose the location and submit. You'll get a tracking ID to follow its status."
    },
    {
      q: 'How can I track my report?',
      a: "Visit 'My Tracking' in the sidebar or enter your report ID (e.g. #UE-7842) in the search bar to inspect live progress, assigned field crews, and resolution proofs."
    },
    {
      q: 'Can I report anonymously?',
      a: "Yes. Open Settings > Privacy & Data and toggle 'Anonymous Reporting'. Your personal name and email will remain completely shielded from community feeds."
    },
    {
      q: 'What happens after a report is verified?',
      a: "Once verified by the automated YOLO vision engine or municipal dispatch officers, a digital work order is generated and assigned to field crews for rapid repair."
    },
    {
      q: 'How do I edit or withdraw a report?',
      a: "You can update details or withdraw an active report directly from the 'View Details' modal in My Tracking prior to crew dispatch."
    }
  ];

  // Filtered FAQs based on user search
  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    const q = searchQuery.toLowerCase();
    return faqs.filter(f => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q));
  }, [searchQuery, faqs]);

  // Send message in Live Chat
  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');

    // Simulated automated assistant response
    setTimeout(() => {
      let reply = "Thank you for reaching out! A city support representative has logged your query and will assist shortly.";
      const lower = userMsg.toLowerCase();
      if (lower.includes('pothole') || lower.includes('road')) {
        reply = "For road hazards and potholes, please use 'Report Issue' with GPS geotagging so our Public Works crew is routed immediately.";
      } else if (lower.includes('water') || lower.includes('leak')) {
        reply = "Water disruptions can be monitored in Community Alerts or reported directly to Jal Board hotline (1916).";
      } else if (lower.includes('track') || lower.includes('status')) {
        reply = "You can view real-time status in 'My Tracking' on the sidebar.";
      }
      setChatMessages(prev => [...prev, { sender: 'agent', text: reply }]);
    }, 700);
  };

  // Submit Callback
  const handleCallbackSubmit = (e) => {
    e.preventDefault();
    if (!callbackData.phone.trim()) return;
    setActiveModal(null);
    showToast(`Callback requested! Our officer will call ${callbackData.phone} during ${callbackData.timeSlot}.`);
  };

  // Submit Bug Report
  const handleBugSubmit = (e) => {
    e.preventDefault();
    if (!bugData.description.trim()) return;
    setActiveModal(null);
    showToast('Technical issue report submitted to the engineering team. Thank you!');
  };

  // Submit Feedback
  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    setActiveModal(null);
    showToast('Thank you for helping us improve Urban EYE!');
  };

  // Resource Modals helper
  const openResourceModal = (title, body) => {
    setResourceModalContent({ title, body });
    setActiveModal('resource');
  };

  return (
    <div className="w-full max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-slate-900 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-2xl flex items-center gap-2 backdrop-blur-md animate-in fade-in slide-in-from-top-3 border border-[#00897B]/40">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 1. TOP HEADER & SEARCH BAR                                            */}
      {/* ===================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        
        {/* Left Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E6F8F6] border border-[#BDEEE7] flex items-center justify-center text-[#00897B] shrink-0">
            <Headphones className="w-5 h-5 text-[#00897B]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B2027] tracking-tight">
              Help & Support
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Get help, find answers, and reach the right city service.
            </p>
          </div>
        </div>

        {/* Right Search Bar */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for help, topics or FAQs..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-slate-200/90 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#00897B] focus:ring-1 focus:ring-[#00897B] shadow-2xs transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ×
            </button>
          )}
        </div>

      </div>

      {/* ===================================================================== */}
      {/* 2. EMERGENCY HELPLINE STRIP                                           */}
      {/* ===================================================================== */}
      <div className="bg-gradient-to-r from-rose-50/90 via-white to-sky-50/50 border border-rose-100 rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        
        {/* Helpline 1: Emergency 112 */}
        <a 
          href="tel:112"
          className="flex items-center gap-3.5 group cursor-pointer"
          title="Dial Emergency 112"
        >
          <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] flex items-center justify-center text-[#DC2626] shrink-0 group-hover:scale-105 transition-transform">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-rose-700 leading-tight">
              Emergency? Call 112
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              For life-threatening situations (Police / Fire / Medical).
            </p>
          </div>
        </a>

        {/* Divider for desktop */}
        <div className="hidden md:block w-px h-10 bg-slate-200/80"></div>

        {/* Helpline 2: Municipal Helpline */}
        <a
          href="tel:311"
          className="flex items-center gap-3.5 group cursor-pointer"
          title="Call Municipal Helpline 311"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 group-hover:scale-105 transition-transform">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 leading-tight">
              Municipal Helpline
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              For general civic queries
            </p>
          </div>
        </a>

        {/* Divider for desktop */}
        <div className="hidden md:block w-px h-10 bg-slate-200/80"></div>

        {/* Helpline 3: Water Services */}
        <a
          href="tel:1916"
          className="flex items-center gap-3.5 group cursor-pointer"
          title="Call Jal Board Water Services 1916"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 shrink-0 group-hover:scale-105 transition-transform">
            <Droplets className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 leading-tight">
              Water Services
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              For supply & leakage issues
            </p>
          </div>
        </a>

      </div>

      {/* ===================================================================== */}
      {/* 3. FOUR TOPIC ACTION CARDS                                            */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Report an Issue */}
        <Link
          to="/report"
          className="bg-white hover:bg-slate-50/80 border border-[#D5EFEA] hover:border-[#00897B]/50 rounded-2xl p-4 flex items-center justify-between shadow-2xs hover:shadow-xs transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E6F8F6] border border-[#BDEEE7] flex items-center justify-center text-[#00897B] shrink-0 group-hover:scale-105 transition-transform">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#00897B] transition-colors">
                Report an Issue
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Raise a new civic report
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#00897B] group-hover:translate-x-0.5 transition-all" />
        </Link>

        {/* Card 2: Track a Report */}
        <Link
          to="/tracking"
          className="bg-white hover:bg-slate-50/80 border border-[#D5EFEA] hover:border-[#00897B]/50 rounded-2xl p-4 flex items-center justify-between shadow-2xs hover:shadow-xs transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E6F8F6] border border-[#BDEEE7] flex items-center justify-center text-[#00897B] shrink-0 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#00897B] transition-colors">
                Track a Report
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Check status and updates
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#00897B] group-hover:translate-x-0.5 transition-all" />
        </Link>

        {/* Card 3: Alerts & Notifications */}
        <Link
          to="/alerts"
          className="bg-white hover:bg-slate-50/80 border border-[#D5EFEA] hover:border-[#00897B]/50 rounded-2xl p-4 flex items-center justify-between shadow-2xs hover:shadow-xs transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E6F8F6] border border-[#BDEEE7] flex items-center justify-center text-[#00897B] shrink-0 group-hover:scale-105 transition-transform">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#00897B] transition-colors">
                Alerts & Notifications
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Manage city alerts
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#00897B] group-hover:translate-x-0.5 transition-all" />
        </Link>

        {/* Card 4: Account & Privacy */}
        <Link
          to="/settings"
          className="bg-white hover:bg-slate-50/80 border border-[#D5EFEA] hover:border-[#00897B]/50 rounded-2xl p-4 flex items-center justify-between shadow-2xs hover:shadow-xs transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E6F8F6] border border-[#BDEEE7] flex items-center justify-center text-[#00897B] shrink-0 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#00897B] transition-colors">
                Account & Privacy
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Update your profile & data
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#00897B] group-hover:translate-x-0.5 transition-all" />
        </Link>

      </div>

      {/* ===================================================================== */}
      {/* 4. TWO-COLUMN: FREQUENTLY ASKED QUESTIONS + CONTACT SUPPORT           */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: FREQUENTLY ASKED QUESTIONS (~60% WIDTH) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#D5EFEA] p-5 sm:p-6 shadow-xs space-y-4">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#00897B]" />
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                Frequently Asked Questions
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setOpenFaqIndex(openFaqIndex === -1 ? 0 : -1)}
              className="text-xs font-bold text-[#005C66] hover:text-[#00897B] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>{openFaqIndex === -1 ? 'Expand FAQ' : 'View All FAQ'}</span>
              <span>→</span>
            </button>
          </div>

          {/* Accordion list */}
          <div className="space-y-2.5">
            {filteredFaqs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No FAQs matching "{searchQuery}".
              </div>
            ) : (
              filteredFaqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx || openFaqIndex === -1;

                return (
                  <div
                    key={idx}
                    className={`rounded-2xl border transition-all ${
                      isOpen 
                        ? 'bg-[#E8F8F4]/40 border-[#BDEEE7]' 
                        : 'bg-white hover:bg-slate-50 border-slate-200/80'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen && openFaqIndex !== -1 ? null : idx)}
                      className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
                    >
                      <span className="text-xs sm:text-sm font-bold text-slate-900 pr-3">
                        {faq.q}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-[#00897B] shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-xs text-slate-600 font-medium leading-relaxed border-t border-slate-100/60">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: CONTACT SUPPORT (~40% WIDTH) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#D5EFEA] p-5 sm:p-6 shadow-xs space-y-4">
          
          {/* Header */}
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Headphones className="w-4 h-4 text-[#00897B]" />
            <h2 className="text-sm sm:text-base font-black text-slate-900">
              Contact Support
            </h2>
          </div>

          {/* Channel 1: Email Support */}
          <a
            href="mailto:support@urbaneye.local"
            className="p-3 rounded-2xl border border-slate-100 hover:bg-slate-50/80 transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E6F8F6] border border-[#BDEEE7] flex items-center justify-center text-[#00897B] shrink-0 group-hover:scale-105 transition-transform">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#00897B] transition-colors">
                  Email Support
                </h3>
                <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                  support@urbaneye.local
                </p>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#00897B] transition-colors" />
          </a>

          {/* Channel 2: Live Chat */}
          <div
            onClick={() => setActiveModal('chat')}
            className="p-3 rounded-2xl border border-slate-100 hover:bg-slate-50/80 transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E6F8F6] border border-[#BDEEE7] flex items-center justify-center text-[#00897B] shrink-0 group-hover:scale-105 transition-transform">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#00897B] transition-colors">
                  Live Chat
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Chat with a support agent
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Available</span>
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#00897B] group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>

          {/* Channel 3: Report a Technical Problem */}
          <div
            onClick={() => setActiveModal('bug')}
            className="p-3 rounded-2xl border border-slate-100 hover:bg-slate-50/80 transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E6F8F6] border border-[#BDEEE7] flex items-center justify-center text-[#00897B] shrink-0 group-hover:scale-105 transition-transform">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#00897B] transition-colors">
                  Report a Technical Problem
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Facing an issue with the app? Let us know.
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#00897B] group-hover:translate-x-0.5 transition-all" />
          </div>

          {/* Channel 4: Request a Callback */}
          <div
            onClick={() => setActiveModal('callback')}
            className="p-3 rounded-2xl border border-slate-100 hover:bg-slate-50/80 transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E6F8F6] border border-[#BDEEE7] flex items-center justify-center text-[#00897B] shrink-0 group-hover:scale-105 transition-transform">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#00897B] transition-colors">
                  Request a Callback
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Share your number and we'll get in touch.
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#00897B] group-hover:translate-x-0.5 transition-all" />
          </div>

        </div>

      </div>

      {/* ===================================================================== */}
      {/* 5. FOOTER: MORE RESOURCES & SEND FEEDBACK                             */}
      {/* ===================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-200/80 text-xs text-slate-600 font-medium">
        
        {/* Left Links */}
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-bold text-slate-900">More Resources</span>
          <span className="text-slate-300">|</span>

          <button
            type="button"
            onClick={() => openResourceModal('Safety Guidelines', '1. Maintain a safe distance when photographing road damage or live wires.\n2. Do not enter closed flood zones or sewer manholes.\n3. In medical or fire crises, dial 112 directly rather than logging an app report.')}
            className="flex items-center gap-1.5 hover:text-[#00897B] transition-colors cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>Safety Guidelines</span>
          </button>

          <button
            type="button"
            onClick={() => openResourceModal('Report Escalation Protocol', 'Reports pending resolution for >72 hours are automatically escalated to the Chief Ward Executive Officer and flagged with High Priority dispatch tags.')}
            className="flex items-center gap-1.5 hover:text-[#00897B] transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>Report Escalation</span>
          </button>

          <button
            type="button"
            onClick={() => openResourceModal('Accessibility Standards', 'Urban EYE complies with WCAG 2.1 AA standards, featuring screen reader support, voice dictation, high contrast mode, and multilingual audio speech synthesis.')}
            className="flex items-center gap-1.5 hover:text-[#00897B] transition-colors cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Accessibility</span>
          </button>

          <button
            type="button"
            onClick={() => openResourceModal('Terms & Privacy', 'All GPS data is strictly utilized for public works routing and municipal reporting. Citizen names can be withheld via Settings > Anonymous Reporting.')}
            className="flex items-center gap-1.5 hover:text-[#00897B] transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Terms & Privacy</span>
          </button>
        </div>

        {/* Right Action: Send Feedback Button */}
        <button
          type="button"
          onClick={() => setActiveModal('feedback')}
          className="px-4 py-2 rounded-full border border-[#00897B] text-[#00897B] hover:bg-[#E6F8F6] font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer shrink-0"
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          <span>Send Feedback</span>
        </button>

      </div>

      {/* ===================================================================== */}
      {/* 6. INTERACTIVE MODALS (Chat, Bug, Callback, Feedback, Resource)       */}
      {/* ===================================================================== */}

      {/* MODAL 1: LIVE CHAT */}
      {activeModal === 'chat' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-[#D5EFEA] w-full max-w-lg shadow-2xl flex flex-col h-[520px] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-[#F7FCFB]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E6F8F6] border border-[#BDEEE7] flex items-center justify-center text-[#00897B] shrink-0">
                  <MessageSquare className="w-4 h-4 text-[#00897B]" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Civic Support Assistant</h3>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Live Online</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar bg-slate-50/50">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#005C66] text-white rounded-br-xs shadow-xs'
                        : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-xs shadow-2xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input Form */}
            <form onSubmit={handleSendChatMessage} className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#00897B]"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-[#005C66] hover:bg-[#00474F] text-white cursor-pointer shadow-xs shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REQUEST A CALLBACK */}
      {activeModal === 'callback' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-[#D5EFEA] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#F7FCFB]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E6F8F6] border border-[#BDEEE7] flex items-center justify-center text-[#00897B] shrink-0">
                  <PhoneCall className="w-4 h-4 text-[#00897B]" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Request a Callback</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCallbackSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={callbackData.name}
                  onChange={(e) => setCallbackData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Raj Anand"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#00897B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={callbackData.phone}
                  onChange={(e) => setCallbackData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#00897B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Time</label>
                <select
                  value={callbackData.timeSlot}
                  onChange={(e) => setCallbackData(prev => ({ ...prev, timeSlot: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#00897B]"
                >
                  <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                  <option value="Afternoon (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</option>
                  <option value="Evening (4 PM - 8 PM)">Evening (4 PM - 8 PM)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#005C66] text-white text-xs font-bold hover:bg-[#00474F] shadow-xs transition-all mt-2"
              >
                Schedule Callback
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REPORT A TECHNICAL PROBLEM */}
      {activeModal === 'bug' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-[#D5EFEA] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#F7FCFB]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E6F8F6] border border-[#BDEEE7] flex items-center justify-center text-[#00897B] shrink-0">
                  <Wrench className="w-4 h-4 text-[#00897B]" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Report App Issue</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBugSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Issue Category</label>
                <select
                  value={bugData.category}
                  onChange={(e) => setBugData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#00897B]"
                >
                  <option value="Camera / Photo Upload Error">Camera / Photo Upload Error</option>
                  <option value="GPS / Location Pin Offset">GPS / Location Pin Offset</option>
                  <option value="Notifications Not Received">Notifications Not Received</option>
                  <option value="App Crash / Lag">App Crash / Lag</option>
                  <option value="Other Bug">Other Bug</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Describe the problem</label>
                <textarea
                  rows="3"
                  required
                  value={bugData.description}
                  onChange={(e) => setBugData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What happened? What error message appeared?"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#00897B]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#005C66] text-white text-xs font-bold hover:bg-[#00474F] shadow-xs transition-all mt-2"
              >
                Submit Bug Report
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: SEND FEEDBACK */}
      {activeModal === 'feedback' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-[#D5EFEA] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#F7FCFB]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E6F8F6] border border-[#BDEEE7] flex items-center justify-center text-[#00897B] shrink-0">
                  <ThumbsUp className="w-4 h-4 text-[#00897B]" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Send App Feedback</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Rate Your Experience</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className="p-1 cursor-pointer hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= feedbackRating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Suggestions</label>
                <textarea
                  rows="3"
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="How can we make Urban EYE more useful for your neighborhood?"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#00897B]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#005C66] text-white text-xs font-bold hover:bg-[#00474F] shadow-xs transition-all mt-2"
              >
                Submit Feedback
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: RESOURCE POLICY MODAL */}
      {activeModal === 'resource' && resourceModalContent && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-[#D5EFEA] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#F7FCFB]">
              <h3 className="text-sm font-bold text-slate-900">{resourceModalContent.title}</h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600 font-medium leading-relaxed whitespace-pre-line">
                {resourceModalContent.body}
              </p>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-full py-2.5 rounded-xl bg-[#005C66] text-white text-xs font-bold hover:bg-[#00474F]"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
