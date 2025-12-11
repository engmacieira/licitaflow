import type { ReactNode } from 'react';

interface StickyFooterProps {
  children: ReactNode;
}

export function StickyFooter({ children }: StickyFooterProps) {
  return (
    <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 p-4 px-8 flex justify-between items-center z-40 transition-all shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {children}
    </div>
  );
}