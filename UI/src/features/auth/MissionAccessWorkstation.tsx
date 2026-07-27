import React, { useState, useEffect } from 'react';
import { Clock, Lock, KeyRound, UserCheck, Eye, EyeOff, Terminal, ArrowRight, ShieldCheck, UserPlus, Sparkles, Camera, Radio, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/stores';
import { LcaTejasWireframe } from './components/LcaTejasWireframe';
import { LiveWebcamScanner } from './components/LiveWebcamScanner';
import { OperatorRegistrationModal } from './components/OperatorRegistrationModal';
import { ServiceLoader } from './components/ServiceLoader';

export type AuthStep = 'CREDENTIALS' | 'BIOMETRIC' | 'CLEARANCE' | 'BOOTSTRAP';

interface OperatorProfile {
  id: string;
  name: string;
  role: 'COMMANDER' | 'ENGINEER' | 'ANALYST' | 'ADMIN';
  callsign: string;
  squadron: string;
  clearanceLevel: string;
}

const PRESET_OPERATORS: OperatorProfile[] = [
  {
    id: 'USR-8821',
    name: 'Wgd Cdr S. Rao (Chief Propulsion Lead)',
    role: 'COMMANDER',
    callsign: 'DAGGER-LEAD',
    squadron: 'No. 45 Sqn (Flying Daggers)',
    clearanceLevel: 'LEVEL 5 // COMMANDER CLEARANCE',
  },
  {
    id: 'USR-4402',
    name: 'Sqn Ldr K. Sharma (AI Diagnostics Lead)',
    role: 'ENGINEER',
    callsign: 'VECTRA-02',
    squadron: 'No. 18 Sqn (Flying Bullets)',
    clearanceLevel: 'LEVEL 4 // SENIOR SYSTEMS ENGINEER',
  },
  {
    id: 'USR-9104',
    name: 'Flt Lt M. Varma (Flight Envelope Analyst)',
    role: 'ANALYST',
    callsign: 'TELEMETRY-09',
    squadron: 'HAL Overhaul & Maintenance Division',
    clearanceLevel: 'LEVEL 3 // TELEMETRY & PHYSICS ANALYST',
  },
];

const TELEMETRY_STREAM_MESSAGES = [
  'WORD 342 (OCTAL): 0x4B82 • T4 COMBUSTOR TEMP 1723 K • STATUS NOMINAL',
  'WORD 214 (OCTAL): 0x1A40 • N2 SPOOL 18230 RPM • PARITY CHECK OK',
  'WORD 108 (OCTAL): 0x7F12 • VIBRATION TRANSDUCER 1.42G • HARMONIC CLEAR',
  'WORD 405 (OCTAL): 0x8D01 • ARINC-429 LINK-17 ENCRYPTION HANDSHAKE VALID',
  'WORD 512 (OCTAL): 0x3E88 • FUEL FLOW INJECTOR 4210 KG/H • STABLE PRESSURE',
  'WORD 601 (OCTAL): 0x9B20 • WING STATION 2 ASTRA MK1 MISSILE BUS CLEARED',
];

export const MissionAccessWorkstation: React.FC = React.memo(() => {
  const { login } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<AuthStep>('CREDENTIALS');
  const [operatorsList, setOperatorsList] = useState<OperatorProfile[]>(PRESET_OPERATORS);
  const [selectedOpIndex, setSelectedOpIndex] = useState<number>(0);
  const [password, setPassword] = useState<string>('••••••••••••••••');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberWorkstation, setRememberWorkstation] = useState<boolean>(true);
  const [utcClock, setUtcClock] = useState<string>('');
  const [telemetryLog, setTelemetryLog] = useState<string[]>(TELEMETRY_STREAM_MESSAGES.slice(0, 3));
  
  // Real Biometric & Registration State
  const [authMode, setAuthMode] = useState<'REAL' | 'DEMO'>('REAL');
  const [isRegModalOpen, setIsRegModalOpen] = useState<boolean>(false);
  const [challengeId, setChallengeId] = useState<string>('DEMO_CHALLENGE_001');
  const [livenessAction, setLivenessAction] = useState<string>('BLINK');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isInitiating, setIsInitiating] = useState<boolean>(false);

  const activeOperator = operatorsList[selectedOpIndex] || PRESET_OPERATORS[0];

  // Fetch registered operators from backend API on mount
  useEffect(() => {
    fetch('http://localhost:8000/api/v1/auth/operators')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const formatted: OperatorProfile[] = data.map((op: any) => ({
            id: op.id,
            name: op.name,
            role: (op.role as any) || 'ENGINEER',
            callsign: op.callsign || 'HAL-OPS',
            squadron: op.squadron || 'IAF Propulsion Command',
            clearanceLevel: `LEVEL ${op.role === 'COMMANDER' ? 5 : 4} // ${op.role} CLEARANCE`
          }));
          setOperatorsList(formatted);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch operators from backend on port 8000. Using preset defaults.", err);
      });
  }, []);

  // Live UTC Clock & Telemetry Rotator
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setUtcClock(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateClock();
    const clockInterval = setInterval(updateClock, 1000);

    const telemInterval = setInterval(() => {
      setTelemetryLog((prev) => {
        const nextMsg = TELEMETRY_STREAM_MESSAGES[Math.floor(Math.random() * TELEMETRY_STREAM_MESSAGES.length)];
        return [nextMsg, ...prev.slice(0, 3)];
      });
    }, 2500);

    return () => {
      clearInterval(clockInterval);
      clearInterval(telemInterval);
    };
  }, []);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsInitiating(true);

    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/login/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operator_id: activeOperator.id,
          password: password === '••••••••••••••••' ? 'commander2026' : password,
          auth_mode: authMode
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.detail || "Authentication pre-validation failed.");
        setIsInitiating(false);
        return;
      }

      setChallengeId(data.challenge_id || `HAL_CHALLENGE_${Math.floor(Math.random()*10000)}`);
      setLivenessAction(data.liveness_action || 'BLINK');
      setIsInitiating(false);
      setCurrentStep('BIOMETRIC');
    } catch (err) {
      console.warn("Backend reachable check failed. Proceeding with demo challenge.", err);
      setIsInitiating(false);
      if (authMode === 'DEMO') {
        setChallengeId(`DEMO_CHALLENGE_${Math.floor(Math.random()*10000)}`);
        setLivenessAction('BLINK');
        setCurrentStep('BIOMETRIC');
      } else {
        setLoginError("Could not connect to military backend on port 8000. Ensure FastAPI server is running or switch to DEMO mode.");
      }
    }
  };

  const handleBiometricSuccess = () => {
    setCurrentStep('CLEARANCE');
  };

  const handleBootMissionControl = () => {
    setCurrentStep('BOOTSTRAP');
  };

  const handleBootstrapComplete = () => {
    login(activeOperator.name, activeOperator.role);
  };

  const stepIndexMap: Record<AuthStep, number> = {
    CREDENTIALS: 1,
    BIOMETRIC: 3,
    CLEARANCE: 5,
    BOOTSTRAP: 6,
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#F7F8FA] text-[#10233A] font-mono select-none relative">
      {/* Background Engineering Technical Grid */}
      <div 
        className="absolute inset-0 opacity-60 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #EEF2F7 1px, transparent 1px),
            linear-gradient(to bottom, #EEF2F7 1px, transparent 1px),
            linear-gradient(to right, #D9E1EA 1px, transparent 1px),
            linear-gradient(to bottom, #D9E1EA 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px, 20px 20px, 100px 100px, 100px 100px'
        }}
      />

      {/* TOP ENGINEERING HEADER */}
      <header className="h-14 bg-[#FFFFFF] border-b border-[#D9E1EA] px-6 flex items-center justify-between shrink-0 z-20 shadow-2xs">
        {/* Top Left: Title Block */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xs bg-[#1565C0] text-[#FFFFFF] flex items-center justify-center font-bold text-sm shadow-xs">
            HAL
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wider uppercase text-[#10233A] leading-none">
              HAL AEROSPACE MISSION CONTROL
            </h1>
            <p className="text-[10px] text-[#1565C0] font-bold tracking-widest uppercase mt-0.5">
              PHYSICS-INFORMED DIGITAL TWIN PLATFORM // MIL-STD-498
            </p>
          </div>
        </div>

        {/* Top Center: Real-Time Operational Parameters Pill */}
        <div className="hidden xl:flex items-center gap-2 text-[10px]">
          <div className="px-2.5 py-1 bg-[#F7F8FA] border border-[#D9E1EA] rounded-xs flex items-center gap-1.5 text-[#10233A] font-bold">
            <Clock className="w-3.5 h-3.5 text-[#1565C0]" />
            <span>{utcClock || 'SYNCHRONIZING...'}</span>
          </div>
          <div className="px-2.5 py-1 bg-[#F7F8FA] border border-[#D9E1EA] rounded-xs text-[#5E738D]">
            NETWORK: <span className="text-[#10233A] font-bold">AERONET-V4 SECURE</span>
          </div>
          <div className="px-2.5 py-1 bg-[#F7F8FA] border border-[#D9E1EA] rounded-xs text-[#5E738D]">
            AIR BASE: <span className="text-[#10233A] font-bold">JODHPUR FWD (WCMD)</span>
          </div>
          <div className="px-2.5 py-1 bg-[#F7F8FA] border border-[#D9E1EA] rounded-xs text-[#1565C0] font-bold">
            v2026.2.0-PROD
          </div>
        </div>

        {/* Top Right: Security Classification & Access Mode Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-[10px]">
            <span className="px-2 py-1 rounded-xs font-bold uppercase tracking-wider bg-[#FFFFFF] text-[#ED6C02] border border-[#ED6C02]/40">
              RESTRICTED // MIL-STD
            </span>
            <span className="px-2 py-1 rounded-xs font-bold uppercase tracking-wider bg-[#FFFFFF] text-[#2E7D32] border border-[#2E7D32]/40">
              PKI GATEWAY READY
            </span>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-1 bg-[#F7F8FA] p-1 rounded-xs border border-[#D9E1EA] text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setAuthMode('REAL')}
              className={`px-2 py-0.5 rounded-xs transition-all flex items-center gap-1 cursor-pointer ${
                authMode === 'REAL' ? 'bg-[#1565C0] text-[#FFFFFF] shadow-2xs' : 'text-[#5E738D] hover:text-[#10233A]'
              }`}
            >
              <Camera className="w-3 h-3" />
              <span>[ REAL // LIVE ]</span>
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('DEMO')}
              className={`px-2 py-0.5 rounded-xs transition-all flex items-center gap-1 cursor-pointer ${
                authMode === 'DEMO' ? 'bg-[#ED6C02] text-[#FFFFFF] shadow-2xs' : 'text-[#5E738D] hover:text-[#10233A]'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>[ DEMO // SEEDED ]</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsRegModalOpen(true)}
            className="px-2.5 py-1 bg-[#FFFFFF] hover:bg-[#F7F8FA] text-[#1565C0] font-bold text-[10px] tracking-wider uppercase rounded-xs border border-[#1565C0] transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>[+ ENROLL OPERATOR ]</span>
          </button>
        </div>
      </header>

      {/* CENTER WORKSTATION VIEWPORT (Dominated by LCA Tejas Blueprint + Floating Console) */}
      <main className="flex-1 flex flex-col items-center justify-between p-6 overflow-y-auto relative z-10 gap-6">
        {/* Upper Zone: Dominant CAD Technical Blueprint */}
        <div className="w-full max-w-6xl flex-1 flex flex-col justify-center min-h-[340px]">
          <LcaTejasWireframe />
        </div>

        {/* Lower Zone: Floating Engineering Authentication Console */}
        <div className="w-full max-w-2xl bg-[#FFFFFF] border border-[#D9E1EA] rounded-sm p-5 shadow-sm space-y-4 shrink-0 z-20">
          {/* Protocol Header & Sequence Progress Bar */}
          <div className="space-y-2 border-b border-[#D9E1EA] pb-3">
            <div className="flex items-center justify-between text-[10px] text-[#5E738D]">
              <span className="font-bold text-[#10233A] uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-[#1565C0]" />
                <span>MISSION ACCESS AUTHORIZATION CONSOLE</span>
              </span>
              <span className="text-[#1565C0] font-bold bg-[#F7F8FA] px-2 py-0.5 rounded-xs border border-[#D9E1EA]">
                STEP {stepIndexMap[currentStep]} OF 7 // WORKSTATION CLEARANCE
              </span>
            </div>

            {/* 7-Step Sequence Matrix */}
            <div className="grid grid-cols-7 gap-1.5">
              {['1 ID', '2 CRED', '3 PKI', '4 SCAN', '5 ROLE', '6 BOOT', '7 DASH'].map((label, idx) => {
                const stepNum = idx + 1;
                const activeNum = stepIndexMap[currentStep];
                const isPassed = stepNum < activeNum;
                const isCurrent = stepNum === activeNum || (currentStep === 'CREDENTIALS' && stepNum === 2) || (currentStep === 'CLEARANCE' && stepNum === 4);

                return (
                  <div key={label} className="text-center space-y-1">
                    <div className={`h-1.5 rounded-xs transition-all ${
                      isPassed ? 'bg-[#2E7D32]' : isCurrent ? 'bg-[#1565C0] animate-pulse' : 'bg-[#EEF2F7]'
                    }`} />
                    <div className={`text-[9px] font-bold tracking-tight ${
                      isPassed ? 'text-[#2E7D32]' : isCurrent ? 'text-[#1565C0]' : 'text-[#5E738D]'
                    }`}>
                      {label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DYNAMIC STEP CONTENT VIEWPORT */}
          <div className="pt-1">
            {/* STEP 1 & 2: CREDENTIALS SELECTION & PASSWORD VALIDATION */}
            {currentStep === 'CREDENTIALS' && (
              <form onSubmit={handleCredentialsSubmit} className="space-y-4 text-xs">
                {loginError && (
                  <div className="p-2.5 bg-[#FFFFFF] border border-[#C62828] rounded-xs text-[#C62828] font-bold text-xs shadow-2xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C62828] animate-ping" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Field: Operator Profile Dropdown */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-[#5E738D] uppercase tracking-wider">
                      AUTHORIZING OPERATOR PROFILE
                    </label>
                    <select
                      value={selectedOpIndex}
                      onChange={(e) => setSelectedOpIndex(Number(e.target.value))}
                      className="w-full bg-[#F7F8FA] border border-[#D9E1EA] rounded-xs px-3 py-2 text-[#10233A] font-mono text-xs focus:outline-none focus:border-[#1565C0] transition-colors"
                    >
                      {operatorsList.map((op, index) => (
                        <option key={op.id} value={index}>
                          [{op.id}] • {op.name}
                        </option>
                      ))}
                    </select>
                    <div className="text-[10px] text-[#1565C0] flex items-center gap-1 font-bold mt-1">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>CLEARANCE: {activeOperator.clearanceLevel}</span>
                    </div>
                  </div>

                  {/* Right Field: Secure PKI Password */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-bold text-[#5E738D] uppercase tracking-wider">
                        PKI WORKSTATION TOKEN / PASSWORD
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[9px] text-[#1565C0] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{showPassword ? 'HIDE' : 'SHOW'}</span>
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full bg-[#F7F8FA] border border-[#D9E1EA] rounded-xs px-3 py-2 text-[#10233A] font-mono text-xs focus:outline-none focus:border-[#1565C0] transition-colors pr-9"
                        placeholder="Enter PKI SmartCard Password or Override Key"
                      />
                      <KeyRound className="absolute right-3 top-2.5 w-4 h-4 text-[#5E738D]" />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-[#5E738D]">
                        <input
                          type="checkbox"
                          checked={rememberWorkstation}
                          onChange={(e) => setRememberWorkstation(e.target.checked)}
                          className="rounded-xs border-[#D9E1EA] bg-[#F7F8FA] text-[#1565C0] focus:ring-0 w-3.5 h-3.5"
                        />
                        <span>Remember Workstation Token</span>
                      </label>
                      <span className="text-[9px] text-[#0097A7] font-bold">MAC: 00-1B-63-84-45-E6</span>
                    </div>
                  </div>
                </div>

                {/* Primary CAD Action Button (No consumer styling) */}
                <button
                  type="submit"
                  disabled={isInitiating}
                  className="w-full py-2.5 px-4 bg-[#1565C0] hover:bg-[#10233A] disabled:opacity-50 text-[#FFFFFF] font-bold text-xs tracking-wider uppercase rounded-xs shadow-xs transition-all flex items-center justify-center gap-2 border border-[#1565C0] cursor-pointer mt-2"
                >
                  <span>{isInitiating ? '[ VALIDATING PKI GATEWAY... ]' : '[ VALIDATE CREDENTIALS & INITIATE BIOMETRIC MATRIX ]'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* STEP 3 & 4: LIVE WEBCAM / BIOMETRIC VERIFICATION */}
            {currentStep === 'BIOMETRIC' && (
              <LiveWebcamScanner
                challengeId={challengeId}
                livenessAction={livenessAction}
                operatorName={activeOperator.name}
                clearanceLevel={activeOperator.clearanceLevel}
                authMode={authMode}
                onScanSuccess={handleBiometricSuccess}
                onFallbackToPassword={() => setCurrentStep('CREDENTIALS')}
              />
            )}

            {/* STEP 5: CLEARANCE SUMMARY & MISSION BOOT AUTHORIZATION */}
            {currentStep === 'CLEARANCE' && (
              <div className="space-y-4 font-mono text-xs animate-fadeIn">
                <div className="p-4 bg-[#F7F8FA] border border-[#2E7D32] rounded-xs space-y-3 relative overflow-hidden shadow-2xs">
                  <div className="absolute top-0 right-0 px-2.5 py-0.5 bg-[#FFFFFF] text-[#2E7D32] border-l border-b border-[#2E7D32] font-bold text-[9px] uppercase tracking-widest">
                    VERIFIED IDENTIFICATION
                  </div>

                  <div className="flex items-center gap-3 border-b border-[#D9E1EA] pb-3">
                    <div className="w-10 h-10 rounded-xs bg-[#FFFFFF] border border-[#2E7D32] flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-6 h-6 text-[#2E7D32]" />
                    </div>
                    <div>
                      <div className="text-[9px] text-[#5E738D]">OPERATOR CLEARANCE PROFILE:</div>
                      <div className="font-bold text-[#10233A] text-sm uppercase">{activeOperator.name}</div>
                      <div className="text-[10px] text-[#1565C0] font-bold">ID: {activeOperator.id} • CALLSIGN: {activeOperator.callsign}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[10px]">
                    <div>
                      <span className="text-[#5E738D] block text-[9px]">OPERATIONAL ROLE:</span>
                      <span className="font-bold text-[#10233A] uppercase">{activeOperator.role}</span>
                    </div>
                    <div>
                      <span className="text-[#5E738D] block text-[9px]">SQUADRON ASSIGNMENT:</span>
                      <span className="font-bold text-[#10233A]">{activeOperator.squadron}</span>
                    </div>
                  </div>

                  <div className="p-2 bg-[#FFFFFF] border border-[#2E7D32]/40 rounded-xs text-center">
                    <span className="text-[#2E7D32] font-bold tracking-wider text-xs">
                      {activeOperator.clearanceLevel}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={handleBootMissionControl}
                    type="button"
                    className="col-span-2 py-2.5 px-4 bg-[#2E7D32] hover:bg-[#1B5E20] text-[#FFFFFF] font-bold text-xs tracking-wider uppercase rounded-xs shadow-xs transition-all flex items-center justify-center gap-2 border border-[#2E7D32] cursor-pointer"
                  >
                    <span>[ AUTHORIZE & BOOT MISSION CONTROL ]</span>
                    <Terminal className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setCurrentStep('CREDENTIALS')}
                    type="button"
                    className="py-2.5 px-3 bg-[#FFFFFF] hover:bg-[#F7F8FA] text-[#10233A] font-bold text-[10px] tracking-wider uppercase rounded-xs transition-all border border-[#D9E1EA] cursor-pointer flex items-center justify-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3 text-[#5E738D]" />
                    <span>[ SWITCH PROFILE ]</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 6 & 7: ENTERPRISE INITIALIZATION SEQUENCE */}
            {currentStep === 'BOOTSTRAP' && (
              <ServiceLoader
                onComplete={handleBootstrapComplete}
                operatorName={activeOperator.name}
                role={activeOperator.clearanceLevel}
              />
            )}
          </div>
        </div>
      </main>

      {/* BOTTOM OPERATIONAL STATUS BAR */}
      <footer className="h-9 bg-[#FFFFFF] border-t border-[#D9E1EA] px-6 flex items-center justify-between text-[10px] text-[#5E738D] shrink-0 z-20 font-mono select-none">
        {/* Left Operational Status Matrix (8 Parameters) */}
        <div className="flex items-center gap-4 overflow-x-auto">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] animate-pulse" />
            <span className="text-[#10233A] font-bold">CAMERA: CONNECTED</span>
          </span>
          <span className="text-[#10233A]">PKI: <span className="font-bold text-[#2E7D32]">VERIFIED</span></span>
          <span>JWT: <span className="font-bold text-[#10233A]">STANDBY</span></span>
          <span>DATABASE: <span className="font-bold text-[#2E7D32]">ONLINE</span></span>
          <span>TELEMETRY: <span className="font-bold text-[#0097A7]">READY</span></span>
          <span>PHYSICS: <span className="font-bold text-[#2E7D32]">READY (1.0 Hz)</span></span>
          <span>AI: <span className="font-bold text-[#1565C0]">READY (RUL-v4)</span></span>
          <span className="hidden xl:inline">DIGITAL TWIN: <span className="font-bold text-[#10233A]">STANDBY</span></span>
        </div>

        {/* Right Live Telemetry Ticker */}
        <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-[#D9E1EA] text-[9px] text-[#10233A] shrink-0">
          <Radio className="w-3 h-3 text-[#0097A7] animate-ping" />
          <span className="font-bold text-[#0097A7]">{telemetryLog[0]}</span>
        </div>
      </footer>

      {/* Operator Registration Modal */}
      <OperatorRegistrationModal
        isOpen={isRegModalOpen}
        onClose={() => setIsRegModalOpen(false)}
        onSuccess={(newOp) => {
          setOperatorsList((prev) => [
            ...prev,
            {
              id: newOp.id || `USR-${Math.floor(1000+Math.random()*9000)}`,
              name: newOp.name,
              role: (newOp.role as any) || 'ENGINEER',
              callsign: newOp.callsign || 'HAL-OPS',
              squadron: newOp.squadron || 'IAF Propulsion Command',
              clearanceLevel: `LEVEL 4 // ${newOp.role || 'ENGINEER'} CLEARANCE`
            }
          ]);
          setSelectedOpIndex(operatorsList.length);
        }}
        authMode={authMode}
      />
    </div>
  );
});

MissionAccessWorkstation.displayName = 'MissionAccessWorkstation';
