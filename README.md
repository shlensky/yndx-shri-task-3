# Задание 3. Найдите ошибки

В этом репозитории находятся материалы тестового задания «Найди ошибки» для [15-й Школы разработки интерфейсов](https://yandex.ru/promo/academy/shri) (осень 2019, Москва).

Для работы приложения нужен [Node.JS](https://nodejs.org/en/) v10 или выше, а также редактор [VS Code](https://code.visualstudio.com).

## Задание

**Вам дан исходный код приложения, в котором есть ошибки. Некоторые из них стилистические, а другие даже не позволят запустить приложение. Вам нужно найти все ошибки и исправить их.**

Тестовое приложение — это плагин VS Code для удобного прототипирования интерфейсов с помощью дизайн-системы из первого задания. Вы можете описать в файле `.json` блоки, из которых состоит интерфейс. Плагин добавляет превью (1) и линтер (2) для структуры блоков.

![скриншот интерфейса](extension.png)

### 1. Превью интерфейса

- Превью интерфейса доступно для всех файлов `.json`.
- Превью открывается в отдельной вкладке:
  - при выполнении команды `Example: Show preview` через палитру команд;
  - при нажатии кнопки сверху от редактора (см. скриншот);
  - при нажатии горячих клавиш **⌘⇧V** (для macOS) или **Ctrl+Shift+V** (для Windows).
- Вкладка превью должна открываться рядом с текущим редактором.
- Если превью уже открыто, то вместо открытия ещё одной вкладки пользователь должен переходить к уже открытой.
- При изменении структуры блоков в редакторе превью должно обновляться.
- Сейчас превью отображает структуру блоков в виде прямоугольников — реализуйте отображение превью с помощью вёрстки и JS из первого задания.

### 2. Линтер структуры блоков

- Линтер применяется для всех файлов `.json`.
- Линтер подсвечивает ошибочное место в файле и отображает сообщение при наведении мыши.
- Линтер отображает сообщения на панели `Problems` (**⌘⇧M** для macOS или **Ctrl+Shift+M** для Windows), сообщения группируются по файлам, при клике происходит переход к ошибочному месту.
- Сейчас плагин использует линтер-заглушку, проверяющий всего два правила: 1) «запрещены названия полей в верхнем регистре»; 2) «в каждом объекте должно быть поле `block`». Подключите в проект линтер из второго задания.

### 3. Настройки

Плагин добавляет в настройки VS Code новый раздел `Example` с параметрами:

- `example.enable` — использовать линтер;
- `example.severity.uppercaseNamesIsForbidden` — тип сообщения для правила «запрещены названия полей в верхнем регистре»;
- `example.severity.blockNameIsRequired` — тип сообщения для правила «в каждом объекте должно быть поле `block`».

Типы сообщений: `Error`, `Warning`, `Information`, `Hint`.

При изменении конфигурации новые настройки должны применяться к работе линтера.

## Как запустить

1. Открыть проект в VS Code.
2. Запустить `npm i`.
3. Нажать `F5`.

Должно открыться ещё одно окно VS Code с подключённым плагином.

## Что мы проверяем этим заданием

В этом задании мы хотим проверить вашу способность разобраться в незнакомом коде и API, а также ваш навык отладки. Пожалуйста, опишите в коде или файле README ход ваших мыслей: какие ошибки и как вы нашли, почему они возникли, какие способы их исправления существуют. Мы не ограничиваем вас в использовании сторонних инструментов и библиотек, но будем ждать от вас комментария — что и зачем вы использовали.


## Найденные ошибки

1. Ошибки комплияции, просто исправил те места на которые ругался tsc.

2. Опечатка в названии команды showPrevievToSide, нашел поиском по исходным файлам.

3. Неправильное подключение стилей в файле index.html
Было видно, что не применяются css стили файла style.css.
Для отладки запустил Webview Developer Tools, что бы посмотреть ошибки в консоле.
Оказалось что <base href={{mediaPath}}> не работал, пришлось добавить {{mediaPath}} в то место где подключались стили и скрипт.
+ убрал из Content-Security-Policy nonce для стилей.

4. Линтер не подсвечивал места с ошибками
Добавил launch configuration для attach to server, что бы можно было делать breakpoint'ы в коде сервера.
Во время отладки увидел код "errors.concat(...);", заменил на errors = errors.contact(...)
т.к. знал что concat не модифицирует исходный массив.

5. Добавил старт/остановку language client'a в зависимости от настройки "example.enable".

6. Конструкция показалось странной:
    const e = panel.onDidDispose(() => {
        delete PANELS[document.uri.path];
        e.dispose();
    });

    сделал что бы выглядела так же как в документации:

    panel.onDidDispose(() => {
        delete PANELS[document.uri.path];
    });

7. Отформатировал код (в некоторых файлах были и табы и пробелы, двойные и одиночные кавычки)
+ Удалил непонятные файлы jsonMain.ts и hash.ts которые не задействованы в проекте (+ удалил npm пакет request-light).

8. Поправил вызов sendDiagnostics даже когда нет ошибок, иначе последняя ошибка не пропадала после исправления.
