import { useState } from 'react';
import { CheckCircle, Clock, DollarSign, FileText, Wrench } from 'lucide-react';

interface RepairCompletionFormProps {
  onSubmit: (data: {
    repair_notes: string;
    repair_duration: number;
    parts_used: string[];
    final_price?: number;
  }) => void;
  loading?: boolean;
  quotedPrice?: number | null;
}

export default function RepairCompletionForm({ onSubmit, loading, quotedPrice }: RepairCompletionFormProps) {
  const [repairNotes, setRepairNotes] = useState('');
  const [duration, setDuration] = useState('60');
  const [partsInput, setPartsInput] = useState('');
  const [finalPrice, setFinalPrice] = useState(quotedPrice != null ? String(quotedPrice) : '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parts = partsInput
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    onSubmit({
      repair_notes: repairNotes,
      repair_duration: parseInt(duration) || 60,
      parts_used: parts,
      ...(finalPrice.trim() ? { final_price: parseFloat(finalPrice) } : {}),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Repair Notes */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
          <FileText className="h-4 w-4" />
          Repair Notes *
        </label>
        <textarea
          value={repairNotes}
          onChange={(e) => setRepairNotes(e.target.value)}
          rows={3}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
          placeholder="Describe the repair work performed..."
        />
      </div>

      {/* Duration */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
          <Clock className="h-4 w-4" />
          Duration (minutes)
        </label>
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          min="1"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
          placeholder="60"
        />
      </div>

      {/* Parts Used */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
          <Wrench className="h-4 w-4" />
          Parts Used (one per line)
        </label>
        <textarea
          value={partsInput}
          onChange={(e) => setPartsInput(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
          placeholder="OEM Screen Assembly&#10;Adhesive Kit"
        />
      </div>

      {/* Final Price */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
          <DollarSign className="h-4 w-4" />
          Final Price ($)
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={finalPrice}
          onChange={(e) => setFinalPrice(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
          placeholder={quotedPrice != null ? `Quoted: $${quotedPrice}` : 'Enter final price'}
        />
        {quotedPrice != null && (
          <p className="text-xs text-gray-500 mt-1">Quoted price: ${quotedPrice.toFixed(2)}</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !repairNotes.trim()}
        className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <CheckCircle className="h-5 w-5" />
        {loading ? 'Completing...' : 'Complete Repair'}
      </button>
    </form>
  );
}
