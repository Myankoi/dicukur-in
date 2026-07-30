import { UserConfigFn } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { overrideVaadinConfig } from './vite.generated';

const customConfig: UserConfigFn = () => ({
  plugins: [tailwindcss()],
});

export default overrideVaadinConfig(customConfig);
