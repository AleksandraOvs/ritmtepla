<?php

/**
 * ============================================================
 *  TYPOGRAPHY MODULE
 *  Управление шрифтами темы (админка + фронт + Gutenberg)
 * ============================================================
 */


/**
 * ------------------------------------------------------------
 * 1. Добавляем страницу настроек в админке
 * ------------------------------------------------------------
 */
add_action('admin_menu', function () {
    add_menu_page(
        'Типографика темы',
        'Типографика',
        'manage_options',
        'theme-typography',
        'render_theme_typography_page',
        'dashicons-editor-textcolor',
        61
    );
});


/**
 * ------------------------------------------------------------
 * 2. Подключаем media uploader только на нашей странице
 * ------------------------------------------------------------
 */
add_action('admin_enqueue_scripts', function ($hook) {

    if ($hook !== 'toplevel_page_theme-typography') {
        return;
    }

    wp_enqueue_media();

    wp_enqueue_script(
        'theme-typography-admin',
        get_template_directory_uri() . '/inc/modules/typography/theme-typography-admin.js',
        [],
        '1.0',
        true
    );

    // CSS для админки
    wp_enqueue_style(
        'theme-typography-admin-style',
        get_template_directory_uri() . '/inc/modules/typography/theme-typography-admin.css',
        [],
        '1.0'
    );
});


/**
 * ------------------------------------------------------------
 * 3. Регистрируем настройки
 * ------------------------------------------------------------
 */
add_action('admin_init', function () {

    register_setting(
        'theme_typography_group',
        'theme_typography_options',
        [
            'sanitize_callback' => 'theme_typography_sanitize'
        ]
    );
});


/**
 * Санитизация всех входящих данных
 */
function theme_typography_sanitize($input)
{
    if (!is_array($input)) {
        return [];
    }

    foreach ($input as $section_key => &$section) {

        $section['family'] = sanitize_text_field($section['family'] ?? '');

        if (!empty($section['weights'])) {
            foreach ($section['weights'] as $weight => &$files) {

                $weight = intval($weight);

                foreach (['woff2', 'woff', 'ttf', 'otf'] as $format) {
                    if (!empty($files[$format])) {
                        $files[$format] = esc_url_raw($files[$format]);
                    }
                }
            }
        }
    }

    return $input;
}


/**
 * ------------------------------------------------------------
 * 4. Рендер страницы настроек
 * ------------------------------------------------------------
 */
function render_theme_typography_page()
{
    $options = get_option('theme_typography_options', []);
?>

    <div class="wrap">
        <h1>Типографика темы</h1>

        <form method="post" action="options.php">
            <?php settings_fields('theme_typography_group'); ?>

            <?php render_font_section('heading', 'Шрифт заголовков (H1–H3)', $options); ?>
            <?php render_font_section('body', 'Основной текст', $options); ?>
            <?php render_font_section('accent', 'Акцентный текст', $options); ?>

            <?php submit_button(); ?>
        </form>
    </div>

<?php
}


/**
 * ------------------------------------------------------------
 * 5. Универсальный вывод секции шрифта
 * ------------------------------------------------------------
 */
function render_font_section($key, $label, $options)
{
    $font = $options[$key] ?? [];
    $weights = [300, 400, 500, 700];
?>

    <div class="tt-accordion">

        <div class="tt-accordion__header">
            <h2><?php echo esc_html($label); ?></h2>
            <span class="tt-accordion__toggle">+</span>
        </div>

        <div class="tt-accordion__content">

            <p>
                <label>Название шрифта (font-family)</label><br>
                <input type="text"
                    name="theme_typography_options[<?php echo $key; ?>][family]"
                    value="<?php echo esc_attr($font['family'] ?? ''); ?>"
                    style="width:400px;">
            </p>

            <?php foreach ($weights as $weight): ?>

                <div class="tt-weight-block">

                    <h4>
                        Вес <?php echo $weight; ?>
                        <button type="button"
                            class="button tt-add-format"
                            data-weight="<?php echo $weight; ?>"
                            data-section="<?php echo $key; ?>">
                            Добавить формат
                        </button>
                    </h4>

                    <?php
                    $formats = ['woff2', 'woff', 'ttf', 'otf'];

                    foreach ($formats as $format):

                        $value = $font['weights'][$weight][$format] ?? '';
                        $is_visible = !empty($value);
                    ?>

                        <div class="tt-format-row <?php echo $is_visible ? 'is-visible' : ''; ?>"
                            data-format="<?php echo $format; ?>">

                            <label><?php echo strtoupper($format); ?> файл</label><br>

                            <input type="text"
                                class="font-file-input"
                                name="theme_typography_options[<?php echo $key; ?>][weights][<?php echo $weight; ?>][<?php echo $format; ?>]"
                                value="<?php echo esc_attr($value); ?>"
                                style="width:400px;">

                            <button type="button"
                                class="button upload-font-button">
                                Выбрать
                            </button>

                        </div>

                    <?php endforeach; ?>

                </div>

            <?php endforeach; ?>

        </div>
    </div>

<?php
}


/**
 * ------------------------------------------------------------
 * 6. Получаем опции (единая точка доступа)
 * ------------------------------------------------------------
 */
function theme_typography_get_options()
{
    return get_option('theme_typography_options', []);
}


/**
 * ------------------------------------------------------------
 * 7. Генерация @font-face и preload
 * ------------------------------------------------------------
 */
add_action('wp_head', function () {

    $options = theme_typography_get_options();
    if (!$options) return;

    $font_faces = '';
    $preloads   = [];
    $formats    = ['woff2', 'woff', 'ttf', 'otf'];

    foreach ($options as $section) {

        if (empty($section['family']) || empty($section['weights'])) {
            continue;
        }

        foreach ($section['weights'] as $weight => $files) {

            $sources = [];

            foreach ($formats as $format) {
                if (!empty($files[$format])) {
                    $sources[] = "url('{$files[$format]}') format('{$format}')";
                }
            }

            if (!$sources) continue;

            $font_faces .= "@font-face{
                font-family:'{$section['family']}';
                src:" . implode(',', $sources) . ";
                font-weight:{$weight};
                font-style:normal;
                font-display:swap;
            }";

            // preload только woff2
            if (!empty($files['woff2'])) {
                $preloads[$files['woff2']] = true;
            }
        }
    }

    // Вывод preload (без дублей)
    foreach (array_keys($preloads) as $url) {
        echo "<link rel='preload' href='{$url}' as='font' type='font/woff2' crossorigin>";
    }

    if ($font_faces) {
        echo "<style>{$font_faces}</style>";
    }
}, 1);


/**
 * ------------------------------------------------------------
 * 8. Генерация CSS переменных + применение
 * ------------------------------------------------------------
 */
add_action('wp_enqueue_scripts', function () {

    $options = theme_typography_get_options();
    if (!$options) return;

    $css = ':root{';

    if (!empty($options['heading']['family'])) {
        $css .= "--font-heading:'{$options['heading']['family']}',-apple-system,BlinkMacSystemFont,sans-serif;";
    }

    if (!empty($options['body']['family'])) {
        $css .= "--font-body:'{$options['body']['family']}',-apple-system,BlinkMacSystemFont,sans-serif;";
    }

    if (!empty($options['accent']['family'])) {
        $css .= "--font-accent:'{$options['accent']['family']}',-apple-system,BlinkMacSystemFont,sans-serif;";
    }

    $css .= '}';

    wp_add_inline_style('theme-style', $css);
});


/**
 * ------------------------------------------------------------
 * 9. Поддержка Gutenberg
 * ------------------------------------------------------------
 */
add_action('enqueue_block_editor_assets', function () {

    $options = theme_typography_get_options();
    if (!$options) return;

    $css = ':root{';

    if (!empty($options['heading']['family'])) {
        $css .= "--font-heading:'{$options['heading']['family']}',sans-serif;";
    }

    if (!empty($options['body']['family'])) {
        $css .= "--font-body:'{$options['body']['family']}',sans-serif;";
    }

    $css .= '}';

    wp_add_inline_style('wp-block-library', $css);
});


/**
 * ------------------------------------------------------------
 * 10. Разрешаем загрузку шрифтов
 * ------------------------------------------------------------
 */

add_filter('wp_check_filetype_and_ext', function ($data, $file, $filename, $mimes) {

    $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

    if (in_array($ext, ['ttf', 'otf', 'woff', 'woff2'])) {
        $data['ext']  = $ext;
        $data['type'] = $mimes[$ext];
    }

    return $data;
}, 10, 4);
