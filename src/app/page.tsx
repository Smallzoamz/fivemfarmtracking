"use client";
import { useState, useEffect } from "react"
import { Configurator } from "@/components/Configurator"
import { Dashboard } from "@/components/Dashboard"
import { Analytics } from "@/components/Analytics"
import { useTranslation } from "@/hooks/useTranslation"
import { Timer, LayoutDashboard, Settings, BarChart3, LogOut, User, Cloud } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useFarmStore } from "@/store/farmStore"

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const { t, language, setLanguage } = useTranslation()
  const [displayName, setDisplayName] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  
  const setUserId = useFarmStore(state => state.setUserId)
  const loadFromCloud = useFarmStore(state => state.loadFromCloud)
  const isCloudSyncing = useFarmStore(state => state.isCloudSyncing)

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error || !data.session) {
          router.push("/login")
          return;
        }

        if (mounted) {
          setDisplayName(data.session.user.user_metadata?.display_name || data.session.user.email?.split('@')[0] || "User")
          setUserId(data.session.user.id)
          
          // Trigger cloud fetch in the background without blocking the UI
          loadFromCloud().catch(err => console.error("Cloud load background error:", err));
        }
      } catch (err) {
        console.error("Auth check error:", err);
        router.push("/login");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        setUserId(null)
        router.push("/login")
      } else if (mounted) {
        setDisplayName(session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || "User")
        setUserId(session.user.id)
        
        // Trigger cloud fetch in the background on auth change
        loadFromCloud().catch(err => console.error("Cloud load on auth change error:", err));
        setLoading(false)
      }
    })

    return () => {
      mounted = false;
      subscription.unsubscribe()
    }
  }, [router, setUserId, loadFromCloud])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const tabs = [
    { id: "dashboard", icon: LayoutDashboard, label: t("nav.dashboard") },
    { id: "configurator", icon: Settings, label: t("nav.configurator") },
    { id: "analytics", icon: BarChart3, label: t("nav.analytics") },
  ];

  if (loading) {
    return (
      <main className="min-h-screen bg-background relative overflow-hidden p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8 relative z-10 pt-6">
          {/* Header Skeleton */}
          <header className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/20 animate-pulse rounded-xl"></div>
              <div className="space-y-2">
                <div className="h-7 w-48 bg-primary/20 animate-pulse rounded-md"></div>
                <div className="h-3 w-24 bg-muted animate-pulse rounded-md"></div>
              </div>
            </div>
            <div className="flex gap-2 p-1 rounded-xl bg-card border border-border/50">
              <div className="w-24 h-9 bg-muted animate-pulse rounded-lg"></div>
              <div className="w-24 h-9 bg-muted animate-pulse rounded-lg"></div>
              <div className="w-24 h-9 bg-muted animate-pulse rounded-lg"></div>
            </div>
          </header>

          {/* Main Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (Planner) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="h-[400px] bg-card/60 animate-pulse rounded-xl border border-border/50"></div>
            </div>
            
            {/* Right Column (Timer & Stats) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Timer Box */}
              <div className="h-[250px] bg-card/60 animate-pulse rounded-xl border border-border/50"></div>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 bg-card/60 animate-pulse rounded-xl border border-border/50"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-30%] left-[-15%] w-[60%] h-[60%] bg-[oklch(0.72_0.19_275/0.08)] blur-[150px] rounded-full animate-float" />
        <div className="absolute bottom-[-25%] right-[-10%] w-[50%] h-[50%] bg-[oklch(0.60_0.18_240/0.06)] blur-[120px] rounded-full animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-[40%] right-[20%] w-[25%] h-[25%] bg-[oklch(0.70_0.20_300/0.04)] blur-[100px] rounded-full animate-pulse-glow" />
      </div>

      {/* Subtle Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, oklch(0.72 0.19 275) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      {/* Top Right Controls (Language & User) */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        {/* Cloud Sync Status Indicator */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all duration-300 backdrop-blur-md text-xs font-bold bg-card/85 border-border text-muted-foreground`}
          title={isCloudSyncing ? t("nav.syncing") : t("nav.connected")}
        >
          <div className="relative flex h-2 w-2">
            {isCloudSyncing && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isCloudSyncing ? 'bg-emerald-500' : 'bg-primary/60'}`}></span>
          </div>
          <Cloud className="w-3.5 h-3.5" />
          <span className="text-[10px] uppercase hidden sm:inline tracking-wide font-black">
            {isCloudSyncing ? t("nav.syncing") : t("nav.connected")}
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card/80 backdrop-blur-md border border-border">
          <User className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-bold text-foreground truncate max-w-[100px]">{displayName}</span>
          <button 
            onClick={handleLogout}
            className="ml-2 text-muted-foreground hover:text-destructive transition-colors"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
        <button 
          onClick={() => setLanguage(language === 'en' ? 'th' : 'en')}
          className="px-3 py-1.5 rounded-lg bg-card/80 backdrop-blur-md text-xs font-bold text-primary border border-border hover:bg-primary/10 hover:border-primary/40 transition-all duration-200"
        >
          {language === 'en' ? '🇹🇭 TH' : '🇺🇸 EN'}
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 blur-xl rounded-xl" />
              <div className="relative p-2.5 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl border border-primary/30">
                <Timer className="w-7 h-7 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-[oklch(0.78_0.16_260)] via-primary to-[oklch(0.65_0.22_300)] bg-clip-text text-transparent">
                  {t("nav.title")}
                </span>
              </h1>
              <p className="text-xs text-muted-foreground font-medium tracking-wider uppercase">v2.0 — Pro Edition</p>
            </div>
          </div>
          
          <nav className="flex gap-1 p-1 rounded-xl bg-card/60 backdrop-blur-md border border-border/60">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </header>

        {/* Content */}
        <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out">
          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "configurator" && <Configurator />}
          {activeTab === "analytics" && <Analytics />}
        </div>
      </div>
    </main>
  )
}
