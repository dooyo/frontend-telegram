import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUnreadCount } from '@/lib/api/notifications';

export const useNotifications = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: getUnreadCount,
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  const openNotifications = () => setIsOpen(true);
  const closeNotifications = () => setIsOpen(false);

  return {
    isOpen,
    unreadCount,
    openNotifications,
    closeNotifications,
    onOpenChange: setIsOpen
  };
};
