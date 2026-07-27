// HAL Mission Control - Zustand Security Clearance & Authentication Store
import { create } from 'zustand';

export type SecurityClearanceLevel = 'ANALYST' | 'ENGINEER' | 'COMMANDER' | 'ADMIN';

interface AuthStoreState {
  isAuthenticated: boolean;
  user: {
    id: string;
    name: string;
    callsign: string;
    role: SecurityClearanceLevel;
    squadron: string;
    token: string;
  } | null;
  setClearanceRole: (role: SecurityClearanceLevel) => void;
  login: (name: string, role: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  isAuthenticated: false, // Default to false so application boots into Pre-Authentication Workstation
  user: {
    id: 'USR-8821',
    name: 'Wgd Cdr S. Rao (Chief Propulsion Lead)',
    callsign: 'DAGGER-LEAD',
    role: 'COMMANDER',
    squadron: 'No. 45 Sqn (Flying Daggers)',
    token: 'JWT_HAL_PROD_IAF_88219_SECURED',
  },
  setClearanceRole: (role) =>
    set((state) => ({
      user: state.user ? { ...state.user, role } : null,
    })),
  login: (name, roleStr) => {
    let mappedRole: SecurityClearanceLevel = 'ENGINEER';
    if (roleStr.includes('COMMANDER')) mappedRole = 'COMMANDER';
    else if (roleStr.includes('ANALYST')) mappedRole = 'ANALYST';
    else if (roleStr.includes('ADMIN')) mappedRole = 'ADMIN';

    set({
      isAuthenticated: true,
      user: {
        id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
        name,
        callsign: mappedRole === 'COMMANDER' ? 'DAGGER-LEAD' : mappedRole === 'ENGINEER' ? 'VECTRA-02' : 'TELEMETRY-09',
        role: mappedRole,
        squadron: mappedRole === 'COMMANDER' ? 'No. 45 Sqn (Flying Daggers)' : 'HAL Propulsion Command',
        token: 'JWT_ACTIVE_IAF_SESSION_VERIFIED',
      },
    });
  },
  logout: () => set({ isAuthenticated: false }),
}));
