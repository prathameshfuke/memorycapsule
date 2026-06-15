import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
}

export default function PageWrapper({ children, className = '' }: PageWrapperProps) {
  const isDark = className.includes('color-ink');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`app-page ${isDark ? 'app-page-dark' : ''} ${className}`}
      style={{ width: '100%', minHeight: '100dvh', paddingBottom: '96px' }}
    >
      {children}
    </motion.div>
  );
}
