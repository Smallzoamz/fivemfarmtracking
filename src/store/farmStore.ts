import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

export interface Preset {
  id: string;
  name: string;
  targetGoal: number;
  jobItemLimit: number;
  selectedJobIds?: string[];
  calcVehicleId?: string;
  isCraftingRoute?: boolean;
  routeCraftingName?: string;
  routeCraftingRatio?: number;
  routeCraftingPrice?: number;
  isVipMode?: boolean;
  isProcessBeforeStore?: boolean;
  farmMode?: 'city' | 'dimension';
  dimensionPocketLoops?: number;
  dimensionYieldPerLoop?: number;
}

export interface AnimalYield {
  name: string;
  weight: number;
  pricePerItem: number;
  quantityPerRound: number;
  chance?: number;
}

export interface Job {
  id: string;
  presetId?: string;
  name: string;
  pricePerItem: number;
  minPricePerItem?: number;
  maxPricePerItem?: number;
  hasPriceRange?: boolean;
  itemWeight: number;
  processingType: 'none' | 'one_to_one' | 'batch_to_one';
  processRatio: number;
  finalItemName: string;
  jobCategory: 'white' | 'animal';
  // Animal-specific fields
  animalsPerRound?: number;
  totalRounds?: number;
  minutesPerRound?: number;
  animalYields?: AnimalYield[];
}

export interface Vehicle {
  id: string;
  presetId?: string;
  name: string;
  trunkCapacity: number;
}

export interface JobCheckpoint {
  jobId: string;
  durationMs: number;
  itemsGathered: number;
}

export interface Lap {
  id?: string;
  lapNumber: number;
  durationMs: number;
  itemsGathered: number;
  ecoEarned: number;
  minEcoEarned?: number;
  maxEcoEarned?: number;
  checkpoints?: any[];
}

export interface FarmSession {
  id: string;
  presetId?: string;
  jobId: string; // comma separated job ids
  vehicleId: string;
  startTime: number;
  laps: Lap[];
  isCrafting?: boolean;
  craftingName?: string;
  craftingRatio?: number;
  craftingPrice?: number;
  isVip?: boolean;
  farmMode?: 'city' | 'dimension';
  dimensionLoops?: number;
  isPublic?: boolean;
  jobCategory?: 'white' | 'animal';
}

interface FarmState {
  userId: string | null;
  setUserId: (id: string | null) => void;
  
  presets: Preset[];
  activePresetId: string;
  jobs: Job[];
  vehicles: Vehicle[];
  sessions: FarmSession[];
  activeSession: FarmSession | null;
  
  addPreset: (name: string) => void;
  updatePreset: (id: string, data: Partial<Preset>) => void;
  removePreset: (id: string) => void;
  setActivePreset: (id: string) => void;
  
  addJob: (job: Job) => void;
  removeJob: (id: string) => void;
  addVehicle: (vehicle: Vehicle) => void;
  removeVehicle: (id: string) => void;
  
  startSession: (jobId: string, vehicleId: string, craftingOpts?: { isCrafting: boolean, name: string, ratio: number, price: number }, isVip?: boolean, farmMode?: 'city' | 'dimension', dimensionLoops?: number, jobCategory?: 'white' | 'animal') => void;
  logAnimalSession: (jobId: string, vehicleId: string, ecoEarned: number, durationMs: number, isVip?: boolean, actualYields?: { name: string; quantity: number; pricePerItem: number }[]) => void;
  stopSession: () => void;
  addLap: (lap: Omit<Lap, 'lapNumber'>) => void;
  clearHistory: () => void;
  removeSession: (id: string) => void;
  
  // Cloud Sync Actions
  isCloudSyncing: boolean;
  loadFromCloud: () => Promise<void>;
  toggleSessionPublic: (id: string, isPublic: boolean) => Promise<string>;
}

const isUUID = (id?: string) => {
  if (!id) return false;
  return id.length === 36 && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
};

export const useFarmStore = create<FarmState>()(
  persist(
    (set, get) => ({
      userId: null,
      setUserId: (id) => set({ userId: id }),
      isCloudSyncing: false,
      
      presets: [{ id: 'default', name: 'Default City', targetGoal: 1000000, jobItemLimit: 60 }],
      activePresetId: 'default',
      jobs: [],
      vehicles: [],
      sessions: [],
      activeSession: null,

      addPreset: async (name) => {
        const newId = crypto.randomUUID();
        const { userId } = get();
        const newPreset: Preset = { id: newId, name, targetGoal: 1000000, jobItemLimit: 60 };
        
        // Optimistic UI
        set((state) => ({
          presets: [...state.presets, newPreset],
          activePresetId: newId
        }));

        if (userId) {
          try {
            await supabase.from('farm_presets').insert({
              id: newPreset.id,
              user_id: userId,
              name: newPreset.name,
              target_goal: newPreset.targetGoal,
              job_item_limit: newPreset.jobItemLimit,
            });
          } catch (e) {
            console.error("Failed to insert preset", e);
          }
        }
      },
      
      updatePreset: async (id, data) => {
        const { userId } = get();
        set((state) => ({
          presets: state.presets.map(p => p.id === id ? { ...p, ...data } : p)
        }));

        if (userId) {
          const mappedData: any = {};
          if (data.name !== undefined) mappedData.name = data.name;
          if (data.targetGoal !== undefined) mappedData.target_goal = data.targetGoal;
          if (data.jobItemLimit !== undefined) mappedData.job_item_limit = data.jobItemLimit;
          if (data.isVipMode !== undefined) mappedData.is_vip_mode = data.isVipMode;
          if (data.isProcessBeforeStore !== undefined) mappedData.is_process_before_store = data.isProcessBeforeStore;
          if (data.farmMode !== undefined) mappedData.farm_mode = data.farmMode;
          if (data.dimensionPocketLoops !== undefined) mappedData.dimension_pocket_loops = data.dimensionPocketLoops;
          if (data.dimensionYieldPerLoop !== undefined) mappedData.dimension_yield_per_loop = data.dimensionYieldPerLoop;
          
          if (Object.keys(mappedData).length > 0) {
            await supabase.from('farm_presets').update(mappedData).eq('id', id).eq('user_id', userId);
          }
        }
      },

      removePreset: async (id) => {
        if (id === 'default') return; // Prevent deleting default locally if not uuid
        const { userId } = get();
        
        set((state) => {
          const newPresets = state.presets.filter(p => p.id !== id);
          return {
            presets: newPresets,
            activePresetId: state.activePresetId === id ? (newPresets[0]?.id || 'default') : state.activePresetId
          };
        });

        if (userId) {
          await supabase.from('farm_presets').delete().eq('id', id).eq('user_id', userId);
        }
      },

      setActivePreset: (id) => set({ activePresetId: id }),

      addJob: async (job) => {
        const { userId, activePresetId } = get();
        const jobWithPreset = { ...job, presetId: activePresetId, id: crypto.randomUUID() }; // Ensure UUID
        
        set((state) => ({ jobs: [...state.jobs, jobWithPreset] }));

        if (userId && isUUID(jobWithPreset.presetId)) {
          try {
            const { error } = await supabase.from('farm_jobs').insert({
              id: jobWithPreset.id,
              user_id: userId,
              preset_id: jobWithPreset.presetId,
              name: jobWithPreset.name,
              price_per_item: jobWithPreset.pricePerItem,
              min_price_per_item: jobWithPreset.minPricePerItem || 0,
              max_price_per_item: jobWithPreset.maxPricePerItem || 0,
              has_price_range: jobWithPreset.hasPriceRange || false,
              item_weight: jobWithPreset.itemWeight,
              processing_type: jobWithPreset.processingType,
              process_ratio: jobWithPreset.processRatio,
              final_item_name: jobWithPreset.finalItemName,
              job_category: jobWithPreset.jobCategory || 'white',
              animals_per_round: jobWithPreset.animalsPerRound,
              total_rounds: jobWithPreset.totalRounds,
              minutes_per_round: jobWithPreset.minutesPerRound,
              animal_yields: jobWithPreset.animalYields || []
            });

            if (error && (error.code === '42703' || error.message?.includes('min_price_per_item'))) {
              // Fallback: Retry insert without price range columns if they don't exist in remote DB
              await supabase.from('farm_jobs').insert({
                id: jobWithPreset.id,
                user_id: userId,
                preset_id: jobWithPreset.presetId,
                name: jobWithPreset.name,
                price_per_item: jobWithPreset.pricePerItem,
                item_weight: jobWithPreset.itemWeight,
                processing_type: jobWithPreset.processingType,
                process_ratio: jobWithPreset.processRatio,
                final_item_name: jobWithPreset.finalItemName,
                job_category: jobWithPreset.jobCategory || 'white',
                animals_per_round: jobWithPreset.animalsPerRound,
                total_rounds: jobWithPreset.totalRounds,
                minutes_per_round: jobWithPreset.minutesPerRound,
                animal_yields: jobWithPreset.animalYields || []
              });
            }
          } catch (e) {
             console.error("Failed to insert job", e);
          }
        }
      },
      
      removeJob: async (id) => {
        const { userId } = get();
        set((state) => ({ jobs: state.jobs.filter((j) => j.id !== id) }));
        if (userId) {
          await supabase.from('farm_jobs').delete().eq('id', id).eq('user_id', userId);
        }
      },

      addVehicle: async (vehicle) => {
        const { userId, activePresetId } = get();
        const vehicleWithPreset = { ...vehicle, presetId: activePresetId, id: crypto.randomUUID() };
        
        set((state) => ({ vehicles: [...state.vehicles, vehicleWithPreset] }));

        if (userId && isUUID(vehicleWithPreset.presetId)) {
          try {
            await supabase.from('farm_vehicles').insert({
              id: vehicleWithPreset.id,
              user_id: userId,
              preset_id: vehicleWithPreset.presetId,
              name: vehicleWithPreset.name,
              trunk_capacity: vehicleWithPreset.trunkCapacity
            });
          } catch (e) {
            console.error("Failed to insert vehicle", e);
          }
        }
      },
      
      removeVehicle: async (id) => {
        const { userId } = get();
        set((state) => ({ vehicles: state.vehicles.filter((v) => v.id !== id) }));
        if (userId) {
          await supabase.from('farm_vehicles').delete().eq('id', id).eq('user_id', userId);
        }
      },

      startSession: (jobId, vehicleId, craftingOpts, isVip, farmMode, dimensionLoops, jobCategory) => set((state) => {
        if (state.activeSession) return state;
        return {
          activeSession: {
            id: crypto.randomUUID(),
            presetId: state.activePresetId,
            jobId,
            vehicleId,
            startTime: Date.now(),
            laps: [],
            isCrafting: craftingOpts?.isCrafting,
            craftingName: craftingOpts?.name,
            craftingRatio: craftingOpts?.ratio,
            craftingPrice: craftingOpts?.price,
            isVip,
            farmMode,
            dimensionLoops,
            jobCategory: jobCategory || 'white'
          }
        };
      }),

      logAnimalSession: async (jobId, vehicleId, ecoEarned, durationMs, isVip, actualYields) => {
        const { userId, activePresetId } = get();
        const checkpointsData = actualYields || [];
        const lapId = crypto.randomUUID();
        const session: FarmSession = {
          id: crypto.randomUUID(),
          presetId: activePresetId,
          jobId,
          vehicleId,
          startTime: Date.now(),
          laps: [{
            id: lapId,
            lapNumber: 1,
            durationMs,
            itemsGathered: checkpointsData.reduce((acc, y) => acc + y.quantity, 0),
            ecoEarned,
            checkpoints: checkpointsData
          }],
          isVip,
          farmMode: 'city',
          jobCategory: 'animal'
        };

        set((state) => ({
          sessions: [...state.sessions, session]
        }));

        if (userId && isUUID(activePresetId)) {
          try {
            await supabase.from('farm_sessions').insert({
              id: session.id,
              user_id: userId,
              preset_id: activePresetId,
              job_id: jobId,
              vehicle_id: isUUID(vehicleId) ? vehicleId : null,
              start_time: new Date(session.startTime).toISOString(),
              is_vip: isVip,
              farm_mode: 'city',
              job_category: 'animal'
            });
            await supabase.from('farm_laps').insert({
              id: lapId,
              session_id: session.id,
              lap_number: 1,
              duration_ms: durationMs,
              items_gathered: checkpointsData.reduce((acc, y) => acc + y.quantity, 0),
              eco_earned: ecoEarned,
              checkpoints: checkpointsData
            });
          } catch (e) {
            console.error("Failed to insert animal session", e);
          }
        }
      },

      stopSession: async () => {
        const { userId, activeSession } = get();
        if (!activeSession) return;
        
        set((state) => ({
          sessions: [...state.sessions, activeSession],
          activeSession: null,
        }));

        if (userId && activeSession.laps.length > 0) {
          if (isUUID(activeSession.presetId)) {
            try {
              // Insert Session directly if preset is already a UUID
              await supabase.from('farm_sessions').insert({
                id: activeSession.id,
                user_id: userId,
                preset_id: activeSession.presetId,
                job_id: activeSession.jobId,
                vehicle_id: isUUID(activeSession.vehicleId) ? activeSession.vehicleId : null,
                start_time: new Date(activeSession.startTime).toISOString(),
                is_crafting: activeSession.isCrafting,
                crafting_name: activeSession.craftingName,
                crafting_ratio: activeSession.craftingRatio,
                crafting_price: activeSession.craftingPrice,
                is_vip: activeSession.isVip,
                farm_mode: activeSession.farmMode,
                dimension_loops: activeSession.dimensionLoops,
                job_category: activeSession.jobCategory || 'white'
              });

              // Insert Laps
              const lapInserts = activeSession.laps.map(lap => ({
                id: lap.id || crypto.randomUUID(),
                session_id: activeSession.id,
                lap_number: lap.lapNumber,
                duration_ms: lap.durationMs,
                items_gathered: lap.itemsGathered,
                eco_earned: lap.ecoEarned,
                min_eco_earned: lap.minEcoEarned || null,
                max_eco_earned: lap.maxEcoEarned || null,
                checkpoints: lap.checkpoints || []
              }));
              
              if (lapInserts.length > 0) {
                const { error: lapErr } = await supabase.from('farm_laps').insert(lapInserts);
                if (lapErr && (lapErr.code === '42703' || lapErr.message?.includes('min_eco_earned'))) {
                  // Fallback: Retry insert without min_eco_earned and max_eco_earned columns if they don't exist in remote DB
                  const fallbackInserts = lapInserts.map(({ min_eco_earned, max_eco_earned, ...rest }) => rest);
                  await supabase.from('farm_laps').insert(fallbackInserts);
                }
              }
            } catch (e) {
              console.error("Failed to insert session", e);
            }
          } else {
            // Preset is 'default' or non-UUID — skip cloud migration since auto-migrate is disabled
          }
        }
      },

      addLap: (lap) =>
        set((state) => {
          if (!state.activeSession) return state;
          const newLap = {
            ...lap,
            id: lap.id || crypto.randomUUID(),
            lapNumber: state.activeSession.laps.length + 1,
          };
          return {
            activeSession: {
              ...state.activeSession,
              laps: [...state.activeSession.laps, newLap],
            },
          };
        }),

      clearHistory: async () => {
        const { userId, activePresetId } = get();
        
        set((state) => ({ 
          sessions: state.sessions.filter(s => (s.presetId || 'default') !== activePresetId) 
        }));

        if (userId) {
           await supabase.from('farm_sessions').delete().eq('preset_id', activePresetId).eq('user_id', userId);
        }
      },

      removeSession: async (id) => {
        const { userId } = get();
        set((state) => ({
          sessions: state.sessions.filter(s => s.id !== id)
        }));
        if (userId) {
          await supabase.from('farm_sessions').delete().eq('id', id).eq('user_id', userId);
        }
      },

      toggleSessionPublic: async (id, isPublic) => {
        const { userId, sessions } = get();
        const session = sessions.find(s => s.id === id);
        let targetId = id;
        
        // Old ID mapping relies on auto-migration which is now disabled. 
        // We will just proceed with the current targetId.

        set((state) => ({
          sessions: state.sessions.map(s => s.id === targetId ? { ...s, isPublic } : s)
        }));
        
        if (userId && isUUID(targetId)) {
          await supabase.from('farm_sessions').update({ is_public: isPublic }).eq('id', targetId).eq('user_id', userId);
        }
        return isUUID(targetId) ? targetId : id;
      },

      loadFromCloud: async () => {
        const { userId } = get();
        if (!userId) return;
        set({ isCloudSyncing: true });
        
        try {
          const [presetsRes, jobsRes, vehiclesRes, sessionsRes] = await Promise.all([
            supabase.from('farm_presets').select('*').eq('user_id', userId),
            supabase.from('farm_jobs').select('*').eq('user_id', userId),
            supabase.from('farm_vehicles').select('*').eq('user_id', userId),
            supabase.from('farm_sessions').select(`*, farm_laps(*)`).eq('user_id', userId)
          ]);

          // Only apply cloud data if cloud actually has data
          if (presetsRes.data && presetsRes.data.length > 0) {
            const cloudPresets = presetsRes.data.map((p: any) => ({
              id: p.id,
              name: p.name,
              targetGoal: p.target_goal,
              jobItemLimit: p.job_item_limit,
              isVipMode: p.is_vip_mode,
              isProcessBeforeStore: p.is_process_before_store,
              farmMode: p.farm_mode,
              dimensionPocketLoops: p.dimension_pocket_loops,
              dimensionYieldPerLoop: p.dimension_yield_per_loop
            }));
            
            const cloudJobs = (jobsRes.data || []).map((j: any) => ({
              id: j.id,
              presetId: j.preset_id,
              name: j.name,
              pricePerItem: j.price_per_item,
              minPricePerItem: j.min_price_per_item || 0,
              maxPricePerItem: j.max_price_per_item || 0,
              hasPriceRange: j.has_price_range || false,
              itemWeight: j.item_weight,
              processingType: j.processing_type,
              processRatio: j.process_ratio,
              finalItemName: j.final_item_name,
              jobCategory: j.job_category || 'white',
              animalsPerRound: j.animals_per_round,
              totalRounds: j.total_rounds,
              minutesPerRound: j.minutes_per_round,
              animalYields: j.animal_yields || []
            }));

            const cloudVehicles = (vehiclesRes.data || []).map((v: any) => ({
              id: v.id,
              presetId: v.preset_id,
              name: v.name,
              trunkCapacity: v.trunk_capacity
            }));

            const cloudSessions = (sessionsRes.data || []).map((s: any) => ({
              id: s.id,
              presetId: s.preset_id,
              jobId: s.job_id,
              vehicleId: s.vehicle_id,
              startTime: new Date(s.start_time).getTime(),
              isCrafting: s.is_crafting,
              craftingName: s.crafting_name,
              craftingRatio: s.crafting_ratio,
              craftingPrice: s.crafting_price,
              isVip: s.is_vip,
              farmMode: s.farm_mode,
              dimensionLoops: s.dimension_loops,
              isPublic: s.is_public,
              jobCategory: s.job_category || 'white',
              laps: (s.farm_laps || []).sort((a: any, b: any) => a.lap_number - b.lap_number).map((l: any) => ({
                id: l.id,
                lapNumber: l.lap_number,
                durationMs: l.duration_ms,
                itemsGathered: l.items_gathered,
                ecoEarned: l.eco_earned,
                minEcoEarned: l.min_eco_earned || undefined,
                maxEcoEarned: l.max_eco_earned || undefined,
                checkpoints: l.checkpoints
              }))
            }));

            // Merge: cloud data takes priority, but keep local-only items
            const local = get();
            const cloudPresetIds = new Set(cloudPresets.map(p => p.id));
            const cloudJobIds = new Set(cloudJobs.map(j => j.id));
            const cloudVehicleIds = new Set(cloudVehicles.map(v => v.id));
            const cloudSessionIds = new Set(cloudSessions.map(s => s.id));

            // Keep local items that are NOT in cloud (local-only, not yet synced)
            const localOnlyPresets = local.presets.filter(p => !cloudPresetIds.has(p.id) && p.id !== 'default');
            const localOnlyJobs = local.jobs.filter(j => !cloudJobIds.has(j.id));
            const localOnlyVehicles = local.vehicles.filter(v => !cloudVehicleIds.has(v.id));
            const localOnlySessions = local.sessions.filter(s => !cloudSessionIds.has(s.id));

            // Map cloud presets but retain local-only planner selection states
            const mergedCloudPresets = cloudPresets.map((cloudPreset: any) => {
              const localPreset = local.presets.find(p => p.id === cloudPreset.id);
              if (localPreset) {
                return {
                  ...cloudPreset,
                  selectedJobIds: localPreset.selectedJobIds,
                  calcVehicleId: localPreset.calcVehicleId,
                  isCraftingRoute: localPreset.isCraftingRoute,
                  routeCraftingName: localPreset.routeCraftingName,
                  routeCraftingRatio: localPreset.routeCraftingRatio,
                  routeCraftingPrice: localPreset.routeCraftingPrice,
                };
              }
              return cloudPreset;
            });

            const mergedPresets = [...mergedCloudPresets, ...localOnlyPresets];
            const currentActiveId = local.activePresetId;
            const newActivePresetId = mergedPresets.some(p => p.id === currentActiveId)
              ? currentActiveId
              : (cloudPresets[0]?.id || 'default');

            set({
              presets: mergedPresets,
              activePresetId: newActivePresetId,
              jobs: [...cloudJobs, ...localOnlyJobs],
              vehicles: [...cloudVehicles, ...localOnlyVehicles],
              sessions: [...cloudSessions, ...localOnlySessions]
            });
          }
          // If cloud is empty, keep local data as-is (no overwrite)
        } catch (error) {
          console.error("Failed to load from cloud:", error);
        } finally {
          set({ isCloudSyncing: false });
        }
      },

    }),
    {
      name: 'fivem-farm-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Keep local migration safety
          if (!state.presets || state.presets.length === 0) {
            state.presets = [{
              id: 'default',
              name: 'Default City',
              targetGoal: 1000000,
              jobItemLimit: 60
            }];
            state.activePresetId = 'default';
          }
        }
      }
    }
  )
);
