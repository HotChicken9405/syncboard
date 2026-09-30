import { useContext } from 'react';
import { NotificationContext } from './NotificationContext.js';

export function useNotifications() {
  return useContext(NotificationContext);
}