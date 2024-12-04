import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SubtitleItemProps } from './types';

const formatDisplayTime = (time: string) => {
  const [hours, minutes, seconds] = time.split(':');
  return hours === '00' ? `${minutes}:${seconds.split('.')[0]}` : `${hours}:${minutes}:${seconds.split('.')[0]}`;
};

const SingleTimeInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
}> = ({ value, onChange, isEditing, setIsEditing }) => {
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

  return isEditing ? (
    <input
      ref={inputRef}
      type="text"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  ) : (
    <div
      onClick={() => setIsEditing(true)}
      className="cursor-pointer p-2 rounded transition-colors flex items-center justify-center hover:bg-blue-50"
    >
      <span className="text-base font-medium">{formatDisplayTime(value)}</span>
    </div>
  );
};

const TimeInput: React.FC<{ 
  startTime: string;
  endTime: string;
  onChangeStart: (value: string) => void;
  onChangeEnd: (value: string) => void;
  isContentEditing: boolean 
}> = ({ startTime, endTime, onChangeStart, onChangeEnd, isContentEditing }) => {
  const [isEditingStart, setIsEditingStart] = useState(false);
  const [isEditingEnd, setIsEditingEnd] = useState(false);

  if (isContentEditing) {
    return null;
  }

  return (
    <div className="flex flex-col space-y-2">
      <SingleTimeInput
        value={startTime}
        onChange={onChangeStart}
        isEditing={isEditingStart}
        setIsEditing={setIsEditingStart}
      />
      <SingleTimeInput
        value={endTime}
        onChange={onChangeEnd}
        isEditing={isEditingEnd}
        setIsEditing={setIsEditingEnd}
      />
    </div>
  );
};

const EditableText: React.FC<{ 
  value: string; 
  onChange: (value: string) => void; 
  onEditStateChange: (isEditing: boolean) => void;
  placeholder?: string;
  className?: string;
}> = ({ value, onChange, onEditStateChange, placeholder, className }) => {
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
      animate={{ height: isEditing ? 'auto' : 'auto' }}
      transition={{ duration: 0.3 }}
      className={`w-full inline-block ${className}`}
    >
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          rows={2}
          placeholder={placeholder}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y min-h-[60px] inline-block"
        />
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="cursor-pointer p-2 rounded transition-colors inline-block min-h-[40px] hover:bg-gray-200"
        >
          <div className="line-clamp-2 text-left">
            {value || <span className="text-gray-400">{placeholder}</span>}
          </div>
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
  onInsertAfter,
  onTranslateRequest
}) => {
  const [isContentEditing, setIsContentEditing] = useState(false);
  const [isTranslationEditing, setIsTranslationEditing] = useState(false);

  const handleUpdate = (field: keyof typeof subtitle, value: string) => {
    onUpdate(subtitle.id, field, value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start space-x-2 p-4 ${
        isSelected ? 'bg-blue-100' : 'hover:bg-gray-200'
      } transition-colors border-b border-gray-200`}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onSelect(subtitle.id)}
        className="form-checkbox h-5 w-5 text-blue-500 rounded mt-2 border-2 border-gray-300"
      />
      <div className="flex-1 flex items-start">
        <div className="w-[120px] flex-shrink-0">
          <TimeInput 
            startTime={subtitle.startTime} 
            endTime={subtitle.endTime} 
            onChangeStart={(value) => handleUpdate('startTime', value)}
            onChangeEnd={(value) => handleUpdate('endTime', value)}
            isContentEditing={isContentEditing} 
          />
        </div>
        <div className="flex-grow px-4 space-y-2">
          <EditableText 
            value={subtitle.content} 
            onChange={(value) => handleUpdate('content', value)} 
            onEditStateChange={setIsContentEditing}
            placeholder="Enter subtitle text"
          />
          <EditableText 
            value={subtitle.translation || ''} 
            onChange={(value) => handleUpdate('translation', value)} 
            onEditStateChange={setIsTranslationEditing}
            placeholder="Enter translation"
            className="text-sm text-gray-600 italic pl-2 border-l-2 border-gray-300 mt-1"
          />
        </div>
        <div className="w-[120px] flex-shrink-0 flex justify-end space-x-2">
          <button
            onClick={onInsertBefore}
            className="text-gray-500 hover:text-blue-500 transition-colors focus:outline-none p-1 rounded hover:bg-gray-200"
            title="Insert before"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={onInsertAfter}
            className="text-gray-500 hover:text-blue-500 transition-colors focus:outline-none p-1 rounded hover:bg-gray-200"
            title="Insert after"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={() => onTranslateRequest(subtitle.id, subtitle.content)}
            className="text-gray-500 hover:text-blue-500 transition-colors focus:outline-none p-1 rounded hover:bg-gray-200"
            title="Translate"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(subtitle.id)}
            className="text-gray-500 hover:text-red-600 transition-colors focus:outline-none p-1 rounded hover:bg-gray-200"
            title="Delete"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SubtitleItem;

