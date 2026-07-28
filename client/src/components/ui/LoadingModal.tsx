import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface LoadingModalProps {
  isOpen: boolean;
  current: number;
  total: number;
  currentShowDate?: string;
  currentShowVenue?: string;
}

export function LoadingModal({ 
  isOpen, 
  current, 
  total, 
  currentShowDate,
  currentShowVenue 
}: LoadingModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[425px] bg-opacity-90 backdrop-blur-lg">
        <DialogTitle>Loading Shows</DialogTitle>
        <div className="grid gap-4 py-4 place-items-center">
          <div className="text-xl font-semibold">
            {total === 0
              ? "Fetching your show list…"
              : `Processing show ${current} out of ${total}`}
          </div>
          {currentShowDate && currentShowVenue && (
            <div className="text-sm text-muted-foreground text-center">
              <p>Date: {new Date(currentShowDate).toLocaleDateString()}</p>
              <p>Venue: {currentShowVenue}</p>
            </div>
          )}
          <div className="w-full bg-secondary rounded-full h-2.5">
            <div 
              className="bg-primary h-2.5 rounded-full transition-all duration-200" 
              style={{ width: total === 0 ? 0 : `${(current / total) * 100}%` }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}