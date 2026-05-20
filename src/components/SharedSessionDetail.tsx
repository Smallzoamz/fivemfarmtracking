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
  Zap,
  Calculator,
  Target
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
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLapNumber, setSelectedLapNumber] = useState<number>(
    session.laps.length > 0 ? session.laps[0].lapNumber : 1
  );
  const [targetGoal, setTargetGoal] = useState<number>(0);

  const lapsPerPage = 5;
  const totalPages = Math.ceil(session.laps.length / lapsPerPage);
  const startIndex = (currentPage - 1) * lapsPerPage;
  const paginatedLaps = session.laps.slice(startIndex, startIndex + lapsPerPage);

  const selectedLap = session.laps.find(l => l.lapNumber === selectedLapNumber) || session.laps[0];

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

  const avgMsPerLap = lapCount > 0 ? totalMs / lapCount : 0;
  const avgEcoPerLap = lapCount > 0 ? totalEco / lapCount : 0;

  const goalLapsNeeded = avgEcoPerLap > 0 && targetGoal > 0 ? Math.ceil(targetGoal / avgEcoPerLap) : 0;
  const goalEstTimeMs = goalLapsNeeded * avgMsPerLap;

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
    session.laps.forEach(lap => {
      if (lap.durationMs < fastestMs) { fastestMs = lap.durationMs; fastestLabel = `${t("dash.lap")} ${lap.lapNumber}`; }
      if (lap.durationMs > slowestMs) { slowestMs = lap.durationMs; slowestLabel = `${t("dash.lap")} ${lap.lapNumber}`; }
    });
  } else if (isDimensionSession && jobCount > 0) {
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

      {/* Laps Section (Only for white jobs / dimension routes) */}
      {session.jobCategory !== 'animal' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel: Laps Table (lg:col-span-7) */}
          <div className="lg:col-span-7 bg-card border border-border/50 rounded-xl p-4 md:p-6 shadow-lg flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-1.5 border-b border-border/20 pb-2">
                <Layers className="w-4 h-4 text-primary" />
                {t("ana.lapBreakdown")}
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/20 text-[10px] text-muted-foreground uppercase font-black tracking-wider">
                      <th className="py-2.5 px-3">{t("dash.lap")}</th>
                      <th className="py-2.5 px-3">{t("ana.totalTime")}</th>
                      <th className="py-2.5 px-3">{t("dash.sets") || "Sets"}</th>
                      <th className="py-2.5 px-3 text-right">{t("ana.totalEarned")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/10">
                    {paginatedLaps.map((lap) => {
                      const isSelected = selectedLapNumber === lap.lapNumber;
                      return (
                        <tr
                          key={lap.id || lap.lapNumber}
                          onClick={() => setSelectedLapNumber(lap.lapNumber)}
                          className={`cursor-pointer transition-all duration-200 text-xs font-medium hover:bg-primary/5
                            ${isSelected ? "bg-primary/10 text-primary border-l-2 border-primary" : "text-foreground"}`}
                        >
                          <td className="py-3 px-3 font-bold"># {lap.lapNumber}</td>
                          <td className="py-3 px-3 font-mono">{formatTime(lap.durationMs)}</td>
                          <td className="py-3 px-3 text-muted-foreground">{lap.itemsGathered}</td>
                          <td className="py-3 px-3 text-right font-mono text-emerald-400 font-bold">
                            ${lap.ecoEarned.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {session.laps.length === 0 && (
                <p className="text-center text-muted-foreground py-6 text-sm italic">
                  {t("ana.unknown")}
                </p>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border/20 pt-4 mt-4">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1 bg-background hover:bg-primary/10 text-muted-foreground disabled:opacity-30 disabled:hover:bg-transparent rounded border border-border/40 transition-colors text-xs font-bold"
                >
                  &larr; Prev
                </button>
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="px-3 py-1 bg-background hover:bg-primary/10 text-muted-foreground disabled:opacity-30 disabled:hover:bg-transparent rounded border border-border/40 transition-colors text-xs font-bold"
                >
                  Next &rarr;
                </button>
              </div>
            )}
          </div>

          {/* Right Panel: Lap Details Inspector (lg:col-span-5) */}
          <div className="lg:col-span-5 bg-card border border-border/50 rounded-xl p-4 md:p-6 shadow-lg">
            {selectedLap ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/20 pb-2">
                  <h4 className="text-sm font-black text-foreground uppercase tracking-wide">
                    {t("dash.lap")} {selectedLap.lapNumber} Details
                  </h4>
                  <span className="bg-primary/15 text-primary text-[10px] px-2 py-0.5 rounded-full border border-primary/25 font-bold uppercase tracking-wider">
                    {selectedLap.itemsGathered} Sets
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-background/50 rounded-lg border border-border/30">
                    <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">{t("ana.totalTime")}</span>
                    <p className="text-sm font-mono font-bold text-foreground mt-0.5">{formatTime(selectedLap.durationMs)}</p>
                  </div>
                  <div className="p-2 bg-background/50 rounded-lg border border-border/30">
                    <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">{t("ana.totalEarned")}</span>
                    <p className="text-sm font-mono font-bold text-emerald-400 mt-0.5">${selectedLap.ecoEarned.toLocaleString()}</p>
                  </div>
                </div>

                {/* Visual Checkpoints Breakdown */}
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-primary" /> Checkpoint Breakdown
                  </span>
                  
                  {(() => {
                    const selectedLapCps = selectedLap.checkpoints || [];
                    const selectedLapLoops: JobCheckpoint[][] = [];
                    if (isDimensionSession && jobCount > 0 && selectedLapCps.length > jobCount) {
                      for (let li = 0; li < selectedLapCps.length; li += jobCount) {
                        selectedLapLoops.push(selectedLapCps.slice(li, li + jobCount));
                      }
                    }

                    if (isDimensionSession && selectedLapLoops.length > 0) {
                      return (
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                          {selectedLapLoops.map((loopCps, loopIdx) => {
                            const loopTotalMs = loopCps.reduce((a, c) => a + c.durationMs, 0);
                            return (
                              <div key={loopIdx} className="rounded-lg border border-primary/15 bg-primary/[0.02] overflow-hidden shadow-sm">
                                <div className="flex items-center justify-between px-3 py-1.5 bg-primary/[0.04] border-b border-primary/10">
                                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Loop {loopIdx + 1}</span>
                                  <span className="text-[10px] font-mono font-bold text-muted-foreground">{formatTime(loopTotalMs)}</span>
                                </div>
                                <div className="p-2 space-y-1.5">
                                  {loopCps.map((cp, ci) => {
                                    const jName = jobs.find(j => j.id === cp.jobId)?.name || cp.jobId;
                                    const pctOfLoop = loopTotalMs > 0 ? (cp.durationMs / loopTotalMs * 100) : 0;
                                    return (
                                      <div key={ci} className="flex flex-col gap-1 text-[11px]">
                                        <div className="flex justify-between font-medium">
                                          <span className="text-muted-foreground truncate max-w-[150px]">{jName}</span>
                                          <span className="font-mono text-foreground">{formatTime(cp.durationMs)}</span>
                                        </div>
                                        <div className="w-full h-1 bg-border/20 rounded-full overflow-hidden">
                                          <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, pctOfLoop)}%` }} />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    } else if (selectedLapCps.length > 1) {
                      return (
                        <div className="space-y-3 pl-2 border-l border-primary/20 max-h-[300px] overflow-y-auto pr-1">
                          {selectedLapCps.map((cp, ci) => {
                            const jName = jobs.find(j => j.id === cp.jobId)?.name || cp.jobId;
                            const pctOfLap = selectedLap.durationMs > 0 ? (cp.durationMs / selectedLap.durationMs * 100) : 0;
                            return (
                              <div key={ci} className="flex flex-col gap-1 text-[11px]">
                                <div className="flex justify-between font-medium">
                                  <span className="text-muted-foreground truncate max-w-[150px]">{jName}</span>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-foreground">{formatTime(cp.durationMs)}</span>
                                    <span className="text-[10px] text-muted-foreground/60">({pctOfLap.toFixed(0)}%)</span>
                                  </div>
                                </div>
                                <div className="w-full h-1.5 bg-border/20 rounded-full overflow-hidden">
                                  <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, pctOfLap)}%` }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    } else if (selectedLapCps.length === 1) {
                      return (
                        <div className="text-xs text-muted-foreground p-3 bg-background/50 rounded-lg border border-border/30">
                          {jobs.find(j => j.id === selectedLapCps[0].jobId)?.name || selectedLapCps[0].jobId}: <span className="font-mono font-bold text-foreground">{formatTime(selectedLapCps[0].durationMs)}</span>
                        </div>
                      );
                    } else {
                      return <p className="text-xs text-muted-foreground italic">No checkpoints found</p>;
                    }
                  })()}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                <Layers className="w-8 h-8 text-muted-foreground/40 mb-2" />
                <p className="text-xs text-muted-foreground italic">Select a lap to view checkpoint details</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Yield Breakdown for Animal Farming (kept as single section since it's already compact) */}
      {session.jobCategory === 'animal' && (
        <div className="bg-card border border-border/50 rounded-xl p-4 md:p-6 shadow-lg">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-1.5 border-b border-border/20 pb-2">
            <PawPrint className="w-4 h-4 text-amber-400" />
            {t("ana.yieldBreakdown")}
          </h3>
          
          <div className="space-y-3">
            {session.laps[0]?.checkpoints && session.laps[0].checkpoints.length > 0 ? (
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
            )}
          </div>
        </div>
      )}

      {/* Goal Calculator */}
      {lapCount > 0 && (
        <div className="bg-card border border-border/50 rounded-xl p-4 md:p-6 shadow-lg space-y-5">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border/20 pb-2">
            <Calculator className="w-4 h-4 text-primary" />
            {t("shared.goalCalc")}
          </h3>

          {/* Avg Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-[oklch(0.72_0.16_240/0.05)] rounded-lg border border-[oklch(0.72_0.16_240/0.2)] text-center">
              <p className="text-[10px] text-[oklch(0.72_0.16_240)] uppercase font-bold tracking-wider">{t("shared.avgTimeLap")}</p>
              <p className="text-xl font-mono font-bold text-[oklch(0.72_0.16_240)] mt-1">{formatTime(avgMsPerLap)}</p>
            </div>
            <div className="p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/20 text-center">
              <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">{t("shared.avgEcoLap")}</p>
              <p className="text-xl font-mono font-bold text-emerald-400 mt-1">${Math.round(avgEcoPerLap).toLocaleString()}</p>
            </div>
          </div>

          {/* Target Input */}
          <div className="space-y-2">
            <label className="text-xs text-primary font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              {t("shared.enterTarget")}
            </label>
            <input
              type="number"
              value={targetGoal || ""}
              onChange={(e) => setTargetGoal(Math.max(0, Number(e.target.value)))}
              placeholder="e.g. 1000000"
              className="w-full h-11 px-4 rounded-lg bg-background border border-border/50 text-foreground font-mono text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
            />
          </div>

          {/* Calculated Results */}
          {goalLapsNeeded > 0 && (
            <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-transparent pointer-events-none" />
                <p className="text-[10px] text-primary uppercase font-bold tracking-wider relative">{t("shared.lapsNeeded")}</p>
                <p className="text-3xl font-mono font-black text-primary mt-1 relative">{goalLapsNeeded.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 relative">{t("dash.cyclesLeft")}</p>
              </div>
              <div className="p-4 bg-[oklch(0.72_0.16_240/0.05)] rounded-lg border border-[oklch(0.72_0.16_240/0.2)] text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.72_0.16_240/0.08)] to-transparent pointer-events-none" />
                <p className="text-[10px] text-[oklch(0.72_0.16_240)] uppercase font-bold tracking-wider relative">{t("shared.estTotalTime")}</p>
                <p className="text-3xl font-mono font-black text-[oklch(0.72_0.16_240)] mt-1 relative">{formatHours(goalEstTimeMs)}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 relative">{formatTime(goalEstTimeMs)}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
