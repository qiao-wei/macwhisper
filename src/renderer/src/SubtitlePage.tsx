import { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
// import { PlusIcon } from '@heroicons/react/24/outline';
import SubtitleEditor, { SubtitleEditorRef } from './components/SubtitleEditor';
import { SubtitleLine } from './components/SubtitleEditor';


interface SubtitlePageProps {
  subtitleLines: SubtitleLine[];
  setSubtitleLines: React.Dispatch<React.SetStateAction<SubtitleLine[]>>;
}

function SubtitlePage({ subtitleLines, setSubtitleLines }: SubtitlePageProps) {
  // const [subtitleLines, setSubtitleLines] = useState<SubtitleLine[]>(initialTranscriptData);
  const editorRef = useRef<SubtitleEditorRef>(null);
  const translateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLineEdit = (id: string, newText: string, isTranslation: boolean = false) => {
    const newSubtitleLines = [...subtitleLines];
    const index = newSubtitleLines.findIndex(line => line.id === id);
    if (index !== -1) {
      newSubtitleLines[index] = {
        ...newSubtitleLines[index],
        ...(isTranslation ? { translation: newText } : { text: newText })
      };
    }
    setSubtitleLines(newSubtitleLines);
  };

  const handleTimeEdit = (id: string, startTime: string, endTime: string) => {
    const newSubtitleLines = [...subtitleLines];
    const index = newSubtitleLines.findIndex(line => line.id === id);
    if (index !== -1) {
      newSubtitleLines[index] = {
        ...newSubtitleLines[index],
        startTime,
        endTime
      };
    }
    setSubtitleLines(newSubtitleLines);
  };

  const handleMergeLines = (id1: string, id2: string) => {
    const newSubtitleLines = [...subtitleLines];
    let index1 = newSubtitleLines.findIndex(line => line.id === id1);
    let index2 = newSubtitleLines.findIndex(line => line.id === id2);
    if (index1 !== -1 && index2 !== -1) {
      if (index1 > index2) {
        [index1, index2] = [index2, index1];
      }

      const mergedLine = {
        id: uuidv4(),
        startTime: newSubtitleLines[index1].startTime,
        endTime: newSubtitleLines[index2].endTime,
        text: newSubtitleLines[index1].text + '\n' + newSubtitleLines[index2].text,
        translation: newSubtitleLines[index1].translation || newSubtitleLines[index2].translation
          ? (newSubtitleLines[index1].translation || '') + '\n' + (newSubtitleLines[index2].translation || '')
          : undefined
      };

      newSubtitleLines.splice(index1, 2, mergedLine);
      setSubtitleLines(newSubtitleLines);
    }
  };

  const handleDeleteLine = (id: string) => {
    const newSubtitleLines = [...subtitleLines];
    const index = newSubtitleLines.findIndex(line => line.id === id);
    if (index !== -1) {
      newSubtitleLines.splice(index, 1);
    }
    setSubtitleLines(newSubtitleLines);
  };

  const handleInsertLine = (id: string, position: 'before' | 'after') => {
    const newSubtitleLines = [...subtitleLines];
    const index = newSubtitleLines.findIndex(line => line.id === id);
    if (index !== -1) {
      const newIndex = position === 'before' ? index : index + 1;
      const prevLine = newSubtitleLines[Math.max(0, newIndex - 1)];
      const nextLine = newSubtitleLines[Math.min(newSubtitleLines.length - 1, newIndex)];

      let startTime = "00:00:00.000";
      let endTime = "00:00:05.000";

      if (prevLine && nextLine) {
        const prevEndTime = prevLine.endTime;
        const nextStartTime = nextLine.startTime;
        startTime = prevEndTime;
        endTime = nextStartTime;
      } else if (prevLine) {
        startTime = prevLine.endTime;
        endTime = calculateEndTime(startTime, "00:00:05.000");
      } else if (nextLine) {
        endTime = nextLine.startTime;
        startTime = calculateStartTime(endTime, "00:00:05.000");
      }

      const newLine = {
        id: uuidv4(),
        startTime,
        endTime,
        text: ""
      };

      newSubtitleLines.splice(newIndex, 0, newLine);
      setSubtitleLines(newSubtitleLines);
    }
  };

  const handleBatchDelete = (ids: string[]) => {
    const newSubtitleLines = subtitleLines.filter(line => !ids.includes(line.id));
    setSubtitleLines(newSubtitleLines);
  };

  const handleTranslateLine = (id: string) => {
    const newSubtitleLines = [...subtitleLines];
    const index = newSubtitleLines.findIndex(line => line.id === id);
    if (index !== -1) {
      newSubtitleLines[index] = {
        ...newSubtitleLines[index],
        isTranslating: true
      };
      setSubtitleLines(newSubtitleLines);

      // 模拟翻译延迟
      setTimeout(() => {
        const updatedData = [...newSubtitleLines];
        const lineIndex = updatedData.findIndex(line => line.id === id);
        if (lineIndex !== -1) {
          updatedData[lineIndex] = {
            ...updatedData[lineIndex],
            isTranslating: false,
            translation: `[翻译] ${updatedData[lineIndex].text}`
          };
          setSubtitleLines(updatedData);
        }
      }, 1000);
    }
  };

  const handleTranslateAll = () => {
    const translateLine = (lines: SubtitleLine[], currentIndex: number) => {
      if (currentIndex >= lines.length) {
        // 所有翻译完成时调用组件方法
        editorRef.current?.handleAllTranslationsComplete();
        return; // 所有行都已翻译完成
      }

      const newSubtitleLine = [...lines];
      newSubtitleLine[currentIndex] = {
        ...newSubtitleLine[currentIndex],
        isTranslating: true
      };
      setSubtitleLines(newSubtitleLine);

      translateTimeoutRef.current = setTimeout(() => {
        const updatedData = [...newSubtitleLine];
        updatedData[currentIndex] = {
          ...updatedData[currentIndex],
          isTranslating: false,
          translation: `[翻译] ${updatedData[currentIndex].text}`
        };
        setSubtitleLines(updatedData);

        translateLine(updatedData, currentIndex + 1);
      }, 500);
    };

    translateLine(subtitleLines, 0);
  };

  const handleStopTranslate = () => {
    if (translateTimeoutRef.current) {
      clearTimeout(translateTimeoutRef.current);
      translateTimeoutRef.current = null;

      const updatedData = subtitleLines.map(line => ({
        ...line,
        isTranslating: false
      }));
      setSubtitleLines(updatedData);
    }
  };

  return (
    <div>
      <div className='h-full'>
        <SubtitleEditor
          ref={editorRef}
          lines={subtitleLines}
          onLineEdit={handleLineEdit}
          onTimeEdit={handleTimeEdit}
          onMergeLines={handleMergeLines}
          onDeleteLine={handleDeleteLine}
          onInsertLine={handleInsertLine}
          onBatchDelete={handleBatchDelete}
          onTranslateLine={handleTranslateLine}
          onTranslateAll={handleTranslateAll}
          onStopTranslate={handleStopTranslate}
          onSubtitleClick={(subtitle) => { console.log(subtitle) }}
          onAllTranslationsComplete={() => {
            console.log('所有翻译已完成');
            // 这里可以添加其他翻译完成后的处理逻辑
          }}
        />
      </div>
    </div>
  )
}

function calculateEndTime(startTime: string, duration: string): string {
  return startTime;
}

function calculateStartTime(endTime: string, duration: string): string {
  return endTime;
}

export default SubtitlePage
