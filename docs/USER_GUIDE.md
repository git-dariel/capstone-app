# 📖 Simplified Dashboard - User Guide

## Welcome! 👋

This guide will help you navigate the new **Simplified Assessment Dashboard** to quickly find and analyze student mental health data.

---

## 🎯 Quick Start (30 Seconds)

1. **Go to Dashboard** → Click any assessment card (e.g., "Anxiety")
2. **View Overview** → See charts showing data across all programs
3. **Apply Filters** → Select Year, Program, Year Level, Gender
4. **Select Program** → Click dropdown to see specific students
5. **Review Students** → View detailed student list with risk levels

---

## 📊 Dashboard Overview

### What You'll See

```
┌─────────────────────────────────────────────────────────┐
│  MENTAL HEALTH DASHBOARD                                 │
├─────────────────────────────────────────────────────────┤
│  [Anxiety Card]  [Depression Card]  [Stress Card]       │
│  Click any card to see detailed insights →              │
└─────────────────────────────────────────────────────────┘
```

### Assessment Cards Available

- 🧠 **Anxiety Assessment** - GAD-7 questionnaire results
- 💜 **Depression Assessment** - PHQ-9 screening data
- ⚡ **Stress Assessment** - Perceived stress scale results
- 🛡️ **Suicide Risk Assessment** - C-SSRS evaluation data
- ✅ **Personal Problems Checklist** - PPCA comprehensive screening

---

## 🔍 Insights View (After Clicking Assessment)

### Top Section: Filters Bar

```
┌─────────────────────────────────────────────────────────┐
│  ← Back to Dashboard                                     │
│  Anxiety Assessment                                      │
│  Filters: [Year ▼] [Month ▼] [Program ▼] [Level ▼] [Gender ▼] │
└─────────────────────────────────────────────────────────┘
```

#### Available Filters

| Filter | Options | What It Does |
|--------|---------|--------------|
| **Year** | 2024, 2023, 2022... | Show data from specific year |
| **Month** | Jan, Feb, Mar... | Narrow down to specific month |
| **Program** | CS, Engineering, Business... | Focus on one program |
| **Year Level** | 1st, 2nd, 3rd, 4th | Filter by student year |
| **Gender** | Male, Female, Other | Filter by gender |

💡 **Tip**: Filters work together! Apply multiple filters to narrow down your search.

---

## 📈 Charts & Visualizations

### When No Program Selected

You'll see **3 main sections**:

#### 1. Summary Cards (Top)
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Total Cases  │  │ Average per  │  │  Programs    │
│    127       │  │   Program    │  │      8       │
│              │  │     16       │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
```

#### 2. Charts (Middle)
```
┌────────────────────────┐  ┌────────────────────────┐
│ 📊 Bar Chart           │  │ 📊 Pie Chart           │
│ Distribution by        │  │ Program Proportions    │
│ Program                │  │                        │
│ ▮▮▮▮▮ CS: 45          │  │      [Pie Chart]       │
│ ▮▮▮ Eng: 32           │  │   Shows relative       │
│ ▮▮ Bus: 28            │  │   distribution         │
└────────────────────────┘  └────────────────────────┘
```

**What to Look For:**
- **Tall bars** = Programs with high case counts
- **Large pie slices** = Programs with highest proportion of cases
- **Colors** = Each program has unique color for easy identification

#### 3. Detailed Table (Bottom)
```
┌─────────────────────────────────────────────────────────┐
│ Program              │ Count │ Percentage │ Visual      │
├─────────────────────────────────────────────────────────┤
│ Computer Science     │   45  │    35%     │ ▮▮▮▮▮▮▮    │
│ Engineering          │   32  │    25%     │ ▮▮▮▮▮      │
│ Business             │   28  │    22%     │ ▮▮▮▮       │
│ Arts & Sciences      │   22  │    18%     │ ▮▮▮        │
└─────────────────────────────────────────────────────────┘
```

---

### When Program Selected

After selecting a program from the dropdown, you'll see **additional analytics**:

#### 1. Severity Distribution Chart
```
┌────────────────────────┐
│ 📊 Severity Breakdown  │
│                        │
│    [Donut Chart]       │
│                        │
│  🟢 Minimal: 15        │
│  🟡 Mild: 12          │
│  🟠 Moderate: 8        │
│  🔴 Severe: 5          │
└────────────────────────┘
```

**Color Coding:**
- 🟢 **Green (Minimal)** - Low concern, monitoring only
- 🟡 **Yellow (Mild)** - Watch for changes
- 🟠 **Orange (Moderate)** - May need support
- 🔴 **Red (Severe)** - Immediate attention needed

#### 2. Program Summary Cards
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Total        │  │ High Risk    │  │ Moderate     │
│ Students     │  │ (Severe)     │  │ Risk         │
│    40        │  │     5        │  │     8        │
└──────────────┘  └──────────────┘  └──────────────┘
```

#### 3. Student List
```
┌─────────────────────────────────────────────────────────┐
│ Students in Computer Science - Anxiety Assessment        │
├─────────────────────────────────────────────────────────┤
│ ID      │ Name           │ Year  │ Gender │ Severity    │
├─────────────────────────────────────────────────────────┤
│ 2024001 │ Juan Dela Cruz │ 3rd   │ Male   │ 🔴 Severe   │
│ 2024002 │ Maria Santos   │ 3rd   │ Female │ 🟠 Moderate │
│ 2024003 │ Pedro Garcia   │ 2nd   │ Male   │ 🟡 Mild     │
└─────────────────────────────────────────────────────────┘
```

---

## 🎓 Step-by-Step Tutorials

### Tutorial 1: Find All 3rd Year Female Students with Anxiety

**Goal**: Identify female third-year students experiencing anxiety

**Steps:**
1. **Navigate**: Click **"Anxiety Assessment"** card on dashboard
2. **Filter by Year Level**: Select **"3rd Year"** from Level dropdown
3. **Filter by Gender**: Select **"Female"** from Gender dropdown
4. **View Results**: Charts update automatically showing:
   - Bar chart: How many per program
   - Pie chart: Program proportions
5. **Select Program**: Choose specific program (e.g., "Computer Science")
6. **Review Students**: See complete list of 3rd year female CS students with anxiety
7. **Check Severity**: Review severity distribution to identify high-risk students

**Result**: You now have a filtered list ready for outreach or intervention!

---

### Tutorial 2: Compare March vs April Depression Cases

**Goal**: See if depression cases increased from March to April

**Steps:**
1. **Navigate**: Click **"Depression Assessment"** card
2. **Set March**: 
   - Year: **2024**
   - Month: **March**
3. **Note the Data**: 
   - Look at total cases (e.g., 45 students)
   - Note program with most cases
4. **Change to April**:
   - Keep Year: **2024**
   - Change Month: **April**
5. **Compare**: 
   - Charts update instantly
   - Compare total cases (e.g., now 52 students)
   - See which programs increased

**Result**: You can track monthly trends and identify concerning patterns!

---

### Tutorial 3: Identify High-Risk Students in Specific Program

**Goal**: Find students needing immediate support in Engineering program

**Steps:**
1. **Navigate**: Click **"Suicide Risk Assessment"** card
2. **Select Program**: Choose **"Engineering"** from Program dropdown
3. **Review Analytics**:
   - Severity pie chart shows breakdown
   - Summary cards highlight high-risk count
4. **Check Student List**: 
   - Students automatically displayed
   - Look for 🔴 **Severe** severity indicators
5. **Take Action**: 
   - Note student IDs and names
   - Contact info available in table
   - Ready for immediate intervention

**Result**: Quick identification of students needing urgent care!

---

## 💡 Pro Tips & Best Practices

### Getting the Most Out of Filters

✅ **DO:**
- Apply multiple filters for precise targeting
- Use Year + Month for specific time periods
- Combine Program + Year Level for focused outreach
- Reset filters (select "All") to see full picture

❌ **DON'T:**
- Apply too many filters if you want broad overview
- Forget that filters apply to ALL charts
- Overlook the "All Programs" option for comparison

### Reading the Charts

**Bar Chart Tips:**
- Longer bars = higher counts
- Compare bar heights to identify trends
- Look for unusual spikes in specific programs

**Pie Chart Tips:**
- Larger slices = higher proportion
- Hover for exact numbers
- Use for quick program comparison

**Severity Chart Tips:**
- Red/Orange slices = priority students
- Green slices = students doing well
- Balance indicates overall program health

### Using Student Lists Effectively

1. **Sort by Severity**: Prioritize high-risk students first
2. **Review Contact Info**: Email and phone available
3. **Check Assessment Dates**: Recent vs older assessments
4. **Cross-reference Programs**: Students may be in multiple assessments

---

## 🆘 Common Questions

### Q: Why did my program selection disappear?
**A:** When you change filters (year, month, level, gender), the program selection automatically resets. This ensures you see accurate data for your new filter combination.

### Q: Can I see historical trends?
**A:** Yes! Use the Year and Month filters to view different time periods. Change these filters to compare data across months.

### Q: What if I see "No data available"?
**A:** This means no students match your current filter combination. Try:
- Removing some filters
- Selecting "All" for one or more filters
- Checking a different time period

### Q: How often is data updated?
**A:** Data reflects completed assessments in real-time. New assessments appear immediately after students submit them.

### Q: Can I export the student list?
**A:** Export functionality is coming in a future update! For now, you can:
- Take screenshots
- Manually copy needed information
- Request reports from system administrator

### Q: What do the severity levels mean?

**Severity Scale:**
- **Minimal**: Low scores, monitoring only
- **Mild**: Slight symptoms, watch for changes
- **Moderate**: Notable symptoms, may need support
- **Severe**: High scores, immediate attention recommended
- **Extremely Severe**: Critical scores, urgent intervention needed

---

## 📱 Mobile Usage

### Accessing on Mobile Devices

The dashboard is **fully responsive** and works great on phones and tablets!

**Mobile Layout:**
- Filters stack vertically
- Charts display in single column
- Tables scroll horizontally
- Touch-friendly buttons

**Tips for Mobile:**
- Rotate to landscape for better chart viewing
- Use two fingers to zoom charts
- Tap filter dropdowns carefully
- Scroll tables horizontally to see all columns

---

## 🔐 Privacy & Security

### Data Protection
- All student data is confidential
- Access logged for security
- Only authorized personnel can view
- Data encrypted in transmission

### Best Practices
- Don't share student information externally
- Log out when finished
- Don't take photos of student lists
- Follow institutional privacy policies

---

## 🆕 What's New

### Recent Updates (v1.1)

✨ **New Features:**
- **Year Level Filter**: Target specific student years
- **Gender Filter**: Additional filtering dimension
- **Multiple Chart Types**: Bar + Pie charts for better insights
- **Severity Analysis**: Automatic risk breakdown when program selected
- **Program Summary**: Quick stats for high/moderate risk

🎨 **Improvements:**
- Faster loading times
- Better mobile experience
- More intuitive filter layout
- Enhanced color coding

---

## 📞 Need Help?

### Getting Support

**Technical Issues:**
- Contact IT Support: [support@institution.edu]
- Help Desk: Extension 1234
- Online Ticket System: [helpdesk.institution.edu]

**Training Requests:**
- Schedule training session
- Request user guide PDF
- Watch video tutorials (coming soon)

**Feature Requests:**
- Submit feedback through help desk
- Suggest improvements
- Report bugs or issues

---

## 🎯 Quick Reference Card

### Essential Actions

| I Want To... | How To Do It |
|--------------|--------------|
| See all programs | Click assessment card, no filters |
| Focus on one program | Select from Program dropdown |
| View specific year level | Use Year Level filter |
| Find female students | Use Gender filter |
| See March data | Set Year + Month filters |
| Identify high-risk | Select program, check red/orange in severity chart |
| Go back | Click "← Back to Dashboard" |
| Reset filters | Select "All" in each dropdown |

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Esc` | Clear program selection (coming soon) |
| `Tab` | Navigate between filters |
| `Enter` | Open/close dropdown |
| `Arrow Keys` | Navigate dropdown options |

---

## 🎓 Training Resources

### Available Resources

1. **This User Guide** - Comprehensive written guide
2. **Interactive Tutorial** - Coming soon!
3. **Video Walkthrough** - Coming soon!
4. **Quick Reference Card** - Print-friendly version
5. **Training Sessions** - Request from admin

### Recommended Learning Path

**Week 1: Basics**
- Learn dashboard navigation
- Practice using filters
- Understand chart types

**Week 2: Advanced**
- Multi-filter combinations
- Severity analysis
- Program comparisons

**Week 3: Mastery**
- Quick identification workflows
- Data interpretation
- Intervention planning

---

## ✅ Checklist for New Users

Before you start using the dashboard regularly:

- [ ] Read this user guide
- [ ] Try each filter type
- [ ] Practice selecting different programs
- [ ] Review all chart types
- [ ] Understand severity levels
- [ ] Know where to get help
- [ ] Understand privacy policies
- [ ] Bookmark the dashboard URL

---

## 🎉 You're Ready!

You now have everything you need to effectively use the Simplified Assessment Dashboard!

**Remember:**
- 🎯 Start with overview, then narrow down with filters
- 📊 Use multiple chart types for different insights
- 🔍 Select programs to see detailed student lists
- 💡 Combine filters for precise targeting
- 🆘 Ask for help when needed

**Happy analyzing! Your work helps students get the support they need.** 💙

---

*Last Updated: January 2025 | Version 1.1 | Simplified Dashboard*