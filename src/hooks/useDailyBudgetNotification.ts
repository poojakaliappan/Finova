import { useEffect, useRef } from 'react';

export interface UseDailyBudgetOptions {
  todaySpent: number;
  dailyLimit: number;
  currency?: string;
  onAlertTriggered?: (title: string, message: string) => void;
}

/**
 * Custom hook that compares `todaySpent` against `dailyLimit`
 * and triggers a browser Notification (and callback) when user exceeds 80% of daily budget.
 */
export function useDailyBudgetNotification({
  todaySpent,
  dailyLimit,
  currency = '₹',
  onAlertTriggered,
}: UseDailyBudgetOptions) {
  const hasNotifiedRef = useRef<boolean>(false);
  const todayDateStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!dailyLimit || dailyLimit <= 0) return;

    const ratio = todaySpent / dailyLimit;
    const isExceeded80Percent = ratio >= 0.8;

    // Reset notification flag if new day or if spent goes back down
    const lastNotifiedDay = localStorage.getItem('finova_last_alert_day');
    if (lastNotifiedDay !== todayDateStr) {
      hasNotifiedRef.current = false;
    }

    if (isExceeded80Percent && !hasNotifiedRef.current) {
      hasNotifiedRef.current = true;
      localStorage.setItem('finova_last_alert_day', todayDateStr);

      const percentStr = Math.round(ratio * 100);
      const title = '⚠️ Daily Budget Alert (FINOVA)';
      const message = `You have spent ${currency}${todaySpent} today, which is ${percentStr}% of your ${currency}${dailyLimit} daily budget limit!`;

      // Call UI callback if provided
      if (onAlertTriggered) {
        onAlertTriggered(title, message);
      }

      // Trigger Web Browser Notification API if supported & granted
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          try {
            new Notification(title, {
              body: message,
              icon: '/favicon.ico',
              tag: 'daily-budget-alert',
            });
          } catch (e) {
            console.error('Notification error:', e);
          }
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
              try {
                new Notification(title, {
                  body: message,
                  icon: '/favicon.ico',
                  tag: 'daily-budget-alert',
                });
              } catch (e) {
                console.error('Notification error:', e);
              }
            }
          });
        }
      }
    }
  }, [todaySpent, dailyLimit, currency, onAlertTriggered, todayDateStr]);
}
