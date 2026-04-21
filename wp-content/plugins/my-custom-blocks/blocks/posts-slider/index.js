wp.blocks.registerBlockType('my-custom-blocks/posts-slider', {
    attributes: {
        showCategories: { type: 'boolean', default: false },
        postIDs: { type: 'string', default: '' }
    },
    edit: function (props) {
        const { useBlockProps, InspectorControls } = wp.blockEditor;
        const { PanelBody, ToggleControl, TextControl, Spinner } = wp.components;
        const { useState, useEffect, createElement } = wp.element;
        const apiFetch = wp.apiFetch;

        const blockProps = useBlockProps();
        const { showCategories, postIDs } = props.attributes;
        const setAttributes = props.setAttributes;

        const [posts, setPosts] = useState([]);
        const [categories, setCategories] = useState([]);
        const [loading, setLoading] = useState(false);
        const [activeCat, setActiveCat] = useState('all'); // активная категория для редактора

        // Загрузка постов
        useEffect(() => {
            setLoading(true);
            if (!showCategories && postIDs) {
                const ids = postIDs.split(',').map(v => parseInt(v.trim())).filter(Boolean);
                if (ids.length === 0) {
                    setPosts([]);
                    setLoading(false);
                    return;
                }
                apiFetch({ path: `/wp/v2/posts?include=${ids.join(',')}&per_page=${ids.length}&_embed=true` })
                    .then(res => { setPosts(res); setLoading(false); })
                    .catch(() => { setPosts([]); setLoading(false); });
            } else if (showCategories) {
                apiFetch({ path: `/wp/v2/posts?per_page=20&_embed=true` })
                    .then(res => { setPosts(res); setLoading(false); })
                    .catch(() => { setPosts([]); setLoading(false); });
            } else {
                setPosts([]);
                setLoading(false);
            }
        }, [showCategories, postIDs]);

        // Загрузка категорий
        useEffect(() => {
            if (!showCategories) return;
            apiFetch({ path: `/wp/v2/categories?per_page=50` })
                .then(res => setCategories(res))
                .catch(() => setCategories([]));
        }, [showCategories]);

        // Фильтр постов по активной категории
        const filteredPosts = showCategories && activeCat !== 'all'
            ? posts.filter(post => post.categories.includes(activeCat))
            : posts;

        // Inspector Controls
        const inspector = createElement(
            InspectorControls,
            null,
            createElement(
                PanelBody,
                { title: 'Настройки слайдера', initialOpen: true },
                createElement(ToggleControl, {
                    label: 'Отображать все категории',
                    checked: showCategories,
                    onChange: val => {
                        setAttributes({ showCategories: val });
                        setActiveCat('all'); // сброс при переключении
                    }
                }),
                !showCategories && createElement(TextControl, {
                    label: 'Введите ID постов через запятую',
                    value: postIDs,
                    onChange: val => setAttributes({ postIDs: val })
                })
            )
        );

        // Табы категорий
        let tabs = null;
        if (showCategories && categories.length > 0) {
            tabs = createElement(
                'div',
                { className: 'posts-slider-categories' },
                createElement(
                    'button',
                    {
                        className: `category-tab ${activeCat === 'all' ? 'active' : ''}`, key: 'all',
                        onClick: () => setActiveCat('all')
                    },
                    'Все'
                ),
                categories.map(cat => createElement(
                    'button',
                    {
                        className: `category-tab ${activeCat === cat.id ? 'active' : ''}`, key: cat.id,
                        onClick: () => setActiveCat(cat.id)
                    },
                    cat.name
                ))
            );
        }

        // Слайды постов
        const slides = filteredPosts.map(post => {
            const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '';
            return createElement(
                'div',
                { key: post.id, className: 'swiper-slide' },
                createElement(
                    'a',
                    { href: post.link, target: '_blank' },
                    imageUrl && createElement('img', { src: imageUrl, alt: post.title.rendered }),
                    createElement('h3', { dangerouslySetInnerHTML: { __html: post.title.rendered } })
                )
            );
        });

        return createElement(
            'div',
            blockProps,
            inspector,
            loading ? createElement(Spinner) : slides.length === 0 ? 'Нет записей для отображения' : null,
            tabs,
            createElement('div', { className: 'posts-slider swiper' },
                createElement('div', { className: 'swiper-wrapper' }, slides),
                createElement('div', { className: 'swiper-button-next' }),
                createElement('div', { className: 'swiper-button-prev' }),
                createElement('div', { className: 'swiper-pagination' })
            )
        );
    },
    save: function () {
        return null; // динамический рендер через render.php
    }
});