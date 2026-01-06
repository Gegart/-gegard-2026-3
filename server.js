const express = require('express');
const app = express();
const PORT = 3000;

// Разрешаем все запросы
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
});
app.use(express.json());

// БАЗА ДАННЫХ реальных пользователей
let realUsersDB = [];

// Функция получить РЕАЛЬНЫЙ IP пользователя
function getRealIP(req) {
    return req.headers['x-forwarded-for']?.split(',')[0] || 
           req.headers['x-real-ip'] || 
           req.connection.remoteAddress ||
           req.socket.remoteAddress || 
           req.ip;
}

// 1. КОГДА РЕАЛЬНЫЙ ЧЕЛОВЕК ЗАХОДИТ НА САЙТ
app.post('/api/real-track', (req, res) => {
    try {
        // Получаем РЕАЛЬНЫЕ данные
        const realIP = getRealIP(req);
        const userAgent = req.headers['user-agent'];
        const page = req.body.page || 'Неизвестная страница';
        
        console.log('🔴 РЕАЛЬНЫЙ ПОЛЬЗОВАТЕЛЬ ЗАШЕЛ!');
        console.log('IP:', realIP);
        console.log('Устройство:', userAgent);
        
        // Определяем устройство
        let deviceType = 'Компьютер';
        if (/mobile/i.test(userAgent)) deviceType = 'Телефон';
        if (/tablet/i.test(userAgent)) deviceType = 'Планшет';
        
        // Определяем браузер
        let browser = 'Неизвестно';
        if (/chrome/i.test(userAgent)) browser = 'Chrome';
        else if (/firefox/i.test(userAgent)) browser = 'Firefox';
        else if (/safari/i.test(userAgent)) browser = 'Safari';
        else if (/edge/i.test(userAgent)) browser = 'Edge';
        
        // Определяем ОС
        let os = 'Неизвестно';
        if (/windows/i.test(userAgent)) os = 'Windows';
        else if (/macintosh/i.test(userAgent)) os = 'Mac';
        else if (/linux/i.test(userAgent)) os = 'Linux';
        else if (/android/i.test(userAgent)) os = 'Android';
        else if (/iphone|ipad/i.test(userAgent)) os = 'iOS';
        
        // Создаем запись о РЕАЛЬНОМ пользователе
        const realUser = {
            id: 'real_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            ip: realIP,
            userAgent: userAgent,
            device: deviceType,
            browser: browser,
            os: os,
            page: page,
            referer: req.headers.referer || 'Прямой заход',
            timestamp: Date.now(),
            online: true,
            isReal: true, // Это РЕАЛЬНЫЙ пользователь!
            country: req.body.country || 'Определяется...',
            city: req.body.city || 'Определяется...'
        };
        
        // Добавляем в базу
        realUsersDB.push(realUser);
        
        // Оставляем только последних 100 реальных пользователей
        if (realUsersDB.length > 100) {
            realUsersDB = realUsersDB.slice(-50);
        }
        
        // Сохраняем в файл (чтобы не потерять при перезагрузке)
        require('fs').writeFileSync('real-users.json', JSON.stringify(realUsersDB, null, 2));
        
        console.log(`✅ РЕАЛЬНЫЙ пользователь сохранен: ${realIP}`);
        
        res.json({
            success: true,
            message: 'Вы отслежены как реальный пользователь!',
            user: realUser
        });
        
    } catch (error) {
        console.error('Ошибка трекинга:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 2. ПОЛУЧИТЬ ВСЕХ РЕАЛЬНЫХ ПОЛЬЗОВАТЕЛЕЙ
app.get('/api/real-users', (req, res) => {
    try {
        // Фильтруем только онлайн (последние 5 минут)
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        const onlineUsers = realUsersDB.filter(user => user.timestamp > fiveMinutesAgo);
        
        // Обновляем статус
        onlineUsers.forEach(user => user.online = true);
        
        res.json({
            success: true,
            totalRealUsers: realUsersDB.length,
            onlineNow: onlineUsers.length,
            users: onlineUsers.slice(0, 50) // Показываем до 50 пользователей
        });
        
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 3. ПОЛУЧИТЬ СТАТИСТИКУ РЕАЛЬНЫХ ПОЛЬЗОВАТЕЛЕЙ
app.get('/api/real-stats', (req, res) => {
    try {
        const now = Date.now();
        const onlineUsers = realUsersDB.filter(user => now - user.timestamp < 300000);
        
        // Собираем статистику
        const stats = {
            totalReal: realUsersDB.length,
            onlineReal: onlineUsers.length,
            devices: {
                phones: realUsersDB.filter(u => u.device === 'Телефон').length,
                computers: realUsersDB.filter(u => u.device === 'Компьютер').length,
                tablets: realUsersDB.filter(u => u.device === 'Планшет').length
            },
            browsers: {
                chrome: realUsersDB.filter(u => u.browser === 'Chrome').length,
                firefox: realUsersDB.filter(u => u.browser === 'Firefox').length,
                safari: realUsersDB.filter(u => u.browser === 'Safari').length
            },
            lastUpdate: new Date().toLocaleString()
        };
        
        res.json({ success: true, stats });
        
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 4. УДАЛИТЬ ДЕМО-ДАННЫЕ (оставить только реальных)
app.delete('/api/clear-demo', (req, res) => {
    // Оставляем только пользователей с флагом isReal
    realUsersDB = realUsersDB.filter(user => user.isReal === true);
    
    res.json({
        success: true,
        message: 'Демо-данные удалены! Остались только реальные пользователи.',
        count: realUsersDB.length
    });
});

// 5. ГЕОЛОКАЦИЯ по IP (реальная)
app.get('/api/geo/:ip', async (req, res) => {
    try {
        // Используем бесплатный API для геолокации
        const response = await fetch(`http://ip-api.com/json/${req.params.ip}`);
        const geoData = await response.json();
        
        if (geoData.status === 'success') {
            res.json({
                success: true,
                country: geoData.country,
                city: geoData.city,
                region: geoData.regionName,
                isp: geoData.isp,
                lat: geoData.lat,
                lon: geoData.lon
            });
        } else {
            res.json({
                success: false,
                country: 'Неизвестно',
                city: 'Неизвестно'
            });
        }
    } catch (error) {
        res.json({
            success: false,
            country: 'Неизвестно',
            city: 'Неизвестно'
        });
    }
});

// Загружаем сохраненных реальных пользователей при запуске
try {
    if (require('fs').existsSync('real-users.json')) {
        realUsersDB = JSON.parse(require('fs').readFileSync('real-users.json', 'utf8'));
        console.log(`📂 Загружено ${realUsersDB.length} реальных пользователей из файла`);
    }
} catch (e) {
    console.log('Файл с реальными пользователями не найден, начинаем с нуля');
}

// Запускаем сервер
app.listen(PORT, () => {
    console.log('🔥🔥🔥 РЕАЛЬНЫЙ СЕРВЕР ЗАПУЩЕН! 🔥🔥🔥');
    console.log(`📊 Адрес: http://localhost:${PORT}`);
    console.log(`👥 Реальных пользователей в базе: ${realUsersDB.length}`);
    console.log('==========================================');
    console.log('🚀 Чтобы увидеть РЕАЛЬНЫХ пользователей:');
    console.log('1. Откройте http://localhost:3000');
    console.log('2. Нажмите "Я РЕАЛЬНЫЙ пользователь!"');
    console.log('3. Попросите друзей тоже зайти');
    console.log('==========================================');
});
