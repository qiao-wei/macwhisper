import React, { useState, useCallback, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SubtitleItem from './SubtitleItem';
import { Subtitle, SubtitleEditorProps } from './types';
import { formatTime, mergeSubtitles, generateId } from './utils';

export interface SubtitleEditorHandle {
  addSubtitle: (subtitle: Omit<Subtitle, 'id'>) => void;
  updateSubtitle: (id: string, field: keyof Subtitle, value: string) => void;
  clearAllSubtitles: () => void;
  focusSubtitle: (id: string) => void;
  getAllSubtitles: () => Subtitle[];
  translateAllSubtitles: () => void;
}

const SubtitleEditor = forwardRef<SubtitleEditorHandle, SubtitleEditorProps>((props, ref) => {
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const subtitleRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (subtitles.length === 0) {
      const defaultSubtitle: Subtitle = {
        id: generateId(),
        startTime: '00:00:00.000',
        endTime: '00:00:05.000',
        content: 'Default subtitle'
      };
      setSubtitles([defaultSubtitle]);
    }
  }, []);

  const handleInsert = useCallback((index: number, position: 'before' | 'after') => {
    const newSubtitle: Subtitle = {
      id: generateId(),
      startTime: '00:00:00.000',
      endTime: '00:00:05.000',
      content: 'New subtitle'
    };
    setSubtitles((prev) => {
      const newSubtitles = [...prev];
      newSubtitles.splice(position === 'before' ? index : index + 1, 0, newSubtitle);
      return newSubtitles;
    });
  }, []);

  const handleUpdate = useCallback((id: string, field: keyof Subtitle, value: string) => {
    setSubtitles((prev) =>
      prev.map((sub) =>
        sub.id === id
          ? { ...sub, [field]: field.includes('Time') ? formatTime(value) : value }
          : sub
      )
    );
  }, []);

  const handleDelete = useCallback((id: string) => {
    setSubtitles((prev) => {
      if (prev.length === 1) {
        return prev;
      }
      return prev.filter((sub) => sub.id !== id);
    });
    setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
  }, []);

  const handleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    );
  }, []);

  const handleMerge = useCallback(() => {
    if (selectedIds.length < 2) return;

    const selectedSubtitles = subtitles.filter((sub) => selectedIds.includes(sub.id));
    const mergedSubtitle = mergeSubtitles(selectedSubtitles);
    const firstSelectedIndex = subtitles.findIndex((sub) => sub.id === selectedIds[0]);

    setSubtitles((prev) => {
      const newSubtitles = prev.filter((sub) => !selectedIds.includes(sub.id));
      newSubtitles.splice(firstSelectedIndex, 0, mergedSubtitle);
      return newSubtitles;
    });
    setSelectedIds([mergedSubtitle.id]);
  }, [subtitles, selectedIds]);

  const addSubtitle = useCallback((subtitle: Omit<Subtitle, 'id'>) => {
    const newSubtitle: Subtitle = {
      ...subtitle,
      id: generateId(),
    };
    setSubtitles((prev) => [...prev, newSubtitle]);
  }, []);

  const clearAllSubtitles = useCallback(() => {
    setSubtitles([]);
    setSelectedIds([]);
  }, []);

  const focusSubtitle = useCallback((id: string) => {
    const subtitleElement = subtitleRefs.current[id];
    if (subtitleElement) {
      subtitleElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const getAllSubtitles = useCallback(() => {
    return subtitles;
  }, [subtitles]);

  const updateSubtitle = handleUpdate;

  useImperativeHandle(ref, () => ({
    addSubtitle,
    updateSubtitle,
    clearAllSubtitles,
    focusSubtitle,
    getAllSubtitles,
    translateAllSubtitles: () => {} // Placeholder to avoid error. Functionality removed.
  }));

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white">
      <div className="mb-6 flex justify-between items-center border-b pb-4">
        <div className="text-sm text-gray-500">
          {selectedIds.length > 0 ? `${selectedIds.length} items selected` : 'No items selected'}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={props.onTranslateAll}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2h-1.586l3.293 3.293a1 1 0 01-1.414 1.414L8 7.414V11a1 1 0 11-2 0V3a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Translate All
          </button>
          <button
            onClick={handleMerge}
            disabled={selectedIds.length < 2}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
            Merge Selected
          </button>
          <button
            onClick={() => selectedIds.length > 0 && selectedIds.forEach(handleDelete)}
            disabled={selectedIds.length === 0}
            className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Delete Selected
          </button>
        </div>
      </div>
      <div className="bg-gray-100 rounded-lg overflow-hidden">
        <AnimatePresence>
          {subtitles.map((subtitle, index) => (
            <div key={subtitle.id} ref={(el) => (subtitleRefs.current[subtitle.id] = el)}>
              <SubtitleItem
                subtitle={subtitle}
                isSelected={selectedIds.includes(subtitle.id)}
                onSelect={handleSelect}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onInsertBefore={() => handleInsert(index, 'before')}
                onInsertAfter={() => handleInsert(index, 'after')}
                onTranslateRequest={(id, content) => props.onTranslateSubtitle(id, content)}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
});

export default SubtitleEditor;

