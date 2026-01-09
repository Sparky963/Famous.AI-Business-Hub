import React, { useState } from 'react';
import { SparkIcon, ReceiptIcon, CameraIcon, EmailIcon, ReportIcon, CheckIcon, TrendingUpIcon } from '@/components/icons/Icons';
import Button from '@/components/ui/Button';
import AuthModal from '@/components/auth/AuthModal';

interface LandingPageProps {
  onEnterApp: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const features = [
    {
      icon: CameraIcon,
      title: 'Smart Receipt Capture',
      description: 'Snap a photo or upload files. Our AI extracts all data automatically.',
      color: 'blue',
    },
    {
      icon: TrendingUpIcon,
      title: 'AI Categorization',
      description: 'Expenses are automatically categorized. The system learns from your edits.',
      color: 'emerald',
    },
    {
      icon: EmailIcon,
      title: 'Email Forwarding',
      description: 'Forward receipts to your unique email address for automatic processing.',
      color: 'purple',
    },
    {
      icon: ReportIcon,
      title: 'One-Click Reports',
      description: 'Generate audit-ready PDF and Excel reports with a single click.',
      color: 'amber',
    },
  ];

  const stats = [
    { value: '99%', label: 'Extraction Accuracy' },
    { value: '<5s', label: 'Processing Time' },
    { value: '50+', label: 'Currencies Supported' },
    { value: '24/7', label: 'Availability' },
  ];

  const testimonials = [
    {
      quote: "SparkReceipt saved me 10 hours a week on expense tracking. The AI is incredibly accurate.",
      author: "Sarah Chen",
      role: "Freelance Designer",
    },
    {
      quote: "Finally, an expense tracker that actually works. The email forwarding feature is a game-changer.",
      author: "Michael Rodriguez",
      role: "Small Business Owner",
    },
    {
      quote: "Our accounting team loves the one-click reports. Tax season has never been easier.",
      author: "Emily Watson",
      role: "CFO, TechStart Inc.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
                <SparkIcon size={24} className="text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">SparkReceipt</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAuthModal(true)}
                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium"
              >
                Sign In
              </button>
              <Button variant="primary" onClick={onEnterApp}>
                Try Demo
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6">
              <SparkIcon size={16} />
              AI-Powered Expense Tracking
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white leading-tight">
              Receipts to Reports
              <span className="block bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">
                in Seconds
              </span>
            </h1>
            <p className="mt-6 text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Automate receipt scanning, expense tracking, and financial reporting. 
              Eliminate manual data entry with AI-powered extraction.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg" onClick={onEnterApp}>
                Start Free Trial
              </Button>
              <Button variant="outline" size="lg" onClick={() => setShowAuthModal(true)}>
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-slate-900 to-transparent z-10 pointer-events-none" />
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="bg-slate-100 dark:bg-slate-700 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
              </div>
              <img 
                src="https://d64gsuwffb70l.cloudfront.net/695c0bd1b9565bfe05859da0_1767640147446_5452d9ad.jpg"
                alt="SparkReceipt Dashboard"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-slate-800 border-y border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="mt-2 text-slate-600 dark:text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Everything You Need
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              From receipt capture to financial reports, SparkReceipt handles it all.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              const colorClasses: Record<string, string> = {
                blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
                emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
                purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
                amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
              };

              return (
                <div 
                  key={feature.title}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow"
                >
                  <div className={`w-12 h-12 rounded-xl ${colorClasses[feature.color]} flex items-center justify-center mb-4`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white dark:bg-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              Three simple steps to expense tracking freedom
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Capture', desc: 'Snap a photo, upload a file, or forward an email' },
              { step: '2', title: 'Extract', desc: 'AI automatically extracts and categorizes all data' },
              { step: '3', title: 'Report', desc: 'Generate audit-ready reports with one click' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white text-2xl font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Loved by Thousands
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <div 
                key={idx}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  "{testimonial.quote}"
                </p>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-slate-500">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-500 to-emerald-500 rounded-3xl p-8 sm:p-12 text-center text-white">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Simplify Your Expenses?
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses and freelancers who trust SparkReceipt 
              for their expense tracking needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={onEnterApp}
                className="bg-white text-blue-600 border-white hover:bg-white/90"
              >
                Start Free Trial
              </Button>
            </div>
            <p className="mt-4 text-sm text-white/60">
              No credit card required. 14-day free trial.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
                  <SparkIcon size={24} className="text-white" />
                </div>
                <span className="text-xl font-bold">SparkReceipt</span>
              </div>
              <p className="text-slate-400 text-sm">
                AI-powered expense tracking for modern businesses.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-800 text-center text-slate-400 text-sm">
            © 2026 SparkReceipt. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={onEnterApp}
      />
    </div>
  );
};

export default LandingPage;
