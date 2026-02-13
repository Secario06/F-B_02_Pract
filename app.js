const express = require('express');
const app = express();
const port = 3000;

// ============================================
// Мiddleware для парсинга JSON
// (обязательно для получения данных из body)
// ============================================
app.use(express.json());

// ============================================
// База данных товаров (в памяти сервера)
// ============================================
let products = [
    { id: 1, name: 'Смартфон X Pro', price: 49990 },
    { id: 2, name: 'Ноутбук Ultra 15', price: 89990 },
    { id: 3, name: 'Беспроводные наушники', price: 5990 },
    { id: 4, name: 'Умные часы Watch 5', price: 15990 }
];

// ============================================
// ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ
// Для поиска товара по ID (чтобы не повторять код)
// ============================================
function findProductById(id) {
    return products.find(p => p.id === parseInt(id));
}

// ============================================
// ГЛАВНАЯ СТРАНИЦА (просто для проверки)
// ============================================
app.get('/', (req, res) => {
    res.send(`
        <h1>API управления товарами работает! 🚀</h1>
        <p>Доступные маршруты:</p>
        <ul>
            <li><b>GET /products</b> - получить все товары</li>
            <li><b>GET /products/:id</b> - получить товар по ID</li>
            <li><b>POST /products</b> - создать новый товар</li>
            <li><b>PUT /products/:id</b> - полностью обновить товар</li>
            <li><b>PATCH /products/:id</b> - частично обновить товар</li>
            <li><b>DELETE /products/:id</b> - удалить товар</li>
        </ul>
    `);
});

// ============================================
// CRUD ОПЕРАЦИИ ДЛЯ ТОВАРОВ
// ============================================

// --------------------------------------------
// CREATE (Создание) - POST /products
// Добавление нового товара
// --------------------------------------------
app.post('/products', (req, res) => {
    // Получаем данные из тела запроса
    const { name, price } = req.body;
    
    // Валидация: проверяем, что все поля переданы
    if (!name || price === undefined) {
        return res.status(400).json({ 
            error: 'Не все поля заполнены. Требуются: name, price' 
        });
    }
    
    // Проверяем, что цена - число
    if (isNaN(price) || price < 0) {
        return res.status(400).json({ 
            error: 'Цена должна быть положительным числом' 
        });
    }
    
    // Создаем новый товар
    // ID генерируем на основе текущего времени + случайное число
    const newProduct = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        name: name,
        price: Number(price)  // Преобразуем в число
    };
    
    // Добавляем в массив
    products.push(newProduct);
    
    // Отправляем ответ с кодом 201 (Создано)
    res.status(201).json({
        message: 'Товар успешно создан',
        product: newProduct
    });
});

// --------------------------------------------
// READ (Чтение всех) - GET /products
// Получение списка всех товаров
// --------------------------------------------
app.get('/products', (req, res) => {
    // Можно добавить фильтрацию по цене через query-параметры
    const { minPrice, maxPrice } = req.query;
    
    let filteredProducts = products;
    
    // Фильтрация по минимальной цене
    if (minPrice) {
        filteredProducts = filteredProducts.filter(p => p.price >= Number(minPrice));
    }
    
    // Фильтрация по максимальной цене
    if (maxPrice) {
        filteredProducts = filteredProducts.filter(p => p.price <= Number(maxPrice));
    }
    
    res.json(filteredProducts);
});

// --------------------------------------------
// READ (Чтение одного) - GET /products/:id
// Получение товара по его ID
// --------------------------------------------
app.get('/products/:id', (req, res) => {
    const product = findProductById(req.params.id);
    
    if (!product) {
        return res.status(404).json({ 
            error: 'Товар с таким ID не найден' 
        });
    }
    
    res.json(product);
});

// --------------------------------------------
// UPDATE (Полное обновление) - PUT /products/:id
// Замена товара целиком
// --------------------------------------------
app.put('/products/:id', (req, res) => {
    const product = findProductById(req.params.id);
    
    if (!product) {
        return res.status(404).json({ 
            error: 'Товар с таким ID не найден' 
        });
    }
    
    const { name, price } = req.body;
    
    // Валидация
    if (!name || price === undefined) {
        return res.status(400).json({ 
            error: 'Не все поля заполнены. Требуются: name, price' 
        });
    }
    
    if (isNaN(price) || price < 0) {
        return res.status(400).json({ 
            error: 'Цена должна быть положительным числом' 
        });
    }
    
    // Полностью обновляем товар
    product.name = name;
    product.price = Number(price);
    
    res.json({
        message: 'Товар полностью обновлен',
        product: product
    });
});

// --------------------------------------------
// UPDATE (Частичное обновление) - PATCH /products/:id
// Обновление только переданных полей
// --------------------------------------------
app.patch('/products/:id', (req, res) => {
    const product = findProductById(req.params.id);
    
    if (!product) {
        return res.status(404).json({ 
            error: 'Товар с таким ID не найден' 
        });
    }
    
    const { name, price } = req.body;
    
    // Обновляем только те поля, которые переданы
    if (name !== undefined) {
        product.name = name;
    }
    
    if (price !== undefined) {
        if (isNaN(price) || price < 0) {
            return res.status(400).json({ 
                error: 'Цена должна быть положительным числом' 
            });
        }
        product.price = Number(price);
    }
    
    res.json({
        message: 'Товар частично обновлен',
        product: product
    });
});

// --------------------------------------------
// DELETE (Удаление) - DELETE /products/:id
// Удаление товара по ID
// --------------------------------------------
app.delete('/products/:id', (req, res) => {
    const productIndex = products.findIndex(p => p.id === parseInt(req.params.id));
    
    if (productIndex === -1) {
        return res.status(404).json({ 
            error: 'Товар с таким ID не найден' 
        });
    }
    
    // Удаляем товар из массива
    const deletedProduct = products[productIndex];
    products.splice(productIndex, 1);
    
    res.json({
        message: 'Товар успешно удален',
        deletedProduct: deletedProduct
    });
});

// ============================================
// ДОПОЛНИТЕЛЬНО: Статистика по товарам
// ============================================
app.get('/products/stats/summary', (req, res) => {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + p.price, 0);
    const averagePrice = totalProducts > 0 ? (totalValue / totalProducts).toFixed(2) : 0;
    const cheapestProduct = products.length > 0 
        ? products.reduce((min, p) => p.price < min.price ? p : min, products[0])
        : null;
    const mostExpensiveProduct = products.length > 0
        ? products.reduce((max, p) => p.price > max.price ? p : max, products[0])
        : null;
    
    res.json({
        totalProducts,
        totalValue,
        averagePrice,
        cheapestProduct,
        mostExpensiveProduct
    });
});

// ============================================
// ЗАПУСК СЕРВЕРА
// ============================================
app.listen(port, () => {
    console.log('\n' + '='.repeat(50));
    console.log('🚀 Сервер успешно запущен!');
    console.log('='.repeat(50));
    console.log(`📍 Адрес: http://localhost:${port}`);
    console.log('\n📦 Доступные маршруты:');
    console.log('   GET    /products              - все товары');
    console.log('   GET    /products/:id          - товар по ID');
    console.log('   POST   /products              - создать товар');
    console.log('   PUT    /products/:id          - полностью обновить');
    console.log('   PATCH  /products/:id          - частично обновить');
    console.log('   DELETE /products/:id          - удалить товар');
    console.log('   GET    /products/stats/summary - статистика');
    console.log('\n' + '='.repeat(50));
    console.log('💡 Нажми Ctrl+C, чтобы остановить сервер\n');
});