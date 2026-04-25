import React, { useState, useRef, useEffect } from 'react';

interface FilterDropdownProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ label, options, selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggle = (value: string) =>
    onChange(selected.includes(value)
      ? selected.filter(v => v !== value)
      : [...selected, value]
    );

  const displayLabel = selected.length > 0 ? `${label} (${selected.length})` : label;

  return (
    <div ref={ref} style={{ position: 'relative', marginBottom: 12 }}>
      <button
        className="filter-trigger"
        onClick={() => setIsOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 4px',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          cursor: 'pointer',
          fontSize: 17,
          fontFamily: 'inherit',
          direction: 'rtl',
        }}
      >
        <span style={{ fontWeight: selected.length > 0 ? 600 : 400 }}>{displayLabel}</span>
        <span
          style={{
            transition: 'transform 0.25s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            display: 'inline-block',
            fontSize: 12,
            marginRight: 4,
          }}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            left: 0,
            zIndex: 200,
            background: 'white',
            border: 'none',
            maxHeight: 280,
            overflowY: 'auto',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 8,
              padding: '8px 12px',
              borderBottom: '1px solid #e0e0e0',
              position: 'sticky',
              top: 0,
              background: 'white',
            }}
          >
            <button
              onClick={() => onChange([...options])}
              style={{
                flex: 1,
                padding: '5px 8px',
                background: '#000',
                color: '#fff',
                border: 'none',
                borderRadius: 20,
                cursor: 'pointer',
                fontSize: 15,
                fontFamily: 'inherit',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              בחר הכל
            </button>
            <button
              onClick={() => onChange([])}
              style={{
                flex: 1,
                padding: '5px 8px',
                background: 'transparent',
                color: '#000',
                border: '1.5px solid #000',
                borderRadius: 20,
                cursor: 'pointer',
                fontSize: 15,
                fontFamily: 'inherit',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f0f0f0')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              הסר הכל
            </button>
          </div>

          {options.map(opt => (
            <label
              key={opt}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 16px',
                cursor: 'pointer',
                borderBottom: '1px solid #f0f0f0',
                direction: 'rtl',
                fontSize: 16,
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
                style={{ accentColor: '#000', width: 16, height: 16, cursor: 'pointer', flexShrink: 0 }}
              />
              {opt}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
