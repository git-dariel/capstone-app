# Simplified Dashboard - Quick Start Guide

## 🚀 Quick Start

### For Users

1. **Navigate to Dashboard**
   - Click on any assessment card (Anxiety, Depression, Stress, Suicide, Checklist)
   - You'll be taken to `/insights/:type`

2. **View Program Distribution**
   - See bar chart showing cases per program
   - View summary cards with total cases, average, and program count

3. **Select a Program**
   - Use the **Program dropdown** in the header
   - Student list automatically populates below

4. **Apply Filters**
   - **Year Filter**: Filter data by specific year
   - **Month Filter**: Further refine by month (requires year selection)
   - **Year Level Filter**: Filter by student year (1st, 2nd, 3rd, 4th)
   - **Gender Filter**: Filter by gender (Male, Female, Other)
   - All graphs and student list update automatically

5. **Return to Dashboard**
   - Click "Back to Dashboard" button in header

---

## 💻 For Developers

### File Structure

```
capstone-app/
├── src/
│   ├── hooks/
│   │   └── useSimplifiedInsights.ts          ← New hook
│   ├── components/
│   │   └── organisms/
│   │       └── SimplifiedInsightsContent.tsx  ← New component
│   ├── pages/
│   │   └── SimplifiedInsightsPage.tsx         ← New page
│   └── types/
│       └── insights.ts                         ← Updated types
```

### Key Components

#### 1. Hook Usage
```typescript
import { useSimplifiedInsights } from "@/hooks";

const {
  // State
  assessmentType,      // Current assessment type
  programData,         // Bar chart data
  selectedProgram,     // Currently selected program
  studentList,         // Auto-populated students
  loading,
  error,
  filters,             // Current filters (year, month, yearLevel, gender)
  
  // Actions
  fetchInsights,       // Initialize with assessment type
  selectProgram,       // Select program (auto-fetches students)
  clearProgramSelection,
  updateFilters,       // Update filters (year/month/yearLevel/gender)
} = useSimplifiedInsights();
```

#### 2. Component Integration
```tsx
import { SimplifiedInsightsContent } from "@/components/organisms";

// In your page
<MainLayout>
  <SimplifiedInsightsContent />
</MainLayout>
```

### API Calls

The hook makes these API calls:

```typescript
// 1. Fetch program data
MetricsService.getOverviewMetrics(type, filter)
// Returns: InsightData[] (program breakdown)

// 2. Fetch students (when program selected)
MetricsService.getAssessmentStudentList(type, {
  program: selectedProgram,
  startDate: filter.startDate,
  endDate: filter.endDate
})
// Returns: StudentDetails[]
```

### State Flow

```
Initialize
    ↓
fetchInsights(type) 
    ↓
Display Program Chart
    ↓
User Selects Program
    ↓
selectProgram(program)
    ↓
Auto-fetch & Display Students
```

---

## 🎯 Common Tasks

### Add a New Filter
```typescript
// Example: Adding a Severity Filter

// 1. Update ChartFilters type
export interface ChartFilters {
  year?: number;
  month?: number;
  yearLevel?: string;
  gender?: string;
  severity?: string;  // ← New filter
}

// 2. Add to useSimplifiedInsights hook
const updateSeverityFilter = (severity: string) => {
  updateFilters({ ...filters, severity });
};

// 3. Add dropdown in SimplifiedInsightsContent
<Select onValueChange={updateSeverityFilter}>
  <SelectItem value="minimal">Minimal</SelectItem>
  <SelectItem value="mild">Mild</SelectItem>
  <SelectItem value="moderate">Moderate</SelectItem>
  <SelectItem value="severe">Severe</SelectItem>
</Select>
```

### Customize the Student List
```typescript
// Modify AssessmentStudentList component or
// Create custom table in SimplifiedInsightsContent

{isProgramSelected && (
  <div className="custom-student-list">
    {studentList.map(student => (
      <StudentCard key={student.id} student={student} />
    ))}
  </div>
)}
```

### Add Export Functionality
```typescript
const exportToCSV = () => {
  const csv = studentList.map(s => 
    `${s.studentNumber},${s.firstName},${s.lastName},${s.program}`
  ).join('\n');
  
  // Download logic
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${selectedProgram}_students.csv`;
  a.click();
};
```

---

## 🐛 Troubleshooting

### Issue: Students not loading
**Solution:** Check that program name matches exactly (case-sensitive)
```typescript
// Debug
console.log('Selected Program:', selectedProgram);
console.log('Available Programs:', availablePrograms);
```

### Issue: Filters not updating chart
**Solution:** Ensure updateFilters clears program selection
```typescript
const updateFilters = async (newFilters: ChartFilters) => {
  setState(prev => ({
    ...prev,
    filters: { ...prev.filters, ...newFilters },
    selectedProgram: null,  // ← Important
    studentList: []
  }));
  await fetchInsights(assessmentType, { ...filters, ...newFilters });
};
```

### Issue: Loading state stuck
**Solution:** Always set loading to false in catch block
```typescript
try {
  // fetch logic
} catch (error) {
  console.error(error);
} finally {
  setState(prev => ({ ...prev, loading: false }));  // ← Important
}
```

---

## 📊 Customization Examples

### Add More Chart Types
The component now includes multiple charts. You can add more:

```tsx
// Current Charts:
// 1. Bar Chart - Program distribution
// 2. Pie Chart - Program proportions
// 3. Severity Pie Chart (when program selected)

// Add Area Chart for trends
import { ChartAreaInteractive } from "@/components/ui/areachart";

<div className="bg-white rounded-lg border shadow-sm p-4 sm:p-6">
  <ChartAreaInteractive 
    data={trendsData}
    title="Assessment Trends Over Time"
    description="Historical data for selected filters"
  />
</div>

// Add Stacked Bar Chart
import { StackedBarChart } from "@/components/ui/stackedbarchart";

<StackedBarChart
  data={programData}
  title="Severity Distribution by Program"
/>
```

### Add Summary Statistics
```tsx
const highRiskCount = studentList.filter(s => s.severity === 'Severe').length;
const moderateRiskCount = studentList.filter(s => s.severity === 'Moderate').length;

<div className="stats-row">
  <StatCard title="High Risk" value={highRiskCount} color="red" />
  <StatCard title="Moderate Risk" value={moderateRiskCount} color="yellow" />
</div>
```

### Custom Color Scheme
```typescript
const getColorForProgram = (program: string) => {
  const colors: Record<string, string> = {
    'Computer Science': '#3b82f6',
    'Engineering': '#10b981',
    'Business': '#f59e0b',
    // Add more...
  };
  return colors[program] || '#6b7280';
};
```

---

## 🔄 Migration from Old Dashboard

### Before (Old Multi-Level Drill-Down)
```typescript
import { useInsights } from "@/hooks";

const { drillDown, navigateBack, navigationStack } = useInsights();
// Complex navigation management
```

### After (New Simplified)
```typescript
import { useSimplifiedInsights } from "@/hooks";

const { selectProgram, clearProgramSelection } = useSimplifiedInsights();
// Simple program selection
```

### Route Changes
- Old: `/insights/:type` (multi-level drill-down)
- New: `/insights/:type` (simplified with 5 filters + multiple charts)
- Backup: `/insights-old/:type` (old version kept for reference)

### Filter Changes
- Old: Manual drill-down through Year → Gender
- New: Dropdown filters for Year, Month, Program, Year Level, Gender
- All filters work together and update all charts simultaneously

---

## 📋 Checklist for Implementation

- [ ] Import `useSimplifiedInsights` hook
- [ ] Initialize with `fetchInsights(type)`
- [ ] Add program dropdown filter
- [ ] Add year/month filters
- [ ] Add year level filter
- [ ] Add gender filter
- [ ] Display program bar chart
- [ ] Display program pie chart
- [ ] Display severity distribution chart (when program selected)
- [ ] Handle program selection
- [ ] Show auto-populated student list
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test with different assessment types
- [ ] Test all filter combinations
- [ ] Test responsive design
- [ ] Test with large datasets

---

## 🎓 Best Practices

1. **Always Clear Program Selection on Filter Change**
   ```typescript
   // When any filter changes, program selection should reset
   updateFilters({ 
     year: 2024,
     yearLevel: '3rd',
     gender: 'female'
   }); // Should clear selectedProgram
   ```

2. **Show Loading Indicators**
   ```tsx
   {loading && <Spinner />}
   ```

3. **Handle Empty States**
   ```tsx
   {programData.length === 0 && (
     <EmptyState message="No data available" />
   )}
   ```

4. **Use Memoization for Expensive Calculations**
   ```typescript
   const averageValue = useMemo(() => 
     Math.round(totalCount / programData.length),
     [totalCount, programData]
   );
   ```

5. **Debounce Filter Updates**
   ```typescript
   const debouncedUpdateFilters = useDebouncedCallback(
     (filters) => updateFilters(filters),
     500
   );
   ```

---

## 🔗 Related Documentation

- [NEW_DASHBOARD.MD](./NEW_DASHBOARD.MD) - Requirements
- [SIMPLIFIED_DASHBOARD_IMPLEMENTATION.MD](./SIMPLIFIED_DASHBOARD_IMPLEMENTATION.MD) - Detailed implementation
- [API Documentation] - MetricsService endpoints

---

## ✨ Tips & Tricks

### Keyboard Shortcuts (Future Enhancement)
```typescript
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Escape') clearProgramSelection();
    if (e.ctrlKey && e.key === 'e') exportToCSV();
  };
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

### URL State Sync (Future Enhancement)
```typescript
// Sync selected program with URL
const searchParams = new URLSearchParams(location.search);
const programFromUrl = searchParams.get('program');

useEffect(() => {
  if (programFromUrl && availablePrograms.includes(programFromUrl)) {
    selectProgram(programFromUrl);
  }
}, [programFromUrl, availablePrograms]);
```

### Cache API Results
```typescript
const cache = new Map();

const fetchWithCache = async (key: string, fetcher: () => Promise<any>) => {
  if (cache.has(key)) return cache.get(key);
  const result = await fetcher();
  cache.set(key, result);
  return result;
};
```

---

**Last Updated:** 2024
**Version:** 1.0.0