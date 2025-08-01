# Local Profile Icons System

This project now uses local profile icons instead of external ddragon links for better performance and reliability.

## 📁 File Structure

```
public/
├── profile-icons/
│   ├── 1.png
│   ├── 2.png
│   ├── ...
│   └── 29.png
```

## 🚀 Benefits

- **Faster Loading**: No external API calls for profile icons
- **Better Reliability**: No dependency on external services
- **Improved Performance**: Local assets load instantly
- **Reduced Bandwidth**: No repeated downloads of the same icons

## 🔧 How It Works

### Profile Icon Utility (`lib/profileIcons.ts`)

The utility provides three main functions:

1. **`getProfileIconSrc(profileIconId)`**: Returns the appropriate source path
   - Local path if icon exists locally
   - External URL as fallback

2. **`isLocalIcon(profileIconId)`**: Checks if an icon is available locally

3. **`getDefaultProfileIcon()`**: Returns the default icon path

### Current Local Icons

Icons 1-29 are currently stored locally. The system will:
- Use local icons when available
- Fall back to external ddragon URLs for missing icons
- Automatically optimize local icons with Next.js Image component

## 📥 Adding More Icons

### Download Additional Icons

```bash
# Download icons 30-100
node downloadMoreIcons.js

# Download specific range (modify the script)
# Edit START_ICON_ID and END_ICON_ID in downloadMoreIcons.js
```

### Update the Utility

After downloading new icons, update `lib/profileIcons.ts`:

```typescript
const LOCAL_ICONS = new Set([
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 
  21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40
  // Add new icon IDs here
]);
```

## 🔄 Migration from External Icons

The system automatically handles the transition:
- Existing players with local icons will load faster
- Players with missing icons will fall back to external URLs
- No data migration required

## 📊 Performance Impact

- **Local Icons**: ~15-100KB each, load instantly
- **External Icons**: ~30-100KB each, require network request
- **Fallback**: Seamless transition for missing icons

## 🛠️ Maintenance

### Adding New Icons

1. Run the download script for new icon ranges
2. Update the `LOCAL_ICONS` set in the utility
3. Test with the development server

### Monitoring Usage

The system logs which icons are being used:
- Local icons: No network requests
- External icons: Will show in network tab

## 🔍 Troubleshooting

### Icon Not Loading
- Check if the icon ID is in the `LOCAL_ICONS` set
- Verify the file exists in `public/profile-icons/`
- Check browser console for 404 errors

### Performance Issues
- Ensure local icons are being used (check network tab)
- Verify Next.js Image optimization is working
- Monitor bundle size for large icon collections 