<?php
/*
Plugin Name: My custom Blocks
Description: Блоки Gutenberg
*/


if (!defined('ABSPATH')) exit;

/*GALLERY SLIDER */

// ------------------------------
// ------------------------------
// 1️⃣ Регистрация динамического блока Gallery Slider
add_action('init', function () {
    wp_register_script(
        'my-custom-blocks-gallery-slider-editor-script',
        plugins_url('blocks/gallery-slider/index.js', __FILE__),
        ['wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components'],
        '1.0',
        true
    );

    wp_register_style(
        'my-custom-blocks-gallery-slider-editor-style',
        plugins_url('blocks/gallery-slider/editor.css', __FILE__),
        [],
        '1.0'
    );

    wp_register_style(
        'my-custom-blocks-gallery-slider-style',
        plugins_url('blocks/gallery-slider/frontend.css', __FILE__),
        [],
        '1.0'
    );

    register_block_type(__DIR__ . '/blocks/gallery-slider');
});

// ------------------------------
// 3️⃣ Скрипты и стили фронтенда
add_action('wp_enqueue_scripts', function () {
    global $post;
    if (!$post || empty($post->post_content)) return;

    if (!has_block('my-custom-blocks/gallery-slider', $post->post_content)) return;

    // CSS фронтенда
    wp_enqueue_style(
        'my-custom-blocks-gallery-slider-style',
        plugins_url('blocks/gallery-slider/frontend.css', __FILE__),
        [],
        '1.0'
    );

    // JS фронтенда
    wp_register_script(
        'my-custom-blocks-gallery-slider-frontend-script',
        plugins_url('blocks/gallery-slider/frontend.js', __FILE__),
        [],
        '1.0',
        true
    );
    wp_enqueue_script('my-custom-blocks-gallery-slider-frontend-script');

    wp_enqueue_script('sortablejs', 'https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js', [], '1.15.0', true);
});

/*END OF GALLERY SLIDER*/

add_action('init', function () {

    // 1️⃣ JS редактора
    wp_register_script(
        'my-custom-blocks-posts-slider-editor-script',
        plugins_url('blocks/posts-slider/index.js', __FILE__),
        ['wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components'], // без wp-data для отладки
        '1.0',
        true
    );

    // 2️⃣ Стили редактора
    wp_register_style(
        'my-custom-blocks-posts-slider-editor-style',
        plugins_url('blocks/posts-slider/editor.css', __FILE__),
        [],
        '1.0'
    );

    // 3️⃣ Стили фронта
    wp_register_style(
        'my-custom-blocks-posts-slider-style',
        plugins_url('blocks/posts-slider/style.css', __FILE__),
        [],
        '1.0'
    );

    wp_register_script(
        'my-custom-blocks-posts-slider-frontend-script',
        plugins_url('blocks/posts-slider/frontend.js', __FILE__),
        [],
        '1.0',
        true
    );


    // 4️⃣ Регистрируем блок
    register_block_type(__DIR__ . '/blocks/posts-slider', [
        'editor_script' => 'my-custom-blocks-posts-slider-editor-script',
        'editor_style'  => 'my-custom-blocks-posts-slider-editor-style',
        'style'         => 'my-custom-blocks-posts-slider-style',
        'render_callback' => function ($attributes) {
            $render_file = __DIR__ . '/blocks/posts-slider/render.php';
            if (!file_exists($render_file)) return '';
            return include $render_file; // render.php возвращает готовый HTML
        }
    ]);
});

add_action('wp_enqueue_scripts', function () {
    if (!is_singular()) return;
    global $post;
    if (!$post || !has_block('my-custom-blocks/posts-slider', $post->post_content)) return;

    wp_enqueue_style('swiper');
    wp_enqueue_script('swiper');

    wp_enqueue_style('my-custom-blocks-posts-slider-style');
    wp_enqueue_script('my-custom-blocks-posts-slider-frontend-script');
});

// ------------------------------
// ------------------------------
// 1️⃣ Регистрация динамического блока Pics Slider
add_action('init', function () {

    register_block_type(__DIR__ . '/blocks/pics-slider');

    wp_register_script(
        'my-custom-blocks-pics-slider-editor-script',
        plugins_url('blocks/pics-slider/index.js', __FILE__),
        ['wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components'],
        '1.0',
        true
    );

    wp_register_style(
        'my-custom-blocks-pics-slider-editor-style',
        plugins_url('blocks/pics-slider/editor.css', __FILE__),
        [],
        '1.0'
    );

    wp_register_style(
        'my-custom-blocks-pics-slider-style',
        plugins_url('blocks/pics-slider/frontend.css', __FILE__),
        [],
        '1.0'
    );
});

// ------------------------------
// 3️⃣ Скрипты и стили фронтенда
add_action('wp_enqueue_scripts', function () {
    global $post;
    if (!$post || empty($post->post_content)) return;

    if (!has_block('my-custom-blocks/pics-slider', $post->post_content)) return;

    // CSS фронтенда
    wp_enqueue_style(
        'my-custom-blocks-pics-slider-style',
        plugins_url('blocks/pics-slider/frontend.css', __FILE__),
        [],
        '1.0'
    );

    // Swiper (если еще не подключен)
    // wp_register_style(
    //     'swiper',
    //     'https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css',
    //     [],
    //     '10.0.0'
    // );
    // wp_register_script(
    //     'swiper',
    //     'https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js',
    //     [],
    //     '10.0.0',
    //     true
    // );
    // wp_enqueue_style('swiper');
    // wp_enqueue_script('swiper');

    // JS фронтенда
    wp_register_script(
        'my-custom-blocks-pics-slider-frontend-script',
        plugins_url('blocks/pics-slider/frontend.js', __FILE__),
        [],
        '1.0',
        true
    );
    wp_enqueue_script('my-custom-blocks-pics-slider-frontend-script');
});

//простой слайдер из картинок и fancybox
// 1️⃣ Регистрация динамического блока Slider
add_action('init', function () {

    register_block_type(__DIR__ . '/blocks/slider');

    wp_register_script(
        'my-custom-blocks-slider-editor-script',
        plugins_url('blocks/slider/index.js', __FILE__),
        ['wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components'],
        '1.0',
        true
    );

    wp_register_style(
        'my-custom-blocks-slider-editor-style',
        plugins_url('blocks/slider/editor.css', __FILE__),
        [],
        '1.0'
    );

    wp_register_style(
        'my-custom-blocks-slider-style',
        plugins_url('blocks/slider/frontend.css', __FILE__),
        [],
        '1.0'
    );
});

// ------------------------------
// 3️⃣ Скрипты и стили фронтенда
add_action('wp_enqueue_scripts', function () {
    global $post;
    if (!$post || empty($post->post_content)) return;

    if (!has_block('my-custom-blocks/slider', $post->post_content)) return;

    // CSS фронтенда
    wp_enqueue_style(
        'my-custom-blocks-slider-style',
        plugins_url('blocks/slider/frontend.css', __FILE__),
        [],
        '1.0'
    );

    // Swiper (если еще не подключен)
    // wp_register_style(
    //     'swiper',
    //     'https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css',
    //     [],
    //     '10.0.0'
    // );
    // wp_register_script(
    //     'swiper',
    //     'https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js',
    //     [],
    //     '10.0.0',
    //     true
    // );
    // wp_enqueue_style('swiper');
    // wp_enqueue_script('swiper');

    // JS фронтенда
    wp_register_script(
        'my-custom-blocks-slider-frontend-script',
        plugins_url('blocks/slider/frontend.js', __FILE__),
        [],
        '1.0',
        true
    );
    wp_enqueue_script('my-custom-blocks-slider-frontend-script');
});


//Слайдер с товарами

// Регистрируем блок динамически
add_action('init', function () {
    register_block_type(__DIR__ . '/blocks/product-slider', [
        'render_callback' => function ($attributes) {

            // Буферизация рендеринга блока
            $render_file = __DIR__ . '/blocks/product-slider/render.php';
            if (!file_exists($render_file)) return '';

            ob_start();
            include $render_file;
            return ob_get_clean();
        }
    ]);
});

// Регистрируем и подключаем скрипт для фронтенда
add_action('wp_enqueue_scripts', function () {

    global $post;
    if (!isset($post->post_content)) return;

    if (!has_block('my-custom-blocks/product-slider', $post->post_content)) {
        return;
    }

    // 1️⃣ Регистрируем Swiper и кастомный скрипт
    // wp_register_style(
    //     'swiper',
    //     'https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css',
    //     [],
    //     '10.0.0'
    // );

    wp_enqueue_style(
        'my-slider-styles',
        plugins_url('blocks/product-slider/slider-style.css', __FILE__),
        [],
        '1.0'
    );

    // wp_register_script(
    //     'swiper',
    //     'https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js',
    //     [], // без зависимостей
    //     '10.0.0',
    //     true
    // );

    wp_register_script(
        'my-slider-init',
        plugins_url('blocks/product-slider/slider.js', __FILE__),
        [], // без зависимостей
        '1.0',
        true
    );
    wp_enqueue_script('my-slider-init');

    // 2️⃣ Подключаем зарегистрированные скрипты и стили
    wp_enqueue_style('swiper');
    wp_enqueue_script('swiper');
    wp_enqueue_script('my-slider-init');
});

// Слайдер категорий
add_action('init', function () {
    register_block_type(__DIR__ . '/blocks/categories-slider', [
        'render_callback' => function ($attributes) {
            $render_file = __DIR__ . '/blocks/categories-slider/render.php';
            if (!file_exists($render_file)) return '';

            ob_start();
            include $render_file;
            return ob_get_clean();
        }
    ]);
});

add_action('wp_enqueue_scripts', function () {
    if (!is_singular()) return; // только для страниц/постов
    global $post;
    if (!$post || empty($post->post_content)) return;

    // Проверяем наличие блока
    if (!has_block('my-custom-blocks/categories-slider', $post->post_content)) return;

    // Подключаем CSS блока
    wp_enqueue_style(
        'my-cat-slider-styles',
        plugins_url('blocks/categories-slider/cat-slider-style.css', __FILE__),
        [],
        '1.0'
    );

    // Подключаем JS блока
    // wp_enqueue_script(
    //     'my-cat-slider-init',
    //     plugins_url('blocks/categories-slider/cat-slider.js', __FILE__),
    //     [], // зависимость от Swiper
    //     '1.0',
    //     true
    // );
});

add_action('rest_api_init', function () {
    register_rest_field('product_cat', 'image', [
        'get_callback' => function ($term) {
            $thumbnail_id = get_term_meta($term['id'], 'thumbnail_id', true);
            if ($thumbnail_id) {
                $img = wp_get_attachment_image_src($thumbnail_id, 'medium');
                return [
                    'id' => $thumbnail_id,
                    'src' => $img ? $img[0] : '',
                ];
            } else {
                // плейсхолдер
                return [
                    'id' => 0,
                    'src' => plugins_url('blocks/_images/placeholder.svg', __FILE__),
                ];
            }
        },
        'schema' => null,
    ]);
});

// Блок категорий
add_action('init', function () {
    register_block_type(__DIR__ . '/blocks/categories-block', [
        'render_callback' => function ($attributes) {
            $render_file = __DIR__ . '/blocks/categories-block/render.php';
            if (!file_exists($render_file)) return '';

            ob_start();
            include $render_file;
            return ob_get_clean();
        }
    ]);
});

add_action('wp_enqueue_scripts', function () {
    if (!is_singular()) return; // только для страниц/постов
    global $post;
    if (!$post || empty($post->post_content)) return;

    // Проверяем наличие блока
    if (!has_block('my-custom-blocks/categories-block', $post->post_content)) return;

    // Подключаем CSS блока
    wp_enqueue_style(
        'my-cat-block-styles',
        plugins_url('blocks/categories-block/cat-block-style.css', __FILE__),
        [],
        '1.0'
    );

    // Подключаем JS блока
    // wp_enqueue_script(
    //     'my-cat-slider-init',
    //     plugins_url('blocks/categories-block/cat-slider.js', __FILE__),
    //     [], // зависимость от Swiper
    //     '1.0',
    //     true
    // );
});

add_action('rest_api_init', function () {
    register_rest_field('product_cat', 'image', [
        'get_callback' => function ($term) {
            $thumbnail_id = get_term_meta($term['id'], 'thumbnail_id', true);
            if ($thumbnail_id) {
                $img = wp_get_attachment_image_src($thumbnail_id, 'medium');
                return [
                    'id' => $thumbnail_id,
                    'src' => $img ? $img[0] : '',
                ];
            } else {
                // плейсхолдер
                return [
                    'id' => 0,
                    'src' => plugins_url('blocks/_images/placeholder.svg', __FILE__),
                ];
            }
        },
        'schema' => null,
    ]);
});


// Стили для редактора (админки)
add_action('enqueue_block_editor_assets', function () {
    wp_enqueue_style(
        'my-slider-editor-styles',
        plugins_url('blocks/editor-style.css', __FILE__),
        [],
        '1.0'
    );
});

//faq 

// Регистрируем блок динамически
add_action('init', function () {
    register_block_type(__DIR__ . '/blocks/faq-block', [
        'render_callback' => function ($attributes) {

            // Буферизация рендеринга блока
            $render_file = __DIR__ . '/blocks/faq-block/render.php';
            if (!file_exists($render_file)) return '';

            ob_start();
            include $render_file;
            return ob_get_clean();
        }
    ]);
});

// Регистрируем и подключаем скрипт для фронтенда
add_action('wp_enqueue_scripts', function () {

    global $post;
    if (!isset($post->post_content)) return;

    if (!has_block('my-custom-blocks/faq-block', $post->post_content)) {
        return;
    }

    wp_enqueue_style(
        'faq-styles',
        plugins_url('blocks/faq-block/faq-style.css', __FILE__),
        [],
        '1.0'
    );

    // Подключаем JS блока
    wp_enqueue_script(
        'faq-script-init',
        plugins_url('blocks/faq-block/faq.js', __FILE__),
        [],
        '1.0',
        true
    );

    // 2️⃣ Подключаем зарегистрированные скрипты и стили
    wp_enqueue_style('faq-styles');
    wp_enqueue_script('faq-script-init');
    // wp_enqueue_script('my-slider-init');
});

// Стили для редактора (админки)
add_action('enqueue_block_editor_assets', function () {
    wp_enqueue_style(
        'faq-editor-styles',
        plugins_url('blocks/faq-block/editor-faq-style.css', __FILE__),
        [],
        '1.0'
    );
});
