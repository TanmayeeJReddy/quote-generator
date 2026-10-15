let currentQuote = "";
let currentAuthor = "";

// Get a new random quote
async function getQuote() {
    try {
        const response = await fetch("/api/quote");
        const data = await response.json();

        currentQuote = data.quote;
        currentAuthor = data.author;

        document.getElementById("quote").textContent =
            `"${currentQuote}"`;

        document.getElementById("author").textContent =
            `— ${currentAuthor}`;

    } catch (error) {
        document.getElementById("quote").textContent =
            "Failed to load quote.";
    }
}

// Save current quote as favorite
async function saveFavorite() {
    if (!currentQuote) {
        alert("Get a quote first!");
        return;
    }

    try {
        const response = await fetch("/api/favorites", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                quote: currentQuote,
                author: currentAuthor
            })
        });

        const data = await response.json();

        alert(data.message);

        loadFavorites();

    } catch (error) {
        alert("Failed to save favorite.");
    }
}

// Load favorite history
async function loadFavorites() {
    try {
        const response = await fetch("/api/favorites");
        const favorites = await response.json();

        const history = document.getElementById("history");

        history.innerHTML = "";

        favorites.forEach(item => {
    const div = document.createElement("div");

    div.className = "history-item";

    div.innerHTML = `
        <p>"${item.quote}"</p>
        <strong>— ${item.author}</strong>
        <br>
        <button onclick="deleteFavorite(${item.id})">
            🗑️ Delete
        </button>
    `;

    history.appendChild(div);
});

    } catch (error) {
        console.error("Failed to load favorites:", error);
    }
}

// Copy quote to clipboard
async function copyQuote() {
    if (!currentQuote) {
        alert("Get a quote first!");
        return;
    }

    await navigator.clipboard.writeText(
        `"${currentQuote}" — ${currentAuthor}`
    );

    alert("Quote copied!");
}

// Button actions
document.getElementById("newQuote").addEventListener("click", getQuote);

document.getElementById("favorite").addEventListener("click", saveFavorite);

document.getElementById("copy").addEventListener("click", copyQuote);

// Load a quote and history when page opens
getQuote();
loadFavorites();
// Delete a favorite
async function deleteFavorite(id) {
    try {
        const response = await fetch(`/api/favorites/${id}`, {
            method: "DELETE"
        });

        const data = await response.json();

        alert(data.message);

        loadFavorites();

    } catch (error) {
        alert("Failed to delete favorite.");
    }
}