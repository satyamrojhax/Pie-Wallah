import { safeFetch } from '../lib/apiConfig';

const VIDEO_API_BASE = "https://piewallahapi.vercel.app/api";

export type VideoResponse = {
  success: boolean;
  data: {
    url: string;
    signedUrl: string;
    urlType: string;
    scheduleInfo: {
      startTime: string;
      endTime: string;
    };
    videoContainer: string;
    isCmaf: boolean;
    serverTime: number;
    cdnType: string;
  };
  stream_url: string;
  url_type: string;
  drm?: {
    kid: string;
    key: string;
  };
};

export const fetchVideoUrl = async (
  batchId: string,
  subjectId: string,
  childId: string
): Promise<VideoResponse> => {
  try {
    const url = `${VIDEO_API_BASE}/video?batchId=${batchId}&subjectId=${subjectId}&childId=${childId}`;
    
    const response = await safeFetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch video URL: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error('Video API returned unsuccessful response');
    }
    
    return data as VideoResponse;
  } catch (error) {
    throw new Error(`Error fetching video: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getVideoStreamUrl = async (
  batchId: string,
  subjectId: string,
  childId: string
): Promise<string> => {
  const videoData = await fetchVideoUrl(batchId, subjectId, childId);
  return videoData.stream_url;
};

export const getVideoData = async (
  batchId: string,
  subjectId: string,
  childId: string
): Promise<{
  stream_url: string;
  drm?: {
    kid: string;
    key: string;
  };
  cdnType?: string;
  urlType?: string;
}> => {
  const videoData = await fetchVideoUrl(batchId, subjectId, childId);
  
  return {
    stream_url: videoData.stream_url,
    drm: videoData.drm ? {
      kid: videoData.drm.kid,
      key: videoData.drm.key
    } : undefined,
    cdnType: videoData.data?.cdnType,
    urlType: videoData.url_type
  };
};

