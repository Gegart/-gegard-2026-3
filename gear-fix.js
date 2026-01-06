// gear-fix.js
(function() {
    'use strict';
    
    console.log('💣 ЯДЕРНЫЙ ФИКС ЗАПУЩЕН');
    
    function fixGear() {
        const gear = document.getElementById('settingsGear');
        const panel = document.getElementById('settingsPanel');
        
        if (!gear || !panel) {
            console.error('💥 КРИТИЧЕСКАЯ ОШИБКА: Элементы не найдены');
            return;
        }
        
        // Удаляем ВСЕ старые обработчики
        const newGear = gear.cloneNode(true);
        gear.parentNode.replaceChild(newGear, gear);
        
        const newPanel = panel.cloneNode(true);
        panel.parentNode.replaceChild(newPanel, panel);
        
        // Новые ссылки
        const freshGear = document.getElementById('settingsGear');
        const freshPanel = document.getElementById('settingsPanel');
        
        // СУПЕР-НАДЁЖНЫЙ обработчик
        freshGear.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            console.log('⚙ КЛИК ЗАФИКСИРОВАН');
            
            if (freshPanel.style.display === 'block') {
                freshPanel.style.display = 'none';
                freshGear.style.animation = 'rotate 10s linear infinite';
            } else {
                freshPanel.style.display = 'block';
                freshGear.style.animation = 'rotate 2s linear infinite';
                freshPanel.scrollTop = 0;
            }
        }, true); // capture phase - сработает первым!
        
        // Закрытие по ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && freshPanel.style.display === 'block') {
                freshPanel.style.display = 'none';
            }
        });
        
        console.log('✅ Ядерный фикс применён');
    }
    
    // Пробуем несколько раз
    setTimeout(fixGear, 500);
    setTimeout(fixGear, 1500);
    setTimeout(fixGear, 3000);
    
    // При клике в любое место - фикс
    document.addEventListener('click', fixGear);
    
    console.log('💣 Ядерный фикс активирован');
})();
