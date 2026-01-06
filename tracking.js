// tracking.js
(function() {
    'use strict';
    
    // Только для админов или всем?
    const TRACK_ALL = true; // true = трекать всех, false = только админов
    
    if (!TRACK_ALL) {
        // Проверяем админ ли
        const urlParams = new URLSearchParams(window.location.search);
        const isAdmin = urlParams.get('admin') === 'gepard2026' || 
                       localStorage.getItem('gepard_admin_2026') === 'true';
        if (!isAdmin) return;
    }
    
    // Данные посетителя
    const visitorData = {
        id: generateVisitorId(),
        timestamp: Date.now(),
        page: window.location.pathname,
        referrer: document.referrer || 'direct',
        screen: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language || navigator.userLanguage,
        userAgent: navigator.userAgent.substring(0, 200),
        // IP и геолокация будут через API
    };
    
    // Сохраняем посетителя
    function saveVisitor() {
        try {
            let visitors = JSON.parse(localStorage.getItem('gepard_visitors') || '[]');
            
            // Проверяем не записывали ли уже этого посетителя сегодня
            const today = new Date().toDateString();
            const todayVisitors = visitors.filter(v => {
                const visitDate = new Date(v.timestamp).toDateString();
                return visitDate === today && v.id === visitorData.id;
            });
            
            if (todayVisitors.length === 0) {
                visitors.push(visitorData);
                localStorage.setItem('gepard_visitors', JSON.stringify(visitors));
                console.log('👤 Посетитель записан:', visitorData.id);
                
                // Отправляем уведомление если админ смотрит аналитику
                if (window.parent && window.parent.showNotification) {
                    window.parent.showNotification('Новый посетитель на сайте', 'user');
                }
            }
        } catch (e) {
            console.error('Ошибка сохранения посетителя:', e);
        }
    }
    
    // Генерация ID посетителя
    function generateVisitorId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 9);
        return `vis_${timestamp}_${random}`;
    }
    
    // Получение IP и геолокации (через внешний API)
    function getIPInfo() {
        fetch('https://ipapi.co/json/')
            .then(response => response.json())
            .then(data => {
                visitorData.ip = data.ip;
                visitorData.country = data.country_name;
                visitorData.city = data.city;
                visitorData.region = data.region;
                
                // Обновляем данные
                saveVisitor();
            })
            .catch(() => {
                // Если API не работает, сохраняем без геоданных
                saveVisitor();
            });
    }
    
    // Отслеживание времени на сайте
    let startTime = Date.now();
    window.addEventListener('beforeunload', function() {
        visitorData.duration = Math.floor((Date.now() - startTime) / 1000);
        saveVisitor();
    });
    
    // Отслеживание кликов по скачиванию
    document.addEventListener('click', function(e) {
        if (e.target.closest('.download-btn') || e.target.closest('#downloadLink')) {
            visitorData.downloaded = true;
            saveVisitor();
        }
    });
    
    // Инициализация
    if (navigator.doNotTrack !== '1') {
        // Ждём немного перед запросом IP
        setTimeout(getIPInfo, 1000);
    }
    
    // Экспорт для других скриптов
    window.GepardAnalytics = {
        getVisitorId: () => visitorData.id,
        getVisitorData: () => ({...visitorData}),
        trackEvent: (eventName, data) => {
            console.log('📊 Событие:', eventName, data);
            // Можно сохранять в localStorage
        }
    };
    
})();
