document.getElementById('generatePlanner').addEventListener('click', function() {
    fetch('./planner.md')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(markdown => {
            // Use the marked library to convert Markdown to HTML
            const htmlContent = marked.parse(markdown);
            // Insert the HTML into a container element
            document.getElementById('markdown-content').innerHTML = htmlContent;
        })
        .catch(error => {
            console.error('Error fetching the markdown file:', error);
        });
});
