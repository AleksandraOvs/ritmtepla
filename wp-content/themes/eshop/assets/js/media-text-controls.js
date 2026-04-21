(function () {

    const { addFilter } = wp.hooks;
    const { createHigherOrderComponent } = wp.compose;
    const { Fragment, createElement: el } = wp.element;
    const { InspectorControls } = wp.blockEditor;
    const { PanelBody, TextControl } = wp.components;

    /**
     * 1. Добавляем атрибуты
     */
    addFilter(
        'blocks.registerBlockType',
        'custom/media-text/attributes',
        function (settings, name) {
            if (name !== 'core/media-text') return settings;

            settings.attributes = Object.assign({}, settings.attributes, {
                imgWidth: { type: 'string', default: '' },
                imgHeight: { type: 'string', default: '' },
            });

            return settings;
        }
    );

    /**
     * 2. Контролы
     */
    const withInspectorControls = createHigherOrderComponent(function (BlockEdit) {
        return function (props) {

            if (props.name !== 'core/media-text') {
                return el(BlockEdit, props);
            }

            const { attributes, setAttributes } = props;
            const { imgWidth, imgHeight } = attributes;

            return el(
                Fragment,
                {},
                el(BlockEdit, props),

                el(
                    InspectorControls,
                    {},
                    el(
                        PanelBody,
                        { title: 'Размер изображения (px)', initialOpen: true },

                        el(TextControl, {
                            label: 'Ширина (px)',
                            value: imgWidth,
                            onChange: function (value) {
                                setAttributes({ imgWidth: value });
                            },
                        }),

                        el(TextControl, {
                            label: 'Высота (px)',
                            value: imgHeight,
                            onChange: function (value) {
                                setAttributes({ imgHeight: value });
                            },
                        })
                    )
                )
            );
        };
    }, 'withInspectorControls');

    addFilter(
        'editor.BlockEdit',
        'custom/media-text/inspector',
        withInspectorControls
    );

    /**
     * 3. Стили в редакторе
     */
    const withEditorStyles = createHigherOrderComponent(function (BlockListBlock) {
        return function (props) {

            if (props.name !== 'core/media-text') {
                return el(BlockListBlock, props);
            }

            const { imgWidth, imgHeight } = props.attributes;

            const style = {};
            if (imgWidth) style['--custom-img-width'] = imgWidth + 'px';
            if (imgHeight) style['--custom-img-height'] = imgHeight + 'px';

            const wrapperProps = Object.assign({}, props.wrapperProps || {}, {
                style: Object.assign({}, (props.wrapperProps || {}).style || {}, style)
            });

            return el(BlockListBlock, Object.assign({}, props, { wrapperProps }));
        };
    }, 'withEditorStyles');

    addFilter(
        'editor.BlockListBlock',
        'custom/media-text/editor-style',
        withEditorStyles
    );

    /**
     * 4. Стили на фронте
     */
    addFilter(
        'blocks.getSaveContent.extraProps',
        'custom/media-text/save-style',
        function (extraProps, blockType, attributes) {

            if (blockType.name !== 'core/media-text') return extraProps;

            const { imgWidth, imgHeight } = attributes;

            if (imgWidth || imgHeight) {
                extraProps.style = Object.assign({}, extraProps.style || {}, {
                    ...(imgWidth ? { '--custom-img-width': imgWidth + 'px' } : {}),
                    ...(imgHeight ? { '--custom-img-height': imgHeight + 'px' } : {}),
                });
            }

            return extraProps;
        }
    );

})();