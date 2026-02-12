import React from 'react';

// Service type configuration
export const serviceConfig = {
  'laptop-repair': {
    deviceType: 'laptop' as const,
    title: 'Laptop Repair Services',
    heroTitle: 'Expert Laptop Repair at Your Doorstep',
    heroDescription: 'From screen replacements to performance upgrades, we bring professional laptop repair services directly to your location across the Lower Mainland.',
    image: '/images/services/laptopRepair-optimized.webp',
    imageAlt: 'Professional laptop repair technician fixing computers with precision and expertise',
    repairTime: '90 min',
    serviceDescription: 'Professional laptop repair services including screen replacement, battery replacement, keyboard repair, RAM upgrades, and more.',
    brandsDescription: 'Our technicians are trained to repair all major laptop brands and models.',
    whyTitle: 'Why Choose Our Laptop Repair Service',
    whyDescription: 'We bring convenience, quality, and expertise directly to your doorstep.',
    processTitle: 'Our Laptop Repair Process',
    processDescription: "We've made getting your laptop repaired as simple and convenient as possible.",
    processSteps: [
      {
        title: 'Book Your Repair',
        description: 'Schedule your laptop repair online or by phone. Choose a time that works for you.'
      },
      {
        title: 'Doorstep Diagnosis',
        description: 'Our certified technician arrives at your location to diagnose the issue and provide a transparent quote.'
      },
      {
        title: 'On-Site Repair',
        description: 'We complete the repair right at your doorstep using professional tools and genuine parts.'
      }
    ],
    ctaTitle: 'Ready to Fix Your Laptop?',
    ctaDescription: 'Book our doorstep laptop repair service and have your computer fixed without the hassle of going to a repair shop.',
    fallbackServices: [
      {
        id: 1,
        name: 'Screen Replacement',
        description: 'Fix cracked, damaged, or unresponsive laptop screens with high-quality replacements.',
        icon: 'laptop',
        doorstep: true,
        limited: false,
        price: 'From $149',
        popular: true
      },
      {
        id: 2,
        name: 'Battery Replacement',
        description: 'Replace old or swollen batteries to restore your laptop\'s battery life.',
        icon: 'battery-full',
        doorstep: true,
        limited: false,
        price: 'From $99',
        popular: true
      }
    ],
    fallbackBrands: ['Apple', 'Samsung', 'Google']
  },
  'mobile-repair': {
    deviceType: 'mobile' as const,
    title: 'Mobile Repair Services',
    heroTitle: 'Expert Mobile Repair at Your Doorstep',
    heroDescription: 'From screen replacements to battery upgrades, we bring professional mobile repair services directly to your location across the Lower Mainland.',
    image: '/images/services/mobileRepair-optimized.webp',
    imageAlt: 'Professional mobile repair technician fixing smartphones with precision and expertise',
    repairTime: '45 min',
    serviceDescription: 'Professional mobile repair services including screen replacement, battery replacement, charging port repair, and more.',
    brandsDescription: 'Our technicians are trained to repair all major mobile brands and models.',
    whyTitle: 'Why Choose Our Mobile Repair Service',
    whyDescription: 'We bring convenience, quality, and expertise directly to your doorstep.',
    processTitle: 'Our Mobile Repair Process',
    processDescription: "We've made getting your mobile repaired as simple and convenient as possible.",
    processSteps: [
      {
        title: 'Book Your Repair',
        description: 'Schedule your mobile repair online or by phone. Choose a time that works for you.'
      },
      {
        title: 'Doorstep Diagnosis',
        description: 'Our certified technician arrives at your location to diagnose the issue and provide a transparent quote.'
      },
      {
        title: 'On-Site Repair',
        description: 'We complete the repair right at your doorstep using professional tools and genuine parts.'
      }
    ],
    ctaTitle: 'Ready to Fix Your Mobile?',
    ctaDescription: 'Book our doorstep mobile repair service and have your phone fixed without the hassle of going to a repair shop.',
    fallbackServices: [
      {
        id: 1,
        name: 'Screen Replacement',
        description: 'Fix cracked or broken screens with high-quality replacements.',
        icon: 'mobile-alt',
        doorstep: true,
        limited: false,
        price: 'From $99',
        popular: true
      },
      {
        id: 2,
        name: 'Battery Replacement',
        description: 'Replace old batteries to restore your phone\'s battery life.',
        icon: 'battery-full',
        doorstep: true,
        limited: false,
        price: 'From $79',
        popular: true
      }
    ],
    fallbackBrands: ['Apple', 'Samsung', 'Google']
  },
  'tablet-repair': {
    deviceType: 'tablet' as const,
    title: 'Tablet Repair Services',
    heroTitle: 'Expert Tablet Repair at Your Doorstep',
    heroDescription: 'From screen replacements to battery upgrades, we bring professional tablet repair services directly to your location across the Lower Mainland.',
    image: '/images/services/tabletRepair-optimized.webp',
    imageAlt: 'Professional tablet repair technician fixing tablets with precision and expertise',
    repairTime: '60 min',
    serviceDescription: 'Professional tablet repair services including screen replacement, battery replacement, charging port repair, and more.',
    brandsDescription: 'Our technicians are trained to repair all major tablet brands and models.',
    whyTitle: 'Why Choose Our Tablet Repair Service',
    whyDescription: 'We bring convenience, quality, and expertise directly to your doorstep.',
    processTitle: 'Our Tablet Repair Process',
    processDescription: "We've made getting your tablet repaired as simple and convenient as possible.",
    processSteps: [
      {
        title: 'Book Your Repair',
        description: 'Schedule your tablet repair online or by phone. Choose a time that works for you.'
      },
      {
        title: 'Doorstep Diagnosis',
        description: 'Our certified technician arrives at your location to diagnose the issue and provide a transparent quote.'
      },
      {
        title: 'On-Site Repair',
        description: 'We complete the repair right at your doorstep using professional tools and genuine parts.'
      }
    ],
    ctaTitle: 'Ready to Fix Your Tablet?',
    ctaDescription: 'Book our doorstep tablet repair service and have your tablet fixed without the hassle of going to a repair shop.',
    fallbackServices: [
      {
        id: 1,
        name: 'Screen Replacement',
        description: 'Fix cracked or damaged tablet screens with high-quality replacements.',
        icon: 'tablet-alt',
        doorstep: true,
        limited: false,
        price: 'From $129',
        popular: true
      },
      {
        id: 2,
        name: 'Battery Replacement',
        description: 'Replace old batteries to restore your tablet\'s battery life.',
        icon: 'battery-full',
        doorstep: true,
        limited: false,
        price: 'From $99',
        popular: true
      }
    ],
    fallbackBrands: ['Apple', 'Samsung', 'Google']
  },
} as const;

export type ServiceSlug = keyof typeof serviceConfig;
export type ServiceConfig = typeof serviceConfig[ServiceSlug];