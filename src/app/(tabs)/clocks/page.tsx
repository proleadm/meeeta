import { CityList } from '@/components/CityList';
import { AddCityDialog } from '@/components/AddCityDialog';
import { PrefsMenu } from '@/components/PrefsMenu';
import HomeTimeBar from '@/components/HomeTimeBar';

export default function ClocksPage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">World Clock</h1>
          <p className="text-muted-foreground mt-1">Keep track of time across the globe</p>
        </div>
        <div className="flex gap-2">
          <AddCityDialog />
          <PrefsMenu />
        </div>
      </div>

      <HomeTimeBar />

      <CityList />
    </div>
  );
}
