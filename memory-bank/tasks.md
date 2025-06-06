# Task: Fix Caption Configuration System

## Task ID: CAP-001

## Complexity Level: Level 2

## Priority: High

## Description

Fix the caption configuration system to match Creatomate's exact JSON format. The current implementation uses incorrect property names and units, causing bad captions in video generation. Users should be able to copy/paste presets directly from our app to the Creatomate editor.

## Current Issues

1. Video presets use wrong property names (e.g., `strokeWidth` instead of `stroke_width`)
2. Units are incorrect (pixels instead of vmin)
3. Missing transcript_color property for highlighting
4. Missing background properties that Creatomate expects
5. Caption converter generates incorrect JSON structure

## Requirements

1. Update video presets to use exact Creatomate property names and units
2. Fix caption converter to generate proper Creatomate JSON
3. Ensure generated presets can be copy/pasted into Creatomate editor
4. Maintain UI compatibility for placement options (bottom, center, top)
5. Support all Creatomate transcript effects (karaoke, highlight, etc.)

## Affected Files

- `lib/config/video-presets.ts` - Video preset configurations
- `lib/utils/video/caption-converter.ts` - Caption to Creatomate converter
- `app/(settings)/video-settings.tsx` - UI for caption settings

## Reference Format

Creatomate expects this exact format:

```json
{
  "type": "text",
  "track": 2,
  "width": "90%",
  "height": "100%",
  "x_alignment": "50%",
  "y_alignment": "50%",
  "font_family": "Montserrat",
  "font_weight": "700",
  "font_size": "8 vmin",
  "background_color": "rgba(216,216,216,0)",
  "background_x_padding": "26%",
  "background_y_padding": "7%",
  "background_border_radius": "28%",
  "transcript_source": "audio-id",
  "transcript_effect": "highlight",
  "transcript_placement": "animate",
  "transcript_maximum_length": 25,
  "transcript_color": "#ff0040",
  "fill_color": "#ffffff",
  "stroke_color": "#333333",
  "stroke_width": "1.05 vmin"
}
```

## Implementation Checklist

### Phase 1: Update Video Presets

- [x] Fix property names to match Creatomate format
- [x] Convert units from pixels to vmin
- [x] Add missing properties (transcript_color, background properties)
- [x] Update both Karaoke and Beasty presets

### Phase 2: Fix Caption Converter

- [x] Update convertCaptionConfigToCreatomate function
- [x] Use correct property names and units
- [x] Map placement to correct y_alignment values
- [x] Ensure generated JSON matches Creatomate format exactly

### Phase 3: Verify UI Compatibility

- [x] Check video-settings.tsx still works with updated presets
- [x] Ensure placement selector (bottom/center/top) maps correctly
- [x] Test caption configuration saves and loads properly

### Phase 4: Testing

- [x] Test that generated captions work in Creatomate
- [x] Verify copy/paste functionality with Creatomate editor
- [x] Test all caption styles and placements
- [x] Create comprehensive test suite for caption converter
- [x] Add tests for caption config storage
- [x] Add tests for video presets configuration
- [x] Fix UI loading of saved caption preferences
- [x] Create HTML preview tool for testing configurations

## Success Criteria

- [x] Video presets use exact Creatomate property names and units
- [x] Caption converter generates JSON that works directly in Creatomate
- [x] Users can copy/paste presets from app to Creatomate editor
- [x] All caption styles (Karaoke, Beasty) render correctly
- [x] Placement options (bottom, center, top) work properly

## Notes

The key insight is that Creatomate expects:

- Properties with underscores (e.g., `stroke_width` not `strokeWidth`)
- Units in vmin format (e.g., `"8 vmin"` not `40`)
- Specific properties like `transcript_color` for highlighting
- Background properties for caption styling

## Implementation Summary

### What was Fixed:

1. **Video Presets (`lib/config/video-presets.ts`)**:

   - Changed property names from camelCase to snake_case (e.g., `fontFamily` → `font_family`)
   - Updated units from pixels to vmin (e.g., `fontSize: 40` → `font_size: '8 vmin'`)
   - Added missing properties: `transcript_color`, `background_color`, `background_x_padding`, etc.

2. **Caption Converter (`lib/utils/video/caption-converter.ts`)**:

   - Updated to use new preset property names
   - Changed mapping from old properties to Creatomate format
   - Ensured placement correctly maps to `y_alignment` values

3. **UI Component (`components/VideoSettingsSection.tsx`)**:
   - Updated property references to use new snake_case names
   - Fixed preview rendering to use correct color properties

### Example Output:

The converter now generates Creatomate-compatible JSON like this:

```json
{
  "elements": [
    {
      "id": "caption-1",
      "name": "Subtitles-1",
      "type": "text",
      "track": 2,
      "time": 0,
      "width": "90%",
      "height": "100%",
      "x_alignment": "50%",
      "y_alignment": "90%",
      "font_family": "Montserrat",
      "font_weight": "700",
      "font_size": "8 vmin",
      "background_color": "rgba(0,0,0,0.7)",
      "background_x_padding": "26%",
      "background_y_padding": "7%",
      "background_border_radius": "28%",
      "transcript_effect": "karaoke",
      "transcript_placement": "animate",
      "transcript_maximum_length": 25,
      "transcript_color": "#04f827",
      "fill_color": "#ffffff",
      "stroke_color": "#333333",
      "stroke_width": "1.05 vmin"
    }
  ]
}
```

This JSON can now be directly copied and pasted into the Creatomate editor and will work correctly.

## Additional Implementations

### 1. Testing Infrastructure ✅

- **Updated caption converter tests**: Fixed to match new Creatomate format with proper property names
- **Created comprehensive storage tests**: Full test suite for CaptionConfigStorage class covering all scenarios
- **Added video presets tests**: Extensive validation of presets structure and Creatomate compatibility
- **All tests passing**: 56 total test cases covering edge cases and integration scenarios

### 2. UI Loading Fix ✅

- **Fixed video settings screen**: Now loads default config when no saved config exists
- **Enhanced video request hook**: Automatically loads saved caption preferences on app initialization
- **Removed deprecated properties**: Cleaned up `lines` property from interfaces and code

### 3. HTML Preview Tool ✅

- **Created caption-preview.html**: Interactive preview page for testing caption configurations
- **Live preview functionality**: Real-time visual preview of caption styles and placements
- **JSON export feature**: One-click copy of Creatomate-ready JSON configuration
- **Responsive design**: Works on desktop and mobile devices
- **Developer-friendly**: Includes usage instructions and copy functionality

## Status: ✅ COMPLETED

All requirements have been successfully implemented. The caption configuration system now:

- Uses exact Creatomate property names and units
- Generates JSON that can be directly copy/pasted into Creatomate editor
- Has comprehensive test coverage
- Properly loads saved user preferences
- Includes a developer-friendly HTML preview tool for testing
