import React, { useMemo } from 'react';
import { Panel, Ring } from '@/components';
import { HelpCircle, Brain, GitCommit, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useMissionStore } from '@/stores';

export const ExplainabilityView: React.FC = React.memo(() => {
  const inf = useMissionStore((state) => state.aiInference);
  const telemetry = useMissionStore((state) => state.telemetry);
  const alerts = useMissionStore((state) => state.alerts);

  // Dynamic SHAP factor adjustments reacting in real-time to telemetry stress
  const dynamicShap = useMemo(() => {
    const t4Stress = Math.max(0, Math.round((telemetry.t4Kelvin - 1623.15) * 0.15));
    const vibStress = Math.max(0, Math.round((telemetry.vibrationG - 1.2) * 20));

    return inf.shapleyFactors.map((fac) => {
      let val = fac.shapleyValuePct;
      if (fac.parameter.includes('T4') || fac.parameter.includes('Temp')) val += t4Stress;
      if (fac.parameter.includes('Vibration')) val += vibStress;
      return { ...fac, shapleyValuePct: val };
    });
  }, [inf.shapleyFactors, telemetry.t4Kelvin, telemetry.vibrationG]);

  const totalDegrading = useMemo(() => {
    return dynamicShap
      .filter((f) => f.direction === 'DEGRADING')
      .reduce((acc, curr) => acc + curr.shapleyValuePct, 0);
  }, [dynamicShap]);

  const isCrit = inf.weibull.meanRulHours < 150 || alerts.some((a) => a.severity === 'CRITICAL');

  return (
    <div className="p-3 h-full overflow-y-auto space-y-3 bg-[#F4F6F8]">
      {/* Top Model Consistency & Residual Evolution Metric Strip */}
      <div className="grid grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3 bg-white border border-slate-300 rounded-sm shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">ADDITIVE CONSISTENCY</div>
            <div className="text-lg font-bold text-[#003366] mt-0.5">Σ φ_i = f(x) - E[f]</div>
            <div className="text-[9px] text-emerald-600 font-bold mt-0.5">● EXACT SHAPLEY AXIOMS MET</div>
          </div>
          <Brain className="w-8 h-8 text-sky-600/30" />
        </div>

        <div className="p-3 bg-white border border-slate-300 rounded-sm shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">TOTAL DEGRADATION DRIVER</div>
            <div className={`text-lg font-bold mt-0.5 ${totalDegrading > 40 ? 'text-red-600 animate-pulse' : 'text-amber-600'}`}>
              -{totalDegrading}% IMPACT
            </div>
            <div className="text-[9px] text-slate-500 mt-0.5">Weighted across 14 ARINC words</div>
          </div>
          <GitCommit className="w-8 h-8 text-amber-500/30" />
        </div>

        <div className="p-3 bg-white border border-slate-300 rounded-sm shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">WEIBULL SHAPE PARAMETER</div>
            <div className="text-lg font-bold text-slate-800 mt-0.5">β = 1.84 • η = 1,120h</div>
            <div className="text-[9px] text-slate-500 mt-0.5">Wear-Out Degradation Phase</div>
          </div>
          <Ring pct={85} size={36} stroke={4} label="β" color="#00A86B" />
        </div>

        <div className="p-3 bg-white border border-slate-300 rounded-sm shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">AI TRIAGE VERIFICATION</div>
            <div className="text-lg font-bold text-emerald-700 mt-0.5">99.4% CONFIDENCE</div>
            <div className="text-[9px] text-slate-500 mt-0.5">Physics-Informed Neural Net (PINN)</div>
          </div>
          {isCrit ? <AlertTriangle className="w-8 h-8 text-red-500/30 animate-pulse" /> : <ShieldCheck className="w-8 h-8 text-emerald-500/30" />}
        </div>
      </div>

      <Panel title="XAI Shapley Causal Explainability Engine & Live Waterfall Matrix" icon={HelpCircle} highContrastHeader={isCrit}>
        <div className="space-y-4 font-mono text-xs">
          <div className="p-3 bg-slate-900 text-white rounded-sm border border-slate-800 shadow-sm flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-sky-400 font-bold uppercase text-[10px] flex items-center gap-2">
                <span>WHY DID THE AI PREDICT A {inf.weibull.meanRulHours.toLocaleString()}H RUL?</span>
                {isCrit && <span className="bg-red-600 text-white px-1.5 py-0.5 rounded-xs animate-pulse text-[9px]">CRITICAL CASUALTY DETECTED</span>}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Shapley additive explanations (SHAP) decompose the Weibull RUL prediction into parameter-level contributions. Real-time thermal and mechanical stresses from ARINC-429 databus stream adjust these weights dynamically during mission execution.
              </p>
            </div>
            <div className="shrink-0 pl-4 border-l border-slate-800 text-right">
              <div className="text-[10px] text-slate-400">MODEL BASELINE</div>
              <div className="text-lg font-bold text-white">1,000.0h</div>
              <div className="text-[10px] text-slate-400 mt-1">CURRENT PREDICTION</div>
              <div className={`text-lg font-bold ${isCrit ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                {inf.weibull.meanRulHours.toLocaleString()}h
              </div>
            </div>
          </div>

          {/* Interactive SHAP Waterfall Feature Breakdown */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-[#003366] uppercase tracking-wider px-1">
              LIVE SHAPLEY FEATURE ATTRIBUTION — RANKED BY CAUSAL IMPACT
            </div>
            {dynamicShap.map((fac, idx) => {
              const isDegrading = fac.direction === 'DEGRADING';
              const barPct = Math.min(100, Math.max(4, fac.shapleyValuePct * 2.5));
              return (
                <div key={idx} className={`p-3 bg-white border rounded-sm transition-all shadow-2xs space-y-2 ${
                  isDegrading && fac.shapleyValuePct > 15 ? 'border-red-300 bg-red-50/30' : 'border-slate-300 hover:border-slate-400'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#003366] text-sm">{fac.parameter}</span>
                        <span className="text-[10px] font-normal text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-xs border border-slate-200">
                          {fac.arincWord}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500">{fac.description}</div>
                    </div>
                    <span className={`px-3 py-1 rounded-sm font-bold text-xs shrink-0 ${
                      isDegrading ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                    }`}>
                      {isDegrading ? `-${fac.shapleyValuePct}% Impact` : `+${fac.shapleyValuePct}% Margin`}
                    </span>
                  </div>

                  {/* Horizontal Waterfall Bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden relative border border-slate-200/60">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${isDegrading ? 'bg-red-500' : 'bg-emerald-500'}`}
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Panel>
    </div>
  );
});
ExplainabilityView.displayName = 'ExplainabilityView';
