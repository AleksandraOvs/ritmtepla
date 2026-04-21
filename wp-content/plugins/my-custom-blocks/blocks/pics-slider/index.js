(function (wp) {
    const { registerBlockType } = wp.blocks;
    const { MediaUpload, MediaUploadCheck, RichText, useBlockProps } = wp.blockEditor;
    const { Button } = wp.components;
    const { Fragment } = wp.element;

    registerBlockType('my-custom-blocks/pics-slider', {
        title: 'Pics Slider',
        category: 'widgets',
        icon: 'images-alt2',
        attributes: {
            items: { type: 'array', default: [] },
        },

        edit: function (props) {
            const blockProps = useBlockProps();
            const items = props.attributes.items || [];

            const setItems = (newItems) => props.setAttributes({ items: newItems });

            const addImages = (media) => {
                const newItems = media.map(img => ({
                    id: img.id,
                    img: img.url,
                    alt: img.alt,
                    title: '',
                    url: ''
                }));
                setItems(newItems);
            };

            const replaceImage = (index, img) => {
                const newItems = [...items];
                newItems[index].id = img.id;
                newItems[index].img = img.url;
                newItems[index].alt = img.alt;
                setItems(newItems);
            };

            const updateField = (index, field, value) => {
                const newItems = [...items];
                newItems[index][field] = value;
                setItems(newItems);
            };

            const moveItem = (from, to) => {
                const newItems = [...items];
                const [moved] = newItems.splice(from, 1);
                newItems.splice(to, 0, moved);
                setItems(newItems);
            };

            return wp.element.createElement(
                'div',
                blockProps,
                items.length === 0
                    ? wp.element.createElement(MediaUploadCheck, null,
                        wp.element.createElement(MediaUpload, {
                            onSelect: addImages,
                            allowedTypes: ['image'],
                            multiple: true,
                            gallery: true,
                            value: [],
                            render: (obj) => wp.element.createElement(Button, { onClick: obj.open, isPrimary: true }, 'Добавить изображения')
                        })
                    )
                    : items.map((item, index) => wp.element.createElement('div', { key: item.id, className: 'pics-slide-editor' },
                        wp.element.createElement(MediaUploadCheck, null,
                            wp.element.createElement(MediaUpload, {
                                onSelect: (img) => replaceImage(index, img),
                                allowedTypes: ['image'],
                                value: item.id,
                                render: (obj) => wp.element.createElement('img', { src: item.img, alt: item.alt, onClick: obj.open, style: { cursor: 'pointer', maxWidth: '100%' } })
                            })
                        ),
                        wp.element.createElement(RichText, {
                            tagName: 'h3',
                            placeholder: 'Заголовок',
                            value: item.title,
                            onChange: (val) => updateField(index, 'title', val)
                        }),
                        wp.element.createElement('input', {
                            type: 'url',
                            placeholder: 'Ссылка',
                            value: item.url,
                            onChange: (e) => updateField(index, 'url', e.target.value)
                        }),
                        index > 0 && wp.element.createElement(Button, { onClick: () => moveItem(index, index - 1) }, '↑'),
                        index < items.length - 1 && wp.element.createElement(Button, { onClick: () => moveItem(index, index + 1) }, '↓')
                    ))
            );
        },

        save: function (props) {
            return null; // динамический блок
        }
    });
})(window.wp);