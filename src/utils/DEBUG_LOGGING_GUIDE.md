# Debug Logging Guide

## Overview
This guide explains how to use the centralized debug logging system to control console output and reduce log noise in the application.

## Quick Start

### Enable/Disable Logging in Browser Console
```javascript
// Enable all debug logging
window.debugLogger.enable('all')

// Enable specific categories
window.debugLogger.enable('api')
window.debugLogger.enable('images')
window.debugLogger.enable('newsletter')

// Disable specific categories
window.debugLogger.disable('api')
window.debugLogger.disable('all')

// Check current status
window.debugLogger.status()
```

## Available Categories

| Category | Description | Common Use Cases |
|----------|-------------|------------------|
| `api` | API calls and responses | Debugging HTTP requests, authentication |
| `components` | React component lifecycle | Component rendering issues |
| `hooks` | React hooks state changes | State management debugging |
| `images` | Image processing and validation | Image upload/display issues |
| `business` | Business profile operations | Business data handling |
| `auth` | Authentication flows | Login/logout debugging |
| `validation` | Form validation | Form input validation issues |
| `newsletter` | Newsletter booking operations | Newsletter flow debugging |

## Usage in Code

### Import the Debug Logger
```typescript
import { debugLog, debugWarn, debugError } from '../utils/debugLogger';
```

### Log Messages by Category
```typescript
// Regular logging
debugLog.api('API request started:', requestData);
debugLog.components('Component rendered:', componentName);
debugLog.hooks('State updated:', newState);

// Warning messages
debugWarn.validation('Validation failed:', errors);
debugWarn.images('Image processing issue:', imageData);

// Error messages
debugError.auth('Authentication failed:', error);
debugError.api('API request failed:', error);
```

## Migration from console.log

### Before (Old Way)
```typescript
console.log('[API] Making request to:', url);
console.warn('Image validation failed:', error);
console.error('Business profile error:', error);
```

### After (New Way)
```typescript
debugLog.api('Making request to:', url);
debugWarn.images('Image validation failed:', error);
debugError.business('Business profile error:', error);
```

## Benefits

1. **Controlled Output**: Enable only the logs you need
2. **Performance**: No console output in production by default
3. **Organization**: Logs are categorized by functionality
4. **Developer Experience**: Toggle logs on/off during debugging
5. **Clean Production**: No accidental console.log statements in production

## Common Scenarios

### Debugging API Issues
```javascript
// In browser console
window.debugLogger.enable('api')
// Now all API-related logs will appear
```

### Debugging Image Upload Problems
```javascript
window.debugLogger.enable('images')
// See all image processing logs
```

### Debugging Newsletter Booking Flow
```javascript
window.debugLogger.enable('newsletter')
window.debugLogger.enable('validation')
// See newsletter and form validation logs
```

### Disable All Logging
```javascript
window.debugLogger.disable('all')
// Clean console output
```

## Best Practices

1. **Use Appropriate Categories**: Choose the most relevant category for your log
2. **Don't Over-Log**: Only log essential information for debugging
3. **Use Warn/Error Appropriately**: Use `debugWarn` for warnings, `debugError` for errors
4. **Test in Production**: Ensure logs are disabled in production builds
5. **Document Debug Points**: Comment why specific debug logs are needed

## Environment Control

The debug logger respects environment settings:

- **Development**: Debug logging is available and can be enabled
- **Production**: Debug logging is disabled by default for performance
- **Testing**: Can be controlled via environment variables

## Migrated Files

The following files have been migrated to use the debug logger system:

- ✅ `useNewsletterBookingState.ts` - 69 console statements migrated
- ✅ `imageUtils.ts` - 67 console statements migrated  
- ✅ `api.ts` - 58 console statements migrated
- ✅ `EmailPreview.tsx` - Console statements migrated
- 🔄 Additional files being migrated...

## Troubleshooting

### Logs Not Appearing
1. Check if the category is enabled: `window.debugLogger.status()`
2. Enable the specific category: `window.debugLogger.enable('categoryName')`
3. Verify you're in development mode

### Too Many Logs
1. Disable specific categories: `window.debugLogger.disable('categoryName')`
2. Or disable all: `window.debugLogger.disable('all')`

### Performance Issues
The debug logger is optimized for performance:
- Logs are only processed when enabled
- Production builds have logging disabled by default
- Minimal overhead when disabled

## Migration Checklist

When migrating files from console.log to debugLogger:

1. [ ] Add import: `import { debugLog, debugWarn, debugError } from '../utils/debugLogger';`
2. [ ] Replace `console.log()` with appropriate `debugLog.category()`
3. [ ] Replace `console.warn()` with appropriate `debugWarn.category()`
4. [ ] Replace `console.error()` with appropriate `debugError.category()`
5. [ ] Choose appropriate category (api, components, hooks, images, business, auth, validation, newsletter)
6. [ ] Test that logs appear when category is enabled
7. [ ] Test that logs don't appear when category is disabled