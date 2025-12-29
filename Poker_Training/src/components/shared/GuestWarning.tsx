import React from 'react';
import styles from './GuestWarning.module.scss';

interface GuestWarningProps {
  message?: string;
}

export const GuestWarning: React.FC<GuestWarningProps> = ({
  message = 'Sign in to save your progress and track improvement over time'
}) => {
  return (
    <div className={styles.warning}>
      {message}
    </div>
  );
};
