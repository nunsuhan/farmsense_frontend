# Comparative Sensor Graph Implementation Walkthrough

This document outlines the implementation of the Comparative Sensor Graph feature in `HomeScreen.tsx` and the supporting API changes.

## 1. Overview
The feature allows users to compare their farm's sensor data with a "Model Farm" (Best Practice Farm).
- **Registered Sensors**: User's data (Blue) vs. Model Farm data (Green).
- **Unregistered Sensors**: Only Model Farm data (Green) is shown with a prompt to register sensors.
- **Insights**: Automated analysis comparing temperature/humidity differences (e.g., "Temperature is similar to Model Farm").

## 2. Key Changes

### 2.1 API Types (`src/types/api.types.ts`)
- Updated `SensorGraphResponse` to support a nested structure:
  - `my_farm`: Metadata for the user's farm (name, color).
  - `model_farm`: Metadata for the model farm.
  - `temperature` / `humidity`: Now contain `my_farm` and `model_farm` objects with arrays (`avg`, `min`, `max`).
  - `comparison`: Object containing diff values and insight messages.

### 2.2 Sensor API Service (`src/services/sensorApi.ts`)
- Updated `generateMockGraphData` to produce mock data matching the new interface.
- Simulates realistic 24-hour temperature curves for both farms.
- Randomly generates "Good" or "Warning" insights based on the mocked difference.

### 2.3 Home Screen UI (`src/screens/HomeScreen.tsx`)
- **SimpleLineChart Component**:
  - Upgraded to support multiple datasets via the `datasets` prop.
  - Supports `strokeDashArray` for dashed lines (used for Model Farm).
- **Graph Section**:
  - Added a Header with Title and Legend.
  - Implemented conditional rendering:
    - If `my_farm` data exists: Renders both lines.
    - If missing: Renders only Model Farm line + "Register Sensor" overlay.
- **Insights Section**:
  - Displays comparison results below the graph with visual indicators (✅/⚠️).

## 3. How to Test
1. **View Graph**: on the Home Screen, look at the sensor graph card.
   - **Expectation**: You should see a Blue solid line (My Farm) and a Green dashed line (Model Farm).
2. **Read Insights**: Check the "Model Farm Comparative Analysis" section below the graph.
   - **Expectation**: Messages like "Temperature management is at Model Farm level" or "Humidity is 5% higher".
3. **Simulate No Sensor** (Code Change Required): 
   - Temporarily modify `sensorApi.ts` to return `my_farm: null` or empty data to see the "Register Sensor" overlay.

## 4. File Changes
- `frontend/src/types/api.types.ts`: Interface updates.
- `frontend/src/services/sensorApi.ts`: Mock data logic.
- `frontend/src/screens/HomeScreen.tsx`: UI implementation (Chart, Legend, Insights).
