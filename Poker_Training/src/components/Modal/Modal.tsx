import React, { useEffect } from 'react';
import styles from './Modal.module.scss';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: ModalSize;
  showHeader?: boolean;
  showFooter?: boolean;
  showCloseButton?: boolean;
  footerContent?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  showHeader = true,
  showFooter = true,
  showCloseButton = true,
  footerContent,
  className,
  contentClassName
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const sizeClass = styles[`size${size.charAt(0).toUpperCase()}${size.slice(1)}`];

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={`${styles.modal} ${sizeClass} ${className || ''}`}>
        {showHeader && (
          <div className={styles.header}>
            <h2 className={styles.title}>{title || ''}</h2>
            {showCloseButton && (
              <button className={styles.closeButton} onClick={onClose}>
                ×
              </button>
            )}
          </div>
        )}

        {!showHeader && showCloseButton && (
          <button className={styles.closeButtonAbsolute} onClick={onClose}>
            ×
          </button>
        )}

        <div className={`${styles.content} ${contentClassName || ''}`}>
          {children}
        </div>

        {showFooter && (
          <div className={styles.footer}>
            {footerContent || (
              <button className={styles.closeFooterButton} onClick={onClose}>
                Close
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
