// check-maintenance.js
(function() {
    // Проверяем админа
    const isAdmin = localStorage.getItem('gepard_is_admin') === 'true' || 
                   new URLSearchParams(window.location.search).get('admin') === 'gepard2026';
    
    if (isAdmin) return;
    
    // Проверяем техработы
    const isActive = localStorage.getItem('maintenanceActive') === 'true';
    const endTime = localStorage.getItem('maintenanceEndTime');
    
    if (!isActive) return;
    
    // Проверяем таймер
    if (endTime) {
        const now = new Date();
        const target = new Date(endTime);
        if (now >= target) {
            localStorage.removeItem('maintenanceActive');
            localStorage.removeItem('maintenanceEndTime');
            return;
        }
    }
    
    // Перенаправляем
    if (!window.location.pathname.includes('maintenance.html')) {
        window.location.href = 'maintenance.html';
    }
})();
