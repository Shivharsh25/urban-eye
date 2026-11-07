import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DemoVideoPlayer from '../components/DemoVideoPlayer';
import Logo from '../components/Logo';
import {
  ShieldCheck,
  Shield,
  ArrowRight,
  ExternalLink,
  Zap,
  Layers,
  BarChart3,
  Users,
  Landmark,
  TrendingUp,
  Camera,
  Share2,
  Settings,
  Check,
  User,
  Building2,
  Play,
  Quote,
  Github,
  Linkedin,
  Youtube,
  Mail,
  MapPin,
  X,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Cpu,
  Eye,
  Copy,
  CheckCheck,
  FileText,
  Code,
  HelpCircle,
  Phone,
  ShieldAlert,
  Globe,
  Clock,
  AlertTriangle,
  Lock,
  Compass,
  AlertCircle,
  Timer,
  CheckCircle2,
  Truck,
  Activity,
  Menu
} from 'lucide-react';

export default function LandingPage() {
  const { user, isSuperAdmin, isDeptAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Home');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Modals for Resources & Legal
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [activeDocTab, setActiveDocTab] = useState('architecture');
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [activeApiTab, setActiveApiTab] = useState('reports');
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [legalModal, setLegalModal] = useState(null); // 'privacy' | 'terms' | 'accessibility' | null
  const [copiedKey, setCopiedKey] = useState('');
  const [supportSubmitted, setSupportSubmitted] = useState(false);
  const [supportForm, setSupportForm] = useState({ name: '', email: '', subject: '', message: '' });

  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState(0);

  const testimonials = [
    {
      quote: "Urban Eye has made city issue reporting simple and effective. The response is faster and more transparent than ever.",
      author: "Aarav Mehta",
      role: "City Resident"
    },
    {
      quote: "The autonomous AI triage routes pothole and drainage hazards directly to our field teams within seconds.",
      author: "Sunita Sharma",
      role: "Sanitation Lead Officer"
    },
    {
      quote: "Executive oversight of all 5 municipal departments with tamper-proof audit trails has revolutionized city governance.",
      author: "Rajesh Mehra",
      role: "PWD Chief Engineer"
    }
  ];

  const faqs = [
    {
      q: "How does Urban Eye's AI detect urban civic issues?",
      a: "Urban Eye utilizes real-time Computer Vision (YOLOv8) models trained on municipal urban hazards. When citizens upload photos or municipal dashcam feeds stream footage, the model identifies issues (potholes, garbage overflows, broken streetlights, encroachments) with high confidence scores, extracts GPS coordinates, and automatically blurs civilian faces and license plates for privacy."
    },
    {
      q: "How are reported complaints automatically routed to departments?",
      a: "Our intelligent routing engine maps detected categories directly to responsible municipal authorities (e.g., potholes to Roads & PWD, garbage to Sanitation & Solid Waste, streetlights to Electrical Works). It factors in municipal ward boundaries, geographic coordinates, and active department SLAs to assign the complaint without manual sorting delays."
    },
    {
      q: "Can citizens track resolution progress in real time?",
      a: "Yes. Every report receives a unique tracking ID and live status timeline (Pending → In Progress → Resolved). Once field teams fix the issue, officers upload timestamped, geo-verified resolution photos, allowing citizens to inspect the visual proof before the complaint is officially closed."
    },
    {
      q: "What happens if a department fails to resolve an issue within the SLA?",
      a: "If a department exceeds its guaranteed resolution window (e.g., 24h for sanitation, 48h for road potholes), the system triggers automated priority escalation, notifying the Executive Department Admin and logging an entry in the Super Admin tamper-proof audit trail for executive accountability."
    },
    {
      q: "Is citizen personal information protected?",
      a: "Absolutely. Urban Eye complies with data protection standards. All uploaded media undergoes automated PII redaction (faces, vehicle plates). Personal phone numbers and emails are encrypted and only accessible to verified officers for critical dispatch follow-ups."
    },
    {
      q: "How do municipal departments and officers onboard onto Urban Eye?",
      a: "Department administrators apply via the Admin Request portal with municipal credentials. Super Admins verify municipal officer identities, assign administrative scopes, and configure department response rules before granting access to the Executive Command Center."
    }
  ];

  // Helper to scroll smoothly to section
  const scrollToSection = (id, tabName) => {
    setActiveTab(tabName);
    setMobileNavOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    setSupportSubmitted(true);
    setTimeout(() => {
      setSupportSubmitted(false);
      setSupportForm({ name: '', email: '', subject: '', message: '' });
      setSupportModalOpen(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-[#00A86B]/20 selection:text-[#004D40]">
      
      {/* ======================================================== */}
      {/* 1. TOP HEADER & NAVBAR (EXACT REFERENCE DESIGN)          */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Left: Brand Logo & Title */}
          <Link to="/" className="flex items-center group cursor-pointer shrink-0">
            <Logo size="sm" theme="light" subtitle="Active Watch" />
          </Link>

          {/* Center: Main Nav Links (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8 text-base font-semibold text-slate-600">
            {[
              { label: 'Home', id: 'hero' },
              { label: 'Features', id: 'features' },
              { label: 'Use Cases', id: 'use-cases' },
              { label: 'How It Works', id: 'how-it-works' },
              { label: 'Impact', id: 'impact' },
              { label: 'About', id: 'about' },
              { label: 'FAQs', id: 'faqs' }
            ].map((nav) => (
              <button
                key={nav.label}
                onClick={() => scrollToSection(nav.id, nav.label)}
                className={`transition-colors pb-1 relative cursor-pointer ${
                  activeTab === nav.label
                    ? 'text-[#00A86B] font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                {nav.label}
                {activeTab === nav.label && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#00A86B] rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Right: Portals Action Buttons & Mobile Hamburger */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Citizen Portal Button (Tablet & Desktop) */}
            <Link
              to="/login"
              className="hidden sm:inline-flex px-4 py-2 rounded-xl border border-slate-200 hover:border-[#00897B] text-slate-800 font-bold text-sm items-center space-x-1.5 shadow-2xs hover:bg-slate-50 transition-all cursor-pointer"
            >
              <User className="w-4 h-4 text-slate-600" />
              <span>Citizen Portal</span>
            </Link>

            {/* Admin Portal Button (Tablet & Desktop) */}
            <Link
              to="/admin-login"
              className="hidden sm:inline-flex px-4 py-2 rounded-xl bg-[#003840] hover:bg-[#002B31] text-white font-bold text-sm items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Admin Portal</span>
            </Link>

            {/* Compact Login Button (Mobile only) */}
            <Link
              to="/login"
              className="sm:hidden px-3 py-1.5 rounded-lg bg-[#003840] text-white font-bold text-xs flex items-center space-x-1 shadow-2xs"
            >
              <User className="w-3.5 h-3.5 text-emerald-300" />
              <span>Login</span>
            </Link>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileNavOpen(prev => !prev)}
              className="lg:hidden w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileNavOpen ? <X className="w-5 h-5 text-rose-500" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer (Dropdown) */}
        {mobileNavOpen && (
          <div className="lg:hidden bg-white/98 backdrop-blur-md border-b border-slate-200 shadow-lg px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-100">
              <Link
                to="/login"
                onClick={() => setMobileNavOpen(false)}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center space-x-1.5"
              >
                <User className="w-4 h-4 text-slate-600" />
                <span>Citizen Portal</span>
              </Link>
              <Link
                to="/admin-login"
                onClick={() => setMobileNavOpen(false)}
                className="p-2.5 rounded-xl bg-[#003840] text-white font-bold text-xs flex items-center justify-center space-x-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Admin Portal</span>
              </Link>
            </div>

            <nav className="flex flex-col space-y-1 text-sm font-semibold text-slate-700">
              {[
                { label: 'Home', id: 'hero' },
                { label: 'Features', id: 'features' },
                { label: 'Use Cases', id: 'use-cases' },
                { label: 'How It Works', id: 'how-it-works' },
                { label: 'Impact', id: 'impact' },
                { label: 'About', id: 'about' },
                { label: 'FAQs', id: 'faqs' }
              ].map((nav) => (
                <button
                  key={nav.label}
                  onClick={() => scrollToSection(nav.id, nav.label)}
                  className={`px-3 py-2 text-left rounded-lg transition-colors cursor-pointer ${
                    activeTab === nav.label
                      ? 'bg-[#E8F8F0] text-[#00A86B] font-bold'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  {nav.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* ======================================================== */}
      {/* 2. HERO SECTION (EXACT MATCH TO REFERENCE DESIGN)       */}
      {/* ======================================================== */}
      <section id="hero" className="relative pt-10 pb-12 sm:pt-14 sm:pb-16 lg:pt-20 lg:pb-24 overflow-hidden bg-white">
        
        {/* City Skyline Background (Right Side, vibrant 100% clarity, matching reference image) */}
        <div className="absolute right-0 top-0 bottom-0 w-full lg:w-[62%] xl:w-[60%] h-full pointer-events-none z-0 overflow-hidden">
          <img
            src="/hero-city-full.jpg"
            alt="Urban Eye Smart City Skyline"
            className="w-full h-full object-cover object-right sm:object-center lg:object-right-bottom"
          />
          {/* Smooth horizontal gradient: solid white on left, gently fading into city on right */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent lg:via-white/35" />
        </div>

        {/* Bottom Organic Curved White Swoop (matching the reference image curve under trees) */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-0 overflow-hidden">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-14 sm:h-20 lg:h-28 text-white preserve-3d"
          >
            <path
              d="M0,120 L0,35 Q480,10 760,55 T1440,25 L1440,120 Z"
              fill="#ffffff"
            />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl lg:max-w-2xl xl:max-w-3xl space-y-6 sm:space-y-7">
            
            {/* Top Pill Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#E8F8F0] border border-[#A7F3D0]/60 text-[#00695C] text-xs sm:text-sm font-bold shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-[#00897B]" />
              <span>AI-Powered City Governance</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-[64px] xl:text-[70px] font-black text-[#0A262C] tracking-tight leading-[1.08]">
              Smarter Cities,<br />
              <span className="text-[#00897B]">Faster Resolution</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl lg:text-[22px] text-slate-600 leading-relaxed font-medium max-w-xl">
              A unified platform that detects urban issues in real time, intelligently routes them to the right department, and ensures transparent, faster resolution.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 pt-2">
              <Link
                to="/login"
                className="px-7 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-[#054E45] hover:bg-[#033B34] text-white font-bold text-base sm:text-lg flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all cursor-pointer group"
              >
                <span>Get Started</span>
                <span className="text-lg transition-transform group-hover:translate-x-1">→</span>
              </Link>

              <button
                type="button"
                onClick={() => setDemoModalOpen(true)}
                className="px-6 sm:px-7 py-3.5 sm:py-4 rounded-xl border-2 border-[#00897B] bg-white hover:bg-slate-50 text-[#0A262C] font-bold text-base sm:text-lg flex items-center justify-center space-x-2.5 shadow-2xs transition-all cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full border-2 border-[#00897B] flex items-center justify-center text-[#00897B]">
                  <Play className="w-2.5 h-2.5 fill-[#00897B] ml-0.5" />
                </div>
                <span>Watch Demo</span>
              </button>
            </div>

            {/* 4 Feature Highlights Beneath CTA (with vertical dividers matching reference image) */}
            <div className="pt-6 sm:pt-8 grid grid-cols-2 gap-4 sm:flex sm:items-center sm:gap-6 lg:gap-8">
              {/* Feature 1 */}
              <div className="flex items-center space-x-2.5">
                <Zap className="w-5 h-5 text-[#00897B] shrink-0" />
                <div className="text-left text-xs sm:text-sm font-bold text-[#0A262C] leading-tight">
                  <div>Real-time</div>
                  <div>Detection</div>
                </div>
              </div>

              {/* Vertical divider */}
              <div className="hidden sm:block h-8 w-[1px] bg-slate-200 shrink-0" />

              {/* Feature 2 */}
              <div className="flex items-center space-x-2.5">
                <Layers className="w-5 h-5 text-[#00897B] shrink-0" />
                <div className="text-left text-xs sm:text-sm font-bold text-[#0A262C] leading-tight">
                  <div>Auto</div>
                  <div>Routing</div>
                </div>
              </div>

              {/* Vertical divider */}
              <div className="hidden sm:block h-8 w-[1px] bg-slate-200 shrink-0" />

              {/* Feature 3 */}
              <div className="flex items-center space-x-2.5">
                <BarChart3 className="w-5 h-5 text-[#00897B] shrink-0" />
                <div className="text-left text-xs sm:text-sm font-bold text-[#0A262C] leading-tight">
                  <div>Department</div>
                  <div>Coordination</div>
                </div>
              </div>

              {/* Vertical divider */}
              <div className="hidden sm:block h-8 w-[1px] bg-slate-200 shrink-0" />

              {/* Feature 4 */}
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="w-5 h-5 text-[#00897B] shrink-0" />
                <div className="text-left text-xs sm:text-sm font-bold text-[#0A262C] leading-tight">
                  <div>Transparent</div>
                  <div>Tracking</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. IMPACT SECTION (HIGH-LEVEL STATS + CONCRETE RESULTS)  */}
      {/* ======================================================== */}
      <section id="impact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-20 mb-8 lg:mb-12">
        
        {/* Top 4 Primary Metric Stat Cards */}
        <div className="bg-[#F4FBF7] border border-emerald-100 rounded-3xl p-5 sm:p-8 shadow-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6 md:gap-8 md:divide-x divide-emerald-100/80">
            
            {/* Stat 1 */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-[#D4F4E4] text-[#00695C] flex items-center justify-center shrink-0 shadow-2xs">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0A262C] block">1M+</span>
                <span className="text-sm sm:text-base font-bold text-slate-600">Citizens Covered</span>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="flex items-center space-x-3 sm:space-x-4 md:pl-6 lg:pl-8">
              <div className="w-12 h-12 rounded-2xl bg-[#D4F4E4] text-[#00695C] flex items-center justify-center shrink-0 shadow-2xs">
                <Landmark className="w-6 h-6" />
              </div>
              <div>
                <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0A262C] block">50+</span>
                <span className="text-sm sm:text-base font-bold text-slate-600">Departments</span>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="flex items-center space-x-3 sm:space-x-4 md:pl-6 lg:pl-8">
              <div className="w-12 h-12 rounded-2xl bg-[#D4F4E4] text-[#00695C] flex items-center justify-center shrink-0 shadow-2xs">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0A262C] block">5+</span>
                <span className="text-sm sm:text-base font-bold text-slate-600">Issue Categories</span>
              </div>
            </div>

            {/* Stat 4 */}
            <div className="flex items-center space-x-3 sm:space-x-4 md:pl-6 lg:pl-8">
              <div className="w-12 h-12 rounded-2xl bg-[#D4F4E4] text-[#00695C] flex items-center justify-center shrink-0 shadow-2xs">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0A262C] block">95%</span>
                <span className="text-sm sm:text-base font-bold text-slate-600">Faster Resolution</span>
              </div>
            </div>

          </div>
        </div>

        {/* Concrete Real-World Municipal Impact Breakdown */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
          
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-start space-x-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#00A86B] flex items-center justify-center shrink-0">
              <Timer className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#00A86B]">Turnaround Velocity</span>
              <h4 className="text-lg sm:text-xl font-black text-[#0A262C] mt-0.5">&lt; 36 Hours Average</h4>
              <p className="text-sm sm:text-base text-slate-600 mt-1 leading-relaxed">
                Replaces slow 14-day manual paperwork cycles with instant automated ticket dispatch to field teams.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-start space-x-4">
            <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-sky-600">Dual Verification</span>
              <h4 className="text-lg sm:text-xl font-black text-[#0A262C] mt-0.5">98.4% Proof Verified</h4>
              <p className="text-sm sm:text-base text-slate-600 mt-1 leading-relaxed">
                Every closed complaint requires geo-stamped photographic evidence verified by both AI and citizen feedback.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-start space-x-4">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-purple-600">Municipal Operations</span>
              <h4 className="text-lg sm:text-xl font-black text-[#0A262C] mt-0.5">34% Cost Savings</h4>
              <p className="text-sm sm:text-base text-slate-600 mt-1 leading-relaxed">
                Smart spatial clustering groups nearby hazards, optimizing heavy machinery routes and municipal labor.
              </p>
            </div>
          </div>

        </div>

      </section>

      {/* ======================================================== */}
      {/* 4. HOW IT WORKS (RICH 4-STEP PIPELINE)                   */}
      {/* ======================================================== */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 border-t border-slate-100">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#E8F8F0] text-[#00695C] text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#00A86B]" />
            <span>The Autonomous Civic Pipeline</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0A262C] tracking-tight">
            From Hazard to Resolution in 4 Steps
          </h2>
          <p className="mt-2 text-base sm:text-lg text-slate-600 font-medium">
            How Urban Eye bridges citizens, edge neural networks, and municipal field crews into an automated workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          
          {/* Step 1: Detect */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-[#E8F8F0] text-[#00A86B] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-black tracking-wider">
                  STEP 01
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-[#0A262C]">
                Intelligent Hazard Capture
              </h3>
              <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed mt-2.5">
                Citizens snap photos or dashcams stream road footage. YOLOv8 scans the media in &lt; 280ms, classifies the hazard, tags GPS coordinates, and automatically blurs faces and license plates.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-1.5">
              <span className="px-2.5 py-1 rounded bg-emerald-50 text-[#00A86B] font-bold text-xs">YOLOv8 Vision</span>
              <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-600 font-medium text-xs">Auto-PII Blur</span>
              <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-600 font-medium text-xs">GPS EXIF</span>
            </div>
          </div>

          {/* Step 2: Route */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <Share2 className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-black tracking-wider">
                  STEP 02
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-[#0A262C]">
                Neural Ward Triage & Routing
              </h3>
              <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed mt-2.5">
                Zero manual sorting. Our dynamic routing engine maps the issue to the exact municipal ward boundary and department (PWD, Sanitation, Electrical) while starting an automated SLA resolution clock.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-1.5">
              <span className="px-2.5 py-1 rounded bg-sky-50 text-sky-600 font-bold text-xs">Ward Geofencing</span>
              <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-600 font-medium text-xs">Auto-SLA Clock</span>
              <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-600 font-medium text-xs">Zero Delay</span>
            </div>
          </div>

          {/* Step 3: Resolve */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <Settings className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-black tracking-wider">
                  STEP 03
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-[#0A262C]">
                Field Action & Proof Upload
              </h3>
              <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed mt-2.5">
                Field repair units receive prioritized dispatch tickets on their portal with turn-by-turn navigation. Upon completing repairs, officers capture live timestamped "Resolution Photo Proof" on-site.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-1.5">
              <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-600 font-bold text-xs">Field Triage</span>
              <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-600 font-medium text-xs">Photo Proof</span>
              <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-600 font-medium text-xs">Live Dispatch</span>
            </div>
          </div>

          {/* Step 4: Track */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <CheckCheck className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-black tracking-wider">
                  STEP 04
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-[#0A262C]">
                Dual Verification & Audit
              </h3>
              <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed mt-2.5">
                The resolution proof is cryptographically logged into the Super Admin audit trail. Citizens receive SMS alerts with the proof photo and can verify or dispute closure before ticket archival.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-1.5">
              <span className="px-2.5 py-1 rounded bg-purple-50 text-purple-600 font-bold text-xs">Citizen Alert</span>
              <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-600 font-medium text-xs">Audit Sealed</span>
              <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-600 font-medium text-xs">100% Verified</span>
            </div>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. A PLATFORM FOR EVERY STAKEHOLDER (ROLE-BASED PORTALS) */}
      {/* ======================================================== */}
      <section id="features" className="bg-[#F8FCF9] border-y border-emerald-50 py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0A262C] tracking-tight">
              A Platform for Every Stakeholder
            </h2>
            <p className="mt-2 text-base sm:text-lg text-slate-600 font-medium">
              Role-based portals tailored for citizens, departments, and city administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Citizen Portal */}
            <Link
              to="/login"
              className="bg-white border border-emerald-100/90 rounded-3xl p-7 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#E8F8F0] text-[#00A86B] flex items-center justify-center shadow-2xs mb-5">
                  <User className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-[#0A262C] group-hover:text-[#00A86B] transition-colors">
                  Citizen Portal
                </h3>
                <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed mt-2.5">
                  Report civic hazards with GPS geotags, track resolution timelines, and receive SMS alerts.
                </p>
              </div>
              <div className="mt-6 flex items-center space-x-2 text-sm sm:text-base font-bold text-[#00A86B]">
                <span>Launch Citizen Portal</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Card 2: Department Portal */}
            <Link
              to="/admin-login"
              className="bg-white border border-sky-100 rounded-3xl p-7 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shadow-2xs mb-5">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-[#0A262C] group-hover:text-sky-600 transition-colors">
                  Department Portal
                </h3>
                <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed mt-2.5">
                  Municipal officers receive auto-triaged tickets, coordinate field dispatch, and upload photo proof.
                </p>
              </div>
              <div className="mt-6 flex items-center space-x-2 text-sm sm:text-base font-bold text-sky-600">
                <span>Department Staff Login</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Card 3: Super Admin Portal */}
            <Link
              to="/admin-login"
              className="bg-white border border-purple-100 rounded-3xl p-7 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-2xs mb-5">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-[#0A262C] group-hover:text-purple-600 transition-colors">
                  Super Admin Portal
                </h3>
                <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed mt-2.5">
                  Executive oversight over all 5 departments, AI confidence thresholds, and tamper-proof audit trails.
                </p>
              </div>
              <div className="mt-6 flex items-center space-x-2 text-sm sm:text-base font-bold text-purple-600">
                <span>Command Center Login</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. KEY USE CASES (EXPANDED REAL-WORLD CIVIC DOSSIERS)     */}
      {/* ======================================================== */}
      <section id="use-cases" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#E8F8F0] text-[#00695C] text-xs font-bold mb-3">
            <Layers className="w-3.5 h-3.5 text-[#00A86B]" />
            <span>Targeted Municipal Domains</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0A262C] tracking-tight">
            Key Civic Use Cases
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 font-medium">
            Real-world urban challenges with concrete department assignments, SLA targets, and AI verification.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Use Case 1: Pothole */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="h-44 w-full overflow-hidden bg-slate-100 relative">
                <img
                  src="/usecase-pothole.jpg?v=3"
                  alt="Pothole Detection"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-amber-500 text-white font-black text-[10px] tracking-wider shadow-sm">
                  HIGH SEVERITY
                </span>
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/95 text-slate-800 font-bold text-[10px] shadow-sm flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-amber-500" />
                  <span>48h SLA</span>
                </span>
              </div>
              
              <div className="p-5 space-y-3">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-[#0A262C]">
                    Pothole & Surface Damage
                  </h3>
                  <span className="text-sm sm:text-base font-bold text-[#00A86B] block mt-0.5">
                    Roads & Public Works Dept (PWD)
                  </span>
                </div>
                <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
                  Detects asphalt craters, depth fractures, and vehicular hazard radius. Automatically queues bitumen repair teams and updates the city road quality index.
                </p>
              </div>
            </div>

            <div className="p-5 pt-0">
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>AI Confidence: &gt; 82%</span>
                <span className="text-slate-700 font-bold">Auto-Triage Active</span>
              </div>
            </div>
          </div>

          {/* Use Case 2: Garbage */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="h-44 w-full overflow-hidden bg-slate-100 relative">
                <img
                  src="/usecase-garbage.jpg?v=3"
                  alt="Garbage Monitoring"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-rose-500 text-white font-black text-xs tracking-wider shadow-sm">
                  HYGIENE HAZARD
                </span>
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/95 text-slate-800 font-bold text-xs shadow-sm flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-rose-500" />
                  <span>24h SLA</span>
                </span>
              </div>
              
              <div className="p-5 space-y-3">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-[#0A262C]">
                    Garbage & Waste Overflows
                  </h3>
                  <span className="text-sm sm:text-base font-bold text-[#00A86B] block mt-0.5">
                    Sanitation & Solid Waste Dept
                  </span>
                </div>
                <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
                  Identifies overflowing community dumpsters and illegal roadside trash piles. Dispatches compactor collection trucks with optimized pickup routes.
                </p>
              </div>
            </div>

            <div className="p-5 pt-0">
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>AI Confidence: &gt; 88%</span>
                <span className="text-slate-700 font-bold">Sanitation Fleet GPS</span>
              </div>
            </div>
          </div>

          {/* Use Case 3: Streetlight */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="h-44 w-full overflow-hidden bg-slate-100 relative">
                <img
                  src="/usecase-streetlight.jpg?v=3"
                  alt="Streetlight Management"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-amber-500 text-white font-black text-xs tracking-wider shadow-sm">
                  SAFETY CRITICAL
                </span>
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/95 text-slate-800 font-bold text-xs shadow-sm flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>24h SLA</span>
                </span>
              </div>
              
              <div className="p-5 space-y-3">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-[#0A262C]">
                    Streetlight & Grid Faults
                  </h3>
                  <span className="text-sm sm:text-base font-bold text-[#00A86B] block mt-0.5">
                    Electrical & Street Lighting Dept
                  </span>
                </div>
                <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
                  Detects unlit night corridors, damaged light fixtures, and exposed wiring. Prevents dark-zone crime and pedestrian road accidents.
                </p>
              </div>
            </div>

            <div className="p-5 pt-0">
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>AI Confidence: &gt; 85%</span>
                <span className="text-slate-700 font-bold">Grid Pole Mapping</span>
              </div>
            </div>
          </div>

          {/* Use Case 4: Encroachment */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="h-44 w-full overflow-hidden bg-slate-100 relative">
                <img
                  src="/usecase-encroachment.jpg?v=3"
                  alt="Encroachment Alerts"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-blue-600 text-white font-black text-xs tracking-wider shadow-sm">
                  URBAN FLOW
                </span>
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/95 text-slate-800 font-bold text-xs shadow-sm flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>72h SLA</span>
                </span>
              </div>
              
              <div className="p-5 space-y-3">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-[#0A262C]">
                    Encroachment & Walkway Blocks
                  </h3>
                  <span className="text-sm sm:text-base font-bold text-[#00A86B] block mt-0.5">
                    Enforcement & Urban Planning
                  </span>
                </div>
                <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
                  Flags unauthorized commercial stalls, illegal debris dumping, and pedestrian sidewalk blocks, triggering municipal inspection notices.
                </p>
              </div>
            </div>

            <div className="p-5 pt-0">
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>AI Confidence: &gt; 78%</span>
                <span className="text-slate-700 font-bold">Enforcement Logged</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. ABOUT SECTION (MISSION, PROBLEM & SYSTEM ARCHITECTURE) */}
      {/* ======================================================== */}
      <section id="about" className="bg-[#F8FCF9] border-y border-emerald-50 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left Column: Mission & Problem/Solution Story */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#E8F8F0] text-[#00695C] text-xs font-bold mb-3">
                  <Landmark className="w-3.5 h-3.5 text-[#00A86B]" />
                  <span>The Urban Eye Mission</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0A262C] tracking-tight leading-tight">
                  Why Modern Cities Need <span className="text-[#00A86B]">Urban Eye</span>
                </h2>
                <p className="mt-3 text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
                  Traditional civic reporting suffers from bureaucratic disconnects, lost physical complaint slips, and zero visibility. Urban Eye replaces friction with an autonomous civic nervous system.
                </p>
              </div>

              {/* The Problem vs Solution Card */}
              <div className="p-5 rounded-2xl bg-white border border-emerald-100 space-y-3.5 shadow-2xs">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    ✕
                  </div>
                  <div>
                    <h5 className="font-bold text-sm sm:text-base text-slate-800">The Traditional Grievance Bottleneck</h5>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                      Complaints sit unrouted in paper logs for 2-3 weeks. No SLA countdowns, no photo evidence, and zero citizen feedback loops.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 pt-2 border-t border-slate-100">
                  <div className="w-6 h-6 rounded-full bg-[#00A86B] text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <h5 className="font-bold text-sm sm:text-base text-[#00695C]">The Urban Eye Neural Grid</h5>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                      Computer vision validates the hazard in seconds, routes by GPS ward polygons, enforces a 24-48h SLA timer, and seals proof in an audit trail.
                    </p>
                  </div>
                </div>
              </div>

              {/* Municipal Commissioner Quote */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100/90 text-sm sm:text-base italic text-[#0A3B32]">
                "Urban Eye transforms municipal administration from delayed reactive firefighting into an automated, transparent civic service."
              </div>
            </div>

            {/* Right Column: 4 Core Architectural Capabilities */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Capability 1 */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#E8F8F0] text-[#00A86B] flex items-center justify-center">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-[#0A262C]">YOLOv8 Vision at the Edge</h3>
                <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
                  Trained on 50,000+ urban hazard variations to recognize surface fractures, refuse heaps, and lighting outages with &gt; 82% precision while automatically blurring civilian faces and license plates.
                </p>
              </div>

              {/* Capability 2 */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-[#0A262C]">Multi-Department Interop</h3>
                <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
                  Eliminates jurisdictional buck-passing. Tickets automatically flow to PWD, Sanitation, Electrical, or Water departments based on verified category rules and GIS ward polygons.
                </p>
              </div>

              {/* Capability 3 */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-[#0A262C]">Tamper-Proof Audit Trail</h3>
                <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
                  Every status change, department officer re-assignment, and resolution photo is cryptographically recorded in an immutable ledger for 100% public accountability and compliance.
                </p>
              </div>

              {/* Capability 4 */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-[#0A262C]">Predictive Infrastructure Planning</h3>
                <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
                  Citywide spatial heatmaps identify recurring road degradation zones and waste overflow corridors, empowering municipal commissioners to budget resurfacing funds effectively.
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. CITIZEN TESTIMONIAL CARD                              */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Quote */}
          <div className="flex items-start space-x-4 max-w-2xl">
            <Quote className="w-7 h-7 text-[#00A86B] shrink-0 rotate-180" />
            <p className="text-base sm:text-lg text-slate-700 italic font-medium leading-relaxed">
              "{testimonials[activeTestimonial].quote}"
            </p>
          </div>

          {/* Author & Pagination Dots */}
          <div className="flex items-center space-x-6 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#D4F4E4] text-[#00695C] font-black text-sm flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#0A262C] block">
                  {testimonials[activeTestimonial].author}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {testimonials[activeTestimonial].role}
                </span>
              </div>
            </div>

            {/* Dots */}
            <div className="flex items-center space-x-1.5">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTestimonial(idx)}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                    activeTestimonial === idx ? 'w-4 bg-[#00A86B]' : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                  title={`Testimonial ${idx + 1}`}
                />
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 9. FREQUENTLY ASKED QUESTIONS (ACCORDION SECTION)        */}
      {/* ======================================================== */}
      <section id="faqs" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#E8F8F0] text-[#00695C] text-xs font-bold mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0A262C] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-base sm:text-lg text-slate-600 font-medium">
            Everything you need to know about Urban Eye's AI detection, dispatch SLAs, and public transparency.
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-[#F9FCFA] border-emerald-200 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full px-5 sm:px-6 py-4.5 flex items-center justify-between text-left space-x-4 cursor-pointer"
                >
                  <span className="text-base sm:text-lg font-bold text-[#0A262C]">
                    {faq.q}
                  </span>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform ${
                    isOpen ? 'bg-[#00A86B] text-white rotate-180' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-sm sm:text-base text-slate-600 leading-relaxed font-normal border-t border-emerald-100/60">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 10. CALL-TO-ACTION BANNER                                */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="bg-[#EBFBF4] border border-emerald-100/90 rounded-3xl p-8 sm:p-12 shadow-2xs relative overflow-hidden">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0A262C] tracking-tight">
                Build a Cleaner, Safer, and Smarter City
              </h2>
              <p className="text-base sm:text-lg text-slate-600 font-medium mt-1">
                Join Urban Eye and be part of the change.
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <Link
                to="/login"
                className="px-6 py-3.5 rounded-xl bg-[#003840] hover:bg-[#002B31] text-white font-bold text-sm sm:text-base flex items-center space-x-2 shadow-md shadow-emerald-950/20 transition-all cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={() => setDemoModalOpen(true)}
                className="px-5 py-3.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm sm:text-base flex items-center space-x-2 shadow-2xs transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current text-[#00A86B]" />
                <span>Watch Demo</span>
              </button>
            </div>
          </div>

          {/* Line art city skyline silhouette at bottom */}
          <div className="mt-8 pt-4 w-full flex justify-center opacity-70 pointer-events-none">
            <svg className="w-full max-w-2xl h-14" viewBox="0 0 600 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M10 60 L10 50 L25 50 L25 35 L40 35 L40 45 L60 45 L60 25 L80 25 L80 60 M85 60 L85 30 L105 30 L105 45 L120 45 L120 15 L140 15 L140 60 M145 60 L145 35 L165 35 L165 50 L185 50 L185 60 M190 60 L190 40 L210 40 L210 20 L230 20 L230 60 M240 60 L240 15 L265 15 L265 60 M275 60 L275 35 L300 35 L300 60 M310 60 L310 10 L335 10 L335 60 M345 60 L345 30 L370 30 L370 60 M380 60 L380 25 L405 25 L405 60 M415 60 L415 40 L440 40 L440 60 M450 60 L450 20 L475 20 L475 60 M485 60 L485 35 L510 35 L510 60 M520 60 L520 45 L545 45 L545 60 M555 60 L555 30 L580 30 L580 60"
                stroke="#00A86B"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="70" cy="20" r="2" fill="#00A86B" />
              <circle cx="130" cy="10" r="2" fill="#00A86B" />
              <circle cx="322" cy="5" r="2.5" fill="#00A86B" />
              <circle cx="462" cy="15" r="2" fill="#00A86B" />
            </svg>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 11. DARK EMERALD FOOTER WITH ACTIVE FUNCTIONAL LINKS     */}
      {/* ======================================================== */}
      <footer className="bg-[#00272B] text-slate-200 pt-12 sm:pt-14 pb-10 border-t border-[#00383E] landing-footer footer-dark select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 pb-10 border-b border-[#00383E]/80">
            
            {/* Column 1: Brand Info */}
            <div className="space-y-4 sm:col-span-2 lg:col-span-1">
              <Link to="/" className="flex items-center group cursor-pointer">
                <Logo size="sm" theme="dark" subtitle="Active Watch" />
              </Link>
              <p className="text-sm text-slate-300 leading-relaxed font-medium max-w-sm">
                A unified, AI-powered platform for smarter city issue detection, routing, and resolution.
              </p>
              <div className="flex items-center space-x-3 pt-2">
                <a href="https://github.com/Shivharsh25/urban-eye" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-[#003B42] hover:bg-[#004D56] text-white flex items-center justify-center transition-colors shadow-2xs" title="GitHub Repository">
                  <Github className="w-4 h-4 text-white" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-[#003B42] hover:bg-[#004D56] text-white flex items-center justify-center transition-colors shadow-2xs" title="LinkedIn">
                  <Linkedin className="w-4 h-4 text-white" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-[#003B42] hover:bg-[#004D56] text-white flex items-center justify-center transition-colors shadow-2xs" title="YouTube Demo">
                  <Youtube className="w-4 h-4 text-white" />
                </a>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="space-y-3">
              <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D084]" />
                <span>Quick Links</span>
              </h4>
              <ul className="space-y-2 text-sm font-medium text-slate-300">
                <li><button onClick={() => scrollToSection('hero', 'Home')} className="text-slate-300 hover:text-white transition-colors cursor-pointer text-left">Home</button></li>
                <li><button onClick={() => scrollToSection('features', 'Features')} className="text-slate-300 hover:text-white transition-colors cursor-pointer text-left">Features</button></li>
                <li><button onClick={() => scrollToSection('use-cases', 'Use Cases')} className="text-slate-300 hover:text-white transition-colors cursor-pointer text-left">Use Cases</button></li>
                <li><button onClick={() => scrollToSection('how-it-works', 'How It Works')} className="text-slate-300 hover:text-white transition-colors cursor-pointer text-left">How It Works</button></li>
                <li><button onClick={() => scrollToSection('impact', 'Impact')} className="text-slate-300 hover:text-white transition-colors cursor-pointer text-left">Impact</button></li>
                <li><button onClick={() => scrollToSection('about', 'About')} className="text-slate-300 hover:text-white transition-colors cursor-pointer text-left">About</button></li>
                <li><button onClick={() => scrollToSection('faqs', 'FAQs')} className="text-slate-300 hover:text-white transition-colors cursor-pointer text-left">FAQs</button></li>
              </ul>
            </div>

            {/* Column 3: Portals */}
            <div className="space-y-3">
              <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D084]" />
                <span>Portals</span>
              </h4>
              <ul className="space-y-2 text-sm font-medium text-slate-300">
                <li>
                  <Link to="/login" className="text-slate-300 hover:text-white flex items-center space-x-1.5 transition-colors">
                    <span>Citizen Portal</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#00D084]" />
                  </Link>
                </li>
                <li>
                  <Link to="/admin-login" className="text-slate-300 hover:text-white flex items-center space-x-1.5 transition-colors">
                    <span>Department Portal</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#00D084]" />
                  </Link>
                </li>
                <li>
                  <Link to="/admin-login" className="text-slate-300 hover:text-white flex items-center space-x-1.5 transition-colors">
                    <span>Admin Portal</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#00D084]" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Resources */}
            <div className="space-y-3">
              <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D084]" />
                <span>Resources</span>
              </h4>
              <ul className="space-y-2 text-sm font-medium text-slate-300">
                <li>
                  <button
                    onClick={() => setDocModalOpen(true)}
                    className="text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center space-x-1.5"
                  >
                    <span>Documentation</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setApiModalOpen(true)}
                    className="text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center space-x-1.5"
                  >
                    <span>API Reference</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('faqs', 'FAQs')}
                    className="text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center space-x-1.5"
                  >
                    <span>FAQs</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setSupportModalOpen(true)}
                    className="text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center space-x-1.5"
                  >
                    <span>Support</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 5: Get in Touch */}
            <div className="space-y-3">
              <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D084]" />
                <span>Get in Touch</span>
              </h4>
              <ul className="space-y-2.5 text-sm font-medium text-slate-300">
                <li className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-[#00D084] shrink-0" />
                  <a href="mailto:support@urbaneye.gov.in" className="truncate text-slate-300 hover:text-white transition-colors">
                    support@urbaneye.gov.in
                  </a>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-[#00D084] shrink-0" />
                  <span className="text-slate-300">1800-11-2026 (Toll Free)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-[#00D084] shrink-0 mt-0.5" />
                  <span className="text-slate-300 leading-snug">Municipal Centre, New Delhi, India</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Copyright & Legal Links */}
          <div className="pt-8 flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm text-slate-400 font-medium gap-4">
            <div className="text-slate-400">
              &copy; 2026 Urban Eye. All rights reserved.
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:space-x-6">
              <button
                onClick={() => setLegalModal('privacy')}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
              <span className="text-slate-600">|</span>
              <button
                onClick={() => setLegalModal('terms')}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Terms of Use
              </button>
              <span className="text-slate-600">|</span>
              <button
                onClick={() => setLegalModal('accessibility')}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Accessibility
              </button>
            </div>
          </div>

        </div>
      </footer>

      {/* ======================================================== */}
      {/* 12. DOCUMENTATION MODAL                                  */}
      {/* ======================================================== */}
      {docModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E8F8F0] text-[#00A86B] flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#0A262C]">Urban Eye Documentation</h3>
                  <p className="text-xs text-slate-500 font-medium">Complete platform guide, architecture, and portal workflows.</p>
                </div>
              </div>
              <button
                onClick={() => setDocModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Doc Tabs */}
            <div className="flex border-b border-slate-200 px-4 sm:px-6 space-x-4 sm:space-x-6 text-xs font-bold text-slate-600 bg-white overflow-x-auto scrollbar-none">
              {[
                { id: 'architecture', label: 'Platform Architecture' },
                { id: 'citizen', label: 'Citizen Guide' },
                { id: 'dept', label: 'Department Workflow' },
                { id: 'admin', label: 'Super Admin Control' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveDocTab(tab.id)}
                  className={`py-3 border-b-2 transition-all cursor-pointer ${
                    activeDocTab === tab.id
                      ? 'border-[#00A86B] text-[#00A86B]'
                      : 'border-transparent hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Doc Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-600">
              {activeDocTab === 'architecture' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#F4FBF7] border border-emerald-100 space-y-2">
                    <h4 className="font-bold text-sm text-[#00695C] flex items-center space-x-2">
                      <Cpu className="w-4 h-4" />
                      <span>End-to-End Civic Neural Architecture</span>
                    </h4>
                    <p>
                      Urban Eye pairs a distributed React single-page application with a Node.js Express API and an edge-accelerated YOLOv8 machine vision pipeline. Telemetry and coordinates flow via WebSocket streams, providing instantaneous municipal updates.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-slate-200 space-y-1.5">
                      <span className="font-bold text-slate-800 text-xs">Edge Computer Vision</span>
                      <p className="text-[11px] text-slate-500">Extracts bounding boxes, labels hazard severity, and applies instant PII redaction to license plates and faces.</p>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-200 space-y-1.5">
                      <span className="font-bold text-slate-800 text-xs">Dynamic Routing Heuristic</span>
                      <p className="text-[11px] text-slate-500">Assigns tickets based on ward GIS polygons, response SLA timers, and municipal department jurisdiction codes.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeDocTab === 'citizen' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-[#0A262C]">Filing a Report as a Citizen</h4>
                  <ol className="list-decimal list-inside space-y-2 text-slate-700">
                    <li><strong className="text-slate-900">Upload Photo or Video:</strong> Capture a clear photo of the street pothole, garbage spill, or streetlight.</li>
                    <li><strong className="text-slate-900">Auto Geolocation:</strong> Urban Eye extracts high-precision GPS coordinates or lets you drop a map pin.</li>
                    <li><strong className="text-slate-900">Real-Time AI Verification:</strong> The system automatically validates the civic hazard and routes it to the right department.</li>
                    <li><strong className="text-slate-900">Resolution Notification:</strong> Track live dispatch status on your dashboard and view photo proof once resolved.</li>
                  </ol>
                </div>
              )}

              {activeDocTab === 'dept' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-[#0A262C]">Municipal Officer Resolution Lifecycle</h4>
                  <div className="space-y-2 text-slate-700">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-xs text-amber-700">1. Triage & Field Dispatch</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">Officers view prioritized hazard queues sorted by severity and approaching SLA expiry deadlines.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-xs text-blue-700">2. In-Progress Action</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">Field repair teams arrive on-site, perform physical fixes, and update inspection logs.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-xs text-emerald-700">3. Resolution Proof Verification</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">Officers upload timestamped resolution photos to close the ticket and notify citizens.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeDocTab === 'admin' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-[#0A262C]">Super Admin Oversight & Governance</h4>
                  <p>
                    Super Admins enjoy comprehensive authority across the civic grid: configure department response SLAs, manage municipal staff approvals, adjust AI confidence threshold gates, and review cryptographic tamper-proof audit trails for all administrative actions.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setDocModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#003840] hover:bg-[#002B31] text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Close Documentation
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 13. API REFERENCE MODAL                                  */}
      {/* ======================================================== */}
      {apiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#003840] text-emerald-400 flex items-center justify-center">
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#0A262C]">Urban Eye REST API Reference</h3>
                  <p className="text-xs text-slate-500 font-medium">Standard OpenAPI endpoints for civic hazard ingest, triage, and resolution.</p>
                </div>
              </div>
              <button
                onClick={() => setApiModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* API Tabs */}
            <div className="flex border-b border-slate-200 px-4 sm:px-6 space-x-4 sm:space-x-6 text-xs font-bold text-slate-600 bg-white overflow-x-auto scrollbar-none">
              {[
                { id: 'reports', label: 'POST /api/reports' },
                { id: 'departments', label: 'GET /api/departments' },
                { id: 'ai', label: 'POST /api/ai/predict' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveApiTab(tab.id)}
                  className={`py-3 border-b-2 font-mono transition-all cursor-pointer ${
                    activeApiTab === tab.id
                      ? 'border-[#00A86B] text-[#00A86B]'
                      : 'border-transparent hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* API Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs font-mono">
              {activeApiTab === 'reports' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-slate-600 font-sans">
                    <span className="font-bold text-xs sm:text-sm text-slate-800">Submit Civic Issue Report</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">POST /api/reports</span>
                  </div>
                  <div className="relative rounded-2xl bg-[#02181D] text-slate-200 p-4 border border-teal-950">
                    <button
                      onClick={() => copyToClipboard('curl -X POST http://localhost:5000/api/reports \\\n  -H "Authorization: Bearer <TOKEN>" \\\n  -F "category=pothole" \\\n  -F "location=28.6139,77.2090" \\\n  -F "image=@hazard.jpg"', 'curl-report')}
                      className="absolute top-3 right-3 px-2 py-1 rounded bg-[#003B42] hover:bg-[#004D56] text-white flex items-center space-x-1 text-[10px] cursor-pointer"
                    >
                      {copiedKey === 'curl-report' ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'curl-report' ? 'Copied' : 'Copy cURL'}</span>
                    </button>
                    <pre className="text-[11px] leading-relaxed overflow-x-auto text-emerald-300">
{`curl -X POST http://localhost:5000/api/reports \\
  -H "Authorization: Bearer <TOKEN>" \\
  -F "category=pothole" \\
  -F "location=28.6139,77.2090" \\
  -F "image=@hazard.jpg"`}
                    </pre>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-sans text-[11px] text-slate-600 space-y-1">
                    <span className="font-bold text-slate-800">Success Response (201 Created):</span>
                    <pre className="font-mono text-[10px] text-slate-800 bg-white p-2 rounded border border-slate-100">
{`{
  "success": true,
  "reportId": "F197794D",
  "assignedDepartment": "Roads & Public Works Department",
  "slaHours": 48,
  "status": "PENDING"
}`}
                    </pre>
                  </div>
                </div>
              )}

              {activeApiTab === 'departments' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-slate-600 font-sans">
                    <span className="font-bold text-xs sm:text-sm text-slate-800">List Active Municipal Departments</span>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[10px] font-bold">GET /api/departments</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#02181D] text-slate-200 p-4 border border-teal-950">
                    <pre className="text-[11px] leading-relaxed text-sky-300">
{`curl -X GET http://localhost:5000/api/departments`}
                    </pre>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-sans text-[11px] text-slate-600 space-y-1">
                    <span className="font-bold text-slate-800">Sample Payload:</span>
                    <pre className="font-mono text-[10px] text-slate-800 bg-white p-2 rounded border border-slate-100">
{`[
  { "code": "ROADS", "name": "Roads & Public Works", "slaHours": 48 },
  { "code": "SANITATION", "name": "Sanitation & Solid Waste", "slaHours": 24 },
  { "code": "ELECTRICAL", "name": "Electrical & Street Lighting", "slaHours": 24 }
]`}
                    </pre>
                  </div>
                </div>
              )}

              {activeApiTab === 'ai' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-slate-600 font-sans">
                    <span className="font-bold text-xs sm:text-sm text-slate-800">Direct YOLOv8 Inference Stream</span>
                    <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-mono text-[10px] font-bold">POST /api/ai/predict</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-sans text-[11px] text-slate-600">
                    Returns detected bounding boxes, predicted classification labels (pothole, garbage, streetlight, encroachment), and confidence probabilities (&gt; 75%).
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setApiModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#003840] hover:bg-[#002B31] text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Close API Docs
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 14. SUPPORT & HELP CENTER MODAL                          */}
      {/* ======================================================== */}
      {supportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E8F8F0] text-[#00A86B] flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#0A262C]">Urban Eye Municipal Support</h3>
                  <p className="text-xs text-slate-500 font-medium">Citizen Assistance & Emergency Grievance Redressal</p>
                </div>
              </div>
              <button
                onClick={() => setSupportModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {supportSubmitted ? (
                <div className="p-6 text-center space-y-3 bg-[#F4FBF7] border border-emerald-200 rounded-2xl animate-in zoom-in-95">
                  <div className="w-12 h-12 rounded-full bg-[#00A86B] text-white mx-auto flex items-center justify-center">
                    <CheckCheck className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-[#00695C]">Inquiry Received!</h4>
                  <p className="text-xs text-slate-600">
                    A municipal support officer has been notified. We will contact you at your email within 2-4 business hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSupportSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={supportForm.name}
                        onChange={(e) => setSupportForm({ ...supportForm, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#00A86B]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Your Email</label>
                      <input
                        type="email"
                        required
                        value={supportForm.email}
                        onChange={(e) => setSupportForm({ ...supportForm, email: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#00A86B]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Subject</label>
                    <input
                      type="text"
                      required
                      value={supportForm.subject}
                      onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
                      placeholder="e.g., SLA escalation / Report tracking"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#00A86B]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Message</label>
                    <textarea
                      required
                      rows={3}
                      value={supportForm.message}
                      onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                      placeholder="Describe your query or complaint in detail..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#00A86B] resize-none"
                    />
                  </div>
                  <div className="pt-2 flex items-center justify-between">
                    <div className="text-[11px] text-slate-500 flex items-center space-x-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#00A86B]" />
                      <span>Toll Free: 1800-11-2026</span>
                    </div>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#00A86B] hover:bg-[#008955] text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                    >
                      Send Message
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 15. LEGAL / PRIVACY / TERMS / ACCESSIBILITY MODAL        */}
      {/* ======================================================== */}
      {legalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
            
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E8F8F0] text-[#00A86B] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#0A262C]">
                    {legalModal === 'privacy' && 'Urban Eye Privacy Policy'}
                    {legalModal === 'terms' && 'Urban Eye Terms of Use'}
                    {legalModal === 'accessibility' && 'Accessibility Statement'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Official Municipal Governance Protocols</p>
                </div>
              </div>
              <button
                onClick={() => setLegalModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3.5 text-xs text-slate-600 leading-relaxed">
              {legalModal === 'privacy' && (
                <>
                  <p className="font-bold text-slate-800">1. Citizen Data Confidentiality</p>
                  <p>Urban Eye is committed to protecting citizen privacy. Any uploaded image undergoes real-time computer vision sanitization that automatically blurs civilian facial features and vehicle license plates.</p>
                  <p className="font-bold text-slate-800">2. Geo-Coordinate Handling</p>
                  <p>Location coordinates are collected strictly to map the civic hazard to the correct municipal ward and department dispatch depot. Location data is never monetized or shared with third parties.</p>
                  <p className="font-bold text-slate-800">3. Retention & Encryption</p>
                  <p>All database records and report audit logs are cryptographically sealed and retained in adherence with national municipal data protection guidelines.</p>
                </>
              )}

              {legalModal === 'terms' && (
                <>
                  <p className="font-bold text-slate-800">1. Civic Grievance Reporting</p>
                  <p>Citizens agree to submit authentic, factual reports of public municipal hazards. Filing deliberately falsified reports or uploading inappropriate media is subject to municipal sanctions.</p>
                  <p className="font-bold text-slate-800">2. Municipal Response Guarantees</p>
                  <p>While Urban Eye automates dispatch with 24-72h target SLAs depending on category severity, force majeure and extreme weather conditions may adjust operational field dispatch times.</p>
                </>
              )}

              {legalModal === 'accessibility' && (
                <>
                  <p className="font-bold text-slate-800">1. WCAG 2.1 AA Conformance</p>
                  <p>Urban Eye is built to be accessible to all citizens, incorporating high-contrast color palettes, readable font scaling, full keyboard navigation, and ARIA semantic attributes.</p>
                  <p className="font-bold text-slate-800">2. Multi-Language Inclusivity</p>
                  <p>Our citizen reporting interface supports multiple regional languages to empower every citizen to report local civic issues effortlessly.</p>
                </>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setLegalModal(null)}
                className="px-5 py-2 rounded-xl bg-[#003840] hover:bg-[#002B31] text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Understood
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 16. WATCH DEMO 30S INTERACTIVE VIDEO PLAYER               */}
      {/* ======================================================== */}
      {demoModalOpen && (
        <DemoVideoPlayer
          onClose={() => setDemoModalOpen(false)}
          onLaunchPortal={() => {
            setDemoModalOpen(false);
            navigate('/login');
          }}
        />
      )}

    </div>
  );
}
