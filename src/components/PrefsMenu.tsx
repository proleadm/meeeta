'use client';

import { Settings, Clock, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { usePrefs } from '@/state/usePrefs';
import { getLocalTimezone, listCommonCities } from '@/lib/time';
import { useMounted } from '@/hooks/useMounted';

export function PrefsMenu() {
  const mounted = useMounted();
  const format = usePrefs(state => state.prefs.format);
  const homeTimezone = usePrefs(state => state.prefs.homeTZ);
  const setFormat = usePrefs(state => state.setFormat);
  const setHomeTZ = usePrefs(state => state.setHomeTZ);
  if (!mounted) return null;
  
  const commonTimezones = [
    { value: getLocalTimezone(), label: 'Local Time' },
    ...listCommonCities().map(city => ({
      value: city.timezone,
      label: `${city.name} (${city.country})`,
    })),
  ];
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Preferences</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Time Format Toggle */}
        <div className="px-2 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm">24-hour format</span>
            </div>
            <Switch
              checked={format === '24h'}
              onCheckedChange={(checked) => setFormat(checked ? '24h' : '12h')}
            />
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Home Timezone Selection */}
        <div className="px-2 py-2">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-4 w-4" />
            <span className="text-sm font-medium">Home Timezone</span>
          </div>
          <Select value={homeTimezone} onValueChange={setHomeTZ}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {commonTimezones.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
