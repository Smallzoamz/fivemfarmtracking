# Project Log: FiveM Farm Optimizer & Timer

| Date/Time | File | Line | Keyword | Status | Change |
| --- | --- | --- | --- | --- | --- |
| 2026-05-18 02:02 | PROJECT_LOG.md | - | INIT | Created | Initialized project log for Farm Optimizer. |
| 2026-05-18 02:08 | src/store/farmStore.ts | All | Zustand | Added | Created persistent Zustand store for Jobs, Vehicles, and Sessions. |
| 2026-05-18 02:08 | src/components/Configurator.tsx | All | Configurator | Added | Created Dialog component to configure Jobs and Vehicles. |
| 2026-05-18 02:08 | src/components/Dashboard.tsx | All | Calculator/Timer | Added | Created Goal Calculator and real-time Lap Timer. |
| 2026-05-18 02:09 | src/components/Analytics.tsx | All | Analytics | Added | Created historical session tracking table. |
| 2026-05-18 02:09 | src/app/page.tsx | All | Layout | Modified | Assembled components into a responsive dashboard layout. |
| 2026-05-18 02:14 | src/app/globals.css | 86-118 | Styling | Modified | Upgraded default dark theme to Midnight Navy & Neon Green palette. |
| 2026-05-18 02:14 | src/components/Dashboard.tsx | All | UI/UX | Modified | Added glassmorphism, background radial gradients, and glowing neon effects. |
| 2026-05-18 02:17 | src/app/layout.tsx | All | Typography | Modified | Changed font from Geist to Outfit (Google Fonts) for a premium geometric look. |
| 2026-05-18 02:17 | src/app/globals.css | All | Scrollbar | Modified | Added custom styled scrollbars. |
| 2026-05-18 02:17 | src/components/Analytics.tsx | All | UI/UX | Modified | Upgraded table UI with black headers, hover rows, and gradient titles. |
| 2026-05-18 02:17 | src/components/Configurator.tsx | All | UI/UX | Modified | Added glass backdrop to modal, hover animations to job/vehicle cards. |
| 2026-05-18 02:37 | src/store/farmStore.ts | All | Logic | Modified | Updated Job interface to support `processingType`. |
| 2026-05-18 02:37 | src/components/Dashboard.tsx | All | Logic | Modified | Rewrote Calculator for precise trunk allocation and Checkpoint Timer. |
| 2026-05-18 02:39 | src/components/Analytics.tsx | All | Logic | Modified | Updated columns for Checkpoint and Average Time per Item tracking. |
| 2026-05-18 02:55 | src/store/farmStore.ts | All | Logic | Modified | Upgraded characterWeight to jobItemLimit and added batch processing ratios. |
| 2026-05-18 02:55 | src/components/Configurator.tsx | All | Logic | Modified | Added inputs for Batch Ratio and Final Item Name. |
| 2026-05-18 02:55 | src/components/Dashboard.tsx | All | Logic | Modified | Integrated Job Limit and new Batch Processing calculation. |
| 2026-05-18 03:09 | src/store/farmStore.ts | All | Logic | Modified | Added crafting metadata to FarmSession interface. |
| 2026-05-18 03:09 | src/components/Dashboard.tsx | All | Logic | Modified | Added Route Crafting Mode (Switch) and override logic. |
| 2026-05-18 03:09 | src/components/Analytics.tsx | All | Logic | Modified | Updated UI to display Crafted Route names and ratios. |
| 2026-05-18 03:16 | src/components/Dashboard.tsx | All | Logic | Modified | Rounded Trunk and Pocket sets down to multiples of ratio. |
| 2026-05-18 03:47 | src/components/Dashboard.tsx | All | Logic | Modified | Transformed Timer into Multi-Stage tracking with Estimated Time. |
| 2026-05-18 03:47 | src/store/farmStore.ts | All | Logic | Modified | Upgraded Lap interface to include JobCheckpoints array. |
| 2026-05-18 03:53 | src/components/Analytics.tsx | All | Logic | Modified | Added Clear History button and changed Eco/Hr to Time to Target. |
| 2026-05-18 03:53 | src/store/farmStore.ts | All | Logic | Modified | Added clearHistory method. |
| 2026-05-18 04:03 | src/store/languageStore.ts | All | Logic | Added | Created language store for i18n support. |
| 2026-05-18 04:03 | src/locales/ | All | Logic | Added | Created English and Thai dictionaries. |
| 2026-05-18 04:03 | src/components/*.tsx | All | Logic | Modified | Applied translation hook and replaced hardcoded texts. |
| 2026-05-18 04:17 | src/store/farmStore.ts | All | Logic | Modified | Implemented Preset logic to separate state per city. |
| 2026-05-18 04:17 | src/components/Dashboard.tsx | All | Logic | Modified | Added Preset Dropdown to Planner Card. |
| 2026-05-18 04:17 | src/components/Configurator.tsx | All | Logic | Modified | Added Preset Dropdown to filter jobs/vehicles. |
| 2026-05-18 04:17 | src/components/Analytics.tsx | All | Logic | Modified | Filtered session history by active Preset. |
| 2026-05-18 04:25 | src/store/farmStore.ts | All | Logic | Modified | Expanded Preset to include planner state for auto-saving. |
| 2026-05-18 04:25 | src/components/Dashboard.tsx | All | Logic | Modified | Migrated Planner state to activePreset for instant auto-saving. |
| 2026-05-18 13:20 | src/components/Dashboard.tsx | 46-58 | Timer | Fixed | Fixed timer bug: timerMs now subtracts in-progress checkpoint durations (cpDone) so each job timer is accurate instead of accumulating all previous checkpoint time. This was causing est. time to inflate from ~15h to ~40h. |
| 2026-05-18 13:20 | src/components/Dashboard.tsx | 130-180 | handleNextJob | Modified | Added lap result display (lastLapResult state) on each "Finish Route" press. Auto-stop and show summary modal when laps >= targetLapsLeft. |
| 2026-05-18 13:20 | src/components/Dashboard.tsx | 262-295 | UI | Added | Added per-job Lap Result Flash (green banner with checkpoint breakdown) and expanded Lap History to show per-job timing with border-left indicators. |
| 2026-05-18 13:20 | src/components/Dashboard.tsx | 489-550 | UI | Added | Added Session Summary overlay modal with total laps, total earned, total time, avg/fastest/slowest lap, and per-lap breakdown. |
| 2026-05-18 13:20 | src/locales/en.ts, th.ts | 49-63 | i18n | Added | Added 14 new translation keys for lap stats, summary modal (lapComplete, lapTime, jobTime, totalTime, earned, goalReached, summaryTitle, totalLaps, totalEarned, avgLapTime, fastestLap, slowestLap, closeSummary, elapsed). |
| 2026-05-18 13:35 | src/components/Dashboard.tsx | 154-180 | handleNextJob | Modified | Modified timer to auto-stop and show summary immediately after completing any lap, removing continuous laps. |
| 2026-05-18 16:15 | src/components/Analytics.tsx | 45-104 | UI | Modified | Simplified Analytics table to exactly 6 columns: Date/Time, Item Sold, Vehicle, Avg Time/Lap, Eco/Lap, Est Time to Target. |
| 2026-05-18 16:15 | src/locales/en.ts, th.ts | 97-102 | i18n | Modified | Updated and added translation keys for simplified Analytics table (ana.date, ana.job, ana.avgTimeJob, ana.ecoPerLap). |
| 2026-05-18 18:05 | src/components/Configurator.tsx, Dashboard.tsx | multiple | Core | Modified | Enforced strict preset separation for jobs and vehicles. New cities will no longer see jobs/vehicles from other cities. |
| 2026-05-18 18:55 | src/store/farmStore.ts, src/components/* | multiple | Feature | Added | Implemented VIP toggle to track VIP vs Non-VIP farming speeds. Added comparative summary to Analytics view. |
| 2026-05-18 19:10 | src/store/farmStore.ts, src/components/* | multiple | Feature | Modified | Changed 'No Vehicle' mode to 'Process First, Then Store' mode. Adjusted logic so that the vehicle holds processed items rather than raw items. |
| 2026-05-18 19:35 | src/store/farmStore.ts, src/components/* | multiple | Feature | Added | Implemented 'Dimension Farm' mode to support instanced farming. Allows users to specify base pocket loops and auto-calculates total loops needed based on vehicle trunk capacity. Timer loops without stopping until target is reached. |
| 2026-05-19 09:50 | src/store/farmStore.ts, sql/farm_schema.sql | multiple | Sync | Added | Set up Supabase PostgreSQL schema, added auth system with custom username, and implemented cloud data migration. |
| 2026-05-19 09:50 | src/components/Analytics.tsx, src/app/shared/ | multiple | Sharing | Added | Added is_public toggle for farm sessions and created a public, read-only analytics dashboard for shared links. |
| 2026-05-19 17:36 | src/app/shared/[id]/loading.tsx | All | Feature | Added | Created skeleton loading UI for shared session page. |
| 2026-05-19 17:36 | src/app/page.tsx | 25-50 | Logic | Modified | Fixed infinite loading hang by adding an 8-second timeout (Promise.race) to `loadFromCloud`. |
| 2026-05-19 17:36 | src/app/page.tsx | 70-110 | UI | Modified | Replaced basic "Loading..." text with a comprehensive Skeleton UI matching the dashboard layout. |
| 2026-05-19 17:39 | src/app/page.tsx | 150-160 | UI | Modified | Removed the 'Migrate Local' button from the top navigation header. |
| 2026-05-19 17:47 | src/components/Analytics.tsx | 87-95 | UI | Modified | Added active city/preset name badge next to Analytics title header. |
| 2026-05-19 17:47 | src/app/shared/[id]/page.tsx | 26-62 | UI | Modified | Fetched preset name from Supabase and displayed city badge with MapPin icon on shared report page. |
| 2026-05-19 18:20 | src/store/farmStore.ts | 22-40 | Model | Modified | Added `AnimalYield` interface and extended `Job` with `jobCategory`, `animalsPerRound`, `totalRounds`, `minutesPerRound`, `animalYields` fields. Extended `FarmSession` with `jobCategory`. Added `logAnimalSession` method for direct session recording without timer. |
| 2026-05-19 18:20 | src/store/farmStore.ts | 193-350 | Sync | Modified | Updated `addJob`, `stopSession`, `loadFromCloud`, and `migrateToCloud` to persist and load animal farming fields to/from Supabase. |
| 2026-05-19 18:20 | src/locales/en.ts, th.ts | 97-145 | i18n | Added | Added 25+ translation keys for animal farming: conf.jobCategory, conf.whiteJob, conf.animalFarm, conf.animalsPerRound, conf.yields, dash.animalFarm, dash.logAnimalSession, ana.whiteJob, ana.animalFarm, etc. |
| 2026-05-19 18:20 | src/components/Configurator.tsx | All | Feature | Modified | Added job category toggle (White/Animal) with distinct amber theming for animal farm. Added dynamic yield management form (name, weight, price, qty per round). Split job list into White and Animal sections with colored badges. |
| 2026-05-19 18:20 | src/components/Dashboard.tsx | All | Feature | Modified | Added animal job calculation panel (eco/round, total time, total rounds). Added PawPrint badges on job selection buttons. Added combined eco summary when mixing white+animal jobs. Added instant "Log Animal Session" button for pure animal farming. |
| 2026-05-19 18:20 | src/components/Analytics.tsx | All | UI | Modified | Added job category badges (White/Animal with PawPrint icon) to session history. Added "Planned" time badge for animal sessions. Filtered VIP comparison to white jobs only. |
| 2026-05-19 18:20 | supabase/migrations/20260519_add_animal_farming.sql | All | Schema | Added | SQL migration to add columns: `job_category`, `animals_per_round`, `total_rounds`, `minutes_per_round`, `animal_yields` to farm_jobs; `job_category` to farm_sessions. |
| 2026-05-19 19:08 | walkthrough.md | All | Verification | Completed | Verified the production build, verified the animal farming UI yields breakdown, and created the walkthrough. |
| 2026-05-19 19:10 | src/app/layout.tsx | 21-24 | Hydration | Fixed | Added `suppressHydrationWarning` to the HTML tag to prevent console hydration errors from test harness/extensions `data-jetski-tab-id` attribute. |
| 2026-05-19 19:47 | src/locales/th.ts, en.ts, src/components/Configurator.tsx, Dashboard.tsx | All | i18n/Logic | Modified | Renamed Animal Farming 'Rounds' to 'Feeding Rounds' (รอบให้อาหาร) in localization and UI. Refactored yields and eco calculations to not multiply by feeding rounds. |
| 2026-05-19 19:52 | src/components/Analytics.tsx, src/locales/th.ts, en.ts | 61-110 | Clipboard | Fixed | Implemented fallback copy mechanism (textarea and prompt dialog) to prevent NotAllowedError when Clipboard API is blocked due to focus loss after database sync. |
| 2026-05-19 19:54 | src/store/farmStore.ts | 561-567 | Preset | Fixed | Preserved activePresetId during loadFromCloud by checking if it exists in merged presets list, preventing automatic reset to first preset. |
| 2026-05-19 20:15 | src/store/farmStore.ts | Multiple | Sync | Fixed | Added lap `id` mapping and preserved UUIDs in `addLap`, `logAnimalSession`, `stopSession`, `loadFromCloud`, and `migrateToCloud` to prevent duplication of laps during cloud sync/migration. |
| 2026-05-19 20:15 | src/components/Dashboard.tsx | 257-262 | Timer | Fixed | Unified `lapId` generation in `handleNextJob` to share the same UUID between state and temporary finished lap object. |
| 2026-05-19 20:30 | src/app/shared/[id]/page.tsx, src/components/SharedSessionDetail.tsx, supabase/migrations/20260519140000_add_public_read_policies.sql | All | Feature | Added | Created detailed collapsible/expandable shared farm session detail component with loops, checkpoints, yields, and localization switcher; added public RLS policies for guest read access to configurations. |
| 2026-05-19 21:25 | src/app/icon.svg, public/icon.svg, src/app/layout.tsx | All | Design | Modified | Replaced default Next.js favicon.ico with a custom high-resolution SVG stopwatch+leaf logo to match the theme, and updated layout metadata. |
| 2026-05-19 21:30 | src/store/farmStore.ts, src/components/Analytics.tsx | 572-687, 72-73 | Sync | Removed | Completely removed `migrateToCloud` logic to prevent legacy local session data from duplicating laps on the cloud during user logins or session sharing. |
| 2026-05-20 14:00 | supabase/migrations/20260520140000_add_performance_indexes.sql, src/app/page.tsx, src/locales/* | All | Performance | Optimized | Added PostgreSQL indexes to all user_id/preset_id/session_id foreign keys, switched page load to a non-blocking background cloud sync, and introduced a pulsing Cloud Sync Status indicator. |
| 2026-05-20 14:10 | src/components/SharedSessionDetail.tsx | 258-397 | UI/UX | Redesigned | Redesigned public shared session page using a master-detail layout (paginated table on left, active checkpoint breakdown on right) for white jobs/loops, keeping animal farming simple. |
| 2026-05-20 14:20 | src/components/Dashboard.tsx, src/components/Configurator.tsx | Multiple | UI/UX | Fixed | Custom-rendered SelectValue component labels using render functions to resolve preset names, vehicle names/capacities, and processing type translations instead of raw UUIDs or keys. |
| 2026-05-20 15:34 | src/store/farmStore.ts | 547-565 | Sync | Fixed | Retained local-only planner selection states (selectedJobIds, calcVehicleId, route crafting fields) in loadFromCloud to prevent the UI from resetting when background cloud sync completes. |
| 2026-05-20 15:45 | src/components/SharedSessionDetail.tsx, src/locales/en.ts, th.ts | Multiple | Feature | Added | Added Goal Calculator section to shared session page: displays avg time/lap and avg eco/lap, with an input for visitors to enter a target money amount. System calculates required laps and estimated total time from session history. |
| 2026-05-20 21:30 | supabase/migrations/20260520213000_add_price_range_columns.sql | All | Schema | Added | Created SQL migration to add price range fields: `has_price_range`, `min_price_per_item`, `max_price_per_item` to `farm_jobs`; and `min_eco_earned`, `max_eco_earned` to `farm_laps`. |
| 2026-05-20 21:35 | src/store/farmStore.ts, src/locales/*.ts | Multiple | Model | Modified | Added min/max price and eco fields to Job/Lap interfaces, updated cloud sync mapping, and added Thai/English translation dictionary keys for fluctuating prices. |
| 2026-05-20 21:40 | src/components/Configurator.tsx | Multiple | UI/UX | Modified | Added "Price Fluctuates" toggle in job creation/editing modal, with min/max price inputs, and displaying range in Job List. |
| 2026-05-20 21:45 | src/components/Dashboard.tsx | Multiple | Logic | Modified | Configured dashboard planner to compute min/max total eco per lap and display range-based estimated time & cycles. Updated lap finishing logic and Session Summary Overlay to display approximate ranges when job price fluctuates. |
| 2026-05-20 21:50 | src/components/Analytics.tsx | Multiple | UI | Modified | Updated session list summary row, expanded stats summary, and lap details view to calculate and display min-max price ranges for fluctuating eco jobs. |
| 2026-05-20 21:55 | src/app/shared/[id]/page.tsx, src/components/SharedSessionDetail.tsx | Multiple | Feature | Modified | Mapped min/max eco range fields in shared session loader page, and updated shared session details view and its Goal Calculator to handle fluctuating prices with range bounds. |
| 2026-05-20 22:50 | src/app/page.tsx | 218-229 | Timer | Fixed | Switched tab rendering from conditional mount/unmount to CSS `display: none/block` so Dashboard, Configurator, and Analytics stay mounted; timer `useState` and `setInterval` persist across tab switches. |
| 2026-05-20 22:52 | src/components/Dashboard.tsx, src/components/Configurator.tsx | Multiple | SelectValue | Fixed | Removed function children from `<SelectValue>` (Radix UI incompatible pattern) and replaced with standard `placeholder` prop; Radix SelectItem text content now auto-renders. |
| 2026-05-20 22:55 | src/store/farmStore.ts | 220-265, 400-420 | DB Fallback | Fixed | Added graceful fallback in `addJob` and `stopSession` cloud inserts: if columns `min_price_per_item`/`min_eco_earned` don't exist (error 42703), retries insert without those columns. Prevents silent insert failures on un-migrated databases. |
| 2026-05-20 23:30 | debug-shared.mjs, test-*.js, scratch/, temp-farm/ | All | Security/Cleanup | Deleted | Removed 8 test/debug files containing hardcoded Supabase anon key and 1 file with plaintext credentials. Deleted empty temp-farm/ directory. |
| 2026-05-20 23:32 | src/store/farmStore.ts | Multiple | Error Handling | Fixed | Wrapped 6 unprotected cloud operations (removePreset, removeJob, removeVehicle, clearHistory, removeSession, updatePreset, toggleSessionPublic) in try/catch. Removed dead code: unused `session` variable in toggleSessionPublic, empty else branch in stopSession. |
| 2026-05-20 23:34 | src/components/Dashboard.tsx | 12, 748, 853-862 | Cleanup | Fixed | Removed unused `Briefcase` import. Replaced hardcoded Thai text and "Pocket Allocation" with t() translation keys. Fixed trailing `}` syntax error in template literal. |
| 2026-05-20 23:35 | src/components/Analytics.tsx | 8, 376 | Cleanup | Fixed | Removed unused `Zap` import. Replaced hardcoded Thai "ไม่มีข้อมูลผลลัพธ์วัตถุดิบ" with t("ana.noYieldData"). |
| 2026-05-20 23:36 | src/locales/en.ts, th.ts | 184-190 | i18n | Added | Added 5 missing translation keys: dash.pocketAllocation, dash.combinedIncome, dash.roundsToGoal, dash.incomeRange, ana.noYieldData. |
| 2026-05-20 23:37 | src/components/ui/table.tsx, dialog.tsx | All | Cleanup | Deleted | Removed unused Shadcn UI components (never imported anywhere). |
| 2026-05-20 23:38 | package.json | 20, 32 | Cleanup | Modified | Moved `shadcn` CLI tool from dependencies to devDependencies. |
| 2026-05-23 23:08 | supabase/migrations/20260523223000_add_pocket_mode_columns.sql | All | Schema | Added | SQL migration to add `pocket_mode` (TEXT, default 'limit') and `pocket_kilo_limit` (NUMERIC, default 30) columns to `farm_presets` table for cloud sync of pocket capacity toggle. |
| 2026-05-23 23:08 | src/store/farmStore.ts | 5-21, 139, 149-167, 182-189, 533-545, 656-673 | Model/Sync | Modified | Extended `Preset` interface with `pocketMode` and `pocketKiloLimit`. Updated default state, `addPreset` (with Supabase insert), `updatePreset` (with Supabase mapping), `loadFromCloud` (with cloud retrieval), and `onRehydrateStorage` (with auto-migration for legacy presets). |
| 2026-05-23 23:08 | src/components/Dashboard.tsx | 139-147, 612-666 | Logic/UI | Modified | Updated `pocketSets` calculation to dynamically switch between Limit (`jobItemLimit`) and Kilo (`Math.floor(pocketKiloLimit / totalWeightPerSet)`) modes. Replaced flat job limit input with premium dual-mode toggle UI: Limit System / Kilo System buttons with conditional input fields. |
| 2026-05-23 23:08 | src/locales/en.ts, th.ts | 32-36 | i18n | Added | Added 4 translation keys: dash.pocketMode, dash.limitMode, dash.kiloMode, dash.pocketKiloLimit in both English and Thai. |

