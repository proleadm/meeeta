'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Clock, ArrowRightLeft, Users, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import AuthMenu from '@/components/auth/AuthMenu';

const tabs = [
  {
    id: 'clocks',
    label: 'Clocks',
    icon: Clock,
    href: '/clocks',
    enabled: true,
  },
  {
    id: 'convert',
    label: 'Convert',
    icon: ArrowRightLeft,
    href: '/convert',
    enabled: true,
  },
  {
    id: 'overlap',
    label: 'Overlap',
    icon: Users,
    href: '/overlap',
    enabled: true,
  },
  {
    id: 'planner',
    label: 'Planner',
    icon: Calendar,
    href: '/planner',
    enabled: true,
  },
];

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-14 items-center justify-between gap-4 lg:gap-6">
            <div className="flex items-center gap-4 lg:gap-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-6 w-6" />
                <span className="font-bold text-lg">WorldClocked</span>
              </div>

              <div className="flex items-center space-x-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = pathname === tab.href;

                  return (
                    <Link
                      key={tab.id}
                      href={tab.enabled ? tab.href : '#'}
                      className={cn(
                        'flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors no-underline',
                        isActive
                          ? 'bg-accent text-accent-foreground'
                          : tab.enabled
                            ? 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                            : 'cursor-not-allowed text-muted-foreground/50'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                      {!tab.enabled && (
                        <Badge className="ml-1" variant="muted">
                          Soon
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            <AuthMenu />
          </div>
        </div>
      </nav>

      <main>{children}</main>
    </div>
  );
}
