import React, { useState, useCallback, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SubtitleItem from './SubtitleItem';
import { Subtitle } from './types';
import { formatTime, mergeSubtitles } from './utils';
import { v4 as uuidv4 } from 'uuid';

export interface SubtitleEditorHandle {
  addSubtitle: (subtitle: Omit<Subtitle, 'id'>) => void;
  updateSubtitle: (id: string, field: keyof Subtitle, value: string) => void;
  clearAllSubtitles: () => void;
  focusSubtitle: (id: string) => void;
  getAllSubtitles: () => Subtitle[];
  // translateAllSubtitles: () => void;
}

const SubtitleEditor = forwardRef<SubtitleEditorHandle>((props, ref) => {
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const subtitleRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (subtitles.length === 0) {
      return;
      const defaultSubtitle: Subtitle = {
        id: Date.now().toString(),
        startTime: '00:00:00.000',
        endTime: '00:00:05.000',
        content: 'Default subtitle'
      };
      setSubtitles([defaultSubtitle]);
    }
  }, []);

  const handleInsert = useCallback((index: number, position: 'before' | 'after') => {
    const newSubtitle: Subtitle = {
      id: uuidv4().toString(),
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
    console.log('handleUpdate:', id, field, value)
    // console.log(id,field,value)
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
      const newSubtitles = [
        ...prev.slice(0, firstSelectedIndex),
        mergedSubtitle,
        ...prev.slice(firstSelectedIndex + selectedIds.length)
      ].filter((sub) => !selectedIds.includes(sub.id) || sub.id === mergedSubtitle.id);
      return newSubtitles;
    });
    setSelectedIds([mergedSubtitle.id]);
  }, [subtitles, selectedIds]);

  const addSubtitle = useCallback((subtitle: Omit<Subtitle, 'id'>) => {
    const newSubtitle: Subtitle = {
      ...subtitle,
      id: uuidv4().toString(),
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

  const translateSubtitle = useCallback((id: string) => {
    // This is a mock translation function. In a real-world scenario, you would call an API here.
    setSubtitles((prev) =>
      prev.map((sub) =>
        sub.id === id
          ? { ...sub, translation: `Translated: ${sub.content}` }
          : sub
      )
    );
  }, []);

  const updateSubtitle = handleUpdate;

  // const translateAllSubtitles = useCallback(() => {
  //   setSubtitles((prev) =>
  //     prev.map((sub) => ({ ...sub, translation: `Translated: ${sub.content}` }))
  //   );
  // }, []);

  useImperativeHandle(ref, () => ({
    addSubtitle,
    updateSubtitle,
    clearAllSubtitles,
    focusSubtitle,
    getAllSubtitles,
    // translateAllSubtitles
  }));

  return (
    <div className="max-w-4xl mx-auto p-8">

      <div className="mb-6 flex justify-end space-x-4">
        <button
          onClick={handleMerge}
          disabled={selectedIds.length < 2}
          className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Merge Selected
        </button>
        {/* <button
          onClick={translateAllSubtitles}
          className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Translate All
        </button> */}
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
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
                onTranslate={() => translateSubtitle(subtitle.id)}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
});

export default SubtitleEditor;

