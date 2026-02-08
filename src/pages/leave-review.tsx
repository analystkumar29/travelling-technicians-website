import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import { Star, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

function StarSelector({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: number | null;
  onChange: (v: number) => void;
  required?: boolean;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? value ?? 0;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex items-center gap-1" onMouseLeave={() => setHovered(null)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHovered(i)}
            onClick={() => onChange(i)}
            className="p-0.5 focus:outline-none focus:ring-2 focus:ring-amber-300 rounded"
          >
            <Star
              className={`h-8 w-8 transition-colors ${
                i <= display
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        {value && (
          <span className="ml-2 text-sm text-gray-500">{value}/5</span>
        )}
      </div>
    </div>
  );
}

export default function LeaveReviewPage() {
  const router = useRouter();
  const { token, ref } = router.query;

  const [overallRating, setOverallRating] = useState<number | null>(null);
  const [technicianRating, setTechnicianRating] = useState<number | null>(null);
  const [serviceRating, setServiceRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const charCount = reviewText.length;
  const maxChars = 2000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!overallRating) {
      setError('Please select an overall rating.');
      return;
    }

    if (!reviewText.trim()) {
      setError('Please write a review.');
      return;
    }

    if (charCount > maxChars) {
      setError(`Review must be ${maxChars} characters or fewer.`);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          booking_ref: ref,
          overall_rating: overallRating,
          review_text: reviewText.trim(),
          technician_rating: technicianRating,
          service_rating: serviceRating,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitted(true);
      } else {
        setError(data.message || 'Failed to submit review. Please try again.');
      }
    } catch {
      setError('An error occurred. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  const bookingRef = typeof ref === 'string' ? ref : '';
  const hasParams = token && ref;

  return (
    <Layout title="Leave a Review | The Travelling Technicians">
      <div className="max-w-2xl mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        {/* Success State */}
        {submitted && (
          <div className="bg-white shadow-lg rounded-xl overflow-hidden text-center p-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Thank You for Your Review!
            </h1>
            <p className="text-gray-600 mb-6">
              Your feedback means a lot to us. Your review will appear on our
              site after a quick review by our team.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="px-6 py-2.5 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                Return Home
              </button>
              <button
                onClick={() => router.push('/check-warranty')}
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Check Warranty
              </button>
            </div>
          </div>
        )}

        {/* Missing/Invalid Link */}
        {!hasParams && !submitted && (
          <div className="bg-white shadow-lg rounded-xl overflow-hidden text-center p-8">
            <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Invalid Review Link
            </h1>
            <p className="text-gray-600 mb-6">
              This review link appears to be invalid or incomplete. Please use
              the link from your warranty confirmation email.
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2.5 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              Return Home
            </button>
          </div>
        )}

        {/* Review Form */}
        {hasParams && !submitted && (
          <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            <div className="bg-primary-800 px-6 py-5 text-center">
              <h1 className="text-xl font-bold text-white">
                How Was Your Experience?
              </h1>
              <p className="text-primary-200 text-sm mt-1">
                We value your feedback
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Booking reference badge */}
              {bookingRef && (
                <div className="flex items-center justify-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                    Booking: {bookingRef}
                  </span>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Overall Rating */}
              <StarSelector
                label="Overall Experience"
                value={overallRating}
                onChange={setOverallRating}
                required
              />

              {/* Optional Ratings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StarSelector
                  label="Technician"
                  value={technicianRating}
                  onChange={setTechnicianRating}
                />
                <StarSelector
                  label="Service Quality"
                  value={serviceRating}
                  onChange={setServiceRating}
                />
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Review <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={5}
                  maxLength={maxChars + 100}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Tell us about your repair experience..."
                />
                <div className="flex justify-end mt-1">
                  <span
                    className={`text-xs ${
                      charCount > maxChars ? 'text-red-500' : 'text-gray-400'
                    }`}
                  >
                    {charCount}/{maxChars}
                  </span>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting || !overallRating || !reviewText.trim()}
                className="w-full flex items-center justify-center px-6 py-3 bg-accent-500 text-primary-900 text-sm font-semibold rounded-lg hover:bg-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Review'
                )}
              </button>

              <p className="text-xs text-gray-400 text-center">
                Your review will be published after approval. Your name will
                appear as first name and last initial for privacy.
              </p>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}
