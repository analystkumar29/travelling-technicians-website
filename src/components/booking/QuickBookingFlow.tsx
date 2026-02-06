import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Laptop, Battery, Monitor, ArrowRight, ArrowLeft, MapPin, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { getCurrentLocationPostalCode, checkServiceArea } from '@/utils/locationUtils';
import { getTimeSlotsForDate, getNextAvailableDate, type TimeSlot } from '@/utils/bookingTimeSlots';

interface QuickBookingFlowProps {
  onSubmit: (data: any) => Promise<void>;
  isSubmitting?: boolean;
  onShowFullForm: () => void;
}

const repairOptions = [
  { id: 'phone-screen', label: 'Phone Screen', icon: Smartphone, deviceType: 'mobile', service: 'screen-replacement' },
  { id: 'phone-battery', label: 'Phone Battery', icon: Battery, deviceType: 'mobile', service: 'battery-replacement' },
  { id: 'laptop-screen', label: 'Laptop Screen', icon: Monitor, deviceType: 'laptop', service: 'screen-replacement' },
  { id: 'laptop-battery', label: 'Laptop Battery', icon: Laptop, deviceType: 'laptop', service: 'battery-replacement' },
];

const stepVariants = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

export default function QuickBookingFlow({ onSubmit, isSubmitting, onShowFullForm }: QuickBookingFlowProps) {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<typeof repairOptions[0] | null>(null);

  // Step 2 state
  const [postalCode, setPostalCode] = useState('');
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [serviceArea, setServiceArea] = useState<ReturnType<typeof checkServiceArea>>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Step 3 state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Auto-detect location on step 2
  useEffect(() => {
    if (step === 1 && !postalCode) {
      autoDetectLocation();
    }
  }, [step]);

  // Load time slots when postal code is confirmed
  useEffect(() => {
    if (serviceArea?.serviceable) {
      loadTimeSlots();
    }
  }, [serviceArea]);

  const autoDetectLocation = async () => {
    try {
      setDetectingLocation(true);
      const code = await getCurrentLocationPostalCode();
      if (code) {
        setPostalCode(code);
        const area = checkServiceArea(code);
        setServiceArea(area);
      }
    } catch {
      // Silent fail — user can enter manually
    } finally {
      setDetectingLocation(false);
    }
  };

  const handlePostalSubmit = () => {
    if (postalCode.length >= 3) {
      const area = checkServiceArea(postalCode);
      setServiceArea(area);
    }
  };

  const loadTimeSlots = async () => {
    try {
      setLoadingSlots(true);
      const nextDate = getNextAvailableDate();
      setSelectedDate(nextDate);
      const slots = await getTimeSlotsForDate(new Date(nextDate));
      setTimeSlots(slots.slice(0, 3));
    } catch {
      setTimeSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!selected || !selectedSlot || !name || !email) return;

    await onSubmit({
      deviceType: selected.deviceType,
      serviceType: selected.service,
      postalCode,
      bookingDate: selectedDate,
      bookingTime: selectedSlot,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
              step >= i ? 'bg-primary-800 text-white' : 'bg-primary-100 text-primary-400'
            }`}>
              {step > i ? <CheckCircle className="h-4 w-4" /> : i + 1}
            </div>
            {i < 2 && <div className={`w-12 h-0.5 mx-1 transition-colors ${step > i ? 'bg-primary-800' : 'bg-primary-100'}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Select repair */}
        {step === 0 && (
          <motion.div key="step1" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}>
            <h2 className="text-xl font-heading font-bold text-primary-900 text-center mb-6">What needs fixing?</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {repairOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => { setSelected(option); setStep(1); }}
                  className="bg-white border-2 border-primary-100 rounded-xl p-6 text-center hover:border-accent-400 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-50 rounded-full mb-3 group-hover:bg-accent-50 transition-colors">
                    <option.icon className="h-6 w-6 text-primary-600 group-hover:text-accent-600 transition-colors" />
                  </div>
                  <div className="font-semibold text-primary-800 text-sm">{option.label}</div>
                </button>
              ))}
            </div>
            <div className="text-center">
              <button onClick={onShowFullForm} className="text-primary-500 hover:text-primary-700 text-sm font-medium transition-colors">
                Need something else? Use full booking form
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Location + Time */}
        {step === 1 && (
          <motion.div key="step2" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}>
            <h2 className="text-xl font-heading font-bold text-primary-900 text-center mb-6">When and where?</h2>

            {/* Postal code */}
            <div className="bg-white border border-primary-100 rounded-xl p-5 mb-4">
              <label className="block text-sm font-medium text-primary-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1 text-accent-500" />Your Location
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value.toUpperCase())}
                  placeholder={detectingLocation ? 'Detecting...' : 'e.g. V5K 1A1'}
                  className="flex-1 h-11 rounded-md border border-primary-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
                <button
                  onClick={handlePostalSubmit}
                  className="bg-primary-800 text-white px-4 rounded-md text-sm font-medium hover:bg-primary-900 transition-colors"
                >
                  Check
                </button>
              </div>
              {serviceArea && (
                <div className={`mt-2 text-sm ${serviceArea.serviceable ? 'text-emerald-600' : 'text-red-600'}`}>
                  {serviceArea.serviceable
                    ? `We serve ${serviceArea.city}! ${serviceArea.sameDay ? 'Same-day available.' : ''}`
                    : 'Sorry, this area is outside our service range.'}
                </div>
              )}
            </div>

            {/* Time slots */}
            {serviceArea?.serviceable && (
              <div className="bg-white border border-primary-100 rounded-xl p-5 mb-6">
                <label className="block text-sm font-medium text-primary-700 mb-3">
                  <Clock className="inline h-4 w-4 mr-1 text-accent-500" />Available Times
                </label>
                {loadingSlots ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-primary-400" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.value}
                        onClick={() => setSelectedSlot(slot.value)}
                        className={`p-3 rounded-lg border text-sm font-medium text-left transition-colors ${
                          selectedSlot === slot.value
                            ? 'border-accent-400 bg-accent-50 text-primary-800'
                            : 'border-primary-100 text-primary-600 hover:border-primary-200'
                        }`}
                      >
                        {slot.label}
                      </button>
                    ))}
                    <button
                      onClick={onShowFullForm}
                      className="text-primary-500 hover:text-primary-700 text-xs font-medium text-center py-2"
                    >
                      More times available in full form
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="flex items-center gap-1 text-primary-500 hover:text-primary-700 text-sm font-medium">
                <ArrowLeft className="h-4 w-4" />Back
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!serviceArea?.serviceable || !selectedSlot}
                className="flex-1 bg-primary-800 hover:bg-primary-900 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Contact + Confirm */}
        {step === 2 && (
          <motion.div key="step3" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}>
            <h2 className="text-xl font-heading font-bold text-primary-900 text-center mb-6">Confirm your booking</h2>

            {/* Summary */}
            <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1.5 text-primary-600">
                  {selected && <selected.icon className="h-4 w-4 text-accent-500" />}
                  <span className="font-medium">{selected?.label}</span>
                </div>
                <span className="text-primary-300">|</span>
                <span className="text-primary-500">{serviceArea?.city}</span>
                <span className="text-primary-300">|</span>
                <span className="text-primary-500">{timeSlots.find(s => s.value === selectedSlot)?.label}</span>
              </div>
            </div>

            {/* Contact form */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 rounded-md border border-primary-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 rounded-md border border-primary-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                  placeholder="(604) 555-0123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 rounded-md border border-primary-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex items-center gap-1 text-primary-500 hover:text-primary-700 text-sm font-medium">
                <ArrowLeft className="h-4 w-4" />Back
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={!name || !email || isSubmitting}
                className="flex-1 bg-accent-500 hover:bg-accent-600 text-primary-900 py-3 rounded-lg font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Booking...</>
                ) : (
                  <>Confirm Booking <CheckCircle className="h-4 w-4" /></>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
