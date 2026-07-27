import React, { useState, useRef, useEffect } from 'react';
import { X, Shield, Camera, CheckCircle2, AlertTriangle, Eye, EyeOff, UserPlus, Sparkles } from 'lucide-react';

interface OperatorRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newOp: any) => void;
  authMode: 'REAL' | 'DEMO';
}

export const OperatorRegistrationModal: React.FC<OperatorRegistrationModalProps> = React.memo(({
  isOpen,
  onClose,
  onSuccess,
  authMode
}) => {
  const [operatorId, setOperatorId] = useState<string>(`USR-${Math.floor(1000 + Math.random() * 9000)}`);
  const [employeeId, setEmployeeId] = useState<string>(`EMP-${Math.floor(10000 + Math.random() * 90000)}`);
  const [fullName, setFullName] = useState<string>('');
  const [role, setRole] = useState<string>('ENGINEER');
  const [squadron, setSquadron] = useState<string>('No. 45 Sqn (Flying Daggers)');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [base64Frame, setBase64Frame] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen && authMode === 'REAL') {
      navigator.mediaDevices.getUserMedia({ video: { width: 480, height: 360, facingMode: 'user' } })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setCameraActive(true);
          }
        })
        .catch((err) => {
          console.error("Enrollment camera access failed:", err);
          setErrorMsg("Camera access denied. In DEMO mode or if camera is unavailable, enrollment will use seeded vector overrides.");
        });
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, authMode]);

  if (!isOpen) return null;

  const handleCaptureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 480;
      canvas.height = video.videoHeight || 360;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setBase64Frame(dataUrl);
        setErrorMsg(null);
      }
    } else if (authMode === 'DEMO') {
      // Create a simulated dummy base64 thumbnail for demo
      setBase64Frame("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !password) {
      setErrorMsg("Full Name and Password are required for military registration.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operator_id: operatorId,
          employee_id: employeeId,
          full_name: fullName,
          role: role,
          callsign: `HAL-${operatorId.slice(-4)}`,
          squadron: squadron,
          password: password,
          base64_frame: base64Frame
        }),
      });

      const data = await response.json();
      setIsSubmitting(false);

      if (!response.ok || !data.success) {
        setErrorMsg(data.detail || data.message || "Operator enrollment failed.");
        return;
      }

      onSuccess(data.operator || { id: operatorId, name: fullName, role: role });
      onClose();
    } catch (err) {
      console.warn("Backend reachable check failed during registration. Registering locally in demo mode.", err);
      setIsSubmitting(false);
      if (authMode === 'DEMO') {
        onSuccess({ id: operatorId, name: fullName, role: role });
        onClose();
      } else {
        setErrorMsg("Could not connect to military backend on port 8000. Please ensure Uvicorn server is running.");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-[#10233A]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-mono select-none animate-fadeIn">
      <div className="w-full max-w-3xl bg-[#FFFFFF] border border-[#D9E1EA] rounded-sm p-6 space-y-5 shadow-lg relative overflow-hidden text-[#10233A] max-h-[90vh] overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#D9E1EA] pb-3 bg-[#F7F8FA] -mx-6 -mt-6 px-6 pt-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xs bg-[#1565C0] text-[#FFFFFF] flex items-center justify-center shadow-xs">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base tracking-wider uppercase text-[#10233A] leading-none">
                ENROLL NEW MILITARY OPERATOR
              </h2>
              <p className="text-[10px] text-[#1565C0] font-bold tracking-widest uppercase mt-0.5">
                IAF PKI & 512-DIM INSIGHTFACE BIOMETRIC ENROLLMENT PROTOCOL
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 text-[#5E738D] hover:text-[#10233A] rounded-xs hover:bg-[#EEF2F7] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="p-2.5 bg-[#FFFFFF] border border-[#C62828] rounded-xs flex items-center gap-2 text-[#C62828] text-xs shadow-2xs">
            <AlertTriangle className="w-4 h-4 text-[#C62828] shrink-0" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6 pt-1">
          {/* Left Column: Profile Credentials */}
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-[#5E738D] uppercase tracking-wider">OPERATOR ID</label>
                <input
                  type="text"
                  value={operatorId}
                  onChange={(e) => setOperatorId(e.target.value.toUpperCase())}
                  required
                  className="w-full bg-[#F7F8FA] border border-[#D9E1EA] rounded-xs px-2.5 py-1.5 text-[#10233A] font-mono text-xs focus:outline-none focus:border-[#1565C0]"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-[#5E738D] uppercase tracking-wider">EMPLOYEE ID</label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                  required
                  className="w-full bg-[#F7F8FA] border border-[#D9E1EA] rounded-xs px-2.5 py-1.5 text-[#10233A] font-mono text-xs focus:outline-none focus:border-[#1565C0]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] font-bold text-[#5E738D] uppercase tracking-wider">FULL NAME & RANK</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Flt Lt A. Deshmukh (Avionics Specialist)"
                required
                className="w-full bg-[#F7F8FA] border border-[#D9E1EA] rounded-xs px-2.5 py-1.5 text-[#10233A] font-mono text-xs focus:outline-none focus:border-[#1565C0]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] font-bold text-[#5E738D] uppercase tracking-wider">CLEARANCE ROLE</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#F7F8FA] border border-[#D9E1EA] rounded-xs px-2.5 py-1.5 text-[#10233A] font-mono text-xs focus:outline-none focus:border-[#1565C0]"
              >
                <option value="COMMANDER">COMMANDER (Level 5 // Full Mission Authority)</option>
                <option value="ENGINEER">ENGINEER (Level 4 // Systems & Telemetry)</option>
                <option value="ANALYST">ANALYST (Level 3 // Physics & Replay)</option>
                <option value="ADMIN">ADMIN (Level 5 // Security & PKI Gateway)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] font-bold text-[#5E738D] uppercase tracking-wider">SQUADRON ASSIGNMENT</label>
              <input
                type="text"
                value={squadron}
                onChange={(e) => setSquadron(e.target.value)}
                className="w-full bg-[#F7F8FA] border border-[#D9E1EA] rounded-xs px-2.5 py-1.5 text-[#10233A] font-mono text-xs focus:outline-none focus:border-[#1565C0]"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-[9px] font-bold text-[#5E738D] uppercase tracking-wider">SECURE PKI PASSWORD</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[9px] text-[#1565C0] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPassword ? 'HIDE' : 'SHOW'}</span>
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter strong password for bcrypt hash"
                className="w-full bg-[#F7F8FA] border border-[#D9E1EA] rounded-xs px-2.5 py-1.5 text-[#10233A] font-mono text-xs focus:outline-none focus:border-[#1565C0]"
              />
            </div>
          </div>

          {/* Right Column: Facial Embedding Enrollment */}
          <div className="space-y-3 flex flex-col justify-between bg-[#F7F8FA] p-3.5 border border-[#D9E1EA] rounded-xs">
            <div>
              <div className="text-xs font-bold text-[#10233A] uppercase tracking-wider flex items-center justify-between mb-1.5">
                <span>BIOMETRIC ENROLLMENT</span>
                <span className="text-[9px] text-[#2E7D32] bg-[#FFFFFF] px-1.5 py-0.5 rounded-xs border border-[#D9E1EA] font-bold">
                  512-DIM INSIGHTFACE
                </span>
              </div>
              <p className="text-[10px] text-[#5E738D] leading-relaxed mb-2.5">
                Center face in camera viewfinder. Capture will generate an L2-normalized 512-dim neural embedding vector. Raw images are never stored.
              </p>
            </div>

            {/* Video Viewfinder / Preview */}
            <div className="relative w-full h-[170px] bg-[#FFFFFF] border border-[#D9E1EA] rounded-xs overflow-hidden flex items-center justify-center shadow-inner">
              {base64Frame ? (
                <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#2E7D32]/10">
                  <CheckCircle2 className="w-8 h-8 text-[#2E7D32] mb-1.5 animate-bounce" />
                  <span className="text-[#2E7D32] font-bold text-[11px] tracking-wider uppercase">
                    ENROLLMENT MATRIX LOCKED
                  </span>
                  <button
                    type="button"
                    onClick={() => setBase64Frame(null)}
                    className="mt-1.5 text-[10px] font-semibold underline text-[#5E738D] hover:text-[#10233A] cursor-pointer"
                  >
                    Recapture Frame
                  </button>
                </div>
              ) : authMode === 'REAL' ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100 opacity-90"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="absolute inset-x-0 bottom-1 text-center text-[9px] text-[#10233A] font-bold bg-[#FFFFFF]/80 py-0.5 border-t border-[#D9E1EA]">
                    ALIGN FACE IN FRAME • {cameraActive ? 'OPTICAL FEED ACTIVE' : 'REQUESTING CAMERA...'}
                  </div>
                </>
              ) : (
                <div className="text-center p-4 space-y-1.5">
                  <Sparkles className="w-6 h-6 text-[#ED6C02] mx-auto animate-pulse" />
                  <div className="text-xs font-bold text-[#ED6C02]">DEMO ENROLLMENT OVERRIDE</div>
                  <div className="text-[10px] text-[#5E738D]">Will generate simulated L2-normalized neural embedding vector on backend.</div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleCaptureFrame}
              disabled={Boolean(base64Frame)}
              className="w-full py-2 px-3 bg-[#1565C0] hover:bg-[#10233A] disabled:opacity-50 text-[#FFFFFF] font-bold text-xs tracking-wider uppercase rounded-xs transition-all flex items-center justify-center gap-2 border border-[#1565C0] cursor-pointer shadow-xs"
            >
              <Camera className="w-4 h-4" />
              <span>{base64Frame ? '[ ENROLLMENT FRAME CAPTURED ]' : '[ CAPTURE ENROLLMENT FRAME ]'}</span>
            </button>
          </div>

          {/* Bottom Action Footer */}
          <div className="col-span-2 flex items-center justify-end gap-2.5 pt-3 border-t border-[#D9E1EA] -mx-6 -mb-6 px-6 pb-4 bg-[#F7F8FA]">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 bg-[#FFFFFF] hover:bg-[#EEF2F7] text-[#10233A] font-bold text-xs tracking-wider uppercase rounded-xs border border-[#D9E1EA] cursor-pointer transition-colors"
            >
              [ CANCEL ]
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2 px-5 bg-[#1565C0] hover:bg-[#10233A] disabled:opacity-50 text-[#FFFFFF] font-bold text-xs tracking-wider uppercase rounded-xs shadow-xs transition-all flex items-center justify-center gap-2 border border-[#1565C0] cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              <span>{isSubmitting ? '[ ENROLLING OPERATOR... ]' : '[ ENROLL OPERATOR IN DATABASE ]'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});
OperatorRegistrationModal.displayName = 'OperatorRegistrationModal';
