const db            = require('./models'),
      express       = require('express'),
      logger        = require('morgan'),
      mongoose      = require('mongoose'),
      bodyParser    = require('body-parser'),
      cheerio       = require('cheerio'),
      axios         = require('axios'),
      pug           = require('pug'),
      PORT          = 3000,
      path          = require('path'),
      fs            = require('fs'),
      app           = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, './public'));
app.set('view engine', 'pug');
app.use('/static', express.static(__dirname + '/public'));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/scrape';
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

app.get('/', function (req, res) {
    res.render('index');
})

app.get("/scrape", function (req, res) {

    axios.get("http://www.fark.com/").then(function (response) {

        const $ = cheerio.load(response.data);

        let articles = [];

        $("tr.headlineRow").each(function (i, element) {

            let result = {};

            result.title = $(this)
                .children(".headlineText")
                .text();
            result.link = $(this)
                .children(".headlineText")
                .children(".headline")
                .children("a")
                .attr("href");
            result.note = null;

            if (result.title) {
                articles.push(result);
            }
        });

        db.Article.insertMany(articles)
            .then(function(results) {
                res.send('scrape completed');
        })
    });
});

app.get("/articles", function(req, res) {
    db.Article.find({})
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        return res.json(err);
      });
});


app.get("/articles/:id", function(req, res) {
    db.Article.findOne({_id: req.params.id})
        .populate("note")
        .then(function(dbArticle) {
        res.json(dbArticle);
        })
        .catch(function(err) {
        res.json(err);
        });
});

app.post("/articles/:id", function(req, res) {
    db.Note.create(req.body)
      .then(function(dbNote) {
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
      })
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json(err);
      });
  });

app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });