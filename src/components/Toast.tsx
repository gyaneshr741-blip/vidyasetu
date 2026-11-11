interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  if (!message) return null;

  return (
    <div id="toast" role="status" aria-live="polite">
      {message}
    </div>
  );
}
