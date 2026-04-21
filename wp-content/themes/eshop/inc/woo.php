<?php
remove_action('woocommerce_after_shop_loop_item', 'woocommerce_template_loop_add_to_cart', 10);

add_action('woocommerce_after_shop_loop_item', 'my_custom_more_link', 10);

function my_custom_more_link()
{
    global $product;

    if (!$product) return;
?>
    <a href="<?php echo esc_url(get_permalink($product->get_id())); ?>" class="button product-more">
        Подробнее
    </a>
<?php
}

/* ---------- Cart count fragment ---------- */
add_filter('woocommerce_add_to_cart_fragments', function ($fragments) {
    ob_start();
?>
    <span class="cart-count"><?= WC()->cart->get_cart_contents_count(); ?></span>
<?php
    $fragments['span.cart-count'] = ob_get_clean();
    return $fragments;
});

//формат цены для вариативных товаров от...
add_filter('woocommerce_get_price_html', 'custom_variable_price_from', 10, 2);

function custom_variable_price_from($price, $product)
{

    if ($product->is_type('variable')) {

        // Минимальная цена вариации
        $min_price = $product->get_variation_price('min', true);

        if ($min_price) {
            $price = 'От ' . wc_price($min_price);
        }
    }

    return $price;
}

add_filter('gettext', function ($translated, $text, $domain) {

    // WooCommerce Blocks
    if ($text === 'Estimated total' || $text === 'estimated total') {
        return 'Итого';
    }

    return $translated;
}, 20, 3);


add_filter('gettext', 'change_coupon_text', 20, 3);
function change_coupon_text($translated, $text, $domain)
{

    if ($domain === 'woocommerce') {

        if ($text === 'Have a coupon?') {
            return 'Использовать промокод';
        }

        if ($text === 'Have a coupon? Click here to enter your code') {
            return 'Использовать промокод';
        }

        if ($text === 'Add a coupon') {
            return 'Использовать промокод';
        }

        if (stripos($text, 'coupon') !== false) {
            return 'Использовать промокод';
        }
    }


    return $translated;
}
