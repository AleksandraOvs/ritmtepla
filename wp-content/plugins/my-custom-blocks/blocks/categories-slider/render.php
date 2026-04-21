<?php
if (!defined('ABSPATH')) exit;

$include_ids = !empty($attributes['categoryIds'])
    ? array_filter(array_map('trim', explode(',', $attributes['categoryIds'])))
    : [];

$args = [
    'taxonomy' => 'product_cat',
    'hide_empty' => false,
    'number' => 8,
];

if (!empty($include_ids)) $args['include'] = $include_ids;

$categories = get_terms($args);
if (is_wp_error($categories) || empty($categories)) return;
?>

<div class="swiper categories-slider">
    <div class="swiper-wrapper">
        <?php foreach ($categories as $cat) :
            $thumb_id = get_term_meta($cat->term_id, 'thumbnail_id', true);
            $img = $thumb_id ? wp_get_attachment_image($thumb_id, 'full') : wc_placeholder_img();
            $link = get_term_link($cat);
        ?>
            <div class="swiper-slide category-item">
                <a class="category-image" href="<?php echo esc_url($link); ?>"><?php echo $img; ?></a>
                <h3><?php echo esc_html($cat->name); ?></h3>
            </div>
        <?php endforeach; ?>
    </div>
</div>