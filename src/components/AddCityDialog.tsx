'use client';

import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { searchCities } from '@/lib/time';
import { usePrefs } from '@/state/usePrefs';

export function AddCityDialog() {
  const [searchQuery, setSearchQuery] = useState('');
  const addCity = usePrefs(state => state.addCity);
  
  const searchResults = searchCities(searchQuery);
  
  const handleAddCity = (city: typeof searchResults[0]) => {
    addCity({
      id: city.id,
      name: city.name,
      timezone: city.timezone,
      country: city.country,
    });
    setSearchQuery('');
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add City
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add City</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>
          
          <div className="max-h-60 overflow-y-auto space-y-1">
            {searchResults.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No cities found
              </p>
            ) : (
              searchResults.map((city) => (
                <DialogClose asChild key={city.id}>
                  <button
                    onClick={() => handleAddCity(city)}
                    className="w-full text-left p-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <div className="font-medium">{city.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {city.country}
                    </div>
                  </button>
                </DialogClose>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
