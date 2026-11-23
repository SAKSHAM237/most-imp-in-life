# Media Folder

Place your audio or video file here.

## Supported formats:
- **Video**: `.mp4`, `.webm`, `.mov`
- **Audio**: `.mp3`, `.wav`, `.ogg`, `.m4a`

## How to use:
1. Drop ONE file here (audio or video)
2. Import it in `src/mediaConfig.js`
3. Push to GitHub and deploy

## Example:
If you add `song.mp3`, update `src/mediaConfig.js`:
```js
import mediaFile from './media/song.mp3';
export const MEDIA_SRC = mediaFile;
export const MEDIA_TYPE = 'audio'; // 'audio' or 'video'
```
