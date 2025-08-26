import { CityList } from '@/components/CityList';
import { AddCityDialog } from '@/components/AddCityDialog';
import { PrefsMenu } from '@/components/PrefsMenu';
import HomeTimeBar from '@/components/HomeTimeBar';

export default function ClocksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container max-w-7xl mx-auto px-4 py-12 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              World Clock
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Keep track of time across the globe with precision and style
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <AddCityDialog />
            <PrefsMenu />
          </div>
        </div>

        {/* Divider with gradient */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gradient-to-r from-transparent via-border to-transparent"></div>
          </div>
          <div className="relative flex justify-center">
            <div className="bg-background px-4">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
            </div>
          </div>
        </div>

        <HomeTimeBar />

        <CityList />
      </div>
    </div>
  );
}
