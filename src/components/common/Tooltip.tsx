import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

const Tooltip = ({ children, content, side = 'top' }: TooltipProps) => {
  return (
    <TooltipPrimitive.Provider delayDuration={300}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={5}
            className="z-[1000] overflow-hidden rounded-lg glass border border-[#d4af37]/20 px-3 py-1.5 text-[11px] font-bold text-white shadow-xl animate-in fade-in zoom-in duration-200"
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-[#d4af37]/20" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};

export default Tooltip;
