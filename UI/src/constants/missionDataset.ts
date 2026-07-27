// HAL Mission Control - Mission Dataset: 20 mission states covering a full LCA Tejas MK1A combat sortie
// Each row represents one mission state; the playback engine interpolates between rows.

export interface MissionState {
  timeSec: number;               // Mission time in seconds from T+0
  phase: string;                 // Human-readable mission phase name
  phaseCode: string;             // Internal phase identifier
  // Flight Envelope
  mach: number;
  altitudeFt: number;
  tasKts: number;
  throttlePct: number;
  gLoad: number;
  aoaDeg: number;
  fuelFlowKgH: number;
  isentropicEffPct: number;
  fuelKg: number;
  // Engine Telemetry
  n1Rpm: number;
  n2Rpm: number;
  egtKelvin: number;
  t3Kelvin: number;
  t4Kelvin: number;
  p2Bar: number;
  p3Bar: number;
  vibrationG: number;
  oilPressurePsi: number;
  fuelFlowSensor: number;
  // Systems
  oilTempCelsius: number;
  hydraulicPsi: number;
  // Aircraft health
  engineHealth: number;
  // Derived
  pressureRatio: number;
  thrustKN: number;
  sfcKgDaNH: number;
  // Anomaly flag
  anomaly: null | 'COMPRESSOR_SURGE' | 'EGT_OVERTEMP' | 'VIBRATION_HIGH' | 'OIL_LOW' | 'FUEL_LEAK' | 'BIRD_STRIKE';
  anomalySubsystem?: string;
}

export const MISSION_DATASET: MissionState[] = [
  // Row 0 — T+0:00 — Pre-flight / Taxi
  {
    timeSec: 0, phase: 'PRE-FLIGHT CHECK', phaseCode: 'PREFLIGHT',
    mach: 0, altitudeFt: 890, tasKts: 0, throttlePct: 18, gLoad: 1.0, aoaDeg: 0, fuelFlowKgH: 420, isentropicEffPct: 68.0, fuelKg: 2480,
    n1Rpm: 4200, n2Rpm: 7200, egtKelvin: 680, t3Kelvin: 450, t4Kelvin: 695, p2Bar: 0.6, p3Bar: 4.1, vibrationG: 0.18, oilPressurePsi: 65.0, fuelFlowSensor: 420,
    oilTempCelsius: 55, hydraulicPsi: 3000, engineHealth: 94, pressureRatio: 6.8, thrustKN: 14.2, sfcKgDaNH: 0.82, anomaly: null,
  },
  // Row 1 — T+2:30 — Takeoff Roll
  {
    timeSec: 150, phase: 'TAKEOFF ROLL', phaseCode: 'TAKEOFF',
    mach: 0.18, altitudeFt: 900, tasKts: 120, throttlePct: 98, gLoad: 1.0, aoaDeg: 1.2, fuelFlowKgH: 5800, isentropicEffPct: 87.5, fuelKg: 2440,
    n1Rpm: 10800, n2Rpm: 19100, egtKelvin: 1220, t3Kelvin: 820, t4Kelvin: 1580, p2Bar: 2.9, p3Bar: 25.8, vibrationG: 1.02, oilPressurePsi: 70.2, fuelFlowSensor: 5800,
    oilTempCelsius: 68, hydraulicPsi: 3050, engineHealth: 94, pressureRatio: 24.1, thrustKN: 80.5, sfcKgDaNH: 0.78, anomaly: null,
  },
  // Row 2 — T+4:00 — Climb (initial)
  {
    timeSec: 240, phase: 'INITIAL CLIMB', phaseCode: 'CLIMB',
    mach: 0.55, altitudeFt: 8000, tasKts: 340, throttlePct: 88, gLoad: 1.15, aoaDeg: 6.2, fuelFlowKgH: 3800, isentropicEffPct: 90.2, fuelKg: 2360,
    n1Rpm: 10200, n2Rpm: 17800, egtKelvin: 1180, t3Kelvin: 792, t4Kelvin: 1520, p2Bar: 2.4, p3Bar: 23.4, vibrationG: 0.88, oilPressurePsi: 70.0, fuelFlowSensor: 3800,
    oilTempCelsius: 72, hydraulicPsi: 3050, engineHealth: 94, pressureRatio: 23.8, thrustKN: 68.2, sfcKgDaNH: 0.79, anomaly: null,
  },
  // Row 3 — T+8:00 — Climb (mid altitude)
  {
    timeSec: 480, phase: 'MID-ALTITUDE CLIMB', phaseCode: 'CLIMB',
    mach: 0.72, altitudeFt: 18000, tasKts: 430, throttlePct: 85, gLoad: 1.10, aoaDeg: 4.8, fuelFlowKgH: 3200, isentropicEffPct: 91.5, fuelKg: 2240,
    n1Rpm: 10050, n2Rpm: 17400, egtKelvin: 1160, t3Kelvin: 785, t4Kelvin: 1498, p2Bar: 2.25, p3Bar: 22.1, vibrationG: 0.82, oilPressurePsi: 69.5, fuelFlowSensor: 3200,
    oilTempCelsius: 74, hydraulicPsi: 3050, engineHealth: 93, pressureRatio: 23.4, thrustKN: 62.1, sfcKgDaNH: 0.78, anomaly: null,
  },
  // Row 4 — T+14:00 — High altitude cruise
  {
    timeSec: 840, phase: 'HIGH ALTITUDE CRUISE', phaseCode: 'CRUISE',
    mach: 0.88, altitudeFt: 28450, tasKts: 512, throttlePct: 74, gLoad: 1.42, aoaDeg: 4.8, fuelFlowKgH: 2450, isentropicEffPct: 92.4, fuelKg: 2050,
    n1Rpm: 9800, n2Rpm: 17200, egtKelvin: 1148, t3Kelvin: 768, t4Kelvin: 1450, p2Bar: 2.12, p3Bar: 21.2, vibrationG: 0.72, oilPressurePsi: 68.5, fuelFlowSensor: 2450,
    oilTempCelsius: 76, hydraulicPsi: 3050, engineHealth: 92, pressureRatio: 24.5, thrustKN: 54.0, sfcKgDaNH: 0.78, anomaly: null,
  },
  // Row 5 — T+30:00 — Combat patrol (nominal)
  {
    timeSec: 1800, phase: 'COMBAT PATROL (MACH 0.88)', phaseCode: 'PATROL',
    mach: 0.88, altitudeFt: 28450, tasKts: 512, throttlePct: 74, gLoad: 1.42, aoaDeg: 4.8, fuelFlowKgH: 2450, isentropicEffPct: 92.4, fuelKg: 1900,
    n1Rpm: 9820, n2Rpm: 17240, egtKelvin: 1148, t3Kelvin: 766, t4Kelvin: 1449, p2Bar: 2.10, p3Bar: 21.0, vibrationG: 0.74, oilPressurePsi: 68.2, fuelFlowSensor: 2452,
    oilTempCelsius: 77, hydraulicPsi: 3050, engineHealth: 92, pressureRatio: 24.5, thrustKN: 53.8, sfcKgDaNH: 0.78, anomaly: null,
  },
  // Row 6 — T+45:00 — Combat patrol (fuel reducing)
  {
    timeSec: 2700, phase: 'COMBAT PATROL — MID', phaseCode: 'PATROL',
    mach: 0.88, altitudeFt: 28500, tasKts: 510, throttlePct: 73.5, gLoad: 1.38, aoaDeg: 4.6, fuelFlowKgH: 2440, isentropicEffPct: 92.2, fuelKg: 1700,
    n1Rpm: 9805, n2Rpm: 17210, egtKelvin: 1147, t3Kelvin: 763, t4Kelvin: 1446, p2Bar: 2.10, p3Bar: 20.9, vibrationG: 0.76, oilPressurePsi: 67.8, fuelFlowSensor: 2440,
    oilTempCelsius: 77, hydraulicPsi: 3050, engineHealth: 91, pressureRatio: 24.4, thrustKN: 53.5, sfcKgDaNH: 0.78, anomaly: null,
  },
  // Row 7 — T+60:00 — QRA intercept order — supersonic dash begins
  {
    timeSec: 3600, phase: 'SUPERSONIC DASH INITIATED', phaseCode: 'SUPERSONIC',
    mach: 1.12, altitudeFt: 32000, tasKts: 660, throttlePct: 96, gLoad: 1.55, aoaDeg: 3.5, fuelFlowKgH: 5200, isentropicEffPct: 89.5, fuelKg: 1500,
    n1Rpm: 10950, n2Rpm: 19000, egtKelvin: 1310, t3Kelvin: 855, t4Kelvin: 1620, p2Bar: 2.82, p3Bar: 27.2, vibrationG: 1.15, oilPressurePsi: 71.0, fuelFlowSensor: 5200,
    oilTempCelsius: 82, hydraulicPsi: 3050, engineHealth: 91, pressureRatio: 26.0, thrustKN: 75.0, sfcKgDaNH: 0.80, anomaly: null,
  },
  // Row 8 — T+62:00 — Full supersonic dash Mach 1.45
  {
    timeSec: 3720, phase: 'SUPERSONIC DASH (MACH 1.45)', phaseCode: 'SUPERSONIC',
    mach: 1.45, altitudeFt: 36000, tasKts: 840, throttlePct: 100, gLoad: 1.80, aoaDeg: 2.8, fuelFlowKgH: 6800, isentropicEffPct: 88.0, fuelKg: 1340,
    n1Rpm: 11200, n2Rpm: 19400, egtKelvin: 1360, t3Kelvin: 888, t4Kelvin: 1680, p2Bar: 3.10, p3Bar: 29.8, vibrationG: 1.28, oilPressurePsi: 72.5, fuelFlowSensor: 6800,
    oilTempCelsius: 86, hydraulicPsi: 3050, engineHealth: 90, pressureRatio: 27.2, thrustKN: 84.0, sfcKgDaNH: 0.81, anomaly: null,
  },
  // Row 9 — T+64:00 — High-G combat maneuver
  {
    timeSec: 3840, phase: 'HIGH-G COMBAT MANEUVER (+6.5G)', phaseCode: 'COMBAT',
    mach: 0.95, altitudeFt: 22000, tasKts: 560, throttlePct: 92, gLoad: 6.5, aoaDeg: 18.4, fuelFlowKgH: 4100, isentropicEffPct: 86.0, fuelKg: 1180,
    n1Rpm: 10600, n2Rpm: 18500, egtKelvin: 1280, t3Kelvin: 838, t4Kelvin: 1595, p2Bar: 2.7, p3Bar: 26.5, vibrationG: 1.55, oilPressurePsi: 70.0, fuelFlowSensor: 4100,
    oilTempCelsius: 84, hydraulicPsi: 3020, engineHealth: 90, pressureRatio: 25.4, thrustKN: 72.0, sfcKgDaNH: 0.79, anomaly: null,
  },
  // Row 10 — T+66:00 — Compressor surge precursor (first warning)
  {
    timeSec: 3960, phase: 'COMPRESSOR SURGE PRECURSOR', phaseCode: 'ANOMALY_ONSET',
    mach: 0.90, altitudeFt: 24000, tasKts: 535, throttlePct: 88, gLoad: 3.2, aoaDeg: 12.0, fuelFlowKgH: 3600, isentropicEffPct: 82.5, fuelKg: 1060,
    n1Rpm: 10400, n2Rpm: 18100, egtKelvin: 1240, t3Kelvin: 820, t4Kelvin: 1560, p2Bar: 2.55, p3Bar: 25.8, vibrationG: 1.72, oilPressurePsi: 68.5, fuelFlowSensor: 3600,
    oilTempCelsius: 83, hydraulicPsi: 3010, engineHealth: 88, pressureRatio: 25.0, thrustKN: 66.0, sfcKgDaNH: 0.80, anomaly: 'COMPRESSOR_SURGE', anomalySubsystem: 'hpc',
  },
  // Row 11 — T+68:00 — EGT overtemperature (combustor)
  {
    timeSec: 4080, phase: 'EGT OVER-TEMPERATURE WARNING', phaseCode: 'ANOMALY',
    mach: 0.88, altitudeFt: 25000, tasKts: 515, throttlePct: 84, gLoad: 2.1, aoaDeg: 8.5, fuelFlowKgH: 3400, isentropicEffPct: 79.0, fuelKg: 960,
    n1Rpm: 10250, n2Rpm: 17900, egtKelvin: 1390, t3Kelvin: 895, t4Kelvin: 1750, p2Bar: 2.45, p3Bar: 24.9, vibrationG: 1.85, oilPressurePsi: 66.0, fuelFlowSensor: 3400,
    oilTempCelsius: 85, hydraulicPsi: 3000, engineHealth: 84, pressureRatio: 24.2, thrustKN: 60.0, sfcKgDaNH: 0.82, anomaly: 'EGT_OVERTEMP', anomalySubsystem: 'combustor',
  },
  // Row 12 — T+70:00 — AI detects & alerts (peak anomaly)
  {
    timeSec: 4200, phase: 'CRITICAL: AI ANOMALY DETECTED', phaseCode: 'CRITICAL',
    mach: 0.82, altitudeFt: 26000, tasKts: 488, throttlePct: 78, gLoad: 1.8, aoaDeg: 6.5, fuelFlowKgH: 3200, isentropicEffPct: 76.0, fuelKg: 880,
    n1Rpm: 9980, n2Rpm: 17400, egtKelvin: 1445, t3Kelvin: 910, t4Kelvin: 1820, p2Bar: 2.32, p3Bar: 24.1, vibrationG: 2.12, oilPressurePsi: 63.5, fuelFlowSensor: 3200,
    oilTempCelsius: 88, hydraulicPsi: 2990, engineHealth: 78, pressureRatio: 23.8, thrustKN: 55.0, sfcKgDaNH: 0.84, anomaly: 'EGT_OVERTEMP', anomalySubsystem: 'combustor',
  },
  // Row 13 — T+72:00 — Mission abort ordered, throttle reduction
  {
    timeSec: 4320, phase: 'ABORT: THROTTLE REDUCTION', phaseCode: 'ABORT',
    mach: 0.72, altitudeFt: 26500, tasKts: 430, throttlePct: 62, gLoad: 1.3, aoaDeg: 4.2, fuelFlowKgH: 2100, isentropicEffPct: 85.0, fuelKg: 830,
    n1Rpm: 9400, n2Rpm: 16200, egtKelvin: 1280, t3Kelvin: 842, t4Kelvin: 1590, p2Bar: 2.0, p3Bar: 21.8, vibrationG: 1.65, oilPressurePsi: 66.5, fuelFlowSensor: 2100,
    oilTempCelsius: 82, hydraulicPsi: 3010, engineHealth: 81, pressureRatio: 22.5, thrustKN: 44.0, sfcKgDaNH: 0.81, anomaly: 'EGT_OVERTEMP', anomalySubsystem: 'combustor',
  },
  // Row 14 — T+75:00 — RTB descent initiated
  {
    timeSec: 4500, phase: 'RETURN TO BASE — DESCENT', phaseCode: 'RTB',
    mach: 0.65, altitudeFt: 22000, tasKts: 385, throttlePct: 55, gLoad: 1.1, aoaDeg: 3.5, fuelFlowKgH: 1800, isentropicEffPct: 87.5, fuelKg: 790,
    n1Rpm: 8850, n2Rpm: 15400, egtKelvin: 1195, t3Kelvin: 800, t4Kelvin: 1495, p2Bar: 1.82, p3Bar: 19.5, vibrationG: 1.42, oilPressurePsi: 67.5, fuelFlowSensor: 1800,
    oilTempCelsius: 79, hydraulicPsi: 3020, engineHealth: 83, pressureRatio: 21.2, thrustKN: 38.0, sfcKgDaNH: 0.80, anomaly: null,
  },
  // Row 15 — T+80:00 — Descending through 10,000 Ft
  {
    timeSec: 4800, phase: 'DESCENT THROUGH 10,000 FT', phaseCode: 'RTB',
    mach: 0.42, altitudeFt: 10000, tasKts: 250, throttlePct: 42, gLoad: 1.05, aoaDeg: 4.8, fuelFlowKgH: 1200, isentropicEffPct: 88.0, fuelKg: 750,
    n1Rpm: 7900, n2Rpm: 13600, egtKelvin: 1085, t3Kelvin: 730, t4Kelvin: 1320, p2Bar: 1.4, p3Bar: 16.2, vibrationG: 1.22, oilPressurePsi: 68.0, fuelFlowSensor: 1200,
    oilTempCelsius: 74, hydraulicPsi: 3030, engineHealth: 84, pressureRatio: 20.1, thrustKN: 28.0, sfcKgDaNH: 0.79, anomaly: null,
  },
  // Row 16 — T+85:00 — Approach pattern
  {
    timeSec: 5100, phase: 'APPROACH PATTERN — 2000 FT', phaseCode: 'APPROACH',
    mach: 0.28, altitudeFt: 2000, tasKts: 165, throttlePct: 32, gLoad: 1.02, aoaDeg: 8.5, fuelFlowKgH: 950, isentropicEffPct: 90.0, fuelKg: 710,
    n1Rpm: 6800, n2Rpm: 11800, egtKelvin: 985, t3Kelvin: 680, t4Kelvin: 1205, p2Bar: 1.1, p3Bar: 13.2, vibrationG: 0.92, oilPressurePsi: 67.5, fuelFlowSensor: 950,
    oilTempCelsius: 70, hydraulicPsi: 3040, engineHealth: 85, pressureRatio: 18.8, thrustKN: 18.5, sfcKgDaNH: 0.79, anomaly: null,
  },
  // Row 17 — T+88:00 — Final approach
  {
    timeSec: 5280, phase: 'FINAL APPROACH — GEAR DOWN', phaseCode: 'LANDING',
    mach: 0.22, altitudeFt: 600, tasKts: 130, throttlePct: 28, gLoad: 1.01, aoaDeg: 10.5, fuelFlowKgH: 820, isentropicEffPct: 90.5, fuelKg: 685,
    n1Rpm: 6200, n2Rpm: 10800, egtKelvin: 945, t3Kelvin: 655, t4Kelvin: 1158, p2Bar: 0.98, p3Bar: 12.0, vibrationG: 0.82, oilPressurePsi: 67.0, fuelFlowSensor: 820,
    oilTempCelsius: 68, hydraulicPsi: 3045, engineHealth: 85, pressureRatio: 17.4, thrustKN: 15.0, sfcKgDaNH: 0.79, anomaly: null,
  },
  // Row 18 — T+90:00 — Touchdown & rollout
  {
    timeSec: 5400, phase: 'TOUCHDOWN — ROLLOUT', phaseCode: 'LANDED',
    mach: 0.08, altitudeFt: 900, tasKts: 52, throttlePct: 15, gLoad: 1.0, aoaDeg: 0, fuelFlowKgH: 380, isentropicEffPct: 65.0, fuelKg: 658,
    n1Rpm: 3800, n2Rpm: 6500, egtKelvin: 765, t3Kelvin: 520, t4Kelvin: 892, p2Bar: 0.52, p3Bar: 5.8, vibrationG: 0.28, oilPressurePsi: 64.5, fuelFlowSensor: 380,
    oilTempCelsius: 62, hydraulicPsi: 3050, engineHealth: 85, pressureRatio: 8.2, thrustKN: 5.5, sfcKgDaNH: 0.82, anomaly: null,
  },
  // Row 19 — T+92:00 — Engine shutdown & post-flight
  {
    timeSec: 5520, phase: 'POST-FLIGHT SHUTDOWN', phaseCode: 'SHUTDOWN',
    mach: 0, altitudeFt: 900, tasKts: 0, throttlePct: 0, gLoad: 1.0, aoaDeg: 0, fuelFlowKgH: 0, isentropicEffPct: 0, fuelKg: 645,
    n1Rpm: 0, n2Rpm: 0, egtKelvin: 500, t3Kelvin: 380, t4Kelvin: 530, p2Bar: 0.18, p3Bar: 1.1, vibrationG: 0.0, oilPressurePsi: 42.0, fuelFlowSensor: 0,
    oilTempCelsius: 55, hydraulicPsi: 2800, engineHealth: 85, pressureRatio: 1.0, thrustKN: 0, sfcKgDaNH: 0, anomaly: null,
  },
];

export const MISSION_TOTAL_DURATION_SEC = MISSION_DATASET[MISSION_DATASET.length - 1].timeSec;
