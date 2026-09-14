// HTML/CSS Track: 3 Levels
// Level 1: Pure Test (10 questions on basic HTML/CSS syntax)
// Level 2: Advanced Theory & Logic Test (10 questions on Flexbox, Grid, Selectors, Media Queries, DevTools)
// Level 3: Practical Task in Live Code Editor (HTML/CSS layout with preview and teacher grading)

export const HTMLCSS_LEVELS = [
  {
    levelId: "level1",
    type: "test",
    levelName: "Уровень 1 — Базовое тестирование",
    badge: "Тест: База",
    badgeColor: "#64748B",
    desc: "10 вопросов: теги, атрибуты, базовые селекторы, структура документа и блочная модель.",
    questions: [
      { q: "Какой тег используется для создания гиперссылки?", o: ["<link>", "<a>", "<href>", "<nav>"], c: 1 },
      { q: "Какое CSS-свойство отвечает за цвет текста?", o: ["color", "background", "font-color", "text-color"], c: 0 },
      { q: "Какой тег задает заголовок самого верхнего уровня?", o: ["<head>", "<header>", "<h1>", "<h6>"], c: 2 },
      { q: "Какой селектор выберет все элементы с классом card?", o: [".card", "#card", "card", "*card"], c: 0 },
      { q: "С помощью какого атрибута задается альтернативный текст для картинки <img>?", o: ["title", "src", "alt", "name"], c: 2 },
      { q: "Какое значение свойства display делает блочный элемент строчным?", o: ["block", "inline", "flex", "none"], c: 1 },
      { q: "Какой тег используется для создания ненумерованного списка?", o: ["<ol>", "<ul>", "<li>", "<list>"], c: 1 },
      { q: "Какое свойство задает внутренний отступ элемента?", o: ["margin", "padding", "border", "gap"], c: 1 },
      { q: "Какой селектор выберет элемент с id=\"header\"?", o: [".header", "#header", "*header", "header!"], c: 1 },
      { q: "Где правильно подключается внешний файл стилей CSS в HTML?", o: ["Внутри тега <head> через <link>", "Внутри <body> через <script>", "После закрывающего тега </html>", "В любом месте через <style-src>"], c: 0 },
    ]
  },
  {
    levelId: "level2",
    levelName: "Уровень 2 — Продвинутая теория",
    type: "test",
    badge: "Тест: Продвинутый",
    badgeColor: "#FF8A00",
    desc: "10 вопросов: Flexbox, CSS Grid, специфичность селекторов, адаптивные медиа-запросы, CSS-переменные.",
    questions: [
      { q: "Что делает свойство box-sizing: border-box?", o: ["Padding и border входят в указанные width/height", "Добавляет обводку 1px вокруг блока", "Скрывает переполнение контейнера", "Делает блок адаптивным автоматически"], c: 0 },
      { q: "Какое CSS свойство выравнивает flex-элементы по главной оси?", o: ["align-items", "justify-content", "flex-direction", "align-content"], c: 1 },
      { q: "Как объявить глобальную CSS-переменную для основного цвета?", o: [":root { --main-color: #ff8a00; }", "$main-color: #ff8a00;", "@var main-color: #ff8a00;", "body { var-color: #ff8a00; }"], c: 0 },
      { q: "Какой селектор имеет наибольшую специфичность (вес)?", o: ["div.container > p.text", "#header-nav", "header nav a:hover", "button[type=\"submit\"]"], c: 1 },
      { q: "Как пишется медиа-запрос для мобильных устройств с шириной экрана до 768px?", o: ["@media screen and (max-width: 768px)", "@media (min-screen: 768px)", "@screen-mobile 768px", "@media phone (width <= 768)"], c: 0 },
      { q: "В чём ключевая разница между единицами rem и em?", o: ["rem вычисляется от шрифта корневого <html>, а em — от родителя/текущего элемента", "rem работает только для margin, а em для font-size", "em — абсолютный в пикселях, а rem относительный", "Между ними нет различий"], c: 0 },
      { q: "Какое свойство в CSS Grid позволяет создать 3 равные адаптивные колонки?", o: ["grid-template-columns: repeat(3, 1fr)", "grid-columns: 3 auto", "display: grid 3", "grid-template: 33% 33% 33% 33%"], c: 0 },
      { q: "Что происходит с элементом при position: absolute?", o: ["Позиционируется относительно ближайшего позиционированного предка", "Всегда позиционируется относительно окна браузера", "Остается в обычном потоке документа", "Работает только внутри <table>"], c: 0 },
      { q: "Какой псевдокласс выбирает каждый нечетный дочерний элемент?", o: [":nth-child(odd)", ":nth-of-type(2n)", ":first-child", ":last-child"], c: 0 },
      { q: "Какое свойство включает плавный анимированный переход между состояниями (например hover)?", o: ["transition", "animation-delay", "transform-origin", "will-change"], c: 0 },
    ]
  },
  {
    levelId: "level3",
    type: "practice",
    levelName: "Уровень 3 — Практическое задание",
    badge: "Практика: Кодинг",
    badgeColor: "#22C55E",
    desc: "Практическая верстка реального интерфейса во встроенном редакторе с живым превью.",
    practice: {
      title: "Практика: Адаптивная карточка курса / Промо-блок спецгруппы",
      brief: "Сверстайте современную адаптивную карточку курса или прайс-блок во встроенном редакторе. Проверьте правильность семантики тегов, отступов (padding/margin), цветов и эффектов при наведении.",
      requirements: [
        "Использовать семантические теги (article/div, h2/h3, p, button, img/badge)",
        "Стилизовать карточку: скругления (border-radius), тень (box-shadow) и отступы",
        "Применить Flexbox для выравнивания контента и кнопки",
        "Добавить hover-эффект для кнопки или всей карточки",
        "Чистый CSS без инлайн-стилей"
      ],
      defaultHtml: `<div class="course-card">
  <div class="badge">Спецгруппа ProfIT</div>
  <h2 class="title">Веб-разработка & Frontend</h2>
  <p class="desc">Освойте современную семантическую верстку, адаптивный дизайн и основы разработки веб-интерфейсов.</p>
  <div class="features">
    <div class="feature-item">✓ HTML5 & CSS3</div>
    <div class="feature-item">✓ Flexbox & Grid</div>
    <div class="feature-item">✓ Адаптив под смартфоны</div>
  </div>
  <button class="btn">Подать заявку</button>
</div>`,
      defaultCss: `body {
  font-family: system-ui, -apple-system, sans-serif;
  background-color: #f1f5f9;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
  padding: 20px;
}

.course-card {
  width: 320px;
  background: #ffffff;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.06);
  border: 1px solid #e2e8f0;
  transition: transform 0.2s, box-shadow 0.2s;
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 30px rgba(0,0,0,0.1);
}

.badge {
  display: inline-block;
  background: #fff4e6;
  color: #ff8a00;
  font-size: 11px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 20px;
  margin-bottom: 14px;
}

.title {
  margin: 0 0 10px;
  font-size: 20px;
  color: #0f172a;
}

.desc {
  margin: 0 0 18px;
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
}

.features {
  border-top: 1px solid #f1f5f9;
  padding-top: 14px;
  margin-bottom: 20px;
}

.feature-item {
  font-size: 12px;
  color: #334155;
  margin-bottom: 8px;
  font-weight: 500;
}

.btn {
  width: 100%;
  background: #22c55e;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn:hover {
  background: #16a34a;
}`,
      rubric: [
        { id: "visual", label: "Соответствие визуальной структуре и отступы", maxScore: 5 },
        { id: "semantics", label: "Семантика тегов и чистота классов", maxScore: 5 },
        { id: "flex_hover", label: "Использование Flexbox/Grid и hover-эффектов", maxScore: 5 },
      ]
    }
  }
];
