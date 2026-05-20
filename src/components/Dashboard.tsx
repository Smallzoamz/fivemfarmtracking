"use client";

import { useState, useEffect, useRef } from "react";
import { useFarmStore } from "@/store/farmStore";
import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Timer, Settings, PawPrint, Briefcase } from "lucide-react";

export function Dashboard() {
  const { 
    presets, activePresetId, setActivePreset, updatePreset, addPreset, removePreset,
    jobs, vehicles, activeSession, startSession, stopSession, addLap, logAnimalSession 
  } = useFarmStore();

  const { t } = useTranslation();

  const activePreset = presets.find(p => p.id === activePresetId) || presets[0];
  
  const selectedJobIds = activePreset.selectedJobIds || [];
  const calcVehicleId = activePreset.calcVehicleId || "";
  const isCraftingRoute = activePreset.isCraftingRoute || false;
  const routeCraftingName = activePreset.routeCraftingName || "";
  const routeCraftingRatio = activePreset.routeCraftingRatio || 1;
  const routeCraftingPrice = activePreset.routeCraftingPrice || 0;
  const isVipMode = activePreset.isVipMode || false;
  const isProcessBeforeStore = activePreset.isProcessBeforeStore || false;
  const farmMode = activePreset.farmMode || 'city';
  const dimensionPocketLoops = activePreset.dimensionPocketLoops || 1;
  const dimensionYieldPerLoop = activePreset.dimensionYieldPerLoop || 10;

  const [isManagingPresets, setIsManagingPresets] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");

  // Timer State
  const [timerMs, setTimerMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Multi-Stage State
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [checkpoints, setCheckpoints] = useState<any[]>([]);
  const [currentLoop, setCurrentLoop] = useState(1);

  // Lap result & summary state
  const [lastLapResult, setLastLapResult] = useState<any | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState<any | null>(null);
  const [showActualYieldsDialog, setShowActualYieldsDialog] = useState(false);
  const [actualYields, setActualYields] = useState<any[]>([]);

  const checkpointsRef = useRef<any[]>([]);
  checkpointsRef.current = checkpoints;

  useEffect(() => {
    if (activeSession && isRunning) {
      timerRef.current = setInterval(() => {
        const lapsDone = activeSession.laps.reduce((acc, lap) => acc + lap.durationMs, 0);
        const cpDone = checkpointsRef.current.reduce((acc, cp) => acc + cp.durationMs, 0);
        setTimerMs(Date.now() - activeSession.startTime - lapsDone - cpDone);
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeSession, isRunning]);

  const calcJobs = jobs.filter(j => selectedJobIds.includes(j.id) && (j.presetId === activePresetId || (!j.presetId && activePresetId === 'default')));
  const calcWhiteJobs = calcJobs.filter(j => !j.jobCategory || j.jobCategory === 'white');
  const calcAnimalJobs = calcJobs.filter(j => j.jobCategory === 'animal');
  const selectedVehicle = vehicles.find(v => v.id === calcVehicleId && (v.presetId === activePresetId || (!v.presetId && activePresetId === 'default')));
  
  let trunkSets = 0;
  let pocketSets = 0;
  let totalSets = 0;
  let totalEco = 0;
  let minTotalEco = 0;
  let maxTotalEco = 0;
  let targetLapsLeft = 0;
  let targetMinLapsLeft = 0;
  let targetMaxLapsLeft = 0;
  let totalProcessedItems = 0;
  let targetDimensionLoops = 0;

  const hasAnyWhitePriceRange = calcJobs.some(j => j.hasPriceRange);

  if (calcJobs.length > 0 && (selectedVehicle || farmMode === 'dimension')) {
    const totalWeightPerSet = calcJobs.reduce((acc, j) => acc + j.itemWeight, 0);
    
    if (farmMode === 'dimension') {
      const vehicleLoops = selectedVehicle ? Math.floor(selectedVehicle.trunkCapacity / dimensionYieldPerLoop) : 0;
      targetDimensionLoops = dimensionPocketLoops + vehicleLoops;
      totalProcessedItems = targetDimensionLoops * dimensionYieldPerLoop;
      
      if (isCraftingRoute) {
        totalEco = totalProcessedItems * routeCraftingPrice;
        minTotalEco = totalEco;
        maxTotalEco = totalEco;
      } else {
        const batchJob = calcJobs.find(j => j.processingType === 'batch_to_one');
        if (batchJob) {
          let jobAvgPrice = batchJob.pricePerItem;
          let jobMinPrice = batchJob.pricePerItem;
          let jobMaxPrice = batchJob.pricePerItem;
          if (batchJob.hasPriceRange) {
            jobMinPrice = batchJob.minPricePerItem || 0;
            jobMaxPrice = batchJob.maxPricePerItem || 0;
            jobAvgPrice = (jobMinPrice + jobMaxPrice) / 2;
          }
          totalEco = totalProcessedItems * jobAvgPrice;
          minTotalEco = totalProcessedItems * jobMinPrice;
          maxTotalEco = totalProcessedItems * jobMaxPrice;
        } else {
          const lastJob = calcJobs[calcJobs.length - 1];
          if (lastJob) {
            let jobAvgPrice = lastJob.pricePerItem;
            let jobMinPrice = lastJob.pricePerItem;
            let jobMaxPrice = lastJob.pricePerItem;
            if (lastJob.hasPriceRange) {
              jobMinPrice = lastJob.minPricePerItem || 0;
              jobMaxPrice = lastJob.maxPricePerItem || 0;
              jobAvgPrice = (jobMinPrice + jobMaxPrice) / 2;
            }
            totalEco = totalProcessedItems * jobAvgPrice;
            minTotalEco = totalProcessedItems * jobMinPrice;
            maxTotalEco = totalProcessedItems * jobMaxPrice;
          }
        }
      }
      totalSets = totalProcessedItems; // For display purposes
      trunkSets = selectedVehicle ? vehicleLoops * dimensionYieldPerLoop : 0;
      pocketSets = dimensionPocketLoops * dimensionYieldPerLoop;
    } else if (totalWeightPerSet > 0) {
      trunkSets = selectedVehicle ? Math.floor(selectedVehicle.trunkCapacity / totalWeightPerSet) : 0;
      pocketSets = activePreset.jobItemLimit || 60;
      totalSets = trunkSets + pocketSets;

      if (isCraftingRoute) {
        if (isProcessBeforeStore) {
          totalProcessedItems = totalSets;
        } else {
          const ratio = Math.max(1, routeCraftingRatio);
          totalProcessedItems = Math.floor(totalSets / ratio);
        }
        totalEco = totalProcessedItems * routeCraftingPrice;
        minTotalEco = totalEco;
        maxTotalEco = totalEco;
      } else {
        calcJobs.forEach(job => {
          let jobAvgPrice = job.pricePerItem;
          let jobMinPrice = job.pricePerItem;
          let jobMaxPrice = job.pricePerItem;
          if (job.hasPriceRange) {
            jobMinPrice = job.minPricePerItem || 0;
            jobMaxPrice = job.maxPricePerItem || 0;
            jobAvgPrice = (jobMinPrice + jobMaxPrice) / 2;
          }

          if (job.processingType === 'batch_to_one') {
            if (isProcessBeforeStore) {
              totalProcessedItems += totalSets;
              totalEco += totalSets * jobAvgPrice;
              minTotalEco += totalSets * jobMinPrice;
              maxTotalEco += totalSets * jobMaxPrice;
            } else {
              const ratio = Math.max(1, job.processRatio || 1);
              const items = Math.floor(totalSets / ratio);
              totalProcessedItems += items;
              totalEco += items * jobAvgPrice;
              minTotalEco += items * jobMinPrice;
              maxTotalEco += items * jobMaxPrice;
            }
          } else {
            totalProcessedItems += totalSets;
            totalEco += totalSets * jobAvgPrice;
            minTotalEco += totalSets * jobMinPrice;
            maxTotalEco += totalSets * jobMaxPrice;
          }
        });
      }
    }

    if (totalEco > 0) {
      targetLapsLeft = Math.ceil((activePreset.targetGoal || 1000000) / totalEco);
    }
    if (maxTotalEco > 0) {
      targetMinLapsLeft = Math.ceil((activePreset.targetGoal || 1000000) / maxTotalEco);
    }
    if (minTotalEco > 0) {
      targetMaxLapsLeft = Math.ceil((activePreset.targetGoal || 1000000) / minTotalEco);
    } else {
      targetMaxLapsLeft = Infinity;
    }
  }

  // Animal Farming Calculations
  let animalMinEco = 0;
  let animalMaxEco = 0;
  let animalAvgEco = 0;
  let animalTotalTimeMs = 0;
  let animalMinWeight = 0;
  let animalMaxWeight = 0;
  let animalAvgWeight = 0;
  let animalLapsRequired = 0;
  let animalMinLapsRequired = 0;
  let animalMaxLapsRequired = 0;
  let animalAvgLapsRequired = 0;

  calcAnimalJobs.forEach(aj => {
    const rounds = aj.totalRounds || 1;
    const minutesPerRound = aj.minutesPerRound || 1;
    (aj.animalYields || []).forEach(y => {
      const chanceVal = y.chance !== undefined ? y.chance : 100;
      
      // Min: only 100% chance items
      const minQty = chanceVal === 100 ? y.quantityPerRound : 0;
      animalMinEco += y.pricePerItem * minQty;
      animalMinWeight += y.weight * minQty;

      // Max: all items drop
      const maxQty = y.quantityPerRound;
      animalMaxEco += y.pricePerItem * maxQty;
      animalMaxWeight += y.weight * maxQty;

      // Avg: based on probability
      const avgQty = y.quantityPerRound * (chanceVal / 100);
      animalAvgEco += y.pricePerItem * avgQty;
      animalAvgWeight += y.weight * avgQty;
    });
    animalTotalTimeMs += rounds * minutesPerRound * 60000;
  });

  const combinedTotalEco = totalEco + animalAvgEco;
  const combinedMinEco = totalEco + animalMinEco;
  const combinedMaxEco = totalEco + animalMaxEco;

  if (combinedTotalEco > 0) {
    animalAvgLapsRequired = Math.ceil((activePreset.targetGoal || 1000000) / combinedTotalEco);
    animalLapsRequired = animalAvgLapsRequired;
  }
  if (combinedMaxEco > 0) {
    animalMinLapsRequired = Math.ceil((activePreset.targetGoal || 1000000) / combinedMaxEco);
  }
  if (combinedMinEco > 0) {
    animalMaxLapsRequired = Math.ceil((activePreset.targetGoal || 1000000) / combinedMinEco);
  } else {
    animalMaxLapsRequired = Infinity;
  }


  const handleStartSession = () => {
    if (calcJobs.length === 0 || (!calcVehicleId && farmMode === 'city')) return;
    startSession(selectedJobIds.join(","), calcVehicleId, {
      isCrafting: isCraftingRoute,
      name: routeCraftingName || "Crafted Route Item",
      ratio: Math.max(1, routeCraftingRatio),
      price: routeCraftingPrice
    }, isVipMode, farmMode, targetDimensionLoops, calcAnimalJobs.length > 0 && calcWhiteJobs.length === 0 ? 'animal' : 'white');
    setTimerMs(0);
    setCurrentJobIndex(0);
    setCurrentLoop(1);
    setCheckpoints([]);
    setIsRunning(true);
    setLastLapResult(null);
    setShowSummary(false);
    setSummaryData(null);
  };

  const handleStopSession = () => {
    if (activeSession && activeSession.laps.length > 0) {
      const laps = activeSession.laps;
      const totalMs = laps.reduce((a, l) => a + l.durationMs, 0);
      const totalEarned = laps.reduce((a, l) => a + l.ecoEarned, 0);
      const totalMinEarned = laps.reduce((a, l) => a + (l.minEcoEarned !== undefined ? l.minEcoEarned : l.ecoEarned), 0);
      const totalMaxEarned = laps.reduce((a, l) => a + (l.maxEcoEarned !== undefined ? l.maxEcoEarned : l.ecoEarned), 0);
      const fastest = Math.min(...laps.map(l => l.durationMs));
      const slowest = Math.max(...laps.map(l => l.durationMs));
      setSummaryData({ laps, totalMs, totalEarned, totalMinEarned, totalMaxEarned, fastest, slowest, count: laps.length });
      setShowSummary(true);
    }
    stopSession();
    setIsRunning(false);
    setTimerMs(0);
    setCurrentJobIndex(0);
    setCheckpoints([]);
  };

  const handleNextJob = () => {
    if (!activeSession) return;
    const aJobIds = activeSession.jobId.split(",");
    const aJobs = jobs.filter(j => aJobIds.includes(j.id));
    const currentJob = aJobs[currentJobIndex];

    const newCp = { jobId: currentJob.id, durationMs: timerMs, itemsGathered: totalSets };
    const newCps = [...checkpoints, newCp];

    if (currentJobIndex < aJobs.length - 1) {
      setCheckpoints(newCps);
      setCurrentJobIndex(currentJobIndex + 1);
      setTimerMs(0);
    } else {
      // Finished all jobs in the sequence
      if (farmMode === 'dimension' && currentLoop < targetDimensionLoops) {
        setCheckpoints(newCps);
        setCurrentJobIndex(0);
        setCurrentLoop(currentLoop + 1);
        setTimerMs(0);
      } else {
        const lapMs = newCps.reduce((a, c) => a + c.durationMs, 0);
        const lapNum = activeSession.laps.length + 1;
        const lapId = crypto.randomUUID();
        addLap({ 
          id: lapId, 
          durationMs: lapMs, 
          itemsGathered: totalSets, 
          ecoEarned: totalEco, 
          minEcoEarned: minTotalEco, 
          maxEcoEarned: maxTotalEco, 
          checkpoints: newCps 
        });

        const finishedLap = { 
          id: lapId, 
          lapNumber: lapNum, 
          durationMs: lapMs, 
          itemsGathered: totalSets, 
          ecoEarned: totalEco, 
          minEcoEarned: minTotalEco, 
          maxEcoEarned: maxTotalEco, 
          checkpoints: newCps 
        };
        setLastLapResult(finishedLap);
        setCheckpoints([]);
        setCurrentJobIndex(0);
        setCurrentLoop(1);
        setTimerMs(0);

        // Always stop and show summary after each lap (which might be N loops in dimension mode)
        setTimeout(() => {
          const allLaps = [...activeSession.laps, finishedLap];
          const totalMs = allLaps.reduce((a, l) => a + l.durationMs, 0);
          const totalEarned = allLaps.reduce((a, l) => a + l.ecoEarned, 0);
          const totalMinEarned = allLaps.reduce((a, l) => a + (l.minEcoEarned !== undefined ? l.minEcoEarned : l.ecoEarned), 0);
          const totalMaxEarned = allLaps.reduce((a, l) => a + (l.maxEcoEarned !== undefined ? l.maxEcoEarned : l.ecoEarned), 0);
          const fastest = Math.min(...allLaps.map(l => l.durationMs));
          const slowest = Math.max(...allLaps.map(l => l.durationMs));
          setSummaryData({ 
            laps: allLaps, 
            totalMs, 
            totalEarned, 
            totalMinEarned, 
            totalMaxEarned, 
            fastest, 
            slowest, 
            count: allLaps.length 
          });
          setShowSummary(true);
          stopSession();
          setIsRunning(false);
          setTimerMs(0);
        }, 300);
      }
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatHours = (ms: number) => {
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const activeJobIds = activeSession?.jobId.split(",") || [];
  const activeJobs = jobs.filter(j => activeJobIds.includes(j.id));
  const currentActiveJob = activeJobs[currentJobIndex];
  
  const avgLapMs = activeSession && activeSession.laps.length > 0 
    ? activeSession.laps.reduce((acc, lap) => acc + lap.durationMs, 0) / activeSession.laps.length 
    : 0;
  
  const lapsLeftAvg = Math.max(0, targetLapsLeft - (activeSession?.laps.length || 0));
  const lapsLeftMin = Math.max(0, targetMinLapsLeft - (activeSession?.laps.length || 0));
  const lapsLeftMax = Math.max(0, targetMaxLapsLeft - (activeSession?.laps.length || 0));

  const estTimeMs = avgLapMs * lapsLeftAvg;
  const minEstTimeMs = avgLapMs * lapsLeftMin;
  const maxEstTimeMs = avgLapMs * lapsLeftMax;

  const toggleJobSelection = (id: string) => {
    const newIds = selectedJobIds.includes(id) ? selectedJobIds.filter(x => x !== id) : [...selectedJobIds, id];
    updatePreset(activePresetId, { selectedJobIds: newIds });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
      <Card className="col-span-1 border-border/50 bg-card/80 backdrop-blur-xl">
        <CardHeader className="pb-3 border-b border-border/30">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20"><Timer className="text-primary w-4 h-4" /></div>
            {t("dash.activeTimer")}
          </CardTitle>
          <CardDescription className="text-xs">{t("dash.activeTimerDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8 flex flex-col items-center justify-center min-h-[320px] relative overflow-hidden">
          {!activeSession ? (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">{t("dash.noSession")}</p>
              <Button onClick={handleStartSession} size="lg" disabled={selectedJobIds.length === 0 || !selectedVehicle} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 px-8">
                {t("dash.startRouteTimer")}
              </Button>
            </div>
          ) : (
            <>
              <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl scale-150 pointer-events-none animate-pulse-glow" />
              
              <div className="text-center space-y-3 relative z-10 w-full">
                <div className="flex flex-col items-center gap-2">
                  {activeSession.farmMode === 'dimension' && (
                    <div className="bg-primary/15 text-primary px-3 py-1 rounded-lg text-xs font-bold border border-primary/25">
                      {t("dash.loopProgress", { current: currentLoop, target: activeSession.dimensionLoops || 1 })}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground font-medium tracking-widest uppercase">
                    {activeJobs.length > 1 ? `${t("dash.timingStage")} ${currentActiveJob?.name}` : t("dash.routeTimer")}
                  </p>
                </div>
                <h2 className="text-6xl font-mono tracking-tighter tabular-nums text-foreground">
                  {formatTime(timerMs)}
                </h2>
              </div>

              <div className="flex gap-3 w-full max-w-sm relative z-10">
                <Button onClick={handleStopSession} variant="destructive" size="lg" className="w-1/3">
                  {t("dash.stop")}
                </Button>
                <Button onClick={handleNextJob} size="lg" className="w-2/3 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                  {currentJobIndex < activeJobs.length - 1 ? `${t("dash.next")}: ${activeJobs[currentJobIndex + 1]?.name}` : 
                   (activeSession.farmMode === 'dimension' && currentLoop < (activeSession.dimensionLoops || 1)) ? `${t("dash.next")} Loop (${currentLoop + 1})` : t("dash.finishRoute")}
                </Button>
              </div>

              {estTimeMs > 0 && (
                <div className="mt-6 p-3 bg-primary/5 border border-primary/15 rounded-lg relative z-10 text-center">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">{t("dash.estTime")}</p>
                  {hasAnyWhitePriceRange ? (
                    <>
                      <p className="text-xl font-black text-foreground">
                        {t("dash.approx")} {formatHours(minEstTimeMs)} - {formatHours(maxEstTimeMs)}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        ({t("dash.approxAverage")} {formatHours(estTimeMs)})
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        ({t("dash.approx")} {lapsLeftMin} - {lapsLeftMax} {t("dash.cyclesLeft")})
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-black text-foreground">
                        {formatHours(estTimeMs)}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">({lapsLeftAvg} {t("dash.cyclesLeft")})</p>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>

        {/* Last Lap Result Flash */}
        {lastLapResult && activeSession && (
          <div className="border-t border-emerald-500/20 bg-emerald-500/5 p-4 animate-in slide-in-from-bottom duration-300">
            <h4 className="text-xs font-bold text-emerald-400 mb-2">✅ {t("dash.lapComplete", lastLapResult.lapNumber)}</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-muted-foreground">{t("dash.lapTime")}:</span> <span className="font-mono font-bold">{formatTime(lastLapResult.durationMs)}</span></div>
              <div>
                <span className="text-muted-foreground">{t("dash.earned")}:</span>{" "}
                {lastLapResult.minEcoEarned !== undefined && lastLapResult.maxEcoEarned !== undefined && lastLapResult.minEcoEarned !== lastLapResult.maxEcoEarned ? (
                  <span className="font-mono font-bold text-emerald-400">
                    ${lastLapResult.minEcoEarned.toLocaleString()} - ${lastLapResult.maxEcoEarned.toLocaleString()}{" "}
                    <span className="text-[9px] text-muted-foreground font-normal">({t("dash.approxAverage")} ${lastLapResult.ecoEarned.toLocaleString()})</span>
                  </span>
                ) : (
                  <span className="font-mono font-bold text-emerald-400">${lastLapResult.ecoEarned.toLocaleString()}</span>
                )}
              </div>
            </div>
            {lastLapResult.checkpoints && lastLapResult.checkpoints.length > 1 && (
              <div className="mt-2 space-y-1">
                {lastLapResult.checkpoints.map((cp: any, i: number) => {
                  const jobName = jobs.find(j => j.id === cp.jobId)?.name || cp.jobId;
                  return (
                    <div key={i} className="flex justify-between text-xs p-1.5 bg-card rounded">
                      <span className="text-muted-foreground">{jobName}</span>
                      <span className="font-mono">{formatTime(cp.durationMs)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Lap History with per-job breakdown */}
        {activeSession && activeSession.laps.length > 0 && (
          <div className="border-t border-border/30 bg-card/50 p-4">
            <h4 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">{t("dash.checkpointsRecorded")}:</h4>
            <div className="space-y-1.5">
              {[...activeSession.laps].reverse().map((lap, i) => (
                <div key={lap.lapNumber} className="text-xs p-2.5 bg-background/50 rounded-lg border border-border/30 hover:border-primary/20 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-primary">{t("dash.lap")} {activeSession.laps.length - i}</span>
                      <span className="text-muted-foreground ml-2">({lap.itemsGathered} {t("dash.sets")})</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold">{formatTime(lap.durationMs)}</span>
                      {lap.minEcoEarned !== undefined && lap.maxEcoEarned !== undefined && lap.minEcoEarned !== lap.maxEcoEarned ? (
                        <span className="text-emerald-400 ml-2 font-bold font-mono">
                          ${lap.minEcoEarned.toLocaleString()} - ${lap.maxEcoEarned.toLocaleString()}{" "}
                          <span className="text-[9px] text-muted-foreground font-normal">({t("dash.approxAverage")} ${lap.ecoEarned.toLocaleString()})</span>
                        </span>
                      ) : (
                        <span className="text-emerald-400 ml-2 font-bold font-mono">${lap.ecoEarned.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  {lap.checkpoints && lap.checkpoints.length > 1 && (
                    <div className="mt-1.5 space-y-0.5 pl-2 border-l-2 border-primary/15">
                      {lap.checkpoints.map((cp, ci) => {
                        const jName = jobs.find(j => j.id === cp.jobId)?.name || cp.jobId;
                        return (
                          <div key={ci} className="flex justify-between text-[11px] text-muted-foreground">
                            <span>{jName}</span>
                            <span className="font-mono">{formatTime(cp.durationMs)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Card className="col-span-1 xl:col-span-2 border-border/50 bg-card/80 backdrop-blur-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20"><Settings className="text-primary w-4 h-4" /></div>
            {t("dash.planner")}
          </CardTitle>
          <CardDescription className="text-xs">{t("dash.plannerDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="p-3 bg-background/50 border border-border/40 rounded-lg space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-primary font-bold uppercase tracking-wider">{t("dash.preset")}</Label>
                <div className="flex items-center gap-2">
                  <Select value={activePresetId} onValueChange={(val) => { setActivePreset(val || "default"); }}>
                    <SelectTrigger className="w-[180px] h-9 text-sm">
                      <SelectValue>
                        {(val) => {
                          const preset = presets.find(p => p.id === val);
                          return preset ? preset.name : (val || "Select City...");
                        }}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {presets.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setIsManagingPresets(!isManagingPresets)}>
                    <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            </div>

            {isManagingPresets && (
              <div className="pt-3 border-t border-border/30 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex gap-2">
                  <Input placeholder="New City Name..." value={newPresetName} onChange={(e) => setNewPresetName(e.target.value)} className="h-9 text-sm" />
                  <Button size="sm" onClick={() => { if (newPresetName) { addPreset(newPresetName); setNewPresetName(""); } }}>Add</Button>
                </div>
                {presets.length > 1 && (
                  <div className="flex gap-2 items-center">
                    <span className="text-xs text-muted-foreground">Delete current city:</span>
                    <Button variant="destructive" size="sm" onClick={() => removePreset(activePresetId)} disabled={activePresetId === 'default'}>Delete</Button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 p-3 bg-background/50 rounded-lg border border-border/40">
              <Label className="text-xs text-primary font-bold uppercase tracking-wider">{t("dash.targetGoal")}</Label>
              <Input type="number" value={activePreset.targetGoal} onChange={(e) => updatePreset(activePresetId, { targetGoal: Number(e.target.value) })} className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5 p-3 bg-background/50 rounded-lg border border-border/40">
              <Label className="text-xs text-primary font-bold uppercase tracking-wider">{t("dash.jobLimit")}</Label>
              <Input type="number" value={activePreset.jobItemLimit} onChange={(e) => updatePreset(activePresetId, { jobItemLimit: Number(e.target.value) })} className="h-9 text-sm" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider">{t("dash.selectJobs")}</Label>
            {jobs.filter(j => !j.presetId || j.presetId === activePresetId || j.presetId === 'default').length === 0 ? (
              <p className="text-xs text-destructive">{t("dash.addJobsHint")}</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
              {jobs.filter(j => j.presetId === activePresetId || (!j.presetId && activePresetId === 'default')).map(job => (
                  <Button
                    key={job.id}
                    variant={selectedJobIds.includes(job.id) ? "default" : "outline"}
                    size="sm"
                    className={`justify-start truncate text-xs transition-all gap-1 ${selectedJobIds.includes(job.id) 
                      ? job.jobCategory === 'animal' 
                        ? "bg-amber-600 text-white shadow-md shadow-amber-600/20 hover:bg-amber-600/90" 
                        : "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                      : "opacity-60 hover:opacity-100"}`}
                    onClick={() => toggleJobSelection(job.id)}
                  >
                    {job.jobCategory === 'animal' && <PawPrint className="w-3 h-3 shrink-0" />}
                    {job.name}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {selectedJobIds.length > 1 && (
            <div className="space-y-3 p-3 bg-background/50 border border-border/40 rounded-lg">
              <div className="flex items-center space-x-2">
                <Switch id="crafting-mode" checked={isCraftingRoute} onCheckedChange={(val) => updatePreset(activePresetId, { isCraftingRoute: val })} />
                <Label htmlFor="crafting-mode" className="text-xs text-primary font-semibold">{t("dash.craftToggle")}</Label>
              </div>
              
              {isCraftingRoute && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-border/30">
                  <div className="space-y-1">
                    <Label className="text-xs">{t("dash.finalName")}</Label>
                    <Input value={routeCraftingName} onChange={(e) => updatePreset(activePresetId, { routeCraftingName: e.target.value })} placeholder="e.g. Mixed Fruit" className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t("dash.setsRatio")}</Label>
                    <Input type="number" value={routeCraftingRatio} onChange={(e) => updatePreset(activePresetId, { routeCraftingRatio: Number(e.target.value) })} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t("dash.finalPrice")}</Label>
                    <Input type="number" value={routeCraftingPrice} onChange={(e) => updatePreset(activePresetId, { routeCraftingPrice: Number(e.target.value) })} className="h-9 text-sm" />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
            <div className="flex items-center space-x-2">
              <Switch id="vip-mode" checked={isVipMode} onCheckedChange={(val) => updatePreset(activePresetId, { isVipMode: val })} />
              <Label htmlFor="vip-mode" className="text-xs text-amber-400 font-semibold">{t("dash.vipMode")}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="process-before-store-mode" checked={isProcessBeforeStore} onCheckedChange={(val) => updatePreset(activePresetId, { isProcessBeforeStore: val })} />
              <Label htmlFor="process-before-store-mode" className="text-xs text-primary font-semibold">{t("dash.processBeforeStore")}</Label>
            </div>
          </div>

          <div className="p-3 bg-background/50 border border-border/40 rounded-lg space-y-3">
            <div className="flex flex-col space-y-1.5">
              <Label className="text-xs text-primary font-bold uppercase tracking-wider">{t("dash.farmMode")}</Label>
              <div className="flex gap-1.5">
                <Button 
                  variant={farmMode === 'city' ? "default" : "outline"} 
                  size="sm"
                  onClick={() => updatePreset(activePresetId, { farmMode: 'city' })}
                  className={`text-xs ${farmMode === 'city' ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "opacity-60 hover:opacity-100"}`}
                >
                  {t("dash.cityMode")}
                </Button>
                <Button 
                  variant={farmMode === 'dimension' ? "default" : "outline"} 
                  size="sm"
                  onClick={() => updatePreset(activePresetId, { farmMode: 'dimension' })}
                  className={`text-xs ${farmMode === 'dimension' ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "opacity-60 hover:opacity-100"}`}
                >
                  {t("dash.dimensionMode")}
                </Button>
              </div>
            </div>

            {farmMode === 'dimension' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-border/30">
                <div className="space-y-1">
                  <Label className="text-xs">{t("dash.pocketLoops")}</Label>
                  <Input 
                    type="number" 
                    value={dimensionPocketLoops} 
                    onChange={(e) => updatePreset(activePresetId, { dimensionPocketLoops: Math.max(1, Number(e.target.value)) })} 
                    className="h-9 text-sm" 
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t("dash.yieldPerLoop")}</Label>
                  <Input 
                    type="number" 
                    value={dimensionYieldPerLoop} 
                    onChange={(e) => updatePreset(activePresetId, { dimensionYieldPerLoop: Math.max(1, Number(e.target.value)) })} 
                    className="h-9 text-sm" 
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider">{t("dash.selectVehicle")}</Label>
            <Select value={calcVehicleId} onValueChange={(val) => updatePreset(activePresetId, { calcVehicleId: val || "" })}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder={t("dash.selectVehicle")}>
                  {(val) => {
                    const vehicle = vehicles.find(v => v.id === val);
                    return vehicle ? `${vehicle.name} (${vehicle.trunkCapacity}kg)` : (val || t("dash.selectVehicle"));
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {vehicles.filter(v => v.presetId === activePresetId || (!v.presetId && activePresetId === 'default')).map(v => <SelectItem key={v.id} value={v.id}>{v.name} ({v.trunkCapacity}kg)</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {selectedVehicle && selectedJobIds.length > 0 && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-background/50 rounded-lg border border-border/40">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t("dash.trunkAllocation")}</p>
                <p className="text-2xl font-mono font-bold text-[oklch(0.72_0.16_240)] mt-1">{trunkSets} <span className="text-xs font-sans text-muted-foreground font-normal">{t("dash.sets")}</span></p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{t("dash.itemsTrunk")}</p>
              </div>
              <div className="p-3 bg-background/50 rounded-lg border border-border/40">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Pocket Allocation</p>
                <p className="text-2xl font-mono font-bold text-amber-400 mt-1">{pocketSets} <span className="text-xs font-sans text-muted-foreground font-normal">{t("dash.sets")}</span></p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{t("dash.itemsPocket")}</p>
              </div>
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-transparent pointer-events-none" />
                <p className="text-[10px] text-primary uppercase font-bold tracking-wider relative">{t("dash.maxTargetSets")}</p>
                <p className="text-3xl font-mono font-black text-primary mt-1 relative">{totalSets}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 relative">{t("dash.setsPerLap")}</p>
              </div>
              
              <div className="col-span-1 sm:col-span-3 p-2.5 bg-primary/5 rounded-lg border border-primary/15 text-center">
                <p className="text-xs text-primary/70 font-medium">{t("dash.gatherHint", totalSets)}</p>
              </div>

              <div className="col-span-1 sm:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                <div className="p-3 bg-background/50 rounded-lg border border-border/40">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{isCraftingRoute ? t("dash.routeYield") : t("dash.batchYield")}</p>
                  <p className="text-xl font-mono font-bold text-foreground mt-1">{totalProcessedItems}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{isCraftingRoute ? t("dash.craftedItem") : t("dash.items")}</p>
                </div>
                <div className="p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                  <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">{t("dash.ecoPerLap")}</p>
                  {hasAnyWhitePriceRange ? (
                    <>
                      <p className="text-base font-mono font-bold text-emerald-400 mt-1">
                        ${minTotalEco.toLocaleString()} - ${maxTotalEco.toLocaleString()}
                      </p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">
                        ({t("dash.approxAverage")} ${totalEco.toLocaleString()})
                      </p>
                    </>
                  ) : (
                    <p className="text-xl font-mono font-bold text-emerald-400 mt-1">${totalEco.toLocaleString()}</p>
                  )}
                </div>
                <div className="p-3 bg-[oklch(0.72_0.16_240/0.05)] rounded-lg border border-[oklch(0.72_0.16_240/0.2)]">
                  <p className="text-[10px] text-[oklch(0.72_0.16_240)] uppercase font-bold tracking-wider">{t("dash.lapsRequired")}</p>
                  {hasAnyWhitePriceRange ? (
                    <>
                      <p className="text-base font-mono font-bold text-[oklch(0.72_0.16_240)] mt-1">
                        {targetMinLapsLeft} - {targetMaxLapsLeft}
                      </p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">
                        ({t("dash.approx")} {targetLapsLeft} {t("dash.cyclesLeft")})
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-xl font-mono font-bold text-[oklch(0.72_0.16_240)] mt-1">{targetLapsLeft}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{t("dash.cyclesLeft")}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}          {/* Animal Farming Stats (shown when animal jobs are selected) */}
          {calcAnimalJobs.length > 0 && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <PawPrint className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">{t("dash.animalFarm")}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-amber-500/5 rounded-lg border border-amber-500/20">
                  <p className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">{t("dash.animalEcoPerRound")}</p>
                  <p className="text-2xl font-mono font-bold text-amber-400 mt-1">${Math.round(animalAvgEco).toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 flex flex-col">
                    <span>{t("dash.minEco")}: ${Math.round(animalMinEco).toLocaleString()}</span>
                    <span>{t("dash.maxEco")}: ${Math.round(animalMaxEco).toLocaleString()}</span>
                  </p>
                </div>
                <div className="p-3 bg-amber-500/5 rounded-lg border border-amber-500/20">
                  <p className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">{t("dash.animalTotalTime")}</p>
                  <p className="text-2xl font-mono font-bold text-amber-400 mt-1">{Math.round(animalTotalTimeMs / 60000)}m</p>
                </div>
                <div className="p-3 bg-amber-500/5 rounded-lg border border-amber-500/20">
                  <p className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">{t("dash.animalTotalRounds")}</p>
                  <p className="text-2xl font-mono font-bold text-amber-400 mt-1">{calcAnimalJobs.reduce((a, j) => a + (j.totalRounds || 1), 0)}</p>
                </div>
              </div>

              {/* Animal yield details */}
              <div className="space-y-1.5">
                {calcAnimalJobs.map(aj => (
                  <div key={aj.id} className="p-2.5 bg-background/50 rounded-lg border border-border/30">
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <PawPrint className="w-3 h-3 text-amber-400" /> {aj.name}
                      <span className="text-muted-foreground font-normal">
                        ({t("dash.animalSummaryText", aj.animalsPerRound?.toString() || "0", aj.totalRounds?.toString() || "0", aj.minutesPerRound?.toString() || "0")})
                      </span>
                    </p>
                    {(aj.animalYields || []).map((y, yi) => (
                      <div key={yi} className="flex justify-between text-[11px] text-muted-foreground mt-1 ml-4">
                        <span>{y.name} ({y.quantityPerRound} {t("ana.items")}, {y.weight}kg, {t("conf.yieldChance")}: {y.chance !== undefined ? y.chance : 100}%)</span>
                        <span className="text-amber-400 font-mono">${(y.pricePerItem * y.quantityPerRound).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Combined eco summary */}
              {calcWhiteJobs.length > 0 && (
                <div className="p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/20 text-center">
                  <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">รายได้รวม (งานขาว + เลี้ยงสัตว์)</p>
                  <p className="text-3xl font-mono font-black text-emerald-400 mt-1">${Math.round(combinedTotalEco).toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {animalMinLapsRequired === animalMaxLapsRequired 
                      ? `${animalAvgLapsRequired} รอบถึงเป้าหมาย` 
                      : `${animalMinLapsRequired} - ${animalMaxLapsRequired} รอบถึงเป้าหมาย (เฉลี่ย ${animalAvgLapsRequired} รอบ)}`}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    ช่วงรายได้: ${Math.round(combinedMinEco).toLocaleString()} - ${Math.round(combinedMaxEco).toLocaleString()}
                  </p>
                </div>
              )}

              {/* Log Animal Session Button (only if NO white jobs or separate logging) */}
              {calcWhiteJobs.length === 0 && !activeSession && (
                <Button 
                  onClick={() => {
                    if (!calcVehicleId) return;
                    const initialYields = calcAnimalJobs.flatMap(aj => 
                      (aj.animalYields || []).map(y => ({
                        jobId: aj.id,
                        jobName: aj.name,
                        yieldName: y.name,
                        baseQuantity: y.quantityPerRound,
                        quantity: y.quantityPerRound,
                        pricePerItem: y.pricePerItem,
                        weight: y.weight
                      }))
                    );
                    setActualYields(initialYields);
                    setShowActualYieldsDialog(true);
                  }} 
                  size="lg" 
                  disabled={!calcVehicleId}
                  className="w-full bg-amber-600 hover:bg-amber-600/90 text-white shadow-lg shadow-amber-600/20"
                >
                  <PawPrint className="w-4 h-4 mr-2" />
                  {t("dash.logAnimalSession")}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Summary Overlay */}
      {showSummary && summaryData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-card border border-border/60 rounded-xl shadow-2xl shadow-primary/10 p-6 max-w-md w-full mx-4 animate-in zoom-in-95 duration-300">
            <h2 className="text-xl font-black text-center mb-0.5 text-foreground">
              {summaryData.totalEarned >= (activePreset?.targetGoal || 1000000) ? t("dash.goalReached") : t("dash.summaryTitle")}
            </h2>
            <p className="text-center text-muted-foreground text-xs mb-5">{t("dash.summaryTitle")}</p>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-primary/8 rounded-lg p-3 text-center border border-primary/15">
                <p className="text-[10px] text-primary uppercase font-bold tracking-wider">{t("dash.totalLaps")}</p>
                <p className="text-2xl font-mono font-black text-foreground mt-1">{summaryData.count}</p>
              </div>
              <div className="bg-emerald-500/5 rounded-lg p-3 text-center border border-emerald-500/15">
                <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">{t("dash.totalEarned")}</p>
                {summaryData.totalMinEarned !== undefined && summaryData.totalMaxEarned !== undefined && summaryData.totalMinEarned !== summaryData.totalMaxEarned ? (
                  <div className="mt-1">
                    <p className="text-lg font-mono font-black text-emerald-400">
                      ${summaryData.totalMinEarned.toLocaleString()} - ${summaryData.totalMaxEarned.toLocaleString()}
                    </p>
                    <p className="text-[9px] text-muted-foreground">
                      ({t("dash.approxAverage")} ${summaryData.totalEarned.toLocaleString()})
                    </p>
                  </div>
                ) : (
                  <p className="text-2xl font-mono font-black text-emerald-400 mt-1">${summaryData.totalEarned.toLocaleString()}</p>
                )}
              </div>
              <div className="bg-[oklch(0.72_0.16_240/0.05)] rounded-lg p-3 text-center border border-[oklch(0.72_0.16_240/0.15)]">
                <p className="text-[10px] text-[oklch(0.72_0.16_240)] uppercase font-bold tracking-wider">{t("dash.totalTime")}</p>
                <p className="text-lg font-mono font-bold text-[oklch(0.72_0.16_240)] mt-1">{formatHours(summaryData.totalMs)}</p>
              </div>
              <div className="bg-background/50 rounded-lg p-3 text-center border border-border/40">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t("dash.avgLapTime")}</p>
                <p className="text-lg font-mono font-bold text-foreground mt-1">{formatTime(summaryData.totalMs / summaryData.count)}</p>
              </div>
            </div>

            <div className="flex gap-3 mb-4">
              <div className="flex-1 p-2.5 bg-emerald-500/5 rounded-lg text-center border border-emerald-500/10">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("dash.fastestLap")}</p>
                <p className="font-mono font-bold text-emerald-400 text-sm mt-0.5">{formatTime(summaryData.fastest)}</p>
              </div>
              <div className="flex-1 p-2.5 bg-destructive/5 rounded-lg text-center border border-destructive/10">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("dash.slowestLap")}</p>
                <p className="font-mono font-bold text-destructive text-sm mt-0.5">{formatTime(summaryData.slowest)}</p>
              </div>
            </div>

            <div className="max-h-36 overflow-y-auto space-y-1 mb-5">
              {summaryData.laps.map((lap: any, i: number) => (
                <div key={i} className="flex justify-between text-xs p-2 bg-background/50 rounded-lg border border-border/20">
                  <span className="text-primary font-semibold">{t("dash.lap")} {i + 1}</span>
                  <div className="flex gap-3 items-center">
                    <span className="font-mono">{formatTime(lap.durationMs)}</span>
                    {lap.minEcoEarned !== undefined && lap.maxEcoEarned !== undefined && lap.minEcoEarned !== lap.maxEcoEarned ? (
                      <span className="text-emerald-400 font-mono">
                        ${lap.minEcoEarned.toLocaleString()} - ${lap.maxEcoEarned.toLocaleString()}{" "}
                        <span className="text-[9px] text-muted-foreground font-normal">({t("dash.approxAverage")} ${lap.ecoEarned.toLocaleString()})</span>
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-mono">${lap.ecoEarned.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={() => { setShowSummary(false); setSummaryData(null); setLastLapResult(null); }} size="lg" className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
              {t("dash.closeSummary")}
            </Button>
          </div>
        </div>
      )}

      {/* Confirm Actual Yields Dialog */}
      {showActualYieldsDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-card border border-border/60 rounded-xl shadow-2xl shadow-primary/10 p-6 max-w-md w-full mx-4 animate-in zoom-in-95 duration-300">
            <h2 className="text-lg font-black text-foreground mb-1">
              {t("dash.actualYieldsTitle")}
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              {t("dash.actualYieldsDesc")}
            </p>
            
            <div className="max-h-60 overflow-y-auto space-y-4 mb-6 pr-1">
              {calcAnimalJobs.map(aj => {
                const jobYields = actualYields.filter(y => y.jobId === aj.id);
                if (jobYields.length === 0) return null;
                return (
                  <div key={aj.id} className="space-y-2">
                    <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1">
                      <PawPrint className="w-3.5 h-3.5" /> {aj.name}
                    </h4>
                    <div className="space-y-2 pl-3 border-l border-amber-500/20">
                      {jobYields.map((y, idx) => {
                        const globalIdx = actualYields.findIndex(ay => ay.jobId === aj.id && ay.yieldName === y.yieldName);
                        return (
                          <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate text-foreground">{y.yieldName}</p>
                              <p className="text-[10px] text-muted-foreground font-mono">
                                Base: {y.baseQuantity} | Expected: {y.quantity} (${y.pricePerItem}/ea)
                              </p>
                            </div>
                            <div className="w-24">
                              <Input
                                type="number"
                                min="0"
                                value={y.quantity}
                                onChange={(e) => {
                                  const val = Math.max(0, Number(e.target.value));
                                  const updated = [...actualYields];
                                  updated[globalIdx] = { ...updated[globalIdx], quantity: val };
                                  setActualYields(updated);
                                }}
                                className="h-8 text-xs font-mono text-right"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowActualYieldsDialog(false);
                  setActualYields([]);
                }}
                className="flex-1"
              >
                {t("dash.cancel")}
              </Button>
              <Button
                onClick={() => {
                  if (!calcVehicleId) return;
                  
                  // Calculate total eco based on actual yields
                  const totalActualEco = actualYields.reduce((acc, y) => acc + (y.quantity * y.pricePerItem), 0);
                  
                  logAnimalSession(
                    calcAnimalJobs.map(j => j.id).join(','),
                    calcVehicleId,
                    totalActualEco,
                    animalTotalTimeMs,
                    isVipMode,
                    actualYields.map(y => ({
                      name: y.yieldName,
                      quantity: y.quantity,
                      pricePerItem: y.pricePerItem
                    }))
                  );
                  
                  setShowActualYieldsDialog(false);
                  setActualYields([]);
                }}
                className="flex-1 bg-amber-600 hover:bg-amber-600/90 text-white shadow-lg shadow-amber-600/20"
              >
                {t("dash.logAndSave")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
