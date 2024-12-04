export interface Subtitle {
  id: string;
  startTime: string;
  endTime: string;
  content: string;
  translation?: string;
}

export interface SubtitleItemProps {
  subtitle: Subtitle;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, field: keyof Subtitle, value: string) => void;
  onDelete: (id: string) => void;
  onInsertBefore: () => void;
  onInsertAfter: () => void;
  onTranslateRequest: (id: string, content: string) => void;
}

export interface SubtitleEditorProps {
  onTranslateAll: () => void;
  onTranslateSubtitle: (id: string, content: string) => void;
}

