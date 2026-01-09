import React, { useState } from 'react';
import { EmailIcon, CopyIcon, CheckIcon, RefreshIcon, ReceiptIcon } from '@/components/icons/Icons';
import Button from '@/components/ui/Button';

interface EmailInboxViewProps {
  userEmail?: string;
}

const EmailInboxView: React.FC<EmailInboxViewProps> = ({ userEmail }) => {
  const [copied, setCopied] = useState(false);
  const receiptEmail = userEmail 
    ? `${userEmail.split('@')[0]}@receipts.sparkreceipt.app`
    : 'your-email@receipts.sparkreceipt.app';

  const handleCopy = () => {
    navigator.clipboard.writeText(receiptEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const recentEmails = [
    {
      id: '1',
      from: 'receipts@amazon.com',
      subject: 'Your Amazon.com order receipt',
      date: '2026-01-05',
      status: 'processed',
      amount: 156.99,
    },
    {
      id: '2',
      from: 'noreply@uber.com',
      subject: 'Your trip receipt',
      date: '2026-01-04',
      status: 'processed',
      amount: 24.50,
    },
    {
      id: '3',
      from: 'billing@dropbox.com',
      subject: 'Dropbox Plus subscription',
      date: '2026-01-03',
      status: 'processed',
      amount: 11.99,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Email Inbox</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Forward receipts to automatically scan and categorize them
        </p>
      </div>

      {/* Email Address Card */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <EmailIcon size={28} />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-1">Your Receipt Email</h2>
            <p className="text-blue-100 text-sm mb-4">
              Forward receipts to this address and they'll be automatically processed
            </p>
            
            <div className="flex items-center gap-2 bg-white/10 rounded-xl p-3">
              <code className="flex-1 text-sm font-mono truncate">
                {receiptEmail}
              </code>
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              >
                {copied ? <CheckIcon size={18} /> : <CopyIcon size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          How to Set Up Email Forwarding
        </h3>
        
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">1</span>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white">Copy your receipt email</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Click the copy button above to copy your unique receipt email address
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">2</span>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white">Set up auto-forwarding</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                In your email settings, create a filter to automatically forward receipts to your SparkReceipt address
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">3</span>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white">Automatic processing</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Forwarded emails will be automatically scanned, data extracted, and categorized
              </p>
            </div>
          </div>
        </div>

        {/* Email Provider Quick Links */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Quick setup guides:
          </p>
          <div className="flex flex-wrap gap-2">
            {['Gmail', 'Outlook', 'Yahoo', 'Apple Mail'].map((provider) => (
              <a
                key={provider}
                href="#"
                className="px-3 py-1.5 rounded-lg text-sm bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                {provider}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Emails */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Recent Processed Emails
          </h3>
          <Button variant="ghost" icon={<RefreshIcon size={16} />} size="sm">
            Refresh
          </Button>
        </div>

        {recentEmails.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
              <EmailIcon size={28} className="text-slate-400" />
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              No emails processed yet. Forward a receipt to get started!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {recentEmails.map((email) => (
              <div 
                key={email.id}
                className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <ReceiptIcon size={18} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {email.subject}
                      </p>
                      <p className="text-sm text-slate-500">
                        From: {email.from}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      ${email.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(email.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
        <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
          Pro Tips
        </h4>
        <ul className="space-y-1 text-sm text-amber-700 dark:text-amber-300">
          <li>• Forward receipts with PDF or image attachments for best results</li>
          <li>• Email body text is also parsed for receipt data</li>
          <li>• Set up filters to auto-forward from common merchants</li>
        </ul>
      </div>
    </div>
  );
};

export default EmailInboxView;
