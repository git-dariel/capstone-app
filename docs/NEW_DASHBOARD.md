# 📌 EPIC: Simplified Assessment Dashboard Drill-Down & Program-Level Filtering

## Epic Description

As a system user, I want to view student mental health assessment data using a simplified drill-down approach so that I can gain insights faster without navigating through multiple drill-down layers.

---

## 🎯 USER STORY 1: Single Drill-Down from Assessment to Program View

**Story ID:** DASH-001
**Type:** User Story
**Priority:** High

### User Story

As a dashboard user,
I want to drill down only once from an assessment (e.g., Anxiety),
So that the dashboard automatically shows program-level data filtered by the selected assessment.

### Description

Clicking on an assessment card or bar should transition the dashboard to a program-based view. All data should remain filtered based on the selected assessment without additional drill-down layers.

### Acceptance Criteria

* Clicking an assessment triggers only one drill-down
* Dashboard switches to a program-based view
* Assessment filter remains active across all graphs
* No additional drill-down hierarchy (year, gender) is triggered

---

## 🎯 USER STORY 2: Program-Level Filter in Graph View

**Story ID:** DASH-002
**Type:** User Story
**Priority:** High

### User Story

As a dashboard user,
I want a program filter in the graph view,
So that I can easily switch between programs and see relevant student data.

### Description

A program dropdown or selector should be visible in the graph view and control all related visualizations.

### Acceptance Criteria

* Program filter is visible and accessible
* Program options are dynamically loaded
* Default program selection is applied if applicable
* Program filter affects all graphs in the view

---

## 🎯 USER STORY 3: Automatic Student Population by Program

**Story ID:** DASH-003
**Type:** User Story
**Priority:** High

### User Story

As a dashboard user,
I want student names to be automatically populated based on the selected program,
So that I no longer need to manually select individual students.

### Description

When a program is selected, all students under that program should be fetched and displayed automatically.

### Acceptance Criteria

* Student list is auto-populated after program selection
* No manual student selection is required
* Student list reflects the current assessment + program filter
* Supports large student datasets without UI lag

---

## 🎯 USER STORY 4: Dynamic Graph Updates on Program Change

**Story ID:** DASH-004
**Type:** User Story
**Priority:** Medium

### User Story

As a dashboard user,
I want graphs to update in real time when switching programs,
So that I always see accurate and current data.

### Acceptance Criteria

* Graphs update immediately on program change
* No page reload required
* Data consistency is maintained across all components
* Loading indicators are shown if necessary

---

## 🎯 USER STORY 5: Removal of Multi-Level Drill-Downs

**Story ID:** DASH-005
**Type:** Technical / Refactor
**Priority:** Medium

### User Story

As a system maintainer,
I want to remove deep drill-down levels (year, gender, student),
So that the dashboard interaction remains simple and scalable.

### Acceptance Criteria

* Year-level drill-down removed
* Gender drill-down removed
* Student drill-down replaced with auto-populated list
* Existing drill-down code is deprecated or refactored

---

## 🎯 USER STORY 6: Support for Multiple Graph Types per View

**Story ID:** DASH-006
**Type:** Enhancement
**Priority:** Low

### User Story

As a dashboard user,
I want to view assessment data using multiple graph types,
So that insights are easier to interpret.

### Acceptance Criteria

* More than one graph type can exist per view
* All graphs respect the active filters
* Graphs are responsive and readable

---

# 📊 GRAPH TYPE RECOMMENDATIONS (Per Level)

## 1️⃣ Assessment Overview (Initial Dashboard)

**Purpose:** High-level comparison across assessments

### Best Graph Types

* **Bar Chart** ✅ (Primary)
* **Card KPIs** (Counts / Severity Index)
* **Radar Chart** (Optional – assessment profile)

### Why

* Easy comparison between Anxiety, Stress, Depression
* Clear entry point for drill-down

---

## 2️⃣ Program-Level View (After Drill-Down)

**Purpose:** Compare impact per academic program

### Best Graph Types

* **Grouped Bar Chart** ✅ (Assessment vs Program)
* **Stacked Bar Chart** (Severity distribution per program)
* **Horizontal Bar Chart** (Better for long program names)

### Why

* Ideal for categorical comparison
* Scales well with many programs
* Readable even with large datasets

---

## 3️⃣ Program Detail Analytics (Filtered Context)

**Purpose:** Deep insight without drill-down

### Best Graph Types

* **Pie / Donut Chart** – Severity breakdown
* **Heatmap** – Program vs Severity intensity
* **Line Chart** – Trend over time (if historical data exists)

### Why

* Supports analytical decisions
* Complements bar charts
* Avoids additional navigation layers

---

## 4️⃣ Student List View (Final Output)

**Purpose:** Identify affected students

### Best Representation

* **Searchable & Filterable Table** ✅
* Optional **Tag Indicators** (High Anxiety, At Risk)

### Why

* Tables are best for names and records
* Supports pagination and performance
* Easy export for reports

---

# 🧠 UX & Architecture Notes (Optional for Technical Ticket)

* Use **global filter context** (Assessment + Program)
* Avoid embedding filters inside each graph
* Prefer **state-driven filtering** (Redux / Zustand / Context API)
* Fetch students lazily on program selection
* Cache results per program for performance

---
