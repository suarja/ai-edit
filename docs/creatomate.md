Creatomate JSON Format Documentation
Table of Contents
Introduction
Basic Structure
Output Configuration
Timeline System
Understanding Tracks
Time and Duration
Element Positioning
Animation System
Keyframe Animation
Built-in Animations
Enter and Exit Animations
Scene Animations
Transition Animations
Full-Length Animations
Easing Functions
Element Types
Common Properties
Text Element
Image Element
Video Element
Audio Element
Shape Element
Composition Element
Advanced Features
Compositions and Grouping
Masking and Blending
Color Effects
3D Transformations
Practical Examples
Best Practices
Troubleshooting

Introduction
Creatomate is a powerful platform that allows developers to create videos and images using JSON configuration, similar to how HTML and CSS are used to build websites. This declarative approach enables programmatic generation of dynamic graphics through any programming language that can output JSON.
Key Features
JSON-based: Simple, human-readable format for defining visual content
API-driven: Generate content programmatically via REST API
Multi-format output: Supports MP4 videos, GIF animations, PNG/JPG images
Rich animation system: Keyframes, built-in effects, and custom animations
Timeline-based: Professional video editing concepts applied to code
Use Cases
Automated video generation for social media
Dynamic image creation for marketing campaigns
Programmatic content creation at scale
Template-based content generation
Data visualization videos

Basic Structure
Every Creatomate JSON document follows a consistent structure with these core components:
{
  "output_format": "mp4|png|gif",
  "width": 1920,
  "height": 1080,
  "duration": "optional for videos",
  "elements": []
}

Minimal Example
{
  "output_format": "png",
  "width": 1920,
  "height": 1080,
  "elements": [
    {
      "type": "text",
      "text": "Hello World",
      "fill_color": "#ffffff",
      "font_family": "Open Sans"
    }
  ]
}


Output Configuration
Output Formats
mp4: Video output with audio support
png: Static image with transparency support
gif: Animated image format
jpg: Static image without transparency
Canvas Dimensions
width: Canvas width in pixels
height: Canvas height in pixels
duration: Total video duration (for videos only)
Duration Formats
"duration": "3 s"      // 3 seconds
"duration": "1.5 s"    // 1.5 seconds
"duration": "30 f"     // 30 frames


Timeline System
The timeline is the foundation of Creatomate's temporal organization, allowing precise control over when and how elements appear.
Understanding Tracks
Tracks determine the layering order of elements:
Track 1: Bottom layer (background)
Track 2: Middle layer
Track 3: Top layer (foreground)
Higher numbers: Appear above lower numbers
Time and Duration
Each element can specify:
time: When the element starts appearing
duration: How long the element remains visible
track: Which layer the element occupies
Element Positioning
Sequential Elements (Same Track)
Elements on the same track appear one after another:
{
  "elements": [
    {
      "type": "text",
      "track": 1,
      "duration": "2 s",
      "text": "First text"
    },
    {
      "type": "text",
      "track": 1,
      "duration": "2 s",
      "text": "Second text"
    }
  ]
}

Simultaneous Elements (Different Tracks)
Elements on different tracks can appear simultaneously:
{
  "elements": [
    {
      "type": "shape",
      "track": 1,
      "fill_color": "#ff0000"
    },
    {
      "type": "text",
      "track": 2,
      "text": "Text over shape"
    }
  ]
}

Precise Timing
Control exact timing with the time parameter:
{
  "elements": [
    {
      "type": "text",
      "track": 1,
      "time": "1 s",
      "duration": "2 s",
      "text": "Appears at 1 second"
    }
  ]
}


Animation System
Creatomate provides multiple animation approaches, from simple keyframes to complex built-in effects.
Keyframe Animation
Keyframes define property values at specific points in time, with automatic interpolation between them.
Basic Keyframe Structure
{
  "property_name": [
    {
      "time": "0 s",
      "value": "initial_value"
    },
    {
      "time": "2 s",
      "easing": "quintic-in-out",
      "value": "final_value"
    }
  ]
}

Movement Animation
{
  "type": "text",
  "text": "Moving text",
  "x": [
    {
      "time": "0 s",
      "value": "25%"
    },
    {
      "time": "2 s",
      "easing": "quintic-in-out",
      "value": "75%"
    }
  ]
}

Scale Animation
{
  "type": "text",
  "text": "Growing text",
  "x_scale": [
    {
      "time": "0 s",
      "value": "50%"
    },
    {
      "time": "1 s",
      "easing": "bounce-out",
      "value": "100%"
    }
  ]
}

Built-in Animations
Creatomate includes dozens of pre-built animation effects that can be applied to any element.
Animation Structure
{
  "animations": [
    {
      "time": "start|end|specific_time",
      "duration": "animation_duration",
      "type": "animation_type",
      "easing": "easing_function",
      "additional_parameters": "values"
    }
  ]
}

Enter and Exit Animations
Text Slide Animation
{
  "type": "text",
  "text": "Animated text",
  "animations": [
    {
      "time": "start",
      "duration": "1 s",
      "easing": "quadratic-out",
      "type": "text-slide",
      "direction": "up",
      "split": "letter",
      "scope": "split-clip"
    }
  ]
}

Exit Animation
{
  "animations": [
    {
      "time": "end",
      "duration": "1 s",
      "easing": "quadratic-out",
      "reversed": true,
      "type": "text-fly",
      "split": "word"
    }
  ]
}

Scene Animations
Animations can occur at any point during an element's lifetime:
{
  "animations": [
    {
      "time": "0.5 s",
      "duration": "1 s",
      "type": "bounce",
      "frequency": "2 Hz",
      "scale": "50%",
      "y_anchor": "100%"
    }
  ]
}

Transition Animations
Create smooth transitions between consecutive elements on the same track:
{
  "elements": [
    {
      "type": "text",
      "track": 1,
      "duration": "2.5 s",
      "text": "First text"
    },
    {
      "type": "text",
      "track": 1,
      "duration": "2.5 s",
      "text": "Second text",
      "animations": [
        {
          "time": "start",
          "duration": "1 s",
          "transition": true,
          "type": "spin",
          "rotation": "360°"
        }
      ]
    }
  ]
}

Full-Length Animations
Omit time and duration to make animations last the entire element duration:
{
  "animations": [
    {
      "easing": "linear",
      "type": "wiggle",
      "frequency": "1 Hz",
      "x_angle": "20°",
      "y_angle": "50°",
      "z_angle": "10°"
    }
  ]
}


Easing Functions
Easing functions control the rate of change in animations, creating natural motion effects.
Linear Easing
linear: Constant rate of change
Cubic Bezier
cubic-bezier(x1, y1, x2, y2): Custom timing curve
Step Functions
steps(n): Discrete steps animation
Elastic Easing
elastic-in: Elastic effect at start
elastic-out: Elastic effect at end
elastic-in-out: Elastic effect at both ends
Bounce Easing
bounce-in: Bounce effect at start
bounce-out: Bounce effect at end
bounce-in-out: Bounce effect at both ends
Polynomial Easing
Quadratic: quadratic-in, quadratic-out, quadratic-in-out
Cubic: cubic-in, cubic-out, cubic-in-out
Quartic: quartic-in, quartic-out, quartic-in-out
Quintic: quintic-in, quintic-out, quintic-in-out
Advanced Easing
Exponential: exponential-in, exponential-out, exponential-in-out
Circular: circular-in, circular-out, circular-in-out
Back: back-in, back-out, back-in-out
Sinusoidal: sinusoid-in, sinusoid-out, sinusoid-in-out

Element Types
Common Properties
All element types share these fundamental properties:
Positioning and Sizing
{
  "x": "50%",              // Horizontal position
  "y": "50%",              // Vertical position
  "width": "100%",         // Element width
  "height": "100%",        // Element height
  "aspect_ratio": null     // Width/height ratio constraint
}

Timeline Properties
{
  "track": 1,              // Layer number
  "time": "0 s",           // Start time
  "duration": "3 s",       // Duration
  "visible": true          // Visibility toggle
}

Transformations
{
  "x_scale": "100%",       // Horizontal scale
  "y_scale": "100%",       // Vertical scale
  "x_rotation": "0°",      // X-axis rotation
  "y_rotation": "0°",      // Y-axis rotation
  "z_rotation": "0°",      // Z-axis rotation
  "x_skew": "0°",          // Horizontal skew
  "y_skew": "0°"           // Vertical skew
}

Anchoring
{
  "x_anchor": "50%",       // Transform origin X
  "y_anchor": "50%"        // Transform origin Y
}

Visual Effects
{
  "opacity": "100%",       // Transparency
  "blur_radius": 0,        // Blur effect
  "shadow_color": null,    // Drop shadow color
  "shadow_blur": "3 vmin", // Shadow blur radius
  "shadow_x": "0 vmin",    // Shadow X offset
  "shadow_y": "0 vmin"     // Shadow Y offset
}

Colors and Fills
{
  "fill_color": "#ffffff", // Primary color
  "fill_mode": "solid",    // solid|linear|radial
  "stroke_color": null,    // Border color
  "stroke_width": "0.1 vmin" // Border thickness
}

Text Element
The text element is used for displaying and animating text content.
Basic Text Properties
{
  "type": "text",
  "text": "Your text content",
  "font_family": "Aileron",
  "font_size": null,       // Auto-size if null
  "font_weight": 400,
  "font_style": "normal"
}

Text Styling
{
  "fill_color": "#000000",
  "letter_spacing": "0%",
  "line_height": "115%",
  "text_transform": "none", // none|capitalize|uppercase|lowercase
  "text_wrap": true,
  "text_clip": false
}

Text Alignment
{
  "x_alignment": "0%",     // 0%=left, 50%=center, 100%=right
  "y_alignment": "0%"      // 0%=top, 50%=middle, 100%=bottom
}

Font Size Control
{
  "font_size": null,           // Auto-size
  "font_size_minimum": "1 vmin",
  "font_size_maximum": "100 vmin"
}

Text Background
{
  "background_color": null,
  "background_x_padding": "25%",
  "background_y_padding": "25%",
  "background_border_radius": "0%"
}

Auto-Transcription
{
  "transcript_source": null,        // Video element ID
  "transcript_effect": "color",     // color|karaoke|highlight|fade|bounce|slide|enlarge
  "transcript_split": "word",       // none|word|line
  "transcript_placement": "static", // static|animate|align
  "transcript_maximum_length": null,
  "transcript_color": "#e74c3c"
}

Image Element
Display static images with various fitting and cropping options.
Basic Image Properties
{
  "type": "image",
  "source": "https://example.com/image.jpg",
  "fit": "cover",          // cover|contain|fill
  "smart_crop": false
}

AI Image Generation
{
  "provider": "openai",    // AI platform for generation
  "source": "A beautiful landscape"  // Text prompt
}

Video Element
Incorporate video files with advanced playback controls.
Basic Video Properties
{
  "type": "video",
  "source": "https://example.com/video.mp4",
  "duration": "media",     // Use source duration
  "fit": "cover"           // cover|contain|fill
}

Video Trimming
{
  "trim_start": "5.0",     // Start 5 seconds in
  "trim_duration": "10.0", // Play for 10 seconds
  "loop": false
}

Audio Control
{
  "volume": "100%",
  "audio_fade_in": "1.0",  // 1 second fade in
  "audio_fade_out": "1.0"  // 1 second fade out
}

Audio Element
Add audio tracks to your compositions.
Basic Audio Properties
{
  "type": "audio",
  "source": "https://example.com/audio.mp3",
  "duration": "media",
  "volume": "100%"
}

Audio Processing
{
  "trim_start": null,
  "trim_duration": null,
  "loop": false,
  "audio_fade_in": null,
  "audio_fade_out": null
}

AI Audio Generation
{
  "provider": "elevenlabs", // AI voice provider
  "source": "Text to be spoken"
}

Voiceovers and Subtitles System
Creatomate provides a powerful system for creating synchronized voiceovers and subtitles, enabling automatic transcription and dynamic subtitle highlighting.
Creating Voiceovers with AI
ElevenLabs Integration
{
  "type": "audio",
  "track": 3,
  "time": 0,
  "source": "",  // Empty for AI generation
  "provider": "elevenlabs model_id=eleven_multilingual_v2 voice_id=XrExE9yKIg1WjnnlVkGX stability=0.75",
  "dynamic": true
}

Voice Provider Configuration
The provider parameter supports detailed configuration:
model_id: The AI model to use (e.g., eleven_multilingual_v2)
voice_id: Specific voice identifier from ElevenLabs
stability: Voice consistency (0.0 to 1.0, where higher values are more stable)
Common Voice IDs
XrExE9yKIg1WjnnlVkGX: Professional male voice
jUHQdLfy668sllNiNTSW: Professional female voice
Custom voice IDs from your ElevenLabs account
Auto-Generated Subtitles
Basic Subtitle Setup
{
  "type": "text",
  "track": 2,
  "time": 0,
  "width": "86.66%",
  "height": "37.71%",
  "transcript_source": "audio_element_id",
  "transcript_effect": "highlight",
  "transcript_maximum_length": 35,
  "transcript_color": "#ff0040"
}

Transcript Properties Explained
Core Transcript Settings
transcript_source: ID of the audio element to transcribe
transcript_effect: Visual effect for highlighting spoken text
transcript_split: How to split the text for effects
transcript_placement: How subtitles are positioned
transcript_maximum_length: Maximum characters shown simultaneously
transcript_color: Color for highlighted/active text
Transcript Effects
{
  "transcript_effect": "highlight"  // Options: color|karaoke|highlight|fade|bounce|slide|enlarge
}

Effect Types:
color: Changes text color for spoken words
karaoke: Word-by-word reveal effect
highlight: Background highlight on active text
fade: Fade in/out effect for words
bounce: Bouncing animation on spoken words
slide: Sliding animation for text
enlarge: Scale effect on active words
Text Splitting Options
{
  "transcript_split": "word"  // Options: none|word|line
}

none: No splitting, entire text affected
word: Individual word highlighting
line: Line-by-line effects
Placement Modes
{
  "transcript_placement": "static"  // Options: static|animate|align
}

static: Fixed subtitle position
animate: Animated subtitle appearance
align: Aligned with audio timing
Complete Voiceover + Subtitle Example
Scene with Synchronized Audio and Subtitles
{
  "type": "composition",
  "name": "Scene-1",
  "track": 1,
  "elements": [
    {
      "name": "Background-Image",
      "type": "image",
      "track": 1,
      "source": "your-image-id",
      "color_overlay": "rgba(0,0,0,0.15)",
      "animations": [
        {
          "easing": "linear",
          "type": "pan",
          "end_x": "50%",
          "start_x": "50%",
          "end_scale": "120%",
          "start_scale": "100%"
        }
      ]
    },
    {
      "name": "Subtitles",
      "type": "text",
      "track": 2,
      "width": "86.66%",
      "height": "37.71%",
      "x_alignment": "50%",
      "y_alignment": "50%",
      "font_family": "Montserrat",
      "font_weight": "700",
      "font_size": "8 vmin",
      "fill_color": "#ffffff",
      "stroke_color": "#333333",
      "stroke_width": "1.05 vmin",
      "background_color": "rgba(216,216,216,0)",
      "background_x_padding": "26%",
      "background_y_padding": "7%",
      "background_border_radius": "28%",
      "transcript_source": "voiceover-audio-id",
      "transcript_effect": "highlight",
      "transcript_maximum_length": 35,
      "transcript_color": "#ff0040"
    },
    {
      "id": "voiceover-audio-id",
      "name": "Voiceover",
      "type": "audio",
      "track": 3,
      "source": "",
      "provider": "elevenlabs model_id=eleven_multilingual_v2 voice_id=XrExE9yKIg1WjnnlVkGX stability=0.75",
      "dynamic": true
    }
  ]
}

Advanced Subtitle Styling
Professional Subtitle Design
{
  "type": "text",
  "font_family": "Montserrat",
  "font_weight": "700",
  "font_size": "8 vmin",
  "fill_color": "#ffffff",
  "stroke_color": "#333333",
  "stroke_width": "1.05 vmin",
  "background_color": "rgba(0,0,0,0.7)",
  "background_x_padding": "26%",
  "background_y_padding": "7%",
  "background_border_radius": "28%",
  "x_alignment": "50%",
  "y_alignment": "50%"
}

Responsive Subtitle Sizing
{
  "width": "86.66%",        // Responsive width
  "height": "37.71%",       // Responsive height
  "font_size": "8 vmin",    // Viewport-relative font size
  "text_wrap": true,        // Enable text wrapping
  "text_clip": false        // Don't clip overflow text
}

Multi-Scene Video Template
Sequential Scenes with Individual Voiceovers
{
  "output_format": "mp4",
  "width": 720,
  "height": 1280,
  "elements": [
    {
      "name": "Scene-1",
      "type": "composition",
      "track": 1,
      "elements": [
        {
          "type": "image",
          "track": 1,
          "source": "image-1-id",
          "color_overlay": "rgba(0,0,0,0.15)"
        },
        {
          "type": "text",
          "track": 2,
          "transcript_source": "voice-1-id",
          "transcript_effect": "highlight"
        },
        {
          "id": "voice-1-id",
          "type": "audio",
          "track": 3,
          "provider": "elevenlabs model_id=eleven_multilingual_v2 voice_id=XrExE9yKIg1WjnnlVkGX"
        }
      ]
    },
    {
      "name": "Scene-2", 
      "type": "composition",
      "track": 1,
      "elements": [
        {
          "type": "image",
          "track": 1,
          "source": "image-2-id",
          "color_overlay": "rgba(0,0,0,0.15)"
        },
        {
          "type": "text",
          "track": 2,
          "transcript_source": "voice-2-id",
          "transcript_effect": "highlight"
        },
        {
          "id": "voice-2-id",
          "type": "audio",
          "track": 3,
          "provider": "elevenlabs model_id=eleven_multilingual_v2 voice_id=jUHQdLfy668sllNiNTSW"
        }
      ]
    }
  ]
}

Best Practices for Voiceovers and Subtitles
Voice Settings Optimization
Stability: Use 0.75 for consistent professional delivery
Voice Selection: Choose appropriate voices for your content tone
Model Selection: eleven_multilingual_v2 for multi-language support
Subtitle Design Guidelines
Readability: High contrast between text and background
Size: Use viewport-relative units (vmin) for responsive design
Length: Limit to 35 characters for optimal readability
Positioning: Center alignment works best for social media formats
Performance Considerations
Dynamic Elements: Mark audio and related elements as dynamic: true
Source Management: Use empty source for AI-generated content
ID Linking: Ensure subtitle transcript_source matches audio element ID
Timing and Synchronization
Automatic Duration: Let audio duration determine scene length
Scene Transitions: Use compositions for clean scene breaks
Element Coordination: Audio, subtitles, and visuals auto-sync through transcript system
Shape Element
Create vector graphics using SVG path syntax.
Basic Shape Properties
{
  "type": "shape",
  "path": "M 0 0 L 100 0 L 100 100 L 0 100 Z",
  "fill_color": "#ffffff",
  "stroke_color": "#000000",
  "stroke_width": "1 vmin"
}

Coordinate Systems
Boxed Coordinates (Recommended)
{
  "width": "200px",
  "height": "200px",
  "path": "M 0% 0% L 100% 0% L 100% 100% L 0% 100% Z"
}

Unboxed Coordinates
{
  "width": null,
  "height": null,
  "path": "M 0 0 L 200 0 L 200 200 L 0 200 Z"
}

Composition Element
Group elements together for complex animations and layouts.
Basic Composition
{
  "type": "composition",
  "width": "50%",
  "height": "50%",
  "elements": [
    {
      "type": "text",
      "track": 1,
      "text": "Grouped text"
    }
  ]
}

Auto-sizing Compositions
{
  "width": null,           // Auto-size to content
  "height": null,          // Auto-size to content
  "flow_direction": "vertical" // vertical|horizontal
}

Looping Compositions
{
  "loop": true,
  "plays": 3               // Loop 3 times (null = infinite)
}


Advanced Features
Compositions and Grouping
Compositions allow you to group elements and animate them as a single unit, similar to After Effects compositions.
Animated Composition
{
  "type": "composition",
  "track": 1,
  "duration": "3 s",
  "width": "50%",
  "height": "50%",
  "y": [
    {
      "time": "0 s",
      "value": "30%"
    },
    {
      "time": "1.5 s",
      "value": "70%"
    },
    {
      "time": "3 s",
      "value": "30%"
    }
  ],
  "elements": [
    {
      "type": "text",
      "track": 1,
      "text": "Grouped element 1"
    },
    {
      "type": "text",
      "track": 2,
      "text": "Grouped element 2"
    }
  ]
}

Masking and Blending
Blend Modes
{
  "blend_mode": "multiply"  // multiply|screen|overlay|darken|lighten|etc.
}

Masking
{
  "mask_mode": "alpha"      // alpha|alpha-inverted|luma|luma-inverted
}

Color Effects
Color Filters
{
  "color_filter": "grayscale",     // none|brighten|contrast|hue|invert|grayscale|sepia
  "color_filter_value": "50%",
  "color_overlay": "#ff0000"       // Overlay color
}

3D Transformations
Perspective and 3D Rotation
{
  "perspective": "1000px",         // 3D perspective distance
  "x_rotation": "45°",
  "y_rotation": "30°",
  "z_rotation": "15°",
  "backface_visible": false
}

Warp Effects
{
  "warp_mode": "perspective",      // default|perspective
  "warp_matrix": [
    [0, 0], [100, 10],
    [90, 90], [10, 100]
  ]
}


Practical Examples
Example 1: Simple Text Animation
{
  "output_format": "mp4",
  "width": 1920,
  "height": 1080,
  "elements": [
    {
      "type": "text",
      "track": 1,
      "duration": "3 s",
      "text": "Hello World!",
      "font_size": "80px",
      "fill_color": "#ffffff",
      "x": "50%",
      "y": "50%",
      "animations": [
        {
          "time": "start",
          "duration": "1 s",
          "type": "text-slide",
          "direction": "up",
          "split": "letter"
        }
      ]
    }
  ]
}

Example 2: Multi-layer Video with Background
{
  "output_format": "mp4",
  "width": 1920,
  "height": 1080,
  "elements": [
    {
      "type": "shape",
      "track": 1,
      "width": "100%",
      "height": "100%",
      "fill_color": "#2c3e50",
      "path": "M 0% 0% L 100% 0% L 100% 100% L 0% 100% Z"
    },
    {
      "type": "video",
      "track": 2,
      "source": "https://example.com/background.mp4",
      "fit": "cover",
      "opacity": "30%"
    },
    {
      "type": "text",
      "track": 3,
      "duration": "5 s",
      "text": "Amazing Video Title",
      "font_size": "60px",
      "fill_color": "#ffffff",
      "y": "30%",
      "animations": [
        {
          "time": "start",
          "duration": "1 s",
          "type": "text-fly",
          "direction": "down"
        }
      ]
    }
  ]
}

Example 3: Data Visualization Animation
{
  "output_format": "mp4",
  "width": 1920,
  "height": 1080,
  "duration": "10 s",
  "elements": [
    {
      "type": "shape",
      "track": 1,
      "x": "20%",
      "y": "70%",
      "width": "60px",
      "height": [
        {
          "time": "0 s",
          "value": "0%"
        },
        {
          "time": "2 s",
          "easing": "bounce-out",
          "value": "40%"
        }
      ],
      "fill_color": "#e74c3c",
      "path": "M 0% 0% L 100% 0% L 100% 100% L 0% 100% Z"
    },
    {
      "type": "text",
      "track": 2,
      "x": "20%",
      "y": "75%",
      "text": "Sales: 40%",
      "font_size": "24px",
      "time": "2 s"
    }
  ]
}


Best Practices
Performance Optimization
Minimize simultaneous animations: Too many concurrent animations can impact performance
Use appropriate output formats: Choose MP4 for video, PNG for static images with transparency
Optimize asset sizes: Compress images and videos before using them as sources
Limit composition nesting: Deep nesting can slow down rendering
Animation Guidelines
Use easing functions: Linear animations often look unnatural
Consider timing: Allow elements to breathe between animations
Match animation styles: Consistent easing and timing create professional results
Preview animations: Test complex animations before final render
Layout and Design
Use relative units: Percentage-based positioning adapts to different canvas sizes
Plan your timeline: Sketch out timing before coding complex sequences
Layer management: Use tracks logically (background to foreground)
Text readability: Ensure sufficient contrast and appropriate font sizes
Code Organization
Structure your JSON: Use consistent indentation and formatting
Comment your intent: While JSON doesn't support comments, document your approach
Modular compositions: Break complex scenes into reusable compositions
Version control: Track changes to your templates

Troubleshooting
Common Issues
Elements Not Appearing
Check track numbers and timing
Verify element visibility settings
Ensure dimensions are not zero
Confirm color contrast (white text on white background)
Animation Problems
Verify keyframe timing doesn't exceed element duration
Check easing function spelling
Ensure animation properties are animatable
Confirm track layering for transition animations
Timing Issues
Remember that elements on the same track are sequential by default
Use explicit timing for precise control
Check total duration calculations
Verify trim settings for media elements
Visual Problems
Check z-index for layering issues
Verify blend modes aren't hiding content
Confirm mask settings
Review clip settings that might hide content
Debug Strategies
Simplify: Remove complex animations to isolate issues
Step through time: Test at different time points
Check fundamentals: Verify basic properties before adding effects
Use the template editor: Visual debugging in the Creatomate interface
Validate JSON: Ensure proper syntax and structure
Performance Issues
Reduce complexity: Simplify paths and reduce keyframes
Optimize media: Compress source videos and images
Limit effects: Too many filters can slow rendering
Check duration: Extremely long videos may timeout
e element types enables virtually unlimited creative possibilities through code.

