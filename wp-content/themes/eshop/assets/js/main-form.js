document.addEventListener("DOMContentLoaded", function () {

    document.querySelectorAll('a[href="#main-form"]').forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();

            if (typeof Fancybox !== "undefined") {
                Fancybox.show([
                    {
                        src: "#main-form",
                        type: "inline"
                    }
                ]);
            }
        });
    });

});