import { useEffect, useRef, type ReactNode } from 'react';
import { Icon } from './Icon';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Feuille ancrée en bas de l'écran (pièces, indices) ou boîte centrée (confirmation). */
  variant?: 'sheet' | 'center';
  actions?: ReactNode;
}

/** Fenêtre modale accessible basée sur l'élément natif <dialog>. */
export function Dialog({ open, onClose, title, children, variant = 'center', actions }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={`dialog dialog-${variant}`}
      aria-labelledby="dialog-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      {open && (
        <div className="dialog-body">
          <header className="dialog-header">
            <h2 id="dialog-title">{title}</h2>
            <button type="button" className="icon-button" onClick={onClose} aria-label="Fermer">
              <Icon name="close" />
            </button>
          </header>
          <div className="dialog-content">{children}</div>
          {actions && <footer className="dialog-actions">{actions}</footer>}
        </div>
      )}
    </dialog>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  danger,
}: {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title={title}
      actions={
        <>
          <button type="button" className="button button-ghost" onClick={onCancel}>
            Annuler
          </button>
          <button type="button" className={danger ? 'button button-danger' : 'button button-primary'} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="dialog-message">{message}</div>
    </Dialog>
  );
}
