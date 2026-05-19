"use client";

import React, { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { 
  Clock, 
  DollarSign, 
  Layers, 
  PawPrint, 
  Briefcase, 
  Calendar, 
  MapPin, 
  Globe,
  Truck,
  Zap
} from "lucide-react";

interface JobCheckpoint {
  jobId: string;
  durationMs: number;
  itemsGathered: number;
  name?: string;
  quantity?: number;
  pricePerItem?: number;
}

interface Lap {
  id?: string;
  lapNumber: number;
  durationMs: number;
  itemsGathered: number;
  ecoEarned: number;
  checkpoints?: JobCheckpoint[];
}

interface MappedJob {
  id: string;
  presetId?: string;
  name: string;
  pricePerItem: number;
  itemWeight: number;
  processingType: 'none' | 'one_to_one' | 'batch_to_one';
  processRatio: number;
  finalItemName: string;
  jobCategory: 'white' | 'animal';
  animalsPerRound?: number;
  totalRounds?: number;
  minutesPerRound?: number;
  animalYields?: any[];
}

interface SharedSessionDetailProps {
  session: {
    id: string;
    presetId?: string;
    jobId: string;
    vehicleId: string;
    startTime: number;
    isCrafting?: boolean;
    craftingName?: string;
    craftingRatio?: number;
    craftingPrice?: number;
    isVip?: boolean;
    farmMode?: 'city' | 'dimension';
    dimensionLoops?: number;
    isPublic?: boolean;
    jobCategory?: 'white' | 'animal';
    laps: Lap[];
  };
  jobs: MappedJob[];
  vehicleName: string;
  cityName: string;
}

export function SharedSessionDetail({ session, jobs, vehicleName, cityName }: SharedSessionDetailProps) {
  const { t, language, setLanguage } = useTranslation();

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}m ${s % 60}s`;
  };

  const formatHours = (ms: number) => {
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const totalMs = session.laps.reduce((acc, lap) => acc + lap.durationMs, 0);
  const totalEco = session.laps.reduce((acc, lap) => acc + lap.ecoEarned, 0);
  const lapCount = session.laps.length;

  const date = new Date(session.startTime).toLocaleDateString() + " " + new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Compute fastest/slowest based on farm mode
  const sessionJobIds = session.jobId.split(",").filter(Boolean);
  const isDimensionSession = session.farmMode === 'dimension';
  const jobCount = sessionJobIds.length;

  let fastestLabel = "";
  let fastestMs = Infinity;
  let slowestLabel = "";
  let slowestMs = 0;

  if (session.jobCategory === 'animal') {
    // For animals, compare individual laps if multiple
    session.laps.forEach(lap => {
      if (lap.durationMs < fastestMs) { fastestMs = lap.durationMs; fastestLabel = `${t("dash.lap")} ${lap.lapNumber}`; }
      if (lap.durationMs > slowestMs) { slowestMs = lap.durationMs; slowestLabel = `${t("dash.lap")} ${lap.lapNumber}`; }
    });
  } else if (isDimensionSession && jobCount > 0) {
    // Dimension: compare loop totals
    session.laps.forEach(lap => {
      const cps = lap.checkpoints || [];
      for (let li = 0; li < cps.length; li += jobCount) {
        const loopCps = cps.slice(li, li + jobCount);
        const loopMs = loopCps.reduce((a, c) => a + c.durationMs, 0);
        const loopNum = Math.floor(li / jobCount) + 1;
        if (loopMs < fastestMs) { fastestMs = loopMs; fastestLabel = `Loop ${loopNum}`; }
        if (loopMs > slowestMs) { slowestMs = loopMs; slowestLabel = `Loop ${loopNum}`; }
      }
    });
  } else {
    // City: compare individual job checkpoints
    session.laps.forEach(lap => {
      (lap.checkpoints || []).forEach(cp => {
        const jName = jobs.find(j => j.id === cp.jobId)?.name || cp.jobId;
        if (cp.durationMs < fastestMs) { fastestMs = cp.durationMs; fastestLabel = jName; }
        if (cp.durationMs > slowestMs) { slowestMs = cp.durationMs; slowestLabel = jName; }
      });
    });
  }
  if (!isFinite(fastestMs)) fastestMs = 0;

  return (
    <div className="w-full max-w-3xl space-y-6">
      {/* Header and Language Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card/40 border border-border/30 rounded-xl p-4 md:p-6 backdrop-blur-xl shadow-lg">
        <div className="space-y-2 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold tracking-tight text-primary">{t("dash.summaryTitle")}</h1>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            {cityName && (
              <span className="flex items-center gap-1 bg-primary/15 text-primary text-xs px-3 py-1 rounded-full border border-primary/25 font-bold">
                <MapPin className="w-3.5 h-3.5" />
                {cityName}
              </span>
            )}
            {session.jobCategory === 'animal' ? (
              <span className="bg-amber-500/15 text-amber-400 text-xs px-3 py-1 rounded-full border border-amber-500/25 font-bold flex items-center gap-1">
                <PawPrint className="w-3.5 h-3.5" />
                {t("ana.animalFarm")}
              </span>
            ) : (
              <span className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full border border-primary/20 font-bold flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" />
                {t("ana.whiteJob")}
              </span>
            )}
            {session.isVip && (
              <span className="bg-amber-500/15 text-amber-400 text-xs px-3 py-1 rounded-full border border-amber-500/25 font-bold">
                VIP
              </span>
            )}
            {session.farmMode === 'dimension' && (
              <span className="bg-primary/15 text-primary text-xs px-3 py-1 rounded-full border border-primary/25 font-bold">
                {session.dimensionLoops} Loops
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-xs flex items-center justify-center sm:justify-start gap-1.5 font-medium mt-1">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            {date}
          </p>
        </div>

        {/* Language selector */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'th' : 'en')}
          className="flex items-center gap-2 px-3 py-1.5 bg-background/60 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-lg border border-border/40 transition-colors text-xs font-semibold"
        >
          <Globe className="w-4 h-4" />
          <span>{language === 'en' ? 'EN' : 'TH'}</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border/50 rounded-xl text-center shadow-lg hover:border-primary/30 transition-colors">
          <div className="flex justify-center mb-2"><Layers className="w-6 h-6 text-primary" /></div>
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{t("ana.totalLaps")}</p>
          <p className="text-2xl font-mono font-black text-primary mt-1">{lapCount}</p>
        </div>
        <div className="p-4 bg-card border border-border/50 rounded-xl text-center shadow-lg hover:border-[oklch(0.72_0.16_240)]/30 transition-colors">
          <div className="flex justify-center mb-2"><Clock className="w-6 h-6 text-[oklch(0.72_0.16_240)]" /></div>
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{t("ana.totalTime")}</p>
          <p className="text-2xl font-mono font-bold text-[oklch(0.72_0.16_240)] mt-1">{formatHours(totalMs)}</p>
        </div>
        <div className="p-4 bg-card border border-border/50 rounded-xl text-center shadow-lg hover:border-emerald-500/30 transition-colors">
          <div className="flex justify-center mb-2"><DollarSign className="w-6 h-6 text-emerald-400" /></div>
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{t("ana.totalEarned")}</p>
          <p className="text-2xl font-mono font-bold text-emerald-400 mt-1">${totalEco.toLocaleString()}</p>
        </div>
      </div>

      {/* Detailed Meta: Vehicle, Route type */}
      <div className="bg-card border border-border/50 rounded-xl p-4 md:p-6 shadow-lg space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border/20 pb-2">
          <Briefcase className="w-4 h-4 text-primary" />
          {t("conf.jobSetup")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between items-center p-2.5 bg-background/40 rounded-lg border border-border/30">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-primary" /> {t("ana.vehicle")}
            </span>
            <span className="font-bold text-foreground">{vehicleName || t("ana.unknown")}</span>
          </div>

          <div className="flex justify-between items-center p-2.5 bg-background/40 rounded-lg border border-border/30">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-primary" /> {t("ana.job")}
            </span>
            <span className="font-bold text-foreground truncate max-w-[200px]" title={session.isCrafting ? (session.craftingName || t("ana.craftedRoute")) : jobs.map(j => j.name).join(", ")}>
              {session.isCrafting ? (
                session.craftingName || t("ana.craftedRoute")
              ) : jobs.length > 0 ? (
                jobs.map(j => j.name).join(", ")
              ) : (
                t("ana.unknown")
              )}
            </span>
          </div>
        </div>

        {/* Fastest & Slowest Lap Cards */}
        {fastestMs > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-2">
            <div className="p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/15 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t("ana.fastestLap")}</span>
                {fastestLabel && <p className="text-xs font-semibold text-emerald-400 mt-0.5 truncate max-w-[180px]">{fastestLabel}</p>}
              </div>
              <p className="text-lg font-mono font-black text-emerald-400">{formatTime(fastestMs)}</p>
            </div>
            <div className="p-3 bg-destructive/5 rounded-lg border border-destructive/15 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t("ana.slowestLap")}</span>
                {slowestLabel && <p className="text-xs font-semibold text-destructive mt-0.5 truncate max-w-[180px]">{slowestLabel}</p>}
              </div>
              <p className="text-lg font-mono font-black text-destructive">{formatTime(slowestMs)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Laps List */}
      <div className="bg-card border border-border/50 rounded-xl p-4 md:p-6 shadow-lg">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-1.5 border-b border-border/20 pb-2">
          <Layers className="w-4 h-4 text-primary" />
          {session.jobCategory === 'animal' ? t("ana.yieldBreakdown") : t("ana.lapBreakdown")}
        </h3>
        
        <div className="space-y-3">
          {session.jobCategory === 'animal' ? (
            session.laps[0]?.checkpoints && session.laps[0].checkpoints.length > 0 ? (
              <div className="space-y-1.5">
                {session.laps[0].checkpoints.map((cp: any, cpi: number) => (
                  <div key={cpi} className="flex justify-between items-center p-3 bg-background/50 rounded-lg border border-border/30 hover:border-amber-500/20 transition-colors">
                    <span className="text-foreground font-semibold flex items-center gap-2">
                      <PawPrint className="w-4 h-4 text-amber-400 animate-pulse" /> {cp.name}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground font-mono">{cp.quantity} {t("ana.items")}</span>
                      <span className="text-emerald-400 font-mono font-bold text-sm">${(cp.quantity * cp.pricePerItem).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-6 text-sm italic">ไม่มีข้อมูลผลลัพธ์วัตถุดิบ</p>
            )
          ) : (
            session.laps.map((lap, i) => {
              const cps = lap.checkpoints || [];
              
              // Group checkpoints into loops (for dimension mode)
              const loops: JobCheckpoint[][] = [];
              if (isDimensionSession && jobCount > 0 && cps.length > jobCount) {
                for (let li = 0; li < cps.length; li += jobCount) {
                  loops.push(cps.slice(li, li + jobCount));
                }
              }

              return (
                <div key={lap.id || i} className="p-4 bg-background/50 rounded-xl border border-border/30 hover:border-primary/20 transition-all duration-200">
                  {/* Lap Header Summary */}
                  <div className="flex justify-between items-center pb-2 border-b border-border/10 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-primary">{t("dash.lap")} {lap.lapNumber}</span>
                      <span className="text-xs text-muted-foreground">({lap.itemsGathered} {t("dash.sets")})</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-sm font-bold text-foreground">{formatTime(lap.durationMs)}</span>
                      <span className="text-emerald-400 font-mono text-sm font-bold">${lap.ecoEarned.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Checkpoints or Loops Breakdown */}
                  {isDimensionSession && loops.length > 0 ? (
                    <div className="space-y-3">
                      {loops.map((loopCps, loopIdx) => {
                        const loopTotalMs = loopCps.reduce((a, c) => a + c.durationMs, 0);
                        return (
                          <div key={loopIdx} className="rounded-lg border border-primary/10 bg-primary/[0.02] overflow-hidden shadow-sm">
                            {/* Loop Header */}
                            <div className="flex items-center justify-between px-3 py-2 bg-primary/[0.04] border-b border-primary/10">
                              <div className="flex items-center gap-2">
                                <Layers className="w-3.5 h-3.5 text-primary" />
                                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                                  Loop {loopIdx + 1}
                                </span>
                              </div>
                              <span className="text-xs font-mono font-bold text-muted-foreground">{formatTime(loopTotalMs)}</span>
                            </div>
                            {/* Per-Job in this Loop */}
                            <div className="px-3 py-2 space-y-1.5">
                              {loopCps.map((cp, ci) => {
                                const jName = jobs.find(j => j.id === cp.jobId)?.name || cp.jobId;
                                const pctOfLoop = loopTotalMs > 0 ? (cp.durationMs / loopTotalMs * 100) : 0;
                                return (
                                  <div key={ci} className="flex items-center justify-between text-xs group/cp">
                                    <span className="text-muted-foreground group-hover/cp:text-foreground transition-colors font-medium">{jName}</span>
                                    <div className="flex items-center gap-2">
                                      <div className="w-20 h-1 bg-border/20 rounded-full overflow-hidden hidden sm:block">
                                        <div 
                                          className="h-full bg-primary/60 rounded-full" 
                                          style={{ width: `${Math.min(100, pctOfLoop)}%` }} 
                                        />
                                      </div>
                                      <span className="font-mono text-muted-foreground font-semibold">{formatTime(cp.durationMs)}</span>
                                      <span className="text-[10px] text-muted-foreground/60 w-8 text-right">{pctOfLoop.toFixed(0)}%</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : cps.length > 1 ? (
                    /* City Mode Checkpoint List */
                    <div className="pl-3 border-l-2 border-primary/20 space-y-2 mt-2">
                      {cps.map((cp, ci) => {
                        const jName = jobs.find(j => j.id === cp.jobId)?.name || cp.jobId;
                        const pctOfLap = lap.durationMs > 0 ? (cp.durationMs / lap.durationMs * 100) : 0;
                        return (
                          <div key={ci} className="flex items-center justify-between text-xs group/cp">
                            <span className="text-muted-foreground group-hover/cp:text-foreground transition-colors font-medium">{jName}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-1 bg-border/20 rounded-full overflow-hidden hidden sm:block">
                                <div 
                                  className="h-full bg-primary/60 rounded-full" 
                                  style={{ width: `${Math.min(100, pctOfLap)}%` }} 
                                />
                              </div>
                              <span className="font-mono text-muted-foreground font-semibold">{formatTime(cp.durationMs)}</span>
                              <span className="text-[10px] text-muted-foreground/60 w-8 text-right">{pctOfLap.toFixed(0)}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    cps.length === 1 && (
                      <div className="text-xs text-muted-foreground pl-3 border-l-2 border-primary/20">
                        {jobs.find(j => j.id === cps[0].jobId)?.name || cps[0].jobId}: <span className="font-mono font-bold text-foreground">{formatTime(cps[0].durationMs)}</span>
                      </div>
                    )
                  )}
                </div>
              );
            })
          )}

          {session.laps.length === 0 && (
            <p className="text-center text-muted-foreground py-6 text-sm italic">
              {t("ana.unknown")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
