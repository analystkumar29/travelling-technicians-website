import { useRouter } from 'next/router';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Calendar,
  CreditCard,
  Smartphone,
  DollarSign,
  BarChart3,
  ScanSearch,
  Users,
  Shield,
  Star,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Wrench,
  X,
  Settings,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/management', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/management/bookings', label: 'Bookings', icon: Calendar },
  { href: '/management/payments', label: 'Payments', icon: CreditCard },
  { href: '/management/devices', label: 'Devices', icon: Smartphone },
  { href: '/management/pricing', label: 'Pricing', icon: DollarSign },
  { href: '/management/pricing-coverage', label: 'Price Audit', icon: BarChart3 },
  { href: '/management/quality-control', label: 'Quality', icon: ScanSearch },
  { href: '/management/technicians', label: 'Technicians', icon: Users },
  { href: '/management/warranties', label: 'Warranties', icon: Shield },
  { href: '/management/testimonials', label: 'Testimonials', icon: Star },
  { href: '/management/customer-feedback', label: 'Feedback', icon: MessageSquare },
  { href: '/management/site-settings', label: 'Settings', icon: Settings },
];

export const SIDEBAR_COLLAPSED_KEY = 'admin_sidebar_collapsed';

interface AdminSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function AdminSidebar({ mobileOpen, onMobileClose }: AdminSidebarProps) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      if (saved === 'true') setCollapsed(true);
    } catch {}
  }, []);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
    } catch {}
  };

  // Close mobile menu on route change
  useEffect(() => {
    onMobileClose();
  }, [router.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const isActive = (href: string) => {
    if (href === '/management') return router.pathname === '/management';
    return router.pathname.startsWith(href);
  };

  const navList = (isMobile: boolean) => (
    <div className="flex flex-col h-full">
      {/* Logo area */}
      <div className={`flex items-center justify-between h-16 border-b border-primary-800 ${
        !isMobile && collapsed ? 'px-3' : 'px-4'
      }`}>
        <div className="flex items-center">
          <Wrench className="h-6 w-6 text-accent-400 flex-shrink-0" />
          {(isMobile || !collapsed) && (
            <span className="ml-3 text-white font-heading font-semibold text-sm truncate">
              Admin Panel
            </span>
          )}
        </div>
        {isMobile && (
          <button onClick={onMobileClose} className="p-1 text-primary-300 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center rounded-lg transition-colors duration-150 ${
                    !isMobile && collapsed ? 'justify-center px-2 py-3' : 'px-3 py-2.5'
                  } ${
                    active
                      ? 'bg-accent-500 text-primary-900 font-medium shadow-sm'
                      : 'text-primary-200 hover:bg-primary-800 hover:text-white'
                  }`}
                  title={!isMobile && collapsed ? item.label : undefined}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-primary-900' : ''}`} />
                  {(isMobile || !collapsed) && <span className="ml-3 text-sm">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse toggle (desktop only) */}
      {!isMobile && (
        <div className="border-t border-primary-800 p-2">
          <button
            onClick={toggleCollapse}
            className="flex items-center justify-center w-full py-2 rounded-lg text-primary-300 hover:bg-primary-800 hover:text-white transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-60 bg-primary-900 transform transition-transform duration-200 md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {navList(true)}
      </div>

      {/* Desktop sidebar */}
      <div
        className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 bg-primary-900 transition-all duration-200 z-30 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        {navList(false)}
      </div>
    </>
  );
}
