export const eventNames = {
  joined: 'Регистрация', connected: 'Подключение', disconnected: 'Потеря связи',
  session_started: 'Начало тестирования', screen_started: 'Экран подключён', screen_stopped: 'Трансляция остановлена',
  tab_hidden: 'Уход с вкладки', tab_visible: 'Возврат на вкладку', window_blur: 'Потеря фокуса окна', window_focus: 'Возврат в окно',
  fullscreen_enter: 'Полноэкранный режим', fullscreen_exit: 'Выход из полного экрана', paste: 'Вставка текста',
  task_opened: 'Открыто задание', answers_saved: 'Ответы сохранены', submitted: 'Работа сдана', auto_submitted: 'Автоматическая сдача',
  recording_started: 'Запись экрана началась', recording_stopped: 'Запись экрана остановлена', recording_saved: 'Фрагмент записи сохранён',
  recording_error: 'Ошибка записи экрана', grade_saved: 'Оценка сохранена',
};
export const controlEvents = new Set(['tab_hidden', 'window_blur', 'fullscreen_exit', 'paste', 'screen_stopped', 'disconnected', 'recording_error']);
export const logTime = at => new Date(at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
