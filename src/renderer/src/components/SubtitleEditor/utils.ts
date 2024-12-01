import { Subtitle } from './types';

export const formatTime = (time: string): string => {
  // Ensure the time is in the correct format
  const [hours, minutes, seconds] = time.split(':');
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(6, '0')}`;
};

export const mergeSubtitles = (subtitles: Subtitle[]): Subtitle => {
  const startTime = subtitles[0].startTime;
  const endTime = subtitles[subtitles.length - 1].endTime;
  const content = subtitles.map(s => s.content).join(' ');
  return {
    id: subtitles[0].id,
    startTime,
    endTime,
    content
  };
};

