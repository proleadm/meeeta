# Infinite Loop Fix - WorldClocked

## Issue Description
The application was experiencing a "Maximum update depth exceeded" error, which is a React infinite loop caused by components repeatedly calling setState during render cycles.

## Root Cause Analysis
The infinite loop was caused by **array mutation** in two places:

### 1. `useSortedCities` Hook
**Problem**: The hook was calling `sort()` directly on the array returned from Zustand store, which mutates the original array and triggers infinite re-renders.

```typescript
// ❌ BEFORE (caused infinite loop)
export const useSortedCities = () => {
  const cities = usePrefs(state => state.cities);
  
  return cities.sort((a, b) => {  // ← Mutating original array!
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });
};
```

### 2. `togglePin` Function
**Problem**: Similar issue where `sort()` was potentially mutating the array before setting it back to the store.

```typescript
// ❌ BEFORE (potential mutation)
const sortedCities = updatedCities.sort((a, b) => {  // ← Could mutate!
  if (a.isPinned && !b.isPinned) return -1;
  if (!a.isPinned && b.isPinned) return 1;
  return 0;
});
```

## Solution Applied

### 1. Fixed `useSortedCities` Hook
```typescript
// ✅ AFTER (fixed with spread operator + useMemo)
export const useSortedCities = () => {
  const cities = usePrefs(state => state.cities);
  
  // Use useMemo to prevent unnecessary re-sorts
  return useMemo(() => {
    // Create a new array to avoid mutating the original
    return [...cities].sort((a, b) => {  // ← Spread creates new array!
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  }, [cities]);
};
```

### 2. Fixed `togglePin` Function
```typescript
// ✅ AFTER (fixed with spread operator)
const sortedCities = [...updatedCities].sort((a, b) => {  // ← Spread creates new array!
  if (a.isPinned && !b.isPinned) return -1;
  if (!a.isPinned && b.isPinned) return 1;
  return 0;
});
```

## Key Improvements

### 1. **Array Immutability**
- Used spread operator (`[...array]`) to create new arrays before sorting
- Prevents mutation of original arrays from Zustand store
- Follows React best practices for state management

### 2. **Performance Optimization**
- Added `useMemo` to `useSortedCities` to prevent unnecessary re-sorts
- Only re-sorts when the `cities` array actually changes
- Reduces computational overhead

### 3. **Consistent Pattern**
- Applied the same immutable pattern to both sorting locations
- Ensures consistency across the codebase
- Prevents similar issues in the future

## Verification

### Build Status
- ✅ **Build**: Successful with no errors
- ✅ **Linting**: No TypeScript or ESLint errors
- ✅ **Server**: Running without crashes

### Testing Results
- ✅ **Page Load**: Application loads without infinite loop error
- ✅ **Functionality**: All features remain intact
- ✅ **Performance**: No degradation in performance

## Technical Details

### Why This Happened
1. **Zustand Store**: Returns the same array reference for performance
2. **Array.sort()**: Mutates the original array in-place
3. **React Re-render**: Mutation triggers state change detection
4. **Infinite Loop**: Component re-renders → sort mutates → triggers re-render → repeat

### Why The Fix Works
1. **Spread Operator**: Creates a new array with the same elements
2. **New Reference**: React sees it as a different array (no mutation)
3. **useMemo**: Prevents unnecessary re-computations
4. **Stable Renders**: No more infinite re-render cycles

## Prevention Guidelines

To prevent similar issues in the future:

1. **Never mutate arrays/objects from state stores directly**
2. **Always create new arrays/objects when modifying**
3. **Use spread operator or Array.from() for array copies**
4. **Use useMemo for expensive computations**
5. **Test thoroughly after state management changes**

## Status
🎉 **FIXED** - Application now runs without infinite loop errors and maintains all functionality.
