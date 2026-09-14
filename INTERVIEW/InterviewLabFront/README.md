# InterviewLab Frontend

Фронтенд AI-платформы технического найма: HR создаёт тесты, приглашает кандидатов,
наблюдает за прохождением в реальном времени с трансляцией экрана и камеры,
получает AI-анализ решений.

> **Нужен запущенный бэкенд.** Весь `shared/services/api.ts` ходит в реальный API
> ([InterviewLabBack](https://github.com/tihon2008vlasov-boop/InterviewLabBack)).
> Без него логин покажет ошибку «Не удалось связаться с сервером».
> Папка `src/shared/mocks/` удалена — offline demo и фикстур в проекте больше нет.

Адрес API задаётся переменной `VITE_API_URL` (по умолчанию `http://127.0.0.1:8000/api`).
Файл `.env.example` хранится в репозитории и не содержит секретов; локальный `.env`
игнорируется Git.

## Стек

| Технология | Зачем |
|---|---|
| React 19 + Vite + TypeScript | база |
| TailwindCSS v4 | стили, дизайн-токены в `src/styles/index.css` |
| React Router 7 | роутинг, lazy-загрузка страниц с ретраем |
| Zustand | auth-стор (persist), тосты, драфт конструктора тестов |
| React Hook Form + Zod | формы и валидация |
| i18next / react-i18next | локализация ru/en (`src/locales/`) |
| TanStack Table | таблица кандидатов |
| Recharts | графики дашборда и аналитики |
| Monaco Editor | редактор кода (воркспейс, replay, submitted code) |
| Framer Motion | анимации, drag&drop заданий |
| React Three Fiber | 3D-сфера на лендинге |
| Lucide React | иконки |
| Pyodide | исполнение Python прямо в браузере (файлы в `public/pyodide/`, работает офлайн) |
| WebRTC + WebSocket | P2P-трансляция камеры/экрана и signaling |
| MediaRecorder | запись сессии, заливка чанками на backend |
| TensorFlow.js + COCO-SSD + BlazeFace | локальная детекция телефона, второго человека и лица |
| Web Speech API | распознавание речи кандидата (подсказки вслух) |

## Запуск

Требования: Node.js `20.19+` или `22.12+`, npm `10+` и запущенный локально backend.

```bash
git clone https://github.com/tihon2008vlasov-boop/InterviewLabFront.git
cd InterviewLabFront
npm ci
cp .env.example .env      # Windows: copy .env.example .env
npm run dev               # http://localhost:5173
```

Прочие команды:

```bash
npm run build      # tsc -b + прод-сборка в dist/
npm run preview    # локальный просмотр сборки
npm run lint       # oxlint по src
npx tsc -b         # только проверка типов
```

**Вход:** после `python -m app.seed` в бэкенде — `hr@interviewlab.ai / Password123!`.

**Ссылка кандидата:** `http://localhost:5173/test/DEMO01` (код из сида) — hardware check,
имя/email, затем VS Code-воркспейс; события сессии летят в API и видны HR в Live sessions.

## Переменные окружения

```env
VITE_API_URL=http://127.0.0.1:8000/api

# TURN обязателен в production для кандидатов и HR за строгим NAT/firewall
VITE_TURN_URL=
VITE_TURN_USERNAME=
VITE_TURN_CREDENTIAL=
```

Локально достаточно публичных STUN-серверов. В production **обязательно** настройте TURN,
иначе P2P-соединение между некоторыми корпоративными сетями и строгими NAT не установится.

## Live-прокторинг

- Кандидат до старта явно разрешает камеру, микрофон и показ **всего экрана**.
- Кадры и звук анализируются **локально в браузере** (TensorFlow.js и Web Speech API)
  и на backend не отправляются — туда уходит только текстовый журнал инцидентов.
- В журнал попадают: `face_missing`, `identity_mismatch`, `multiple_people`, `phone_detected`,
  `looking_away`, `speech_detected`, `sustained_audio`, `tab_hidden`, `camera_stopped`,
  `camera_obstructed`, `screen_share_stopped`, `paste`.
  Каждый — со своей severity (`info` / `warning` / `critical`).
- HR открывает `/dashboard/sessions` и видит экран, камеру и события в реальном времени.
- Перед подключением HR кандидат всегда получает уведомление и трёхсекундный отсчёт.
- Видео и аудио идут peer-to-peer через WebRTC, backend используется только для signaling.
- Параллельно `ProctoringSessionRecorder` пишет композит «экран + камера» (1280×720, 15 fps,
  чанк раз в 5 сек) и заливает на `/api/proctoring/recordings/...`. Запись доступна во
  вкладке **Proctoring** карточки кандидата.

Веса моделей TFJS подтягиваются из сети при первом запуске воркспейса. Если загрузка
не удалась, воркспейс не падает — пишет инцидент `vision_limited` и работает с урезанным
набором проверок.

> Камера, микрофон и `getDisplayMedia` доступны только на **https или localhost**.
> По `http://192.168.x.x` браузер их заблокирует.

## Основные маршруты

| Путь | Что это |
|---|---|
| `/` | лендинг |
| `/login` `/register` `/forgot-password` `/reset-password` | авторизация |
| `/dashboard` | дашборд HR: статы, графики, активность |
| `/dashboard/tests` | список тестов |
| `/dashboard/tests/new` · `/dashboard/tests/:testId/edit` | конструктор теста |
| `/dashboard/tests/:testId` | страница теста: задания, инвайт-ссылки, email-приглашения |
| `/dashboard/tests/:testId/tasks/:taskId` | конструктор задания (Monaco, ресурсы, прокторинг) |
| `/dashboard/sessions` | live-мониторинг прохождений + подключение к трансляции |
| `/dashboard/candidates` | таблица кандидатов |
| `/dashboard/candidates/:candidateId` | карточка кандидата (вкладки ниже) |
| `/dashboard/analytics` | аналитика |
| `/dashboard/settings` · `/dashboard/settings/:section` | настройки (профиль, компания, команда, тариф, API…) |
| `/test/:code` | воркспейс кандидата в стиле VS Code (hardware check → IDE → submit) |

Вкладки карточки кандидата: **Overview**, **AI Analysis**, **Сравнение** (только для
frontend-заданий с макетом), **Code Replay**, **Submitted Code**, **Timeline**, **Proctoring**.

> Страница настроек подключена к backend API: сохраняет профиль и компанию,
> настройки уведомлений, меняет пароль, управляет API-ключом и участниками команды.
> Аватар и логотип отправляются как data URL, а бэкенд кладёт их в MongoDB (GridFS)
> и возвращает ссылку `/files/<id>`. Абсолютный адрес для тега `<img>` собирает
> `resolveFileUrl` из `shared/services/http.ts`. Принимаются PNG, JPEG, WebP и GIF
> до 2 МБ; SVG отклоняется.

> Роут админки платформы (`/dashboard/admin/...`) в текущей версии отсутствует.
> Ручка `GET /api/team` на бэкенде есть и используется в настройках («Команда»).

## Архитектура

```
src/
  app/
    router/          # createBrowserRouter, RequireAuth, LockToActiveTest, lazyWithRetry
    layouts/         # AuthLayout, DashboardLayout
  pages/             # тонкие страницы, собирают фичи
  features/          # модули: landing, auth, dashboard, tests, invitations,
                     # candidates, proctoring, workspace
  shared/
    components/ui/   # дизайн-система: Button, Modal, Tabs, Toast, Skeleton…
    hooks/           # useFetch, useCopyToClipboard, useCountUp
    services/
      http.ts        # базовый клиент: VITE_API_URL, JWT, таймауты, ApiError
      api.ts         # все домены API: auth, dashboard, tests, taskLibrary,
                     # candidates, analytics, team, notifications, settings
      backendMappers.ts  # snake_case (бэк) → camelCase (фронт)
      liveSessions.ts    # активные сессии для Live sessions
      aiTaskGenerator.ts # /ai/tasks/generate и /ai/tasks/mockup
    store/           # zustand: auth, toasts
    types/           # доменные типы
    constants/       # языки, уровни, статусы, меты бейджей
    animations/      # варианты Framer Motion
  locales/           # ru.json, en.json
  styles/            # Tailwind v4 @theme токены
```

Модули воркспейса кандидата:

```
features/workspace/
  sessionClient.ts     # старт сессии по коду, heartbeat-события, submit
  proctoringSocket.ts  # WebSocket-signaling + WebRTC peer-соединение
  proctoringVision.ts  # COCO-SSD + BlazeFace, детекция инцидентов
  speechMonitor.ts     # Web Speech API: речь кандидата и длительный посторонний звук
  proctoringTypes.ts   # ProctorIncident, ProctoringMedia, ViewerNotice
  sessionRecorder.ts   # композит экран+камера, MediaRecorder, заливка чанков
  activeSession.ts     # запоминает незавершённый тест в этом браузере
  pyodideRunner.ts     # запуск Python в воркере из public/pyodide/
  HardwareCheck.tsx    # проверка железа и получение согласия на прокторинг
```

Кандидат с незавершённым тестом заперт в воркспейсе: `LockToActiveTest`
(`app/router/`) редиректит его обратно на `/test/:code`, если он вручную поменяет
адрес в строке браузера. Страницы `/dashboard/*` под блокировку не попадают, чтобы
HR не залип в чужой сессии, открытой в том же браузере.

## Интеграция с бэкендом

Единственная точка входа в сеть — `shared/services/http.ts` (`apiFetch`): подставляет
`VITE_API_URL`, JWT из auth-стора, таймаут 4 сек, разворачивает ошибки в `ApiError`.
Поверх него:

- `features/auth/realAuth.ts` — `/auth/login`, `/auth/register`
- `shared/services/api.ts` — тесты, библиотека заданий, кандидаты, дашборд, аналитика,
  команда, уведомления, настройки (`/settings/*`)
- `shared/services/liveSessions.ts` — `/sessions/` для страницы Live sessions
- `features/workspace/sessionClient.ts` — старт сессии по коду, heartbeat, submit
- `features/workspace/proctoringSocket.ts` — `WS /api/proctoring/ws/{session_id}`
- `features/workspace/sessionRecorder.ts` — `/api/proctoring/recordings/...`

Бэк отдаёт `snake_case`, фронт мапит в `camelCase` в `shared/services/backendMappers.ts` —
добавляя поле в API, начинай оттуда.

## Дизайн-система

Белая тема в духе Linear/Stripe: минимализм, чёткие линии, почти без скруглений.
Токены объявлены в `src/styles/index.css` (`--color-accent: #2563eb`, `--color-ink`,
`--color-line`…), шрифты — Inter + JetBrains Mono. Тёмные поверхности используются
только в воркспейсе кандидата и код-вьюверах.
