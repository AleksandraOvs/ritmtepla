// находим все вопросы
const faqButtons = document.querySelectorAll(".faq-question");

faqButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        // родительский элемент faq-item
        const parent = btn.closest(".faq-item");

        // ответ внутри faq-item
        const answer = parent.querySelector(".faq-answer");

        // если у тебя есть иконка внутри вопроса
        const icon = btn.querySelector(".faq-icon");

        // переключаем класс active
        parent.classList.toggle("active");
        if (icon) icon.classList.toggle("active");

        // плавное раскрытие/сворачивание
        if (parent.classList.contains("active")) {
            answer.style.maxHeight = answer.scrollHeight + "px";
        } else {
            answer.style.maxHeight = null;
        }
    });
});