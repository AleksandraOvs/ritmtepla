<?php
if (!defined('ABSPATH')) exit;

// Получаем атрибуты блока
$product_ids = !empty($attributes['productIds'])
    ? array_filter(array_map('trim', explode(',', $attributes['productIds'])))
    : [];

$categories = !empty($attributes['categories'])
    ? array_filter(array_map('trim', explode(',', $attributes['categories'])))
    : [];

$tags = !empty($attributes['tags'])
    ? array_filter(array_map('trim', explode(',', $attributes['tags'])))
    : [];
$order = isset($attributes['order']) ? $attributes['order'] : 'date';

// Формируем аргументы для wc_get_products
$args = [
    'limit' => 8,
    'status' => 'publish',
];

// Фильтр по ID
if (!empty($product_ids)) {
    $args['include'] = $product_ids;
}

// Фильтр по категориям
if (!empty($categories)) {
    $args['category'] = $categories;
}

// Фильтр по меткам
if (!empty($tags)) {
    $args['tag'] = $tags;
}

// Сортировка
switch ($order) {
    case 'date-desc':
        $args['orderby'] = 'date';
        $args['order'] = 'DESC';
        break;
    case 'title':
        $args['orderby'] = 'title';
        $args['order'] = 'ASC';
        break;
    case 'price':
        $args['orderby'] = 'meta_value_num';
        $args['meta_key'] = '_price';
        $args['order'] = 'ASC';
        break;
    case 'price-desc':
        $args['orderby'] = 'meta_value_num';
        $args['meta_key'] = '_price';
        $args['order'] = 'DESC';
        break;
    default: // date
        $args['orderby'] = 'date';
        $args['order'] = 'ASC';
        break;
}

$products = wc_get_products($args);

// echo '<pre>';
// print_r($args);
// echo '</pre>';
?>

<div class="swiper products-slider">
    <div class="swiper-wrapper">

        <?php foreach ($products as $product) : ?>
            <div class="swiper-slide product-item">
                <div class="product-image">
                    <a href="<?php echo esc_url($product->get_permalink()); ?>">
                        <?php echo $product->get_image(); ?>
                    </a>
                </div>
                <div class="product-content">
                    <h3>
                        <a href="<?php echo esc_url($product->get_permalink()); ?>">
                            <?php echo esc_html($product->get_name()); ?>
                        </a>
                    </h3>

                    <div class="product-add-to-cart">
                        <div class="add-to-cart">
                            <?php
                            echo sprintf(
                                '<a href="%s" data-quantity="1" class="%s" %s>%s</a>',
                                esc_url($product->add_to_cart_url()),
                                esc_attr(implode(' ', array_filter([
                                    $product->is_purchasable() && $product->is_in_stock() ? 'button' : '',
                                    'add_to_cart_button',
                                    $product->get_type() ? 'product_type_' . $product->get_type() : ''
                                ]))),
                                $product->is_purchasable() && $product->is_in_stock() ? '' : 'disabled',
                                esc_html($product->add_to_cart_text())
                            );
                            ?>
                        </div>
                        <div class="price">
                            <?php echo $product->get_price_html(); ?>
                        </div>
                    </div>


                </div>
            </div>
        <?php endforeach; ?>

    </div>

    <!-- навигация и пагинация -->
    <!-- <div class="swiper-button-prev"></div>
    <div class="swiper-button-next"></div>
    <div class="swiper-pagination"></div> -->
</div>