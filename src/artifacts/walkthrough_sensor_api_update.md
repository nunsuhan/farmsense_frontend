# Sensor API & UI Update Walkthrough

This document outlines the final updates to the Sensor API mock format and the HomeScreen UI to support the comparative graph and "Model Farm" status features.

## 1. Overview
The goal is to accurately reflect the user-provided API specifications, specifically:
- `is_model_farm`: Indicates if the displayed data is from a Model Farm (fallback) rather than the user's sensors.
- `SensorCurrentResponse`: Matches the specific JSON structure provided.
- `HomeScreen` UI: Shows status text (e.g., "LOW", "NORMAL") and a specific "Model Farm" overlay message.

## 2. Key Changes

### 2.1 Sensor API Service (`src/services/sensorApi.ts`)
- **`getCurrentData` Mock Update**:
  - Encapsulated sensor values in a `data` object.
  - Added `status` fields ("low", "normal", "high").
  - Included `is_model_farm`, `farm_code`, and `model_farm_info` to matches the spec.
  - Values updated to the requested example (-2.2°C, 69.5%, etc.).

### 2.2 Home Screen UI (`src/screens/HomeScreen.tsx`)
- **Status Display**:
  - Added status text (e.g., "LOW") below sensor values.
  - Text color matches the status icon color.
- **Model Farm Overlay**:
  - Checks logic: `if (sensorData.is_model_farm)`.
  - Displays a clean blue info box: "ℹ️ 모델팜 데이터 표시 중".
  - Includes a "센서 등록하기" button linking to settings.
- **Graph Updates**:
  - Verified logic handles both "My Farm" and "Model Farm" data based on the API response structure.

## 3. How to Test
1. **Model Farm Mode**:
   - The current mock in `getCurrentData` forces `is_model_farm: true`.
   - On the Home Screen, verify the blue "Model Farm Data" overlay appears inside the sensor card.
   - Verify sensor values match the mock: -2.2°C (Low), 69.5% (Normal).
2. **Graph View**:
   - The graph should show the dashed green Model Farm line.
   - If `my_farm` data is missing (as per graph mock), the overlay "Sensor missing" should appear over the graph area as well.
3. **Registration Flow**:
   - Click "센서 등록하기" to ensure it navigates to the Sensor Registration screen.

## 4. File Changes
- `frontend/src/services/sensorApi.ts`: Updated mock response.
- `frontend/src/screens/HomeScreen.tsx`: Added status text and Model Farm overlay UI.
