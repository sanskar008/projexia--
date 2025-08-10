import {
  type ToastActionElement,
  ToastProvider as ToastProviderPrimitive,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
} from "../components/ui/toast";

import { createContext, useContext, useState } from "react";

export interface ToastProps {
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: "default" | "destructive";
  duration?: number;
  className?: string;
  [key: string]: any;
}

interface ToastContextType {
  toasts: ToastProps[];
  addToast: (props: ToastProps) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (props: ToastProps) => {
    const id = props.id || String(Math.random());
    setToasts((prev) => [...prev, { ...props, id }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export const toast = (props: ToastProps) => {
  const { addToast } = useToast();
  addToast(props);
};
