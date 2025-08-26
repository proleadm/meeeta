'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Plus, Check } from 'lucide-react';
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

interface AddCityDialogProps {
  children?: React.ReactNode;
}

export function AddCityDialog({ children }: AddCityDialogProps = {}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const addCity = usePrefs(state => state.addCity);
  const existingCities = usePrefs(state => state.cities);
  
  const searchResults = searchCities(searchQuery);
  
  // Filter out already added cities
  const filteredResults = searchResults.filter(city => 
    !existingCities.some(existing => existing.id === city.id)
  );
  
  const handleAddCity = (city: typeof searchResults[0]) => {
    addCity({
      id: city.id,
      name: city.name,
      timezone: city.timezone,
      country: city.country,
    });
    setSearchQuery('');
    setSelectedIndex(0);
    setIsOpen(false);
  };

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedIndex(0);
      // Focus input after dialog animation
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredResults.length]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredResults[selectedIndex]) {
          handleAddCity(filteredResults[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button 
            size="sm" 
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Add a new city to track"
          >
            <Plus className="h-4 w-4" />
            Add City
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle>Add City</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              autoComplete="off"
              aria-label="Search for cities to add"
            />
          </div>
          
          <div className="max-h-60 overflow-y-auto space-y-1" role="listbox">
            {filteredResults.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-8 space-y-2">
                {searchQuery ? (
                  <>
                    <p>No cities found for "{searchQuery}"</p>
                    <p className="text-xs">Try searching for a different city name</p>
                  </>
                ) : (
                  <>
                    <p>Start typing to search for cities</p>
                    <p className="text-xs">Search by city name or country</p>
                  </>
                )}
              </div>
            ) : (
              filteredResults.map((city, index) => {
                const isAlreadyAdded = existingCities.some(existing => existing.id === city.id);
                const isSelected = index === selectedIndex;
                
                return (
                  <button
                    key={city.id}
                    onClick={() => handleAddCity(city)}
                    disabled={isAlreadyAdded}
                    className={`w-full text-left p-3 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      isSelected 
                        ? 'bg-accent text-accent-foreground' 
                        : 'hover:bg-accent hover:text-accent-foreground'
                    } ${isAlreadyAdded ? 'opacity-50 cursor-not-allowed' : ''}`}
                    role="option"
                    aria-selected={isSelected}
                    aria-label={`Add ${city.name}, ${city.country}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{city.name}</div>
                        <div className="text-sm text-muted-foreground truncate">
                          {city.country} • {city.timezone}
                        </div>
                      </div>
                      {isAlreadyAdded && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
                          <Check className="h-3 w-3" />
                          Added
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {filteredResults.length > 0 && (
            <div className="text-xs text-muted-foreground text-center pt-2 border-t">
              Use ↑↓ arrows to navigate, Enter to select, Esc to close
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}