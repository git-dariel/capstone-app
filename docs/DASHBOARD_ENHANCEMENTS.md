# Dashboard Enhancements - Program Filter & Assessment Type Filter

## Overview
This document describes the enhancements made to the dashboard to improve filtering capabilities:
1. **Program Filter**: Converted from button tabs to a dropdown menu
2. **Assessment Type Filter**: Added a new dropdown to filter program distribution by assessment type

## Changes Made

### Frontend Changes

#### 1. Bar Chart Component (`capstone-app/src/components/ui/barchart.tsx`)
- **Converted Program Filter**: Changed from horizontal button tabs to a dropdown using the existing `Select` component pattern
- **Added Assessment Type Filter**: New dropdown to filter by specific assessment types (Anxiety, Depression, Stress, Personal Problems, Suicide Risk, or All)
- **New Props**:
  - `onAssessmentTypeChange?: (assessmentType: string) => void` - Callback when assessment type changes
  - `currentAssessmentType?: string` - Current selected assessment type (default: "all")
- **UI Improvements**:
  - Both dropdowns are now side-by-side on desktop
  - Stack vertically on mobile devices
  - Consistent styling with other dashboard components (area chart time range selector)

#### 2. Dashboard Content (`capstone-app/src/components/organisms/DashboardContent.tsx`)
- **Added State**: `selectedAssessmentType` state to track the current assessment filter
- **Updated Effect**: Program data now reloads when `selectedAssessmentType` changes
- **New Handler**: `handleAssessmentTypeChange` to update the selected assessment type
- **Props Passed**: 
  - `onAssessmentTypeChange={handleAssessmentTypeChange}`
  - `currentAssessmentType={selectedAssessmentType}`

#### 3. Dashboard Service (`capstone-app/src/services/dashboard.service.ts`)
- **Updated `getChartData`**: Now accepts `assessmentType` parameter
  ```typescript
  static async getChartData(days: number = 7, assessmentType: string = "all")
  ```
- **Updated `getProgramDistribution`**: Now accepts `assessmentType` parameter
  ```typescript
  static async getProgramDistribution(assessmentType: string = "all")
  ```

### Backend Changes

#### 1. Metrics Config (`capstone-api/config/metrics.config.ts`)
- **New Method**: `Dashboard.getProgramDistribution(assessmentType?: string)`
  - Accepts optional assessment type filter: "all", "anxiety", "depression", "stress", "checklist", "suicide"
  - When specific type is selected, only returns program counts for that assessment type
  - When "all" is selected (default), returns counts for all assessment types
  - Uses switch statement to handle different assessment models
  - Counts unique students per program to avoid duplicates

#### 2. Metrics Controller (`capstone-api/app/metrics/metrics.controller.ts`)
- **Updated `getChartData`**:
  - Added `assessmentType` query parameter extraction
  - Calls new `getProgramDistribution` method with assessment type filter
  - Logs filter information for debugging
  - Removed old logic that merged separate program queries

#### 3. API Router (`capstone-api/app/metrics/metrics.router.ts`)
- **Updated OpenAPI Documentation**:
  - Added `assessmentType` query parameter
  - Enum values: `[all, anxiety, depression, stress, checklist, suicide]`
  - Default value: `all`
  - Updated response schema to reflect program distribution structure

## API Usage

### Endpoint
```
GET /api/metrics/chart-data?days={days}&assessmentType={type}
```

### Query Parameters
- `days` (optional): Number of days for trend data (7, 30, or 90). Default: 7
- `assessmentType` (optional): Filter program distribution by assessment type
  - Values: `all`, `anxiety`, `depression`, `stress`, `checklist`, `suicide`
  - Default: `all`

### Examples
```
# Get all assessments for last 7 days
GET /api/metrics/chart-data?days=7&assessmentType=all

# Get only anxiety assessments for last 30 days
GET /api/metrics/chart-data?days=30&assessmentType=anxiety

# Get only stress assessments for last 90 days
GET /api/metrics/chart-data?days=90&assessmentType=stress
```

### Response Structure
```json
{
  "success": true,
  "message": "Chart data generated successfully",
  "data": {
    "trendsData": [...],
    "assessmentBreakdown": [...],
    "severityData": [...],
    "monthlyTrends": [...],
    "programDistribution": [
      {
        "program": "BSIT",
        "anxiety": 45,      // Only when assessmentType=all
        "depression": 32,   // Only when assessmentType=all
        "stress": 28,       // Only when assessmentType=all
        "checklist": 15,    // Only when assessmentType=all
        "suicide": 3        // Only when assessmentType=all
      }
      // OR when filtered by specific type:
      {
        "program": "BSIT",
        "anxiety": 45       // Only this field when assessmentType=anxiety
      }
    ],
    "totalStats": {...}
  }
}
```

## User Experience Improvements

### Before
- Program filter used horizontal button tabs
- Could become cluttered with many programs
- No way to filter by specific assessment type
- Had to view all assessment types together

### After
- Clean dropdown interface for program selection
- Scales well with any number of programs
- Additional dropdown to filter by assessment type
- Can focus on specific assessment type data
- Consistent UI pattern with time range selector
- Responsive design: side-by-side on desktop, stacked on mobile

## Technical Benefits

1. **Improved Performance**: Only fetches data for selected assessment type when filtered
2. **Consistent Patterns**: Follows existing codebase patterns (similar to area chart time range selector)
3. **Better UX**: Dropdowns are more space-efficient and easier to use
4. **Scalability**: Works well with any number of programs or assessment types
5. **Type Safety**: Fully typed with TypeScript interfaces
6. **Error Handling**: Graceful fallbacks if API calls fail

## Testing Recommendations

1. Test all assessment type filters (all, anxiety, depression, stress, checklist, suicide)
2. Test combination of time range + assessment type filters
3. Verify program dropdown still works correctly
4. Test responsive behavior on mobile devices
5. Verify loading states work correctly
6. Test error states with network failures
7. Verify correct data is displayed for each filter combination

## Future Enhancements

Potential future improvements:
- Add ability to select multiple programs
- Add ability to select multiple assessment types
- Add export functionality for filtered data
- Add save/load filter presets
- Add date range picker for custom date ranges
