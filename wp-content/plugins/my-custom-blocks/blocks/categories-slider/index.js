(function (wp) {
    const { useBlockProps, InspectorControls } = wp.blockEditor;
    const { PanelBody, TextControl, SelectControl, Spinner, ToggleControl } = wp.components;
    const { useState, useEffect } = wp.element;
    const apiFetch = wp.apiFetch;

    wp.blocks.registerBlockType('my-custom-blocks/categories-slider', {
        edit({ attributes, setAttributes }) {
            const blockProps = useBlockProps();
            const [categories, setCategories] = useState([]);
            const [loading, setLoading] = useState(false);

            useEffect(() => {
                setLoading(true);

                const params = {
                    per_page: 8,
                    hide_empty: false,
                };

                if (attributes.categoryIds) {
                    params.include = attributes.categoryIds
                        .split(',')
                        .map(id => id.trim())
                        .filter(Boolean);
                }

                if (attributes.parentOnly) {
                    params.parent = 0;
                }

                switch (attributes.order) {
                    case 'name-desc':
                        params.orderby = 'name';
                        params.order = 'desc';
                        break;
                    case 'count':
                        params.orderby = 'count';
                        params.order = 'desc';
                        break;
                    case 'id':
                        params.orderby = 'id';
                        params.order = 'asc';
                        break;
                    default:
                        params.orderby = 'name';
                        params.order = 'asc';
                        break;
                }

                apiFetch({
                    path: '/wp/v2/product_cat?' + new URLSearchParams(params).toString(),
                })
                    .then(res => {
                        setCategories(res);
                        setLoading(false);
                    })
                    .catch(() => {
                        setCategories([]);
                        setLoading(false);
                    });

            }, [attributes.categoryIds, attributes.order, attributes.parentOnly]);

            return wp.element.createElement(
                wp.element.Fragment,
                null,

                // Настройки блока в редакторе
                wp.element.createElement(
                    InspectorControls,
                    null,
                    wp.element.createElement(
                        PanelBody,
                        { title: "Настройки слайдера категорий" },

                        wp.element.createElement(TextControl, {
                            label: "ID категорий (через запятую)",
                            value: attributes.categoryIds || '',
                            onChange: val => setAttributes({ categoryIds: val })
                        }),

                        wp.element.createElement(ToggleControl, {
                            label: "Только родительские категории",
                            checked: attributes.parentOnly || false,
                            onChange: val => setAttributes({ parentOnly: val })
                        }),

                        wp.element.createElement(SelectControl, {
                            label: "Сортировка",
                            value: attributes.order || 'name',
                            options: [
                                { label: 'По алфавиту (A → Z)', value: 'name' },
                                { label: 'По алфавиту (Z → A)', value: 'name-desc' },
                                { label: 'По количеству товаров', value: 'count' },
                                { label: 'По ID', value: 'id' },
                            ],
                            onChange: val => setAttributes({ order: val })
                        })
                    )
                ),

                // Превью блока в редакторе
                wp.element.createElement(
                    'div',
                    blockProps,
                    loading
                        ? wp.element.createElement(Spinner)
                        : categories.length === 0
                            ? 'Нет категорий для отображения'
                            : categories.map(cat =>
                                wp.element.createElement(
                                    'div',
                                    { key: cat.id, className: 'category-card' },

                                    cat.image
                                        ? wp.element.createElement(
                                            'div',
                                            { className: 'category-image' },
                                            wp.element.createElement('img', {
                                                src: cat.image.src,
                                                alt: cat.name
                                            })
                                        )
                                        : null,

                                    wp.element.createElement(
                                        'div',
                                        { className: 'category-content' },
                                        wp.element.createElement('h3', null, cat.name),
                                        wp.element.createElement(
                                            'div',
                                            { className: 'count' },
                                            `Товаров: ${cat.count}`
                                        )
                                    )
                                )
                            )
                )
            );
        },

        save() {
            return null; // динамический блок
        },

        attributes: {
            categoryIds: { type: 'string' },
            parentOnly: { type: 'boolean', default: false },
            order: { type: 'string', default: 'name' },
        },
    });
})(window.wp);