# Character Configuration Guide

## Overview

Each Live2D character has different dimensions and proportions, so they need individual positioning and scaling settings. All character configurations are centralized in [`characterConfig.js`](file:///e:/AI-SYNTIA-V5/frontend/src/config/characterConfig.js).

## Configuration File Location

```
frontend/src/config/characterConfig.js
```

## Character Settings

Each character has the following configurable properties:

### Basic Info

- **`name`**: Display name shown in the speech bubble
- **`modelPath`**: Path to the Live2D model3.json file

### Positioning & Scaling

- **`anchor`**: Anchor point for the model (where it pivots from)
  - `x`: Horizontal anchor (0.0 = left, 0.5 = center, 1.0 = right)
  - `y`: Vertical anchor (0.0 = top, 0.5 = center, 1.0 = bottom)
- **`position`**: Position on canvas (relative, 0-1)
  - `x`: Horizontal position (0.0 = left edge, 0.5 = center, 1.0 = right edge)
  - `y`: Vertical position (0.0 = top edge, 0.5 = center, 1.0 = bottom edge)
- **`scale`**: Size multiplier (0.1 = 10%, 1.0 = 100%, 2.0 = 200%)

### Canvas Dimensions

- **`canvasWidth`**: Width of the canvas in pixels
- **`canvasHeight`**: Height of the canvas in pixels

### Voice Configuration

- **`voiceKeywords`**: Array of strings used to select the system voice. The system will try to find a voice that matches these keywords in order.
  - Example: `['male', 'david']` will look for a voice named "David" or a male voice.

## Current Character Configurations

### Aria (Black Wolf Girl)

```javascript
aria: {
  name: 'Aria',
  modelPath: '/avatars/aria/BlackWolfGIrl.model3.json',
  anchor: { x: 0.7, y: 0.23 },
  position: { x: 0.5, y: 0.3 },
  scale: 0.3,
  canvasWidth: 500,
  canvasHeight: 400,
  voiceKeywords: ['aria', 'female', 'woman', 'girl'],
}
```

### Sera (Snow Leopard)

```javascript
sera: {
  name: 'Sera',
  modelPath: '/avatars/sera/Snow Leopard.model3.json',
  anchor: { x: 0.7, y: 0.2 },
  position: { x: 0.5, y: 0.25 },
  scale: 0.14,
  canvasWidth: 500,
  canvasHeight: 400,
  voiceKeywords: ['sera', 'susan', 'female', 'woman'],
}
```

### Eidon (10th)

```javascript
eidon: {
  name: 'Eidon',
  modelPath: '/avatars/eidon/10th.model3.json',
  anchor: { x: 0.5, y: 0.15 },
  position: { x: 0.5, y: 0.2 },
  scale: 0.35,
  canvasWidth: 500,
  canvasHeight: 400,
  voiceKeywords: ['male', 'man', 'boy', 'david', 'mark'],
}
```

## How to Adjust Character Positioning

If a character appears in the wrong position or is too large/small:

1. **Open the configuration file**:

   ```
   frontend/src/config/characterConfig.js
   ```

2. **Find the character** you want to adjust (aria, sera, or eidon)

3. **Adjust the values**:

   - **Too high/low**: Change `position.y` (smaller = higher, larger = lower)
   - **Too left/right**: Change `position.x` (smaller = left, larger = right)
   - **Too large/small**: Change `scale` (smaller = smaller, larger = bigger)
   - **Tilted/off-center**: Adjust `anchor.x` and `anchor.y`

4. **Save the file** - Changes will apply immediately (hot reload)

5. **Test in the app** by logging in with a student who has that character selected

## Example: Moving Sera Down and Making Her Smaller

**Before**:

```javascript
sera: {
  position: { x: 0.5, y: 0.25 },
  scale: 0.25,
}
```

**After** (moved down 10%, made 20% smaller):

```javascript
sera: {
  position: { x: 0.5, y: 0.35 },  // Increased y
  scale: 0.2,                      // Decreased scale
}
```

## Tips

- **Start small**: Make small adjustments (0.05 for position, 0.05 for scale)
- **Test with each character**: Log in with students who have different character preferences
- **Keep aspect ratio**: The scale value applies to both width and height equally
- **Canvas size**: Usually keep at 500x400 unless a character needs more space

## Components Using This Config

- [`TutorCharacter.vue`](file:///e:/AI-SYNTIA-V5/frontend/src/components/education/TutorCharacter.vue) - Renders the Live2D model
- [`AiTutor.vue`](file:///e:/AI-SYNTIA-V5/frontend/src/components/education/AiTutor.vue) - Main tutor component with speech bubble
