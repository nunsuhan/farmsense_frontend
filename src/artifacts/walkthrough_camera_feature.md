# Camera & Diagnosis Feature Walkthrough

This document outlines the changes made to implement the unified Camera feature supporting Disease Diagnosis, Canopy Analysis, and Growth Log.

## 1. Overview
The `DiagnosisScreen.tsx` has been updated to support three distinct modes as per the user request:
- **Diagnosis**: Existing disease diagnosis (Hybrid).
- **Canopy**: New feature for Canopy Analysis and Yield Prediction.
- **Log**: Growth Log entry.

## 2. API Updates
### 2.1 Type Definitions (`src/types/api.types.ts`)
- Added `CanopyDiagnosisRequest` and `CanopyDiagnosisResponse`.
- Added `yield_prediction` and `canopy_analysis` structures.

### 2.2 Service Layer (`src/services/diagnosisApi.ts`)
- Updated `createHybridDiagnosis` to accept `upload_type` ('diagnosis' | 'growth_log').
- Added `createCanopyDiagnosis` function to call `/diagnosis/canopy/`.

### 2.3 API Config (`src/constants/config.ts`)
- Added `CANOPY: '/diagnosis/canopy/'` endpoint.

## 3. UI Implementation (`src/screens/DiagnosisScreen.tsx`)
- **Mode Selection**: Toggles between DIAGNOSIS, CANOPY, and LOG.
- **Param Handling**: 
  - `DIAGNOSIS` -> `createHybridDiagnosis({ upload_type: 'diagnosis' })`
  - `LOG` -> `createHybridDiagnosis({ upload_type: 'growth_log' })`
  - `CANOPY` -> `createCanopyDiagnosis({ ...params })`
- **Navigation**:
  - `DIAGNOSIS` & `CANOPY` -> Navigate to `DiagnosisResult`.
  - `LOG` (Current Implementation) -> Also navigates to `DiagnosisResult` (Note: User request mentioned Log saves automatically, but usually UI feedback is needed. We reuse the result screen for now or logic can be adjusted to just show toast).

## 4. How to Test
1.  Open the Camera/Diagnosis screen.
2.  Switch between "병해진단", "차폐율", "성장일지" modes.
3.  **Diagnosis**: Take a picture -> Calls `hybrid` API -> Navigates to Result.
4.  **Canopy**: Take a picture -> Calls `canopy` API -> Navigates to Result (Result screen needs to handle Canopy response type).
5.  **Growth Log**: Take a picture -> Calls `hybrid` API (upload_type=growth_log) -> Navigates to Result.

## 5. Next Steps
- **DiagnosisResultScreen Update**: Ensure `DiagnosisResultScreen` can render the specific "Canopy Analysis" and "Yield Prediction" data structures (LAI bar, Yield kg, etc.) which are different from standard disease diagnosis.
