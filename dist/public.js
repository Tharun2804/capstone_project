const booksUl = document.getElementById("booksUl");

async function fetchBooksWithSummaries() {
    const booksResponse = await fetch("http://localhost:3000/books");
    const books = await booksResponse.json();
    
    booksUl.innerHTML = "";
    if (books.length === 0) {
        booksUl.innerHTML = "<li>No books available yet.</li>";
        return;
    }

    const booksWithSummaries = await Promise.all(
        books.map(async book => {
            const reviewsResponse = await fetch(`http://localhost:3000/books/${book.id}/reviews`);
            const { summary } = await reviewsResponse.json();
            return {
                ...book,
                summary
            };
        })
    );

    booksWithSummaries.forEach(book => {
        const li = document.createElement("li");
        const summaryText = book.summary && book.summary.avg_rating 
            ? `(Avg Rating: ${parseFloat(book.summary.avg_rating).toFixed(2)}/5)`
            : "(No reviews)";

        li.innerHTML = `
            <div>
                <strong>${book.title}</strong> by ${book.author} (${book.publication_year}) ${summaryText}
            </div>
            <div>
                <a href="review.html?id=${book.id}">View Reviews</a>
            </div>
        `;
        booksUl.appendChild(li);
    });
}

fetchBooksWithSummaries();