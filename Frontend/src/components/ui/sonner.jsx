import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner";
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"
import "sonner/dist/styles.css";

const Toaster = ({
  ...props
}) => {
  // Safe fallback to "light" theme if next-themes Provider is not wrapping the app
  let theme = "light";
  try {
    const themeContext = useTheme();
    if (themeContext && themeContext.theme) {
      theme = themeContext.theme;
    }
  } catch (e) {
    // next-themes is not configured, fallback to light
  }

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4 text-emerald-600" />
        ),
        info: (
          <InfoIcon className="size-4 text-blue-600" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4 text-amber-500" />
        ),
        error: (
          <OctagonXIcon className="size-4 text-rose-600" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin text-zinc-500" />
        ),
      }}
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-white group-[.toaster]:text-zinc-950 group-[.toaster]:border-zinc-200 group-[.toaster]:shadow-lg dark:group-[.toaster]:bg-zinc-900 dark:group-[.toaster]:text-zinc-50 dark:group-[.toaster]:border-zinc-800",
          description: "group-[.toast]:text-zinc-500 dark:group-[.toast]:text-zinc-400",
          actionButton: "group-[.toast]:bg-zinc-900 group-[.toast]:text-zinc-50 dark:group-[.toast]:bg-zinc-50 dark:group-[.toast]:text-zinc-900",
          cancelButton: "group-[.toast]:bg-zinc-100 group-[.toast]:text-zinc-500 dark:group-[.toast]:bg-zinc-800 dark:group-[.toast]:text-zinc-400",
        },
      }}
      {...props} />
  );
}

export { Toaster }
