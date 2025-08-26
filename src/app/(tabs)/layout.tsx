'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Clock, ArrowRightLeft, Users, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const tabs = [
  { 
    id: 'clocks', 
    label: 'Clocks', 
    icon: Clock, 
    href: '/clocks',
    enabled: true 
  },
  { 
    id: 'convert', 
    label: 'Convert', 
    icon: ArrowRightLeft, 
    href: '/convert',
    enabled: true 
  },
  { 
    id: 'overlap', 
    label: 'Overlap', 
    icon: Users, 
    href: '/overlap',
    enabled: true 
  },
  { 
    id: 'planner', 
    label: 'Planner', 
    icon: Calendar, 
    href: '/planner',
    enabled: false 
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
      {/* Tab Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-14 items-center space-x-4 lg:space-x-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-6 w-6" />
              <span className="font-bold text-lg">WorldClocked</span>
            </div>
            
            <div className="flex flex-1 items-center space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = pathname === tab.href;
                
                return (
                  <Link
                    key={tab.id}
                    href={tab.enabled ? tab.href : '#'}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors no-underline",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : tab.enabled
                        ? "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                        : "text-muted-foreground/50 cursor-not-allowed"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                    {!tab.enabled && (
                      <Badge className="ml-1" variant="muted">Soon</Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Page Content */}
      <main>{children}</main>
    </div>
  );
}
