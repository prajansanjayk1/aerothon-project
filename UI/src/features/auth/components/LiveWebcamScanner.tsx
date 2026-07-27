import React, { useState, useEffect, useRef } from 'react';
import { Scan, ShieldCheck, RefreshCw, KeyRound, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';

export type LiveBiometricScanState = 'IDLE' | 'CAPTURING' | 'VERIFYING' | 'VERIFIED' | 'FAILED';

interface LiveWebcamScannerProps {
  challengeId: string;
  livenessAction: string;
  operatorName: string;
  clearanceLevel: string;
  authMode: 'REAL' | 'DEMO';
  onScanSuccess: (authData: any) => void;
  onFallbackToPassword: () => void;
}

export const LiveWebcamScanner: React.FC<LiveWebcamScannerProps> = React.memo(({
  challengeId,
  livenessAction,
  operatorName,
  clearanceLevel,
  authMode,
  onScanSuccess,
  onFallbackToPassword
}) => {
  const [scanState, setScanState] = useState<LiveBiometricScanState>('IDLE');
  const [similarityScore, setSimilarityScore] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('SYSTEM READY • AWAITING LIVE WEBCAM INITIATION');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [qualityMetrics, setQualityMetrics] = useState<any>({
    face_detected: true,
    face_centered: true,
    eyes_visible: true,
    lighting_acceptable: true
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize webcam when entering REAL mode
  useEffect(() => {
    let isMounted = true;
    if (authMode === 'REAL') {
      setStatusText('REQUESTING OPTICAL SENSOR PERMISSION (OPT-01)...');
      navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } })
        .then((stream) => {
          if (!isMounted) {
            stream.getTracks().forEach(t => t.stop());
            return;
          }
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setCameraActive(true);
            setStatusText(`OPTICAL FEED ACTIVE • CHALLENGE: PERFORM [${livenessAction}]`);
          }
        })
        .catch((err) => {
          console.error("Camera access denied or failed:", err);
          setErrorMessage("Camera Permission Denied or Device Unavailable. Switching to DEMO mode recommended.");
          setStatusText("OPTICAL SENSOR ERROR • CAMERA ACCESS REQUIRED");
        });
    } else {
      // In DEMO mode, we simulate camera readiness
      setCameraActive(true);
      setStatusText(`DEMO OVERRIDE ACTIVE • CHALLENGE: PERFORM [${livenessAction}]`);
    }

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [authMode, livenessAction]);

  // Capture frame from canvas and send to backend API
  const handleVerifyBiometric = async () => {
    setScanState('VERIFYING');
    setErrorMessage(null);
    setStatusText('EXTRACTING 512-DIM INSIGHTFACE VECTOR & VERIFYING LIVENESS...');

    let base64Frame = "";
    if (authMode === 'REAL' && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        base64Frame = canvas.toDataURL('image/jpeg', 0.85);
      }
    }

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/login/verify-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge_id: challengeId,
          base64_frame: base64Frame || "DEMO_SIMULATED_FRAME",
          auth_mode: authMode
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.verified) {
        setScanState('FAILED');
        setSimilarityScore(data.similarity_score ? data.similarity_score * 100 : 42.8);
        setErrorMessage(data.message || data.detail || "Biometric authentication failed. Optical quality or liveness mismatch.");
        setStatusText("VERIFICATION FAILED • RE-ALIGN IN Targeting Brackets");
        if (data.quality_metrics) {
          setQualityMetrics(data.quality_metrics);
        }
        return;
      }

      // Success
      setScanState('VERIFIED');
      setSimilarityScore(data.similarity_score ? data.similarity_score * 100 : 98.4);
      setStatusText("IDENTITY VERIFIED • ISSUING MISSION JWT TOKEN");
      if (data.quality_metrics) {
        setQualityMetrics(data.quality_metrics);
      }

      setTimeout(() => {
        onScanSuccess(data);
      }, 1200);

    } catch (err) {
      console.warn("Backend reachable check failed during face verification. Using DEMO simulation.", err);
      if (authMode === 'DEMO') {
        setScanState('VERIFIED');
        setSimilarityScore(98.4);
        setStatusText("DEMO SIMULATION VERIFIED • ISSUING MISSION JWT TOKEN");
        setTimeout(() => {
          onScanSuccess({
            verified: true,
            similarity_score: 0.984,
            token: "demo_jwt_token_hal_2026",
            operator: { name: operatorName, role: "COMMANDER" }
          });
        }, 1200);
      } else {
        setScanState('FAILED');
        setErrorMessage("Could not connect to military backend on port 8000. Please check server or switch to DEMO mode.");
        setStatusText("NETWORK ERROR • BACKEND GATEWAY UNREACHABLE");
      }
    }
  };

  const handleRetry = () => {
    setScanState('IDLE');
    setErrorMessage(null);
    setStatusText(`SYSTEM READY • CHALLENGE: PERFORM [${livenessAction}]`);
  };

  return (
    <div className="space-y-3 font-mono text-xs select-none bg-[#FFFFFF] p-3 rounded-sm border border-[#D9E1EA]">
      {/* Liveness Anti-Spoofing Challenge Prompt Bar */}
      <div className="p-2 bg-[#F7F8FA] border border-[#D9E1EA] rounded-xs flex items-center justify-between text-[#10233A] shadow-2xs">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-[#ED6C02] shrink-0 animate-pulse" />
          <span className="font-bold text-[11px] tracking-wider uppercase text-[#10233A]">
            SECURITY CHALLENGE: PERFORM ACTION [{livenessAction}] IN WEBCAM FEED
          </span>
        </div>
        <span className="text-[9px] bg-[#FFFFFF] text-[#1565C0] px-1.5 py-0.5 rounded-xs font-bold uppercase tracking-widest border border-[#D9E1EA]">
          ANTI-SPOOF ACTIVE
        </span>
      </div>

      {/* Military Viewfinder & Scanner Container */}
      <div className="relative w-full h-[220px] bg-[#F7F8FA] border border-[#D9E1EA] rounded-xs overflow-hidden flex flex-col items-center justify-center shadow-inner">
        
        {/* Corner Targeting Brackets (CAD style #1565C0) */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#1565C0] pointer-events-none z-20" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#1565C0] pointer-events-none z-20" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#1565C0] pointer-events-none z-20" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#1565C0] pointer-events-none z-20" />

        {/* Live Video Feed or Demo Simulation Layer */}
        {authMode === 'REAL' ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover opacity-90 transform -scale-x-100"
          />
        ) : (
          <div 
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle, #1565C0 1px, transparent 1px)`,
              backgroundSize: '16px 16px'
            }}
          />
        )}

        {/* Hidden Canvas for Base64 Frame Extraction */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Center Circular Biometric Reticule Overlay */}
        <div className={`relative w-32 h-32 rounded-full border flex items-center justify-center transition-all duration-300 z-10 ${
          scanState === 'VERIFIED'
            ? 'border-[#2E7D32] bg-[#2E7D32]/10 shadow-[0_0_15px_rgba(46,125,50,0.2)]'
            : scanState === 'VERIFYING'
            ? 'border-[#1565C0] bg-[#1565C0]/10 animate-pulse shadow-[0_0_15px_rgba(21,101,192,0.2)]'
            : 'border-[#D9E1EA] bg-[#FFFFFF]/60'
        }`}>
          {/* Inner Reticule Rings */}
          <div className="absolute w-24 h-24 rounded-full border border-dashed border-[#1565C0]/60 animate-[spin_12s_linear_infinite]" />
          <div className="absolute w-16 h-16 rounded-full border border-[#D9E1EA]" />

          {/* Center Icon */}
          {scanState === 'VERIFIED' ? (
            <CheckCircle2 className="w-10 h-10 text-[#2E7D32] animate-bounce" />
          ) : (
            <Scan className={`w-8 h-8 transition-colors ${
              scanState === 'VERIFYING' ? 'text-[#1565C0] animate-pulse' : 'text-[#5E738D]'
            }`} />
          )}

          {/* Laser Scanning Bar */}
          {scanState === 'VERIFYING' && (
            <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#1565C0] to-transparent animate-[bounce_1.5s_infinite] opacity-90" />
          )}
        </div>

        {/* Top Camera Mode Badges */}
        <div className="absolute top-2 left-8 flex items-center gap-1.5 px-2 py-0.5 bg-[#FFFFFF] border border-[#D9E1EA] rounded-xs text-[9px] text-[#10233A] z-20 shadow-2xs">
          <span className={`w-1.5 h-1.5 rounded-full ${cameraActive ? 'bg-[#2E7D32] animate-ping' : 'bg-[#5E738D]'}`} />
          <span className="font-semibold">FEED: {authMode === 'REAL' ? 'LIVE OPTICAL SENSOR (OPT-01)' : 'DEMO BIOMETRIC SIMULATION'}</span>
        </div>

        {/* Quality Alignment Indicator Pills */}
        <div className="absolute top-2 right-8 flex items-center gap-1 z-20 text-[8px]">
          <span className={`px-1.5 py-0.5 rounded-xs font-bold border ${qualityMetrics.face_centered ? 'bg-[#FFFFFF] text-[#2E7D32] border-[#2E7D32]/40' : 'bg-[#FFFFFF] text-[#C62828] border-[#C62828]/40'}`}>
            CENTERED
          </span>
          <span className={`px-1.5 py-0.5 rounded-xs font-bold border ${qualityMetrics.lighting_acceptable ? 'bg-[#FFFFFF] text-[#2E7D32] border-[#2E7D32]/40' : 'bg-[#FFFFFF] text-[#ED6C02] border-[#ED6C02]/40'}`}>
            LIGHTING
          </span>
          <span className={`px-1.5 py-0.5 rounded-xs font-bold border ${qualityMetrics.eyes_visible ? 'bg-[#FFFFFF] text-[#2E7D32] border-[#2E7D32]/40' : 'bg-[#FFFFFF] text-[#C62828] border-[#C62828]/40'}`}>
            EYES
          </span>
        </div>

        {/* Biometric Similarity Score Overlay */}
        <div className="absolute bottom-2 right-8 font-mono text-[9px] text-right z-20 bg-[#FFFFFF] px-2 py-1 rounded-xs border border-[#D9E1EA] shadow-2xs">
          <div className="text-[#5E738D] text-[8px]">SIMILARITY SCORE</div>
          <div className={`font-bold ${similarityScore >= 70 ? 'text-[#2E7D32]' : similarityScore >= 50 ? 'text-[#1565C0]' : 'text-[#10233A]'}`}>
            {similarityScore > 0 ? `${similarityScore.toFixed(1)}%` : 'AWAITING MATCH'}
          </div>
        </div>

        {/* Operator Targeting Callout */}
        <div className="absolute bottom-2 left-8 font-mono text-[9px] text-[#5E738D] z-20 bg-[#FFFFFF] px-2 py-1 rounded-xs border border-[#D9E1EA] shadow-2xs">
          <div>TARGET: <span className="text-[#10233A] font-bold">{operatorName}</span></div>
          <div>CLEARANCE: <span className="text-[#1565C0] font-bold">{clearanceLevel}</span></div>
        </div>
      </div>

      {/* Error Message Banner if Verification Fails */}
      {errorMessage && (
        <div className="p-2.5 bg-[#FFFFFF] border border-[#C62828] rounded-xs flex items-center justify-between text-[#C62828] shadow-sm animate-shake">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#C62828] shrink-0" />
            <span className="font-bold text-[11px]">{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            type="button"
            className="text-[9px] uppercase font-bold px-2 py-0.5 bg-[#F7F8FA] hover:bg-[#EEF2F7] rounded-xs text-[#10233A] border border-[#D9E1EA] cursor-pointer"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* Dynamic Status Bar */}
      <div className={`p-2 rounded-xs border flex items-center justify-between ${
        scanState === 'VERIFIED'
          ? 'bg-[#FFFFFF] border-[#2E7D32] text-[#2E7D32]'
          : scanState === 'VERIFYING'
          ? 'bg-[#FFFFFF] border-[#1565C0] text-[#1565C0]'
          : scanState === 'FAILED'
          ? 'bg-[#FFFFFF] border-[#C62828] text-[#C62828]'
          : 'bg-[#F7F8FA] border-[#D9E1EA] text-[#5E738D]'
      }`}>
        <div className="flex items-center gap-2">
          {scanState === 'VERIFIED' ? (
            <ShieldCheck className="w-4 h-4 text-[#2E7D32] shrink-0" />
          ) : (
            <Scan className="w-4 h-4 text-[#1565C0] shrink-0" />
          )}
          <span className="font-bold tracking-wider text-[10px] text-[#10233A]">{statusText}</span>
        </div>
        <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-xs bg-[#FFFFFF] border border-[#D9E1EA] text-[#10233A]">
          {scanState}
        </span>
      </div>

      {/* Action Button Controls (Subtle Engineering Controls, No Consumer UI) */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={handleVerifyBiometric}
          type="button"
          disabled={scanState === 'VERIFYING' || scanState === 'VERIFIED'}
          className="col-span-2 py-2.5 px-4 bg-[#1565C0] hover:bg-[#10233A] disabled:opacity-50 text-[#FFFFFF] font-bold text-xs tracking-wider uppercase rounded-xs shadow-xs transition-all flex items-center justify-center gap-2 border border-[#1565C0] cursor-pointer"
        >
          <Scan className="w-4 h-4 animate-pulse" />
          <span>[ VERIFY BIOMETRIC MATRIX & LIVENESS ]</span>
        </button>

        <button
          onClick={handleRetry}
          type="button"
          disabled={scanState === 'VERIFIED'}
          className="py-1.5 px-3 bg-[#FFFFFF] hover:bg-[#F7F8FA] disabled:opacity-50 text-[#10233A] font-bold text-[11px] tracking-wider uppercase rounded-xs transition-all flex items-center justify-center gap-1.5 border border-[#D9E1EA] cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#5E738D]" />
          <span>[ RESET SENSOR ]</span>
        </button>

        <button
          onClick={onFallbackToPassword}
          type="button"
          className="py-1.5 px-3 bg-[#FFFFFF] hover:bg-[#F7F8FA] text-[#5E738D] hover:text-[#10233A] text-[10px] uppercase tracking-wider font-bold rounded-xs border border-[#D9E1EA] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <KeyRound className="w-3.5 h-3.5 text-[#ED6C02]" />
          <span>[ PKI OVERRIDE GATEWAY ]</span>
        </button>
      </div>
    </div>
  );
});

LiveWebcamScanner.displayName = 'LiveWebcamScanner';
