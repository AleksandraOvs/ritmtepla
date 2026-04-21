<?php

/**
 * Plugin Name: MySlider Hero Slider Block
 * Description: Dynamic Gutenberg Hero Slider без позиционирования элементов.
 * Version: 3.0.0
 * Author: Bulaev
 * Text Domain: myslider
 */

if (!defined('ABSPATH')) {
	exit;
}

/**
 * Глубокое слияние массивов.
 */
function myslider_deep_parse_args($input, $defaults)
{
	if (!is_array($input)) $input = array();

	foreach ($defaults as $key => $value) {
		if (is_array($value)) {
			$input[$key] = myslider_deep_parse_args(
				isset($input[$key]) && is_array($input[$key]) ? $input[$key] : array(),
				$value
			);
		} else {
			if (!array_key_exists($key, $input)) {
				$input[$key] = $value;
			}
		}
	}

	return $input;
}

/**
 * Дефолтные настройки элемента.
 */
function myslider_default_element($type = 'heading')
{
	$base = array(
		'id' => 'el_' . wp_generate_password(8, false, false),
		'type' => $type,
		'name' => 'Элемент',
		'visibility' => array('desktop' => true, 'mobile' => true),
		'contentDesktop' => '',
		'contentMobile' => '',
		'url' => '',
		'iconId' => 0,
		'iconUrl' => '',
		'iconAlt' => '',
		'iconWidthDesktop' => 56,
		'iconWidthMobile' => 42,
	);

	switch ($type) {
		case 'heading':
			$base['name'] = 'Заголовок';
			$base['contentDesktop'] = 'Заголовок слайда';
			$base['contentMobile'] = 'Заголовок';
			break;
		case 'text':
			$base['name'] = 'Текст';
			$base['contentDesktop'] = 'Подзаголовок для desktop';
			$base['contentMobile'] = 'Подзаголовок для mobile';
			break;
		case 'button':
			$base['name'] = 'Кнопка';
			$base['contentDesktop'] = 'Подробнее';
			$base['contentMobile'] = 'Подробнее';
			$base['url'] = '#';
			break;
		case 'badge':
			$base['name'] = 'Бейдж';
			$base['contentDesktop'] = 'Акция';
			$base['contentMobile'] = 'Акция';
			break;
		case 'icon':
			$base['name'] = 'Иконка';
			break;
	}

	return $base;
}

/**
 * Нормализация элемента (без абсолютного позиционирования).
 */
function myslider_normalize_element($element)
{
	$type = isset($element['type']) ? sanitize_key($element['type']) : 'text';
	$allowed = array('heading', 'text', 'button', 'icon', 'badge');
	if (!in_array($type, $allowed, true)) $type = 'text';
	$defaults = myslider_default_element($type);
	$element = myslider_deep_parse_args(is_array($element) ? $element : array(), $defaults);

	$element['type'] = $type;
	$element['id'] = !empty($element['id']) ? sanitize_key($element['id']) : 'el_' . wp_generate_password(8, false, false);
	$element['name'] = sanitize_text_field($element['name']);

	foreach (array('desktop', 'mobile') as $device) {
		$element['visibility'][$device] = !empty($element['visibility'][$device]);
	}

	$element['iconId'] = intval($element['iconId']);
	$element['iconWidthDesktop'] = max(8, min(600, intval($element['iconWidthDesktop'])));
	$element['iconWidthMobile'] = max(8, min(600, intval($element['iconWidthMobile'])));

	return $element;
}

/**
 * Дефолтный слайд.
 */
function myslider_get_default_slide()
{
	return array(
		'desktopImageId' => 0,
		'desktopImageUrl' => '',
		'mobileImageId' => 0,
		'mobileImageUrl' => '',
		'elements' => array(
			myslider_default_element('heading'),
			myslider_default_element('text'),
			myslider_default_element('button'),
		),
	);
}

/**
 * Нормализация слайда.
 */
function myslider_normalize_slide($slide)
{
	$default = myslider_get_default_slide();
	$slide = myslider_deep_parse_args(is_array($slide) ? $slide : array(), $default);

	if (!isset($slide['elements']) || !is_array($slide['elements']) || empty($slide['elements'])) {
		$slide['elements'] = $default['elements'];
	} else {
		$normalized = array();
		foreach ($slide['elements'] as $el) $normalized[] = myslider_normalize_element($el);
		$slide['elements'] = $normalized;
	}

	$slide['desktopImageId'] = intval($slide['desktopImageId']);
	$slide['mobileImageId'] = intval($slide['mobileImageId']);
	$slide['desktopImageUrl'] = isset($slide['desktopImageUrl']) ? esc_url_raw($slide['desktopImageUrl']) : '';
	$slide['mobileImageUrl'] = isset($slide['mobileImageUrl']) ? esc_url_raw($slide['mobileImageUrl']) : '';

	return $slide;
}

/**
 * Нормализация массива слайдов.
 */
function myslider_normalize_slides($slides)
{
	if (!is_array($slides) || empty($slides)) return array(myslider_get_default_slide());
	$out = array();
	foreach ($slides as $slide) $out[] = myslider_normalize_slide($slide);
	return $out;
}

/**
 * Рендер слоя.
 */
function myslider_render_layer_element($element, $device)
{
	if (empty($element['visibility'][$device])) return '';
	$type = $element['type'];
	$content = ('desktop' === $device) ? $element['contentDesktop'] : $element['contentMobile'];
	$content = is_string($content) ? $content : '';

	ob_start();
?>
	<div class="myslider__item myslider__item--<?php echo esc_attr($type); ?> myslider__item--<?php echo esc_attr($device); ?>">
		<?php if ('icon' === $type && !empty($element['iconUrl'])): ?>
			<div class="myslider__icon-wrap" style="width:<?php echo intval($element['iconWidthDesktop']); ?>px;">
				<img class="myslider__icon" src="<?php echo esc_url($element['iconUrl']); ?>" alt="<?php echo esc_attr($element['iconAlt']); ?>" />
			</div>
		<?php elseif ('button' === $type): ?>
			<a class="myslider__button" href="<?php echo esc_url($element['url'] ?: '#'); ?>"><?php echo wp_kses_post($content); ?></a>
		<?php elseif ('heading' === $type): ?>
			<h2 class="myslider__title"><?php echo wp_kses_post($content); ?></h2>
		<?php elseif ('badge' === $type): ?>
			<div class="myslider__badge"><?php echo wp_kses_post($content); ?></div>
		<?php else: ?>
			<div class="myslider__subtitle"><?php echo wp_kses_post($content); ?></div>
		<?php endif; ?>
	</div>
<?php
	return ob_get_clean();
}

/**
 * Рендер блока hero slider.
 */
function myslider_render_hero_slider_block($attributes, $content, $block)
{
	$defaults = array(
		'slides' => array(myslider_get_default_slide()),
		'sliderSettings' => array('autoplay' => true, 'delay' => 5000, 'loop' => true, 'arrows' => true, 'dots' => true),
	);
	$attributes = myslider_deep_parse_args(is_array($attributes) ? $attributes : array(), $defaults);
	$slides = myslider_normalize_slides($attributes['slides']);
	$slider_settings = $attributes['sliderSettings'];
	$wrapper_attrs = get_block_wrapper_attributes(array('class' => 'myslider-hero-slider alignfull'));

	ob_start();
?>
	<div <?php echo $wrapper_attrs; ?> data-myslider="1" data-settings="<?php echo esc_attr(wp_json_encode($slider_settings)); ?>">
		<div class="myslider__viewport" aria-roledescription="carousel">
			<div class="myslider__track">
				<?php foreach ($slides as $index => $slide): ?>
					<div class="myslider__slide<?php echo 0 === $index ? ' is-active' : ''; ?>" data-slide-index="<?php echo esc_attr($index); ?>">
						<div class="myslider__media">
							<?php if (!empty($slide['desktopImageUrl'])): ?>
								<img class="myslider__img myslider__img--desktop" src="<?php echo esc_url($slide['desktopImageUrl']); ?>" />
							<?php endif; ?>
							<?php if (!empty($slide['mobileImageUrl'])): ?>
								<img class="myslider__img myslider__img--mobile" src="<?php echo esc_url($slide['mobileImageUrl']); ?>" />
							<?php endif; ?>
						</div>
						<div class="container">
							<?php foreach ($slide['elements'] as $element) {
								echo myslider_render_layer_element($element, 'desktop');
								echo myslider_render_layer_element($element, 'mobile');
							} ?>
						</div>
					</div>
				<?php endforeach; ?>
			</div>
		</div>

		<?php if (!empty($slider_settings['arrows']) && $slider_settings['arrows']): ?>
			<button class="myslider__arrow myslider__arrow--prev" type="button" aria-label="Previous slide"></button>
			<button class="myslider__arrow myslider__arrow--next" type="button" aria-label="Next slide"></button>
		<?php endif; ?>

		<?php if (!empty($slider_settings['dots']) && $slider_settings['dots']): ?>
			<div class="myslider__dots">
				<?php foreach ($slides as $index => $slide): ?>
					<button type="button" class="myslider__dot<?php echo 0 === $index ? ' is-active' : ''; ?>" aria-label="Slide <?php echo $index + 1; ?>"></button>
				<?php endforeach; ?>
			</div>
		<?php endif; ?>
	</div>
<?php
	return ob_get_clean();
}

/**
 * Регистрация блока.
 */
function myslider_register_block()
{
	$dir = plugin_dir_path(__FILE__);
	$url = plugin_dir_url(__FILE__);

	wp_register_script('myslider-editor-script', $url . 'index.js', array('wp-blocks', 'wp-element', 'wp-components', 'wp-block-editor', 'wp-i18n'), filemtime($dir . 'index.js'), true);
	wp_register_script('myslider-frontend-script', $url . 'frontend.js', array(), filemtime($dir . 'frontend.js'), true);
	wp_register_style('myslider-style', $url . 'style.css', array(), filemtime($dir . 'style.css'));
	wp_register_style('myslider-editor-style', $url . 'editor.css', array('wp-edit-blocks'), filemtime($dir . 'editor.css'));

	register_block_type(__DIR__ . '/block.json', array(
		'editor_script' => 'myslider-editor-script',
		'editor_style' => 'myslider-editor-style',
		'style' => 'myslider-style',
		'script' => 'myslider-frontend-script',
		'render_callback' => 'myslider_render_hero_slider_block',
	));
}
add_action('init', 'myslider_register_block');
