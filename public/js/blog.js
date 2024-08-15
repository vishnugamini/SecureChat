document.addEventListener("DOMContentLoaded", () => {
    const blogContainer = document.getElementById('blog-container');
    const focusedContent = document.getElementById('focused-content');
    const focusedTitle = document.getElementById('focused-title');
    const focusedText = document.getElementById('focused-text');
    const closeFocusedContent = document.getElementById('close-focused-content');

    blogPosts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.classList.add('post');

        const titleElement = document.createElement('h2');
        titleElement.textContent = post.title;

        const basicContentElement = document.createElement('p');
        basicContentElement.textContent = post.basicContent;

        const readMoreElement = document.createElement('a');
        readMoreElement.href = "#";
        readMoreElement.textContent = "Read More";
        readMoreElement.classList.add('read-more');

        readMoreElement.addEventListener('click', (e) => {
            e.preventDefault();
            focusedTitle.textContent = post.title;
            focusedText.textContent = post.elaboratedContent;
            focusedContent.style.display = 'flex'; 
        });

        postElement.appendChild(titleElement);
        postElement.appendChild(basicContentElement);
        postElement.appendChild(readMoreElement);

        blogContainer.appendChild(postElement);
    });

    closeFocusedContent.addEventListener('click', () => {
        focusedContent.style.display = 'none';
    });
});
