async function loadComponent(id, file) {
    const element = document.getElementById(id);

    if (!element) return;

    try {
        const response = await fetch(file);

        if (!response.ok)
            throw new Error("Failed to load " + file);

        element.innerHTML = await response.text();

        // Footer loaded → initialize email copy button
        if (id === "footer") {
            initFooter();
        }

    } catch (err) {
        console.error(err);
    }
}

function initFooter() {

    const emailButton = document.getElementById("copy-email");

    if (!emailButton) return;

    emailButton.addEventListener("click", async () => {

        try {

            await navigator.clipboard.writeText(
                "hayeonjeongs19@gmail.com"
            );

            const icon = emailButton.querySelector(".copy-icon");

            const original = icon.textContent;

            icon.textContent = "✅";

            setTimeout(() => {

                icon.textContent = original;

            }, 2000);

        } catch (err) {

            console.error(err);

        }

    });

}

loadComponent("footer", "components/footer.html");