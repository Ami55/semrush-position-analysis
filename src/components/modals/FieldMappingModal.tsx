import React, { useState } from 'react';
import { FieldMapping } from '../../types';
import { DEFAULT_FIELD_MAPPING } from '../../utils/fileParser';
import { Check, Settings2, X } from 'lucide-react';

interface FieldMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMapping: FieldMapping;
  onSaveMapping: (newMapping: FieldMapping) => void;
}

export const FieldMappingModal: React.FC<FieldMappingModalProps> = ({
  isOpen,
  onClose,
  currentMapping,
  onSaveMapping,
}) => {
  const [mapping, setMapping] = useState<FieldMapping>(currentMapping);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveMapping(mapping);
    onClose();
  };

  const handleReset = () => {
    setMapping(DEFAULT_FIELD_MAPPING);
  };

  const fields = [
    { key: 'keyword', label: 'Keyword Column Name' },
    { key: 'currentPosition', label: 'Current Position Column Name' },
    { key: 'previousPosition', label: 'Previous Position Column Name' },
    { key: 'searchVolume', label: 'Search Volume Column Name' },
    { key: 'rankingUrl', label: 'Landing Page / Ranking URL Column' },
    { key: 'intent', label: 'Search Intent Column Name' },
    { key: 'tags', label: 'Tags / Keyword Groups Column' },
    { key: 'tripadvisorPosition', label: 'Tripadvisor Position Column' },
    { key: 'viatorPosition', label: 'Viator Position Column' },
    { key: 'getyourguidePosition', label: 'GetYourGuide Position Column' },
    { key: 'estimatedTraffic', label: 'Estimated Traffic Column' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 bg-[#002B49] px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <Settings2 className="h-5 w-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold">Inspect &amp; Configure Field Mappings</h3>
              <p className="text-[11px] text-slate-300">Custom header translation rules for SEMrush exports</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-6 space-y-3.5 text-xs">
          {fields.map((f) => (
            <div key={f.key} className="flex items-center justify-between gap-4">
              <label className="font-medium text-slate-700 w-1/2">{f.label}:</label>
              <input
                type="text"
                value={(mapping as any)[f.key] || ''}
                onChange={(e) => setMapping({ ...mapping, [f.key]: e.target.value })}
                className="w-1/2 rounded-lg border border-slate-200 bg-slate-50 p-2 font-mono text-xs text-slate-900 focus:bg-white focus:border-[#008768] outline-none"
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            Reset to Standard Defaults
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#008768] px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#007055]"
            >
              <Check className="h-4 w-4" />
              Save Mapping Rules
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
