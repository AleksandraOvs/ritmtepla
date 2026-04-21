document.addEventListener('DOMContentLoaded', () => {

    // Обработчик клика на кнопки + / -
    document.addEventListener('click', e => {
        const btn = e.target.closest('.qty-btn');
        if (!btn) return;

        e.preventDefault();

        const wrap = btn.closest('.pro-qty');
        if (!wrap) return;

        const input = wrap.querySelector('input');
        if (!input) return;

        // Берём текущее значение как число
        let value = parseFloat(input.value) || 0;
        const step = parseFloat(input.dataset.step) || 1;
        const min = parseFloat(input.dataset.min) || 1;
        const max = input.dataset.max ? parseFloat(input.dataset.max) : Infinity;

        // Увеличиваем или уменьшаем
        if (btn.classList.contains('inc')) value += step;
        if (btn.classList.contains('dec')) value -= step;

        // Ограничиваем диапазон
        value = Math.max(min, value);
        value = Math.min(max, value);

        // Устанавливаем именно property, чтобы визуально обновилось
        input.value = value;

        // Триггерим события для WooCommerce и других слушателей
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));

        // Обновление корзины на странице cart
        if (document.body.classList.contains('woocommerce-cart')) {
            clearTimeout(cartUpdateTimer);
            cartUpdateTimer = setTimeout(() => {
                const updateBtn = document.querySelector('button[name="update_cart"]');
                if (updateBtn) {
                    updateBtn.disabled = false;
                    updateBtn.click();
                }
            }, 400);
        }
    });

    /* ===============================
      WOOCOMMERCE MESSAGE AUTO-HIDE
   =============================== */

    document.addEventListener('click', e => {
        document.querySelectorAll('.woocommerce-message').forEach(msg => {
            if (!msg.contains(e.target)) {
                msg.classList.add('fade-out');
                setTimeout(() => msg.remove(), 700);
            }
        });
    });
});

document.body.addEventListener('added_to_cart', function (e) {
    const button = e.detail?.button;

    if (!button) return;

    button.textContent = 'В корзине';
    button.classList.add('in-cart');
    button.disabled = true;
});

new Swiper('.related-products-slider', {
    slidesPerView: 4,
    spaceBetween: 20,

    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },

    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },

    breakpoints: {
        320: {
            slidesPerView: 1.3,
        },
        768: {
            slidesPerView: 2.3,
        },
        992: {
            slidesPerView: 4,
        }
    }
});

new Swiper('.cross-sells-products-slider', {
    slidesPerView: 1,
    spaceBetween: 20,

    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },

    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },

    breakpoints: {
        480: {
            slidesPerView: 2,
        },
        1024: {
            slidesPerView: 3,
        }
    }
});

//обновление характеристик для вариативного товара
// document.addEventListener('DOMContentLoaded', function () {

//     const container = document.getElementById('js-product-attributes');
//     const form = document.querySelector('.variations_form');

//     if (!container || !form) return;

//     form.addEventListener('found_variation', function (event, variation) {

//         let html = '';
//         let count = 0;

//         for (let key in variation.attributes) {

//             if (count >= 3) break;

//             let value = variation.attributes[key];
//             if (!value) continue;

//             let label = key
//                 .replace('attribute_', '')
//                 .replace('pa_', '');

//             html += `
//                 <div class="attr">
//                     <span class="attr-label">${label}:</span>
//                     <span class="attr-value">${value}</span>
//                 </div>
//             `;

//             count++;
//         }

//         container.innerHTML = html;
//     });

// });