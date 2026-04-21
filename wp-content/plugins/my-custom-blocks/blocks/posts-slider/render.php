<?php
if (!defined('ABSPATH')) exit;

$showCategories = $attributes['showCategories'] ?? false;

$args = [
    'post_type'      => 'post',
    'posts_per_page' => 20,
    'post_status'    => 'publish',
    'orderby'        => 'date',
    'order'          => 'DESC',
];

$latest_posts = get_posts($args);
if (!$latest_posts) return '';

ob_start();

// Табсы категорий
if ($showCategories) {
    $categories = get_categories(['hide_empty' => true]);
    if ($categories) {
        echo '<div class="posts-slider-categories">';
        // Первая кнопка — "Все"
        echo '<button class="category-tab active" data-cat="all">Все</button>';
        foreach ($categories as $cat) {
            echo '<button class="category-tab" data-cat="' . esc_attr($cat->term_id) . '">' . esc_html($cat->name) . '</button>';
        }
        echo '</div>';
    }
}

// Слайды
?>
<div class="posts-slider swiper">
    <div class="swiper-wrapper">
        <?php foreach ($latest_posts as $post_item) : setup_postdata($post_item);
            $post_cats = wp_get_post_categories($post_item->ID);
            $data_cats = implode(',', $post_cats);
        ?>
            <div class="swiper-slide" data-categories="<?php echo esc_attr($data_cats); ?>">
                <a href="<?php echo get_permalink($post_item->ID); ?>">
                    <?php
                    if (has_post_thumbnail($post_item->ID)) {
                        echo get_the_post_thumbnail($post_item->ID, 'medium');
                    } else {
                        $placeholder = plugins_url('blocks/_images/placeholder.svg', dirname(__DIR__));
                        echo '<img src="' . esc_url($placeholder) . '" alt="' . esc_attr(get_the_title($post_item->ID)) . '" />';
                    }
                    ?>
                    <h3><?php echo get_the_title($post_item->ID); ?></h3>
                </a>
            </div>
        <?php endforeach;
        wp_reset_postdata(); ?>
    </div>

    <div class="swiper-button-next"></div>
    <div class="swiper-button-prev"></div>
    <div class="swiper-pagination"></div>
</div>
<?php
return ob_get_clean();
