const b = document.getElementById("mode");

function updateThemeButton() {

    const dark = document.documentElement.classList.contains("dark");

    b.textContent = dark ? "☀️" : "🌙";

}

if (localStorage.theme === "dark") {

    document.documentElement.classList.add("dark");

}

updateThemeButton();

b.addEventListener("click", () => {

    document.documentElement.classList.toggle("dark");

    localStorage.theme =
        document.documentElement.classList.contains("dark")
            ? "dark"
            : "light";

    b.classList.add("spin");

    updateThemeButton();

    setTimeout(() => {

        b.classList.remove("spin");

    }, 400);

});