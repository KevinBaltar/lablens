import type { SVGProps } from "react";

export type IconName =
  | "orders"
  | "add"
  | "clients"
  | "establishments"
  | "contacts"
  | "priceTable"
  | "lens"
  | "branch"
  | "user"
  | "lock"
  | "logout"
  | "bell"
  | "menu"
  | "sparkles"
  | "mail"
  | "download"
  | "delete"
  | "upload"
  | "refresh"
  | "print"
  | "check"
  | "close"
  | "edit";

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
}

function IconBase(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    />
  );
}

export default function Icon({ name, ...props }: IconProps) {
  switch (name) {
    case "orders":
      return (
        <IconBase {...props}>
          <path d="M8 3h8" />
          <path d="M5 7h14" />
          <rect x="4" y="7" width="16" height="13" rx="2" />
          <path d="M9 11h6" />
          <path d="M9 15h4" />
        </IconBase>
      );
    case "add":
      return (
        <IconBase {...props}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </IconBase>
      );
    case "clients":
      return (
        <IconBase {...props}>
          <path d="M16 19a4 4 0 0 0-8 0" />
          <circle cx="12" cy="9" r="3" />
          <path d="M19 19a3 3 0 0 0-2.5-2.9" />
          <path d="M7.5 16.1A3 3 0 0 0 5 19" />
        </IconBase>
      );
    case "establishments":
      return (
        <IconBase {...props}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M8 4v16" />
          <path d="M16 4v16" />
          <path d="M4 10h16" />
          <path d="M4 16h16" />
        </IconBase>
      );
    case "contacts":
      return (
        <IconBase {...props}>
          <path d="M5 6h14" />
          <path d="M5 12h14" />
          <path d="M5 18h8" />
          <path d="M17 18h2" />
          <circle cx="18" cy="18" r="2" />
        </IconBase>
      );
    case "priceTable":
      return (
        <IconBase {...props}>
          <path d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7" />
          <path d="M5 4h2" />
          <path d="M5 20h2" />
          <path d="M8 8h8" />
          <path d="M8 12h8" />
          <path d="M8 16h5" />
        </IconBase>
      );
    case "lens":
      return (
        <IconBase {...props}>
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="3" />
          <path d="M5 5l3 3" />
          <path d="M19 19l-3-3" />
        </IconBase>
      );
    case "branch":
      return (
        <IconBase {...props}>
          <path d="M7 6h10" />
          <path d="M7 18h10" />
          <path d="M9 6v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V6" />
          <path d="M12 14v4" />
        </IconBase>
      );
    case "user":
      return (
        <IconBase {...props}>
          <circle cx="12" cy="8" r="3" />
          <path d="M5 19a7 7 0 0 1 14 0" />
        </IconBase>
      );
    case "lock":
      return (
        <IconBase {...props}>
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </IconBase>
      );
    case "logout":
      return (
        <IconBase {...props}>
          <path d="M9 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-2" />
          <path d="M15 12H4" />
          <path d="m7 9 3 3-3 3" />
        </IconBase>
      );
    case "bell":
      return (
        <IconBase {...props}>
          <path d="M15 17H5" />
          <path d="M15 17a3 3 0 0 0 3-3V9a6 6 0 1 0-12 0v5a3 3 0 0 0 3 3" />
          <path d="M10 19a2 2 0 0 0 4 0" />
        </IconBase>
      );
    case "menu":
      return (
        <IconBase {...props}>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </IconBase>
      );
    case "sparkles":
      return (
        <IconBase {...props}>
          <path d="M12 3l1.2 4.8L18 9l-4.8 1.2L12 15l-1.2-4.8L6 9l4.8-1.2L12 3z" />
          <path d="M19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15z" />
          <path d="M5 15l.7 2.3L8 18l-2.3.7L5 21l-.7-2.3L2 18l2.3-.7L5 15z" />
        </IconBase>
      );
    case "mail":
      return (
        <IconBase {...props}>
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </IconBase>
      );
    case "download":
      return (
        <IconBase {...props}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" x2="12" y1="15" y2="3" />
        </IconBase>
      );
    case "delete":
      return (
        <IconBase {...props}>
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </IconBase>
      );
    case "upload":
      return (
        <IconBase {...props}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" x2="12" y1="3" y2="15" />
        </IconBase>
      );
    case "refresh":
      return (
        <IconBase {...props}>
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
          <path d="M21 21v-5h-5" />
        </IconBase>
      );
    case "print":
      return (
        <IconBase {...props}>
          <polyline points="6 9 6 2 18 2 18 9" />
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
          <rect x="6" y="14" width="12" height="8" />
        </IconBase>
      );
    case "check":
      return (
        <IconBase {...props}>
          <polyline points="20 6 9 17 4 12" />
        </IconBase>
      );
    case "close":
      return (
        <IconBase {...props}>
          <line x1="18" x2="6" y1="6" y2="18" />
          <line x1="6" x2="18" y1="6" y2="18" />
        </IconBase>
      );
    case "edit":
      return (
        <IconBase {...props}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </IconBase>
      );
    default:
      return null;
  }
}
