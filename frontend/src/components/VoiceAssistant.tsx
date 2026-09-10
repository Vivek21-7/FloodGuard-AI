import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Navigation, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin,
  RefreshCw,
  HelpCircle,
  PhoneCall,
  Phone
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { PredictResponse, RiskLevel } from '../types';
import { getEmergencyHelplinesForLocation } from '../services/emergencyService';

export interface VoiceAssistantProps {
  onSelectLocation: (lat: number, lon: number, name?: string) => void;
  predictionData: PredictResponse | null;
  isLoading?: boolean;
  selectedLocationName?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isProcessing?: boolean;
  predictionCard?: {
    locationName: string;
    riskLevel: RiskLevel;
    probability: number;
    leadTime: number;
    rainfall: number;
    latitude: number;
    longitude: number;
  };
}

// 7 Supported Indian Languages - Speech codes & prompt dictionary
const LANGUAGE_SPEECH_MAP: Record<string, {
  speechCode: string;
  langLabel: string;
  welcome: string;
  listening: string;
  processing: string;
  notFound: string;
  tryAgain: string;
  browserUnsupported: string;
  micDenied: string;
  riskLevels: Record<RiskLevel, string>;
  suggestions: string[];
}> = {
  en: {
    speechCode: 'en-IN',
    langLabel: 'English (India)',
    welcome: 'Hello! I am your FloodGuard Voice Assistant. Speak a location name (e.g. "Check flood risk in Wayanad" or "Kullu") to assess live flood risk.',
    listening: 'Listening... speak now',
    processing: 'Searching location & fetching telemetry...',
    notFound: 'Could not locate that area. Please try another city, district, or river basin.',
    tryAgain: 'No speech detected. Please tap the microphone and speak clearly.',
    browserUnsupported: 'Voice recognition is best supported in Google Chrome or Microsoft Edge.',
    micDenied: 'Microphone permission was denied. Please allow microphone access in browser settings.',
    riskLevels: {
      LOW: 'Low Risk',
      MODERATE: 'Moderate Risk',
      HIGH: 'High Risk',
      CRITICAL: 'Critical Danger'
    },
    suggestions: ['Kullu', 'Wayanad', 'Kedarnath', 'Patna', 'Chiplun', 'Guwahati']
  },
  hi: {
    speechCode: 'hi-IN',
    langLabel: 'हिन्दी (India)',
    welcome: 'नमस्ते! मैं आपका फ्लडगार्ड वॉयस असिस्टेंट हूँ। किसी भी स्थान का बाढ़ जोखिम जानने के लिए बोलें (जैसे: "वायनाड का बाढ़ खतरा बताओ" या "कुल्लू")।',
    listening: 'सुन रहा हूँ... अब बोलिए',
    processing: 'स्थान खोजा जा रहा है...',
    notFound: 'स्थान नहीं मिला। कृपया किसी अन्य शहर या जिले का नाम बोलें।',
    tryAgain: 'आवाज़ सुनाई नहीं दी। कृपया माइक दबाकर दोबारा बोलें।',
    browserUnsupported: 'वॉयस इनपुट के लिए क्रोम या एज ब्राउज़र का उपयोग करें।',
    micDenied: 'माइक्रोफ़ोन की अनुमति अस्वीकृत है। ब्राउज़र सेटिंग में अनुमति दें।',
    riskLevels: {
      LOW: 'कम जोखिम',
      MODERATE: 'मध्यम जोखिम',
      HIGH: 'उच्च जोखिम',
      CRITICAL: 'अत्यधिक गंभीर खतरा'
    },
    suggestions: ['कुल्लू', 'वायनाड', 'केदारनाथ', 'पटना', 'चिपलूण', 'गुवाहाटी']
  },
  te: {
    speechCode: 'te-IN',
    langLabel: 'తెలుగు (India)',
    welcome: 'నమస్కారం! నేను మీ ఫ్లడ్‌గార్డ్ వాయిస్ అసిస్టెంట్‌ని. ఏదైనా ప్రాంతం వరద ముప్పు తెలుసుకోవడానికి మాట్లాడండి (ఉదా: "వాయనాడ్ వరద ముప్పు" లేదా "కుల్లు").',
    listening: 'వింటున్నాను... మాట్లాడండి',
    processing: 'ప్రాంతాన్ని శోధిస్తోంది...',
    notFound: 'ప్రాంతం కనుగొనబడలేదు. దయచేసి మరొక ఊరి పేరు చెప్పండి.',
    tryAgain: 'స్వరం గుర్తించబడలేదు. దయచేసి మళ్లీ ప్రయత్నించండి.',
    browserUnsupported: 'వాయిస్ ఇన్పుట్ కోసం Chrome లేదా Edge ఉపయోగించండి.',
    micDenied: 'మైక్రోఫోన్ అనుమతి నిరాకరించబడింది.',
    riskLevels: {
      LOW: 'తక్కువ ముప్పు',
      MODERATE: 'మధ్యస్థ ముప్పు',
      HIGH: 'అధిక ముప్పు',
      CRITICAL: 'తీవ్రమైన ప్రమాదం'
    },
    suggestions: ['కుల్లు', 'వాయనాడ్', 'కేదార్‌నాథ్', 'పాట్నా', 'చిప్లూన్', 'గౌహతి']
  },
  pa: {
    speechCode: 'pa-IN',
    langLabel: 'ਪੰਜਾਬੀ (India)',
    welcome: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ ਫਲੱਡਗਾਰਡ ਵੌਇਸ ਅਸਿਸਟੈਂਟ ਹਾਂ। ਕਿਸੇ ਵੀ ਖੇਤਰ ਦੇ ਹੜ੍ਹ ਜੋਖਮ ਦੀ ਜਾਂਚ ਕਰਨ ਲਈ ਬੋਲੋ (ਜਿਵੇਂ: "ਕੁੱਲੂ ਦੀ ਜਾਂਚ ਕਰੋ")।',
    listening: 'ਸੁਣ ਰਿਹਾ ਹਾਂ... ਹੁਣ ਬੋਲੋ',
    processing: 'ਸਥਾਨ ਖੋਜਿਆ ਜਾ ਰਿਹਾ ਹੈ...',
    notFound: 'ਸਥਾਨ ਨਹੀਂ ਮਿਲਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    tryAgain: 'ਕੋਈ ਆਵਾਜ਼ ਨਹੀਂ ਸੁਣੀ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਬੋਲੋ।',
    browserUnsupported: 'ਕਿਰਪਾ ਕਰਕੇ Chrome ਜਾਂ Edge ਬ੍ਰਾਊਜ਼ਰ ਦੀ ਵਰਤੋਂ ਕਰੋ।',
    micDenied: 'ਮਾਈਕ੍ਰੋਫੋਨ ਦੀ ਇਜਾਜ਼ਤ ਨਹੀਂ ਦਿੱਤੀ ਗਈ।',
    riskLevels: {
      LOW: 'ਘੱਟ ਜੋਖਮ',
      MODERATE: 'ਦਰਮਿਆਨਾ ਜੋਖਮ',
      HIGH: 'ਉੱਚ ਜੋਖਮ',
      CRITICAL: 'ਗੰਭੀਰ ਖ਼ਤਰਾ'
    },
    suggestions: ['ਕੁੱਲੂ', 'ਵਾਇਨਾਡ', 'ਕੇਦਾਰਨਾਥ', 'ਪਟਨਾ', 'ਚਿਪਲੂਨ', 'ਗੁਵਾਹਾਟੀ']
  },
  bn: {
    speechCode: 'bn-IN',
    langLabel: 'বাংলা (India)',
    welcome: 'নমস্কার! আমি আপনার ফ্লাডগার্ড ভয়েস অ্যাসিস্ট্যান্ট। যেকোনো অঞ্চলের বন্যার ঝুঁকি জানতে কথা বলুন (যেমন: "ওয়ায়ানাড়ের বন্যার ঝুঁকি" বা "কুল্লু")।',
    listening: 'শুনছি... এখন বলুন',
    processing: 'অবস্থান অনুসন্ধান করা হচ্ছে...',
    notFound: 'অবস্থান পাওয়া যায়নি। অনুগ্রহ করে অন্য এলাকার নাম বলুন।',
    tryAgain: 'কথা সনাক্ত করা যায়নি। অনুগ্রহ করে আবার বলুন।',
    browserUnsupported: 'ভয়েস ফিচারের জন্য Chrome বা Edge ব্যবহার করুন।',
    micDenied: 'মাইক্রোফোনের অনুমতি পাওয়া যায়নি।',
    riskLevels: {
      LOW: 'কম ঝুঁকি',
      MODERATE: 'মাঝারি ঝুঁকি',
      HIGH: 'উচ্চ ঝুঁকি',
      CRITICAL: 'চরম বিপজ্জনক'
    },
    suggestions: ['কুল্লু', 'ওয়ায়ানাড়', 'কেদারনাথ', 'পাটনা', 'চিপলুন', 'গুয়াহাটি']
  },
  mr: {
    speechCode: 'mr-IN',
    langLabel: 'मराठी (India)',
    welcome: 'नमस्कार! मी तुमचा फ्लडगार्ड व्हॉइस असिस्टंट आहे. पूर धोक्याची माहिती मिळवण्यासाठी बोला (उदा. "चिपळूण पूर धोका तपासा" किंवा "कुल्लू").',
    listening: 'ऐकत आहे... आता बोला',
    processing: 'स्थान शोधत आहे...',
    notFound: 'स्थान सापडले नाही. कृपया दुसऱ्या शहराचे नाव सांगा.',
    tryAgain: 'आवाज ऐकू आला नाही. कृपया पुन्हा प्रयत्न करा.',
    browserUnsupported: 'व्हॉइस इनपुटसाठी Chrome किंवा Edge वापरा.',
    micDenied: 'मायक्रोफोन परवानगी नाकारली आहे.',
    riskLevels: {
      LOW: 'कमी धोका',
      MODERATE: 'मध्यम धोका',
      HIGH: 'उच्च धोका',
      CRITICAL: 'गंभीर धोका'
    },
    suggestions: ['कुल्लू', 'वायनाड', 'केदारनाथ', 'पाटणा', 'चिपळूण', 'गुवाहाटी']
  },
  ta: {
    speechCode: 'ta-IN',
    langLabel: 'தமிழ் (India)',
    welcome: 'வணக்கம்! நான் உங்கள் பிளட்கார்ட் குரல் உதவியாளர். வெள்ள அபாயத்தை அறிய பேசுங்கள் (எ.கா: "வயநாடு வெள்ள அபாயம்" அல்லது "குல்லு").',
    listening: 'கேட்கிறேன்... பேசுங்கள்',
    processing: 'இடம் தேடப்படுகிறது...',
    notFound: 'இடம் கிடைக்கவில்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.',
    tryAgain: 'குரல் கண்டறியப்படவில்லை. தயவுசெய்து மீண்டும் பேசவும்.',
    browserUnsupported: 'குரல் அம்சத்திற்கு Chrome அல்லது Edge பயன்படுத்தவும்.',
    micDenied: 'மைக்ரோஃபோன் அனுமதி மறுக்கப்பட்டது.',
    riskLevels: {
      LOW: 'குறைந்த அபாயம்',
      MODERATE: 'மிதமான அபாயம்',
      HIGH: 'அதிக அபாயம்',
      CRITICAL: 'தீவிர ஆபத்து'
    },
    suggestions: ['குல்லு', 'வயநாடு', 'கேதார்நாத்', 'பாட்னா', 'சிப்லூன்', 'குவஹாத்தி']
  }
};

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  onSelectLocation,
  predictionData,
  isLoading = false,
  selectedLocationName = ''
}) => {
  const { language } = useLanguage();
  const currentLangConfig = LANGUAGE_SPEECH_MAP[language] || LANGUAGE_SPEECH_MAP['en'];

  // Panel & Voice States
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(true);
  const [isTtsMuted, setIsTtsMuted] = useState<boolean>(false);
  const [textInput, setTextInput] = useState<string>('');
  
  // Track last spoken prediction to prevent repetitive echoes
  const lastSpokenLocationRef = useRef<string>('');
  const pendingVoiceSearchLocationRef = useRef<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Initial welcome message
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'assistant',
      text: currentLangConfig.welcome,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Update welcome message if language changes and messages are at start
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [{
          id: 'welcome',
          sender: 'assistant',
          text: currentLangConfig.welcome,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }];
      }
      return prev;
    });
  }, [language, currentLangConfig]);

  // Check browser speech support on mount
  useEffect(() => {
    const hasRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    setIsSpeechSupported(Boolean(hasRecognition));
  }, []);

  // Auto-scroll chat to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isListening, scrollToBottom]);

  // Helper to construct spoken text announcement
  const buildSpeechAnnouncement = (
    locName: string,
    risk: RiskLevel,
    prob: number,
    leadTime: number,
    rain: number
  ): string => {
    const riskText = currentLangConfig.riskLevels[risk] || risk;
    
    switch (language) {
      case 'hi':
        return `${locName} के लिए बाढ़ जोखिम विश्लेषण। जोखिम स्तर ${riskText} है, और बाढ़ की संभावना ${prob} प्रतिशत है। अपेक्षित चेतावनी समय ${leadTime} मिनट है। अनुमानित वर्षा ${rain} मिलीमीटर है।`;
      case 'te':
        return `${locName} వరద ముప్పు విశ్లేషణ. ముప్పు స్థాయి ${riskText}, వరద సంభావ్యత ${prob} శాతం. హెచ్చరిక సమయం ${leadTime} నిమిషాలు.`;
      case 'pa':
        return `${locName} ਲਈ ਹੜ੍ਹ ਜੋਖਮ ਵਿਸ਼ਲੇਸ਼ਣ। ਜੋਖਮ ਪੱਧਰ ${riskText} ਹੈ ਅਤੇ ਸੰਭਾਵਨਾ ${prob} ਪ੍ਰਤੀਸ਼ਤ ਹੈ। ਅਨੁਮਾਨਿਤ ਸਮਾਂ ${leadTime} ਮਿੰਟ ਹੈ।`;
      case 'bn':
        return `${locName}-এর বন্যার ঝুঁকি মূল্যায়ন। ঝুঁকির স্তর ${riskText}, এবং বন্যার সম্ভাবনা ${prob} শতাংশ। সতর্কতার সময় ${leadTime} মিনিট।`;
      case 'mr':
        return `${locName} साठी पूर धोका विश्लेषण. धोका पातळी ${riskText} असून पुराची शक्यता ${prob} टक्के आहे. पूर्वसूचना वेळ ${leadTime} मिनिटे आहे.`;
      case 'ta':
        return `${locName} வெள்ள அபாய மதிப்பீடு. அபாய நிலை ${riskText}, வெள்ள சாத்தியக்கூறு ${prob} சதவீதம். எச்சரிக்கை நேரம் ${leadTime} நிமிடங்கள்.`;
      case 'en':
      default:
        return `Flood risk assessment for ${locName}. Current alert level is ${riskText} with a ${prob}% flood probability. Estimated evacuation lead time is ${leadTime} minutes.`;
    }
  };

  // Text-To-Speech Execution
  const speakText = useCallback((text: string) => {
    if (isTtsMuted || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = currentLangConfig.speechCode;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      // Select localized voice if available
      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(
        v => v.lang === currentLangConfig.speechCode || v.lang.startsWith(language)
      );
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
      setIsSpeaking(false);
    }
  }, [currentLangConfig, isTtsMuted, language]);

  // Stop speaking
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Extract pure location query by stripping natural language prefixes/suffixes
  const cleanLocationQuery = (raw: string): string => {
    let text = raw.trim();

    // Common multilingual command prefixes
    const prefixes = [
      /^(check|show me|show|find|search for|search|flood risk in|flood risk of|flood risk at|flood risk for|go to|locate|what is the flood risk in|what is the risk in|how is the flood in|weather in|tell me about|open|track|analyze|navigate to|look up)\s+/i,
      /^(का खतरा|की स्थिति|का मौसम|में बाढ़|का बाढ़|के बारे में)\s+/i,
      /^(వరద|ముప్పు|చూపించు|శోధించండి)\s+/i,
      /^(हड़ताल|तपासा|सांगा)\s+/i
    ];

    for (const regex of prefixes) {
      text = text.replace(regex, '');
    }

    // Common trailing words (e.g., "Kullu flood risk", "Wayanad check karo")
    const suffixes = [
      /\s+(flood risk|risk|flood|forecast|weather|alert|status|update)$/i,
      /\s+(का खतरा|बाढ़ खतरा|का मौसम|दिखाओ|चेक करो|बताओ|का हाल)$/i,
      /\s+(ముప్పు|వరద|చూడండి|పరిస్థితి)$/i
    ];

    for (const regex of suffixes) {
      text = text.replace(regex, '');
    }

    // Strip punctuation
    text = text.replace(/[?.,!"]/g, '').trim();
    return text || raw.trim();
  };

  // Execute location search from voice or text
  const handleQuerySearch = async (rawQuery: string) => {
    const cleaned = cleanLocationQuery(rawQuery);
    if (!cleaned) return;

    // Add user message
    const userMsgId = `user_${Date.now()}`;
    const assistantMsgId = `asst_${Date.now()}`;
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages(prev => [
      ...prev,
      { id: userMsgId, sender: 'user', text: rawQuery, timestamp: timeNow },
      { id: assistantMsgId, sender: 'assistant', text: `${currentLangConfig.processing} ("${cleaned}")`, timestamp: timeNow, isProcessing: true }
    ]);

    try {
      const res = await api.searchLocations(cleaned);
      if (res && res.results && res.results.length > 0) {
        const bestMatch = res.results[0];
        pendingVoiceSearchLocationRef.current = bestMatch.name;

        // Trigger map and app state navigation
        onSelectLocation(bestMatch.latitude, bestMatch.longitude, bestMatch.name);

        // Update assistant message with confirmation
        setMessages(prev => prev.map(m => {
          if (m.id === assistantMsgId) {
            return {
              ...m,
              text: `📍 Found "${bestMatch.name}". Analyzing real-time hydrological telemetry...`,
              isProcessing: true
            };
          }
          return m;
        }));
      } else {
        setMessages(prev => prev.map(m => {
          if (m.id === assistantMsgId) {
            return {
              ...m,
              text: `❌ ${currentLangConfig.notFound} ("${cleaned}")`,
              isProcessing: false
            };
          }
          return m;
        }));
      }
    } catch (err) {
      console.error('Location search failed:', err);
      setMessages(prev => prev.map(m => {
        if (m.id === assistantMsgId) {
          return {
            ...m,
            text: `⚠️ Network error while searching "${cleaned}". Please try again.`,
            isProcessing: false
          };
        }
        return m;
      }));
    }
  };

  // Listen for predictionData updates to announce results automatically
  useEffect(() => {
    if (!predictionData || isLoading) return;

    const locName = predictionData.location?.name || selectedLocationName || 'Selected Catchment';
    const risk = predictionData.prediction?.risk_level || 'LOW';
    const prob = predictionData.prediction?.flood_probability_percent ?? 18;
    const leadTime = predictionData.warning?.lead_time_minutes ?? 180;
    const rainFactor = predictionData.contributing_factors?.find(
      f => f.factor.toLowerCase().includes('rain') || f.factor.toLowerCase().includes('precip')
    );
    const rain = rainFactor ? rainFactor.current_value : 0.0;
    const lat = predictionData.location?.latitude || 0;
    const lon = predictionData.location?.longitude || 0;

    // Check if this prediction was requested or is new
    const uniqueKey = `${locName}_${risk}_${prob}_${predictionData.warning?.estimated_peak_time || ''}`;
    if (lastSpokenLocationRef.current === uniqueKey) return;
    lastSpokenLocationRef.current = uniqueKey;

    const speechText = buildSpeechAnnouncement(locName, risk, prob, leadTime, rain);

    // If panel is open or if user just searched via voice, append card to chat & speak
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const cardMsgId = `pred_${Date.now()}`;

    setMessages(prev => {
      // Clear processing states
      const cleaned = prev.map(m => m.isProcessing ? { ...m, isProcessing: false } : m);
      return [
        ...cleaned,
        {
          id: cardMsgId,
          sender: 'assistant',
          text: speechText,
          timestamp: timeNow,
          predictionCard: {
            locationName: locName,
            riskLevel: risk,
            probability: prob,
            leadTime: leadTime,
            rainfall: rain,
            latitude: lat,
            longitude: lon
          }
        }
      ];
    });

    // Automatically speak announcement
    speakText(speechText);
  }, [predictionData, isLoading, selectedLocationName, speakText]);

  // Voice Recognition Handler (Microphone Button)
  const toggleListening = () => {
    if (isSpeaking) {
      stopSpeaking();
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: currentLangConfig.browserUnsupported,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognitionRef.current = recognition;

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = currentLangConfig.speechCode;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setInterimTranscript('');
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            final += item[0].transcript;
          } else {
            interim += item[0].transcript;
          }
        }

        setInterimTranscript(interim);

        if (final) {
          setIsListening(false);
          setInterimTranscript('');
          handleQuerySearch(final);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.warn('Speech recognition error event:', event.error);
        setIsListening(false);
        setInterimTranscript('');

        let errMsg = currentLangConfig.tryAgain;
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          errMsg = currentLangConfig.micDenied;
        }

        setMessages(prev => [
          ...prev,
          {
            id: `err_${Date.now()}`,
            sender: 'assistant',
            text: errMsg,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to initialize speech recognition:', err);
      setIsListening(false);
    }
  };

  // Text input submit handler
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    const query = textInput.trim();
    setTextInput('');
    handleQuerySearch(query);
  };

  // Risk styling helper
  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case 'CRITICAL':
        return { bg: 'bg-rose-100 text-rose-800 border-rose-300', dot: 'bg-rose-500' };
      case 'HIGH':
        return { bg: 'bg-orange-100 text-orange-800 border-orange-300', dot: 'bg-orange-500' };
      case 'MODERATE':
        return { bg: 'bg-amber-100 text-amber-800 border-amber-300', dot: 'bg-amber-500' };
      case 'LOW':
      default:
        return { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500' };
    }
  };

  return (
    <>
      {/* 1. Floating Circular Microphone Button (Collapsed State) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          {/* Subtle Hover / Ambient Tooltip */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 text-white text-xs font-medium shadow-lg backdrop-blur-md border border-slate-700/50 animate-fade-in pointer-events-none">
            <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span>Voice Assistant</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-600/80 font-mono">
              {currentLangConfig.langLabel.split(' ')[0]}
            </span>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open FloodGuard Voice Assistant"
            className="relative group p-4 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center border-2 border-white/30"
          >
            {/* Ambient Animated Pulse Rings */}
            <span className="absolute inset-0 rounded-full bg-blue-400 opacity-30 animate-ping group-hover:opacity-50 pointer-events-none" />
            <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 opacity-20 blur-sm group-hover:opacity-40 transition-opacity" />

            <Mic className="w-6 h-6 text-white relative z-10" />

            {/* Speaking / Audio Wave indicator */}
            {isSpeaking && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-sky-500 border border-white items-center justify-center">
                  <Volume2 className="w-2.5 h-2.5 text-white" />
                </span>
              </span>
            )}
          </button>
        </div>
      )}

      {/* 2. Conversational Chat Panel (Expanded State) */}
      {isOpen && (
        <div 
          role="dialog"
          aria-labelledby="voice-assistant-title"
          className="fixed bottom-6 right-6 z-50 w-[360px] sm:w-[410px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[85vh] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden font-sans text-slate-900 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
        >
          {/* Header Bar */}
          <div className="px-5 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                <Sparkles className="w-5 h-5 text-sky-200" />
              </div>
              <div>
                <h2 id="voice-assistant-title" className="text-sm font-bold tracking-tight flex items-center gap-1.5">
                  FloodGuard AI Assistant
                </h2>
                <div className="flex items-center gap-1.5 text-[11px] text-blue-100 font-medium">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{currentLangConfig.langLabel}</span>
                </div>
              </div>
            </div>

            {/* Header Action Controls */}
            <div className="flex items-center gap-1">
              {/* TTS Mute / Unmute Button */}
              <button
                onClick={() => {
                  if (isSpeaking) stopSpeaking();
                  setIsTtsMuted(!isTtsMuted);
                }}
                title={isTtsMuted ? 'Unmute voice announcements' : 'Mute voice announcements'}
                className="p-2 rounded-xl text-blue-100 hover:text-white hover:bg-white/10 transition-colors"
              >
                {isTtsMuted ? <VolumeX className="w-4 h-4 text-rose-300" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Close Button */}
              <button
                onClick={() => {
                  if (isListening && recognitionRef.current) recognitionRef.current.stop();
                  if (isSpeaking) stopSpeaking();
                  setIsOpen(false);
                }}
                aria-label="Close Voice Assistant"
                className="p-2 rounded-xl text-blue-100 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/60 font-sans text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] p-3.5 rounded-2xl shadow-xs transition-all ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                  {/* Processing indicator spinner */}
                  {msg.isProcessing && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 text-blue-600 text-[11px] font-medium">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Fetching ML prediction...</span>
                    </div>
                  )}

                  {/* Prediction Summary Result Card */}
                  {msg.predictionCard && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900 text-[11px] flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-blue-600" />
                          {msg.predictionCard.locationName}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase ${getRiskBadge(msg.predictionCard.riskLevel).bg}`}>
                          {msg.predictionCard.riskLevel}
                        </span>
                      </div>

                      {/* Probability & Lead Time Grid */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-slate-500 block">Flood Probability</span>
                          <span className="font-bold text-slate-900 text-xs">{msg.predictionCard.probability}%</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Lead Time</span>
                          <span className="font-bold text-slate-900 text-xs">{msg.predictionCard.leadTime} Mins</span>
                        </div>
                      </div>

                      {/* 🚨 Emergency Helplines for this Searched Location */}
                      {(() => {
                        const hl = getEmergencyHelplinesForLocation(
                          msg.predictionCard.locationName,
                          msg.predictionCard.latitude,
                          msg.predictionCard.longitude
                        );
                        return (
                          <div className="p-2 bg-rose-50/80 rounded-xl border border-rose-100 flex items-center justify-between gap-1 text-[10px]">
                            <span className="font-bold text-rose-900 flex items-center gap-1 truncate font-sans">
                              <PhoneCall className="w-3 h-3 text-rose-600 animate-pulse shrink-0" />
                              <span className="truncate">{hl.matchedState} Desk:</span>
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              {hl.contacts.length > 0 && hl.contacts[0].numbers[0] && (
                                <a
                                  href={`tel:${hl.contacts[0].numbers[0].replace(/[^0-9+]/g, '')}`}
                                  className="px-2 py-0.5 rounded-md bg-white border border-rose-300 text-rose-700 font-mono font-bold hover:bg-rose-600 hover:text-white transition-all flex items-center gap-0.5 shadow-2xs"
                                  title={`Call ${hl.contacts[0].label}`}
                                >
                                  <Phone className="w-2.5 h-2.5" />
                                  <span>{hl.contacts[0].numbers[0]}</span>
                                </a>
                              )}
                              <a
                                href="tel:112"
                                className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-mono font-black hover:bg-rose-700 transition-all flex items-center gap-0.5 shadow-2xs"
                                title="Call 112"
                              >
                                <span>112</span>
                              </a>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Card Action Button: Repeat Speech */}
                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => speakText(msg.text)}
                          className="flex items-center gap-1 text-[10px] text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Replay audio</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <span
                    className={`block text-[9px] mt-1.5 ${
                      msg.sender === 'user' ? 'text-blue-200 text-right' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Live Interim Transcript Feedback */}
            {isListening && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                  <Mic className="w-4 h-4 text-white" />
                </div>
                <div className="p-3 bg-blue-50/90 border border-blue-200/80 rounded-2xl rounded-bl-xs text-blue-900 text-xs shadow-xs max-w-[85%]">
                  <div className="flex items-center gap-1.5 text-blue-600 font-bold mb-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span>{currentLangConfig.listening}</span>
                  </div>
                  <p className="italic">{interimTranscript || '...'}</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-4 py-2 bg-slate-100/80 border-t border-slate-200/70">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
              <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
                <Navigation className="w-3 h-3 text-blue-500" />
                <span>Try:</span>
              </span>
              {currentLangConfig.suggestions.map((loc) => (
                <button
                  key={loc}
                  onClick={() => handleQuerySearch(loc)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-all shrink-0 shadow-2xs"
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Controls & Voice Recording Button */}
          <div className="p-4 bg-white border-t border-slate-200 flex flex-col gap-3">
            {/* Audio Wave / Status Bar */}
            {isListening && (
              <div className="flex items-center justify-center gap-1 h-3">
                <span className="w-1 bg-blue-600 h-2 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1 bg-indigo-600 h-4 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1 bg-blue-500 h-3 rounded-full animate-bounce" />
                <span className="w-1 bg-indigo-500 h-5 rounded-full animate-bounce [animation-delay:0.1s]" />
                <span className="w-1 bg-blue-600 h-2 rounded-full animate-bounce [animation-delay:0.25s]" />
              </div>
            )}

            <div className="flex items-center gap-2">
              {/* Text Input Fallback */}
              <form onSubmit={handleTextSubmit} className="flex-1 flex items-center relative">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={isListening ? currentLangConfig.listening : 'Speak or type location...'}
                  disabled={isListening}
                  className="w-full pl-3.5 pr-9 py-2.5 rounded-2xl bg-slate-100/90 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={!textInput.trim() || isListening}
                  aria-label="Send query"
                  className="absolute right-2 p-1 text-slate-400 hover:text-blue-600 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Central Voice Button */}
              <button
                type="button"
                onClick={toggleListening}
                disabled={!isSpeechSupported}
                title={isListening ? 'Stop listening' : 'Start speaking'}
                className={`p-3 rounded-2xl shadow-md flex items-center justify-center transition-all duration-300 relative ${
                  isListening
                    ? 'bg-rose-500 text-white ring-4 ring-rose-300 animate-pulse scale-105'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:scale-105 active:scale-95'
                } ${!isSpeechSupported ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                {isListening ? (
                  <MicOff className="w-5 h-5 text-white" />
                ) : (
                  <Mic className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceAssistant;
