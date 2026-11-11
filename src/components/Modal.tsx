import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { ModalState, Student } from '../types/portal';
import { formatRupees, isValidUpi } from '../utils/portal';

interface ModalProps {
  modal: ModalState;
  student: Student | undefined;
  onClose: () => void;
  onConfirmPayment: (feeId: number) => void;
  onToast: (message: string) => void;
}

export function Modal({
  modal,
  student,
  onClose,
  onConfirmPayment,
  onToast,
}: ModalProps) {
  const [upiId, setUpiId] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUpiId('');
    setIsPaying(false);
  }, [modal]);

  useEffect(() => {
    if (!modal) return;
    if (modal.type === 'pay') {
      inputRef.current?.focus();
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modal, onClose]);

  if (!modal || !student) return null;

  const fee = student.fees.find((item) => item.id === modal.feeId);
  if (!fee) return null;

  const handlePaySubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!isValidUpi(upiId)) {
      onToast('Enter a valid UPI ID');
      return;
    }
    setIsPaying(true);
    window.setTimeout(() => {
      setIsPaying(false);
      onConfirmPayment(fee.id);
    }, 150);
  };

  return (
    <div
      id="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isPaying) {
          onClose();
        }
      }}
    >
      <div>
        {modal.type === 'pay' ? (
          <form onSubmit={handlePaySubmit}>
            <h3 id="modal-title">Payment gateway (demo)</h3>
            <p>
              {fee.n} – <b>{formatRupees(fee.a)}</b>
            </p>
            <label htmlFor="up">UPI ID</label>
            <input
              ref={inputRef}
              id="up"
              value={upiId}
              onChange={(event) => setUpiId(event.target.value)}
              placeholder="name@bank"
              autoComplete="off"
              disabled={isPaying}
            />
            <div className="actions-row">
              <button type="submit" disabled={isPaying}>
                {isPaying ? 'Processing…' : `Pay ${formatRupees(fee.a)}`}
              </button>
              <button
                type="button"
                className="ghost"
                onClick={onClose}
                disabled={isPaying}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div>
            <h3 id="modal-title">Receipt #VS-{1000 + fee.id}</h3>
            <p>
              {student.n} ({student.dept})
              <br />
              {fee.n}: <b>{formatRupees(fee.a)}</b>
              <br />
              Status: Paid
            </p>
            <div className="actions-row no-print">
              <button type="button" onClick={() => window.print()}>
                Print
              </button>
              <button type="button" className="ghost" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
