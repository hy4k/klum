"use client";
import dynamic from "next/dynamic";  // Import dynamic from Next.js
import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

// Disable SSR for this component
const Toaster = dynamic(() => import("@/components/ui/toaster"), { ssr: false });

export default function MyComponent() {
  const { toasts } = useToast();

  return (
    <div>
      <Toaster />
      <ToastProvider>
        {toasts.map(({ id, title, description, action, ...props }) => (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    </div>
  );
}
