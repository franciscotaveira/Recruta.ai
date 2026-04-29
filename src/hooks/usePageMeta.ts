import { useEffect } from 'react';

type PageMetaInput = {
  title: string;
  description: string;
};

export function usePageMeta({ title, description }: PageMetaInput) {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const previousTitle = document.title;
    document.title = title;

    let meta = document.querySelector('meta[name="description"]');
    let created = false;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
      created = true;
    }

    const previousDescription = meta.getAttribute('content');
    meta.setAttribute('content', description);

    return () => {
      document.title = previousTitle;
      if (!meta) return;
      if (created) {
        meta.remove();
        return;
      }
      if (previousDescription !== null) {
        meta.setAttribute('content', previousDescription);
      }
    };
  }, [description, title]);
}
