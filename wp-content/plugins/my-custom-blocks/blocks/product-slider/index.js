
const { useBlockProps, InspectorControls } = wp.blockEditor;
const { PanelBody, TextControl, SelectControl, Spinner } = wp.components;
const { useState, useEffect } = wp.element;
const apiFetch = wp.apiFetch;

wp.blocks.registerBlockType('my-custom-blocks/product-slider', {
    edit({ attributes, setAttributes }) {
        const blockProps = useBlockProps();
        const [products, setProducts] = useState([]);
        const [loading, setLoading] = useState(false);

        useEffect(() => {
            setLoading(true);

            let params = {
                per_page: 8,
                status: 'publish',
            };

            if (attributes.productIds) {
                params.include = attributes.productIds
                    .split(',')
                    .map(id => id.trim());
            }

            if (attributes.categories) {
                params.category = attributes.categories
                    .split(',')
                    .map(slug => slug.trim());
            }

            const fetchTagIds = async (slugs) => {
                const ids = [];
                for (const slug of slugs) {
                    const res = await apiFetch({ path: `/wp/v2/product_tag?slug=${slug}` });
                    if (res && res.length) ids.push(res[0].id);
                }
                return ids;
            };



            switch (attributes.order) {
                case 'date-desc':
                    params.orderby = 'date';
                    params.order = 'desc';
                    break;

                case 'title':
                    params.orderby = 'title';
                    params.order = 'asc';
                    break;

                case 'price':
                    params.orderby = 'meta_value_num';
                    params.meta_key = '_price';
                    params.order = 'asc';
                    break;

                case 'price-desc':
                    params.orderby = 'meta_value_num';
                    params.meta_key = '_price';
                    params.order = 'desc';
                    break;

                default:
                    params.orderby = 'date';
                    params.order = 'asc';
                    break;
            }

            apiFetch({
                path: '/wc/v3/products?' + new URLSearchParams(params).toString(),
            })
                .then(res => {
                    setProducts(res);
                    setLoading(false);
                })
                .catch(() => {
                    setProducts([]);
                    setLoading(false);
                });

        }, [
            attributes.productIds,
            attributes.categories,
            attributes.tags,
            attributes.order
        ]);

        return wp.element.createElement(
            wp.element.Fragment,
            null,

            wp.element.createElement(
                InspectorControls,
                null,
                wp.element.createElement(
                    PanelBody,
                    { title: "Настройки слайдера" },

                    wp.element.createElement(TextControl, {
                        label: "ID товаров (через запятую)",
                        value: attributes.productIds || '',
                        onChange: val => setAttributes({ productIds: val })
                    }),

                    wp.element.createElement(TextControl, {
                        label: "Категории (slug через запятую)",
                        value: attributes.categories || '',
                        onChange: val => setAttributes({ categories: val })
                    }),

                    wp.element.createElement(TextControl, {
                        label: "Метки (slug через запятую)",
                        value: attributes.tags || '',
                        onChange: val => setAttributes({ tags: val })
                    }),

                    wp.element.createElement(SelectControl, {
                        label: "Сортировка",
                        value: attributes.order || 'date',
                        options: [
                            { label: 'Новые сначала', value: 'date' },
                            { label: 'Старые сначала', value: 'date-desc' },
                            { label: 'По алфавиту', value: 'title' },
                            { label: 'По цене (по возрастанию)', value: 'price' },
                            { label: 'По цене (по убыванию)', value: 'price-desc' },
                        ],
                        onChange: val => setAttributes({ order: val })
                    })
                )
            ),

            wp.element.createElement(
                'div',
                blockProps,
                loading
                    ? wp.element.createElement(Spinner)
                    : products.length === 0
                        ? 'Нет товаров для отображения'
                        : products.map(product =>
                            wp.element.createElement(
                                'div',
                                { key: product.id, className: 'product-card' },

                                wp.element.createElement(
                                    'div',
                                    { className: 'product-image' },
                                    product.images?.length
                                        ? wp.element.createElement('img', {
                                            src: product.images[0].src,
                                            alt: product.name
                                        })
                                        : null
                                ),

                                wp.element.createElement(
                                    'div',
                                    { className: 'product-content' },
                                    wp.element.createElement('h3', null, product.name),
                                    wp.element.createElement('div', {
                                        className: 'price',
                                        dangerouslySetInnerHTML: { __html: product.price_html }
                                    })
                                )
                            )
                        )
            )
        );
    },

    save() {
        return null;
    },

    attributes: {
        productIds: { type: 'string' },
        categories: { type: 'string' },
        tags: { type: 'string' },
        order: { type: 'string', default: 'date' },
    },
});