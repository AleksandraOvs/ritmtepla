<?php
defined('ABSPATH') || exit;

$items = $attributes['items'] ?? [];

if (empty($items)) return '';
?>

<div class="faq-list">
    <?php foreach ($items as $item) :
        $question = $item['question'] ?? '';
        $answer   = $item['answer'] ?? '';

        if (!$question && !$answer) continue;
    ?>
        <div class="faq-item">
            <?php if ($question) : ?>
                <div class="faq-question">
                    <h4><?php echo wp_kses_post($question); ?></h4>
                    <div class="faq-question__icon">
                        <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.2929 0.292893C12.6834 -0.0976311 13.3164 -0.0976311 13.707 0.292893C14.0975 0.683417 14.0975 1.31643 13.707 1.70696L7.70696 7.70696C7.31643 8.09748 6.68342 8.09748 6.29289 7.70696L0.292893 1.70696C-0.0976311 1.31643 -0.0976311 0.683417 0.292893 0.292893C0.683417 -0.0976311 1.31643 -0.0976311 1.70696 0.292893L6.99992 5.58586L12.2929 0.292893Z" fill="white" />
                        </svg>

                    </div>
                </div>
            <?php endif; ?>

            <?php if ($answer) : ?>
                <div class="faq-answer">
                    <?php echo wp_kses_post($answer); ?>
                </div>
            <?php endif; ?>
        </div>
    <?php endforeach; ?>
</div>