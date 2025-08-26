'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';

interface WalletTransferViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  transfer: any | null;
}

export function WalletTransferViewModal({
  isOpen,
  onClose,
  transfer,
}: WalletTransferViewModalProps) {
  if (!transfer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Detail Transfer Dompet</DialogTitle>
          <DialogDescription>
            Informasi lengkap transfer antar dompet
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{transfer.title}</h3>
              {transfer.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {transfer.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Dari Dompet
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: transfer.from_wallet?.color || '#6B7280',
                    }}
                  />
                  <span className="font-medium">
                    {transfer.from_wallet?.name || 'Unknown'}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Ke Dompet
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: transfer.to_wallet?.color || '#6B7280',
                    }}
                  />
                  <span className="font-medium">
                    {transfer.to_wallet?.name || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Jumlah Transfer
                </label>
                <p className="text-lg font-bold text-blue-600 mt-1">
                  {formatCurrency(transfer.amount)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Tanggal Transfer
                </label>
                <p className="font-medium mt-1">
                  {formatDate(transfer.transfer_date)}
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Grup</label>
              <div className="mt-1">
                <Badge variant="secondary">
                  {transfer.groups?.name || 'Tidak ada grup'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Tutup</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
