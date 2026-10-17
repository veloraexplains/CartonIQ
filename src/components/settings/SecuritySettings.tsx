import React, { useState, useEffect } from 'react';
import { AppLockConfig } from '../../types';
import {
  getAppLockConfig,
  saveAppLockConfig,
  logActivity
} from '../../utils/storage';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  KeyRound,
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';

interface SecuritySettingsProps {
  onLockNow: () => void;
  onConfigChange?: (config: AppLockConfig) => void;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  onLockNow,
  onConfigChange,
}) => {
  const [config, setConfig] = useState<AppLockConfig>(getAppLockConfig());
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [isEnablingModal, setIsEnablingModal] = useState(false);
  const [isDisablingModal, setIsDisablingModal] = useState(false);

  // Form states for PIN change or initial enable
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [securityQuestionInput, setSecurityQuestionInput] = useState(
    config.securityQuestion || 'What is your plant location city?'
  );
  const [securityAnswerInput, setSecurityAnswerInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPins, setShowPins] = useState(false);

  useEffect(() => {
    setConfig(getAppLockConfig());
  }, []);

  const handleToggleEnable = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!config.isEnabled) {
      // Opening setup modal to enable
      setIsEnablingModal(true);
      setNewPinInput('');
      setConfirmPinInput('');
      setSecurityAnswerInput('');
    } else {
      // Prompt for PIN to disable
      setIsDisablingModal(true);
      setCurrentPinInput('');
    }
  };

  const handleConfirmEnable = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPinInput.length < 4 || newPinInput.length > 6) {
      setErrorMsg('PIN must be 4 to 6 numeric digits.');
      return;
    }
    if (newPinInput !== confirmPinInput) {
      setErrorMsg('PIN and confirmation PIN do not match.');
      return;
    }
    if (!securityAnswerInput.trim()) {
      setErrorMsg('Please provide a recovery answer in case you forget your PIN.');
      return;
    }

    const updated: AppLockConfig = {
      ...config,
      isEnabled: true,
      pin: newPinInput,
      securityQuestion: securityQuestionInput.trim(),
      securityAnswer: securityAnswerInput.trim(),
      lastUnlockedAt: Date.now(),
    };

    saveAppLockConfig(updated);
    setConfig(updated);
    if (onConfigChange) onConfigChange(updated);
    logActivity('App Lock Enabled', 'security', 'Enabled master security lock with numeric PIN protection');

    setIsEnablingModal(false);
    setSuccessMsg('CartonIQ App Lock successfully enabled! Your rates and customer data are secured.');
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleConfirmDisable = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (currentPinInput !== config.pin) {
      setErrorMsg('Incorrect PIN. Security lock cannot be disabled.');
      return;
    }

    const updated: AppLockConfig = {
      ...config,
      isEnabled: false,
    };

    saveAppLockConfig(updated);
    setConfig(updated);
    if (onConfigChange) onConfigChange(updated);
    logActivity('App Lock Disabled', 'security', 'Disabled application security lock');

    setIsDisablingModal(false);
    setSuccessMsg('App Lock disabled.');
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (config.pin && currentPinInput !== config.pin) {
      setErrorMsg('Current PIN is incorrect.');
      return;
    }
    if (newPinInput.length < 4 || newPinInput.length > 6) {
      setErrorMsg('New PIN must be 4 to 6 digits.');
      return;
    }
    if (newPinInput !== confirmPinInput) {
      setErrorMsg('New PIN and confirmation PIN do not match.');
      return;
    }

    const updated: AppLockConfig = {
      ...config,
      pin: newPinInput,
      securityQuestion: securityQuestionInput.trim() || config.securityQuestion,
      securityAnswer: securityAnswerInput.trim() || config.securityAnswer,
      lastUnlockedAt: Date.now(),
    };

    saveAppLockConfig(updated);
    setConfig(updated);
    if (onConfigChange) onConfigChange(updated);
    logActivity('Changed Security PIN', 'security', 'User updated the application access PIN');

    setIsChangingPin(false);
    setCurrentPinInput('');
    setNewPinInput('');
    setConfirmPinInput('');
    setSuccessMsg('Security PIN updated successfully.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleAutoLockChange = (minutes: number) => {
    const updated: AppLockConfig = {
      ...config,
      autoLockMinutes: minutes,
    };
    saveAppLockConfig(updated);
    setConfig(updated);
    if (onConfigChange) onConfigChange(updated);
    logActivity('Updated Auto-Lock Timeout', 'security', `Auto-lock interval set to ${minutes === 0 ? 'Immediate' : minutes + ' min'}`);
  };

  return (
    <div className="space-y-4">
      {/* Security Status Header */}
      <div className={`p-4 rounded-2xl border transition-all ${
        config.isEnabled
          ? 'bg-emerald-950/20 border-emerald-500/30 text-white'
          : 'bg-amber-950/20 border-amber-500/30 text-white'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              config.isEnabled
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
            }`}>
              {config.isEnabled ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold tracking-tight">
                  {config.isEnabled ? 'App Lock is ACTIVE' : 'App Lock is DISABLED'}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  config.isEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {config.isEnabled ? 'Protected' : 'Unrestricted'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {config.isEnabled
                  ? 'Plant pricing equations, customer lists, and financial figures require PIN verification.'
                  : 'Enable PIN lock to prevent unauthorized access by operators, visitors, or floor staff.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {config.isEnabled && (
              <button
                type="button"
                onClick={onLockNow}
                className="flex items-center gap-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-2 rounded-xl transition-all shadow-md active:scale-95"
                title="Lock Application Now"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock Now</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleToggleEnable}
              className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all border ${
                config.isEnabled
                  ? 'bg-rose-950/30 border-rose-800/80 text-rose-300 hover:bg-rose-900/40'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-950'
              }`}
            >
              {config.isEnabled ? <Unlock className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              <span>{config.isEnabled ? 'Turn Off Lock' : 'Enable App Lock'}</span>
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-900/40 border border-emerald-600/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* Security Details & Controls */}
      {config.isEnabled && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PIN Management Box */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">PIN Code Management</h4>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{config.pin.length}-Digit PIN Set</span>
            </div>

            <p className="text-xs text-slate-400">
              Your security PIN prevents unauthorized access to commercial quotations, paper rates, and production profit calculations.
            </p>

            {!isChangingPin ? (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPin(true);
                    setErrorMsg(null);
                    setCurrentPinInput('');
                    setNewPinInput('');
                    setConfirmPinInput('');
                  }}
                  className="w-full sm:w-auto text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>Change Security PIN</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleChangePinSubmit} className="space-y-3 pt-2">
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Current PIN *</label>
                  <input
                    type={showPins ? 'text' : 'password'}
                    maxLength={6}
                    value={currentPinInput}
                    onChange={(e) => setCurrentPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter current PIN"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono tracking-widest"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">New PIN (4-6 digits) *</label>
                    <input
                      type={showPins ? 'text' : 'password'}
                      maxLength={6}
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="New PIN"
                      required
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono tracking-widest"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Confirm New PIN *</label>
                    <input
                      type={showPins ? 'text' : 'password'}
                      maxLength={6}
                      value={confirmPinInput}
                      onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="Repeat PIN"
                      required
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono tracking-widest"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <button
                    type="button"
                    onClick={() => setShowPins(!showPins)}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    {showPins ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPins ? 'Hide numbers' : 'Show numbers'}</span>
                  </button>
                </div>

                {errorMsg && (
                  <p className="text-xs text-rose-400 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errorMsg}</span>
                  </p>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2 rounded-lg transition-all"
                  >
                    Save New PIN
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsChangingPin(false)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 px-3 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Auto-Lock Inactivity Policy */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Inactivity Auto-Lock</h4>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                {config.autoLockMinutes === 0
                  ? 'Immediately'
                  : config.autoLockMinutes === -1
                  ? 'Manual Only'
                  : `${config.autoLockMinutes} Minutes`}
              </span>
            </div>

            <p className="text-xs text-slate-400">
              CartonIQ automatically secures itself when left idle on your device, preventing unauthorized access on factory floor tablets.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {[
                { min: 0, label: 'Immediate' },
                { min: 1, label: '1 Minute' },
                { min: 5, label: '5 Minutes' },
                { min: 15, label: '15 Minutes' },
                { min: 30, label: '30 Minutes' },
                { min: -1, label: 'Manual Only' },
              ].map((opt) => (
                <button
                  key={opt.min}
                  type="button"
                  onClick={() => handleAutoLockChange(opt.min)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border text-center ${
                    config.autoLockMinutes === opt.min
                      ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-sm'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  Recovery Question: <strong>{config.securityQuestion}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security & Confidentiality Assurance Card */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
          <Shield className="w-4 h-4" />
          <span>Cardboard Manufacturing Business Protection</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Corrugated carton manufacturing involves highly sensitive commercial secrets — including paper purchase rates (GSM/rate per kg), flute take-up factors, adhesive/conversion overheads, and customer pricing tiers. CartonIQ stores 100% of this data locally in your browser/device namespaced storage and never sends your numbers to third-party cloud servers.
        </p>
      </div>

      {/* MODAL: ENABLE APP LOCK */}
      {isEnablingModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Enable Security App Lock</h3>
                <p className="text-[11px] text-slate-400">Set a 4 or 6-digit numeric PIN for CartonIQ</p>
              </div>
            </div>

            <form onSubmit={handleConfirmEnable} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">New PIN (4-6 digits) *</label>
                  <input
                    type="password"
                    maxLength={6}
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 1234"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400 font-mono tracking-widest"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Confirm PIN *</label>
                  <input
                    type="password"
                    maxLength={6}
                    value={confirmPinInput}
                    onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Repeat PIN"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400 font-mono tracking-widest"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Security Question (for PIN recovery) *</label>
                <select
                  value={securityQuestionInput}
                  onChange={(e) => setSecurityQuestionInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="What is your plant location city?">What is your plant location city?</option>
                  <option value="What was the name of your first paper mill supplier?">What was the name of your first paper mill supplier?</option>
                  <option value="What is your factory registration number?">What is your factory registration number?</option>
                  <option value="What is your favourite corrugator machine make?">What is your favourite corrugator machine make?</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Security Answer *</label>
                <input
                  type="text"
                  value={securityAnswerInput}
                  onChange={(e) => setSecurityAnswerInput(e.target.value)}
                  placeholder="Your answer (case-insensitive)"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-400 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMsg}</span>
                </p>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition-all shadow-md shadow-amber-950"
                >
                  Activate App Lock
                </button>
                <button
                  type="button"
                  onClick={() => setIsEnablingModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2.5 px-4 rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DISABLE APP LOCK */}
      {isDisablingModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                <Unlock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Turn Off App Lock</h3>
                <p className="text-[11px] text-slate-400">Enter your current PIN to confirm</p>
              </div>
            </div>

            <form onSubmit={handleConfirmDisable} className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Current PIN *</label>
                <input
                  type="password"
                  maxLength={6}
                  value={currentPinInput}
                  onChange={(e) => setCurrentPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter PIN"
                  required
                  autoFocus
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400 font-mono tracking-widest text-center"
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-400 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMsg}</span>
                </p>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md shadow-rose-950"
                >
                  Confirm & Disable
                </button>
                <button
                  type="button"
                  onClick={() => setIsDisablingModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2.5 px-4 rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
