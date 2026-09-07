import '../css/app.css';
import '@fontsource-variable/dm-sans';
import '@fontsource-variable/outfit';
import { createInertiaApp, type ResolvedComponent } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { Toaster } from './components/ui/sonner';

createInertiaApp({
  title: (title) => `${title} · Sistem Anggota IPNU IPPNU`,
  resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob<ResolvedComponent>('./pages/**/*.tsx', { import: 'default' })),
  setup({ el, App, props }) {
    createRoot(el).render(
      <>
        <App {...props} />
        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={5000}
        />
      </>
    );
  },
  progress: { color: '#146949', showSpinner: false },
});
