// Universal Task Data for all 4 Tech Tracks:
// 1. HTML/CSS
// 2. JavaScript
// 3. Python
// 4. C#
// Each track has 3 Levels:
// Level 1: Basic Theory Test (10 questions)
// Level 2: Advanced Logic & Theory Test (10 questions)
// Level 3: Practical Code Problem in Interactive Editor

export const ALL_TRACK_TASKS = {
  htmlcss: {
    trackId: "htmlcss",
    trackLabel: "HTML / CSS",
    language: "html",
    levels: [
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
        type: "test",
        levelName: "Уровень 2 — Продвинутая теория",
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
        type: "practice_web",
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
          defaultHtml: `<div class="course-card">\n  <div class="badge">Спецгруппа ProfIT</div>\n  <h2 class="title">Веб-разработка & Frontend</h2>\n  <p class="desc">Освойте современную семантическую верстку, адаптивный дизайн и основы разработки веб-интерфейсов.</p>\n  <div class="features">\n    <div class="feature-item">✓ HTML5 & CSS3</div>\n    <div class="feature-item">✓ Flexbox & Grid</div>\n    <div class="feature-item">✓ Адаптив под смартфоны</div>\n  </div>\n  <button class="btn">Подать заявку</button>\n</div>`,
          defaultCss: `body {\n  font-family: system-ui, -apple-system, sans-serif;\n  background-color: #f1f5f9;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n  margin: 0;\n  padding: 20px;\n}\n\n.course-card {\n  width: 320px;\n  background: #ffffff;\n  border-radius: 20px;\n  padding: 28px;\n  box-shadow: 0 10px 25px rgba(0,0,0,0.06);\n  border: 1px solid #e2e8f0;\n  transition: transform 0.2s, box-shadow 0.2s;\n}\n\n.course-card:hover {\n  transform: translateY(-4px);\n  box-shadow: 0 14px 30px rgba(0,0,0,0.1);\n}\n\n.badge {\n  display: inline-block;\n  background: #fff4e6;\n  color: #ff8a00;\n  font-size: 11px;\n  font-weight: 800;\n  padding: 4px 10px;\n  border-radius: 20px;\n  margin-bottom: 14px;\n}\n\n.title {\n  margin: 0 0 10px;\n  font-size: 20px;\n  color: #0f172a;\n}\n\n.desc {\n  margin: 0 0 18px;\n  font-size: 13px;\n  color: #64748b;\n  line-height: 1.5;\n}\n\n.features {\n  border-top: 1px solid #f1f5f9;\n  padding-top: 14px;\n  margin-bottom: 20px;\n}\n\n.feature-item {\n  font-size: 12px;\n  color: #334155;\n  margin-bottom: 8px;\n  font-weight: 500;\n}\n\n.btn {\n  width: 100%;\n  background: #22c55e;\n  color: white;\n  border: none;\n  padding: 12px;\n  border-radius: 12px;\n  font-weight: 700;\n  font-size: 14px;\n  cursor: pointer;\n  transition: background 0.2s;\n}\n\n.btn:hover {\n  background: #16a34a;\n}`,
          rubric: [
            { id: "visual", label: "Соответствие визуальной структуре и отступы", maxScore: 5 },
            { id: "semantics", label: "Семантика тегов и чистота классов", maxScore: 5 },
            { id: "flex_hover", label: "Использование Flexbox/Grid и hover-эффектов", maxScore: 5 },
          ]
        }
      }
    ]
  },

  js: {
    trackId: "js",
    trackLabel: "JavaScript",
    language: "javascript",
    levels: [
      {
        levelId: "level1",
        type: "test",
        levelName: "Уровень 1 — Базовый синтаксис JS",
        badge: "Тест: База",
        badgeColor: "#64748B",
        desc: "10 вопросов: переменные (let/const), типы данных, базовые операции, условия и циклы.",
        questions: [
          { q: "Как объявить переменную, значение которой нельзя перезаписать?", o: ["let x = 5;", "const x = 5;", "var x = 5;", "immutable x = 5;"], c: 1 },
          { q: "Что вернет typeof \"Hello\"?", o: ["string", "text", "String", "object"], c: 0 },
          { q: "В чём разница между операторами === и ==?", o: ["=== сравнивает без приведения типов (строгое равенство)", "== работает быстрее", "=== можно использовать только с числами", "Разницы нет"], c: 0 },
          { q: "Что вернет выражение 2 + \"2\"?", o: ["4", "\"22\"", "NaN", "TypeError"], c: 1 },
          { q: "Как добавить элемент в конец массива arr?", o: ["arr.push(x)", "arr.unshift(x)", "arr.append(x)", "arr.add(x)"], c: 0 },
          { q: "Что выведет console.log(Boolean(0))?", o: ["true", "false", "undefined", "null"], c: 1 },
          { q: "Какой цикл гарантированно выполнится хотя бы один раз?", o: ["for", "while", "do...while", "forEach"], c: 2 },
          { q: "Как объявить стрелочную функцию сложения a и b?", o: ["const sum = (a, b) => a + b;", "function sum => (a, b) { a + b }", "arrow sum(a, b) { return a + b }", "const sum = function => (a, b)"], c: 0 },
          { q: "Что вернет [1, 2, 3].length?", o: ["2", "3", "4", "undefined"], c: 1 },
          { q: "Как проверить, что переменная не равна null и не равна undefined?", o: ["x != null", "x === false", "x == 0", "typeof x == 'empty'"], c: 0 },
        ]
      },
      {
        levelId: "level2",
        type: "test",
        levelName: "Уровень 2 — Продвинутый JavaScript",
        badge: "Тест: Продвинутый",
        badgeColor: "#FF8A00",
        desc: "10 вопросов: замыкания, методы массивов (map, filter, reduce), промисы, async/await, деструктуризация.",
        questions: [
          { q: "Что вернет [1, 2, 3].map(x => x * 2)?", o: ["[2, 4, 6]", "[1, 2, 3]", "6", "undefined"], c: 0 },
          { q: "Что такое замыкание (closure) в JavaScript?", o: ["Функция вместе с лексическим окружением, в котором она была создана", "Ошибка при переполнении стека вызовов", "Способ принудительной остановки цикла", "Метод создания приватных классов в ES6"], c: 0 },
          { q: "Что выведет console.log(typeof null)?", o: ["object", "null", "undefined", "number"], c: 0 },
          { q: "Какой метод массива отфильтрует элементы по условию и вернет новый массив?", o: ["filter()", "find()", "some()", "map()"], c: 0 },
          { q: "Что делает ключевое слово async перед функцией?", o: ["Заставляет функцию автоматически возвращать Promise", "Делает функцию синхронной", "Запускает функцию в отдельном потоке Web Worker", "Блокирует выполнение остального кода"], c: 0 },
          { q: "Как работает деструктуризация: const { name, age } = user?", o: ["Извлекает свойства name и age из объекта user в отдельные переменные", "Удаляет name и age из объекта user", "Создает новый объект с этими свойствами", "Сравнивает user с name и age"], c: 0 },
          { q: "Что вернет Promise.all([...]) если один из промисов завершится с ошибкой (reject)?", o: ["Сразу перейдет в состояние reject с этой ошибкой", "Дождется остальных и вернет успешные", "Проигнорирует ошибку", "Перезапустит промис заново"], c: 0 },
          { q: "Что делает оператор spread (...)?", o: ["Разворачивает элементы итерируемого объекта (массива/объекта)", "Делит число на части", "Объявляет приватную переменную", "Импортирует модуль"], c: 0 },
          { q: "В чём разница между event.preventDefault() и event.stopPropagation()?", o: ["preventDefault отменяет действие по умолчанию, а stopPropagation останавливает всплытие события", "Это синонимы", "stopPropagation перезагружает страницу", "preventDefault закрывает окно"], c: 0 },
          { q: "Что выведет [1, 2, 3].reduce((acc, curr) => acc + curr, 0)?", o: ["6", "0", "[1, 2, 3]", "undefined"], c: 0 },
        ]
      },
      {
        levelId: "level3",
        type: "practice_code",
        levelName: "Уровень 3 — Практическая задача",
        badge: "Практика: Алгоритм",
        badgeColor: "#22C55E",
        desc: "Реализуйте алгоритм обработки данных на JavaScript во встроенном редакторе.",
        practice: {
          title: "Практика JS: Анализ и фильтрация массива студентов",
          brief: "Напишите функцию getTopStudents(students, minScore), которая принимает массив объектов студентов и минимальный проходной балл, фильтрует успешно сдавших, сортирует их по убыванию балла и возвращает массив их имен.",
          requirements: [
            "Функция должна фильтровать студентов с score >= minScore",
            "Сортировать прошедших по убыванию баллов (от высшего к низшему)",
            "Возвращать массив строк только с именами: ['Иван', 'Алиса', ...]",
            "Использовать методы массивов filter, sort, map"
          ],
          defaultCode: `// Задача: Напишите функцию getTopStudents(students, minScore)
// Входные данные:
// students = [
//   { name: "Алиса", score: 85 },
//   { name: "Болат", score: 45 },
//   { name: "Дамир", score: 92 },
//   { name: "Елена", score: 78 }
// ]
// minScore = 75

function getTopStudents(students, minScore) {
  // Напишите ваше решение здесь:
  return students
    .filter(s => s.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .map(s => s.name);
}

// Проверочный запуск:
const list = [
  { name: "Алиса", score: 85 },
  { name: "Болат", score: 45 },
  { name: "Дамир", score: 92 },
  { name: "Елена", score: 78 }
];

console.log("Результат:", getTopStudents(list, 75));
// Ожидается: ["Дамир", "Алиса", "Елена"]`,
          rubric: [
            { id: "correctness", label: "Корректность фильтрации и сортировки", maxScore: 5 },
            { id: "clean_code", label: "Использование методов массивов (filter/sort/map)", maxScore: 5 },
            { id: "edge_cases", label: "Обработка крайних случаев (пустой массив)", maxScore: 5 },
          ]
        }
      }
    ]
  },

  python: {
    trackId: "python",
    trackLabel: "Python",
    language: "python",
    levels: [
      {
        levelId: "level1",
        type: "test",
        levelName: "Уровень 1 — Основы Python",
        badge: "Тест: База",
        badgeColor: "#64748B",
        desc: "10 вопросов: типы данных, списки, циклы for/while, функции def, операторы.",
        questions: [
          { q: "Как объявить функцию в Python?", o: ["def my_func():", "function my_func()", "func my_func():", "create my_func()"], c: 0 },
          { q: "Что выведет print(7 // 2)?", o: ["3.5", "3", "4", "1"], c: 1 },
          { q: "Как объявить пустой список в Python?", o: ["lst = []", "lst = {}", "lst = ()", "lst = set()"], c: 0 },
          { q: "Что делает функция len()?", o: ["Возвращает длину / количество элементов", "Возвращает тип переменной", "Удаляет последний элемент", "Сортирует коллекцию"], c: 0 },
          { q: "Как добавить элемент 'apple' в конец списка fruits?", o: ["fruits.append('apple')", "fruits.add('apple')", "fruits.push('apple')", "fruits.insert('apple')"], c: 0 },
          { q: "Какая функция используется для вывода текста в консоль?", o: ["print()", "console.log()", "echo()", "write()"], c: 0 },
          { q: "Что вернет выражение 2 ** 3?", o: ["6", "8", "5", "9"], c: 1 },
          { q: "Как проверить, что число n четное?", o: ["n % 2 == 0", "n / 2 == 0", "n // 2 == 1", "is_even(n)"], c: 0 },
          { q: "Какое ключевое слово используется для условий 'иначе если'?", o: ["elif", "else if", "elseif", "case"], c: 0 },
          { q: "Что выведет range(3)?", o: ["Последовательность 0, 1, 2", "1, 2, 3", "0, 1, 2, 3", "3"], c: 0 },
        ]
      },
      {
        levelId: "level2",
        type: "test",
        levelName: "Уровень 2 — Продвинутый Python",
        badge: "Тест: Продвинутый",
        badgeColor: "#FF8A00",
        desc: "10 вопросов: словари, кортежи, генераторы списков, ООП, lambda, работа с исключениями.",
        questions: [
          { q: "В чём главное отличие кортежа (tuple) от списка (list)?", o: ["Кортеж является неизменяемым (immutable) типом данных", "Кортеж хранит только числа", "Список работает быстрее кортежа", "В кортеже нельзя обращаться по индексу"], c: 0 },
          { q: "Что вернет списковое включение [x**2 for x in [1, 2, 3]]?", o: ["[1, 4, 9]", "[2, 4, 6]", "[1, 2, 3]", "14"], c: 0 },
          { q: "Что означает аргумент self в методах класса Python?", o: ["Ссылку на текущий экземпляр (объект) класса", "Имя класса", "Глобальную область видимости", "Родительский класс"], c: 0 },
          { q: "Как безопасно получить значение из словаря d по ключу 'key' со значением по умолчанию 0?", o: ["d.get('key', 0)", "d['key'] or 0", "d.find('key', 0)", "d.fetch('key', 0)"], c: 0 },
          { q: "Для чего используется конструкция try...except?", o: ["Для перехвата и обработки исключений (ошибок)", "Для ускорения выполнения циклов", "Для создания многопоточности", "Для объявления приватных методов"], c: 0 },
          { q: "Что такое декоратор в Python?", o: ["Функция, принимающая другую функцию и расширяющая её поведение", "Шаблон оформления интерфейса", "Тип данных для работы с графикой", "Комментарий к коду функции"], c: 0 },
          { q: "Что вернет выражение dict.keys()?", o: ["Итерируемый объект со всеми ключами словаря", "Список всех значений", "Количество элементов", "Копию словаря"], c: 0 },
          { q: "Как открыть файл 'data.txt' для чтения с гарантированным закрытием?", o: ["with open('data.txt', 'r') as f:", "file = read('data.txt')", "open('data.txt').read_all()", "try: open('data.txt')"], c: 0 },
          { q: "Что выведет print(list(filter(lambda x: x > 0, [-2, 0, 3, 5])))?", o: ["[3, 5]", "[-2, 0]", "[0, 3, 5]", "True"], c: 0 },
          { q: "Что означает ключевое слово pass?", o: ["Пустая инструкция-заглушка, не выполняющая никаких действий", "Прерывание выполнения функции", "Выход из текущего цикла", "Возврат значения None"], c: 0 },
        ]
      },
      {
        levelId: "level3",
        type: "practice_code",
        levelName: "Уровень 3 — Практическая задача",
        badge: "Практика: Алгоритм",
        badgeColor: "#22C55E",
        desc: "Реализуйте алгоритм агрегации и обработки структуры данных на Python.",
        practice: {
          title: "Практика Python: Подсчет частоты слов и статистика текста",
          brief: "Напишите функцию count_word_frequencies(text), которая принимает строку, приводит все слова к нижнему регистру, удаляет знаки препинания и возвращает словарь, где ключ — слово, а значение — сколько раз оно встретилось.",
          requirements: [
            "Приводить все слова к нижнему регистру (.lower())",
            "Игнорировать знаки препинания (точки, запятые, восклицательные знаки)",
            "Возвращать словарь формата: {'python': 2, 'код': 3, ...}",
            "Корректно обрабатывать пустую строку"
          ],
          defaultCode: `# Задача: Напишите функцию count_word_frequencies(text)
# Пример:
# text = "Python это круто! Изучать Python легко и интересно, если писать код."

import re

def count_word_frequencies(text: str) -> dict:
    # 1. Привести к нижнему регистру
    clean_text = re.sub(r'[^a-zA-Zа-яА-Я0-9\s]', '', text.lower())
    words = clean_text.split()
    
    freq = {}
    for word in words:
        freq[word] = freq.get(word, 0) + 1
        
    return freq

# Проверка решения:
sample = "Python это круто! Изучать Python легко и интересно, если писать код."
result = count_word_frequencies(sample)

print("Частотный словарь:")
for word, count in result.items():
    print(f"'{word}': {count}")`,
          rubric: [
            { id: "logic", label: "Правильность подсчета частоты слов", maxScore: 5 },
            { id: "cleaning", label: "Очистка от регистра и знаков препинания", maxScore: 5 },
            { id: "idiomatic", label: "Использование идиоматичного Python (get, split)", maxScore: 5 },
          ]
        }
      }
    ]
  },

  csharp: {
    trackId: "csharp",
    trackLabel: "C# (.NET)",
    language: "csharp",
    levels: [
      {
        levelId: "level1",
        type: "test",
        levelName: "Уровень 1 — Основы C#",
        badge: "Тест: База",
        badgeColor: "#64748B",
        desc: "10 вопросов: типы данных (int, string, bool), классы, методы, массивы и циклы.",
        questions: [
          { q: "Какое ключевое слово используется для создания класса в C#?", o: ["class", "struct", "object", "define"], c: 0 },
          { q: "Какой тип данных используется для хранения целых чисел?", o: ["int", "string", "bool", "double"], c: 0 },
          { q: "Как вывести сообщение в консоль в C#?", o: ["Console.WriteLine(\"Hello\");", "print(\"Hello\");", "System.out.println(\"Hello\");", "echo \"Hello\";"], c: 0 },
          { q: "Какое ключевое слово указывает, что метод не возвращает никакого значения?", o: ["void", "null", "empty", "static"], c: 0 },
          { q: "Как объявить массив целых чисел из 5 элементов?", o: ["int[] arr = new int[5];", "int arr[5];", "array<int> arr = new array(5);", "List int = new List(5);"], c: 0 },
          { q: "Какая точка входа по умолчанию используется в консольных приложениях C#?", o: ["static void Main(string[] args)", "public void Start()", "static int Entry()", "void Run()"], c: 0 },
          { q: "Какое ключевое слово создает новый экземпляр класса?", o: ["new", "create", "make", "instantiate"], c: 0 },
          { q: "Для чего используется ключевое слово using в начале файла C#?", o: ["Для подключения пространств имен (namespaces)", "Для удаления переменных из памяти", "Для вызова сборщика мусора", "Для наследования классов"], c: 0 },
          { q: "Какой тип используется для логических значений (true/false)?", o: ["bool", "boolean", "bit", "flag"], c: 0 },
          { q: "Как записать инкремент переменной i на 1?", o: ["i++;", "i += 1;", "i = i + 1;", "Все перечисленные варианты верны"], c: 3 },
        ]
      },
      {
        levelId: "level2",
        type: "test",
        levelName: "Уровень 2 — ООП и LINQ в C#",
        badge: "Тест: Продвинутый",
        badgeColor: "#FF8A00",
        desc: "10 вопросов: интерфейсы, полиморфизм, свойства { get; set; }, LINQ, List<T>, исключения.",
        questions: [
          { q: "В чём разница между Value Type (структурами) и Reference Type (классами)?", o: ["Value types хранятся в стеке и передаются по значению, Reference types — в куче и передаются по ссылке", "Value types не могут содержать методы", "Reference types работают медленнее компилятора", "Отличий нет"], c: 0 },
          { q: "Что такое интерфейс (interface) в C#?", o: ["Контракт, определяющий сигнатуры методов и свойств без их реализации", "Класс с готовой логикой", "Визуальная форма приложения", "Файл конфигурации"], c: 0 },
          { q: "Какое ключевое слово позволяет переопределить виртуальный метод базового класса?", o: ["override", "virtual", "new", "abstract"], c: 0 },
          { q: "Что делает метод LINQ: numbers.Where(n => n > 10)?", o: ["Фильтрует коллекцию, возвращая элементы больше 10", "Сортирует элементы", "Удаляет элементы меньше 10 из исходного списка", "Находит сумму чисел"], c: 0 },
          { q: "Как объявить авто-свойство (auto-property) для возраста студента?", o: ["public int Age { get; set; }", "public int Age = get, set;", "property int Age();", "int Age { read, write }"], c: 0 },
          { q: "Что делает ключевое слово static у метода или класса?", o: ["Делает метод/класс принадлежащим самому типу, а не конкретному объекту", "Запрещает наследование", "Делает переменные константами", "Включает асинхронность"], c: 0 },
          { q: "Какой класс коллекции используется для динамического типизированного списка?", o: ["List<T>", "ArrayList", "Array<T>", "CollectionMap"], c: 0 },
          { q: "Какая конструкция используется для перехвата исключений?", o: ["try { ... } catch (Exception ex) { ... }", "check { ... } error { ... }", "trap { ... } handle { ... }", "guard { ... } rescue { ... }"], c: 0 },
          { q: "Что возвращает метод LINQ .Select(x => x * 2)?", o: ["Проекцию коллекции, где каждый элемент умножен на 2", "Первый подходящий элемент", "Количество элементов", "Отсортированный список"], c: 0 },
          { q: "Что дает модификатор async/await в C#?", o: ["Позволяет выполнять неблокирующие асинхронные операции Task", "Автоматически создает фоновый поток Thread", "Ускоряет вычисления процессора", "Отключает Garbage Collector"], c: 0 },
        ]
      },
      {
        levelId: "level3",
        type: "practice_code",
        levelName: "Уровень 3 — Практическая задача",
        badge: "Практика: ООП и LINQ",
        badgeColor: "#22C55E",
        desc: "Реализуйте класс и LINQ-обработку данных на C# во встроенном редакторе.",
        practice: {
          title: "Практика C#: Система управления оценками группы (GradeManager)",
          brief: "Реализуйте класс Student с авто-свойствами Name и Grade, и метод GetHonorStudents(List<Student> students, double minGrade), возвращающий список студентов-отличников, отсортированных по имени с помощью LINQ.",
          requirements: [
            "Создать класс Student с полями Name (string) и Grade (double)",
            "Использовать LINQ (.Where(), .OrderBy(), .ToList())",
            "Отфильтровать студентов с Grade >= minGrade",
            "Отсортировать по имени в алфавитном порядке"
          ],
          defaultCode: `using System;
using System.Collections.Generic;
using System.Linq;

public class Student
{
    public string Name { get; set; }
    public double Grade { get; set; }

    public Student(string name, double grade)
    {
        Name = name;
        Grade = grade;
    }
}

public class Program
{
    public static List<Student> GetHonorStudents(List<Student> students, double minGrade)
    {
        // Напишите LINQ запрос:
        return students
            .Where(s => s.Grade >= minGrade)
            .OrderBy(s => s.Name)
            .ToList();
    }

    public static void Main()
    {
        var group = new List<Student>
        {
            new Student("Дамир", 4.8),
            new Student("Алиса", 4.9),
            new Student("Болат", 3.7),
            new Student("Елена", 4.5)
        };

        var honors = GetHonorStudents(group, 4.5);

        Console.WriteLine("Студенты-отличники (Grade >= 4.5):");
        foreach (var s in honors)
        {
            Console.WriteLine($"{s.Name} — {s.Grade}");
        }
    }
}`,
          rubric: [
            { id: "class_design", label: "Корректность класса Student и свойств", maxScore: 5 },
            { id: "linq_query", label: "Правильность использования LINQ (Where, OrderBy)", maxScore: 5 },
            { id: "logic", label: "Работоспособность алгоритма и форматирование", maxScore: 5 },
          ]
        }
      }
    ]
  }
};
