"use client";

import { useEffect, useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

// Componente para manejar los atributos del HTML con el tema, evitando hidration mismatch
function HTMLWithTheme({ children, geistSans, geistMono }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.documentElement.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  // Evitar hidration mismatch esperando a que el componente se monte
  if (!mounted) {
    return (
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning={true}>
          {children}
        </body>
      </html>
    );
  }

  return (
    <html lang="en" data-theme={resolvedTheme}>
      <body 
        className={`${geistSans.variable} ${geistMono.variable}`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}

export default HTMLWithTheme;
