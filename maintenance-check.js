// maintenance-check.js
console.log('🔧 Maintenance Check загружен');

const MAINTENANCE = {
    STORAGE_KEY: 'gepard_maintenance_v3',
    ADMIN_KEY: 'gepard2026',
    
    // Проверка админа
    isAdmin: function() {
        // 1. Проверка по URL параметру
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('admin') === this.ADMIN_KEY) {
            localStorage.setItem('gepard_is_admin', 'true');
            return true;
        }
        
        // 2. Проверка по localStorage
        if (localStorage.getItem('gepard_is_admin') === 'true' || 
            localStorage.getItem('gepard_beta_admin_2026') === 'true') {
            return true;
        }
        
        return false;
    },
    
    // Получение данных техработ
    getData: function() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    },
    
    // Проверка активности техработ
    isActive: function() {
        const data = this.getData();
        if (!data || !data.active) return false;
        
        // Проверяем таймер
        if (data.endTime) {
            const now = new Date();
            const end = new Date(data.endTime);
            if (now >= end) {
                // Время вышло
                localStorage.removeItem(this.STORAGE_KEY);
                return false;
            }
        }
        
        return true;
    },
    
    // Активация техработ
    activate: function(hours = 1, minutes = 0, message = 'Технические работы') {
        const totalMinutes = (hours * 60) + minutes;
        const endTime = new Date(Date.now() + totalMinutes * 60000);
        
        const data = {
            active: true,
            endTime: endTime.toISOString(),
            message: message,
            activatedAt: new Date().toISOString(),
            duration: totalMinutes
        };
        
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        console.log(`🚧 Техработы активированы на ${hours}ч ${minutes}мин`);
        return data;
    },
    
    // Деактивация техработ
    deactivate: function() {
        localStorage.removeItem(this.STORAGE_KEY);
        console.log('✅ Техработы деактивированы');
    },
    
    // Проверка и перенаправление
    checkRedirect: function() {
        // Если админ - не перенаправляем
        if (this.isAdmin()) {
            console.log('👑 Админ обнаружен, пропускаю проверку');
            return false;
        }
        
        // Если техработы активны
        if (this.isActive()) {
            const currentPage = window.location.pathname;
            const isMaintenancePage = currentPage.includes('maintenance.html');
            const isEmergencyPage = currentPage.includes('emergency-access.html');
            const isAdminPage = currentPage.includes('admin-maintenance.html');
            
            if (!isMaintenancePage && !isEmergencyPage && !isAdminPage) {
                console.log('🚧 Перенаправляю на заглушку...');
                window.location.href = 'maintenance.html';
                return true;
            }
        }
        
        return false;
    },
    
    // Отладка
    debug: function() {
        console.log('=== MAINTENANCE DEBUG ===');
        console.log('Админ:', this.isAdmin() ? 'ДА' : 'НЕТ');
        console.log('Активны:', this.isActive() ? 'ДА' : 'НЕТ');
        console.log('Данные:', this.getData());
        console.log('========================');
    }
};

// Экспорт
window.MAINTENANCE = MAINTENANCE;

// Автопроверка при загрузке
if (typeof window !== 'undefined' && window.location) {
    setTimeout(() => {
        MAINTENANCE.checkRedirect();
    }, 100);
}
