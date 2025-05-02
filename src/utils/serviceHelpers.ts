/**
 * Helper functions for service display and formatting
 */

/**
 * Converts a service_type string from snake_case to a human-readable format
 * 
 * @param serviceType The service type in snake_case format
 * @returns A formatted, human-readable service name
 */
export function getServiceDisplay(serviceType: string): string {
  const serviceDisplayMap: Record<string, string> = {
    // Mobile services
    'screen_replacement': 'Screen Replacement',
    'battery_replacement': 'Battery Replacement',
    'charging_port_repair': 'Charging Port Repair',
    'speaker_repair': 'Speaker Repair',
    'microphone_repair': 'Microphone Repair',
    'camera_repair': 'Camera Repair',
    'water_damage_repair': 'Water Damage Repair',
    'software_troubleshooting': 'Software Troubleshooting',
    
    // Laptop services
    'laptop_screen_replacement': 'Screen Replacement',
    'laptop_battery_replacement': 'Battery Replacement',
    'keyboard_replacement': 'Keyboard Replacement',
    'trackpad_repair': 'Trackpad Repair',
    'ram_upgrade': 'RAM Upgrade',
    'storage_upgrade': 'Storage Upgrade',
    'hdd_ssd_replacement': 'HDD/SSD Replacement',
    'virus_removal': 'Virus Removal',
    'os_installation': 'OS Installation',
    'cooling_system_repair': 'Cooling System Repair',
    'power_jack_repair': 'Power Jack Repair',
    
    // Generic services
    'diagnostic': 'Diagnostic Service',
    'data_recovery': 'Data Recovery',
    'general_repair': 'General Repair'
  };

  // Return the mapped value if it exists, otherwise format the string manually
  return serviceDisplayMap[serviceType] || 
    serviceType
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Gets a brief description of a service based on its service_type
 * 
 * @param serviceType The service type identifier
 * @returns A brief description of the service
 */
export function getServiceDescription(serviceType: string): string {
  const serviceDescriptionMap: Record<string, string> = {
    // Mobile services
    'screen_replacement': 'Replace cracked or damaged screen with a high-quality replacement.',
    'battery_replacement': 'Replace degraded battery to restore device battery life.',
    'charging_port_repair': 'Fix charging port issues to ensure reliable charging.',
    'speaker_repair': 'Repair or replace speakers for clear audio.',
    'microphone_repair': 'Fix microphone issues for clear voice recording and calls.',
    'camera_repair': 'Repair front or rear camera problems.',
    'water_damage_repair': 'Diagnose and repair water damage issues.',
    'software_troubleshooting': 'Fix software issues, crashes, and performance problems.',
    
    // Laptop services
    'laptop_screen_replacement': 'Replace cracked or damaged laptop screen.',
    'laptop_battery_replacement': 'Replace degraded laptop battery to extend battery life.',
    'keyboard_replacement': 'Replace damaged or non-responsive keyboard.',
    'trackpad_repair': 'Fix trackpad issues for smooth cursor control.',
    'ram_upgrade': 'Increase system memory for better performance.',
    'storage_upgrade': 'Upgrade storage capacity or speed with SSD installation.',
    'hdd_ssd_replacement': 'Replace failing hard drive or upgrade to faster SSD.',
    'virus_removal': 'Remove viruses, malware, and unwanted software.',
    'os_installation': 'Install or reinstall operating system.',
    'cooling_system_repair': 'Fix overheating issues by repairing cooling system.',
    'power_jack_repair': 'Repair damaged power connector for reliable charging.',
    
    // Generic services
    'diagnostic': 'Comprehensive diagnosis of hardware and software issues.',
    'data_recovery': 'Recover important data from damaged or inaccessible devices.',
    'general_repair': 'General repair service for other device issues.'
  };

  return serviceDescriptionMap[serviceType] || 'Professional repair service by qualified technicians.';
}

/**
 * Determines if a service is available for doorstep repair
 * 
 * @param serviceType The service type identifier
 * @returns Boolean indicating if the service is doorstep-eligible
 */
export function isDoorstepEligible(serviceType: string): boolean {
  const nonDoorstepServices = [
    'water_damage_repair',
    'data_recovery',
    'motherboard_repair',
    'advanced_diagnostic'
  ];
  
  return !nonDoorstepServices.includes(serviceType);
}

/**
 * Gets the estimated time to complete a service
 * 
 * @param serviceType The service type identifier
 * @returns String representing estimated service time
 */
export function getServiceTime(serviceType: string): string {
  const serviceTimeMap: Record<string, string> = {
    // Quick services (30-45 min)
    'battery_replacement': '30-45 minutes',
    'ram_upgrade': '30 minutes',
    'storage_upgrade': '30-45 minutes',
    'hdd_ssd_replacement': '30-45 minutes',
    
    // Medium services (45-60 min)
    'screen_replacement': '45-60 minutes',
    'charging_port_repair': '45-60 minutes',
    'speaker_repair': '45-60 minutes',
    'microphone_repair': '45-60 minutes',
    'camera_repair': '45-60 minutes',
    'keyboard_replacement': '45-60 minutes',
    'virus_removal': '45-60 minutes',
    
    // Longer services (60+ min)
    'laptop_screen_replacement': '60-90 minutes',
    'water_damage_repair': '60+ minutes',
    'os_installation': '60-90 minutes',
    'cooling_system_repair': '60-90 minutes',
    'power_jack_repair': '60-90 minutes',
    'data_recovery': '60+ minutes'
  };
  
  return serviceTimeMap[serviceType] || '45-60 minutes';
} 