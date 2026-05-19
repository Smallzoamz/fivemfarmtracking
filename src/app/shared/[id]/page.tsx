import { supabase } from "@/lib/supabase"
import { SharedSessionDetail } from "@/components/SharedSessionDetail"

export const dynamic = "force-dynamic";

export default async function SharedSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch session and laps directly
  const { data: session, error } = await supabase
    .from("farm_sessions")
    .select("*, farm_laps(*)")
    .eq("id", id)
    .single();

  if (error || !session || !session.is_public) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Session Not Found</h1>
          <p className="text-muted-foreground">This farming session might be private or doesn't exist.</p>
        </div>
      </div>
    );
  }

  // Fetch preset/city name
  let cityName = "";
  if (session.preset_id) {
    const { data: preset } = await supabase
      .from("farm_presets")
      .select("name")
      .eq("id", session.preset_id)
      .single();
    cityName = preset?.name || "";
  }

  // Fetch jobs for this session
  const jobIds = (session.job_id || "").split(",").filter(Boolean);
  let dbJobs: any[] = [];
  if (jobIds.length > 0) {
    const { data } = await supabase
      .from("farm_jobs")
      .select("*")
      .in("id", jobIds);
    dbJobs = data || [];
  }

  // Fetch vehicle name
  let vehicleName = "";
  if (session.vehicle_id) {
    const { data: vehicle } = await supabase
      .from("farm_vehicles")
      .select("name")
      .eq("id", session.vehicle_id)
      .single();
    vehicleName = vehicle?.name || "";
  }

  // Map session to camelCase
  const mappedSession = {
    id: session.id,
    presetId: session.preset_id,
    jobId: session.job_id,
    vehicleId: session.vehicle_id,
    startTime: new Date(session.start_time).getTime(),
    isCrafting: session.is_crafting,
    craftingName: session.crafting_name,
    craftingRatio: session.crafting_ratio,
    craftingPrice: session.crafting_price,
    isVip: session.is_vip,
    farmMode: session.farm_mode as 'city' | 'dimension',
    dimensionLoops: session.dimension_loops,
    isPublic: session.is_public,
    jobCategory: (session.job_category || 'white') as 'white' | 'animal',
    laps: (session.farm_laps || []).sort((a: any, b: any) => a.lap_number - b.lap_number).map((l: any) => ({
      id: l.id,
      lapNumber: l.lap_number,
      durationMs: l.duration_ms,
      itemsGathered: l.items_gathered,
      ecoEarned: l.eco_earned,
      checkpoints: l.checkpoints || []
    }))
  };

  // Map jobs to camelCase
  const mappedJobs = dbJobs.map((j: any) => ({
    id: j.id,
    presetId: j.preset_id,
    name: j.name,
    pricePerItem: j.price_per_item,
    itemWeight: j.item_weight,
    processingType: j.processing_type as 'none' | 'one_to_one' | 'batch_to_one',
    processRatio: j.process_ratio,
    finalItemName: j.final_item_name,
    jobCategory: (j.job_category || 'white') as 'white' | 'animal',
    animalsPerRound: j.animals_per_round,
    totalRounds: j.total_rounds,
    minutesPerRound: j.minutes_per_round,
    animalYields: j.animal_yields || []
  }));

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 flex justify-center">
      <SharedSessionDetail 
        session={mappedSession} 
        jobs={mappedJobs} 
        vehicleName={vehicleName} 
        cityName={cityName} 
      />
    </div>
  );
}

