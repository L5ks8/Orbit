import React, { useState, useRef, useEffect } from 'react';

export default function CustomSelect({ options, value, onChange, placeholder = 'Select...', isMulti = false, name }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [dropUp, setDropUp] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // If less than 250px below, but enough space above, flip it up.
      if (spaceBelow < 250 && rect.top > 250) {
        setDropUp(true);
      } else {
        setDropUp(false);
      }
    } else {
      setDropUp(false);
    }
  }, [isOpen]);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (val) => {
    if (isMulti) {
      const currentValues = Array.isArray(value) ? value.map(String) : [];
      if (currentValues.includes(String(val))) {
        onChange(currentValues.filter(v => v !== String(val)));
      } else {
        if (currentValues.length < 25) {
          onChange([...currentValues, String(val)]);
        }
      }
    } else {
      onChange(String(val));
      setIsOpen(false);
      setSearch('');
    }
  };

  const handleRemove = (e, valToRemove) => {
    e.stopPropagation();
    if (isMulti && Array.isArray(value)) {
      onChange(value.map(String).filter(v => v !== String(valToRemove)));
    }
  };

  const renderTriggerContent = () => {
    if (isMulti) {
      const currentValues = Array.isArray(value) ? value.map(String) : [];
      if (currentValues.length === 0) return <span className="content placeholder">{placeholder}</span>;
      
      return (
        <div className="dash-multiselect-tags">
          {currentValues.map(val => {
            const opt = options.find(o => String(o.value) === val);
            if (!opt) return null;
            return (
              <span key={val} className="dash-multiselect-tag">
                {opt.color && <span className="color-dot" style={{ backgroundColor: opt.color }}></span>}
                {opt.label}
                <svg onClick={(e) => handleRemove(e, val)} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </span>
            );
          })}
        </div>
      );
    } else {
      const selectedOption = options.find(opt => String(opt.value) === String(value));
      if (!selectedOption) return <span className="content placeholder">{placeholder}</span>;
      return (
        <span className="content">
          {selectedOption.color && <span className="color-dot" style={{ backgroundColor: selectedOption.color, marginRight: '6px' }}></span>}
          {selectedOption.label}
        </span>
      );
    }
  };

  return (
    <div className={`dash-custom-select ${isOpen ? 'open' : ''} ${dropUp ? 'drop-up' : ''} ${isMulti ? 'is-multi' : ''}`} ref={containerRef}>
      {name && (
        <input 
          type="hidden" 
          name={name} 
          value={isMulti ? (Array.isArray(value) ? value.join(',') : '') : (value || '')} 
        />
      )}
      <div 
        className="dash-custom-select-trigger" 
        onClick={() => setIsOpen(!isOpen)}
      >
        {renderTriggerContent()}
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      <div className="dash-custom-select-dropdown">
        <div className="dash-custom-select-search">
          <input 
            type="text" 
            placeholder="Search..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            autoFocus={isOpen}
          />
        </div>
        <div className="dash-custom-select-options">
          {filteredOptions.length > 0 ? (
            filteredOptions.map(opt => {
              const isSelected = isMulti 
                ? (Array.isArray(value) && value.map(String).includes(String(opt.value)))
                : String(value) === String(opt.value);

              return (
                <div 
                  key={opt.value} 
                  className={`dash-custom-select-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(opt.value)}
                >
                  {opt.color && <span className="color-dot" style={{ backgroundColor: opt.color, marginRight: '8px' }}></span>}
                  {opt.label}
                  {isSelected && (
                    <svg style={{ marginLeft: 'auto' }} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  )}
                </div>
              );
            })
          ) : (
            <div className="dash-custom-select-empty">No results found</div>
          )}
        </div>
      </div>
    </div>
  );
}
