"use client";

import { useState } from "react";
import { useFarmStore, Job, Vehicle, AnimalYield } from "@/store/farmStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Briefcase, Truck, Settings, PawPrint, X } from "lucide-react";

const emptyYield: AnimalYield = { name: "", weight: 0, pricePerItem: 0, quantityPerRound: 0, chance: 100 };

export function Configurator() {
  const { presets, activePresetId, setActivePreset, addPreset, removePreset, jobs, vehicles, addJob, removeJob, addVehicle, removeVehicle } = useFarmStore();
  const { t } = useTranslation();

  const [jobCategory, setJobCategory] = useState<'white' | 'animal'>('white');
  const [newJob, setNewJob] = useState({
    name: "",
    pricePerItem: 0,
    minPricePerItem: 0,
    maxPricePerItem: 0,
    hasPriceRange: false,
    itemWeight: 0,
    processingType: 'none' as 'none' | 'one_to_one' | 'batch_to_one',
    processRatio: 1,
    finalItemName: ""
  });
  const [animalFields, setAnimalFields] = useState({ animalsPerRound: 1, totalRounds: 1, minutesPerRound: 5 });
  const [animalYields, setAnimalYields] = useState<AnimalYield[]>([{ ...emptyYield }]);
  const [newVehicle, setNewVehicle] = useState({ name: "", trunkCapacity: 0 });
  const [isManagingPresets, setIsManagingPresets] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");

  const handleAddJob = () => {
    if (!newJob.name) return;

    if (jobCategory === 'animal') {
      addJob({
        id: Date.now().toString(),
        presetId: activePresetId,
        name: newJob.name,
        pricePerItem: 0,
        itemWeight: 0,
        processingType: 'none',
        processRatio: 1,
        finalItemName: "",
        jobCategory: 'animal',
        animalsPerRound: animalFields.animalsPerRound,
        totalRounds: animalFields.totalRounds,
        minutesPerRound: animalFields.minutesPerRound,
        animalYields: animalYields.filter(y => y.name.trim() !== "").map(y => ({
          ...y,
          chance: y.chance !== undefined ? Number(y.chance) : 100
        }))
      });
      setAnimalFields({ animalsPerRound: 1, totalRounds: 1, minutesPerRound: 5 });
      setAnimalYields([{ ...emptyYield }]);
    } else {
      addJob({
        id: Date.now().toString(),
        presetId: activePresetId,
        ...newJob,
        jobCategory: 'white'
      });
    }
    setNewJob({
      name: "",
      pricePerItem: 0,
      minPricePerItem: 0,
      maxPricePerItem: 0,
      hasPriceRange: false,
      itemWeight: 0,
      processingType: 'none',
      processRatio: 1,
      finalItemName: ""
    });
  };

  const handleAddVehicle = () => {
    if (!newVehicle.name) return;
    addVehicle({
      id: Date.now().toString(),
      presetId: activePresetId,
      name: newVehicle.name,
      trunkCapacity: newVehicle.trunkCapacity,
    });
    setNewVehicle({ name: "", trunkCapacity: 0 });
  };

  const updateYield = (index: number, field: keyof AnimalYield, value: string | number) => {
    const updated = [...animalYields];
    updated[index] = { ...updated[index], [field]: value };
    setAnimalYields(updated);
  };

  const addYieldRow = () => setAnimalYields([...animalYields, { ...emptyYield }]);
  const removeYieldRow = (index: number) => setAnimalYields(animalYields.filter((_, i) => i !== index));

  const filteredJobs = jobs.filter(j => j.presetId === activePresetId || (!j.presetId && activePresetId === 'default'));
  const whiteJobs = filteredJobs.filter(j => !j.jobCategory || j.jobCategory === 'white');
  const animalJobs = filteredJobs.filter(j => j.jobCategory === 'animal');

  return (
    <div className="space-y-5">
      <Card className="border-border/50 bg-card/80 backdrop-blur-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20"><Briefcase className="text-primary w-4 h-4" /></div>
            {t("conf.jobSetup")}
          </CardTitle>
          <CardDescription className="text-xs">{t("conf.jobDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-background/50 border border-border/40 rounded-lg space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-primary font-bold uppercase tracking-wider">{t("dash.preset")}</Label>
                <div className="flex items-center gap-2">
                  <Select value={activePresetId} onValueChange={(val) => setActivePreset(val || "default")}>
                    <SelectTrigger className="w-[180px] h-9 text-sm">
                      <SelectValue placeholder="Select City..." />
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

          {/* Job Category Toggle */}
          <div className="flex gap-1.5">
            <Button
              variant={jobCategory === 'white' ? "default" : "outline"}
              size="sm"
              onClick={() => setJobCategory('white')}
              className={`text-xs gap-1.5 ${jobCategory === 'white' ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "opacity-60 hover:opacity-100"}`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              {t("conf.whiteJob")}
            </Button>
            <Button
              variant={jobCategory === 'animal' ? "default" : "outline"}
              size="sm"
              onClick={() => setJobCategory('animal')}
              className={`text-xs gap-1.5 ${jobCategory === 'animal' ? "bg-amber-600 text-white shadow-md shadow-amber-600/20 hover:bg-amber-600/90" : "opacity-60 hover:opacity-100"}`}
            >
              <PawPrint className="w-3.5 h-3.5" />
              {t("conf.animalFarm")}
            </Button>
          </div>

          {/* Job Form */}
          {jobCategory === 'white' ? (
            /* White Job Form (existing) */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border border-border/40 p-3 rounded-lg bg-background/50">
              <div className="space-y-1">
                <Label className="text-xs">{t("conf.jobName")}</Label>
                <Input value={newJob.name} onChange={(e) => setNewJob({...newJob, name: e.target.value})} placeholder="e.g. Weed/Gold" className="h-9 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t("conf.itemWeight")}</Label>
                <Input type="number" value={newJob.itemWeight || ""} onChange={(e) => setNewJob({...newJob, itemWeight: Number(e.target.value)})} className="h-9 text-sm" />
              </div>
              <div className="space-y-1">
                 <Label className="text-xs">{t("conf.procType")}</Label>
                 <Select value={newJob.processingType} onValueChange={(v: any) => setNewJob({...newJob, processingType: v})}>
                   <SelectTrigger className="h-9 text-sm">
                     <SelectValue placeholder={t("conf.procType")} />
                   </SelectTrigger>
                   <SelectContent>
                    <SelectItem value="none">{t("conf.typeRaw")}</SelectItem>
                    <SelectItem value="one_to_one">{t("conf.typeOneToOne")}</SelectItem>
                    <SelectItem value="batch_to_one">{t("conf.typeBatch")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 md:col-span-2 py-1">
                <input
                  type="checkbox"
                  id="hasPriceRange"
                  checked={newJob.hasPriceRange || false}
                  onChange={(e) => setNewJob({...newJob, hasPriceRange: e.target.checked})}
                  className="rounded border-input text-primary focus:ring-ring h-4 w-4 bg-background border border-border"
                />
                <Label htmlFor="hasPriceRange" className="text-xs cursor-pointer select-none font-medium">{t("conf.priceFluctuates")}</Label>
              </div>

              {newJob.hasPriceRange ? (
                <>
                  <div className="space-y-1">
                    <Label className="text-xs">{t("conf.minPrice")}</Label>
                    <Input type="number" value={newJob.minPricePerItem || ""} onChange={(e) => setNewJob({...newJob, minPricePerItem: Number(e.target.value)})} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t("conf.maxPrice")}</Label>
                    <Input type="number" value={newJob.maxPricePerItem || ""} onChange={(e) => setNewJob({...newJob, maxPricePerItem: Number(e.target.value)})} className="h-9 text-sm" />
                  </div>
                </>
              ) : (
                <div className="space-y-1">
                  <Label className="text-xs">{t("conf.pricePerItem")}</Label>
                  <Input type="number" value={newJob.pricePerItem || ""} onChange={(e) => setNewJob({...newJob, pricePerItem: Number(e.target.value)})} className="h-9 text-sm" />
                </div>
              )}
              {newJob.processingType === 'batch_to_one' && (
                <div className="space-y-1 md:col-span-2">
                  <Label className="text-xs">{t("conf.processRatio")}</Label>
                  <div className="flex items-center gap-3">
                    <Input type="number" value={newJob.processRatio || ""} onChange={(e) => setNewJob({...newJob, processRatio: Number(e.target.value)})} className="w-24 h-9 text-sm" />
                    <span className="text-muted-foreground text-xs">{t("conf.rawToFinal", 10)}</span>
                  </div>
                </div>
              )}
              <div className="md:col-span-2 mt-1">
                <Button onClick={handleAddJob} className="w-full bg-primary hover:bg-primary/90 shadow-md shadow-primary/20">{t("conf.saveJob")}</Button>
              </div>
            </div>
          ) : (
            /* Animal Farm Form */
            <div className="border border-amber-500/30 p-3 rounded-lg bg-amber-500/5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1 md:col-span-2">
                  <Label className="text-xs">{t("conf.jobName")}</Label>
                  <Input value={newJob.name} onChange={(e) => setNewJob({...newJob, name: e.target.value})} placeholder="e.g. เลี้ยงวัว / เลี้ยงไก่" className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t("conf.animalsPerRound")}</Label>
                  <Input type="number" value={animalFields.animalsPerRound || ""} onChange={(e) => setAnimalFields({...animalFields, animalsPerRound: Number(e.target.value)})} className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t("conf.totalRounds")}</Label>
                  <Input type="number" value={animalFields.totalRounds || ""} onChange={(e) => setAnimalFields({...animalFields, totalRounds: Number(e.target.value)})} className="h-9 text-sm" />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label className="text-xs">{t("conf.minutesPerRound")}</Label>
                  <Input type="number" value={animalFields.minutesPerRound || ""} onChange={(e) => setAnimalFields({...animalFields, minutesPerRound: Number(e.target.value)})} className="h-9 text-sm" />
                </div>
              </div>

              {/* Yields Section */}
              <div className="space-y-2">
                <Label className="text-xs text-amber-400 font-bold uppercase tracking-wider">{t("conf.yields")}</Label>
                {animalYields.map((y, i) => (
                  <div key={i} className="grid grid-cols-2 md:grid-cols-6 gap-2 items-end p-2 bg-background/50 rounded-lg border border-border/30">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">{t("conf.yieldName")}</Label>
                      <Input value={y.name} onChange={(e) => updateYield(i, 'name', e.target.value)} placeholder="e.g. นมวัว" className="h-8 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">{t("conf.yieldWeight")}</Label>
                      <Input type="number" value={y.weight || ""} onChange={(e) => updateYield(i, 'weight', Number(e.target.value))} className="h-8 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">{t("conf.yieldPrice")}</Label>
                      <Input type="number" value={y.pricePerItem || ""} onChange={(e) => updateYield(i, 'pricePerItem', Number(e.target.value))} className="h-8 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">{t("conf.yieldQty")}</Label>
                      <Input type="number" value={y.quantityPerRound || ""} onChange={(e) => updateYield(i, 'quantityPerRound', Number(e.target.value))} className="h-8 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">{t("conf.yieldChance")}</Label>
                      <Input type="number" min="0" max="100" value={y.chance !== undefined ? y.chance : ""} onChange={(e) => updateYield(i, 'chance', Number(e.target.value))} placeholder="100" className="h-8 text-xs" />
                    </div>
                    <div className="flex items-end justify-center">
                      {animalYields.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => removeYieldRow(i)} className="h-8 text-destructive hover:text-destructive/80 text-xs">
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addYieldRow} className="text-xs text-amber-400 border-amber-500/30 hover:bg-amber-500/10">
                  {t("conf.addYield")}
                </Button>
              </div>

              <Button onClick={handleAddJob} className="w-full bg-amber-600 hover:bg-amber-600/90 text-white shadow-md shadow-amber-600/20">{t("conf.saveJob")}</Button>
            </div>
          )}

          {/* Job List — White Jobs */}
          {whiteJobs.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] text-primary font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3 h-3" /> {t("conf.whiteJob")} ({whiteJobs.length})
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {whiteJobs.map((job) => (
                  <div key={job.id} className="flex justify-between items-center p-3 bg-background/50 border border-border/40 rounded-lg hover:border-primary/30 transition-all group">
                    <div>
                      <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{job.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {job.hasPriceRange 
                          ? `$${job.minPricePerItem} - $${job.maxPricePerItem} (สวิง) • ` 
                          : `$${job.pricePerItem} • `}
                        {job.itemWeight}kg
                      </p>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => removeJob(job.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-xs h-7">{t("conf.delete")}</Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Job List — Animal Jobs */}
          {animalJobs.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <PawPrint className="w-3 h-3" /> {t("conf.animalFarm")} ({animalJobs.length})
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {animalJobs.map((job) => {
                  const totalYieldEco = (job.animalYields || []).reduce((acc, y) => acc + y.pricePerItem * y.quantityPerRound, 0);
                  return (
                    <div key={job.id} className="flex justify-between items-center p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg hover:border-amber-500/40 transition-all group">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <PawPrint className="w-3 h-3 text-amber-400" />
                          <p className="font-semibold text-sm text-foreground group-hover:text-amber-400 transition-colors">{job.name}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {t("dash.animalSummaryText", job.animalsPerRound?.toString() || "0", job.totalRounds?.toString() || "0", job.minutesPerRound?.toString() || "0")}
                          {totalYieldEco > 0 && <span className="text-amber-400 ml-1">≈ ${totalYieldEco}</span>}
                        </p>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => removeJob(job.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-xs h-7">{t("conf.delete")}</Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/80 backdrop-blur-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20"><Truck className="text-primary w-4 h-4" /></div>
            {t("conf.vehicleSetup")}
          </CardTitle>
          <CardDescription className="text-xs">{t("conf.vehicleDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">{t("conf.name")}</Label>
              <Input value={newVehicle.name} onChange={(e) => setNewVehicle({...newVehicle, name: e.target.value})} placeholder="e.g. Mule" className="h-9 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t("conf.trunkCap")}</Label>
              <Input type="number" value={newVehicle.trunkCapacity || ""} onChange={(e) => setNewVehicle({...newVehicle, trunkCapacity: Number(e.target.value)})} className="h-9 text-sm" />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddVehicle} className="w-full bg-primary hover:bg-primary/90 shadow-md shadow-primary/20">{t("conf.addVehicle")}</Button>
            </div>
          </div>

          <div className="mt-3 rounded-lg border border-border/40 bg-background/50 overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-primary/5 border-b border-border/40">
                <tr>
                  <th className="px-4 py-2.5 text-left font-bold text-primary uppercase tracking-wider text-[10px]">{t("conf.name")}</th>
                  <th className="px-4 py-2.5 text-left font-bold text-primary uppercase tracking-wider text-[10px]">{t("conf.trunkCap")}</th>
                  <th className="px-4 py-2.5 text-right font-bold text-primary uppercase tracking-wider text-[10px]">{t("conf.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {vehicles.filter(v => v.presetId === activePresetId || (!v.presetId && activePresetId === 'default')).map((v) => (
                  <tr key={v.id} className="hover:bg-primary/5 transition-colors">
                    <td className="px-4 py-2.5 font-medium">{v.name}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{v.trunkCapacity}kg</td>
                    <td className="px-4 py-2.5 text-right">
                      <Button variant="destructive" size="sm" onClick={() => removeVehicle(v.id)} className="text-xs h-7">{t("conf.delete")}</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
