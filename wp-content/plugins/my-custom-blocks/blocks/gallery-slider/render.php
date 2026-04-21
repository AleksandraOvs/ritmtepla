<?php
defined('ABSPATH') || exit;

$items = $attributes['items'] ?? [];
if (!$items) return '';
?>

<div class="gallery-slider swiper">
    <div class="swiper-wrapper">

        <?php
        $chunks = array_chunk($items, 4); // делим по 4 картинки на слайд
        foreach ($chunks as $group) :
        ?>
            <div class="swiper-slide gallery-slider__slide">
                <?php foreach ($group as $item) : ?>
                    <?php if (!empty($item['url'])) : ?>
                        <a href="<?php echo esc_url($item['link'] ?: $item['url']); ?>" data-fancybox="gallery-slider" data-caption="<?php echo esc_attr($item['title'] ?? ''); ?>">
                            <img src="<?php echo esc_url($item['url']); ?>" alt="<?php echo esc_attr($item['alt'] ?? ''); ?>">
                        </a>
                    <?php endif; ?>
                <?php endforeach; ?>
            </div>
        <?php endforeach; ?>

    </div>
    <div class="swiper-controls">
        <div class="swiper-arrows">
            <div class="swiper-button-prev">
                <svg width="7" height="12" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.2929 11.7068C5.68344 12.0972 6.31649 12.0973 6.70696 11.7068C7.09727 11.3163 7.09727 10.6832 6.70696 10.2928L2.41399 5.99979L6.70696 1.70682C7.09727 1.31634 7.09727 0.683242 6.70696 0.292759C6.31649 -0.0977125 5.68344 -0.0976037 5.2929 0.292759L0.2929 5.29276C-0.0976234 5.68328 -0.0976234 6.3163 0.292901 6.70682L5.2929 11.7068Z" fill="black" />
                </svg>
            </div>
            <div class="swiper-button-next">
                <svg width="7" height="12" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.70679 11.7068C1.31626 12.0972 0.683201 12.0973 0.292731 11.7068C-0.097577 11.3163 -0.0975769 10.6832 0.292731 10.2928L4.5857 5.99979L0.292732 1.70682C-0.0975758 1.31634 -0.0975764 0.683242 0.292732 0.292759C0.683202 -0.0977125 1.31626 -0.0976037 1.70679 0.292759L6.70679 5.29276C7.09732 5.68328 7.09732 6.3163 6.70679 6.70682L1.70679 11.7068Z" fill="black" />
                </svg>
            </div>
        </div>
        <div class="swiper-pagination"></div>
    </div>

</div>