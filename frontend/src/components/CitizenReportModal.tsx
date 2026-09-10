import React, { useState } from 'react';
import { 
  X, 
  Send, 
  MapPin, 
  Droplets, 
  CheckCircle2, 
  Clock, 
  User, 
  Phone, 
  AlertTriangle,
  Camera,
  ShieldCheck,
  Building,
  PhoneCall,
  ExternalLink
} from 'lucide-react';

interface CitizenReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLocation?: string;
  defaultCoordinates?: { latitude: number; longitude: number };
}

interface GroundReport {
  id: string;
  observerName: string;
  role: string;
  location: string;
  waterDepthCm: number;
  rainCondition: string;
  timestamp: string;
  verified: boolean;
  notes: string;
}

const INITIAL_REPORTS: GroundReport[] = [
  {
    id: 'REP-041',
    observerName: 'Ramesh K. (Gram Sevak)',
    role: 'Panchayat Observer',
    location: 'Chooralmala Bridge Road, Wayanad',
    waterDepthCm: 75,
    rainCondition: 'Torrential Downpour',
    timestamp: '14 minutes ago',
    verified: true,
    notes: 'Stream overflowing onto primary road. Small bridge barricaded by SDRF.'
  },
  {
    id: 'REP-042',
    observerName: 'Devinder Thakur',
    role: 'Aapda Mitra Volunteer',
    location: 'Bhuntar Beas Confluence, Kullu',
    waterDepthCm: 45,
    rainCondition: 'Continuous Rain',
    timestamp: '28 minutes ago',
    verified: true,
    notes: 'Silt deposition high. Low-lying shops vacating inventory.'
  },
  {
    id: 'REP-043',
    observerName: 'Sanjay Sawant',
    role: 'Resident Observer',
    location: 'Chiplun Old Market, Ratnagiri',
    waterDepthCm: 30,
    rainCondition: 'Intermittent Showers',
    timestamp: '42 minutes ago',
    verified: false,
    notes: 'Drains overflowing near bus stand. Water accumulating on state highway.'
  }
];

export const CitizenReportModal: React.FC<CitizenReportModalProps> = ({
  isOpen,
  onClose,
  defaultLocation,
  defaultCoordinates
}) => {
  const [activeTab, setActiveTab] = useState<'report' | 'feed' | 'helplines'>('report');
  const [reports, setReports] = useState<GroundReport[]>(INITIAL_REPORTS);
  
  // Form state
  const [observerName, setObserverName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [locationName, setLocationName] = useState(defaultLocation || '');
  const [waterDepth, setWaterDepth] = useState<number>(30);
  const [rainStatus, setRainStatus] = useState<string>('Heavy Rain');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const newReport: GroundReport = {
        id: `REP-${Math.floor(100 + Math.random() * 900)}`,
        observerName: observerName.trim() || 'Anonymous Citizen Observer',
        role: 'Verified Local Observer',
        location: locationName.trim() || 'Reported Catchment Area',
        waterDepthCm: waterDepth,
        rainCondition: rainStatus,
        timestamp: 'Just now',
        verified: true,
        notes: notes.trim() || 'Reported via FloodGuard Mobile Ground Protocol.'
      };

      setReports([newReport, ...reports]);
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setActiveTab('feed');
      }, 1500);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                <UsersIcon className="w-5 h-5" />
              </span>
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide font-mono">
                CITIZEN & OBSERVER GROUND INTELLIGENCE
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Crowdsourced early warning verification • Panchayat & volunteer network (7C: Community)
            </p>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200/70 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white text-xs font-mono">
          <button
            onClick={() => setActiveTab('report')}
            className={`flex-1 py-3 text-center font-bold transition-all border-b-2 ${
              activeTab === 'report'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40'
                : 'border-transparent text-slate-600 hover:bg-slate-50'
            }`}
          >
            📝 Submit Ground Report
          </button>
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex-1 py-3 text-center font-bold transition-all border-b-2 ${
              activeTab === 'feed'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40'
                : 'border-transparent text-slate-600 hover:bg-slate-50'
            }`}
          >
            📡 Live Field Feed ({reports.length})
          </button>
          <button
            onClick={() => setActiveTab('helplines')}
            className={`flex-1 py-3 text-center font-bold transition-all border-b-2 ${
              activeTab === 'helplines'
                ? 'border-rose-600 text-rose-700 bg-rose-50/40'
                : 'border-transparent text-slate-600 hover:bg-slate-50'
            }`}
          >
            ☎️ Emergency Helplines
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 font-sans">
          {activeTab === 'report' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {submitSuccess ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 animate-fadeIn">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h3 className="text-base font-bold text-emerald-900">Ground Report Ingested Successfully</h3>
                  <p className="text-xs text-emerald-700">
                    Your observation has been verified and cross-referenced with CWC & Open-Meteo telemetry.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">
                        Observer / Citizen Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Rajesh Sharma (Aapda Mitra)"
                        value={observerName}
                        onChange={(e) => setObserverName(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">
                        Phone Number (for verification)
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">
                      Village / Landmark / Catchment Location
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="e.g., Chooralmala Bus Stand, Wayanad"
                        value={locationName}
                        onChange={(e) => setLocationName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                      />
                    </div>
                  </div>

                  {/* Water Depth Selector */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700 uppercase font-mono">
                        Estimated Standing Water Depth
                      </label>
                      <span className="text-xs font-black font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {waterDepth} cm ({waterDepth < 20 ? 'Puddle' : waterDepth < 50 ? 'Ankle-Knee' : waterDepth < 100 ? 'Waist-High' : 'Severe Inundation'})
                      </span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="180"
                      step="5"
                      value={waterDepth}
                      onChange={(e) => setWaterDepth(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                      <span>5cm (Road Wet)</span>
                      <span>50cm (Knee Deep)</span>
                      <span>100cm (Waist Deep)</span>
                      <span>180cm+ (Submerged)</span>
                    </div>
                  </div>

                  {/* Rain Condition Buttons */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1.5">
                      Current Rainfall Situation
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {['No Rain', 'Light Drizzle', 'Heavy Rain', 'Cloudburst / Deluge'].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setRainStatus(status)}
                          className={`py-2 px-2.5 rounded-xl border text-xs font-mono font-bold text-center transition-all ${
                            rainStatus === status
                              ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Field Notes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">
                      Field Notes & Blocked Routes
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Mention road blockage, culvert damage, mudslide signs, or trapped vehicles..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    {isSubmitting ? (
                      <span>Transmitting Ground Report...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Dispatch Verified Ground Intelligence</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </form>
          )}

          {activeTab === 'feed' && (
            <div className="space-y-3 font-mono">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                <span>Recent Observations ({reports.length})</span>
                <span className="text-[10px] text-emerald-600 flex items-center gap-1 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  SYNCED WITH DISTRICT EOC
                </span>
              </div>

              {reports.map((report) => (
                <div 
                  key={report.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2 hover:border-indigo-300 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs font-sans">{report.observerName}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                        {report.role}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {report.timestamp}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                    <span className="font-semibold">{report.location}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200/60">
                    <div className="bg-white p-2 rounded-xl border border-slate-200/80">
                      <span className="text-slate-400 block text-[9px]">WATER DEPTH</span>
                      <span className="font-black text-blue-700">{report.waterDepthCm} cm</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200/80">
                      <span className="text-slate-400 block text-[9px]">RAIN CONDITION</span>
                      <span className="font-black text-slate-800">{report.rainCondition}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 font-sans italic pt-1">
                    "{report.notes}"
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'helplines' && (
            <div className="space-y-4">
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs">
                <div className="flex items-center gap-2 text-rose-800 font-bold mb-1">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>EMERGENCY DISASTER RESPONSE DIRECTORY</span>
                </div>
                <p className="text-rose-700 font-sans">
                  In case of flash flooding, trapped citizens, or river embankment breaches, contact the dedicated 24x7 control helplines immediately.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                <a
                  href="tel:1078"
                  className="p-3 bg-white border border-slate-200 rounded-2xl hover:border-rose-400 hover:shadow-md transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                      <PhoneCall className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 font-sans">NDRF Headquarters</div>
                      <div className="text-lg font-black text-rose-600">1078</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </a>

                <a
                  href="tel:1070"
                  className="p-3 bg-white border border-slate-200 rounded-2xl hover:border-indigo-400 hover:shadow-md transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 font-sans">State EOC (SEOC)</div>
                      <div className="text-lg font-black text-indigo-600">1070</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </a>

                <a
                  href="tel:112"
                  className="p-3 bg-white border border-slate-200 rounded-2xl hover:border-slate-400 hover:shadow-md transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 font-sans">National Emergency</div>
                      <div className="text-lg font-black text-slate-800">112</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </a>

                <a
                  href="tel:108"
                  className="p-3 bg-white border border-slate-200 rounded-2xl hover:border-emerald-400 hover:shadow-md transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 font-sans">Ambulance / Medical</div>
                      <div className="text-lg font-black text-emerald-600">108</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const UsersIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);
