document.addEventListener('DOMContentLoaded', function () {
    const toggleIcon = document.querySelector('.toggle-contacts-icon');
    const contactsBar = document.querySelector('.toggle-contacts__bar');

    if (!toggleIcon || !contactsBar) return;

    // Переключение при клике на иконку
    toggleIcon.addEventListener('click', function (e) {
        e.preventDefault();
        contactsBar.classList.toggle('active');
    });

    // Закрытие при клике вне блока
    document.addEventListener('click', function (e) {
        const isClickInside = contactsBar.contains(e.target);
        if (!isClickInside) {
            contactsBar.classList.remove('active');
        }
    });
});