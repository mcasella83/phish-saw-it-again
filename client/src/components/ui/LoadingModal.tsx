import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface LoadingModalProps {
  isOpen: boolean;
  current: number;
  total: number;
}

export function LoadingModal({ isOpen, current, total }: LoadingModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[425px] bg-opacity-90 backdrop-blur-lg">
        <div className="grid gap-4 py-4 place-items-center">
          <div className="text-xl font-semibold">
            Processing show {current} out of {total}
          </div>
          <div className="w-full bg-secondary rounded-full h-2.5">
            <div 
              className="bg-primary h-2.5 rounded-full transition-all duration-200" 
              style={{ width: `${(current / total) * 100}%` }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
