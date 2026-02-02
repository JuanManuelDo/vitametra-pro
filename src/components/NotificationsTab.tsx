import React, { useState, useEffect } from 'react';
import type { Reminder } from '../types';
import { requestNotificationPermission } from '../utils/notifications';
import { BellIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from './Icons';

interface NotificationsTabProps {
  reminders: Reminder[];
  onAddReminder: (time: string, message: string) => void;
  onDeleteReminder: (id: string) => void;
}

const NotificationsTab: React.FC<NotificationsTabProps> = ({ reminders, onAddReminder, onDeleteReminder }) => {
  const [permission, setPermission] = useState<NotificationPermission>(Notification.permission);
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    // Check permission on component mount
    setPermission(Notification.permission);
  }, []);

  const handleRequestPermission = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (time && message && permission === 'granted') {
      onAddReminder(time, message);
      setTime('');
      setMessage('');
    } else if (permission !== 'granted') {
        alert('Por favor, habilita las notificaciones para poder crear un recordatorio.');
    }
  };
  
  const getPermissionStatus = () => {
      switch (permission) {
          case 'granted':
              return {
                  text: 'Las notificaciones están activadas.',
                  Icon: CheckCircleIcon,
                  color: 'text-brand-secondary',
                  bgColor: 'bg-green-50',
                  borderColor: 'border-green-300'
              };
          case 'denied':
              return {
                  text: 'Has bloqueado las notificaciones. Debes habilitarlas en la configuración de tu navegador.',
                  Icon: XCircleIcon,
                  color: 'text-red-600',
                  bgColor: 'bg-red-50',
                  borderColor: 'border-red-300'
              };
          default:
              return {
                  text: 'Permite las notificaciones para recibir recordatorios importantes.',
                  Icon: BellIcon,
                  color: 'text-slate-600',
                  bgColor: 'bg-slate-100',
                  borderColor: 'border-slate-300'
              };
      }
  };
  
  const status = getPermissionStatus();

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-brand-primary mb-6 text-center">Gestión de Recordatorios</h1>
      
      {/* Permission Status */}
      <div className={`p-4 mb-8 rounded-lg border flex items-center ${status.bgColor} ${status.borderColor}`}>
          <status.Icon className={`w-8 h-8 mr-4 flex-shrink-0 ${status.color}`} />
          <div className="flex-grow">
              <p className={`font-semibold ${status.color}`}>{status.text}</p>
          </div>
          {permission === 'default' && (
              <button
                  onClick={handleRequestPermission}
                  className="ml-4 px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-dark transition-colors text-sm flex-shrink-0"
              >
                  Habilitar
              </button>
          )}
      </div>

      {/* New Reminder Form */}
      <div className="bg-brand-surface p-6 rounded-xl shadow-lg border border-gray-200 mb-8">
        <h2 className="text-xl font-semibold text-slate-700 mb-4">Programar Nuevo Recordatorio</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <label htmlFor="message" className="block text-sm font-medium text-slate-600 mb-2">Mensaje</label>
            <input
              id="message"
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ej: Tomar Metformina 500mg"
              className="w-full p-3 bg-slate-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary"
              required
            />
          </div>
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-slate-600 mb-2">Hora</label>
            <input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary"
              required
            />
          </div>
          <div className="md:col-span-3">
              <button
                type="submit"
                disabled={permission !== 'granted'}
                className="w-full bg-brand-secondary hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                Programar Recordatorio
              </button>
          </div>
        </form>
      </div>

      {/* List of Reminders */}
      <div>
        <h2 className="text-xl font-semibold text-slate-700 mb-4">Recordatorios Activos</h2>
        {reminders.length > 0 ? (
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="bg-brand-surface p-4 rounded-lg shadow-md border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-mono text-lg text-brand-primary font-bold">{reminder.time}</p>
                  <p className="text-slate-600">{reminder.message}</p>
                </div>
                <button 
                    onClick={() => onDeleteReminder(reminder.id)} 
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="Eliminar recordatorio"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center bg-brand-surface p-8 rounded-lg">
            <h3 className="text-xl font-semibold text-slate-700">Sin Recordatorios Programados</h3>
            <p className="text-slate-500 mt-2">Usa el formulario de arriba para crear tu primer recordatorio.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsTab;