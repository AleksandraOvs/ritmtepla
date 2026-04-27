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

//******* НАСТРОЙКИ ОФОРМЛЕНИЯ ЗАКАЗА (WooCommerce) *******//

/**
 * 1. ДОБАВЛЯЕМ КАСТОМНЫЕ ДАННЫЕ В EMAIL АДМИНИСТРАТОРУ
 */
add_action('woocommerce_email_after_order_table', function ($order, $sent_to_admin) {

    // выводим только в письме админу
    if (!$sent_to_admin) return;

    $method  = $order->get_meta('custom_delivery_method');
    $country = $order->get_meta('pickup_country');
    $address = $order->get_meta('pickup_address');

    if (!$method) return;

    echo '<h3>Способ получения</h3>';
    echo '<p><strong>Метод:</strong> ' . esc_html($method) . '</p>';

    if ($country) {
        echo '<p><strong>Страна:</strong> ' . esc_html($country) . '</p>';
    }

    if ($address) {
        echo '<p><strong>Адрес:</strong> ' . esc_html($address) . '</p>';
    }
}, 20, 2);


/**
 * 2. ВСЯ КАСТОМИЗАЦИЯ ПОЛЕЙ (billing + shipping В ОДНОМ МЕСТЕ)
 */
add_filter('woocommerce_checkout_fields', function ($fields) {

    /** -------- BILLING -------- */

    // удаляем лишнее
    unset(
        $fields['billing']['billing_first_name'],
        $fields['billing']['billing_last_name'],
        $fields['billing']['billing_address_1'],
        $fields['billing']['billing_address_2'],
        $fields['billing']['billing_city'],
        $fields['billing']['billing_state'],
        $fields['billing']['billing_postcode'],
        $fields['billing']['billing_country']
    );

    // добавляем ФИО
    $fields['billing']['billing_full_name'] = [
        'type'        => 'text',
        'priority'    => 10,
        'class'       => ['form-row-wide'],
        'placeholder' => 'Ф.И.О',
        'required'    => false,
    ];

    // телефон
    $fields['billing']['billing_phone']['priority']    = 20;
    $fields['billing']['billing_phone']['placeholder'] = '+7 (___) ___-__-__';
    $fields['billing']['billing_phone']['required']    = false;

    // email
    $fields['billing']['billing_email']['priority']    = 30;
    $fields['billing']['billing_email']['placeholder'] = 'E-mail';
    $fields['billing']['billing_email']['required']    = true; // единственное обязательное

    /** -------- SHIPPING -------- */

    unset(
        $fields['shipping']['shipping_first_name'],
        $fields['shipping']['shipping_last_name'],
        $fields['shipping']['shipping_company'],
        $fields['shipping']['shipping_city'],
        $fields['shipping']['shipping_state'],
        $fields['shipping']['shipping_postcode'],
        $fields['shipping']['shipping_address_2'] // удаляем вторую строку адреса
    );

    // страна
    $fields['shipping']['shipping_country']['required'] = false;
    $fields['shipping']['shipping_country']['priority'] = 10;
    $fields['shipping']['shipping_country']['label'] = '';
    $fields['shipping']['shipping_country']['placeholder'] = 'Страна';
    $fields['shipping']['shipping_country']['class'] = ['form-row-wide'];

    $fields['shipping']['shipping_address_1']['required'] = true;
    $fields['shipping']['shipping_address_1']['priority'] = 20;
    $fields['shipping']['shipping_address_1']['label'] = '';
    $fields['shipping']['shipping_address_1']['placeholder'] = 'Адрес доставки';
    $fields['shipping']['shipping_address_1']['class'] = ['form-row-wide'];

    /**
     * Убираем label и переносим его в placeholder
     */
    foreach ($fields as $section_key => $section) {
        foreach ($section as $field_key => $field) {

            // если есть label — переносим его в placeholder
            if (!empty($field['label']) && empty($field['placeholder'])) {
                $fields[$section_key][$field_key]['placeholder'] = $field['label'];
            }

            // убираем label
            $fields[$section_key][$field_key]['label'] = '';

            // скрываем label для доступности (не ломает верстку)
            $fields[$section_key][$field_key]['label_class'] = ['screen-reader-text'];
        }
    }

    return $fields;
});


/**
 * 4. СОХРАНЕНИЕ ДАННЫХ В ЗАКАЗ
 */
add_action('woocommerce_checkout_create_order', function ($order, $data) {

    /** --- ФИО --- */
    if (!empty($data['billing_full_name'])) {

        $parts = preg_split('/\s+/u', trim($data['billing_full_name']));
        $order->set_billing_first_name(array_shift($parts));
        $order->set_billing_last_name(implode(' ', $parts));
    }

    /** --- кастомное поле --- */
    if (!empty($_POST['pickup_address'])) {
        $order->update_meta_data(
            'pickup_address',
            sanitize_text_field($_POST['pickup_address'])
        );
    }
}, 10, 2);

/**
 * 5. Убираем секбокс "доставка по другому адресу"
 */
add_filter('woocommerce_checkout_show_shipping', '__return_true');

add_action('wp_head', function () {
    if (is_checkout()) {
        echo '<style>
            #ship-to-different-address {
                display: none !important;
            }
        </style>';
    }
});


/**
 * 6. Меняем "Billing details" (или его перевод) на "Данные заказа"
 */

add_filter('gettext', function ($translated, $text, $domain) {

    if ($domain === 'woocommerce' && ($text === 'Billing details' || $translated === 'Платёжные реквизиты')) {
        return 'Данные заказа';
    }

    return $translated;
}, 20, 3);

add_filter('woocommerce_privacy_policy_checkbox_default_checked', '__return_false');

add_action('wp_footer', function () {
    if (!is_checkout()) return;
?>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const checkbox = document.querySelector('#terms'); // сам чекбокс
            const placeOrderBtn = document.querySelector('#place_order');

            if (!checkbox || !placeOrderBtn) return;

            // функция включения/выключения класса disabled
            function togglePlaceOrderClass() {
                if (checkbox.checked) {
                    placeOrderBtn.classList.remove('disabled');
                } else {
                    placeOrderBtn.classList.add('disabled');
                }
            }

            // состояние при загрузке страницы
            togglePlaceOrderClass();

            // при изменении состояния чекбокса
            checkbox.addEventListener('change', togglePlaceOrderClass);
        });
    </script>
    <style>
        /* стиль для кнопки с классом disabled */
        #place_order.disabled {
            opacity: 0.5;
            pointer-events: none;
            cursor: not-allowed;
        }
    </style>
<?php
});

add_action('wp', function () {

    // работаем только на странице "Спасибо за заказ"
    if (!is_wc_endpoint_url('order-received')) {
        return;
    }

    // убираем детали заказа
    remove_action(
        'woocommerce_thankyou',
        'woocommerce_order_details_table',
        10
    );

    // убираем данные покупателя
    remove_action(
        'woocommerce_thankyou',
        'woocommerce_order_details_customer_details',
        20
    );
});
