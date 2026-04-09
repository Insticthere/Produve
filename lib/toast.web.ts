import toast from 'react-hot-toast';

type ToastKind = 'success' | 'error' | 'loading';

export function showToast(message: string, kind: ToastKind = 'success') {
  if (kind === 'error') {
    toast.error(message);
    return;
  }
  if (kind === 'loading') {
    toast.loading(message);
    return;
  }
  toast.success(message);
}

