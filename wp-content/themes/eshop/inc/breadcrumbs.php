<?php

// Функция для вывода цепочки категорий с родителями
function get_category_breadcrumbs($category)
{
    echo '<ul class="cats-list">';
    $separator = '&nbsp;/&nbsp;';

    $parents = get_ancestors($category->term_id, 'category');
    $parents = array_reverse($parents);

    foreach ($parents as $parent_id) {
        $parent = get_category($parent_id);
        echo '<a href="' . get_category_link($parent->term_id) . '">' . esc_html($parent->name) . '</a>' . $separator;
    }

    echo '<a href="' . get_category_link($category->term_id) . '">' . esc_html($category->name) . '</a>' . $separator;
    echo '</ul>';
}


function site_breadcrumbs()
{
    echo '<ul class="breadcrumbs__list">';

    $page_num = (get_query_var('paged')) ? get_query_var('paged') : 1;

    $separator = '&nbsp;/&nbsp;';


    if (is_front_page()) {

        if ($page_num > 1) {
            echo '<a class="home-link" href="' . site_url() . '">Главная</a>' . $separator . $page_num . '-page';
        } else {
            echo 'Вы находитесь на главной странице';
        }

        return;
    }


    echo '<a class="home-link" href="' . site_url() . '">Главная</a>' . $separator;


    if (is_singular()) {

        $post_type = get_post_type();
        $post_type_obj = get_post_type_object($post_type);


        if (
            $post_type !== 'post'
            && $post_type_obj instanceof WP_Post_Type
            && !empty($post_type_obj->has_archive)
        ) {

            // заменяем "Товары" на "Каталог"
            $archive_title = ($post_type === 'product')
                ? 'Каталог'
                : $post_type_obj->labels->name;

            echo '<a href="' . get_post_type_archive_link($post_type) . '">'
                . esc_html($archive_title)
                . '</a>' . $separator;
        }


        if ($post_type === 'post') {

            $primary_cat = null;

            if (class_exists('WPSEO_Primary_Term')) {

                $wpseo_primary_term = new WPSEO_Primary_Term('category', get_the_ID());
                $primary_cat_id = $wpseo_primary_term->get_primary_term();

                if ($primary_cat_id) {
                    $primary_cat = get_category($primary_cat_id);
                }
            }

            if (!$primary_cat) {

                $categories = get_the_category();

                if (!empty($categories)) {
                    $primary_cat = $categories[0];
                }
            }

            if ($primary_cat) {
                get_category_breadcrumbs($primary_cat);
            }
        }


        if ($post_type === 'product') {

            $terms = get_the_terms(get_the_ID(), 'product_cat');

            if ($terms && !is_wp_error($terms)) {

                $term = $terms[0];

                $ancestors = get_ancestors($term->term_id, 'product_cat');

                if ($ancestors) {

                    $ancestors = array_reverse($ancestors);

                    foreach ($ancestors as $ancestor_id) {

                        $ancestor = get_term($ancestor_id, 'product_cat');

                        echo '<a href="' . get_term_link($ancestor) . '">'
                            . esc_html($ancestor->name)
                            . '</a>' . $separator;
                    }
                }

                echo '<a href="' . get_term_link($term) . '">'
                    . esc_html($term->name)
                    . '</a>' . $separator;
            }
        }


        // кастомные таксономии
        $taxonomies = get_object_taxonomies($post_type);

        foreach ($taxonomies as $taxonomy) {

            if (
                $taxonomy === 'category'
                || $taxonomy === 'post_tag'
                || $taxonomy === 'product_cat'
                || $taxonomy === 'product_tag'
                || $taxonomy === 'product_type'
            ) continue;
        }


        echo '<span>' . esc_html(get_the_title()) . '</span>';
    } elseif (is_product_category()) {

        $term = get_queried_object();

        if ($term) {

            echo '<a href="' . get_post_type_archive_link('product') . '">Каталог</a>' . $separator;

            $ancestors = get_ancestors($term->term_id, 'product_cat');

            if ($ancestors) {

                $ancestors = array_reverse($ancestors);

                foreach ($ancestors as $ancestor_id) {

                    $ancestor = get_term($ancestor_id, 'product_cat');

                    echo '<a href="' . get_term_link($ancestor) . '">'
                        . esc_html($ancestor->name)
                        . '</a>' . $separator;
                }
            }

            echo '<span>' . esc_html($term->name) . '</span>';
        }
    } elseif (is_post_type_archive()) {

        $post_type = get_post_type();

        if ($post_type === 'product') {

            echo 'Каталог';
        } else {

            $post_type_obj = get_post_type_object($post_type);
            echo esc_html($post_type_obj->labels->name);
        }
    } elseif (is_page()) {

        echo '<span>' . esc_html(get_the_title()) . '</span>';
    } elseif (is_tag()) {

        single_tag_title();
    } elseif (is_404()) {

        echo 'Ошибка 404';
    }


    if ($page_num > 1) {
        echo ' (' . $page_num . '-page)';
    }

    echo '</ul>';
}
