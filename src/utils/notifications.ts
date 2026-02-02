import type { Reminder } from '../types';

const REMINDERS_STORAGE_KEY = 'vitametra_reminders';

// Helper to get reminders from localStorage
const getSavedReminders = (): Reminder[] => {
  try {
    const saved = localStorage.getItem(REMINDERS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Could not parse reminders from localStorage", error);
    return [];
  }
};

// Helper to save reminders to localStorage
const saveReminders = (reminders: Reminder[]) => {
  try {
    localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders));
  } catch (error) {
    console.error("Could not save reminders to localStorage", error);
  }
};

// Function to show the notification via the Service Worker
const showNotification = (message: string) => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
        navigator.serviceWorker.ready.then(registration => {
            // FIX: Removed the 'vibrate' property from NotificationOptions as it is not a standard property and causes a TypeScript error.
            registration.showNotification('Recordatorio de VitaMetra', {
                body: message,
                icon: '/logo.png',
                badge: '/logo.png',
            });
        });
    }
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    alert('Este navegador no soporta notificaciones de escritorio.');
    return 'denied';
  }
  return Notification.requestPermission();
};

export const scheduleNotification = (time: string, message: string): Reminder | null => {
  if (!time || !message) return null;

  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const notificationTime = new Date();
  notificationTime.setHours(hours, minutes, 0, 0);

  // If the time is in the past, schedule it for the next day
  if (notificationTime.getTime() < now.getTime()) {
    notificationTime.setDate(notificationTime.getDate() + 1);
  }

  const delay = notificationTime.getTime() - now.getTime();
  
  const timeoutId = window.setTimeout(() => {
    showNotification(message);
    // Remove the reminder once it has fired
    cancelNotification(newReminder.id);
  }, delay);

  const newReminder: Reminder = {
    id: `reminder_${Date.now()}`,
    time,
    message,
    timeoutId,
  };

  const reminders = getSavedReminders();
  saveReminders([...reminders, newReminder]);

  return newReminder;
};

export const cancelNotification = (id: string) => {
  const reminders = getSavedReminders();
  const reminderToCancel = reminders.find(r => r.id === id);
  if (reminderToCancel && reminderToCancel.timeoutId) {
    clearTimeout(reminderToCancel.timeoutId);
  }
  const updatedReminders = reminders.filter(r => r.id !== id);
  saveReminders(updatedReminders);
};


export const rescheduleSavedNotifications = (): Reminder[] => {
  const reminders = getSavedReminders();
  const rescheduledReminders: Reminder[] = [];

  reminders.forEach(reminder => {
    // Clear any potentially lingering timeout from a previous session
    if (reminder.timeoutId) {
      clearTimeout(reminder.timeoutId);
    }

    const rescheduled = scheduleNotification(reminder.time, reminder.message);
    if(rescheduled) {
        rescheduledReminders.push(rescheduled);
    }
  });
  
  // Clean and save the newly rescheduled reminders with their new timeout IDs
  saveReminders(rescheduledReminders);
  
  return rescheduledReminders.sort((a, b) => a.time.localeCompare(b.time));
};
