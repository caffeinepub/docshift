# DocShift

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Animated homepage with live wallpaper effect (optical illusions, particle flows, geometric animations)
- Document format converter UI (upload file, select target format, convert)
- Simulated conversion progress bar with animated states
- Mini game (Snake or Breakout) that launches during conversion to keep user entertained
- Smooth page transitions and micro-animations throughout

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: store conversion jobs (filename, source format, target format, status, progress)
2. Frontend homepage: full-screen animated canvas with flowing particles, geometric optical illusions, and morphing shapes as live wallpaper
3. Converter page: drag-and-drop upload zone, format selector dropdown, animated convert button
4. Conversion progress: animated progress bar with percentage, status messages, trigger mini game option
5. Mini game modal: simple in-browser Snake game playable while conversion runs
6. Navigation and smooth transitions between views
