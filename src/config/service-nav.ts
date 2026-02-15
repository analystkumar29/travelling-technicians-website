export interface ServiceNavItem {
  slug: string;
  label: string;
  href: string;
  icon: 'smartphone' | 'laptop' | 'tablet';
  isActive: boolean;
}

export const SERVICE_NAV_ITEMS: ServiceNavItem[] = [
  { slug: 'mobile-repair', label: 'Mobile Repair', href: '/services/mobile-repair', icon: 'smartphone', isActive: true },
  { slug: 'laptop-repair', label: 'Laptop Repair', href: '/services/laptop-repair', icon: 'laptop', isActive: true },
  { slug: 'tablet-repair', label: 'Tablet Repair', href: '/services/tablet-repair', icon: 'tablet', isActive: false },
];

export const getActiveServiceNavItems = () => SERVICE_NAV_ITEMS.filter(s => s.isActive);
