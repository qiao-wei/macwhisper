export interface Subtitle {
    id: string;
    startTime: string;
    endTime: string;
    content: string;
  }
  
  export interface SubtitleItemProps {
    subtitle: Subtitle;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onUpdate: (id: string, field: keyof Subtitle, value: string) => void;
    onDelete: (id: string) => void;
  }
  
  