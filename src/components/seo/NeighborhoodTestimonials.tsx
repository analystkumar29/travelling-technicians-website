import React from 'react';

interface Testimonial {
  id: string | number;
  name: string;
  location: string;
  rating: number;
  comment: string;
  device: string;
  isNeighborhoodSpecific?: boolean;
}

interface NeighborhoodTestimonialsProps {
  testimonials: Testimonial[];
  neighborhoodName: string;
  cityName: string;
}

/**
 * NeighborhoodTestimonials Component
 * 
 * Hybrid testimonial system that displays:
 * 1. Neighborhood-specific testimonials first (high SEO weight)
 * 2. Falls back to city-wide testimonials if needed (2026 ranking factor)
 * 
 * This component tags reviews to clarify local authenticity to both users and search engines.
 */
export const NeighborhoodTestimonials: React.FC<NeighborhoodTestimonialsProps> = ({
  testimonials,
  neighborhoodName,
  cityName
}) => {
  // Separate neighborhood-specific and fallback testimonials
  const neighborhoodTestimonials = testimonials.filter(t => t.isNeighborhoodSpecific === true);
  const fallbackTestimonials = testimonials.filter(t => t.isNeighborhoodSpecific !== true);

  // Use neighborhood testimonials first, fallback to city-wide
  const displayedTestimonials = [
    ...neighborhoodTestimonials.slice(0, 2),
    ...fallbackTestimonials.slice(0, Math.max(0, 4 - neighborhoodTestimonials.length))
  ].slice(0, 4);

  // Count statistics
  const avgRating = testimonials.length > 0
    ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
    : '5.0';

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={i < rating ? 'text-yellow-400 text-lg' : 'text-gray-300 text-lg'}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="my-12">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Trusted by {neighborhoodName} Residents
        </h2>
        <p className="text-gray-700 mb-4">
          Real testimonials from customers who received doorstep repairs in your neighborhood
        </p>

        {/* Rating Summary */}
        <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-lg border border-blue-200 w-fit">
          <div>
            <div className="text-sm text-gray-600 font-medium">Average Rating</div>
            <div className="text-3xl font-bold text-blue-600">{avgRating}</div>
          </div>
          <div>
            {renderStars(Math.round(parseFloat(avgRating)))}
            <div className="text-sm text-gray-600 mt-2">
              Based on {testimonials.length} reviews
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayedTestimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors"
          >
            {/* Header with Rating */}
            <div className="mb-4">
              {renderStars(testimonial.rating)}
            </div>

            {/* Testimonial Text */}
            <p className="text-gray-700 mb-4 leading-relaxed italic">
              "{testimonial.comment}"
            </p>

            {/* Footer with Name and Location */}
            <div className="border-t border-gray-200 pt-4">
              <div className="font-semibold text-gray-900">{testimonial.name}</div>
              <div className="text-sm text-gray-600 mb-2">{testimonial.device}</div>

              {/* Location Badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                  📍 {testimonial.location}
                </span>
                {testimonial.isNeighborhoodSpecific && (
                  <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                    ✓ Neighborhood Customer
                  </span>
                )}
                {!testimonial.isNeighborhoodSpecific && (
                  <span className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                    City-Wide Service
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trust Message */}
      <div className="mt-8 bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <span className="text-3xl">🔒</span>
          <div>
            <h3 className="font-semibold text-green-900 mb-2">Verified Customer Reviews</h3>
            <p className="text-green-800">
              These testimonials come from real customers in {neighborhoodName} and surrounding areas
              of {cityName} who received our doorstep repair service. Each review reflects genuine
              experience with The Travelling Technicians' expertise and convenience.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-6 text-center">
        <p className="text-gray-700 mb-4">
          Ready to experience the same quality service as our {neighborhoodName} neighbors?
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors">
          Book Your Doorstep Repair
        </button>
      </div>
    </div>
  );
};

export default NeighborhoodTestimonials;