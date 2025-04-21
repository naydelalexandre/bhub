import { useState, useEffect } from 'react';

/**
 * Hook para verificar se uma media query corresponde
 * @param query A media query a ser testada
 * @returns boolean indicando se a media query corresponde
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // Verificação inicial
    const media = window.matchMedia(query);
    setMatches(media.matches);

    // Função para atualizar o estado quando a media query mudar
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Adicionar listener
    media.addEventListener('change', listener);

    // Remover listener ao desmontar
    return () => {
      media.removeEventListener('change', listener);
    };
  }, [query]);

  return matches;
}

/**
 * Predefinições de media queries para facilitar o uso
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 639px)');
}

export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 640px) and (max-width: 1023px)');
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}

export function useIsDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

export function useIsReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
} 