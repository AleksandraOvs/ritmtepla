(function () {
	function clamp(n, min, max) {
		return Math.max(min, Math.min(max, n));
	}
	function parseJSONSafe(str, fallback) {
		try { return JSON.parse(str); } catch (e) { return fallback; }
	}
	function isMobileViewport() {
		return window.matchMedia('(max-width: 781px)').matches;
	}

	class MyHeroSlider {
		constructor(root) {
			this.root = root;
			this.viewport = root.querySelector('.myslider__viewport');
			this.track = root.querySelector('.myslider__track');
			this.slides = Array.from(root.querySelectorAll('.myslider__slide'));
			this.prevBtn = root.querySelector('.myslider__arrow--prev');
			this.nextBtn = root.querySelector('.myslider__arrow--next');
			this.dots = Array.from(root.querySelectorAll('.myslider__dot'));

			if (!this.viewport || !this.track || !this.slides.length) return;

			this.settings = Object.assign({
				autoplay: true,
				delay: 5000,
				pauseOnHover: true,
				loop: true,
				arrows: true,
				dots: true,
				swipeMobile: true,
				dragDesktop: true,
				clickPausePlay: true,
				removePositioning: false // новая настройка
			}, parseJSONSafe(root.getAttribute('data-settings') || '{}', {}));

			if (this.settings.removePositioning) {
				this.slides.forEach(slide => {
					slide.style.position = '';
					slide.style.top = '';
					slide.style.right = '';
					slide.style.bottom = '';
					slide.style.left = '';
				});
			}

			this.current = 0;
			this.timer = null;
			this.paused = false;
			this.drag = {
				active: false,
				startX: 0,
				startY: 0,
				dx: 0,
				dy: 0,
				startTime: 0,
				moved: false
			};

			this.bind();
			this.goTo(0, false);
			this.startAutoplay();
		}

		bind() {
			if (this.prevBtn) {
				this.prevBtn.addEventListener('click', (e) => {
					e.stopPropagation();
					this.prev();
				});
			}
			if (this.nextBtn) {
				this.nextBtn.addEventListener('click', (e) => {
					e.stopPropagation();
					this.next();
				});
			}

			this.dots.forEach((dot, i) => {
				dot.addEventListener('click', (e) => {
					e.stopPropagation();
					this.goTo(i, true);
					this.restartAutoplay();
				});
			});

			if (this.settings.pauseOnHover) {
				this.root.addEventListener('mouseenter', () => this.pauseAutoplay(true));
				this.root.addEventListener('mouseleave', () => this.pauseAutoplay(false));
			}

			if (this.settings.clickPausePlay) {
				this.root.addEventListener('click', (e) => {
					// не мешаем ссылкам/кнопкам/controls
					if (e.target.closest('a, button')) return;
					this.togglePause();
				});
			}

			this.viewport.addEventListener('pointerdown', this.onPointerDown.bind(this), { passive: true });
			window.addEventListener('pointermove', this.onPointerMove.bind(this), { passive: false });
			window.addEventListener('pointerup', this.onPointerUp.bind(this), { passive: true });
			window.addEventListener('pointercancel', this.onPointerUp.bind(this), { passive: true });

			window.addEventListener('resize', () => {
				this.goTo(this.current, false);
			});
		}

		canDragNow() {
			return isMobileViewport() ? !!this.settings.swipeMobile : !!this.settings.dragDesktop;
		}

		onPointerDown(e) {
			if (!this.canDragNow()) return;
			if (e.target.closest('a, button')) return;

			this.drag.active = true;
			this.drag.startX = e.clientX;
			this.drag.startY = e.clientY;
			this.drag.dx = 0;
			this.drag.dy = 0;
			this.drag.startTime = Date.now();
			this.drag.moved = false;

			this.track.classList.add('is-dragging');
			this.stopAutoplay();
		}

		onPointerMove(e) {
			if (!this.drag.active) return;

			this.drag.dx = e.clientX - this.drag.startX;
			this.drag.dy = e.clientY - this.drag.startY;

			// не ломаем вертикальный скролл
			if (Math.abs(this.drag.dy) > Math.abs(this.drag.dx) * 1.1) {
				return;
			}

			if (Math.abs(this.drag.dx) > 4) {
				this.drag.moved = true;
				e.preventDefault();
			}

			const width = this.viewport.clientWidth || 1;
			const basePct = -this.current * 100;
			const shiftPct = (this.drag.dx / width) * 100;

			this.track.style.transition = 'none';
			this.track.style.transform = `translate3d(${basePct + shiftPct}%,0,0)`;
		}

		onPointerUp() {
			if (!this.drag.active) return;

			this.track.classList.remove('is-dragging');

			const width = this.viewport.clientWidth || 1;
			const thresholdPx = Math.min(120, width * 0.18);
			const elapsed = Date.now() - this.drag.startTime;
			const velocity = elapsed > 0 ? Math.abs(this.drag.dx) / elapsed : 0;

			const shouldChange =
				Math.abs(this.drag.dx) > thresholdPx ||
				(Math.abs(this.drag.dx) > 20 && velocity > 0.5);

			if (this.drag.moved && shouldChange) {
				if (this.drag.dx < 0) this.next();
				else this.prev();
			} else {
				this.goTo(this.current, true);
				this.startAutoplay();
			}

			this.drag.active = false;
			this.drag.dx = 0;
			this.drag.dy = 0;
			this.drag.moved = false;
		}

		goTo(index, animate = true) {
			const total = this.slides.length;
			if (!total) return;

			let nextIndex = index;
			if (this.settings.loop) {
				if (nextIndex < 0) nextIndex = total - 1;
				if (nextIndex >= total) nextIndex = 0;
			} else {
				nextIndex = clamp(nextIndex, 0, total - 1);
			}

			this.current = nextIndex;
			this.track.style.transition = animate ? 'transform 380ms ease' : 'none';
			this.track.style.transform = `translate3d(${-this.current * 100}%,0,0)`;

			this.slides.forEach((slide, i) => {
				const active = i === this.current;
				slide.classList.toggle('is-active', active);
				slide.setAttribute('aria-hidden', active ? 'false' : 'true');
			});
			this.dots.forEach((dot, i) => {
				const active = i === this.current;
				dot.classList.toggle('is-active', active);
				dot.setAttribute('aria-selected', active ? 'true' : 'false');
			});
		}

		prev() {
			this.goTo(this.current - 1, true);
			this.restartAutoplay();
		}

		next() {
			this.goTo(this.current + 1, true);
			this.restartAutoplay();
		}

		startAutoplay() {
			if (!this.settings.autoplay || this.paused) return;
			this.stopAutoplay();
			const delay = clamp(parseInt(this.settings.delay, 10) || 5000, 1000, 15000);
			this.timer = window.setInterval(() => this.next(), delay);
		}

		stopAutoplay() {
			if (this.timer) {
				window.clearInterval(this.timer);
				this.timer = null;
			}
		}

		restartAutoplay() {
			this.stopAutoplay();
			this.startAutoplay();
		}

		pauseAutoplay(isPaused) {
			this.paused = !!isPaused;
			if (this.paused) {
				this.root.classList.add('is-paused');
				this.stopAutoplay();
			} else {
				this.root.classList.remove('is-paused');
				this.startAutoplay();
			}
		}

		togglePause() {
			this.pauseAutoplay(!this.paused);
		}
	}

	function init() {
		document.querySelectorAll('[data-myslider="1"]').forEach((root) => {
			if (root.__mysliderInited) return;
			root.__mysliderInited = true;
			root.__mysliderInstance = new MyHeroSlider(root);
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();