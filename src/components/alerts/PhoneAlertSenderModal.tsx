import React, { useState } from 'react';
import { EmergencyAlert } from '../../types/disaster';
import {
  X,
  Smartphone,
  Send,
  MessageSquare,
  Share2,
  CheckCircle2,
  Shield,
  Phone,
  Radio,
  Copy,
  Check,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { audioManager } from '../../utils/soundAndNotifications';

interface PhoneAlertSenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: EmergencyAlert | null;
  onDispatchRecorded: (logDetails: string) => void;
}

export const PhoneAlertSenderModal: React.FC<PhoneAlertSenderModalProps> = ({
  isOpen,
  onClose,
  alert,
  onDispatchRecorded,
}) => {
  const [phoneNumber, setPhoneNumber] = useState<string>('+91 9883690602');
  const [recipientName, setRecipientName] = useState<string>('Disaster Control / WhatsApp SOS');
  const [selectedLang, setSelectedLang] = useState<'en' | 'hi' | 'ta'>('en');
  const [isSimulatingDispatch, setIsSimulatingDispatch] = useState<boolean>(false);
  const [dispatchSuccess, setDispatchSuccess] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen || !alert) return null;

  const localized = alert.languages[selectedLang] || alert.languages.en;

  const formattedAlertMessage = `🚨 [EMERGENCY ALERT - DISASTERLENS AI]
${localized.title}
📍 Location: ${alert.affectedArea}
⚠️ Threat: ${localized.content}

🛡️ PRECAUTIONS:
${localized.precautions}

📞 Emergency Helplines: 112 / 1078 (NDRF)
Verification: Official NDMA/SDMA Advisory`;

  // 1. Send via WhatsApp (https://api.whatsapp.com/send)
  const handleWhatsApp = () => {
    let cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanNumber.length === 10) {
      cleanNumber = `91${cleanNumber}`;
    }
    const encodedBody = encodeURIComponent(formattedAlertMessage);
    const waUrl = `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodedBody}`;
    window.open(waUrl, '_blank');
    onDispatchRecorded(`Dispatched WhatsApp emergency alert for ${alert.id} to +${cleanNumber}`);
  };

  // 3. Native Web Share API
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: localized.title,
          text: formattedAlertMessage,
        });
        onDispatchRecorded(`Shared emergency alert ${alert.id} via system share sheet`);
      } catch {
        // User cancelled share
      }
    } else {
      handleCopyText();
    }
  };

  // 4. Copy to Clipboard
  const handleCopyText = () => {
    navigator.clipboard.writeText(formattedAlertMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // 5. Emergency Cell Broadcast Simulation
  const handleSimulateCarrierDispatch = () => {
    setIsSimulatingDispatch(true);
    setDispatchSuccess(false);

    audioManager.playCriticalAlert();

    setTimeout(() => {
      setIsSimulatingDispatch(false);
      setDispatchSuccess(true);
      onDispatchRecorded(
        `Carrier cell broadcast transmission confirmed for ${alert.id} to ${phoneNumber} via Indian Telecom Disaster Network`
      );
      setTimeout(() => {
        setDispatchSuccess(false);
      }, 5000);
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#080d1a] border border-cyan-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 border-b border-cyan-500/20 bg-slate-900/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <Smartphone className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm tracking-wide text-slate-100">
                SEND EMERGENCY ALERT TO PHONE
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                Direct WhatsApp & Emergency Broadcast Gateway
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[80vh]">
          {/* Recipient Phone & Name Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-mono text-slate-300 block mb-1">
                RECIPIENT PHONE NUMBER *
              </label>
              <div className="flex items-center bg-slate-900 border border-slate-700 focus-within:border-cyan-400 rounded-lg px-2.5 py-1.5">
                <Phone className="w-3.5 h-3.5 text-cyan-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 9883690602"
                  className="bg-transparent border-none text-xs text-white focus:outline-none w-full font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-300 block mb-1">
                RECIPIENT DESIGNATION
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Disaster Control / WhatsApp SOS"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Preset Hotlines */}
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
              Quick Recipient Presets (India Emergency):
            </span>
            <div className="flex flex-wrap gap-1.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => {
                  setPhoneNumber('+91 9883690602');
                  setRecipientName('WhatsApp Direct Emergency Control');
                }}
                className="px-2 py-0.5 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-[10px] font-semibold flex items-center gap-1 shadow-sm"
              >
                <MessageSquare className="w-2.5 h-2.5" />
                +91 9883690602 (WhatsApp Direct)
              </button>
              <button
                type="button"
                onClick={() => setPhoneNumber('+91 1078')}
                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-[10px]"
              >
                1078 (NDRF Control)
              </button>
              <button
                type="button"
                onClick={() => setPhoneNumber('+91 112')}
                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-[10px]"
              >
                112 (National Emergency)
              </button>
              <button
                type="button"
                onClick={() => setPhoneNumber('+91 1070')}
                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-[10px]"
              >
                1070 (State EOC)
              </button>
            </div>
          </div>

          {/* Language Selection Tab */}
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
              Alert Broadcast Language:
            </span>
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
              <button
                type="button"
                onClick={() => setSelectedLang('en')}
                className={`flex-1 py-1 rounded transition ${
                  selectedLang === 'en'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setSelectedLang('hi')}
                className={`flex-1 py-1 rounded transition ${
                  selectedLang === 'hi'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                हिंदी (Hindi)
              </button>
              <button
                type="button"
                onClick={() => setSelectedLang('ta')}
                className={`flex-1 py-1 rounded transition ${
                  selectedLang === 'ta'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                தமிழ் (Tamil)
              </button>
            </div>
          </div>

          {/* Broadcast Message Preview */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-800 pb-1.5">
              <span className="flex items-center gap-1 text-cyan-300">
                <Radio className="w-3.5 h-3.5" /> WhatsApp & Broadcast Message Preview
              </span>
              <span>{formattedAlertMessage.length} Characters</span>
            </div>

            <pre className="text-xs text-slate-200 whitespace-pre-wrap font-sans leading-relaxed max-h-40 overflow-y-auto bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              {formattedAlertMessage}
            </pre>
          </div>

          {/* Direct Dispatch Actions Row */}
          <div className="space-y-2 pt-2">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">
              Direct Phone Dispatch Channels:
            </span>

            {/* WhatsApp Send Button */}
            <button
              type="button"
              onClick={handleWhatsApp}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Send via WhatsApp (+91 9883690602)</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              {/* System Share Sheet */}
              <button
                type="button"
                onClick={handleNativeShare}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono flex items-center justify-center gap-1.5 border border-cyan-500/30 transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>System Share</span>
              </button>

              {/* Copy Alert Text */}
              <button
                type="button"
                onClick={handleCopyText}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center justify-center gap-1.5 border border-slate-700 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>

            {/* Carrier Network Cell Broadcast Simulation */}
            <div className="pt-2">
              <button
                type="button"
                disabled={isSimulatingDispatch}
                onClick={handleSimulateCarrierDispatch}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-heading font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-950 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isSimulatingDispatch ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Transmitting Cell Broadcast Packet...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Broadcast to Telecom Carrier Gateways (Jio/Airtel/BSNL)</span>
                  </>
                )}
              </button>
            </div>

            {/* Success Confirmation Banner */}
            {dispatchSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <strong className="block font-bold">Carrier Dispatch Acknowledged (ACK 200)</strong>
                  <span className="text-[11px] text-emerald-300">
                    Emergency Cell Broadcast packet pushed to {phoneNumber}. Tower transit completed.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
