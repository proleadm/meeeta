import { CityList } from '@/components/CityList';
import { AddCityDialog } from '@/components/AddCityDialog';
import { PrefsMenu } from '@/components/PrefsMenu';
import HomeTimeBar from '@/components/HomeTimeBar';

export default function ClocksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/5">
      <div className="max-w-7xl mx-auto px-6 py-4 space-y-6">
        {/* Compact Header with Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                World Clock Dashboard
              </h1>
            </div>
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Live Updates</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AddCityDialog />
            <PrefsMenu />
          </div>
        </div>

        {/* Enhanced Home Time Bar */}
        <HomeTimeBar />

        {/* Cities Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Global Time Zones</h2>
                <p className="text-xs text-muted-foreground">Track time across your important locations</p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Updated every second
            </div>
          </div>
          <CityList />
        </div>
      </div>
    </div>
  );
}
