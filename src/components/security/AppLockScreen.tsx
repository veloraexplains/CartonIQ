import React, { useState } from 'react';
import { AppLockConfig } from '../../types';
import { Lock, Unlock, AlertTriangle, ShieldCheck, KeyRound, HelpCircle, Delete } from 'lucide-react';

interface AppLockScreenProps {
  config: AppLockConfig;
  onUnlocked: () => void;
  onResetPinWithRecovery: (newPin: string) => void;
}

export const AppLockScreen: React.FC<AppLockScreenProps> = ({
  config,
  onUnlocked,
  onResetPinWithRecovery,
}) => {
  const [enteredPin, setEnteredPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [recoveryAnswerInput, setRecoveryAnswerInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [recoveryError, setRecoveryError] = useState<string | null>(null);

  const handleKeyPress = (digit: string) => {
    if (enteredPin.length >= 6) return;
    setErrorMsg(null);
    const updated = enteredPin + digit;
    setEnteredPin(updated);

    // Auto verify when reaching target PIN length
    if (updated.length === config.pin.length) {
      if (updated === config.pin) {
        onUnlocked();
      } else {
        setErrorMsg('Incorrect PIN. Please try again.');
        setTimeout(() => setEnteredPin(''), 500);
      }
    }
  };

  const handleBackspace = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError(null);

    if (recoveryAnswerInput.trim().toLowerCase() !== config.securityAnswer.trim().toLowerCase()) {
      setRecoveryError('Security answer is incorrect. Access denied.');
      return;
    }

    if (!newPinInput || newPinInput.length < 4) {
      setRecoveryError('New PIN must be at least 4 digits.');
      return;
    }

    onResetPinWithRecovery(newPinInput);
    setIsRecoveryMode(false);
    onUnlocked();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/98 backdrop-blur-xl flex flex-col items-center justify-center p-4 font-sans text-white select-none">
      <div className="w-full max-w-sm space-y-6 text-center">
        {/* Branding & Lock Icon */}
        <div className="space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-950/40">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">CartonIQ Secured</h1>
          <p className="text-xs text-slate-400">
            Manufacturing plant rates, cost models, and customer records protected.
          </p>
        </div>

        {!isRecoveryMode ? (
          <div className="space-y-6">
            {/* PIN Dots Display */}
            <div className="space-y-2">
              <div className="flex justify-center items-center gap-3 py-2">
                {Array.from({ length: config.pin.length || 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full transition-all duration-200 ${
                      idx < enteredPin.length
                        ? 'bg-amber-400 scale-110 shadow-md shadow-amber-400/50'
                        : 'border-2 border-slate-700 bg-slate-900'
                    }`}
                  />
                ))}
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-400 font-semibold animate-shake flex items-center justify-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMsg}</span>
                </p>
              )}
            </div>

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleKeyPress(digit)}
                  className="h-14 rounded-2xl bg-slate-900/80 hover:bg-slate-800 active:bg-amber-400 active:text-slate-950 active:scale-95 text-xl font-bold text-white border border-slate-800 transition-all flex items-center justify-center shadow-md"
                >
                  {digit}
                </button>
              ))}
              <button
                onClick={() => setEnteredPin('')}
                className="h-14 rounded-2xl bg-slate-900/40 hover:bg-slate-800 text-xs font-semibold text-slate-400 border border-slate-800 transition-all flex items-center justify-center"
              >
                Clear
              </button>
              <button
                onClick={() => handleKeyPress('0')}
                className="h-14 rounded-2xl bg-slate-900/80 hover:bg-slate-800 active:bg-amber-400 active:text-slate-950 active:scale-95 text-xl font-bold text-white border border-slate-800 transition-all flex items-center justify-center shadow-md"
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                className="h-14 rounded-2xl bg-slate-900/40 hover:bg-slate-800 active:scale-95 text-slate-400 hover:text-white border border-slate-800 transition-all flex items-center justify-center"
                title="Backspace"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            {/* Forgot PIN / Recovery link */}
            <div className="pt-2">
              <button
                onClick={() => setIsRecoveryMode(true)}
                className="text-xs text-slate-400 hover:text-amber-400 transition-colors flex items-center justify-center gap-1 mx-auto"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Forgot PIN? Use Security Question</span>
              </button>
            </div>
          </div>
        ) : (
          /* Recovery Mode Form */
          <form onSubmit={handleRecoverySubmit} className="space-y-4 text-left p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <KeyRound className="w-4 h-4" />
              <span>PIN Reset via Security Question</span>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Security Question:</label>
              <p className="text-xs font-semibold text-white bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                {config.securityQuestion || 'What is your primary manufacturing facility city?'}
              </p>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Your Answer:</label>
              <input
                type="text"
                value={recoveryAnswerInput}
                onChange={(e) => setRecoveryAnswerInput(e.target.value)}
                placeholder="Type your security answer..."
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">New 4 or 6-digit PIN:</label>
              <input
                type="password"
                maxLength={6}
                value={newPinInput}
                onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter new PIN..."
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono tracking-widest"
              />
            </div>

            {recoveryError && (
              <p className="text-xs text-rose-400">{recoveryError}</p>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2 rounded-lg transition-all"
              >
                Reset & Unlock
              </button>
              <button
                type="button"
                onClick={() => setIsRecoveryMode(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 px-3 rounded-lg"
              >
                Back
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
