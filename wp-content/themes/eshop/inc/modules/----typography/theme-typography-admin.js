document.addEventListener('DOMContentLoaded', function () {

    /* =========================================
       АККОРДЕОН
    ========================================= */

    const accordions = document.querySelectorAll('.tt-accordion');

    accordions.forEach(function (accordion) {

        const header = accordion.querySelector('.tt-accordion__header');
        const content = accordion.querySelector('.tt-accordion__content');
        const toggle = accordion.querySelector('.tt-accordion__toggle');

        header.addEventListener('click', function () {

            const isOpen = content.style.display === 'block';

            // Закрываем все остальные (по желанию — можно убрать)
            document.querySelectorAll('.tt-accordion__content')
                .forEach(el => el.style.display = 'none');

            document.querySelectorAll('.tt-accordion__toggle')
                .forEach(el => el.textContent = '+');

            if (!isOpen) {
                content.style.display = 'block';
                toggle.textContent = '–';
            }
        });
    });


    /* =========================================
    MEDIA UPLOADER
 ========================================= */

    const uploadButtons = document.querySelectorAll('.upload-font-button');

    uploadButtons.forEach(function (button) {

        button.addEventListener('click', function (e) {

            e.preventDefault();

            // Ищем родителя .tt-format-row вместо <p>
            const formatRow = button.closest('.tt-format-row');
            if (!formatRow) return; // защита на случай, если родителя нет

            const input = formatRow.querySelector('.font-file-input');
            if (!input) return; // защита на случай, если input не найден

            const frame = wp.media({
                title: 'Выберите файл шрифта',
                button: { text: 'Использовать файл' },
                multiple: false
            });

            frame.on('select', function () {
                const attachment = frame.state().get('selection').first().toJSON();
                input.value = attachment.url;
            });

            frame.open();
        });

    });
    /* =========================
      ДОБАВИТЬ ФОРМАТ
   ========================== */

    document.querySelectorAll('.tt-add-format').forEach(function (button) {

        button.addEventListener('click', function () {

            const weightBlock = button.closest('.tt-weight-block');
            const rows = weightBlock.querySelectorAll('.tt-format-row');

            // ищем первый скрытый формат
            const hiddenRow = Array.from(rows).find(row =>
                !row.classList.contains('is-visible')
            );

            if (hiddenRow) {
                hiddenRow.classList.add('is-visible');
            } else {
                alert('Все форматы уже добавлены');
            }

        });

    });

});