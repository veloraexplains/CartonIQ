import React from 'react';
import { Settings, Mail, Shield, BookOpen, HelpCircle, AlertTriangle } from 'lucide-react';

export const AboutLegalView: React.FC = () => {
  return (
    <div className="space-y-6 text-slate-300 p-4 pb-20">
      
      {/* 1. ABOUT CARTONIQ */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-amber-400 mb-2 flex items-center gap-2">
          <Shield className="w-5 h-5" /> About CartonIQ
        </h2>
        <p className="text-sm leading-relaxed mb-4">
          CartonIQ is a Smart Packaging Business Suite designed for the corrugated box industry. It provides tools for box calculation, 3D design, order tracking, and PDF generation. The app operates locally on your device.
        </p>
        <div className="text-xs text-slate-500">
          <p>Version: 1.0.0 (Stable)</p>
          <p>Made for the Packaging Industry.</p>
        </div>
      </div>

      {/* 2. HOW TO USE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5" /> How to Use CartonIQ
        </h2>
        <ul className="space-y-3 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-amber-500 font-bold">1.</span>
            <span><strong>Calculator:</strong> Enter your box dimensions to get the FEFCO box style and exact paper cost.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 font-bold">2.</span>
            <span><strong>3D Designer:</strong> View your custom box in 3D to check how it looks.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 font-bold">3.</span>
            <span><strong>Quotations:</strong> Create a quote, add customer details, and generate a PDF.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 font-bold">4.</span>
            <span><strong>Orders:</strong> Track production stages and generate Delivery Challans.</span>
          </li>
        </ul>
      </div>

      {/* 3. LEGAL: TERMS & CONDITIONS (13 Points) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" /> Terms & Conditions
        </h2>
        
        <div className="text-xs space-y-4 text-slate-400">
          <div>
            <strong className="text-slate-200 block mb-1">1. About the App</strong>
            <p>CartonIQ is a Smart Packaging Business Suite designed for the corrugated box industry. It provides tools for box calculation, 3D design, order tracking, and PDF generation. The app operates locally on your device.</p>
          </div>

          <div>
            <strong className="text-slate-200 block mb-1">2. Use</strong>
            <p>The app is intended for business and commercial use by packaging manufacturers, traders, and designers. You agree to use the app only for lawful purposes related to your business operations.</p>
          </div>

          <div>
            <strong className="text-slate-200 block mb-1">3. Data Ownership</strong>
            <p>All data generated within the app (customer details, quotes, orders, and company profiles) belongs entirely to you. We do not claim any ownership over your business data.</p>
          </div>

          <div>
            <strong className="text-slate-200 block mb-1">4. Privacy</strong>
            <p>We respect your privacy. The app does not track your location, does not collect analytics, and does not send your business data to any external servers. All calculations and PDF generations happen 100% offline on your device.</p>
          </div>

          <div>
            <strong className="text-slate-200 block mb-1">5. User Responsibility</strong>
            <p>You are solely responsible for the data you input. You must ensure that box dimensions, customer details, and order quantities are accurate before generating quotations or job cards.</p>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg my-2">
            <strong className="text-amber-500 flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4" /> 6. No Warranty
            </strong>
            <p className="text-slate-300">The app is provided "as is" without any warranty of any kind. We do not guarantee that the app will be error-free, uninterrupted, or meet your specific business requirements.</p>
          </div>

          <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg my-2">
            <strong className="text-red-400 flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4" /> 7. Limitation of Liability
            </strong>
            <p className="text-slate-300"><strong>CRITICAL:</strong> The calculation rates (paper cost, conversion charges) are estimates and subject to market fluctuations. We are <strong>not responsible</strong> for any financial loss, incorrect quotes, loss of profit, or business damages resulting from the use of this app. Always verify your rates before sending quotes to clients.</p>
          </div>

          <div>
            <strong className="text-slate-200 block mb-1">8. Backup Responsibility</strong>
            <p>Because all data is stored locally on your device, you are responsible for backing up your data. If you uninstall the app or lose your phone, the data cannot be recovered by us.</p>
          </div>

          <div>
            <strong className="text-slate-200 block mb-1">9. Accuracy of Records</strong>
            <p>While we strive for accuracy, the app relies on your inputs. We are not responsible for any manufacturing errors or financial discrepancies caused by incorrect data entry.</p>
          </div>

          <div>
            <strong className="text-slate-200 block mb-1">10. Updates and Changes</strong>
            <p>We may release updates to improve the app or add new features. We reserve the right to modify these Terms & Conditions at any time. Continued use of the app implies acceptance of the updated terms.</p>
          </div>

          <div>
            <strong className="text-slate-200 block mb-1">11. Termination</strong>
            <p>We reserve the right to terminate or suspend access to the app for users who violate these terms or use the app for illegal activities.</p>
          </div>

          <div>
            <strong className="text-slate-200 block mb-1">12. Governing Law</strong>
            <p>These terms shall be governed by and construed in accordance with the laws of your local jurisdiction (e.g., India). Any disputes shall be subject to the exclusive jurisdiction of the local courts.</p>
          </div>

          <div>
            <strong className="text-slate-200 block mb-1">13. Acceptance</strong>
            <p>By installing and using CartonIQ, you acknowledge that you have read, understood, and agreed to these Terms & Conditions.</p>
          </div>
        </div>
      </div>

      {/* 4. CONTACT SUPPORT */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5" /> Contact Support
        </h2>
        <div className="space-y-3">
          <a href="mailto:veloraexplains@gmail.com" className="flex items-center gap-3 bg-slate-800 p-3 rounded-xl hover:bg-slate-700 transition">
            <Mail className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-semibold">veloraexplains@gmail.com</span>
          </a>
        </div>
      </div>

    </div>
  );
};
