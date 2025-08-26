'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface CategoryViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: any | null;
}

export function CategoryViewModal({
  isOpen,
  onClose,
  category,
}: CategoryViewModalProps) {
  if (!category) return null;
  const iconMap: Record<string, string> = {
    folder: '📁',
    utensils: '🍽️',
    zap: '⚡',
    'graduation-cap': '🎓',
    car: '🚗',
    heart: '❤️',
    'gamepad-2': '🎮',
    'shopping-bag': '🛍️',
    home: '🏠',
    wifi: '📶',
    phone: '📱',
    gift: '🎁',
    coffee: '☕',
    book: '📚',
    plane: '✈️',
    dumbbell: '💪',
    music: '🎵',
    camera: '📷',
    briefcase: '💼',
    'more-horizontal': '📝',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Detail Kategori</DialogTitle>
          <DialogDescription>Informasi kategori terpilih.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
              style={{ backgroundColor: category.color }}
              aria-hidden
            >
              {iconMap[category.icon as keyof typeof iconMap] || '📁'}
            </div>
            <div>
              <div className="text-lg font-semibold">{category.name}</div>
              <div className="text-xs text-gray-500">{category.id}</div>
            </div>
          </div>

          <div className="grid gap-1">
            <Label>Jenis</Label>
            <Badge variant="secondary">{category.type}</Badge>
          </div>

          {category.description && (
            <div className="grid gap-1">
              <Label>Deskripsi</Label>
              <div className="text-sm text-gray-700">
                {category.description}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
