'use client';

import { cn } from "@/lib/utils";

interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  era: string;
  year: number;
  isActive?: boolean;
}

export function TimeTravelTheme({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative min-h-screen bg-gradient-to-b from-[#1a0f2e] to-[#2d1b4e]",
        "before:absolute before:inset-0 before:bg-[url('/gears-pattern.svg')] before:opacity-10",
        "overflow-hidden",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(98,0,255,0.1),transparent_70%)]" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function TimelineIndicator({ era, year, isActive, className, ...props }: TimelineProps) {
  return (
    <div
      className={cn(
        "relative flex items-center gap-4 p-4 rounded-lg",
        "border border-amber-600/30 bg-black/40 backdrop-blur-sm",
        "transition-all duration-300",
        isActive && "border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]",
        className
      )}
      {...props}
    >
      <div className="flex flex-col">
        <span className="text-amber-400 font-bold">{era}</span>
        <span className="text-amber-200/80 text-sm">{year}</span>
      </div>
      {isActive && (
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4">
          <div className="absolute inset-0 animate-ping rounded-full bg-amber-400/70" />
          <div className="absolute inset-0.5 rounded-full bg-amber-400" />
        </div>
      )}
    </div>
  );
} 
