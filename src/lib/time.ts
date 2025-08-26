import { DateTime } from 'luxon';

export interface City {
  id: string;
  name: string;
  timezone: string;
  country: string;
  isPinned: boolean;
}

export type TimeFormat = '12h' | '24h';

/**
 * Get current time in a specific timezone
 */
export function nowInTZ(timezone: string): DateTime {
  return DateTime.now().setZone(timezone);
}

/**
 * Format time according to user preference
 */
export function formatTime(date: DateTime, format: TimeFormat): string {
  if (format === '12h') {
    return date.toFormat('h:mm a');
  }
  return date.toFormat('HH:mm');
}

/**
 * Format date with timezone info
 */
export function formatTimeWithDate(date: DateTime, format: TimeFormat): string {
  const timeStr = formatTime(date, format);
  const dateStr = date.toFormat('MMM d');
  return `${timeStr} • ${dateStr}`;
}

/**
 * Get timezone offset string (e.g., "UTC+9", "UTC-5")
 */
export function getTimezoneOffset(timezone: string): string {
  const dt = DateTime.now().setZone(timezone);
  const offset = dt.offset;
  const hours = Math.floor(Math.abs(offset) / 60);
  const minutes = Math.abs(offset) % 60;
  
  const sign = offset >= 0 ? '+' : '-';
  const hoursStr = hours.toString();
  const minutesStr = minutes > 0 ? `:${minutes.toString().padStart(2, '0')}` : '';
  
  return `UTC${sign}${hoursStr}${minutesStr}`;
}

/**
 * List of common cities with their timezones
 */
export function listCommonCities(): City[] {
  return [
    { id: 'new-york', name: 'New York', timezone: 'America/New_York', country: 'United States', isPinned: false },
    { id: 'los-angeles', name: 'Los Angeles', timezone: 'America/Los_Angeles', country: 'United States', isPinned: false },
    { id: 'london', name: 'London', timezone: 'Europe/London', country: 'United Kingdom', isPinned: false },
    { id: 'paris', name: 'Paris', timezone: 'Europe/Paris', country: 'France', isPinned: false },
    { id: 'tokyo', name: 'Tokyo', timezone: 'Asia/Tokyo', country: 'Japan', isPinned: false },
    { id: 'sydney', name: 'Sydney', timezone: 'Australia/Sydney', country: 'Australia', isPinned: false },
    { id: 'singapore', name: 'Singapore', timezone: 'Asia/Singapore', country: 'Singapore', isPinned: false },
    { id: 'hong-kong', name: 'Hong Kong', timezone: 'Asia/Hong_Kong', country: 'Hong Kong', isPinned: false },
    { id: 'dubai', name: 'Dubai', timezone: 'Asia/Dubai', country: 'United Arab Emirates', isPinned: false },
    { id: 'mumbai', name: 'Mumbai', timezone: 'Asia/Kolkata', country: 'India', isPinned: false },
    { id: 'beijing', name: 'Beijing', timezone: 'Asia/Shanghai', country: 'China', isPinned: false },
    { id: 'moscow', name: 'Moscow', timezone: 'Europe/Moscow', country: 'Russia', isPinned: false },
    { id: 'berlin', name: 'Berlin', timezone: 'Europe/Berlin', country: 'Germany', isPinned: false },
    { id: 'toronto', name: 'Toronto', timezone: 'America/Toronto', country: 'Canada', isPinned: false },
    { id: 'chicago', name: 'Chicago', timezone: 'America/Chicago', country: 'United States', isPinned: false },
    { id: 'denver', name: 'Denver', timezone: 'America/Denver', country: 'United States', isPinned: false },
    { id: 'mexico-city', name: 'Mexico City', timezone: 'America/Mexico_City', country: 'Mexico', isPinned: false },
    { id: 'sao-paulo', name: 'São Paulo', timezone: 'America/Sao_Paulo', country: 'Brazil', isPinned: false },
    { id: 'buenos-aires', name: 'Buenos Aires', timezone: 'America/Argentina/Buenos_Aires', country: 'Argentina', isPinned: false },
    { id: 'cairo', name: 'Cairo', timezone: 'Africa/Cairo', country: 'Egypt', isPinned: false },
    { id: 'johannesburg', name: 'Johannesburg', timezone: 'Africa/Johannesburg', country: 'South Africa', isPinned: false },
    { id: 'istanbul', name: 'Istanbul', timezone: 'Europe/Istanbul', country: 'Turkey', isPinned: false },
    { id: 'seoul', name: 'Seoul', timezone: 'Asia/Seoul', country: 'South Korea', isPinned: false },
    { id: 'bangkok', name: 'Bangkok', timezone: 'Asia/Bangkok', country: 'Thailand', isPinned: false },
    { id: 'jakarta', name: 'Jakarta', timezone: 'Asia/Jakarta', country: 'Indonesia', isPinned: false },
  ];
}

/**
 * Search cities by name (case-insensitive)
 */
export function searchCities(query: string): City[] {
  if (!query.trim()) {
    return listCommonCities();
  }
  
  const normalizedQuery = query.toLowerCase().trim();
  return listCommonCities().filter(city => 
    city.name.toLowerCase().includes(normalizedQuery) ||
    city.country.toLowerCase().includes(normalizedQuery)
  );
}

/**
 * Normalize timezone input - convert city names to IANA timezone identifiers
 */
export function normalizeTZ(input: string): string {
  // If it's already a valid IANA timezone, return as-is
  if (input.includes('/')) {
    return input;
  }
  
  // Try to find matching city
  const city = listCommonCities().find(c => 
    c.name.toLowerCase() === input.toLowerCase()
  );
  
  return city?.timezone || input;
}

/**
 * Get user's local timezone
 */
export function getLocalTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Check if a timezone is valid
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    DateTime.now().setZone(timezone);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get relative time difference between two timezones
 */
export function getTimeDifference(fromTz: string, toTz: string): string {
  const fromTime = DateTime.now().setZone(fromTz);
  const toTime = DateTime.now().setZone(toTz);
  
  const diffMinutes = toTime.offset - fromTime.offset;
  const diffHours = diffMinutes / 60;
  
  if (diffHours === 0) {
    return 'Same time';
  }
  
  const absHours = Math.abs(diffHours);
  const sign = diffHours > 0 ? '+' : '-';
  
  if (absHours === Math.floor(absHours)) {
    return `${sign}${absHours}h`;
  } else {
    const hours = Math.floor(absHours);
    const minutes = (absHours - hours) * 60;
    return `${sign}${hours}h ${minutes}m`;
  }
}
