import { CityList } from '@/components/CityList';
import { AddCityDialog } from '@/components/AddCityDialog';
import { PrefsMenu } from '@/components/PrefsMenu';
import HomeTimeBar from '@/components/HomeTimeBar';

export default function ClocksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/5">
      <div className="container max-w-[1800px] mx-auto px-4 py-8 space-y-10">
        {/* Compact Hero Section */}
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/15 mb-3">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-primary">Live Global Time Dashboard</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
              World Clock
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Stay synchronized with your global team, clients, and partners across every timezone
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <AddCityDialog />
            <PrefsMenu />
          </div>
        </div>

        {/* Subtle divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-border/50 to-transparent"></div>
          </div>
          <div className="relative flex justify-center">
            <div className="bg-background px-4">
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 bg-primary/40 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-primary/60 rounded-full"></div>
                <div className="w-1 h-1 bg-primary/40 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <HomeTimeBar />

        {/* Cities Section */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-foreground mb-1">Your Time Zones</h2>
            <p className="text-sm text-muted-foreground">Monitor time across your most important locations</p>
          </div>
          <CityList />
        </div>
      </div>
    </div>
  );
}
