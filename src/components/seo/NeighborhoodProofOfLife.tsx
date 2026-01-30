import React from 'react';

interface ProofOfLifeData {
  monthlyIPhoneScreens: number;
  monthlySamsungScreens: number;
  monthlyPixelScreens: number;
  monthlyMacbookScreens: number;
  landmarkName: string;
  landmarkDescription: string;
  landmarkActivityWindow: string;
}

interface NeighborhoodProofOfLifeProps {
  data: ProofOfLifeData;
  neighborhoodName: string;
}

/**
 * NeighborhoodProofOfLife Component
 * 
 * Displays "Proof-of-Life" signals that establish real-world behavioral presence.
 * Shows monthly repair statistics and landmark presence with activity windows.
 * These signals cannot be replicated by Google's SGE and provide competitive advantage.
 */
export const NeighborhoodProofOfLife: React.FC<NeighborhoodProofOfLifeProps> = ({
  data,
  neighborhoodName
}) => {
  const totalMonthlyRepairs =
    data.monthlyIPhoneScreens +
    data.monthlySamsungScreens +
    data.monthlyPixelScreens +
    data.monthlyMacbookScreens;

  const repairStats = [
    {
      label: 'iPhone Screen Repairs',
      value: data.monthlyIPhoneScreens,
      icon: '📱',
      color: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      label: 'Samsung Screen Repairs',
      value: data.monthlySamsungScreens,
      icon: '📱',
      color: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    },
    {
      label: 'Google Pixel Repairs',
      value: data.monthlyPixelScreens,
      icon: '📱',
      color: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      label: 'MacBook Repairs',
      value: data.monthlyMacbookScreens,
      icon: '💻',
      color: 'bg-gray-50',
      borderColor: 'border-gray-200'
    }
  ];

  return (
    <div className="my-12 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-8 border-2 border-amber-200">
      {/* Header with Badge */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="inline-block px-4 py-2 bg-amber-500 text-white text-sm font-semibold rounded-full">
            ✓ Proof of Life - Real Neighborhood Presence
          </span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Our {neighborhoodName} Presence
        </h2>
        <p className="text-gray-700">
          Real repair data proving our local expertise and trusted presence in your neighborhood
        </p>
      </div>

      {/* Monthly Repair Statistics */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Monthly Repair Activity</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {repairStats.map((stat) => (
            <div
              key={stat.label}
              className={`${stat.color} border-2 ${stat.borderColor} rounded-lg p-6 text-center transition-transform hover:scale-105`}
            >
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
              <div className="text-sm font-medium text-gray-700">{stat.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 bg-white border-2 border-amber-300 rounded-lg p-4 text-center">
          <div className="text-sm text-gray-600 mb-1">Total Monthly Repairs</div>
          <div className="text-3xl font-bold text-amber-600">{totalMonthlyRepairs} Devices Fixed</div>
        </div>
      </div>

      {/* Landmark Presence */}
      <div className="bg-white rounded-lg p-6 border-2 border-amber-300">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>📍</span> Landmark Presence
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900">{data.landmarkName}</h4>
            <p className="text-gray-700 mt-2">{data.landmarkDescription}</p>
          </div>
          <div className="flex items-start gap-3 bg-amber-50 p-4 rounded-lg border border-amber-200">
            <span className="text-2xl">⏰</span>
            <div>
              <div className="font-semibold text-gray-900">Active Service Window</div>
              <div className="text-gray-700">{data.landmarkActivityWindow}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Indicator */}
      <div className="mt-6 bg-green-50 border-2 border-green-300 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <h4 className="font-semibold text-green-900">Verified Local Expertise</h4>
            <p className="text-green-800 text-sm mt-1">
              Our monthly repair statistics prove we're not just claiming to service {neighborhoodName} — 
              we're actively repairing devices here every month. This real-world behavioral data establishes 
              genuine local presence that search engines trust.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeighborhoodProofOfLife;