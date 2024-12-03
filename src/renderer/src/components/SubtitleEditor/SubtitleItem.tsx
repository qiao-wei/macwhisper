import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SubtitleItemProps } from './types';

const TimeInput: React.FC<{ value: string; onChange: (value: string) => void; isContentEditing: boolean }> = ({ value, onChange, isContentEditing }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    onChange(localValue);
  };

  if (isContentEditing) {
    return null;
  }

  function formatTime(time) {
    // 假设时间格式为 "HH:MM:SS.SSS"
    let [hours, minutes, seconds] = time.split(":");
    let [sec, milli] = seconds.split(".");

    // 处理小时：如果小时是 "00"，则不显示小时
    let result = `${parseInt(hours) === 0 ? "" : hours}:${minutes}:${sec}`;

    // 去除多余的 ":" 号
    return result.replace(/^:/, "");
  }

  return isEditing ? (
    <input
      ref={inputRef}
      type="text"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      className="w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  ) : (
    <div
      onClick={() => setIsEditing(true)}
      className="cursor-pointer rounded transition-colors flex items-center justify-center h-full hover:bg-blue-50"
    >
      {formatTime(value)}
    </div>
  );
};

const ContentInput: React.FC<{ value: string; onChange: (value: string) => void; onEditStateChange: (isEditing: boolean) => void }> = ({ value, onChange, onEditStateChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
    onEditStateChange(isEditing);
  }, [isEditing, onEditStateChange]);

  const handleBlur = () => {
    setIsEditing(false);
    onChange(localValue);
  };

  return (
    <motion.div
      animate={{ height: isEditing ? 'auto' : '40px' }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          rows={2}
          className="w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y min-h-[60px]"
        />
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="cursor-pointer rounded transition-colors min-h-[40px] overflow-hidden flex items-center justify-start hover:bg-blue-50"
        >
          <div className="line-clamp-2">{value}</div>
        </div>
      )}
    </motion.div>
  );
};

const SubtitleItem: React.FC<SubtitleItemProps> = ({
  subtitle,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onInsertBefore,
  onInsertAfter
}) => {
  const [isContentEditing, setIsContentEditing] = useState(false);

  const handleUpdate = (field: keyof typeof subtitle, value: string) => {
    onUpdate(subtitle.id, field, value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`flex items-center space-x-4 p-4 ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
        } transition-colors`}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onSelect(subtitle.id)}
        className="form-checkbox h-5 w-5 text-blue-600 rounded-full"
      />
      {/* <div className={`flex-1 grid ${isContentEditing ? 'grid-cols-1' : 'grid-cols-3'} gap-4 items-center`}>
        <TimeInput value={subtitle.startTime} onChange={(value) => handleUpdate('startTime', value)} isContentEditing={isContentEditing} />
        <TimeInput value={subtitle.endTime} onChange={(value) => handleUpdate('endTime', value)} isContentEditing={isContentEditing} />
        <ContentInput
          value={subtitle.content}
          onChange={(value) => handleUpdate('content', value)}
          onEditStateChange={setIsContentEditing}
        />
      </div> */}
      <div className={`flex-1 grid ${isContentEditing ? 'grid-cols-1' : 'grid-cols-3'} gap-4 items-center`}>
        <div className="flex flex-col w-[120px]">
          <TimeInput
            value={subtitle.startTime}
            onChange={(value) => handleUpdate('startTime', value)}
            isContentEditing={isContentEditing}
          />
          <TimeInput
            value={subtitle.endTime}
            onChange={(value) => handleUpdate('endTime', value)}
            isContentEditing={isContentEditing}
          />
        </div>

        <div className="flex-grow text-left">
          <ContentInput
            value={subtitle.content}
            onChange={(value) => handleUpdate('content', value)}
            onEditStateChange={setIsContentEditing}
          />
        </div>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={onInsertBefore}
          className="text-gray-400 hover:text-blue-600 transition-colors focus:outline-none p-1 rounded-full hover:bg-gray-100"
          title="Insert before"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          onClick={onInsertAfter}
          className="text-gray-400 hover:text-blue-600 transition-colors focus:outline-none p-1 rounded-full hover:bg-gray-100"
          title="Insert after"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(subtitle.id)}
          className="text-gray-400 hover:text-red-600 transition-colors focus:outline-none p-1 rounded-full hover:bg-gray-100"
          title="Delete"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
};

export default SubtitleItem;

