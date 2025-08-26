import { DateTime } from 'luxon';

/**
 * Get timezone abbreviation for display
 */
export function getTimezoneAbbreviation(timezone: string): string {
  const abbrevMap: Record<string, string> = {
    'America/New_York': 'EST/EDT',
    'America/Chicago': 'CST/CDT', 
    'America/Denver': 'MST/MDT',
    'America/Los_Angeles': 'PST/PDT',
    'Europe/London': 'GMT/BST',
    'Europe/Paris': 'CET/CEST',
    'Europe/Berlin': 'CET/CEST',
    'Asia/Tokyo': 'JST',
    'Asia/Shanghai': 'CST',
    'Asia/Kolkata': 'IST',
    'Asia/Dubai': 'GST',
    'Australia/Sydney': 'AEST/AEDT',
    'Pacific/Auckland': 'NZST/NZDT'
  };
  
  return abbrevMap[timezone] || timezone.split('/').pop()?.replace('_', ' ') || 'UTC';
}

/**
 * Format UTC offset for display (e.g., "UTC-4", "UTC+5:30")
 */
export function formatUtcOffset(timezone: string): string {
  const dt = DateTime.now().setZone(timezone);
  const offset = dt.offset;
  
  if (offset === 0) return 'UTC';
  
  const hours = Math.floor(Math.abs(offset) / 60);
  const minutes = Math.abs(offset) % 60;
  const sign = offset > 0 ? '+' : '-';
  
  if (minutes === 0) {
    return `UTC${sign}${hours}`;
  } else {
    return `UTC${sign}${hours}:${minutes.toString().padStart(2, '0')}`;
  }
}

/**
 * Calculate and format relative time delta between two timezones
 */
export function formatOffsetDelta(sourceDt: DateTime, targetTz: string): {
  relLabel: string;
  dayOffsetLabel: string | null;
} {
  const targetDt = sourceDt.setZone(targetTz);
  const diffHours = (targetDt.offset - sourceDt.offset) / 60;
  const abs = Math.abs(diffHours);
  
  // Round to nearest 0.5 hour for display
  const roundedHours = Math.round(abs * 2) / 2;
  
  let relLabel: string;
  if (roundedHours === 0) {
    relLabel = 'Same as source';
  } else {
    const direction = diffHours > 0 ? 'ahead' : 'behind';
    const sourceTzName = sourceDt.zoneName?.split('/').pop()?.replace('_', ' ') || 'source';
    relLabel = `${roundedHours}h ${direction} ${sourceTzName}`;
  }
  
  // Calculate day offset
  const dayDelta = targetDt.startOf('day').diff(sourceDt.startOf('day'), 'days').days;
  let dayOffsetLabel: string | null = null;
  if (dayDelta !== 0) {
    dayOffsetLabel = `${dayDelta > 0 ? '+' : ''}${Math.round(dayDelta)} day${Math.abs(Math.round(dayDelta)) !== 1 ? 's' : ''}`;
  }
  
  return { relLabel, dayOffsetLabel };
}

/**
 * Get country code for flag display
 */
export function getCountryCode(country: string): string {
  const countryCodeMap: Record<string, string> = {
    'United States': 'us',
    'United Kingdom': 'gb',
    'France': 'fr',
    'Germany': 'de',
    'Japan': 'jp',
    'China': 'cn',
    'India': 'in',
    'Australia': 'au',
    'Canada': 'ca',
    'Brazil': 'br',
    'Russia': 'ru',
    'South Korea': 'kr',
    'Italy': 'it',
    'Spain': 'es',
    'Netherlands': 'nl',
    'Switzerland': 'ch',
    'Sweden': 'se',
    'Norway': 'no',
    'Denmark': 'dk',
    'Finland': 'fi',
    'Belgium': 'be',
    'Austria': 'at',
    'Ireland': 'ie',
    'Portugal': 'pt',
    'Greece': 'gr',
    'Poland': 'pl',
    'Czech Republic': 'cz',
    'Hungary': 'hu',
    'Romania': 'ro',
    'Bulgaria': 'bg',
    'Croatia': 'hr',
    'Slovenia': 'si',
    'Slovakia': 'sk',
    'Estonia': 'ee',
    'Latvia': 'lv',
    'Lithuania': 'lt',
    'Luxembourg': 'lu',
    'Malta': 'mt',
    'Cyprus': 'cy',
    'Iceland': 'is',
    'New Zealand': 'nz',
    'Singapore': 'sg',
    'Hong Kong': 'hk',
    'Taiwan': 'tw',
    'South Africa': 'za',
    'Egypt': 'eg',
    'Israel': 'il',
    'Turkey': 'tr',
    'Saudi Arabia': 'sa',
    'UAE': 'ae',
    'Thailand': 'th',
    'Malaysia': 'my',
    'Indonesia': 'id',
    'Philippines': 'ph',
    'Vietnam': 'vn',
    'Mexico': 'mx',
    'Argentina': 'ar',
    'Chile': 'cl',
    'Colombia': 'co',
    'Peru': 'pe',
    'Venezuela': 've',
    'Uruguay': 'uy',
    'Ecuador': 'ec',
    'Bolivia': 'bo',
    'Paraguay': 'py'
  };
  
  return countryCodeMap[country] || 'un';
}
