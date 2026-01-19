# Sensor Graph & Management Implementation Walkthrough

This document outlines the implementation of the new Sensor Graph API, Dashboard enhancements, and Sensor Management settings.

## 1. Overview
We have integrated real-time sensor data visualization, historical trend graphs, and statistical summaries into the FarmSense dashboard. Additionally, a new Sensor Management screen allows users to customize their monitoring experience.

## 2. Key Features

### 2.1. Dashboard (HomeScreen.tsx)
- **Real-time Sensor Status**: Displays current Temperature, Humidity, and Soil Moisture with status colors (Normal/Warning).
- **Interactive Graph**:
  - Visualizes temperature trends.
  - Toggles for 'Day', 'Week', and 'Month' periods.
  - Implemented using `react-native-svg` for a lightweight, custom solution.
- **Statistical Summary**:
  - Compares Today vs. Yesterday's average temperature and humidity.
  - Shows weekly averages.
  - Displays change indicators (up/down arrows) with color coding.

### 2.2. Sensor Management (SensorManageScreen.tsx)
- **Display Selection**: Users can choose which sensors to show on the dashboard.
- **Alert Settings**:
  - Global On/Off switch for alerts.
  - Customizable Min/Max thresholds for Temperature and Humidity.
- **Preferences**:
  - Set default graph period (Day/Week/Month).

### 2.3. API Integration (sensorApi.ts)
- `getCurrentData`: Fetches real-time sensor readings.
- `getGraphData`: Retrieves historical data for graphs (mocked for now).
- `getStats`: Computes daily and weekly statistics (mocked for now).
- `getSettings` / `updateSettings`: Manages user preferences.

## 3. File Changes

### `src/screens/HomeScreen.tsx`
- Added `SimpleLineChart` component.
- Added `StatsItem` component.
- integrated `getAllSensorData`, `getGraphData`, `getStats`.
- Added state management for polling and refreshing.

### `src/screens/settings/SensorManageScreen.tsx`
- Completely rewrote the UI to support settings configuration.
- Added form inputs for thresholds and toggles.
- integrated `getSettings` and `updateSettings`.

### `src/types/api.types.ts`
- Added `SensorGraphResponse`, `SensorStatsResponse`, `SensorSettingsResponse` interfaces.

### `src/services/sensorApi.ts`
- Implemented the new API functions with mock data generation for development.

## 4. How to Test
1. **Dashboard**:
   - Open the app and verify real-time data loads.
   - Click 'Day', 'Week', 'Month' buttons to see the graph change.
   - Pull down to refresh all data.
2. **Settings**:
   - Go to Menu -> Settings -> Sensor Management.
   - Toggle sensors on/off.
   - Change alert thresholds and save.
   - Verify success alert.

## 5. Next Steps
- Connect to real backend endpoints once available.
- Implement chart for multiple sensors (currently only Temperature).
- Add push notifications based on alert settings.
