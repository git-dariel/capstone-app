# Notification Filters Implementation

## Overview
Added comprehensive filtering capabilities to the Notifications page, allowing guidance users to filter notifications by assessment type, program, and year level, in addition to existing severity filters.

## Changes Made

### 1. Notification Service Update (`notification.service.ts`)

#### Updated Notification Interface
- Added `students` array to the `person` object in the `Notification` interface
- Now includes student `program` and `year` information for filtering

```typescript
user?: {
  id: string;
  userName: string;
  person?: {
    firstName: string;
    lastName: string;
    students?: Array<{
      id: string;
      program: string;
      year: string;
    }>;
  };
};
```

#### Enhanced Data Fetching
- Modified `getAllNotifications()` to include student data in the fields parameter
- Now fetches: `user.person.students.id`, `user.person.students.program`, `user.person.students.year`

### 2. NotificationsContent Component (`NotificationsContent.tsx`)

#### New Filter States
Added four new filter states:
- `assessmentFilter` - Filter by assessment type (anxiety, depression, stress, suicide, checklist)
- `programFilter` - Filter by student program (only for guidance users)
- `yearFilter` - Filter by student year level (only for guidance users)
- Existing `severityFilter` - Filter by severity level

#### Dynamic Filter Options
- `availablePrograms` - Extracts unique programs from notification data
- `availableYears` - Extracts unique year levels from notification data
- Both arrays are sorted and only shown to guidance users

#### Enhanced Filtering Logic
The `filteredNotifications` function now filters by:
1. **Status** - all, unread, read
2. **Severity** - critical, high, medium, low, info
3. **Assessment Type** - Matches notification actions with selected assessment type
4. **Program** - Filters by student program (guidance only)
5. **Year** - Filters by student year level (guidance only)

#### UI Improvements

**Filter Layout:**
- Organized filters in a responsive grid: 1 column on mobile, 2 on tablet, 4 on desktop
- Clean, consistent styling across all filter dropdowns
- Added "Clear Filters" button when any advanced filter is active

**Filter Options:**
- **Severity Filter**: All, Critical, High, Medium, Low, Info
- **Assessment Filter**: All, Anxiety, Depression, Stress, Suicide, Checklist
- **Program Filter**: Dynamically populated from notification data (guidance only)
- **Year Filter**: Dynamically populated from notification data (guidance only)

**Status Display:**
- Updated counter to show "X of Y notifications" for better context
- Real-time filtering updates the display count

## User Experience

### For Guidance Users
- Full access to all four filter types
- Can filter by specific programs and year levels
- Useful for monitoring specific student populations
- Clear Filters button for quick reset

### For Student Users
- Access to severity and assessment type filters
- Program and year filters are hidden (not applicable)
- Focused on their own notifications

## Technical Details

### Assessment Type Mapping
```typescript
const assessmentActions = {
  anxiety: ["ANXIETY_ASSESSMENT_CREATED", "ANXIETY_ASSESSMENT_UPDATED"],
  depression: ["DEPRESSION_ASSESSMENT_CREATED", "DEPRESSION_ASSESSMENT_UPDATED"],
  stress: ["STRESS_ASSESSMENT_CREATED", "STRESS_ASSESSMENT_UPDATED"],
  suicide: ["SUICIDE_ASSESSMENT_CREATED", "SUICIDE_ASSESSMENT_UPDATED"],
  checklist: ["CHECKLIST_CREATED", "CHECKLIST_UPDATED"],
};
```

### Data Access Pattern
```typescript
const studentProgram = notification.user?.person?.students?.[0]?.program;
const studentYear = notification.user?.person?.students?.[0]?.year;
```

## Benefits

1. **Better Organization** - Guidance counselors can quickly find specific types of notifications
2. **Improved Workflow** - Filter by program to focus on specific academic departments
3. **Targeted Monitoring** - Filter by year level to track freshmen, sophomores, etc.
4. **Assessment Tracking** - Easily find notifications related to specific mental health assessments
5. **User-Friendly** - Clear, intuitive interface with responsive design
6. **Performance** - Client-side filtering ensures fast response times

## Future Enhancements

Potential improvements:
- Save filter preferences per user
- Add date range filtering
- Export filtered notifications
- Bulk actions on filtered results
- Advanced search within filtered results
- Filter presets (e.g., "Critical Anxiety Cases", "First Year Students")

## Testing

To test the implementation:
1. Log in as a guidance user
2. Navigate to Notifications page
3. Try each filter independently
4. Combine multiple filters
5. Verify program and year dropdowns populate correctly
6. Test "Clear Filters" button
7. Verify student users don't see program/year filters

## Notes

- Program and year filters only appear when notification data contains student information
- Filters are cumulative (AND logic) - all active filters must match
- The implementation is backwards compatible with existing notification data
- Empty states handle cases where no notifications match the filters
