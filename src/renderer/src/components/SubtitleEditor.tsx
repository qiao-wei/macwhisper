import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { ClockIcon, PlusIcon, TrashIcon, LanguageIcon } from '@heroicons/react/24/outline';

export interface SubtitleLine {
  id: string;
  startTime: string;
  endTime: string;
  text: string;
  translation?: string;
  isTranslating?: boolean;
}

export interface SubtitleEditorRef {
  setCurrentTime: (time: string) => void;
  handleAllTranslationsComplete: () => void;
}

interface SubtitleEditorProps {
  lines: SubtitleLine[];
  // showTranslation: boolean;
  onLineEdit?: (id: string, text: string, isTranslation?: boolean) => void;
  onTimeEdit?: (id: string, startTime: string, endTime: string) => void;
  onMergeLines?: (id1: string, id2: string) => void;
  onDeleteLine?: (id: string) => void;
  onInsertLine?: (id: string, position: 'before' | 'after') => void;
  onBatchDelete?: (ids: string[]) => void;
  onTranslateLine?: (id: string) => void;
  onTranslateAll?: () => void;
  onStopTranslate?: () => void;
  onSubtitleClick?: (subtitle: SubtitleLine) => void;
  onAllTranslationsComplete?: () => void;
}

// 格式化时间显示
const formatTimeDisplay = (time: string, fullMode: boolean) => {
  if (fullMode) {
    // 在全模式下显示完整格式
    return time;
  }
  // 在普通模式下简化显示
  const [hours, minutes, seconds] = time.split(':');
  if (hours === '00') {
    return `${minutes}:${seconds.split('.')[0]}`;
  }
  return `${hours}:${minutes}:${seconds.split('.')[0]}`;
};

// 格式化时间输入
const formatTimeInput = (time: string): string => {
  const parts = time.split(':');
  if (parts.length === 2) {
    return `00:${parts[0]}:${parts[1]}.000`;
  }
  return time;
};

const SubtitleEditor = forwardRef<SubtitleEditorRef, SubtitleEditorProps>(({
  lines,
  // showTranslation,
  onLineEdit,
  onTimeEdit,
  onMergeLines,
  onDeleteLine,
  onInsertLine,
  onBatchDelete,
  onTranslateLine,
  onTranslateAll,
  onStopTranslate,
  onSubtitleClick,
  onAllTranslationsComplete
}, ref) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [editingTimeType, setEditingTimeType] = useState<'start' | 'end' | null>(null);
  const [editingStartTime, setEditingStartTime] = useState("");
  const [editingEndTime, setEditingEndTime] = useState("");
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [isFullMode, setIsFullMode] = useState(false);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  // const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const [showTranslation, setShowTranslation] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  // const [currentTime, setCurrentTime] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [editingIndex, editingText]);

  useEffect(() => {
    if (textareaRef.current && editingIndex !== null) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      // 将光标移动到文本末尾
      textareaRef.current.selectionStart = textareaRef.current.value.length;
      textareaRef.current.selectionEnd = textareaRef.current.value.length;
      textareaRef.current.focus();
    }
  }, [editingIndex, editingText]);


  const handleClick = (index: number, line: SubtitleLine) => {
    // 如果正在编辑时间，不触发字幕编辑
    if (editingTimeType) return;
    if (editingIndex === index) return;

    // 触发字幕点击事件
    onSubtitleClick?.(line);

    setEditingIndex(index);
    setEditingText(showTranslation && line.translation ? line.translation : line.text);
  };

  const handleTextBlur = (index: number, text: string) => {
    const line = lines[index];
    if (showTranslation && line.translation) {
      if (text !== line.translation) {
        onLineEdit?.(line.id, text, true);
      }
    } else {
      if (text !== line.text) {
        onLineEdit?.(line.id, text, false);
      }
    }
    setEditingIndex(null);
  };

  const handleTimeBlur = (index: number, type: 'start' | 'end') => {
    const value = type === 'start' ? editingStartTime : editingEndTime;
    const formattedValue = formatTimeInput(value);
    const currentValue = type === 'start' ? lines[index].startTime : lines[index].endTime;

    if (formattedValue !== currentValue) {
      if (type === 'start') {
        onTimeEdit?.(lines[index].id, formattedValue, lines[index].endTime);
      } else {
        onTimeEdit?.(lines[index].id, lines[index].startTime, formattedValue);
      }
    }
    setEditingTimeType(null);
  };

  const handleSelectToggle = (index: number) => {
    if (selectedIndexes.includes(index)) {
      setSelectedIndexes(selectedIndexes.filter(i => i !== index));
    } else {
      setSelectedIndexes([...selectedIndexes, index]);
    }
  };

  const handleMerge = () => {
    if (selectedIndexes.length === 2) {
      // 检查选择的字幕是否连续
      const [index1, index2] = selectedIndexes.sort((a, b) => a - b);
      if (index2 - index1 === 1) {
        onMergeLines?.(lines[index1].id, lines[index2].id);
        setSelectedIndexes([]);
        // 合并后不需要设置编辑状态，因为合并的结果会根据showTranslation自动显示正确的文本
      } else {
        alert('合并字幕必须是连续的！');
      }
      setSelectedIndexes([]);
    }
  };

  const handleBatchDelete = () => {
    if (selectedIndexes.length > 0) {
      onBatchDelete?.(selectedIndexes.map(index => lines[index].id));
      setSelectedIndexes([]);
    }
  };

  const handleTimeClick = (index: number, type: 'start' | 'end', time: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isFullMode) return;

    setEditingIndex(index);
    setEditingTimeType(type);

    if (type === 'start') {
      setEditingStartTime(time);
    } else {
      setEditingEndTime(time);
    }
  };

  const handleTimeChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setEditingStartTime(value);
    } else {
      setEditingEndTime(value);
    }
  };

  const handleTimeKeyDown = (e: React.KeyboardEvent, index: number, type: 'start' | 'end') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTimeBlur(index, type);
    } else if (e.key === 'Escape') {
      setEditingTimeType(null);
      if (type === 'start') {
        setEditingStartTime(lines[index].startTime);
      } else {
        setEditingEndTime(lines[index].endTime);
      }
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditingText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' && e.shiftKey) {
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTextBlur(index, editingText);
    } else if (e.key === 'Escape') {
      setEditingIndex(null);
    }
  };

  const handleTranslateAll = () => {
    if (isTranslating) {
      setIsTranslating(false);
      onStopTranslate?.();
      setShowTranslation(false);
    } else {
      setIsTranslating(true);
      onTranslateAll?.();
      setShowTranslation(true);
    }
  };

  useImperativeHandle(ref, () => ({
    handleAllTranslationsComplete: () => {
      setIsTranslating(false);
      setShowTranslation(true);
      onAllTranslationsComplete?.();
    }
  }));

  return (
    // <div className="w-full max-w-4xl mx-auto font-sans">
    <div className="w-full max-w-4xl mx-auto font-sans h-full">
      {/* 顶部工具栏 */}
      {/* <div className="flex items-center gap-4 mb-4 p-2"> */}
      <div className="flex items-center gap-4 mb-4 p-2 sticky top-0 bg-white shadow-md z-10">
        <button
          onClick={() => {
            setIsSelectMode(!isSelectMode);
            if (!isSelectMode) {
              setSelectedIndexes([]);
              setIsFullMode(false);  // 进入选择模式时退出全模式
            }
          }}
          className={`px-3 py-1 rounded ${isSelectMode ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          {isSelectMode ? 'Exit Selection' : 'Select'}
        </button>
        <button
          onClick={() => {
            setIsFullMode(!isFullMode);
            if (!isFullMode) {
              setIsSelectMode(false);  // 进入全模式时退出选择模式
              setSelectedIndexes([]);
            }
          }}
          className={`px-3 py-1 rounded ${isFullMode ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          {isFullMode ? 'Exit Full Mode' : 'Full Mode'}
        </button>
        {(isSelectMode || isFullMode) && selectedIndexes.length > 0 && (
          <>
            {selectedIndexes.length === 2 && (
              <button
                onClick={handleMerge}
                className="px-3 py-1 rounded bg-blue-500 text-white"
              >
                Merge
              </button>
            )}
            <button
              onClick={handleBatchDelete}
              className="px-3 py-1 rounded bg-red-500 text-white"
            >
              Delete Selected ({selectedIndexes.length})
            </button>
          </>
        )}
        <button
          onClick={handleTranslateAll}
          className={`px-3 py-1 rounded transition-colors duration-200 active:scale-95 ${
            isTranslating 
              ? 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700'
              : 'bg-gray-200 text-gray-700 hover:bg-blue-500 hover:text-white active:bg-blue-600'
          }`}
        >
          {isTranslating ? 'Stop Translation' : 'Translate All'}
        </button>
        <button
          onClick={() => setShowTranslation(!showTranslation)}
          className={`px-3 py-1 rounded-lg transition-colors duration-200 flex items-center gap-2 ${showTranslation ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
        >
          {showTranslation ? 'Show Original' : 'Show Translation'}
        </button>
        <div className="flex-grow"></div>
      </div>

      {/* <div className="flex flex-col "> */}
      <div className="flex flex-col overflow-y-auto max-h-[calc(100%-56px)] custom-scrollbar margin-1">
        {/* 顶部插入按钮 */}
        {isFullMode && !isSelectMode && (
          <div className="flex items-center justify-center py-0 group">
            <div className="h-px w-full bg-gray-200 group-hover:bg-blue-200"></div>
            <button
              onClick={() => onInsertLine?.(lines[0].id, 'before')}
              className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 mx-2 p-1 text-gray-400 hover:text-blue-500 rounded-full hover:bg-gray-100"
              title="在开头插入字幕"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
            <div className="h-px w-full bg-gray-200 group-hover:bg-blue-200"></div>
          </div>
        )}

        {lines.map((line, index) => (
          <React.Fragment key={line.id}>
            <div
              className={`group flex items-start p-2 rounded-lg transition-all duration-300 transform ${editingIndex === index ? 'bg-[#E8E9F7]' : ''
                } ${selectedIndexes.includes(index) ? 'bg-blue-50' : ''} animate-fade-in relative`}
              onClick={() => {
                if (isSelectMode) {
                  handleSelectToggle(index);
                } else if (!editingTimeType) {
                  handleClick(index, line);
                }
              }}
            >
              {(isSelectMode || isFullMode) && (
                <div className="w-6 flex-shrink-0 flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selectedIndexes.includes(index)}
                    onChange={() => {
                      if (isSelectMode || isFullMode) {
                        handleSelectToggle(index);
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 mt-2"
                  />
                </div>
              )}
              <div className={`${isFullMode ? 'w-64' : 'w-20'} flex-shrink-0`}>
                <div
                  className={`pt-1 text-sm font-mono ${isFullMode
                    ? 'flex flex-col gap-2 cursor-pointer p-2 rounded-lg'
                    : 'text-gray-500'
                    }`}
                  style={{ paddingTop: '0.06rem' }}
                >
                  <div className="flex items-center gap-2 text-gray-600">
                    {isFullMode && <ClockIcon className="w-4 h-4 text-gray-400" />}
                    {editingTimeType === 'start' && editingIndex === index ? (
                      <input
                        type="text"
                        value={editingStartTime}
                        onChange={(e) => handleTimeChange('start', e.target.value)}
                        onBlur={() => handleTimeBlur(index, 'start')}
                        onKeyDown={(e) => handleTimeKeyDown(e, index, 'start')}
                        onClick={(e) => e.stopPropagation()}
                        className="w-32 px-2 py-1 text-sm bg-[#E8E9F7] focus:bg-white border border-transparent focus:border-blue-400 rounded focus:ring-1 focus:ring-blue-400"
                        placeholder="00:00:00.000"
                        autoFocus
                      />
                    ) : (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTimeClick(index, 'start', line.startTime, e);
                          // if (!isSelectMode && !isFullMode) {
                          handleClick(index, line);
                          // }
                        }}
                        className="w-32 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer"
                      >
                        {formatTimeDisplay(line.startTime, isFullMode)}
                      </div>
                    )}
                  </div>
                  {isFullMode && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <ClockIcon className="w-4 h-4 text-gray-400" />
                      {editingTimeType === 'end' && editingIndex === index ? (
                        <input
                          type="text"
                          value={editingEndTime}
                          onChange={(e) => handleTimeChange('end', e.target.value)}
                          onBlur={() => handleTimeBlur(index, 'end')}
                          onKeyDown={(e) => handleTimeKeyDown(e, index, 'end')}
                          onClick={(e) => e.stopPropagation()}
                          className="w-32 px-2 py-1 text-sm bg-[#E8E9F7] focus:bg-white border border-transparent focus:border-blue-400 rounded focus:ring-1 focus:ring-blue-400"
                          placeholder="00:00:00.000"
                          autoFocus
                        />
                      ) : (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTimeClick(index, 'end', line.endTime, e);
                            if (!isSelectMode && !isFullMode) {
                              handleClick(index, line);
                            }
                          }}
                          className="w-32 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer"
                        >
                          {formatTimeDisplay(line.endTime, isFullMode)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-grow relative">
                {editingIndex === index ? (
                  <textarea
                    ref={textareaRef}
                    value={editingText}
                    onChange={handleTextareaChange}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onBlur={() => handleTextBlur(index, editingText)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-0 py-0 text-lg bg-transparent border-none focus:ring-0 focus:outline-none resize-none overflow-hidden"
                    autoFocus
                    rows={editingText.split('\n').length}
                    style={{
                      minHeight: '1.5em',
                      height: 'auto'
                    }}
                  />
                ) : (
                  <div className="relative">
                    <div
                      className="text-lg whitespace-pre-wrap"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClick(index, line);
                      }}
                    >
                      {showTranslation && line.translation ? line.translation : line.text}
                    </div>
                  </div>
                )}
              </div>

              {!showTranslation && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTranslateLine?.(line.id);
                    setShowTranslation(true);
                  }}
                  className="absolute right-8 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 text-gray-400 hover:text-green-500 rounded-full hover:bg-gray-100"
                  title={line.translation ? "重新翻译" : "翻译此条"}
                >
                  <LanguageIcon className="w-5 h-5" />
                  {line.isTranslating && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteLine?.(line.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"
                title="删除"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>

            {/* 行间插入按钮 */}
            {isFullMode && !isSelectMode && (
              <div className="flex items-center justify-center py-0 group">
                <div className="h-px w-full bg-gray-200 group-hover:bg-blue-200"></div>
                <button
                  onClick={() => onInsertLine?.(line.id, 'after')}
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 mx-2 p-1 text-gray-400 hover:text-blue-500 rounded-full hover:bg-gray-100"
                  title="在此处插入字幕"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
                <div className="h-px w-full bg-gray-200 group-hover:bg-blue-200"></div>
              </div>
            )}
          </React.Fragment>
        ))}

      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
});

export default SubtitleEditor;
