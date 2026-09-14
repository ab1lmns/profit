// q = question text, o = options, c = index of correct option, d = difficulty weight (1/2/3)
export const QUESTION_BANKS = {
  htmlcss: [
    { q: "Какой тег используется для создания гиперссылки?", o: ["<link>", "<a>", "<href>", "<nav>"], c: 1, d: 1 },
    { q: "Какое CSS-свойство отвечает за цвет текста?", o: ["color", "background", "font-color", "text-color"], c: 0, d: 1 },
    { q: "Что делает display: flex?", o: ["Убирает элемент со страницы", "Делает элемент строчным", "Включает гибкое расположение дочерних элементов", "Добавляет прокрутку"], c: 2, d: 2 },
    { q: "Какой селектор выберет все элементы с классом card?", o: [".card", "#card", "card", "*card"], c: 0, d: 2 },
    { q: "Как ведёт себя position: absolute?", o: ["Позиционируется относительно окна браузера всегда", "Позиционируется относительно ближайшего позиционированного предка", "Не выходит из потока документа", "Работает только внутри flex-контейнера"], c: 1, d: 3 },
    { q: "Что включает box-sizing: border-box?", o: ["Padding и border добавляются к заданной ширине", "Padding и border входят в заданную ширину", "Отключает border у элемента", "Скрывает переполнение"], c: 1, d: 3 },
  ],
  js: [
    { q: "Как объявить константу в JS?", o: ["var", "let", "const", "def"], c: 2, d: 1 },
    { q: "Что вернёт typeof \"5\"?", o: ["number", "string", "boolean", "undefined"], c: 1, d: 1 },
    { q: "Что вернёт [1,2,3].map(x => x * 2)?", o: ["[2, 4, 6]", "[1, 2, 3]", "undefined", "Ошибку"], c: 0, d: 2 },
    { q: "В чём отличие === от ==?", o: ["Отличий нет", "=== сравнивает без приведения типов", "== быстрее работает", "=== работает только с числами"], c: 1, d: 2 },
    { q: "Что такое замыкание (closure)?", o: ["Ошибка выполнения", "Функция, запоминающая переменные внешней области видимости", "Способ остановить цикл", "Метод объекта Array"], c: 1, d: 3 },
    { q: "Что выведет console.log(typeof null)?", o: ["object", "null", "undefined", "number"], c: 0, d: 3 },
  ],
  python: [
    { q: "Как объявить пустой список в Python?", o: ["list = []", "list = {}", "list = ()", "list = <>"], c: 0, d: 1 },
    { q: "Что выведет print(3 // 2)?", o: ["1.5", "1", "2", "0"], c: 1, d: 1 },
    { q: "Что делает функция len()?", o: ["Возвращает тип объекта", "Возвращает количество элементов", "Удаляет элемент", "Сортирует список"], c: 1, d: 2 },
    { q: "Что означает self в методах класса?", o: ["Имя класса", "Ссылку на текущий экземпляр класса", "Родительский класс", "Глобальную переменную"], c: 1, d: 2 },
    { q: "Чем кортеж (tuple) отличается от списка (list)?", o: ["Кортеж нельзя изменить после создания", "Кортеж быстрее сортируется", "Список нельзя перебрать циклом", "Отличий нет"], c: 0, d: 3 },
    { q: "Для чего используется декоратор в Python?", o: ["Для комментирования кода", "Чтобы изменить поведение функции без изменения её кода", "Для объявления переменных", "Для импорта модулей"], c: 1, d: 3 },
  ],
  csharp: [
    { q: "Какое ключевое слово объявляет класс?", o: ["class", "struct", "namespace", "using"], c: 0, d: 1 },
    { q: "Какой тип используется для целых чисел?", o: ["int", "string", "bool", "float"], c: 0, d: 1 },
    { q: "Для чего нужен namespace?", o: ["Для ускорения кода", "Чтобы группировать код и избегать конфликтов имён", "Для создания циклов", "Для подключения библиотек"], c: 1, d: 2 },
    { q: "В чём разница value type и reference type?", o: ["Отличий нет", "Value type хранит данные напрямую, reference type — ссылку на данные", "Reference type всегда быстрее", "Value type нельзя использовать в классах"], c: 1, d: 2 },
    { q: "Что такое интерфейс в C#?", o: ["Готовая реализация методов", "Контракт с сигнатурами методов без реализации", "Тип данных для чисел", "Способ комментирования"], c: 1, d: 3 },
    { q: "Что делает ключевое слово override?", o: ["Создаёт новую переменную", "Переопределяет метод базового класса", "Удаляет метод", "Делает метод приватным"], c: 1, d: 3 },
  ],
  english: [
    { q: "Choose the correct word: \"She ___ a teacher.\"", o: ["is", "am", "are", "be"], c: 0, d: 1 },
    { q: "\"I have been living here ___ 2015.\"", o: ["since", "for", "from", "at"], c: 0, d: 1 },
    { q: "Choose the correct passive form: \"The cake ___ by my mother.\"", o: ["was made", "made", "is making", "make"], c: 0, d: 2 },
    { q: "\"If I ___ rich, I would travel the world.\"", o: ["am", "was", "were", "will be"], c: 2, d: 2 },
    { q: "Which word is closest in meaning to \"reluctant\"?", o: ["eager", "unwilling", "curious", "confident"], c: 1, d: 3 },
    { q: "Choose the most natural sentence.", o: ["Despite of the rain, we went out.", "In spite the rain, we went out.", "Despite the rain, we went out.", "Although the rain, we went out."], c: 2, d: 3 },
  ],
};

export const TECH_LEVELS = [
  { max: 0.4, label: "Начальный", color: "#C9C2A8" },
  { max: 0.7, label: "Средний", color: "#B4863A" },
  { max: 1.01, label: "Продвинутый", color: "#3F6B4F" },
];

export const CEFR_MAP = ["A1", "A2", "B1", "B2", "C1", "C2", "C2"];

export function scoreTrack(trackId, answers) {
  const bank = QUESTION_BANKS[trackId];
  let raw = 0, max = 0, correctCount = 0;
  bank.forEach((item, i) => {
    max += item.d;
    if (answers[i] === item.c) {
      raw += item.d;
      correctCount++;
    }
  });
  if (trackId === "english") {
    return { correctCount, total: bank.length, level: CEFR_MAP[correctCount], pct: Math.round((raw / max) * 100) };
  }
  const pct = raw / max;
  const found = TECH_LEVELS.find((l) => pct <= l.max) || TECH_LEVELS[TECH_LEVELS.length - 1];
  return { correctCount, total: bank.length, level: found.label, pct: Math.round(pct * 100) };
}
