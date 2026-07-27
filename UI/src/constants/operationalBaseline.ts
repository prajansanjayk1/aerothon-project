// HAL Mission Control - Authentic Indian Air Force Fighter Squadron Operational Baseline Dataset
import { FleetMember, SubsystemStage, TelemetrySensor, Alert, MaintenanceTask, TimelineEvent, AIInference } from '@/types';

export const FLEET_OPERATIONS_LIST: FleetMember[] = [
  { id: '1', tail: 'TJ-201', squadron: 'No. 45 Sqn (Flying Daggers)', base: 'Jodhpur (Fwd Base)', status: 'Combat Patrol', health: 96, engineHealth: 98, airframeHealth: 94, fuelPct: 82, fuelKg: 2050, sortieHours: 412, tboRulHrs: 688, missionType: 'CAP Patrol', pilot: 'Wgd Cdr S. Rao', crew: 'HAL-Prop-Lead-1', location: 'Sector 4 (Airborne)', warning: null },
  { id: '2', tail: 'TJ-202', squadron: 'No. 45 Sqn (Flying Daggers)', base: 'Jodhpur (Fwd Base)', status: 'Standby / QRA', health: 91, engineHealth: 92, airframeHealth: 90, fuelPct: 100, fuelKg: 2500, sortieHours: 520, tboRulHrs: 580, missionType: 'QRA Intercept', pilot: 'Sqn Ldr K. Sharma', crew: 'HAL-Prop-Lead-1', location: 'Shelter Bay 2 (Armed)', warning: null },
  { id: '3', tail: 'TJ-203', squadron: 'No. 45 Sqn (Flying Daggers)', base: 'Jodhpur (Fwd Base)', status: 'Standby / QRA', health: 74, engineHealth: 71, airframeHealth: 77, fuelPct: 95, fuelKg: 2375, sortieHours: 890, tboRulHrs: 210, missionType: 'QRA Intercept', pilot: 'Flt Lt A. Verma', crew: 'HAL-Avionics-3', location: 'Shelter Bay 3 (Armed)', warning: 'T3 Thermocouple Drift (+14°C Δ)' },
  { id: '4', tail: 'TJ-204', squadron: 'No. 45 Sqn (Flying Daggers)', base: 'Jodhpur (Fwd Base)', status: 'Grounded / Maint', health: 58, engineHealth: 54, airframeHealth: 62, fuelPct: 15, fuelKg: 375, sortieHours: 980, tboRulHrs: 120, missionType: 'Unassigned', pilot: 'N/A', crew: 'HAL-Overhaul-Team', location: 'Hangar Bay 1 (Maint)', warning: 'HPT Blade Thermal Creep Alert' },
  { id: '5', tail: 'TJ-114', squadron: 'No. 18 Sqn (Flying Bullets)', base: 'Sulur (Southern Cmd)', status: 'Combat Patrol', health: 94, engineHealth: 95, airframeHealth: 93, fuelPct: 64, fuelKg: 1600, sortieHours: 310, tboRulHrs: 790, missionType: 'CAP Patrol', pilot: 'Sqn Ldr R. Patel', crew: 'HAL-Prop-Lead-2', location: 'Sector 2 (Airborne)', warning: null },
  { id: '6', tail: 'TJ-115', squadron: 'No. 18 Sqn (Flying Bullets)', base: 'Sulur (Southern Cmd)', status: 'Standby / QRA', health: 88, engineHealth: 89, airframeHealth: 87, fuelPct: 100, fuelKg: 2500, sortieHours: 610, tboRulHrs: 490, missionType: 'QRA Intercept', pilot: 'Wgd Cdr M. Singh', crew: 'HAL-Prop-Lead-2', location: 'Shelter Bay 1 (Armed)', warning: null },
  { id: '7', tail: 'TJ-116', squadron: 'No. 18 Sqn (Flying Bullets)', base: 'Sulur (Southern Cmd)', status: 'Combat Patrol', health: 82, engineHealth: 80, airframeHealth: 84, fuelPct: 45, fuelKg: 1125, sortieHours: 740, tboRulHrs: 360, missionType: 'Escort', pilot: 'Flt Lt D. Kapoor', crew: 'HAL-Avionics-2', location: 'Sector 2 (Airborne)', warning: 'Oil Pressure Transducer Fluctuation' },
  { id: '8', tail: 'TJ-117', squadron: 'No. 18 Sqn (Flying Bullets)', base: 'Sulur (Southern Cmd)', status: 'Standby / QRA', health: 95, engineHealth: 96, airframeHealth: 94, fuelPct: 100, fuelKg: 2500, sortieHours: 250, tboRulHrs: 850, missionType: 'QRA Intercept', pilot: 'Sqn Ldr V. Nair', crew: 'HAL-Prop-Lead-2', location: 'Shelter Bay 4 (Armed)', warning: null },
  { id: '9', tail: 'TJ-118', squadron: 'No. 18 Sqn (Flying Bullets)', base: 'Sulur (Southern Cmd)', status: 'Grounded / Maint', health: 62, engineHealth: 60, airframeHealth: 64, fuelPct: 20, fuelKg: 500, sortieHours: 920, tboRulHrs: 180, missionType: 'Unassigned', pilot: 'N/A', crew: 'HAL-Avionics-Team', location: 'Hangar Bay 2 (Maint)', warning: 'ARINC-429 Bus B Calibration Req' },
  { id: '10', tail: 'PV-01', squadron: 'HAL Flight Test Center', base: 'Ambala (Test Flight Base)', status: 'Supersonic Test', health: 98, engineHealth: 99, airframeHealth: 97, fuelPct: 88, fuelKg: 2200, sortieHours: 110, tboRulHrs: 990, missionType: 'Envelope Open', pilot: 'Gp Capt P. Kumar (Test)', crew: 'HAL-FTC-Lead', location: 'Test Corridor A', warning: null },
  { id: '11', tail: 'PV-02', squadron: 'HAL Flight Test Center', base: 'Ambala (Test Flight Base)', status: 'Standby / QRA', health: 89, engineHealth: 91, airframeHealth: 87, fuelPct: 100, fuelKg: 2500, sortieHours: 450, tboRulHrs: 650, missionType: 'SATCOM Calib', pilot: 'Wgd Cdr B. Joshi', crew: 'HAL-FTC-Lead', location: 'Test Shelter 1', warning: null },
  { id: '12', tail: 'PV-03', squadron: 'HAL Flight Test Center', base: 'Ambala (Test Flight Base)', status: 'Grounded / Maint', health: 45, engineHealth: 41, airframeHealth: 49, fuelPct: 10, fuelKg: 250, sortieHours: 1050, tboRulHrs: 50, missionType: 'Unassigned', pilot: 'N/A', crew: 'GE-F404-Specialist', location: 'Overhaul Facility Bay 3', warning: 'Critical N2 Spool RMS Vibration' },
];

export const OPERATIONAL_SUBSYSTEM_STAGES: SubsystemStage[] = [
  { ref: 'fan', name: '#1 Fan Spool (3-Stage Titanium)', health: 98, temp: 115, pressure: 2.4, vibration: 0.8, status: 'NOMINAL' },
  { ref: 'lpc', name: '#2 LPC (Low Press Compressor)', health: 95, temp: 240, pressure: 6.8, vibration: 1.1, status: 'NOMINAL' },
  { ref: 'hpc', name: '#3 HPC (7-Stage High Press)', health: 88, temp: 520, pressure: 24.5, vibration: 1.6, status: 'WARNING' },
  { ref: 'combustor', name: '#4 Combustor (Annular Chamber)', health: 86, temp: 1450, pressure: 23.8, vibration: 1.9, status: 'WARNING' },
  { ref: 'hpt', name: '#5 HPT (Single Stage Air-Cooled)', health: 91, temp: 1180, pressure: 14.2, vibration: 1.4, status: 'NOMINAL' },
  { ref: 'lpt', name: '#6 LPT (Uncooled 2-Stage)', health: 94, temp: 750, pressure: 5.1, vibration: 1.0, status: 'NOMINAL' },
  { ref: 'afterburner', name: '#7 Afterburner (Reheat Duct)', health: 97, temp: 1650, pressure: 4.8, vibration: 1.3, status: 'NOMINAL' },
  { ref: 'nozzle', name: '#8 Con-Di Nozzle (Variable Area)', health: 96, temp: 680, pressure: 1.8, vibration: 0.9, status: 'NOMINAL' },
];

export const OPERATIONAL_TELEMETRY: TelemetrySensor = {
  n1Rpm: 10450,
  n2Rpm: 18230,
  egtKelvin: 1145.2,
  oilPressurePsi: 68.4,
  vibrationG: 1.42,
  fuelFlowKgH: 2450.0,
  t3Kelvin: 793.15,
  t4Kelvin: 1723.15,
  p2Bar: 2.4,
  p3Bar: 24.5,
};

export const OPERATIONAL_ALERTS: Alert[] = [
  {
    id: 'ALT-881',
    engineId: 'TJ04-SER-88219',
    severity: 'CRITICAL',
    category: 'PROPULSION',
    subsystemRef: 'combustor',
    title: 'Combustor Thermal Creep & EGT Exceedance Warning',
    description: 'T4 thermocouple array indicating localized hot spot (+38°C above isentropic baseline). Potential fuel nozzle clogging on injector sector 4.',
    timestamp: '11:42:05 UTC',
    recommendedAction: 'Reduce Throttle Lever Angle (TLA) by 10%. Schedule borescope inspection upon RTB.',
    aiConfidencePct: 94.8,
    acknowledged: false,
  },
  {
    id: 'ALT-882',
    engineId: 'TJ04-SER-88219',
    severity: 'WARNING',
    category: 'THERMAL',
    subsystemRef: 'hpc',
    title: 'HPC Stage 7 Discharge Pressure Fluctuation',
    description: 'P3 transducer channel 2 exhibiting ±0.4 Bar oscillation. Air bleed valve modulation suspected.',
    timestamp: '11:38:12 UTC',
    recommendedAction: 'Monitor PRSOV telemetry. No immediate flight envelope restriction required.',
    aiConfidencePct: 88.2,
    acknowledged: true,
  },
  {
    id: 'ALT-883',
    engineId: 'TJ04-SER-88219',
    severity: 'WARNING',
    category: 'AVIONICS',
    subsystemRef: 'lpt',
    title: 'ARINC-429 Bus B Parity Degradation',
    description: 'Intermittent signal loss on vibration transducer channel N2-B. Redundant channel N2-A nominal.',
    timestamp: '11:15:00 UTC',
    recommendedAction: 'Verify ground continuity during next maintenance window.',
    aiConfidencePct: 91.0,
    acknowledged: true,
  },
];

export const OPERATIONAL_MAINTENANCE_TASKS: MaintenanceTask[] = [
  { id: 'WO-4091', engineSerial: 'GE-F404-IN20 #88219', aircraftTail: 'TJ-203', taskCode: 'BOR-200H', title: 'HPT Blade Borescope Inspection (Stage 1-2)', category: 'PROPULSION', priority: 'URGENT', rulCountdownHrs: 210, assignedCrew: 'HAL Propulsion Bay Crew #4 (Jodhpur)', location: 'Shelter Bay 3', status: 'IN_PROGRESS', estimatedHours: 6.5 },
  { id: 'WO-4092', engineSerial: 'GE-F404-IN20 #88104', aircraftTail: 'TJ-204', taskCode: 'OVH-1000H', title: 'Full Modular Overhaul & N2 Spool Balancing', category: 'PROPULSION', priority: 'AOG', rulCountdownHrs: 120, assignedCrew: 'HAL Overhaul Specialist Team #1', location: 'Hangar Bay 1', status: 'INSPECTION_REQ', estimatedHours: 72.0 },
  { id: 'WO-4093', engineSerial: 'GE-F404-IN20 #88118', aircraftTail: 'TJ-118', taskCode: 'CAL-ARINC', title: 'ARINC-429 Digital Bus Transducer Recalibration', category: 'AVIONICS', priority: 'ROUTINE', rulCountdownHrs: 180, assignedCrew: 'Avionics Flight Line Team #2', location: 'Hangar Bay 2', status: 'PENDING', estimatedHours: 3.0 },
  { id: 'WO-4094', engineSerial: 'GE-F404-IN20 #88003', aircraftTail: 'PV-03', taskCode: 'VIB-REP', title: 'N2 Spool Bearing Replacement & Dynamic Balancing', category: 'PROPULSION', priority: 'AOG', rulCountdownHrs: 50, assignedCrew: 'GE Aerospace Support Specialists', location: 'Overhaul Facility Bay 3', status: 'IN_PROGRESS', estimatedHours: 120.0 },
];

export const OPERATIONAL_TIMELINE_EVENTS: TimelineEvent[] = [
  { id: 'EV-1', timestamp: '10:15:00 UTC', timeSec: 0, category: 'PROPULSION', subsystemRef: 'fan', title: 'Sortie Ingress & Afterburner Scramble', description: 'GE F404-IN20 ignited to Max Reheat (100% TLA). N1 reached 10450 RPM.', severity: 'NOMINAL' },
  { id: 'EV-2', timestamp: '10:42:15 UTC', timeSec: 1635, category: 'FLIGHT_CONTROL', subsystemRef: 'hpc', title: 'Supersonic Envelope Transition (Mach 1.24)', description: 'LCA Tejas crossed Mach 1 at 32,000 ft. HPC pressure ratio nominal at 24.5.', severity: 'NOMINAL' },
  { id: 'EV-3', timestamp: '11:15:00 UTC', timeSec: 3600, category: 'AVIONICS', subsystemRef: 'lpt', title: 'ARINC-429 Bus B Intermittent Parity Warning', description: 'Vibration channel N2-B logged 3 dropped packets. Auto-switched to primary channel A.', severity: 'WARNING' },
  { id: 'EV-4', timestamp: '11:38:12 UTC', timeSec: 4992, category: 'THERMAL', subsystemRef: 'hpc', title: 'HPC Stage 7 Discharge Pressure Fluctuation', description: 'P3 sensor detected ±0.4 Bar variance during rapid G-loading maneuver (+6.2G).', severity: 'WARNING' },
  { id: 'EV-5', timestamp: '11:42:05 UTC', timeSec: 5225, category: 'PROPULSION', subsystemRef: 'combustor', title: 'Combustor Thermal Creep Alert Triggered', description: 'AeroNet-v4 AI diagnostic flagged T4 hot spot (+38°C Δ). Recommended 10% TLA reduction.', severity: 'CRITICAL' },
];

export const OPERATIONAL_AI_INFERENCE: AIInference = {
  engineId: 'TJ04-SER-88219',
  timestamp: '2026-07-26T11:45:00Z',
  healthIndex: 94.2,
  weibull: {
    shapeBeta: 2.84,
    scaleEta: 1250.0,
    meanRulHours: 688.4,
    confidenceLowerHrs: 642.0,
    confidenceUpperHrs: 734.0,
    modelType: 'AeroNet-v4',
  },
  primaryFailureMode: 'Annular Combustor Thermal Fatigue & Nozzle Erosion',
  failureConfidencePct: 94.8,
  shapleyFactors: [
    { parameter: 'T4 EGT Thermocouple Array', arincWord: 'Word 342 (Octal)', shapleyValuePct: 42.5, direction: 'DEGRADING', description: 'Primary contributor to RUL compression (+38°C above isentropic baseline)' },
    { parameter: 'N2 High-Pressure Spool Vibration', arincWord: 'Word 214 (Octal)', shapleyValuePct: 24.1, direction: 'DEGRADING', description: 'Harmonic 1X RPM spike indicating minor blade coating wear' },
    { parameter: 'Oil Pressure Transducer Delta', arincWord: 'Word 126 (Octal)', shapleyValuePct: 18.2, direction: 'STABILIZING', description: 'Nominal scavenge pump pressure maintaining bearing cooling' },
    { parameter: 'Fuel Flow Modulator Feedback', arincWord: 'Word 084 (Octal)', shapleyValuePct: 15.2, direction: 'DEGRADING', description: 'Minor hysteresis during rapid TLA advancement' },
  ],
};
