<?php
add_action('enqueue_block_editor_assets', function () {
    wp_enqueue_script(
        'custom-media-text-controls',
        get_template_directory_uri() . '/assets/js/media-text-controls.js',
        ['wp-blocks', 'wp-element', 'wp-components', 'wp-editor', 'wp-hooks', 'wp-compose'],
        null,
        true
    );
});
