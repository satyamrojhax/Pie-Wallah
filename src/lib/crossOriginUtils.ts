// Utility functions for handling cross-origin video playback

export function addCrossOriginAttributes(videoElement: HTMLVideoElement): void {
    videoElement.crossOrigin = 'anonymous';
    videoElement.setAttribute('crossorigin', 'anonymous');
}

export function handleCrossOriginError(error: Error, url: string): void {
    console.error('Cross-origin error detected:', error.message);
    console.log('URL that failed:', url);
    
    // Check if it's a cross-origin error
    if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
        console.warn('This appears to be a CORS issue. The video server may need to allow cross-origin requests.');
    }
}

export function createCrossOriginVideoUrl(url: string): string {
    try {
        const urlObj = new URL(url, window.location.href);
        
        // Add timestamp to prevent caching issues
        const timestamp = Date.now();
        const separator = urlObj.search ? '&' : '?';
        urlObj.search += `${separator}_t=${timestamp}`;
        
        return urlObj.toString();
    } catch (error) {
        console.warn('Failed to create cross-origin URL:', error);
        return url;
    }
}
