// maintenance-check.js
(function() {
    'use strict';
    
    console.log('🔧 Проверка техработ...');
    
    // Проверяем активны ли техработы
    const isMaintenanceActive = localStorage.getItem('maintenanceActive') === 'true';
    const endTime = localStorage.getItem('maintenanceEndTime');
    
    if (isMaintenanceActive && endTime) {
        // Проверяем не истекло ли время
        const now = new Date();
        const target = new Date(endTime);
        
        if (now >= target) {
            // Время вышло - очищаем
            localStorage.removeItem('maintenanceActive');
            localStorage.removeItem('maintenanceEndTime');
            console.log('⏰ Время техработ истекло, очищаем...');
        } else {
            // Техработы активны - перенаправляем
            console.log('🚧 Техработы активны, перенаправляю...');
            window.location.href = 'maintenance.html';
        }
    } else if (isMaintenanceActive && !endTime) {
        // Техработы без таймера
        console.log('🚧 Техработы активны (без таймера), перенаправляю...');
        window.location.href = 'maintenance.html';
    } else {
        console.log('✅ Техработы не активны, сайт доступен');
    }
    
    // Функция для быстрого включения/выключения (для консоли)
    window.toggleMaintenance = function(minutes = 60) {
        const isActive = localStorage.getItem('maintenanceActive') === 'true';
        
        if (isActive) {
            localStorage.removeItem('maintenanceActive');
            localStorage.removeItem('maintenanceEndTime');
            localStorage.removeItem('maintenanceMessage');
            console.log('✅ Техработы отключены');
            alert('Техработы отключены!');
        } else {
            const endTime = new Date(Date.now() + minutes * 60000);
            localStorage.setItem('maintenanceActive', 'true');
            localStorage.setItem('maintenanceEndTime', endTime.toISOString());
            localStorage.setItem('maintenanceMessage', 'Плановые технические работы');
            console.log(`🚧 Техработы включены на ${minutes} минут`);
            alert(`Техработы включены на ${minutes} минут!`);
            window.location.href = 'maintenance.html';
        }
    };
    
})();
