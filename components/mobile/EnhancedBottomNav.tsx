'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { NavItem } from '../navigation/PrimaryNav';
import styles from './EnhancedBottomNav.module.css';

type EnhancedBottomNavProps = {
  items: NavItem[];
  showNotificationBadges?: boolean;
  customActions?: NavItem[];
};

type NavigationContext = {
  unreadCount?: number;
  hasNewContent?: boolean;
  currentPage?: string;
};

export function EnhancedBottomNav({
  items,
  showNotificationBadges = true,
  customActions = []
}: EnhancedBottomNavProps) {
  const pathname = usePathname();
  const [context, setContext] = useState<NavigationContext>({});
  const [isScrolled, setIsScrolled] = useState(false);

  // Detect scroll state for styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Set context without simulation
  useEffect(() => {
    setContext({
      currentPage: pathname,
      hasNewContent: false,
      unreadCount: 0,
    });
  }, [pathname]);

  const getNavContextualInfo = (item: NavItem) => {
    switch (item.href) {
      case '/':
        return {
          badge: undefined,
          tooltip: 'Dashboard',
          color: 'primary'
        };
      case '/standings':
        return {
          badge: undefined,
          tooltip: 'Standings - League table',
          color: 'secondary'
        };
      case '/leaderboard':
        return {
          tooltip: 'Top Scorers - Goal leaders',
          color: 'accent'
        };
      case '/teams':
        return {
          tooltip: 'Teams - All clubs',
          color: 'neutral'
        };
      default:
        return { tooltip: item.label, color: 'neutral' };
    }
  };

  const allItems = [...items, ...customActions];

  return (
    <div className={`${styles.enhancedBottomNav} ${isScrolled ? styles.scrolled : ''}`}>
      {/* Safe area padding for notched screens */}
      <div className={styles.safeAreaPadding}>
        <nav
          aria-label="Primary navigation"
          className={styles.navContainer}
        >
          {allItems.map((item) => {
            const segments = item.segments ?? [item.href];
            const isActive = segments.some((segment) => {
              if (segment === '/') {
                return pathname === '/';
              }
              return pathname.startsWith(segment);
            });

            const contextualInfo = getNavContextualInfo(item);
            const showBadge = showNotificationBadges && contextualInfo.badge;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                title={contextualInfo.tooltip}
                data-color={contextualInfo.color}
              >
                {/* Notification Badge */}
                {showBadge && (
                  <span className={styles.notificationBadge}>
                    {contextualInfo.badge}
                    <span className="sr-only">
                      {contextualInfo.badge === '!'
                        ? 'New content available'
                        : `${contextualInfo.badge} unread items`
                      }
                    </span>
                  </span>
                )}

                {/* Active Indicator Dot */}
                {isActive && (
                  <span className={styles.activeIndicator} aria-hidden="true" />
                )}

                {/* Icon */}
                <span
                  className={styles.navIcon}
                  aria-hidden="true"
                >
                  {item.icon ?? '•'}
                </span>

                {/* Label */}
                <span className={styles.navLabel}>
                  {item.label}
                </span>

                {/* Touch feedback overlay */}
                <span className={styles.touchFeedback} aria-hidden="true" />
              </Link>
            );
          })}
        </nav>

        </div>
    </div>
  );
}