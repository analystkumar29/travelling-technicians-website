import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { authFetch } from '@/utils/auth';
import { toast } from 'sonner';
import {
  Settings,
  Building2,
  CalendarClock,
  DollarSign,
  Bell,
  Clock,
  Save,
  X,
  Pencil,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface SiteSetting {
  id: string;
  key: string;
  value: string;
  description: string | null;
  created_at: string;
}

type SettingType = 'boolean' | 'json' | 'number' | 'text';

/* -------------------------------------------------------------------------- */
/*  Section definitions                                                        */
/* -------------------------------------------------------------------------- */

interface SectionDef {
  title: string;
  icon: React.ElementType;
  keys: string[];
}

const SECTIONS: SectionDef[] = [
  {
    title: 'Business Info',
    icon: Building2,
    keys: [
      'business_name',
      'business_phone',
      'business_email',
      'whatsapp_business_number'
    ]
  },
  {
    title: 'Booking Settings',
    icon: CalendarClock,
    keys: [
      'booking_slot_duration',
      'booking_time_slots_weekday',
      'booking_time_slots_weekend',
      'same_day_cutoff_time'
    ]
  },
  {
    title: 'Financial',
    icon: DollarSign,
    keys: [
      'tax_rate',
      'base_travel_fee',
      'emergency_surcharge',
      'currency',
      'warranty_days'
    ]
  },
  {
    title: 'Notifications',
    icon: Bell,
    keys: ['email_enabled', 'sms_enabled', 'admin_notification_email']
  },
  {
    title: 'Business Hours',
    icon: Clock,
    keys: ['business_hours']
  }
];

const BOOLEAN_KEYS = new Set(['email_enabled', 'sms_enabled']);

const JSON_KEYS = new Set([
  'booking_time_slots_weekday',
  'booking_time_slots_weekend',
  'business_hours'
]);

const NUMERIC_KEYS = new Set([
  'tax_rate',
  'base_travel_fee',
  'emergency_surcharge',
  'booking_slot_duration',
  'warranty_days'
]);

function getSettingType(key: string): SettingType {
  if (BOOLEAN_KEYS.has(key)) return 'boolean';
  if (JSON_KEYS.has(key)) return 'json';
  if (NUMERIC_KEYS.has(key)) return 'number';
  return 'text';
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatJsonPreview(value: string): string {
  try {
    const parsed = JSON.parse(value);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return value;
  }
}

function formatDisplayValue(value: string, type: SettingType): string {
  if (type === 'boolean') return value === 'true' ? 'Enabled' : 'Disabled';
  if (type === 'json') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.join(', ');
      return JSON.stringify(parsed, null, 2);
    } catch {
      return value;
    }
  }
  return value;
}

/* -------------------------------------------------------------------------- */
/*  Toggle switch component                                                    */
/* -------------------------------------------------------------------------- */

function ToggleSwitch({
  enabled,
  onChange,
  disabled
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
        enabled ? 'bg-primary-800' : 'bg-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Setting row component                                                      */
/* -------------------------------------------------------------------------- */

function SettingRow({
  setting,
  onSave
}: {
  setting: SiteSetting;
  onSave: (key: string, value: string) => Promise<void>;
}) {
  const type = getSettingType(setting.key);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(setting.value);
  const [saving, setSaving] = useState(false);

  // Sync draft when setting changes externally
  useEffect(() => {
    setDraft(setting.value);
  }, [setting.value]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(setting.key, draft);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(setting.value);
    setEditing(false);
  };

  const handleToggle = async (newValue: boolean) => {
    setSaving(true);
    try {
      await onSave(setting.key, String(newValue));
    } finally {
      setSaving(false);
    }
  };

  /* --- Boolean toggle --- */
  if (type === 'boolean') {
    return (
      <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-sm font-medium text-gray-900">
            {setting.description || setting.key}
          </p>
          <p className="text-xs text-gray-400 font-mono mt-0.5">
            {setting.key}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {setting.value === 'true' ? 'Enabled' : 'Disabled'}
          </span>
          <ToggleSwitch
            enabled={setting.value === 'true'}
            onChange={handleToggle}
            disabled={saving}
          />
        </div>
      </div>
    );
  }

  /* --- JSON textarea --- */
  if (type === 'json') {
    return (
      <div className="py-4 border-b border-gray-100 last:border-b-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-sm font-medium text-gray-900">
              {setting.description || setting.key}
            </p>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              {setting.key}
            </p>
          </div>
          {!editing && (
            <button
              onClick={() => {
                setDraft(formatJsonPreview(setting.value));
                setEditing(true);
              }}
              className="p-1.5 text-gray-400 hover:text-primary-700 hover:bg-gray-100 rounded-md transition-colors flex-shrink-0"
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
        </div>

        {editing ? (
          <div className="mt-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={6}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary-800 text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Save
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <pre className="mt-2 p-3 bg-gray-50 rounded-md text-xs text-gray-700 font-mono overflow-x-auto whitespace-pre-wrap">
            {formatDisplayValue(setting.value, type)}
          </pre>
        )}
      </div>
    );
  }

  /* --- Text / Number inline edit --- */
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
      <div className="flex-1 min-w-0 pr-4">
        <p className="text-sm font-medium text-gray-900">
          {setting.description || setting.key}
        </p>
        <p className="text-xs text-gray-400 font-mono mt-0.5">
          {setting.key}
        </p>
      </div>

      {editing ? (
        <div className="flex items-center gap-2">
          <input
            type={type === 'number' ? 'number' : 'text'}
            step={type === 'number' ? 'any' : undefined}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 w-48"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="p-1.5 text-white bg-primary-800 hover:bg-primary-700 rounded-md disabled:opacity-50 transition-colors"
            title="Save"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={handleCancel}
            disabled={saving}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50 transition-colors"
            title="Cancel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 font-mono">
            {setting.value}
          </span>
          <button
            onClick={() => setEditing(true)}
            className="p-1.5 text-gray-400 hover:text-primary-700 hover:bg-gray-100 rounded-md transition-colors"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main page component                                                        */
/* -------------------------------------------------------------------------- */

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch('/api/management/site-settings');
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to load');
      setSettings(data.settings);
    } catch (err: any) {
      setError(err.message || 'Failed to load settings');
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async (key: string, value: string) => {
    try {
      const res = await authFetch('/api/management/site-settings', {
        method: 'PUT',
        body: JSON.stringify({ key, value })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to save');

      // Update local state
      setSettings((prev) =>
        prev.map((s) => (s.key === key ? { ...s, value } : s))
      );
      toast.success(`Updated ${key}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save setting');
      throw err; // Let the row component know it failed
    }
  };

  const settingsByKey = settings.reduce<Record<string, SiteSetting>>(
    (acc, s) => {
      acc[s.key] = s;
      return acc;
    },
    {}
  );

  return (
    <AdminLayout title="Site Settings">
      <AdminPageHeader
        title="Site Settings"
        description="Manage your business configuration, booking parameters, and notification preferences."
        actions={
          <button
            onClick={fetchSettings}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
            />
            Refresh
          </button>
        }
      />

      {/* Loading state */}
      {loading && settings.length === 0 && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      )}

      {/* Error state */}
      {error && settings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <AlertCircle className="h-10 w-10 text-red-400 mb-3" />
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchSettings}
            className="mt-4 px-4 py-2 text-sm font-medium rounded-lg bg-primary-800 text-white hover:bg-primary-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Setting sections */}
      {!loading || settings.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            const sectionSettings = section.keys
              .map((k) => settingsByKey[k])
              .filter(Boolean);

            if (sectionSettings.length === 0) return null;

            return (
              <div
                key={section.title}
                className={`bg-white rounded-xl border border-gray-200 shadow-sm ${
                  section.title === 'Business Hours' ? 'lg:col-span-2' : ''
                }`}
              >
                {/* Card header */}
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary-50">
                    <Icon className="h-5 w-5 text-primary-700" />
                  </div>
                  <h2 className="text-base font-semibold text-gray-900 font-heading">
                    {section.title}
                  </h2>
                </div>

                {/* Card body */}
                <div className="px-6 py-2">
                  {sectionSettings.map((setting) => (
                    <SettingRow
                      key={setting.key}
                      setting={setting}
                      onSave={handleSave}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Uncategorized settings */}
          {(() => {
            const categorizedKeys = new Set(
              SECTIONS.flatMap((s) => s.keys)
            );
            const uncategorized = settings.filter(
              (s) => !categorizedKeys.has(s.key)
            );
            if (uncategorized.length === 0) return null;

            return (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-gray-100">
                    <Settings className="h-5 w-5 text-gray-600" />
                  </div>
                  <h2 className="text-base font-semibold text-gray-900 font-heading">
                    Other
                  </h2>
                </div>
                <div className="px-6 py-2">
                  {uncategorized.map((setting) => (
                    <SettingRow
                      key={setting.key}
                      setting={setting}
                      onSave={handleSave}
                    />
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      ) : null}
    </AdminLayout>
  );
}
