'use client';

import { Button } from './Button';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  destructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  loading,
  destructive = true,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={destructive ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-4">
        <div
          className={
            destructive
              ? 'grid size-11 shrink-0 place-items-center rounded-full bg-danger-50 text-danger-700'
              : 'grid size-11 shrink-0 place-items-center rounded-full bg-clay-50 text-clay-700'
          }
        >
          <AlertTriangle className="size-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-ink-900">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-ink-600">{description}</p>
        </div>
      </div>
    </Modal>
  );
}
