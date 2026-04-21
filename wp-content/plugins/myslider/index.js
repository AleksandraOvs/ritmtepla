(function () {
	const { registerBlockType } = wp.blocks;
	const { Fragment, useState, useRef, useEffect, useMemo } = wp.element;
	const { useBlockProps, InspectorControls, MediaUpload, MediaUploadCheck } = wp.blockEditor;
	const {
		PanelBody,
		Button,
		TextControl,
		TextareaControl,
		ToggleControl,
		RangeControl,
		SelectControl,
		ColorPalette
	} = wp.components;

	function clone(obj) {
		return JSON.parse(JSON.stringify(obj));
	}
	function clamp(n, min, max) {
		const v = Number(n);
		if (Number.isNaN(v)) return min;
		return Math.max(min, Math.min(max, v));
	}
	function uid(prefix = 'el') {
		return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
	}
	function deepMerge(target, source) {
		const out = Array.isArray(target) ? [...target] : { ...(target || {}) };
		if (!source || typeof source !== 'object') return out;
		Object.keys(source).forEach((key) => {
			if (Array.isArray(source[key])) {
				out[key] = source[key].slice();
			} else if (source[key] && typeof source[key] === 'object') {
				out[key] = deepMerge(out[key] || {}, source[key]);
			} else {
				out[key] = source[key];
			}
		});
		return out;
	}

	const DEFAULT_SETTINGS = {
		heightDesktopMode: 'screen',
		heightDesktop: 700,
		heightMobileMode: 'screen',
		heightMobile: 560,
		maxHeightDesktop: 0, // 0 = без ограничения
		maxHeightMobile: 0,  // 0 = без ограничения
		contentMaxWidth: 720,
		overlayOpacity: 20
	};

	const DEFAULT_SLIDER_SETTINGS = {
		autoplay: true,
		delay: 5000,
		pauseOnHover: true,
		loop: true,
		arrows: true,
		dots: true,
		swipeMobile: true,
		dragDesktop: true,
		clickPausePlay: true
	};

	const DEFAULT_STYLES = {
		button: {
			bg: '#ffffff',
			text: '#111111',
			fontSize: 16,
			paddingX: 18,
			paddingY: 10,
			radius: 8,
			hoverBg: '#f3f3f3',
			hoverText: '#111111'
		},
		textBlock: {
			bg: '#000000',
			bgOpacity: 0,
			paddingX: 0,
			paddingY: 0,
			radius: 0,
			textColor: '#ffffff'
		},
		badge: {
			bg: '#ff6a00',
			text: '#ffffff',
			fontSize: 13,
			paddingX: 10,
			paddingY: 6,
			radius: 999
		}
	};

	function makeElement(type) {
		const base = {
			id: uid('el'),
			type,
			name: 'Элемент',
			zIndex: 10,
			visibility: { desktop: true, mobile: true },
			positions: {
				desktop: { x: 8, y: 18 },
				mobile: { x: 6, y: 16 }
			},
			contentDesktop: '',
			contentMobile: '',
			url: '',
			iconId: 0,
			iconUrl: '',
			iconAlt: '',
			iconWidthDesktop: 56,
			iconWidthMobile: 42
		};
		if (type === 'heading') {
			return { ...base, type, name: 'Заголовок', zIndex: 20, contentDesktop: 'Заголовок слайда', contentMobile: 'Заголовок' };
		}
		if (type === 'text') {
			return { ...base, type, name: 'Текст', zIndex: 20, positions: { desktop: { x: 8, y: 33 }, mobile: { x: 6, y: 34 } }, contentDesktop: 'Подзаголовок для desktop-версии', contentMobile: 'Подзаголовок для mobile' };
		}
		if (type === 'button') {
			return { ...base, type, name: 'Кнопка', zIndex: 25, positions: { desktop: { x: 8, y: 52 }, mobile: { x: 6, y: 54 } }, contentDesktop: 'Подробнее', contentMobile: 'Подробнее', url: '#' };
		}
		if (type === 'badge') {
			return { ...base, type, name: 'Бейдж', zIndex: 30, positions: { desktop: { x: 8, y: 8 }, mobile: { x: 6, y: 8 } }, contentDesktop: 'Акция', contentMobile: 'Акция' };
		}
		if (type === 'icon') {
			return { ...base, type, name: 'Иконка', zIndex: 18, positions: { desktop: { x: 8, y: 70 }, mobile: { x: 6, y: 70 } } };
		}
		return base;
	}

	function makeDefaultSlide() {
		return {
			desktopImageId: 0,
			desktopImageUrl: '',
			mobileImageId: 0,
			mobileImageUrl: '',
			image: {
				desktop: { fit: 'cover', posX: 50, posY: 50, zoom: 1 },
				mobile: { fit: 'cover', posX: 50, posY: 50, zoom: 1 }
			},
			elements: [makeElement('heading'), makeElement('text'), makeElement('button')]
		};
	}

	function normalizeElement(el) {
		if (!el || typeof el !== 'object') return makeElement('text');
		const type = ['heading', 'text', 'button', 'icon', 'badge'].includes(el.type) ? el.type : 'text';
		const out = deepMerge(makeElement(type), el);
		out.positions.desktop.x = clamp(out.positions.desktop.x, 0, 100);
		out.positions.desktop.y = clamp(out.positions.desktop.y, 0, 100);
		out.positions.mobile.x = clamp(out.positions.mobile.x, 0, 100);
		out.positions.mobile.y = clamp(out.positions.mobile.y, 0, 100);
		out.zIndex = clamp(out.zIndex, 1, 999);
		out.iconWidthDesktop = clamp(out.iconWidthDesktop, 8, 600);
		out.iconWidthMobile = clamp(out.iconWidthMobile, 8, 600);
		return out;
	}

	function migrateLegacySlide(slide) {
		if (!slide || typeof slide !== 'object') return makeDefaultSlide();
		if (Array.isArray(slide.elements)) {
			const s = deepMerge(makeDefaultSlide(), slide);
			s.elements = slide.elements.map(normalizeElement);
			return s;
		}

		const s = deepMerge(makeDefaultSlide(), slide);

		const heading = makeElement('heading');
		const text = makeElement('text');
		const button = makeElement('button');

		heading.contentDesktop = slide.titleDesktop ?? heading.contentDesktop;
		heading.contentMobile = slide.titleMobile ?? heading.contentMobile;
		text.contentDesktop = slide.subtitleDesktop ?? text.contentDesktop;
		text.contentMobile = slide.subtitleMobile ?? text.contentMobile;
		button.contentDesktop = slide.buttonTextDesktop ?? button.contentDesktop;
		button.contentMobile = slide.buttonTextMobile ?? button.contentMobile;
		button.url = slide.buttonUrl ?? button.url;

		if (slide.visibility?.desktop) {
			heading.visibility.desktop = slide.visibility.desktop.title ?? true;
			text.visibility.desktop = slide.visibility.desktop.subtitle ?? true;
			button.visibility.desktop = slide.visibility.desktop.button ?? true;
		}
		if (slide.visibility?.mobile) {
			heading.visibility.mobile = slide.visibility.mobile.title ?? true;
			text.visibility.mobile = slide.visibility.mobile.subtitle ?? true;
			button.visibility.mobile = slide.visibility.mobile.button ?? true;
		}
		if (slide.positions?.desktop?.title) heading.positions.desktop = deepMerge(heading.positions.desktop, slide.positions.desktop.title);
		if (slide.positions?.mobile?.title) heading.positions.mobile = deepMerge(heading.positions.mobile, slide.positions.mobile.title);
		if (slide.positions?.desktop?.subtitle) text.positions.desktop = deepMerge(text.positions.desktop, slide.positions.desktop.subtitle);
		if (slide.positions?.mobile?.subtitle) text.positions.mobile = deepMerge(text.positions.mobile, slide.positions.mobile.subtitle);
		if (slide.positions?.desktop?.button) button.positions.desktop = deepMerge(button.positions.desktop, slide.positions.desktop.button);
		if (slide.positions?.mobile?.button) button.positions.mobile = deepMerge(button.positions.mobile, slide.positions.mobile.button);

		s.elements = [normalizeElement(heading), normalizeElement(text), normalizeElement(button)];
		return s;
	}

	function ensureState(attributes) {
		const slidesRaw = Array.isArray(attributes.slides) ? attributes.slides : [];
		const slides = slidesRaw.length ? slidesRaw.map(migrateLegacySlide) : [makeDefaultSlide()];
		return {
			slides,
			settings: deepMerge(DEFAULT_SETTINGS, attributes.settings || {}),
			sliderSettings: deepMerge(DEFAULT_SLIDER_SETTINGS, attributes.sliderSettings || {}),
			styles: deepMerge(DEFAULT_STYLES, attributes.styles || {})
		};
	}

	function typeLabel(type) {
		return ({
			heading: 'Заголовок',
			text: 'Текст',
			button: 'Кнопка',
			icon: 'Иконка',
			badge: 'Бейдж'
		})[type] || type;
	}

	registerBlockType('myslider/hero-slider', {
		edit: function Edit({ attributes, setAttributes }) {
			const state = ensureState(attributes);
			const [activeSlideIndex, setActiveSlideIndex] = useState(0);
			const [deviceMode, setDeviceMode] = useState('desktop');
			const [activeElementId, setActiveElementId] = useState(null);
			const canvasRef = useRef(null);
			const dragRef = useRef(null);

			const slides = state.slides;
			const settings = state.settings;
			const sliderSettings = state.sliderSettings;
			const styles = state.styles;

			const activeSlide = slides[activeSlideIndex] || makeDefaultSlide();

			useEffect(() => {
				if (activeSlideIndex > slides.length - 1) {
					setActiveSlideIndex(Math.max(0, slides.length - 1));
				}
			}, [slides.length]);

			useEffect(() => {
				const els = activeSlide?.elements || [];
				if (!els.length) {
					setActiveElementId(null);
					return;
				}
				if (!activeElementId || !els.some((e) => e.id === activeElementId)) {
					setActiveElementId(els[0].id);
				}
			}, [activeSlideIndex, slides]);

			const activeElement = (activeSlide.elements || []).find((e) => e.id === activeElementId) || null;

			const blockProps = useBlockProps({ className: 'myslider-editor-root' });

			function updateAttrs(next) {
				setAttributes(next);
			}
			function updateSlides(nextSlides) {
				updateAttrs({ slides: nextSlides });
			}
			function updateSettings(nextSettings) {
				updateAttrs({ settings: nextSettings });
			}
			function updateSliderSettings(next) {
				updateAttrs({ sliderSettings: next });
			}
			function updateStyles(next) {
				updateAttrs({ styles: next });
			}

			function patchActiveSlide(patch) {
				const nextSlides = slides.map((s, i) => (i === activeSlideIndex ? deepMerge(clone(s), patch) : s));
				updateSlides(nextSlides);
			}

			function patchElement(elementId, patch) {
				const nextSlides = slides.map((s, i) => {
					if (i !== activeSlideIndex) return s;
					const next = clone(s);
					next.elements = (next.elements || []).map((el) => {
						if (el.id !== elementId) return el;
						const merged = deepMerge(el, patch);
						return normalizeElement(merged);
					});
					return next;
				});
				updateSlides(nextSlides);
			}

			function setElementPosition(elementId, device, x, y) {
				patchElement(elementId, {
					positions: {
						[device]: {
							x: clamp(x, 0, 100),
							y: clamp(y, 0, 100)
						}
					}
				});
			}

			function addSlide() {
				const nextSlides = slides.slice();
				nextSlides.splice(activeSlideIndex + 1, 0, makeDefaultSlide());
				updateSlides(nextSlides);
				setActiveSlideIndex(activeSlideIndex + 1);
			}
			function duplicateSlide() {
				const nextSlides = slides.slice();
				nextSlides.splice(activeSlideIndex + 1, 0, clone(activeSlide));
				updateSlides(nextSlides);
				setActiveSlideIndex(activeSlideIndex + 1);
			}
			function deleteSlide() {
				if (slides.length <= 1) {
					window.alert('Нельзя удалить последний слайд.');
					return;
				}
				if (!window.confirm('Удалить текущий слайд?')) return;
				const nextSlides = slides.filter((_, i) => i !== activeSlideIndex);
				updateSlides(nextSlides);
				setActiveSlideIndex(Math.max(0, activeSlideIndex - 1));
			}
			function moveSlide(delta) {
				const ni = activeSlideIndex + delta;
				if (ni < 0 || ni >= slides.length) return;
				const next = slides.slice();
				[next[activeSlideIndex], next[ni]] = [next[ni], next[activeSlideIndex]];
				updateSlides(next);
				setActiveSlideIndex(ni);
			}

			function addElement(type) {
				const nextEl = makeElement(type);
				const nextSlides = slides.map((s, i) => {
					if (i !== activeSlideIndex) return s;
					const next = clone(s);
					next.elements = [...(next.elements || []), nextEl];
					return next;
				});
				updateSlides(nextSlides);
				setActiveElementId(nextEl.id);
			}
			function duplicateElement() {
				if (!activeElement) return;
				const copy = clone(activeElement);
				copy.id = uid('el');
				copy.name = `${activeElement.name || typeLabel(activeElement.type)} копия`;
				copy.positions.desktop.x = clamp(copy.positions.desktop.x + 2, 0, 100);
				copy.positions.mobile.x = clamp(copy.positions.mobile.x + 2, 0, 100);
				const nextSlides = slides.map((s, i) => {
					if (i !== activeSlideIndex) return s;
					const next = clone(s);
					const idx = next.elements.findIndex((e) => e.id === activeElement.id);
					next.elements.splice(idx + 1, 0, copy);
					return next;
				});
				updateSlides(nextSlides);
				setActiveElementId(copy.id);
			}
			function deleteElement() {
				if (!activeElement) return;
				const elements = activeSlide.elements || [];
				if (elements.length <= 1) {
					window.alert('Лучше оставить хотя бы один элемент на слайде.');
				}
				if (!window.confirm('Удалить выбранный элемент?')) return;

				const nextSlides = slides.map((s, i) => {
					if (i !== activeSlideIndex) return s;
					const next = clone(s);
					next.elements = next.elements.filter((e) => e.id !== activeElement.id);
					if (!next.elements.length) next.elements = [makeElement('heading')];
					return next;
				});
				updateSlides(nextSlides);
				setActiveElementId(null);
			}
			function moveElement(delta) {
				if (!activeElement) return;
				const nextSlides = slides.map((s, i) => {
					if (i !== activeSlideIndex) return s;
					const next = clone(s);
					const idx = next.elements.findIndex((e) => e.id === activeElement.id);
					const ni = idx + delta;
					if (idx < 0 || ni < 0 || ni >= next.elements.length) return s;
					[next.elements[idx], next.elements[ni]] = [next.elements[ni], next.elements[idx]];
					// zIndex обновим по порядку
					next.elements = next.elements.map((el, i2) => ({ ...el, zIndex: 10 + i2 }));
					return next;
				});
				updateSlides(nextSlides);
			}

			function pickSlideImage(media) {
				if (!media) return;
				const idField = deviceMode === 'desktop' ? 'desktopImageId' : 'mobileImageId';
				const urlField = deviceMode === 'desktop' ? 'desktopImageUrl' : 'mobileImageUrl';
				patchActiveSlide({ [idField]: media.id || 0, [urlField]: media.url || '' });
			}
			function removeSlideImage() {
				const idField = deviceMode === 'desktop' ? 'desktopImageId' : 'mobileImageId';
				const urlField = deviceMode === 'desktop' ? 'desktopImageUrl' : 'mobileImageUrl';
				patchActiveSlide({ [idField]: 0, [urlField]: '' });
			}
			function patchSlideImageSettings(patch) {
				patchActiveSlide({
					image: {
						[deviceMode]: patch
					}
				});
			}

			function onElementIconPick(media) {
				if (!activeElement || activeElement.type !== 'icon') return;
				patchElement(activeElement.id, {
					iconId: media?.id || 0,
					iconUrl: media?.url || '',
					iconAlt: media?.alt || ''
				});
			}
			function removeElementIcon() {
				if (!activeElement || activeElement.type !== 'icon') return;
				patchElement(activeElement.id, { iconId: 0, iconUrl: '', iconAlt: '' });
			}





			const previewImageUrl = deviceMode === 'desktop' ? activeSlide.desktopImageUrl : activeSlide.mobileImageUrl;
			const imgCfg = activeSlide.image?.[deviceMode] || { fit: 'cover', posX: 50, posY: 50, zoom: 1 };
			const previewImageStyle = useMemo(() => ({
				objectFit: imgCfg.fit || 'cover',
				objectPosition: `${clamp(imgCfg.posX, 0, 100)}% ${clamp(imgCfg.posY, 0, 100)}%`,
				transform: `scale(${clamp(imgCfg.zoom, 1, 1.4)})`
			}), [imgCfg.fit, imgCfg.posX, imgCfg.posY, imgCfg.zoom]);

			const sortedElements = [...(activeSlide.elements || [])].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

			function onMouseUpDrag() {
				dragState.current.isDragging = false;
				window.removeEventListener('mousemove', onMouseMoveDrag);
				window.removeEventListener('mouseup', onMouseUpDrag);
			}

			function renderCanvasElement(el) {
				if (!el.visibility?.[deviceMode]) return null;
				const pos = el.positions?.[deviceMode] || { x: 0, y: 0 };
				const selected = activeElementId === el.id;

				let body = null;

				if (el.type === 'button') {
					body = wp.element.createElement('span', { className: 'myslider-editor-canvas__button' }, el[`content${deviceMode === 'desktop' ? 'Desktop' : 'Mobile'}`] || 'Кнопка');
				} else if (el.type === 'icon') {
					body = el.iconUrl
						? wp.element.createElement('img', {
							src: el.iconUrl,
							alt: '',
							className: 'myslider-editor-canvas__icon',
							style: { width: `${deviceMode === 'desktop' ? el.iconWidthDesktop : el.iconWidthMobile}px` }
						})
						: wp.element.createElement('div', { className: 'myslider-editor-canvas__icon-placeholder' }, 'Иконка');
				} else if (el.type === 'badge') {
					body = wp.element.createElement('span', { className: 'myslider-editor-canvas__badge' }, el[`content${deviceMode === 'desktop' ? 'Desktop' : 'Mobile'}`] || 'Бейдж');
				} else {
					body = wp.element.createElement(
						'div',
						{ className: `myslider-editor-canvas__text myslider-editor-canvas__text--${el.type}` },
						(el[`content${deviceMode === 'desktop' ? 'Desktop' : 'Mobile'}`] || typeLabel(el.type))
							.split('\n')
							.map((line, i, arr) => wp.element.createElement(Fragment, { key: i }, line, i < arr.length - 1 ? wp.element.createElement('br') : null))
					);
				}

				return wp.element.createElement(
					'div',
					{
						key: el.id,
						className: `myslider-editor-canvas__item myslider-editor-canvas__item--${el.type} ${selected ? 'is-selected' : ''}`,
						style: {
							left: `${clamp(pos.x, 0, 100)}%`,
							top: `${clamp(pos.y, 0, 100)}%`,
							zIndex: el.zIndex || 10
						},
						onMouseDown: (e) => {
							e.stopPropagation();
							setActiveElementId(el.id);
						}
					},

					wp.element.createElement(
						'div',
						{ className: 'myslider-editor-canvas__item-content' },
						wp.element.createElement('div', { className: 'myslider-editor-canvas__item-label' }, `${el.name || typeLabel(el.type)} • ${el.type}`),
						body
					)
				);
			}

			const previewHeight = deviceMode === 'desktop' ? 520 : 760;
			const previewAspect = deviceMode === 'desktop' ? '16 / 9' : '9 / 16';

			const activePos = activeElement?.positions?.[deviceMode] || { x: 0, y: 0 };

			return wp.element.createElement(
				Fragment,
				null,
				wp.element.createElement(
					InspectorControls,
					null,

					wp.element.createElement(
						PanelBody,
						{ title: 'Размер и экран', initialOpen: true },
						wp.element.createElement(ToggleControl, {
							label: 'Desktop: Во весь экран (100vh)',
							checked: settings.heightDesktopMode === 'screen',
							onChange: (val) => updateSettings({ ...settings, heightDesktopMode: val ? 'screen' : 'fixed' })
						}),
						settings.heightDesktopMode !== 'screen' && wp.element.createElement(RangeControl, {
							label: 'Высота Desktop (px)',
							value: settings.heightDesktop,
							min: 200, max: 1400,
							onChange: (v) => updateSettings({ ...settings, heightDesktop: clamp(v, 200, 1400) })
						}),
						wp.element.createElement(RangeControl, {
							label: 'Max-height Desktop (px)',
							value: settings.maxHeightDesktop,
							min: 0,
							max: 2000,
							onChange: (v) => updateSettings({
								...settings,
								maxHeightDesktop: clamp(v, 0, 2000)
							}),
							help: '0 = без ограничения'
						}),
						wp.element.createElement(ToggleControl, {
							label: 'Mobile: Во весь экран (100svh)',
							checked: settings.heightMobileMode === 'screen',
							onChange: (val) => updateSettings({ ...settings, heightMobileMode: val ? 'screen' : 'fixed' })
						}),
						settings.heightMobileMode !== 'screen' && wp.element.createElement(RangeControl, {
							label: 'Высота Mobile (px)',
							value: settings.heightMobile,
							min: 200, max: 1400,
							onChange: (v) => updateSettings({ ...settings, heightMobile: clamp(v, 200, 1400) })
						}),
						wp.element.createElement(RangeControl, {
							label: 'Max-height Mobile (px)',
							value: settings.maxHeightMobile,
							min: 0,
							max: 2000,
							onChange: (v) => updateSettings({
								...settings,
								maxHeightMobile: clamp(v, 0, 2000)
							}),
							help: '0 = без ограничения'
						}),

					),

					wp.element.createElement(
						PanelBody,
						{ title: `Изображения и адаптация (${deviceMode === 'desktop' ? 'Desktop' : 'Mobile'})`, initialOpen: true },
						wp.element.createElement(MediaUploadCheck, null,
							wp.element.createElement(MediaUpload, {
								onSelect: pickSlideImage,
								allowedTypes: ['image'],
								value: deviceMode === 'desktop' ? activeSlide.desktopImageId : activeSlide.mobileImageId,
								render: ({ open }) =>
									wp.element.createElement(
										'div',
										{ className: 'myslider-editor-media-actions' },
										wp.element.createElement(Button, { variant: 'primary', onClick: open }, 'Выбрать изображение'),
										previewImageUrl && wp.element.createElement(Button, { variant: 'secondary', onClick: removeSlideImage }, 'Удалить изображение')
									)
							})
						),
						wp.element.createElement(SelectControl, {
							label: 'Object Fit',
							value: imgCfg.fit,
							options: [{ label: 'cover', value: 'cover' }, { label: 'contain', value: 'contain' }],
							onChange: (v) => patchSlideImageSettings({ fit: v })
						}),
						wp.element.createElement(RangeControl, {
							label: 'Object Position X',
							value: imgCfg.posX,
							min: 0, max: 100,
							onChange: (v) => patchSlideImageSettings({ posX: v })
						}),
						wp.element.createElement(RangeControl, {
							label: 'Object Position Y',
							value: imgCfg.posY,
							min: 0, max: 100,
							onChange: (v) => patchSlideImageSettings({ posY: v })
						}),
						wp.element.createElement(RangeControl, {
							label: 'Zoom / Scale',
							value: imgCfg.zoom,
							min: 1, max: 1.4, step: 0.01,
							onChange: (v) => patchSlideImageSettings({ zoom: v })
						})
					),

					wp.element.createElement(
						PanelBody,
						{ title: 'Слайдер', initialOpen: false },
						['autoplay', 'pauseOnHover', 'loop', 'arrows', 'dots', 'swipeMobile', 'dragDesktop', 'clickPausePlay'].map((key) => {
							const labels = {
								autoplay: 'Autoplay',
								pauseOnHover: 'Pause on hover',
								loop: 'Loop',
								arrows: 'Стрелки',
								dots: 'Точки (dots)',
								swipeMobile: 'Swipe на mobile',
								dragDesktop: 'Drag мышью на desktop',
								clickPausePlay: 'Клик по пустому месту = пауза/старт'
							};
							return wp.element.createElement(ToggleControl, {
								key,
								label: labels[key],
								checked: !!sliderSettings[key],
								onChange: (v) => updateSliderSettings({ ...sliderSettings, [key]: !!v })
							});
						}),
						wp.element.createElement(RangeControl, {
							label: 'Delay (мс)',
							value: sliderSettings.delay,
							min: 1000, max: 15000, step: 100,
							onChange: (v) => updateSliderSettings({ ...sliderSettings, delay: clamp(v, 1000, 15000) })
						})
					),

					wp.element.createElement(
						PanelBody,
						{ title: 'Контент', initialOpen: false },
						wp.element.createElement(RangeControl, {
							label: 'contentMaxWidth (px)',
							value: settings.contentMaxWidth,
							min: 240, max: 1600,
							onChange: (v) => updateSettings({ ...settings, contentMaxWidth: clamp(v, 240, 1600) })
						}),
						wp.element.createElement(RangeControl, {
							label: 'Overlay % (затемнение)',
							value: settings.overlayOpacity,
							min: 0, max: 100,
							onChange: (v) => updateSettings({ ...settings, overlayOpacity: clamp(v, 0, 100) })
						}),
						wp.element.createElement('p', { className: 'myslider-editor-note' }, 'contentMaxWidth влияет только на фронтенд, drag — по всей области canvas.')
					),

					wp.element.createElement(
						PanelBody,
						{ title: 'Стили (глобально)', initialOpen: false },
						wp.element.createElement('h4', null, 'Кнопка'),
						wp.element.createElement('p', null, 'Цвет фона'),
						wp.element.createElement(ColorPalette, { value: styles.button.bg, onChange: (v) => updateStyles({ ...styles, button: { ...styles.button, bg: v || '#ffffff' } }) }),
						wp.element.createElement('p', null, 'Цвет текста'),
						wp.element.createElement(ColorPalette, { value: styles.button.text, onChange: (v) => updateStyles({ ...styles, button: { ...styles.button, text: v || '#111111' } }) }),
						wp.element.createElement(RangeControl, { label: 'Размер шрифта', value: styles.button.fontSize, min: 10, max: 40, onChange: (v) => updateStyles({ ...styles, button: { ...styles.button, fontSize: clamp(v, 10, 40) } }) }),
						wp.element.createElement(RangeControl, { label: 'Padding X', value: styles.button.paddingX, min: 0, max: 80, onChange: (v) => updateStyles({ ...styles, button: { ...styles.button, paddingX: clamp(v, 0, 80) } }) }),
						wp.element.createElement(RangeControl, { label: 'Padding Y', value: styles.button.paddingY, min: 0, max: 40, onChange: (v) => updateStyles({ ...styles, button: { ...styles.button, paddingY: clamp(v, 0, 40) } }) }),
						wp.element.createElement(RangeControl, { label: 'Radius', value: styles.button.radius, min: 0, max: 50, onChange: (v) => updateStyles({ ...styles, button: { ...styles.button, radius: clamp(v, 0, 50) } }) }),
						wp.element.createElement('hr'),
						wp.element.createElement('h4', null, 'Текстовые блоки'),
						wp.element.createElement('p', null, 'Фон'),
						wp.element.createElement(ColorPalette, { value: styles.textBlock.bg, onChange: (v) => updateStyles({ ...styles, textBlock: { ...styles.textBlock, bg: v || '#000000' } }) }),
						wp.element.createElement(RangeControl, { label: 'Прозрачность фона', value: styles.textBlock.bgOpacity, min: 0, max: 100, onChange: (v) => updateStyles({ ...styles, textBlock: { ...styles.textBlock, bgOpacity: clamp(v, 0, 100) } }) }),
						wp.element.createElement(RangeControl, { label: 'Padding X', value: styles.textBlock.paddingX, min: 0, max: 80, onChange: (v) => updateStyles({ ...styles, textBlock: { ...styles.textBlock, paddingX: clamp(v, 0, 80) } }) }),
						wp.element.createElement(RangeControl, { label: 'Padding Y', value: styles.textBlock.paddingY, min: 0, max: 80, onChange: (v) => updateStyles({ ...styles, textBlock: { ...styles.textBlock, paddingY: clamp(v, 0, 80) } }) }),
						wp.element.createElement(RangeControl, { label: 'Radius', value: styles.textBlock.radius, min: 0, max: 50, onChange: (v) => updateStyles({ ...styles, textBlock: { ...styles.textBlock, radius: clamp(v, 0, 50) } }) }),
						wp.element.createElement('p', null, 'Цвет текста'),
						wp.element.createElement(ColorPalette, { value: styles.textBlock.textColor, onChange: (v) => updateStyles({ ...styles, textBlock: { ...styles.textBlock, textColor: v || '#ffffff' } }) }),
						wp.element.createElement('hr'),
						wp.element.createElement('h4', null, 'Бейдж'),
						wp.element.createElement('p', null, 'Фон'),
						wp.element.createElement(ColorPalette, { value: styles.badge.bg, onChange: (v) => updateStyles({ ...styles, badge: { ...styles.badge, bg: v || '#ff6a00' } }) }),
						wp.element.createElement('p', null, 'Цвет текста'),
						wp.element.createElement(ColorPalette, { value: styles.badge.text, onChange: (v) => updateStyles({ ...styles, badge: { ...styles.badge, text: v || '#ffffff' } }) }),
						wp.element.createElement(RangeControl, { label: 'Размер шрифта', value: styles.badge.fontSize, min: 10, max: 30, onChange: (v) => updateStyles({ ...styles, badge: { ...styles.badge, fontSize: clamp(v, 10, 30) } }) }),
						wp.element.createElement(RangeControl, { label: 'Padding X', value: styles.badge.paddingX, min: 0, max: 40, onChange: (v) => updateStyles({ ...styles, badge: { ...styles.badge, paddingX: clamp(v, 0, 40) } }) }),
						wp.element.createElement(RangeControl, { label: 'Padding Y', value: styles.badge.paddingY, min: 0, max: 30, onChange: (v) => updateStyles({ ...styles, badge: { ...styles.badge, paddingY: clamp(v, 0, 30) } }) }),
						wp.element.createElement(RangeControl, { label: 'Radius', value: styles.badge.radius, min: 0, max: 999, onChange: (v) => updateStyles({ ...styles, badge: { ...styles.badge, radius: clamp(v, 0, 999) } }) })
					),

					activeElement && wp.element.createElement(
						PanelBody,
						{ title: `Элемент: ${activeElement.name || typeLabel(activeElement.type)}`, initialOpen: true },
						wp.element.createElement(TextControl, {
							label: 'Название элемента (внутреннее)',
							value: activeElement.name || '',
							onChange: (v) => patchElement(activeElement.id, { name: v })
						}),
						wp.element.createElement(ToggleControl, {
							label: 'Показывать на Desktop',
							checked: !!activeElement.visibility?.desktop,
							onChange: (v) => patchElement(activeElement.id, { visibility: { desktop: !!v } })
						}),
						wp.element.createElement(ToggleControl, {
							label: 'Показывать на Mobile',
							checked: !!activeElement.visibility?.mobile,
							onChange: (v) => patchElement(activeElement.id, { visibility: { mobile: !!v } })
						}),
						wp.element.createElement(RangeControl, {
							label: 'Z-index',
							value: activeElement.zIndex || 10,
							min: 1, max: 999,
							onChange: (v) => patchElement(activeElement.id, { zIndex: clamp(v, 1, 999) })
						}),
						wp.element.createElement(RangeControl, {
							label: `X (${deviceMode})`,
							value: activePos.x,
							min: 0, max: 100, step: 0.1,
							onChange: (v) => setElementPosition(activeElement.id, deviceMode, v, activePos.y)
						}),
						wp.element.createElement(RangeControl, {
							label: `Y (${deviceMode})`,
							value: activePos.y,
							min: 0, max: 100, step: 0.1,
							onChange: (v) => setElementPosition(activeElement.id, deviceMode, activePos.x, v)
						}),
						wp.element.createElement(Button, {
							variant: 'secondary',
							onClick: () => setElementPosition(activeElement.id, deviceMode, 50, 50)
						}, 'Сбросить в центр')
					)
				),

				wp.element.createElement(
					'div',
					blockProps,

					wp.element.createElement(
						'div',
						{ className: 'myslider-editor-toolbar' },
						wp.element.createElement(
							'div',
							{ className: 'myslider-editor-toolbar__group' },
							wp.element.createElement('span', { className: 'myslider-editor-toolbar__label' }, 'Устройство:'),
							wp.element.createElement(Button, { variant: deviceMode === 'desktop' ? 'primary' : 'secondary', onClick: () => setDeviceMode('desktop') }, 'Desktop'),
							wp.element.createElement(Button, { variant: deviceMode === 'mobile' ? 'primary' : 'secondary', onClick: () => setDeviceMode('mobile') }, 'Mobile')
						),
						wp.element.createElement(
							'div',
							{ className: 'myslider-editor-toolbar__group' },
							wp.element.createElement(Button, { variant: 'secondary', onClick: () => setActiveSlideIndex(Math.max(0, activeSlideIndex - 1)), disabled: activeSlideIndex === 0 }, 'Prev'),
							wp.element.createElement('span', { className: 'myslider-editor-toolbar__counter' }, `${activeSlideIndex + 1}/${slides.length}`),
							wp.element.createElement(Button, { variant: 'secondary', onClick: () => setActiveSlideIndex(Math.min(slides.length - 1, activeSlideIndex + 1)), disabled: activeSlideIndex >= slides.length - 1 }, 'Next')
						),
						wp.element.createElement(
							'div',
							{ className: 'myslider-editor-toolbar__group' },
							wp.element.createElement(Button, { variant: 'primary', onClick: addSlide }, 'Add slide'),
							wp.element.createElement(Button, { variant: 'secondary', onClick: duplicateSlide }, 'Duplicate'),
							wp.element.createElement(Button, { variant: 'secondary', onClick: () => moveSlide(-1), disabled: activeSlideIndex === 0 }, '↑'),
							wp.element.createElement(Button, { variant: 'secondary', onClick: () => moveSlide(1), disabled: activeSlideIndex === slides.length - 1 }, '↓'),
							wp.element.createElement(Button, { variant: 'secondary', onClick: deleteSlide, disabled: slides.length <= 1, isDestructive: true }, 'Delete')
						)
					),

					wp.element.createElement(
						'div',
						{ className: 'myslider-editor-thumbs' },
						slides.map((slide, i) => {
							const img = deviceMode === 'desktop' ? slide.desktopImageUrl : slide.mobileImageUrl;
							return wp.element.createElement(
								'button',
								{
									key: i,
									type: 'button',
									className: `myslider-editor-thumb ${i === activeSlideIndex ? 'is-active' : ''}`,
									onClick: () => setActiveSlideIndex(i)
								},
								wp.element.createElement('span', { className: 'myslider-editor-thumb__num' }, i + 1),
								img
									? wp.element.createElement('img', { src: img, alt: '', className: 'myslider-editor-thumb__img' })
									: wp.element.createElement('span', { className: 'myslider-editor-thumb__placeholder' }, 'Нет изображения')
							);
						})
					),

					wp.element.createElement(
						'div',
						{ className: 'myslider-editor-canvas-wrap' },
						wp.element.createElement(
							'div',
							{
								className: `myslider-editor-canvas ${deviceMode === 'mobile' ? 'is-mobile' : 'is-desktop'}`,
								ref: canvasRef,
								style: { height: `${previewHeight}px`, aspectRatio: previewAspect },
								onMouseDown: () => setActiveElementId(null)
							},
							previewImageUrl
								? wp.element.createElement('img', { src: previewImageUrl, alt: '', className: 'myslider-editor-canvas__bg', style: previewImageStyle })
								: wp.element.createElement('div', { className: 'myslider-editor-canvas__placeholder' }, `Нет ${deviceMode === 'desktop' ? 'Desktop' : 'Mobile'} изображения`),
							wp.element.createElement('div', { className: 'myslider-editor-canvas__overlay', style: { opacity: clamp(settings.overlayOpacity, 0, 100) / 100 } }),
							wp.element.createElement('div', { className: 'myslider-editor-canvas__hint' }, 'Drag работает по всей области canvas (0–100%), а не по contentMaxWidth'),
							sortedElements.map(renderCanvasElement)
						)
					),

					wp.element.createElement(
						'div',
						{ className: 'myslider-editor-split' },

						wp.element.createElement(
							'div',
							{ className: 'myslider-editor-panel-card' },
							wp.element.createElement('h3', null, 'Элементы слайда'),
							wp.element.createElement(
								'div',
								{ className: 'myslider-editor-actions-row' },
								wp.element.createElement(Button, { variant: 'secondary', onClick: () => addElement('heading') }, '+ Заголовок'),
								wp.element.createElement(Button, { variant: 'secondary', onClick: () => addElement('text') }, '+ Текст'),
								wp.element.createElement(Button, { variant: 'secondary', onClick: () => addElement('button') }, '+ Кнопка'),
								wp.element.createElement(Button, { variant: 'secondary', onClick: () => addElement('icon') }, '+ Иконка'),
								wp.element.createElement(Button, { variant: 'secondary', onClick: () => addElement('badge') }, '+ Бейдж')
							),
							wp.element.createElement(
								'div',
								{ className: 'myslider-editor-elements-list' },
								(activeSlide.elements || []).map((el, idx) =>
									wp.element.createElement(
										'button',
										{
											key: el.id,
											type: 'button',
											className: `myslider-editor-element-row ${activeElementId === el.id ? 'is-active' : ''}`,
											onClick: () => setActiveElementId(el.id)
										},
										wp.element.createElement('span', { className: 'myslider-editor-element-row__left' }, `${idx + 1}. ${el.name || typeLabel(el.type)}`),
										wp.element.createElement('span', { className: 'myslider-editor-element-row__right' }, `${el.type} • z${el.zIndex || 10}`)
									)
								)
							),
							activeElement && wp.element.createElement(
								'div',
								{ className: 'myslider-editor-actions-row' },
								wp.element.createElement(Button, { variant: 'secondary', onClick: duplicateElement }, 'Duplicate'),
								wp.element.createElement(Button, { variant: 'secondary', onClick: () => moveElement(-1) }, '↑ layer'),
								wp.element.createElement(Button, { variant: 'secondary', onClick: () => moveElement(1) }, '↓ layer'),
								wp.element.createElement(Button, { variant: 'secondary', isDestructive: true, onClick: deleteElement }, 'Delete')
							)
						),

						wp.element.createElement(
							'div',
							{ className: 'myslider-editor-panel-card' },
							wp.element.createElement('h3', null, activeElement ? `Настройки элемента (${typeLabel(activeElement.type)})` : 'Выбери элемент'),
							!activeElement
								? wp.element.createElement('p', { className: 'myslider-editor-note' }, 'Кликни по элементу на canvas или в списке.')
								: wp.element.createElement(
									Fragment,
									null,
									wp.element.createElement(TextControl, {
										label: 'Название элемента (внутреннее)',
										value: activeElement.name || '',
										onChange: (v) => patchElement(activeElement.id, { name: v })
									}),

									activeElement.type !== 'icon' && wp.element.createElement(TextareaControl, {
										label: `Контент Desktop`,
										value: activeElement.contentDesktop || '',
										onChange: (v) => patchElement(activeElement.id, { contentDesktop: v })
									}),
									activeElement.type !== 'icon' && wp.element.createElement(TextareaControl, {
										label: `Контент Mobile`,
										value: activeElement.contentMobile || '',
										onChange: (v) => patchElement(activeElement.id, { contentMobile: v })
									}),

									activeElement.type === 'button' && wp.element.createElement(TextControl, {
										label: 'URL кнопки',
										value: activeElement.url || '',
										onChange: (v) => patchElement(activeElement.id, { url: v })
									}),

									activeElement.type === 'icon' && wp.element.createElement(
										Fragment,
										null,
										wp.element.createElement(MediaUploadCheck, null,
											wp.element.createElement(MediaUpload, {
												onSelect: onElementIconPick,
												allowedTypes: ['image'],
												value: activeElement.iconId || 0,
												render: ({ open }) =>
													wp.element.createElement(
														'div',
														{ className: 'myslider-editor-media-actions' },
														wp.element.createElement(Button, { variant: 'primary', onClick: open }, 'Выбрать иконку'),
														(activeElement.iconUrl || '') && wp.element.createElement(Button, { variant: 'secondary', onClick: removeElementIcon }, 'Удалить иконку')
													)
											})
										),
										wp.element.createElement(TextControl, {
											label: 'Alt',
											value: activeElement.iconAlt || '',
											onChange: (v) => patchElement(activeElement.id, { iconAlt: v })
										}),
										wp.element.createElement(RangeControl, {
											label: 'Ширина иконки Desktop (px)',
											value: activeElement.iconWidthDesktop || 56,
											min: 8, max: 600,
											onChange: (v) => patchElement(activeElement.id, { iconWidthDesktop: clamp(v, 8, 600) })
										}),
										wp.element.createElement(RangeControl, {
											label: 'Ширина иконки Mobile (px)',
											value: activeElement.iconWidthMobile || 42,
											min: 8, max: 600,
											onChange: (v) => patchElement(activeElement.id, { iconWidthMobile: clamp(v, 8, 600) })
										})
									),

									wp.element.createElement(
										'div',
										{ className: 'myslider-editor-actions-row' },
										wp.element.createElement(ToggleControl, {
											label: 'Показывать Desktop',
											checked: !!activeElement.visibility?.desktop,
											onChange: (v) => patchElement(activeElement.id, { visibility: { desktop: !!v } })
										}),
										wp.element.createElement(ToggleControl, {
											label: 'Показывать Mobile',
											checked: !!activeElement.visibility?.mobile,
											onChange: (v) => patchElement(activeElement.id, { visibility: { mobile: !!v } })
										})
									)
								)
						)
					),

					wp.element.createElement(
						'div',
						{ className: 'myslider-editor-status' },
						wp.element.createElement('strong', null, 'Режим: '), deviceMode,
						' • ',
						wp.element.createElement('strong', null, 'Слайд: '), `${activeSlideIndex + 1}/${slides.length}`,
						' • ',
						wp.element.createElement('strong', null, 'Элемент: '), activeElement ? `${activeElement.name || typeLabel(activeElement.type)} (${activeElement.type})` : 'не выбран',
						activeElement ? ` • X: ${activePos.x.toFixed(1)}% / Y: ${activePos.y.toFixed(1)}%` : ''
					)
				)
			);
		},

		save: function () {
			return null;
		}
	});
})();