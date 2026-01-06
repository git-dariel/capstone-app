# Year Level Filter Fix

## Issue Description

When filtering by year level (e.g., "2nd Year") after selecting a program, the student list was not updating correctly. Students from all year levels were still showing instead of only those matching the selected year level.

### Root Cause

The issue was in the `updateFilters` function in `useSimplifiedInsights.ts`. When filters were updated:

1. The function would merge the new filters with existing filters
2. Call `setState` to update the state (asynchronous operation)
3. Call `selectProgram(currentProgram)` to re-fetch students

The problem was that `selectProgram` was reading from `state.filters`, which **hadn't been updated yet** because `setState` is asynchronous. This meant the year level filter was being ignored when re-fetching students.

### Example of the Bug

```typescript
// User selects program "BSIT" then filters by "2nd Year"
updateFilters({ yearLevel: "2nd" });

// Inside updateFilters:
const mergedFilters = { ...state.filters, yearLevel: "2nd" }; // ✅ Correct
setState({ filters: mergedFilters }); // ⚠️ Async - state not updated immediately
await selectProgram("BSIT"); // ❌ Still using OLD state.filters (without yearLevel!)
```

## Solution

Modified the `selectProgram` function to accept optional filter overrides:

```typescript
const selectProgram = useCallback(
  async (program: string, filterOverrides?: ChartFilters) => {
    // Use filter overrides if provided, otherwise use state filters
    const activeFilters = filterOverrides || state.filters;
    
    // Build API filter using activeFilters instead of state.filters
    // ...
  },
  [state.assessmentType, state.filters]
);
```

And updated `updateFilters` to pass the merged filters:

```typescript
const updateFilters = useCallback(
  async (newFilters: ChartFilters) => {
    const mergedFilters = { ...state.filters, ...newFilters };
    
    // Update state
    setState((prev) => ({ ...prev, filters: mergedFilters }));
    
    // Re-fetch with new filters
    await fetchInsights(state.assessmentType, mergedFilters);
    
    // If program selected, re-fetch students with merged filters
    if (currentProgram) {
      await selectProgram(currentProgram, mergedFilters); // ✅ Pass merged filters
    }
  },
  [state.assessmentType, state.filters, state.selectedProgram, fetchInsights, selectProgram]
);
```

## Changes Made

### File: `src/hooks/useSimplifiedInsights.ts`

1. **Updated `selectProgram` signature** to accept optional `filterOverrides` parameter
2. **Added logic** to use filter overrides when provided, falling back to state filters
3. **Updated `updateFilters`** to pass merged filters to `selectProgram`
4. **Added debug logging** to track filter values and student counts

## Testing

After this fix, the filter flow works as follows:

1. User selects program "BSIT" → Shows all BSIT students
2. User filters by "2nd Year" → Shows only BSIT students in 2nd year
3. User filters by "Male" → Shows only BSIT, 2nd year, male students
4. All filters are properly applied and student list updates correctly

### Console Logs

You can verify the fix is working by checking the browser console:

```
🔄 updateFilters called: { newFilters: { yearLevel: "2nd" }, ... }
🔍 selectProgram called with: { program: "BSIT", activeFilters: { yearLevel: "2nd" }, ... }
📡 Fetching students with metricFilter: { program: "BSIT", yearLevel: "2nd" }
✅ Received students: { count: X, students: [...] }
```

## Database Schema

The `Student` model stores year as a string with values: `"1st"`, `"2nd"`, `"3rd"`, `"4th"`

The comparison in the backend (metrics.config.ts) is case-insensitive:

```typescript
if (filter.yearLevel && student.year.toLowerCase() !== filter.yearLevel.toLowerCase()) {
  return; // Filter out student
}
```

## Related Files

- `src/hooks/useSimplifiedInsights.ts` - Main hook with the fix
- `src/components/organisms/SimplifiedInsightsContent.tsx` - UI component that calls the filters
- `capstone-api/config/metrics.config.ts` - Backend filter logic
- `capstone-api/prisma/schema/student.prisma` - Database schema

## Additional Fix: Severity Case-Sensitivity

### Issue
The Program Summary card was showing "0" for High Risk and Moderate Risk counts even when students had those severity levels. This was because:

1. The API returns severity values in **lowercase** (e.g., "moderate", "mild", "severe")
2. The frontend was checking for **capitalized** values (e.g., "Moderate", "Mild", "Severe")

### Solution
Made severity comparisons case-insensitive in two places:

1. **Program Summary Card Risk Counts:**
```typescript
// Before
s.severity === "Moderate" || s.severity === "Mild"

// After
s.severity?.toLowerCase() === "moderate" || s.severity?.toLowerCase() === "mild"
```

2. **Severity Colors Mapping:**
Added lowercase variants to handle API responses:
```typescript
const severityColors: Record<string, string> = {
  Minimal: "#10b981",
  minimal: "#10b981",  // Added lowercase
  Moderate: "#f59e0b",
  moderate: "#f59e0b", // Added lowercase
  // ... etc
};
```

3. **Display Normalization:**
Capitalized severity names for consistent display:
```typescript
name: severity.charAt(0).toUpperCase() + severity.slice(1)
```

Now the Program Summary correctly shows:
- **Total Students:** 3
- **High Risk:** 0 (students with "severe" or "extremely severe")
- **Moderate Risk:** 2 (students with "moderate" or "mild")

## Future Improvements

1. Consider adding unit tests for the filter logic
2. Add TypeScript strict types for filter parameters
3. Consider adding a "Clear Filters" button
4. Add loading states for individual filter changes
5. Consider debouncing filter updates if performance becomes an issue
6. Standardize severity values across frontend and backend (either all lowercase or all capitalized)

## Severity Level Mapping Across Assessment Types

Different assessment types use different severity level naming conventions:

### DASS-21 Based Assessments (Anxiety, Depression)
- **Minimal** / **minimal** → Green (#10b981) - Low risk
- **Mild** / **mild** → Yellow (#fbbf24) - Moderate risk
- **Moderate** / **moderate** → Orange (#f59e0b) - Moderate risk
- **Severe** / **severe** → Red (#ef4444) - High risk
- **Extremely Severe** / **extremely severe** → Dark Red (#dc2626) - High risk

### Stress Assessment
- **low** → Green (#10b981) - Moderate risk (counted as moderate in summary)
- **moderate** → Orange (#f59e0b) - Moderate risk
- **high** → Red (#ef4444) - High risk

### Suicide Risk Assessment
- **low** → Green (#10b981) - Moderate risk (counted as moderate in summary)
- **high** → Red (#ef4444) - High risk

### Risk Classification Logic

**High Risk Count** includes:
- `severe`, `extremely severe`, `high`

**Moderate Risk Count** includes:
- `moderate`, `mild`, `low`, `normal`

This mapping ensures that all assessment types display correctly in:
- Severity Distribution pie chart
- Program Summary risk counts
- Student list severity badges