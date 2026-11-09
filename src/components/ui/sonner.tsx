import { Toaster as Sonner, type ToasterProps } from 'sonner';

import { useTheme } from '@/lib/theme';

function Toaster(props: ToasterProps) {
  const { theme } = useTheme();
  return (
    <Sonner
      theme={theme}
      position="bottom-center"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: '!rounded-full !border-border !bg-popover !font-mono !text-xs !text-popover-foreground !shadow-xl',
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
