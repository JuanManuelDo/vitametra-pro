import Swal from 'sweetalert2';

export const showToast = (title: string, icon: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    return Swal.fire({
        title,
        icon,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: '#0f172a', // slate-900
        color: '#fff',
        iconColor: icon === 'error' ? '#f43f5e' : icon === 'success' ? '#10b981' : '#3b82f6',
        customClass: {
            popup: 'rounded-2xl shadow-2xl border border-slate-700'
        }
    });
};

export const showAlert = (title: string, text: string, icon: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    return Swal.fire({
        title,
        text,
        icon,
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#2563eb', // blue-600
        background: '#ffffff',
        color: '#0f172a',
        customClass: {
            popup: 'rounded-[2rem] shadow-2xl shadow-blue-900/10 border border-slate-100',
            confirmButton: 'px-6 py-3 rounded-xl font-[1000] uppercase tracking-widest text-xs',
            title: 'font-[1000] tracking-tighter text-2xl',
        }
    });
};
