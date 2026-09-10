/**
 * FloodGuard AI - National & State Disaster Helplines Directory
 * Direct access to 24/7 disaster management, relief, and flood control hotlines across India.
 */

export interface HelplineContact {
  label: string;
  numbers: string[];
  description?: string;
  isTollFree?: boolean;
  priority?: 'PRIMARY' | 'SECONDARY' | 'SPECIALIZED';
}

export interface StateEmergencyDirectory {
  state: string;
  aliases: string[];
  primaryNumbers: HelplineContact[];
  localHotlines?: HelplineContact[];
}

export const NATIONAL_UNIVERSAL_HELPLINES: HelplineContact[] = [
  {
    label: 'National Emergency Number (All-in-one)',
    numbers: ['112'],
    description: 'Unified 24/7 emergency response for Police, Fire, Ambulance & Disaster Response',
    isTollFree: true,
    priority: 'PRIMARY',
  },
  {
    label: 'NDMA Centralized Helpline',
    numbers: ['1078', '011-26701700'],
    description: 'National Disaster Management Authority Headquarters Central Control',
    isTollFree: true,
    priority: 'PRIMARY',
  },
  {
    label: 'NDRF HQ Control Room',
    numbers: ['011-24363260', '9711077372'],
    description: 'National Disaster Response Force 24/7 Deployment & Ops Desk',
    priority: 'PRIMARY',
  },
  {
    label: 'State Relief Commissioner (All States)',
    numbers: ['1070'],
    description: 'Universal state emergency operation centers (SEOC) toll-free hotline',
    isTollFree: true,
    priority: 'SECONDARY',
  },
  {
    label: 'District Emergency Control Room (All Districts)',
    numbers: ['1077'],
    description: 'Universal district disaster management authority (DDMA / DEOC) hotline',
    isTollFree: true,
    priority: 'SECONDARY',
  },
];

export const STATE_EMERGENCY_DIRECTORIES: StateEmergencyDirectory[] = [
  {
    state: 'Maharashtra',
    aliases: ['maharashtra', 'mumbai', 'pune', 'chiplun', 'ratnagiri', 'thane', 'nashik', 'nagpur', 'konkan'],
    primaryNumbers: [
      { label: 'Maharashtra State Control Room', numbers: ['022-22027990', '022-22794229'], priority: 'PRIMARY' },
      { label: 'State Relief Helpline', numbers: ['1070'], isTollFree: true, priority: 'PRIMARY' },
      { label: 'District Emergency Desk', numbers: ['1077'], isTollFree: true, priority: 'SECONDARY' },
    ],
    localHotlines: [
      { label: 'Mumbai (BMC & MMRDA Flood Desk)', numbers: ['1916', '1800-228-801'], isTollFree: true, priority: 'SPECIALIZED' },
      { label: 'Pune District Control Room', numbers: ['020-1077', '020-26123371'], priority: 'SPECIALIZED' },
      { label: 'Chiplun & Ratnagiri Flood Desk', numbers: ['02352-222233', '1077'], priority: 'SPECIALIZED' },
    ],
  },
  {
    state: 'Kerala',
    aliases: ['kerala', 'wayanad', 'chooralmala', 'meppadi', 'munnar', 'idukki', 'kochi', 'ernakulam', 'alappuzha', 'kozhikode', 'thiruvananthapuram'],
    primaryNumbers: [
      { label: 'Kerala State Emergency Ops (KSDMA)', numbers: ['1070', '0471-2364424'], isTollFree: true, priority: 'PRIMARY' },
      { label: 'District Emergency Control (DEOC)', numbers: ['1077'], isTollFree: true, priority: 'PRIMARY' },
    ],
    localHotlines: [
      { label: 'Wayanad District Disaster Helpline', numbers: ['04936-204151', '1077', '9447040400'], priority: 'SPECIALIZED' },
      { label: 'Idukki & Munnar Flood Cell', numbers: ['04862-233111', '1077'], priority: 'SPECIALIZED' },
    ],
  },
  {
    state: 'Himachal Pradesh',
    aliases: ['himachal', 'himachal pradesh', 'kullu', 'mandi', 'bhuntar', 'shimla', 'manali', 'kangra', 'dharamshala', 'solan', 'beas', 'spiti'],
    primaryNumbers: [
      { label: 'HP State Disaster Helpline (HPSDMA)', numbers: ['1070', '0177-2812344'], isTollFree: true, priority: 'PRIMARY' },
      { label: 'District Disaster Emergency Cell', numbers: ['1077'], isTollFree: true, priority: 'PRIMARY' },
    ],
    localHotlines: [
      { label: 'Kullu & Beas Basin Emergency Desk', numbers: ['01902-222375', '1077'], priority: 'SPECIALIZED' },
      { label: 'Mandi Suketi Gorge Control Room', numbers: ['01905-226201', '1077'], priority: 'SPECIALIZED' },
    ],
  },
  {
    state: 'Uttarakhand',
    aliases: ['uttarakhand', 'kedarnath', 'sonprayag', 'rudraprayag', 'chamoli', 'rishikesh', 'haridwar', 'dehradun', 'uttarkashi', 'badrinath'],
    primaryNumbers: [
      { label: 'Uttarakhand State Emergency (USDMA)', numbers: ['1070', '0135-2710334', '0135-2710335'], isTollFree: true, priority: 'PRIMARY' },
      { label: 'District Disaster Control Room', numbers: ['1077'], isTollFree: true, priority: 'PRIMARY' },
    ],
    localHotlines: [
      { label: 'Rudraprayag / Kedarnath Valley Control', numbers: ['01364-233727', '1077'], priority: 'SPECIALIZED' },
      { label: 'Chamoli Flood & Landslide Cell', numbers: ['01372-251437', '1077'], priority: 'SPECIALIZED' },
    ],
  },
  {
    state: 'Assam',
    aliases: ['assam', 'guwahati', 'dhemaji', 'brahmaputra', 'subansiri', 'silchar', 'cachar', 'dibrugarh', 'jorhat', 'kaziranga'],
    primaryNumbers: [
      { label: 'Assam State Control (ASDMA)', numbers: ['1070', '0361-2237219', '0361-2237011'], isTollFree: true, priority: 'PRIMARY' },
      { label: 'District Disaster Operations Center', numbers: ['1077'], isTollFree: true, priority: 'PRIMARY' },
    ],
    localHotlines: [
      { label: 'Guwahati Brahmaputra Flood Control', numbers: ['0361-2733052', '1077'], priority: 'SPECIALIZED' },
      { label: 'Dhemaji District Flood Operations', numbers: ['03753-224445', '1077'], priority: 'SPECIALIZED' },
    ],
  },
  {
    state: 'Bihar',
    aliases: ['bihar', 'patna', 'ganga', 'kosi', 'bhagalpur', 'muzaffarpur', 'gaya', 'purnia', 'katihar'],
    primaryNumbers: [
      { label: 'Bihar State Disaster Helpline', numbers: ['1800-245-6145', '1078'], isTollFree: true, priority: 'PRIMARY' },
      { label: 'State Relief Control Room', numbers: ['1070', '0612-2210118'], priority: 'PRIMARY' },
      { label: 'District Emergency Desk', numbers: ['1077'], isTollFree: true, priority: 'SECONDARY' },
    ],
  },
  {
    state: 'Delhi NCR',
    aliases: ['delhi', 'delhi ncr', 'new delhi', 'noida', 'gurugram', 'yamuna', 'ghaziabad', 'faridabad'],
    primaryNumbers: [
      { label: 'Delhi Centralized Disaster Control Room', numbers: ['1077', '011-24611210'], isTollFree: true, priority: 'PRIMARY' },
      { label: 'Delhi State Emergency Control', numbers: ['1070', '011-22421656'], priority: 'PRIMARY' },
    ],
    localHotlines: [
      { label: 'Yamuna Flood Control Central Office', numbers: ['011-22421656', '011-22502691'], priority: 'SPECIALIZED' },
    ],
  },
  {
    state: 'Tamil Nadu',
    aliases: ['tamil nadu', 'tamilnadu', 'chennai', 'coimbatore', 'madurai', 'cooum', 'adyar', 'cuddalore'],
    primaryNumbers: [
      { label: 'Tamil Nadu State Emergency (TNSDMA)', numbers: ['1070', '044-25619206', '044-25619506'], isTollFree: true, priority: 'PRIMARY' },
      { label: 'District Emergency Operations Desk', numbers: ['1077'], isTollFree: true, priority: 'PRIMARY' },
    ],
    localHotlines: [
      { label: 'Chennai Corporation Flood Helpline', numbers: ['1913', '044-25619206'], isTollFree: true, priority: 'SPECIALIZED' },
    ],
  },
  {
    state: 'Telangana',
    aliases: ['telangana', 'hyderabad', 'musi', 'secunderabad', 'warangal', 'khammam', 'godavari'],
    primaryNumbers: [
      { label: 'Telangana State Disaster Control', numbers: ['1070', '040-23454088'], priority: 'PRIMARY' },
      { label: 'District Emergency Control Center', numbers: ['1077'], isTollFree: true, priority: 'PRIMARY' },
    ],
    localHotlines: [
      { label: 'Hyderabad GHMC Emergency Helpline', numbers: ['211111111', '9000113667', '040-21111111'], isTollFree: true, priority: 'SPECIALIZED' },
    ],
  },
  {
    state: 'Karnataka',
    aliases: ['karnataka', 'bengaluru', 'bangalore', 'mysuru', 'mangalore', 'dakshina kannada', 'coorg', 'kodagu', 'udupi'],
    primaryNumbers: [
      { label: 'Karnataka State Disaster Helpline', numbers: ['080-1070', '080-22340676'], priority: 'PRIMARY' },
      { label: 'District Emergency Response Center', numbers: ['1077'], isTollFree: true, priority: 'PRIMARY' },
    ],
    localHotlines: [
      { label: 'BBMP Bengaluru Flood Help Desk', numbers: ['1533', '080-22660000'], isTollFree: true, priority: 'SPECIALIZED' },
    ],
  },
  {
    state: 'Gujarat',
    aliases: ['gujarat', 'ahmedabad', 'surat', 'vadodara', 'rajkot', 'narmada', 'tapi'],
    primaryNumbers: [
      { label: 'Gujarat State Disaster Management (GSDMA)', numbers: ['1078', '079-23276944'], isTollFree: true, priority: 'PRIMARY' },
      { label: 'District Disaster Emergency Cell', numbers: ['1077'], isTollFree: true, priority: 'PRIMARY' },
    ],
  },
  {
    state: 'Meghalaya',
    aliases: ['meghalaya', 'cherrapunji', 'sohra', 'shillong', 'mawsynram', 'east khasi'],
    primaryNumbers: [
      { label: 'Meghalaya State Disaster Control', numbers: ['1070', '0364-2224041'], priority: 'PRIMARY' },
      { label: 'District Disaster Operations Desk', numbers: ['1077'], isTollFree: true, priority: 'PRIMARY' },
    ],
  },
  {
    state: 'Jammu & Kashmir',
    aliases: ['jammu', 'kashmir', 'srinagar', 'jhelum', 'anantnag', 'baramulla', 'ladakh'],
    primaryNumbers: [
      { label: 'J&K Disaster Management Authority (JKDMA)', numbers: ['1070', '0194-2477033', '0191-2560601'], priority: 'PRIMARY' },
      { label: 'District Emergency Operations Center', numbers: ['1077'], isTollFree: true, priority: 'PRIMARY' },
    ],
  },
  {
    state: 'West Bengal',
    aliases: ['west bengal', 'bengal', 'kolkata', 'howrah', 'darjeeling', 'jalpaiguri', 'siliguri', 'hooghly'],
    primaryNumbers: [
      { label: 'WB State Emergency Operations Center', numbers: ['1070', '033-22143526'], isTollFree: true, priority: 'PRIMARY' },
      { label: 'District Disaster Control Room', numbers: ['1077'], isTollFree: true, priority: 'PRIMARY' },
    ],
  },
  {
    state: 'Odisha',
    aliases: ['odisha', 'orissa', 'bhubaneswar', 'cuttack', 'puri', 'mahanadi'],
    primaryNumbers: [
      { label: 'Odisha Disaster Management (OSDMA)', numbers: ['1070', '0674-2534177'], priority: 'PRIMARY' },
      { label: 'District Emergency Control Room', numbers: ['1077'], isTollFree: true, priority: 'PRIMARY' },
    ],
  },
  {
    state: 'Uttar Pradesh',
    aliases: ['uttar pradesh', 'up', 'lucknow', 'varanasi', 'prayagraj', 'gorakhpur', 'kanpur', 'ayodhya'],
    primaryNumbers: [
      { label: 'UP Relief Commissioner Disaster Control', numbers: ['1070', '0522-2237515'], priority: 'PRIMARY' },
      { label: 'District Emergency Operations Center', numbers: ['1077'], isTollFree: true, priority: 'PRIMARY' },
    ],
  },
];

/**
 * Intelligent location-aware resolver that extracts the relevant state & district disaster helplines
 * based on search queries, place names, or geographic regions.
 */
export function getEmergencyHelplinesForLocation(locationName?: string, lat?: number, lon?: number): {
  matchedState: string;
  isSpecificState: boolean;
  contacts: HelplineContact[];
  nationalContacts: HelplineContact[];
} {
  const norm = (locationName || '').toLowerCase();

  // Match against state directories
  for (const dir of STATE_EMERGENCY_DIRECTORIES) {
    if (dir.aliases.some((alias) => norm.includes(alias))) {
      const allStateContacts = [
        ...dir.primaryNumbers,
        ...(dir.localHotlines || []),
      ];
      return {
        matchedState: dir.state,
        isSpecificState: true,
        contacts: allStateContacts,
        nationalContacts: NATIONAL_UNIVERSAL_HELPLINES.slice(0, 3),
      };
    }
  }

  // Coordinate-based approximate regional fallback
  if (lat && lon) {
    if (lat >= 30 && lat <= 33.5 && lon >= 75.5 && lon <= 79) {
      const hp = STATE_EMERGENCY_DIRECTORIES.find((d) => d.state === 'Himachal Pradesh')!;
      return {
        matchedState: hp.state,
        isSpecificState: true,
        contacts: [...hp.primaryNumbers, ...(hp.localHotlines || [])],
        nationalContacts: NATIONAL_UNIVERSAL_HELPLINES.slice(0, 3),
      };
    } else if (lat >= 28.5 && lat <= 31.5 && lon >= 77.5 && lon <= 81) {
      const uk = STATE_EMERGENCY_DIRECTORIES.find((d) => d.state === 'Uttarakhand')!;
      return {
        matchedState: uk.state,
        isSpecificState: true,
        contacts: [...uk.primaryNumbers, ...(uk.localHotlines || [])],
        nationalContacts: NATIONAL_UNIVERSAL_HELPLINES.slice(0, 3),
      };
    } else if (lat >= 8.2 && lat <= 12.8 && lon >= 74.8 && lon <= 77.5) {
      const kl = STATE_EMERGENCY_DIRECTORIES.find((d) => d.state === 'Kerala')!;
      return {
        matchedState: kl.state,
        isSpecificState: true,
        contacts: [...kl.primaryNumbers, ...(kl.localHotlines || [])],
        nationalContacts: NATIONAL_UNIVERSAL_HELPLINES.slice(0, 3),
      };
    } else if (lat >= 15.5 && lat <= 22.0 && lon >= 72.5 && lon <= 80.5) {
      const mh = STATE_EMERGENCY_DIRECTORIES.find((d) => d.state === 'Maharashtra')!;
      return {
        matchedState: mh.state,
        isSpecificState: true,
        contacts: [...mh.primaryNumbers, ...(mh.localHotlines || [])],
        nationalContacts: NATIONAL_UNIVERSAL_HELPLINES.slice(0, 3),
      };
    } else if (lat >= 24.0 && lat <= 28.5 && lon >= 89.5 && lon <= 96.0) {
      const as = STATE_EMERGENCY_DIRECTORIES.find((d) => d.state === 'Assam')!;
      return {
        matchedState: as.state,
        isSpecificState: true,
        contacts: [...as.primaryNumbers, ...(as.localHotlines || [])],
        nationalContacts: NATIONAL_UNIVERSAL_HELPLINES.slice(0, 3),
      };
    }
  }

  // Default Pan-India Universal Fallback
  return {
    matchedState: 'National & Pan-India',
    isSpecificState: false,
    contacts: NATIONAL_UNIVERSAL_HELPLINES,
    nationalContacts: NATIONAL_UNIVERSAL_HELPLINES,
  };
}
