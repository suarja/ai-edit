# API Endpoints Flow & Core Features Documentation

## Overview
This document maps the API endpoints used in the Editia mobile app to their corresponding features and backend implementations, following an 80/20 analysis to identify core features that need priority testing.

## API Architecture

### Servers
1. **Server-Primary** (`server-primary`) - Main API server for video generation, scripts, voice, and user management
2. **Server-Analyzer** (`server-analyzer`) - TikTok analysis and insights server

### Authentication
- **Clerk JWT** - Primary authentication for all endpoints
- **Supabase** - Legacy authentication (being phased out)

## Core Features & API Endpoints

### 1. 🎬 **Video Generation Pipeline** (High Priority)

The main value proposition - converting scripts to videos.

#### Active Endpoints:
- `POST /api/scripts/generate-video/:id` 🚨 **CRITICAL ISSUE - COMPLETELY COMMENTED OUT**
  - Purpose: Generate video from script (MAIN FEATURE)
  - Issue: Entire fetch request commented out in useVideoRequest.ts:326-342
  - Status: Function returns `true` without making any API call
  - Backend: `generateVideoFromScriptHandler` exists and working
  - Impact: Users cannot generate videos from scripts

- `GET /api/videos/status/:id` ✅
  - Purpose: Check video generation status
  - Used in: Videos list screen
  - Backend: `getVideoStatusHandler`

- `DELETE /api/videos` ✅
  - Purpose: Delete generated videos
  - Used in: Video details screen
  - Backend: `videoDeleteHandler`

#### Test Priority: **CRITICAL**
- Full video generation flow
- Status polling mechanism
- Error handling and recovery

### 2. 📝 **Script Management** (High Priority)

AI-powered script creation and editing.

#### Active Endpoints:
- `GET /api/scripts` ✅
- `GET /api/scripts/:id` ✅
- `POST /api/scripts/chat` ✅
- `POST /api/scripts/modify-current-script/:id` ✅
- `DELETE /api/scripts/:id` ✅
- `POST /api/scripts/:id/duplicate` ✅

#### Test Priority: **HIGH**
- Script CRUD operations
- AI chat functionality
- Script modification flow

### 3. 🎙️ **Voice Cloning** (High Priority)

Voice cloning and management for video narration.

#### Active Endpoints:
- `POST /api/voice-clone` ✅
- `GET /api/voice-clone/user-voices` ✅
- `POST /api/onboarding` ✅ (includes voice samples)

#### Test Priority: **HIGH**
- Voice sample upload
- Voice library management
- Integration with video generation

### 4. 📱 **Source Video Management** (Medium Priority)

Managing user's video assets.

#### Active Endpoints:
- `POST /api/s3-upload` ✅
- `POST /api/source-videos` ✅
- `GET /api/source-videos` ✅
- `PUT /api/source-videos/:videoId` ✅

#### Test Priority: **MEDIUM**
- File upload to S3
- Video metadata management
- Video selection for generation

### 5. 📊 **TikTok Analysis** (Medium Priority)

Account analysis and insights generation.

#### Active Endpoints:
- `POST /api/account-analysis` ✅
- `GET /api/account-analysis/status/:id` ✅
- `GET /api/account-analysis/existing` ✅
- `GET /api/account-analysis/active-job` ✅
- `GET /api/account-context/:accountId` ✅
- `GET /api/account-analysis/conversations` ✅
- `GET /api/account-analysis/conversations/:id/messages` ✅
- `POST /api/account-analysis/validate-handle` ✅

#### Test Priority: **MEDIUM**
- Analysis initiation and status tracking
- Results retrieval
- Conversation generation

### 6. 👤 **User Management** (Low Priority)

Basic user operations.

#### Active Endpoints:
- `POST /api/support/report-issue` ✅
- `DELETE /api/user-management/delete-user` ✅

#### Test Priority: **LOW**
- Issue reporting
- Account deletion

## Deprecated/Unused Endpoints

### Legacy Video Generation
- `POST /api/videos/generate` ❌ - Replaced by script-based generation
- `POST /api/prompts/enhance` ❌
- `POST /api/prompts/enhance-system` ❌
- `POST /api/prompts/generate-system` ❌

### Unused Endpoints
- `POST /api/video-analysis` ❌ - Defined but not used
- `POST /api/webhooks/creatomate` ❌ - Server-to-server only
- `GET /api/account-analysis/result/:id` ❌ - Backend marked for removal
- `POST /api/account-analysis/chat` ❌ - Replaced by conversations

### Legacy Supabase Functions
- `/functions/v1/create-voice-clone` ❌
- `/functions/v1/process-onboarding` ❌

## Testing Strategy (80/20 Approach)

### Phase 1: Critical Path Testing (80% Value)
1. **Video Generation Flow** 🚨
   - Fix commented out endpoint
   - Test full script → video pipeline
   - Validate template generation with new ValidationService

2. **Script Management**
   - AI chat interactions
   - Script modifications
   - CRUD operations

3. **Voice Integration**
   - Voice cloning flow
   - Voice selection in video generation

### Phase 2: Supporting Features (20% Value)
4. **Source Videos**
   - Upload and management
   - Integration with generation

5. **TikTok Analysis**
   - Analysis flow
   - Results display

6. **User Management**
   - Basic operations

## Action Items

### Immediate Actions Required:
1. **🚨 CRITICAL - APP BREAKING**: Entire video generation from script is commented out
   - File: `mobile/app/hooks/useVideoRequest.ts:326-342`
   - Impact: Main feature completely non-functional
   - Function returns `true` without making API call
   - Backend endpoint exists and working

2. **Fix**: TIKTOK_ANALYSIS_ACTIVE_JOB endpoint URL (missing /api prefix)
3. **Clean up**: Remove deprecated endpoint definitions
4. **Backend**: Remove endpoints marked with TODO: remove

### Testing Priorities:
1. Video generation pipeline (ValidationService tests ✅)
2. Script management flows
3. Voice cloning integration
4. Source video handling
5. TikTok analysis features

## API Health Summary

- **Active Endpoints**: 18 core endpoints
- **Deprecated**: 10 endpoints to be removed
- **Critical Issues**: 1 (main video generation endpoint commented out)
- **Minor Issues**: 1 (URL path fix needed)

This mapping provides a clear view of the API surface area and helps prioritize testing efforts on the features that deliver the most value to users.