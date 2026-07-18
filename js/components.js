async function loadComponent(id, file) {
    const element = document.getElementById(id);

    if (!element) return;

    try {
        const response = await fetch(file);

        if (!response.ok)
            throw new Error("Failed to load " + file);

        element.innerHTML = await response.text();
    } catch (err) {
        console.error(err);
    }
}

loadComponent("footer", "components/footer.html");