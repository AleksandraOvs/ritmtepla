<?php
/*
Plugin Name: Custom WooCommerce Filters
Description: AJAX фильтр товаров WooCommerce через шорткод [shop_filters]
Version: 3.0
Author: PurpleWeb
*/

if (!defined('ABSPATH')) exit;

/* ---------------------------------------------------
 * ЛОГИРОВАНИЕ (WP DEBUG)
 * --------------------------------------------------- */
function cwc_log($label, $data = null)
{
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('[CWC] ' . $label . ': ' . print_r($data, true));
    }
}

/* ---------------------------------------------------
 * Подключение JS и CSS
 * --------------------------------------------------- */
add_action('wp_enqueue_scripts', function () {

    wp_enqueue_script('jquery-ui-slider');
    wp_enqueue_style('jquery-ui-style', 'https://code.jquery.com/ui/1.13.2/themes/base/jquery-ui.css');

    wp_enqueue_style('cwc-style', plugin_dir_url(__FILE__) . 'css/style.css');

    wp_enqueue_script(
        'cwc-basic-scripts',
        plugin_dir_url(__FILE__) . 'js/scripts.js',
        [],
        null,
        true
    );

    wp_enqueue_script(
        'cwc-ajax-filters',
        plugin_dir_url(__FILE__) . 'js/admin-ajax.js',
        ['jquery', 'jquery-ui-slider'],
        '3.0',
        true
    );

    wp_localize_script('cwc-ajax-filters', 'cwc_ajax_object', [
        'ajax_url' => admin_url('admin-ajax.php')
    ]);
});

/* ---------------------------------------------------
 * Получить активные фильтры
 * --------------------------------------------------- */
function cwc_get_active_filters()
{
    $filters = [];

    foreach ($_POST as $key => $value) {
        if (preg_match('/^filter_([a-z0-9_\-]+)$/', $key, $m)) {
            $filters[$m[1]] = (array) $value;
        }
    }

    // 🔥 LOG: какие фильтры распарсились
    cwc_log('PARSED ACTIVE FILTERS', $filters);

    return $filters;
}

function cwc_render_attribute_filter_dynamic($taxonomy, $title, $current_cat_id = 0, $active_filters = [])
{
    global $wpdb;

    $real_taxonomy = $taxonomy;
    $slugs = [];

    // 🔥 разделяем цвет и подключение
    if ($taxonomy === 'product_tag_color') {
        $real_taxonomy = 'product_tag';
        $slugs = ['white', 'black'];
    }

    if ($taxonomy === 'product_tag_connection') {
        $real_taxonomy = 'product_tag';
        $slugs = ['side', 'lower'];
    }

    // 🔥 получаем доступные term_id внутри категории
    if ($real_taxonomy === 'product_tag') {

        $term_ids = $wpdb->get_col("
            SELECT DISTINCT tt.term_id
            FROM {$wpdb->term_relationships} tr
            INNER JOIN {$wpdb->term_taxonomy} tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
            INNER JOIN {$wpdb->posts} p ON tr.object_id = p.ID
            INNER JOIN {$wpdb->term_relationships} tr_cat ON p.ID = tr_cat.object_id
            INNER JOIN {$wpdb->term_taxonomy} tt_cat ON tr_cat.term_taxonomy_id = tt_cat.term_taxonomy_id
            WHERE p.post_type = 'product'
            AND p.post_status = 'publish'
            AND tt.taxonomy = 'product_tag'
            AND tt_cat.taxonomy = 'product_cat'
            " . ($current_cat_id ? "AND tt_cat.term_id = " . (int)$current_cat_id : "") . "
        ");

        $terms = get_terms([
            'taxonomy'   => 'product_tag',
            'hide_empty' => true,
            'include'    => $term_ids,
            'slug'       => $slugs,
        ]);
    } else {

        $terms = get_terms([
            'taxonomy'   => $taxonomy,
            'hide_empty' => false
        ]);
    }

    if (empty($terms) || is_wp_error($terms)) return '';

    $items_html = '';

    foreach ($terms as $term) {

        $tax_query = ['relation' => 'AND'];

        // категория
        if ($current_cat_id) {
            $tax_query[] = [
                'taxonomy' => 'product_cat',
                'field'    => 'term_id',
                'terms'    => $current_cat_id,
            ];
        }

        // активные фильтры (🔥 важно: маппим обратно в product_tag)
        foreach ($active_filters as $tax => $values) {

            $mapped_tax = ($tax === 'product_tag_color' || $tax === 'product_tag_connection')
                ? 'product_tag'
                : $tax;

            $tax_query[] = [
                'taxonomy' => $mapped_tax,
                'field'    => 'slug',
                'terms'    => $values,
                'operator' => 'IN',
            ];
        }

        // текущий термин
        $tax_query[] = [
            'taxonomy' => $real_taxonomy,
            'field'    => 'slug',
            'terms'    => $term->slug,
        ];

        $query = new WP_Query([
            'post_type' => 'product',
            'posts_per_page' => 1,
            'tax_query' => $tax_query,
        ]);

        if (!$query->found_posts) continue;

        $is_active = isset($active_filters[$taxonomy]) && in_array($term->slug, $active_filters[$taxonomy]);

        $items_html .= '<li>
            <a href="#"
                class="filter-item ' . ($is_active ? 'active' : '') . '"
                data-slug="' . esc_attr($term->slug) . '"
                data-taxonomy="' . esc_attr($taxonomy) . '">
                ' . esc_html($term->name) . '
            </a>
        </li>';
    }

    if (empty($items_html)) return '';

    ob_start();
?>

    <div class="single-sidebar-wrap">
        <h3 class="sidebar-title"><?php echo esc_html($title); ?></h3>

        <div class="sidebar-body">
            <ul class="sidebar-list" data-taxonomy="<?php echo esc_attr($taxonomy); ?>">
                <?php echo $items_html; ?>
            </ul>
        </div>
    </div>

<?php
    return ob_get_clean();
}

/* ---------------------------------------------------
 * Рендер всех фильтров
 * --------------------------------------------------- */
function cwc_render_filters_with_context($current_cat_id, $active_filters = [])
{
    $taxonomies = [
        'product_tag_color' => 'Цвет',
        'product_tag_connection' => 'Подключение',
        'pa_kolichestvo-sec' => 'Количество секций',
        'pa_pl-obogreva' => 'Площадь обогрева',
        'pa_teplootdacha' => 'Теплоотдача',
    ];

    $html = '';

    foreach ($taxonomies as $taxonomy => $title) {

        $filters_for_this = $active_filters;
        unset($filters_for_this[$taxonomy]);

        $html .= cwc_render_attribute_filter_dynamic(
            $taxonomy,
            $title,
            $current_cat_id,
            $filters_for_this
        );
    }

    $html .= '
        <div class="cwc-filter-actions">
            <button id="cwc-reset-filters" class="cwc-reset-filters">
                Сбросить фильтры
            </button>
        </div>
    ';

    return $html;
}

/* ---------------------------------------------------
 * ШОРТКОД
 * --------------------------------------------------- */
function cwc_shop_filters_shortcode()
{
    $current_cat_id = is_product_category() ? get_queried_object_id() : 0;

    ob_start(); ?>



    <div class="sidebar-area-wrapper _filters"
        data-current-cat="<?php echo esc_attr($current_cat_id); ?>">

        <button class="toggle-filter">
            <span>Фильтры</span>
            <svg width="19" height="17" viewBox="0 0 19 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.5 8.5V0.5M16.5 16.5V13.5M2.5 16.5V12.5M16.5 9.5V0.5M9.5 3.5V0.5M9.5 16.5V7.5" stroke="black" stroke-linecap="round" />
                <path d="M2.5 12.5C3.60457 12.5 4.5 11.6046 4.5 10.5C4.5 9.39543 3.60457 8.5 2.5 8.5C1.39543 8.5 0.5 9.39543 0.5 10.5C0.5 11.6046 1.39543 12.5 2.5 12.5Z" stroke="black" stroke-linecap="round" />
                <path d="M9.5 7.5C10.6046 7.5 11.5 6.60457 11.5 5.5C11.5 4.39543 10.6046 3.5 9.5 3.5C8.39543 3.5 7.5 4.39543 7.5 5.5C7.5 6.60457 8.39543 7.5 9.5 7.5Z" stroke="black" stroke-linecap="round" />
                <path d="M16.5 13.5C17.6046 13.5 18.5 12.6046 18.5 11.5C18.5 10.3954 17.6046 9.5 16.5 9.5C15.3954 9.5 14.5 10.3954 14.5 11.5C14.5 12.6046 15.3954 13.5 16.5 13.5Z" stroke="black" stroke-linecap="round" />
            </svg>

        </button>

        <?php
        echo cwc_render_filters_with_context($current_cat_id);
        ?>

    </div>

<?php
    return ob_get_clean();
}
add_shortcode('shop_filters', 'cwc_shop_filters_shortcode');

/* ---------------------------------------------------
 * Default attributes для вариативных товаров
 * --------------------------------------------------- */
function cwc_get_default_attributes_meta_query($active_filters)
{
    $meta_query = [];

    foreach ($active_filters as $taxonomy => $terms) {

        // 🔥 ВОТ ЭТОТ ФИЛЬТР ДОБАВЛЯЕМ
        if (strpos($taxonomy, 'pa_') !== 0) {
            continue;
        }

        $meta_key = 'attribute_' . $taxonomy;

        $meta_query[] = [
            'key'     => $meta_key,
            'value'   => $terms,
            'compare' => 'IN',
        ];
    }

    return $meta_query;
}

/* ---------------------------------------------------
 * AJAX
 * --------------------------------------------------- */
add_action('wp_ajax_cwc_filter_products', 'cwc_filter_products');
add_action('wp_ajax_nopriv_cwc_filter_products', 'cwc_filter_products');

function cwc_filter_products()
{
    // 🔥 FIX: заранее объявляем debug (убирает warning IDE)
    $debug = [
        'received_post'   => [],
        'active_filters'  => [],
        'tax_queries'     => [],
        'meta_queries'    => [],
        'final_args'      => [],
        'found_posts'     => 0,
    ];

    // 🔥 LOG: raw request
    cwc_log('RAW REQUEST', $_POST);

    $debug['received_post'] = $_POST;


    $current_cat_id = !empty($_POST['current_cat_id']) ? (int) $_POST['current_cat_id'] : 0;
    $active_filters = cwc_get_active_filters();

    // 🔥 LOG: parsed filters
    cwc_log('ACTIVE FILTERS', $active_filters);

    $args = [
        'post_type'      => 'product',
        'post_status'    => 'publish',
        'posts_per_page' => 12,
        'meta_query'     => ['relation' => 'AND'],
    ];

    $tax_query = [];

    // категория — всегда обязательна
    if ($current_cat_id) {
        $tax_query[] = [
            'taxonomy' => 'product_cat',
            'field'    => 'term_id',
            'terms'    => $current_cat_id,
        ];
    }

    // фильтры (объединяем через OR)
    if (!empty($active_filters)) {

        $product_tag_terms = [];

        foreach ($active_filters as $taxonomy => $terms) {

            // 🔥 собираем все product_tag (цвет + подключение)
            if ($taxonomy === 'product_tag_color' || $taxonomy === 'product_tag_connection') {

                $product_tag_terms = array_merge($product_tag_terms, $terms);
                continue;
            }

            // остальные атрибуты как есть (AND)
            $tax_query[] = [
                'taxonomy' => $taxonomy,
                'field'    => 'slug',
                'terms'    => array_map('wc_clean', $terms),
                'operator' => 'IN',
            ];
        }

        // 🔥 один общий блок для product_tag
        if (!empty($product_tag_terms)) {
            $tax_query[] = [
                'taxonomy' => 'product_tag',
                'field'    => 'slug',
                'terms'    => array_map('wc_clean', $product_tag_terms),
                'operator' => 'AND', // 🔥 ВАЖНО
            ];
        }
    }
    // применяем
    $args['tax_query'] = $tax_query;

    // 🔥 default attributes
    $default_meta_query = cwc_get_default_attributes_meta_query($active_filters);

    if (!empty($default_meta_query)) {

        $meta_block = [
            'relation' => 'OR',
            [
                'key'     => '_product_type',
                'compare' => 'NOT EXISTS',
            ],
            ...$default_meta_query
        ];

        $args['meta_query'][] = $meta_block;

        cwc_log('META QUERY BLOCK', $meta_block);
    }

    // сортировка
    $ordering = WC()->query->get_catalog_ordering_args($_POST['orderby'] ?? '');
    $args['orderby'] = $ordering['orderby'];
    $args['order']   = $ordering['order'];

    if (!empty($ordering['meta_key'])) {
        $args['meta_key'] = $ordering['meta_key'];
    }

    // 🔥 LOG FINAL ARGS
    cwc_log('FINAL WP_QUERY ARGS', $args);

    $query = new WP_Query($args);

    cwc_log('FOUND POSTS', $query->found_posts);

    ob_start();

    if ($query->have_posts()) {
        while ($query->have_posts()) {
            $query->the_post();
            wc_get_template_part('content', 'product');
        }
    } else {
        echo '<p>Товары не найдены</p>';
    }

    wp_reset_postdata();

    $filters_html = cwc_render_filters_with_context($current_cat_id, $active_filters);

    wp_send_json_success([
        'html'    => ob_get_clean(),
        'filters' => $filters_html,
        'debug'   => $debug, // 🔥 уже есть — просто используем
    ]);
}
