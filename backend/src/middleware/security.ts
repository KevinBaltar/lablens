import { Request, Response, NextFunction } from "express";

function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true;
  if (origin.includes("localhost")) return true;
  if (origin === process.env.CORS_ORIGIN) return true;
  if (origin.endsWith(".vercel.app")) return true;
  if (process.env.VERCEL_URL && origin.endsWith(process.env.VERCEL_URL)) return true;
  return false;
}

export function verifyRequestOrigin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const origin = req.get("origin");
  if (origin && !isOriginAllowed(origin)) {
    return res
      .status(403)
      .json({ error: "Origem da requisição não autorizada" });
  }
  next();
}

// Sanitizar inputs contra XSS
export function sanitizeInput(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const sanitize = (obj: any): any => {
    if (typeof obj === "string") {
      return obj
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .replace(/\//g, "&#x2F;");
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (obj && typeof obj === "object") {
      return Object.keys(obj).reduce((acc, key) => {
        acc[key] = sanitize(obj[key]);
        return acc;
      }, {} as any);
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  if (req.params) {
    req.params = sanitize(req.params);
  }

  next();
}

// Headers de segurança adicionais
export function securityHeaders(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  // Prevenir clickjacking
  res.setHeader("X-Frame-Options", "DENY");

  // Prevenir MIME sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Habilitar XSS filter
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Prevenir cache de dados sensíveis
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  // Referrer Policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  next();
}

// Log de segurança para rotas sensíveis
export function securityLogger(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const sensitivePaths = [
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/forgot-password",
  ];

  if (sensitivePaths.includes(req.path)) {
    console.log(
      `[SECURITY] ${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`,
    );
  }

  next();
}
