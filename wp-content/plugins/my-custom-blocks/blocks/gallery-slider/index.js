(function (wp) {
    const { registerBlockType } = wp.blocks;
    const { MediaUpload, MediaUploadCheck, useBlockProps } = wp.blockEditor;
    const { Button, TextControl } = wp.components;
    const { createElement: el, Fragment } = wp.element;
    const { sortableContainer, sortableElement, arrayMoveImmutable } = window.SortableJS || {};

    // Используем react-sortablejs через wp.element, если подключено
    // Если нет, fallback на обычное редактирование

    registerBlockType('my-custom-blocks/gallery-slider', {
        title: 'Gallery Slider',
        icon: 'images-alt2',
        category: 'widgets',

        attributes: {
            items: { type: 'array', default: [] }
        },

        edit: function (props) {
            const blockProps = useBlockProps();
            const items = props.attributes.items || [];

            const setItems = (newItems) => {
                props.setAttributes({ items: newItems });
            };

            const onSelectImages = (media) => {
                const newItems = media.map(img => ({
                    id: img.id,
                    url: img.url,
                    alt: img.alt || '',
                    link: ''
                }));
                setItems([...items, ...newItems]);
            };

            const replaceImage = (index, media) => {
                const newItems = [...items];
                newItems[index] = {
                    ...newItems[index],
                    id: media.id,
                    url: media.url,
                    alt: media.alt || ''
                };
                setItems(newItems);
            };

            const updateField = (index, field, value) => {
                const newItems = [...items];
                newItems[index][field] = value;
                setItems(newItems);
            };

            const removeItem = (index) => {
                const newItems = items.filter((_, i) => i !== index);
                setItems(newItems);
            };

            const moveItem = (oldIndex, newIndex) => {
                const newItems = [...items];
                const moved = newItems.splice(oldIndex, 1)[0];
                newItems.splice(newIndex, 0, moved);
                setItems(newItems);
            };

            // Если подключен SortableJS
            const sortable = (container) => {
                if (!container || !window.Sortable) return;
                new window.Sortable(container, {
                    animation: 150,
                    handle: '.gallery-slide-editor',
                    onEnd: function (evt) {
                        moveItem(evt.oldIndex, evt.newIndex);
                    }
                });
            };

            return el('div', blockProps,
                items.length === 0 &&
                el(MediaUploadCheck, {},
                    el(MediaUpload, {
                        onSelect: onSelectImages,
                        allowedTypes: ['image'],
                        multiple: true,
                        gallery: true,
                        render: ({ open }) => el(Button, { onClick: open, isPrimary: true }, 'Добавить изображения')
                    })
                ),

                // Список изображений с drag & drop
                el('div', { ref: sortable, className: 'gallery-slide-list' },
                    items.map((item, index) =>
                        el('div', {
                            key: item.id || index,
                            className: 'gallery-slide-editor',
                            style: { marginBottom: '20px', cursor: 'move', border: '1px solid #ccc', padding: '5px' }
                        },
                            el(MediaUploadCheck, {},
                                el(MediaUpload, {
                                    onSelect: (media) => replaceImage(index, media),
                                    allowedTypes: ['image'],
                                    value: item.id,
                                    render: ({ open }) => el('img', {
                                        src: item.url,
                                        alt: item.alt,
                                        onClick: open,
                                        style: { maxWidth: '100%', display: 'block', marginBottom: '10px', cursor: 'pointer' }
                                    })
                                })
                            ),
                            // el(TextControl, {
                            //     label: 'Ссылка при клике',
                            //     value: item.link,
                            //     onChange: (val) => updateField(index, 'link', val)
                            // }),
                            el(Button, {
                                isDestructive: true,
                                onClick: () => removeItem(index),
                                style: { marginTop: '5px' }
                            }, 'Удалить')
                        )
                    )
                ),

                items.length > 0 &&
                el(MediaUploadCheck, {},
                    el(MediaUpload, {
                        onSelect: onSelectImages,
                        allowedTypes: ['image'],
                        multiple: true,
                        gallery: true,
                        render: ({ open }) => el(Button, { onClick: open, isSecondary: true }, 'Добавить ещё')
                    })
                )
            );
        },

        save: function () {
            return null; // динамический блок
        }
    });
})(window.wp);