# Avatar Profile Feature Walkthrough

This document outlines the implementation of the User Avatar feature in the Profile screen.

## 1. Overview
The feature allows users to:
- View their current avatar.
- Upload a new avatar from Camera or Gallery.
- Reset the avatar to the default image.

## 2. API Service (`src/services/avatarApi.ts`)
Updated to match backend specifications:
- **Upload**: `POST /users/avatar/upload/` (Field: `avatar`)
- **Get**: `GET /users/avatar/`
- **Reset**: `DELETE /users/avatar/`

## 3. Screen Implementation (`src/screens/ProfileScreen.tsx`)
- **State**: `avatarUrl` (string | null), `avatarLoading` (boolean).
- **Initialization**: Fetches current avatar on mount via `avatarApi.getMyAvatar()`.
- **UI**: 
  - Displays `Image` if `avatarUrl` exists, otherwise falls back to the default "Grape" emoji.
  - Shows a "Camera" icon overlay to indicate editability.
  - Shows a loading spinner overlay during upload/reset operations.
- **Interactions**:
  - Tapping the avatar opens a selection menu (ActionSheet on iOS, Alert on Android).
  - Options: Camera, Gallery, Default Reset.
- **Permissions**: Uses `expo-image-picker` which handles permission requests automatically on launch.

## 4. How to Test
1.  Navigate to **Profile** tab.
2.  Tap on the avatar circle.
3.  **To Upload**: Select "Gallery" or "Camera", pick an image.
    - Verify loading spinner appears.
    - Verify image updates upon success.
4.  **To Reset**: Tap avatar and select "Reset to Default".
    - Verify avatar reverts to default (or emoji).

## 5. Notes
- The avatar image is stored in `avatarUrl` local state, initialized from the server.
- Ensure the backend server is reachable for uploads to work.
