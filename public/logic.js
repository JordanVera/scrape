$.getJSON("/articles", function(data) {
    // For each one
    data.forEach(article => {
      document.querySelector('#articles').innerHTML += `<p data-id="${article._id}" class="article">${article.title}</p> <br /><br />`;
    });
  });

// Whenever someone clicks a p tag
$(document).on("click", ".article", function() {

  console.log('working')
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  let thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log(data);
      const notes = document.querySelector('#notes')
      // The title of the article
      notes.innerHTML = data.title;
      notes.innerHTML = `<input id='titleinput' name='title' />`;
      notes.innerHTML = `<textarea id='bodyinput' name='body'></textarea>`;
      notes.innerHTML = `<button data-id="${data._id}" id="savenote">Save Note</button>`;

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});