import React, { useEffect, useRef } from 'react';

/**
 * Headless AutoSaver component.
 * Replaces the old floating SaveBar across the entire website.
 * Automatically saves changes when `show` (isDirty) is true after a debounce.
 * The visible bottom save bar is completely removed from the UI.
 */
export default function SaveBar({ show, onReset, onSave, saving, debounceMs = 700 }) {
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  const showRef = useRef(show);
  showRef.current = show;

  const savingRef = useRef(saving);
  savingRef.current = saving;

  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (show && !saving) {
      timerRef.current = setTimeout(() => {
        if (onSaveRef.current) {
          onSaveRef.current();
        }
      }, debounceMs);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [show, saving, debounceMs]);

  // Flush unsaved changes immediately on unmount or page exit
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (showRef.current && !savingRef.current) {
        onSaveRef.current?.();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (timerRef.current && showRef.current && !savingRef.current) {
        clearTimeout(timerRef.current);
        onSaveRef.current?.();
      }
    };
  }, []);

  // Return null: Floating save bar is completely removed from the UI
  return null;
}
