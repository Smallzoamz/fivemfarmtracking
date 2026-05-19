"use client";

import { useState } from "react";
import { useFarmStore } from "@/store/farmStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { BarChart3, ChevronDown, ChevronUp, Clock, DollarSign, Zap, Layers, Trash2, Share2, Check, PawPrint, Briefcase } from "lucide-react";

export function Analytics() {
  const { presets, activePresetId, sessions, jobs, vehicles, clearHistory, removeSession } = useFarmStore();
  const activePreset = presets.find(p => p.id === activePresetId) || presets[0];
  const targetGoal = activePreset.targetGoal || 1000000;
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const toggleSessionPublic = useFarmStore(state => state.toggleSessionPublic);

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

  const filteredSessions = sessions.filter(s => (!s.presetId || s.presetId === activePresetId || s.presetId === 'default'));

  if (filteredSessions.length === 0) return null;

  let vipLaps = 0;
  let vipMs = 0;
  let normalLaps = 0;
  let normalMs = 0;

  filteredSessions.filter(s => !s.jobCategory || s.jobCategory === 'white').forEach(s => {
    s.laps.forEach(l => {
      if (s.isVip) {
        vipLaps++;
        vipMs += l.durationMs;
      } else {
        normalLaps++;
        normalMs += l.durationMs;
      }
    });
  });

  const avgVip = vipLaps > 0 ? vipMs / vipLaps : 0;
  const avgNormal = normalLaps > 0 ? normalMs / normalLaps : 0;
  const diffStr = (avgVip > 0 && avgNormal > 0) ? formatTime(Math.abs(avgNormal - avgVip)) : "N/A";
  const isFaster = avgNormal > avgVip;

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const handleShare = async (e: React.MouseEvent, session: typeof sessions[0]) => {
    e.stopPropagation();
    
    let targetId = session.id;

    // First, toggle local state and update DB (if exists)
    if (!session.isPublic) {
      const updatedId = await toggleSessionPublic(session.id, true);
      if (updatedId) targetId = updatedId;
      // Ensure the session is actually in the cloud by triggering a sync
      const { migrateToCloud } = useFarmStore.getState();
      await migrateToCloud();
    }
    
    const url = `${window.location.origin}/shared/${targetId}`;
    
    let copySuccess = false;
    try {
      await navigator.clipboard.writeText(url);
      copySuccess = true;
    } catch (err) {
      console.warn("Clipboard API blocked, trying fallback:", err);
      const textArea = document.createElement("textarea");
      textArea.value = url;
      textArea.style.position = "fixed";
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        copySuccess = document.execCommand("copy");
      } catch (execErr) {
        console.error("execCommand fallback failed:", execErr);
      }
      document.body.removeChild(textArea);
    }

    if (copySuccess) {
      setCopiedId(targetId);
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      window.prompt(t("ana.copyLinkPrompt") || "Please copy the link below:", url);
    }
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20"><BarChart3 className="text-primary w-4 h-4" /></div>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold text-foreground">{t("ana.title")}</CardTitle>
              <span className="bg-primary/15 text-primary text-[10px] px-2 py-0.5 rounded-full border border-primary/25 font-bold uppercase tracking-wider">
                {activePreset.name}
              </span>
            </div>
            <CardDescription className="text-xs">{t("ana.desc")}</CardDescription>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={clearHistory} className="border-destructive/30 text-destructive hover:bg-destructive/10 shrink-0 text-xs">
          {t("ana.clearHistory")}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
          <div className="bg-background/50 border border-border/40 rounded-lg p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t("ana.avgVip")}</p>
            <p className="text-lg font-mono text-amber-400 font-bold mt-1">
              {avgVip > 0 ? formatTime(avgVip) : "-"}
            </p>
          </div>
          <div className="bg-background/50 border border-border/40 rounded-lg p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t("ana.avgNormal")}</p>
            <p className="text-lg font-mono text-foreground font-bold mt-1">
              {avgNormal > 0 ? formatTime(avgNormal) : "-"}
            </p>
          </div>
          <div className={`bg-background/50 border rounded-lg p-3 text-center ${avgVip > 0 && avgNormal > 0 ? (isFaster ? 'border-emerald-500/30' : 'border-destructive/30') : 'border-border/40'}`}>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t("ana.vipSummary")}</p>
            <p className={`text-sm font-mono font-bold mt-1 ${avgVip > 0 && avgNormal > 0 ? (isFaster ? 'text-emerald-400' : 'text-destructive') : 'text-muted-foreground'}`}>
              {avgVip > 0 && avgNormal > 0 
                ? `${isFaster ? t("ana.vipFaster") : t("ana.vipSlower")} ${diffStr}` 
                : "-"}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {filteredSessions.map((session) => {
            const sessionJobIds = session.jobId.split(",");
            const sessionJobs = jobs.filter(j => sessionJobIds.includes(j.id));
            const vehicle = vehicles.find(v => v.id === session.vehicleId);
            
            const totalMs = session.laps.reduce((acc, lap) => acc + lap.durationMs, 0);
            const totalEco = session.laps.reduce((acc, lap) => acc + lap.ecoEarned, 0);
            const lapCount = session.laps.length;
            
            const avgMsPerLap = lapCount > 0 ? totalMs / lapCount : 0;
            const ecoPerLap = lapCount > 0 ? totalEco / lapCount : 0;
            
            const ecoPerMs = totalMs > 0 ? totalEco / totalMs : 0;
            let estTimeStr = "N/A";
            if (ecoPerMs > 0 && targetGoal > 0) {
              const msNeeded = targetGoal / ecoPerMs;
              estTimeStr = formatHours(msNeeded);
            }

            const date = new Date(session.startTime).toLocaleDateString() + " " + new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            const isExpanded = expandedId === session.id;

            // Compute fastest/slowest based on farm mode
            const isDimensionSession = session.farmMode === 'dimension';
            const jobCount = sessionJobIds.length;
            
            let fastestLabel = "";
            let fastestMs = Infinity;
            let slowestLabel = "";
            let slowestMs = 0;

            if (isDimensionSession && jobCount > 0) {
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
              <div key={session.id} className="rounded-lg border border-border/40 overflow-hidden transition-all duration-200 hover:border-primary/30">
                {/* Summary Row - Clickable */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleExpand(session.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleExpand(session.id); } }}
                  className="group w-full flex items-center gap-3 px-4 py-3 bg-background/50 hover:bg-primary/5 transition-colors text-left cursor-pointer"
                >
                  <div className="shrink-0">
                    {isExpanded 
                      ? <ChevronUp className="w-4 h-4 text-primary" /> 
                      : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    }
                  </div>
                  
                  <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-6 gap-2 items-center">
                    {/* Date + Badges */}
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">{date}</span>
                      <div className="flex gap-1">
                        {session.jobCategory === 'animal' ? (
                          <span className="bg-amber-500/15 text-amber-400 text-[9px] px-1.5 py-0.5 rounded border border-amber-500/25 font-bold flex items-center gap-0.5">
                            <PawPrint className="w-2.5 h-2.5" />{t("ana.animalFarm")}
                          </span>
                        ) : (
                          <span className="bg-primary/10 text-primary text-[9px] px-1.5 py-0.5 rounded border border-primary/20 font-bold flex items-center gap-0.5">
                            <Briefcase className="w-2.5 h-2.5" />{t("ana.whiteJob")}
                          </span>
                        )}
                        {session.isVip && <span className="bg-amber-500/15 text-amber-400 text-[9px] px-1.5 py-0.5 rounded border border-amber-500/25 font-bold">VIP</span>}
                        {session.farmMode === 'dimension' && (
                          <span className="bg-primary/15 text-primary text-[9px] px-1.5 py-0.5 rounded border border-primary/25 font-bold">
                            {session.dimensionLoops} Loops
                          </span>
                        )}
                        {session.jobCategory === 'animal' && (
                          <span className="bg-amber-500/10 text-amber-400/70 text-[9px] px-1.5 py-0.5 rounded border border-amber-500/15 font-medium">
                            {t("ana.plannedTime")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Job */}
                    <div className="truncate">
                      {session.isCrafting ? (
                        <span className="text-foreground font-bold text-xs">{session.craftingName || t("ana.craftedRoute")}</span>
                      ) : sessionJobs.length > 0 ? (
                        <span className="text-foreground font-bold text-xs">{sessionJobs.map(j => j.name).join(", ")}</span>
                      ) : <span className="text-xs text-muted-foreground">{t("ana.unknown")}</span>}
                    </div>

                    {/* Vehicle */}
                    <div className="text-xs text-muted-foreground hidden md:block">{vehicle?.name || t("ana.unknown")}</div>

                    {/* Avg Time */}
                    <div className="font-mono text-[oklch(0.72_0.16_240)] font-bold text-xs hidden md:block">{formatTime(avgMsPerLap)}</div>

                    {/* Eco */}
                    <div className="font-bold text-emerald-400 text-xs hidden md:block">${Math.floor(ecoPerLap).toLocaleString()}</div>

                    {/* Est Time */}
                    <div className="font-bold text-foreground text-xs hidden md:block">{estTimeStr}</div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {lapCount} {lapCount === 1 ? 'lap' : 'laps'}
                    </span>
                    <button
                      onClick={(e) => handleShare(e, session)}
                      className={`p-1 rounded transition-colors opacity-0 group-hover:opacity-100 ${
                        copiedId === session.id || session.isPublic 
                        ? 'bg-primary/15 text-primary hover:bg-primary/20' 
                        : 'hover:bg-primary/10 text-muted-foreground hover:text-primary'
                      }`}
                      title={copiedId === session.id ? "Link Copied!" : session.isPublic ? "Copy Share Link (Public)" : "Share this session"}
                    >
                      {copiedId === session.id ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeSession(session.id); }}
                      className="p-1 rounded hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete this session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded Detail Panel */}
                {isExpanded && (
                  <div className="border-t border-border/30 bg-card/60 animate-in slide-in-from-top-1 fade-in duration-200">
                    {/* Session Summary Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 p-4">
                      <div className="p-2.5 bg-background/60 rounded-lg border border-border/30 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Layers className="w-3 h-3 text-primary" />
                          <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">{t("ana.totalLaps")}</span>
                        </div>
                        <p className="text-lg font-mono font-black text-primary">{lapCount}</p>
                      </div>
                      <div className="p-2.5 bg-background/60 rounded-lg border border-border/30 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Clock className="w-3 h-3 text-[oklch(0.72_0.16_240)]" />
                          <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">{t("ana.totalTime")}</span>
                        </div>
                        <p className="text-lg font-mono font-bold text-[oklch(0.72_0.16_240)]">{formatHours(totalMs)}</p>
                      </div>
                      <div className="p-2.5 bg-background/60 rounded-lg border border-border/30 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <DollarSign className="w-3 h-3 text-emerald-400" />
                          <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">{t("ana.totalEarned")}</span>
                        </div>
                        <p className="text-lg font-mono font-bold text-emerald-400">${totalEco.toLocaleString()}</p>
                      </div>
                      <div className="p-2.5 bg-emerald-500/5 rounded-lg border border-emerald-500/15 text-center">
                        <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">{t("ana.fastestLap")}</span>
                        <p className="text-sm font-mono font-bold text-emerald-400 mt-0.5">{formatTime(fastestMs)}</p>
                        {fastestLabel && <p className="text-[9px] text-emerald-400/70 mt-0.5 truncate">{fastestLabel}</p>}
                      </div>
                      <div className="p-2.5 bg-destructive/5 rounded-lg border border-destructive/15 text-center">
                        <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">{t("ana.slowestLap")}</span>
                        <p className="text-sm font-mono font-bold text-destructive mt-0.5">{formatTime(slowestMs)}</p>
                        {slowestLabel && <p className="text-[9px] text-destructive/70 mt-0.5 truncate">{slowestLabel}</p>}
                      </div>
                    </div>

                    {/* Lap-by-Lap Breakdown */}
                    <div className="px-4 pb-4">
                      <h4 className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2">
                        {session.jobCategory === 'animal' ? t("ana.yieldBreakdown") : t("ana.lapBreakdown")}
                      </h4>
                      <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                        {session.jobCategory === 'animal' ? (
                          session.laps[0]?.checkpoints && session.laps[0].checkpoints.length > 0 ? (
                            session.laps[0].checkpoints.map((cp: any, cpi: number) => (
                              <div key={cpi} className="flex justify-between text-xs p-2.5 bg-background/50 rounded-lg border border-border/25">
                                <span className="text-foreground font-semibold flex items-center gap-1.5">
                                  <PawPrint className="w-3.5 h-3.5 text-amber-400" /> {cp.name}
                                </span>
                                <div className="flex gap-4">
                                  <span className="text-muted-foreground font-mono">{cp.quantity} {t("ana.items")}</span>
                                  <span className="text-emerald-400 font-mono font-bold">${(cp.quantity * cp.pricePerItem).toLocaleString()}</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-muted-foreground italic">ไม่มีข้อมูลผลลัพธ์วัตถุดิบ</p>
                          )
                        ) : (
                          session.laps.map((lap, i) => {
                            const isDimension = session.farmMode === 'dimension';
                            const jobCount = sessionJobIds.length;
                            const cps = lap.checkpoints || [];

                            // Group checkpoints into loops (for dimension mode, each loop = jobCount checkpoints)
                            const loops: typeof cps[] = [];
                            if (isDimension && jobCount > 0 && cps.length > jobCount) {
                              for (let li = 0; li < cps.length; li += jobCount) {
                                loops.push(cps.slice(li, li + jobCount));
                              }
                            }

                            return (
                              <div key={lap.lapNumber} className="p-2.5 bg-background/50 rounded-lg border border-border/25 hover:border-primary/20 transition-colors">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-primary">{t("dash.lap")} {i + 1}</span>
                                    <span className="text-[10px] text-muted-foreground">({lap.itemsGathered} {t("dash.sets")})</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="font-mono text-xs font-bold">{formatTime(lap.durationMs)}</span>
                                    <span className="text-emerald-400 font-mono text-xs font-bold">${lap.ecoEarned.toLocaleString()}</span>
                                  </div>
                                </div>

                                {/* Dimension Mode: Group by Loop */}
                                {isDimension && loops.length > 0 ? (
                                  <div className="mt-2 space-y-2">
                                    {loops.map((loopCps, loopIdx) => {
                                      const loopTotalMs = loopCps.reduce((a, c) => a + c.durationMs, 0);
                                      return (
                                        <div key={loopIdx} className="rounded-md border border-primary/10 bg-primary/[0.03] overflow-hidden">
                                          {/* Loop Header */}
                                          <div className="flex items-center justify-between px-3 py-1.5 bg-primary/5 border-b border-primary/10">
                                            <div className="flex items-center gap-1.5">
                                              <Layers className="w-3 h-3 text-primary" />
                                              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                                                Loop {loopIdx + 1}
                                              </span>
                                            </div>
                                            <span className="text-[10px] font-mono font-bold text-muted-foreground">{formatTime(loopTotalMs)}</span>
                                          </div>
                                          {/* Per-Job in this Loop */}
                                          <div className="px-3 py-1.5 space-y-0.5">
                                            {loopCps.map((cp, ci) => {
                                              const jName = jobs.find(j => j.id === cp.jobId)?.name || cp.jobId;
                                              const pctOfLoop = loopTotalMs > 0 ? (cp.durationMs / loopTotalMs * 100) : 0;
                                              return (
                                                <div key={ci} className="flex items-center justify-between text-[11px] group/cp">
                                                  <span className="text-muted-foreground group-hover/cp:text-foreground transition-colors">{jName}</span>
                                                  <div className="flex items-center gap-2">
                                                    <div className="w-16 h-1 bg-border/30 rounded-full overflow-hidden hidden sm:block">
                                                      <div 
                                                        className="h-full bg-primary/50 rounded-full" 
                                                        style={{ width: `${Math.min(100, pctOfLoop)}%` }} 
                                                      />
                                                    </div>
                                                    <span className="font-mono text-muted-foreground">{formatTime(cp.durationMs)}</span>
                                                    <span className="text-[9px] text-muted-foreground/60 w-8 text-right">{pctOfLoop.toFixed(0)}%</span>
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
                                  /* City Mode: Flat checkpoint list */
                                  <div className="mt-2 pl-3 border-l-2 border-primary/15 space-y-0.5">
                                    {cps.map((cp, ci) => {
                                      const jName = jobs.find(j => j.id === cp.jobId)?.name || cp.jobId;
                                      const pctOfLap = lap.durationMs > 0 ? (cp.durationMs / lap.durationMs * 100) : 0;
                                      return (
                                        <div key={ci} className="flex items-center justify-between text-[11px] group/cp">
                                          <span className="text-muted-foreground group-hover/cp:text-foreground transition-colors">{jName}</span>
                                          <div className="flex items-center gap-2">
                                            <div className="w-16 h-1 bg-border/30 rounded-full overflow-hidden hidden sm:block">
                                              <div 
                                                className="h-full bg-primary/50 rounded-full" 
                                                style={{ width: `${Math.min(100, pctOfLap)}%` }} 
                                              />
                                            </div>
                                            <span className="font-mono text-muted-foreground">{formatTime(cp.durationMs)}</span>
                                            <span className="text-[9px] text-muted-foreground/60 w-8 text-right">{pctOfLap.toFixed(0)}%</span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : null}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
