# Aim Game


**Aim Game** — это простая, но захватывающая игра, в которой нужно как можно быстрее кликать на шарики, чтобы набрать максимальный счет за ограниченное время. Вы можете выбрать длительность раунда: 20, 40 или 60 секунд, и попытаться установить новый рекорд.


[Посетите приложение на Render](https://aim-game-o3gv.onrender.com/)

## Функционал

- Выбор длительности раунда (20, 40, 60 секунд).
- Подсчет и сохранение рекордов для каждого пользователя.
- Интерактивный интерфейс с использованием чистого JavaScript.
- Защищенные маршруты и пользовательская аутентификация.
- Защита от XSS-атак и других уязвимостей.

## Технологии

### Клиентская часть

- **HTML5** —  разметка.
- **CSS3 & SCSS** — Стилизация и адаптивный дизайн.
- **JavaScript (ES6+)** — Логика игры и интерактивность.
- **Purify.js** — Очистка пользовательских данных для предотвращения XSS-атак.
- **Fetch API** — Отправка асинхронных запросов к серверу.

### Серверная часть

- **Node.js** — Среда выполнения для JavaScript на сервере.
- **Express** — Веб-фреймворк для создания серверных приложений.
- **Mongoose** — Библиотека для работы с MongoDB.
- **Handlebars** - Шаблонизатор для генерации html страниц на сервере
- **Helmet** — Защита приложения с помощью различных HTTP-заголовков.
- **Validator** — Валидация данных на сервере.
- **xss** — Защита от XSS-атак.
- **JWT** — Токены для аутентификации пользователей.
- **Bcrypt** — Хэширование паролей.
- и т.д

### Архитектура

- **MVC (Model-View-Controller)** — Структурированный подход к организации кода.
  - **Models**: Управление данными и взаимодействие с MongoDB.
  - **Views**: Шаблоны Handlebars (hbs) для серверной генерации HTML.
  - **Controllers**: Логика обработки запросов и маршрутов.

### Деплой

- **Render** — Приложение задеплоено на платформе Render.
