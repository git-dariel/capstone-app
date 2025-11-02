# Testing Guide: Inventory Insights Implementation

## Prerequisites
1. Ensure API server is running
2. Ensure frontend dev server is running
3. Have some inventory records in the database with mental health predictions

## Backend Testing

### 1. Test Metrics Endpoint

Open your API testing tool (Postman/Insomnia) and test the following:

#### Get Inventory Stats
```bash
POST http://localhost:3000/api/metrics
Content-Type: application/json

{
  "model": "Inventory",
  "data": ["inventoryStats"]
}
```

Expected Response:
```json
{
  "data": [{
    "inventoryStats": {
      "totalRecords": 156,
      "highRiskCount": 23,
      "completionRate": 87,
      "avgBmi": 22.4
    }
  }]
}
```

#### Get Mental Health Prediction Overview
```bash
POST http://localhost:3000/api/metrics
Content-Type: application/json

{
  "model": "Inventory",
  "data": ["mentalHealthPredictionDistribution"]
}
```

Expected Response:
```json
{
  "data": [{
    "mentalHealthPredictionDistribution": [
      { "risk": "Low Risk", "count": 45 },
      { "risk": "Moderate Risk", "count": 35 },
      { "risk": "High Risk", "count": 15 },
      { "risk": "Critical Risk", "count": 5 }
    ]
  }]
}
```

#### Get BMI Category Distribution
```bash
POST http://localhost:3000/api/metrics
Content-Type: application/json

{
  "model": "Inventory",
  "data": ["bmiCategoryDistribution"]
}
```

#### Get Mental Health by Program
```bash
POST http://localhost:3000/api/metrics
Content-Type: application/json

{
  "model": "Inventory",
  "data": ["mentalHealthPredictionByProgram"]
}
```

#### With Date Filtering
```bash
POST http://localhost:3000/api/metrics
Content-Type: application/json

{
  "model": "Inventory",
  "data": ["mentalHealthPredictionDistribution"],
  "filter": {
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.999Z"
  }
}
```

## Frontend Testing

### 1. Navigate to Inventory Records Page
1. Login to the application
2. Go to Inventory Records page
3. Verify that the stats grid displays real data:
   - Total Records
   - High Risk count
   - Completion Rate %
   - Average BMI

### 2. Test Mental Health Predictions Insights

#### Step 1: Click on "Mental Health Predictions" card
- URL should change to: `/inventory/insights/mental-health-prediction`
- Should see overview chart with risk levels (Low, Moderate, High, Critical)
- Check browser console for API calls

#### Step 2: Click on a bar (e.g., "Low Risk")
- Should drill down to "By Program" view
- Bars should show programs (BSIT, BSCS, BSE, BSBA)
- "Back" button should appear

#### Step 3: Click on a program bar (e.g., "BSIT")
- Should drill down to "By Academic Year" view
- Bars should show year levels (1st Year, 2nd Year, etc.)
- Breadcrumb should show: Inventory Insights > BSIT

#### Step 4: Click on a year bar (e.g., "1st Year")
- Should drill down to "By Gender" view
- Bars should show Male/Female
- Breadcrumb should show: Inventory Insights > BSIT > 1st Year

#### Step 5: Click on a gender bar (e.g., "Male")
- Should show student list table
- Table should display student details
- Note: This still uses mock data (TODO for implementation)

#### Step 6: Test Back Navigation
- Click "Back" button multiple times
- Should navigate through: Gender → Year → Program → Overview

#### Step 7: Test Year Filter
- Select different years from year dropdown
- Chart data should update
- Check browser console for new API calls with date filters

#### Step 8: Test Month Filter
- Select a specific month
- Chart data should update to show only that month's data
- Check console for API calls with month/year date range

### 3. Test BMI Category Insights

#### Repeat Steps 1-8 above but:
- Click on "BMI Categories" card instead
- URL: `/inventory/insights/bmi-category`
- Should see BMI categories (Underweight, Normal, Overweight, Obese)

### 4. Test Physical Health Insights

#### Repeat Steps 1-8 above but:
- Click on "Physical Health" card
- URL: `/inventory/insights/physical-health`
- Currently uses same data as BMI categories

## Browser Console Verification

### Check for API Calls:
Open browser DevTools (F12) → Network tab:

1. **Initial Load:**
   - `POST /api/metrics` with `model: "Inventory"`, `data: ["availableYears"]`
   - `POST /api/metrics` with mental health or BMI overview data

2. **Drill Down:**
   - `POST /api/metrics` with appropriate drill-down data (byProgram, byYear, byGender)

3. **Filter Change:**
   - `POST /api/metrics` with date filters in request body

### Check Console Logs:
Look for:
- "📤 Sending metrics request: ..."
- "📥 Received metrics response: ..."
- Any error messages

## Common Issues & Troubleshooting

### Issue: Stats Grid shows 0s
**Solution:** Check if you have inventory records in the database with `predictionGenerated: true`

### Issue: Charts show "No data available"
**Solution:** 
- Verify inventory records exist
- Check API response in Network tab
- Verify date filters aren't excluding all data

### Issue: Drill-down doesn't work
**Solution:**
- Check browser console for errors
- Verify API returns data for drill-down queries
- Check if the bar click handler is firing

### Issue: Loading state never completes
**Solution:**
- Check Network tab for failed requests
- Verify API endpoint is accessible
- Check for CORS issues

### Issue: Filters don't update data
**Solution:**
- Check if `updateFilters` is being called
- Verify date filter format in API request
- Check API logs for date filter application

## Performance Testing

### Large Dataset Test:
1. Create 1000+ inventory records (use seed script if available)
2. Test each drill-down level
3. Verify response times are acceptable (<2 seconds)
4. Check for memory leaks (DevTools → Memory tab)

### Concurrent Requests:
1. Open multiple tabs with different insights
2. Change filters rapidly
3. Verify no race conditions or incorrect data display

## Database Verification

### Check Actual Data:
```bash
# Using MongoDB Shell or Compass
db.individualInventory.find({}).count()
db.individualInventory.find({ predictionGenerated: true }).count()
```

### Verify BMI Calculations:
```javascript
// Sample query to verify BMI calculation
db.individualInventory.findOne({ height: { $exists: true } })
// Calculate BMI: weight(kg) / (height(m))^2
```

### Verify Mental Health Predictions:
```javascript
db.individualInventory.findOne({ 
  predictionGenerated: true,
  "mentalHealthPrediction.mentalHealthRisk.level": { $exists: true }
})
```

## Success Criteria

✅ All stats in grid display real data from database
✅ Overview charts load and display correct data
✅ Drill-down navigation works through all levels
✅ Back navigation returns to previous level correctly
✅ Year filter updates chart data
✅ Month filter updates chart data
✅ No console errors
✅ API calls have reasonable response times (<2s)
✅ Data matches database queries
✅ Loading states display properly
✅ Error states display properly (when API fails)

## Next Steps

Once testing is complete and successful:
1. Implement student list API endpoint
2. Add data export functionality
3. Add caching for frequently accessed data
4. Consider pagination for large datasets
5. Add unit tests for metrics functions
6. Add integration tests for API endpoints
