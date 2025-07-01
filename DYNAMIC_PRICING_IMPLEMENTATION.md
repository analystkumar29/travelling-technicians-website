# Dynamic Pricing Implementation

## Overview

Enhanced the booking system to show real-time pricing calculations based on selected device, services, and service tier. Users can now see exact pricing when they select multiple services, with proper breakdowns and tier-based adjustments.

## Features Implemented

### 1. Real-time Price Calculation Hook (`usePriceCalculation.ts`)
- **Location**: `src/hooks/usePriceCalculation.ts`
- **Purpose**: Manages real-time price calculations with automatic updates
- **Features**:
  - Supports single and multiple service selections
  - Automatic recalculation when form values change
  - Loading states and error handling
  - Caching to avoid unnecessary API calls

### 2. Price Display Component (`PriceDisplay.tsx`)
- **Location**: `src/components/booking/PriceDisplay.tsx`
- **Purpose**: Beautiful UI component to display pricing information
- **Features**:
  - Individual service pricing breakdown
  - Total pricing for multiple services
  - Tier comparison (Standard vs Premium)
  - Warranty period display
  - Location-based pricing adjustments
  - Discount indicators when applicable
  - Professional styling with loading states

### 3. Enhanced Pricing API (`/api/pricing/calculate`)
- **Location**: `src/pages/api/pricing/calculate.ts`
- **Improvements**:
  - Service ID mapping (form IDs → backend service names)
  - Comprehensive service display names
  - Enhanced pricing matrix for all device types
  - Proper tier multipliers (Standard: 1.0x, Premium: 1.25x)
  - Brand-based pricing adjustments
  - Location-based pricing (Vancouver downtown +5%, Richmond +3%)

## Pricing Structure

### Base Pricing by Device Type

#### Mobile Devices
- Screen Replacement: $149 (base)
- Battery Replacement: $89
- Charging Port Repair: $109
- Speaker/Microphone Repair: $99
- Camera Repair: $119
- Water Damage Diagnostics: $129
- Other Repairs: $99

#### Laptop Devices
- Screen Replacement: $249 (base)
- Battery Replacement: $139
- Keyboard Repair/Replacement: $159
- Trackpad Repair: $139
- RAM Upgrade: $119
- Storage (HDD/SSD) Upgrade: $179
- Software Troubleshooting: $99
- Virus Removal: $129
- Cooling System Repair: $159
- Power Jack Repair: $149
- Other Repairs: $129

#### Tablet Devices
- Screen Replacement: $189 (base)
- Battery Replacement: $119
- Charging Port Repair: $109
- Speaker Repair: $99
- Button Repair: $89
- Software Issue: $99
- Other Repairs: $109

### Brand Multipliers
- **Apple**: 1.2x (premium for Apple devices)
- **Samsung**: 1.1x
- **Google**: 1.0x (baseline)
- **OnePlus**: 0.95x
- **Xiaomi**: 0.9x
- **Dell**: 1.05x
- **HP**: 1.0x
- **Lenovo**: 0.95x
- **ASUS**: 1.0x
- **Other brands**: 0.9x

### Service Tier Multipliers
- **Standard Repair**: 1.0x (3-month warranty, 24-48h turnaround)
- **Premium Service**: 1.25x (6-month warranty, 12-24h turnaround)

### Location Adjustments
- **Downtown Vancouver** (V6B, V6C, V6E, V6G, V6Z): +5%
- **Richmond/Airport** (V6X, V7B): +3%
- **Other areas**: No adjustment

## Integration Points

### Booking Form Integration
The pricing display appears at three key points in the booking flow:

1. **Service Details Step** (Step 2): Shows pricing as soon as device and services are selected
2. **Service Tier Step** (Step 3): Updates pricing when tier is changed
3. **Confirmation Step** (Step 7): Final pricing summary before booking submission

### Multiple Service Support
- Users can select multiple services from the "Common Repairs" category
- Pricing displays individual service costs and total cost
- Clear breakdown shows device model, service tier, and warranty period for each service

## Example Pricing Calculations

### Single Service Example
- **Device**: Apple iPhone 15 Pro
- **Service**: Screen Replacement
- **Tier**: Standard
- **Calculation**: $149 (base) × 1.2 (Apple brand) × 1.0 (Standard tier) = **$178.80**

### Multiple Services Example
- **Device**: Samsung Galaxy S24
- **Services**: Screen Replacement + Battery Replacement
- **Tier**: Premium
- **Calculations**:
  - Screen: $149 × 1.1 (Samsung) × 1.25 (Premium) = $205.88
  - Battery: $89 × 1.1 (Samsung) × 1.25 (Premium) = $122.38
  - **Total**: $328.26

### Location-Based Adjustment Example
- **Device**: Apple MacBook Pro
- **Service**: Screen Replacement
- **Tier**: Premium
- **Location**: Downtown Vancouver (V6B)
- **Calculation**: $249 × 1.2 (Apple) × 1.25 (Premium) × 1.05 (Downtown) = **$393.75**

## Technical Implementation Details

### Service ID Mapping
The form uses kebab-case service IDs (e.g., `screen-replacement`) which are mapped to backend snake_case names (e.g., `screen_replacement`) for consistent API processing.

### Error Handling
- Graceful fallbacks when pricing calculation fails
- Loading states during API calls
- Clear error messages for users
- Fallback to base pricing if specific combinations aren't found

### Performance Optimizations
- Debounced API calls to prevent excessive requests
- Memoized calculations for repeated combinations
- Conditional rendering to avoid unnecessary API calls
- Efficient re-renders with React hooks

## User Experience Enhancements

### Visual Indicators
- **Green pricing cards** for successful calculations
- **Loading skeletons** during calculation
- **Error states** with retry options
- **Discount badges** when applicable
- **Warranty period badges** (3-month vs 6-month)

### Information Architecture
- Clear service tier comparison
- Comprehensive feature lists for each tier
- Transparent pricing breakdown
- Location-based adjustments clearly shown
- Total cost prominently displayed

## Future Enhancements

### Planned Features
1. **Dynamic Pricing Database**: Transition from static pricing to database-driven pricing
2. **Promotional Pricing**: Support for time-based discounts and promotions
3. **Volume Discounts**: Discounts for multiple services
4. **Advanced Location Pricing**: More granular location-based adjustments
5. **Real-time Inventory**: Pricing adjustments based on parts availability

### API Extensibility
The current implementation is designed to easily transition to a database-driven pricing system when ready, with minimal changes to the frontend components.

## Testing

### Manual Testing Scenarios
1. **Single Service Selection**: Verify pricing appears correctly
2. **Multiple Service Selection**: Check total calculation accuracy
3. **Tier Changes**: Confirm pricing updates when switching tiers
4. **Brand/Model Changes**: Validate pricing recalculation
5. **Location Impact**: Test postal code-based adjustments
6. **Error Handling**: Test with invalid combinations
7. **Mobile Responsiveness**: Verify pricing display on different screen sizes

### API Testing
```bash
# Test single service pricing
curl "http://localhost:3000/api/pricing/calculate?deviceType=mobile&brand=apple&model=iPhone%2015%20Pro&service=screen-replacement&tier=standard"

# Test premium tier pricing
curl "http://localhost:3000/api/pricing/calculate?deviceType=mobile&brand=apple&model=iPhone%2015%20Pro&service=battery-replacement&tier=premium"

# Test laptop pricing
curl "http://localhost:3000/api/pricing/calculate?deviceType=laptop&brand=apple&model=MacBook%20Pro%2016&service=screen-replacement&tier=premium"
```

## Deployment Notes

### Environment Considerations
- Pricing calculations work entirely with static data (no external dependencies)
- No database changes required for current implementation
- Compatible with existing booking flow and data structures

### Browser Compatibility
- Uses modern React hooks (requires React 16.8+)
- Fetch API for HTTP requests (IE11+ support)
- CSS Grid and Flexbox for layouts (modern browser support)

### Security Considerations
- All pricing calculations are server-side
- Client-side validation with server-side verification
- No sensitive pricing logic exposed to frontend
- Rate limiting considerations for pricing API calls

## Support and Maintenance

### Monitoring
- Track pricing calculation errors
- Monitor API response times
- User interaction analytics on pricing display

### Updates
- Service pricing can be updated in `src/pages/api/pricing/calculate.ts`
- Brand multipliers easily adjustable
- Location adjustments configurable per postal code prefix
- Service tier features and multipliers easily modified

This implementation provides a solid foundation for dynamic pricing that enhances user experience while maintaining flexibility for future enhancements. 