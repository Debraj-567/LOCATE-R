import * as React from 'react';
import { type ToastProps } from '@/components/ui/toast';

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 4000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactElement;
};

// Action type constants (kept for documentation purposes)
const _actionTypes = {
  ADD_TOAST: 'ADD_TOAST',
  UPDATE_TOAST: 'UPDATE_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
} as const;
void _actionTypes;

let count = 0;
function genId() { return (++count).toString(); }

type Action =
  | { type: 'ADD_TOAST'; toast: ToasterToast }
  | { type: 'UPDATE_TOAST'; toast: Partial<ToasterToast> & { id: string } }
  | { type: 'DISMISS_TOAST'; toastId?: string }
  | { type: 'REMOVE_TOAST'; toastId?: string };

interface State { toasts: ToasterToast[] }

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

function addToRemoveQueue(toastId: string) {
  if (toastTimeouts.has(toastId)) return;
  toastTimeouts.set(toastId, setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({ type: 'REMOVE_TOAST', toastId });
  }, TOAST_REMOVE_DELAY));
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_TOAST':
      return { ...state, toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT) };
    case 'UPDATE_TOAST':
      return { ...state, toasts: state.toasts.map((t) => t.id === action.toast.id ? { ...t, ...action.toast } : t) };
    case 'DISMISS_TOAST': {
      const { toastId } = action;
      if (toastId) addToRemoveQueue(toastId);
      else state.toasts.forEach((t) => addToRemoveQueue(t.id));
      return { ...state, toasts: state.toasts.map((t) => t.id === toastId || toastId === undefined ? { ...t, open: false } : t) };
    }
    case 'REMOVE_TOAST':
      if (!action.toastId) return { ...state, toasts: [] };
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.toastId) };
  }
}

const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((l) => l(memoryState));
}

type Toast = Omit<ToasterToast, 'id'>;

function toast({ ...props }: Toast) {
  const id = genId();
  const update = (p: ToasterToast) => dispatch({ type: 'UPDATE_TOAST', toast: { ...p, id } });
  const dismiss = () => dispatch({ type: 'DISMISS_TOAST', toastId: id });
  dispatch({ type: 'ADD_TOAST', toast: { ...props, id, open: true, onOpenChange: (open) => { if (!open) dismiss(); } } });
  return { id, dismiss, update };
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState);
  React.useEffect(() => {
    listeners.push(setState);
    return () => { const idx = listeners.indexOf(setState); if (idx > -1) listeners.splice(idx, 1); };
  }, []);
  return { ...state, toast, dismiss: (id?: string) => dispatch({ type: 'DISMISS_TOAST', toastId: id }) };
}

export { useToast, toast };
