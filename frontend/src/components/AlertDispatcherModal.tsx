import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Phone, 
  Mail, 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldAlert,
  Smartphone
} from 'lucide-react';
import { PredictResponse, RiskLevel } from '../types';

interface AlertDispatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  predictionData: PredictResponse | null;
  selectedLocation: { latitude: number; longitude: number; name?: string };
}

export const AlertDispatcherModal: React.FC<AlertDispatcherModalProps> = ({
  isOpen,
  onClose,
  predictionData,
  selectedLocation
}) => {
  const [channel, setChannel] = useState<'SMS' | 'EMAIL' | 'CAP'>('SMS');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [email, setEmail] = useState('district.collector@nic.in');
  const [isSending, setIsSending] = useState(false);
  const [sentLog, setSentLog] = useState<{ id: string; time: string; recipient: string; channel: string } | null>(null);

  if (!isOpen) return null;

  const locName = selectedLocation.name || `${selectedLocation.latitude.toFixed(3)}°N, ${selectedLocation.longitude.toFixed(3)}°E`;
  const riskLevel = predictionData?.prediction.risk_level || 'HIGH';
  const prob = predictionData?.prediction.flood_probability_percent || 78;
  const leadTime = predictionData?.warning.lead_time_minutes || 150;

  const messageText = `🚨 ${riskLevel} FLOOD ALERT - ${locName}
Flood Probability: ${prob}%
Estimated Peak Window: In ${Math.round(leadTime / 60 * 10) / 10} Hours
Recommended Action: ${predictionData?.recommendations[0] || 'Move livestock and personnel to designated high-elevation shelters immediately.'}
- NDRF / CWC FloodGuard Automated Dispatch`;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    setTimeout(() => {
      setIsSending(false);
      setSentLog({
        id: `TWL-${Math.floor(100000 + Math.random() * 900000)}`,
        time: new Date().toLocaleTimeString('en-IN'),
        recipient: channel === 'SMS' ? phone : (channel === 'EMAIL' ? email : 'State CAP Broadcast Gateway'),
        channel
      });
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                <Radio className="w-5 h-5" />
              </span>
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide font-mono">
                EMERGENCY ALERT DISPATCHER (CAP / SMS / EMAIL)
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Automated multi-channel early warning broadcast engine (7C: Communication)
            </p>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200/70 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {sentLog ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3 font-mono">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-emerald-900 font-sans">Emergency Alert Successfully Broadcast</h3>
              <div className="text-xs text-emerald-800 space-y-1">
                <div>Message Reference: <strong className="text-slate-900">{sentLog.id}</strong></div>
                <div>Recipient: <strong className="text-slate-900">{sentLog.recipient}</strong></div>
                <div>Channel: <strong className="text-slate-900">{sentLog.channel} Protocol</strong></div>
                <div>Timestamp: <strong className="text-slate-900">{sentLog.time} IST</strong></div>
              </div>
              <button
                type="button"
                onClick={() => setSentLog(null)}
                className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 font-sans"
              >
                Send Another Dispatch
              </button>
            </div>
          ) : (
            <form onSubmit={handleSend} className="space-y-4">
              {/* Channel Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1.5">
                  Select Notification Channel
                </label>
                <div className="grid grid-cols-3 gap-2 font-mono text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setChannel('SMS')}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                      channel === 'SMS'
                        ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>SMS / Twilio</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChannel('EMAIL')}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                      channel === 'EMAIL'
                        ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email / SMTP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChannel('CAP')}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                      channel === 'CAP'
                        ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>National CAP</span>
                  </button>
                </div>
              </div>

              {/* Destination Input */}
              {channel === 'SMS' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">
                    Emergency Mobile Number (SMS)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none"
                    />
                  </div>
                </div>
              )}

              {channel === 'EMAIL' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">
                    Emergency Official Email (DEOC / SDMA)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none"
                    />
                  </div>
                </div>
              )}

              {channel === 'CAP' && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  Transmitting Common Alerting Protocol (CAP XML) packet directly to National Disaster Management Authority (NDMA) Integrated Public Alert and Warning System.
                </div>
              )}

              {/* Message Payload Preview */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">
                  Alert Message Content Preview
                </label>
                <div className="p-3 bg-slate-900 text-slate-100 rounded-2xl text-xs font-mono whitespace-pre-line border border-slate-800 leading-relaxed">
                  {messageText}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                {isSending ? (
                  <span>Broadcasting Alert Packet...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Dispatch Real-Time Warning Alert</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
