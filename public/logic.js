$.getJSON("/articles", function(data) {
    // For each one
    articles.forEach(article => {
      document.querySelector('#articles').innerHTML = article.title;
    });
  });