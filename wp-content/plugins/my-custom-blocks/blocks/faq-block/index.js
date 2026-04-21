(function (wp) {
    const { registerBlockType } = wp.blocks;
    const { RichText, useBlockProps } = wp.blockEditor;
    const { Button } = wp.components;
    const { Fragment } = wp.element;

    registerBlockType('my-custom-blocks/faq-block', {
        title: 'FAQ - вопросы и ответы',
        category: 'widgets',
        icon: 'editor-help',

        attributes: {
            items: {
                type: 'array',
                default: []
            }
        },

        edit: function (props) {
            const blockProps = useBlockProps();
            const items = props.attributes.items || [];

            const setItems = (newItems) => {
                props.setAttributes({ items: newItems });
            };

            const addItem = () => {
                setItems([
                    ...items,
                    {
                        question: '',
                        answer: ''
                    }
                ]);
            };

            const updateItem = (index, field, value) => {
                const newItems = [...items];
                newItems[index][field] = value;
                setItems(newItems);
            };

            const removeItem = (index) => {
                const newItems = items.filter((_, i) => i !== index);
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

                items.length === 0 &&
                wp.element.createElement(
                    Button,
                    {
                        isPrimary: true,
                        onClick: addItem
                    },
                    'Добавить вопрос'
                ),

                items.map((item, index) =>
                    wp.element.createElement(
                        'div',
                        {
                            key: index,
                            className: 'faq-item-editor',
                        },

                        wp.element.createElement(RichText, {
                            tagName: 'h4',
                            placeholder: 'Вопрос',
                            value: item.question,
                            onChange: (val) =>
                                updateItem(index, 'question', val)
                        }),

                        wp.element.createElement(RichText, {
                            tagName: 'p',
                            placeholder: 'Ответ',
                            value: item.answer,
                            onChange: (val) =>
                                updateItem(index, 'answer', val)
                        }),

                        wp.element.createElement(
                            'div',
                            { style: { marginTop: '10px' } },

                            index > 0 &&
                            wp.element.createElement(
                                Button,
                                {
                                    onClick: () =>
                                        moveItem(index, index - 1)
                                },
                                '↑'
                            ),

                            index < items.length - 1 &&
                            wp.element.createElement(
                                Button,
                                {
                                    onClick: () =>
                                        moveItem(index, index + 1)
                                },
                                '↓'
                            ),

                            wp.element.createElement(
                                Button,
                                {
                                    isDestructive: true,
                                    onClick: () => removeItem(index)
                                },
                                'Удалить'
                            )
                        )
                    )
                ),

                items.length > 0 &&
                wp.element.createElement(
                    Button,
                    {
                        isPrimary: true,
                        onClick: addItem
                    },
                    'Добавить еще'
                )
            );
        },

        save: function () {
            return null; // динамический блок
        }
    });
})(window.wp);