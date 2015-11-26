var mongoose = require('./util/mongoose');
var Piece    = require('./models/piece');

var processed = 0;
var target    = 5;

pieces = [
    {
        date: Date.now(),
        summary: 'Iusto option has ut, dico ipsum corpora qui at.',
        source: 'Eum dolor putent',
        link: 'http://www.google.com/'
    }, {
        date: Date.now(),
        summary: 'Nec an tale altera, sed an iracundia democritum disputando.',
        source: 'Eum dolor putent',
        link: 'http://www.google.com/'
    }, {
        date: Date.now(),
        summary: 'Eripuit menandri splendide ad eum, no usu diam equidem.',
        source: 'Eum dolor putent',
        link: 'http://www.google.com/'
    }, {
        date: Date.now(),
        summary: 'Usu iisque aperiam suscipiantur ei, at sit nullam scripserit.',
        source: 'Eum dolor putent',
        link: 'http://www.google.com/'
    }, {
        date: Date.now(),
        summary: 'Atqui recteque disputationi et mei, tota veri perpetua cu per, an nihil malorum mea.',
        source: 'Eum dolor putent',
        link: 'http://www.google.com/'
    }
]

for (piece of pieces) {
    Piece.create(piece, function(err, doc) {
        if (err) {
            console.error('Error creating piece.');
        } else {
            console.log('Piece created.');
            if (++ processed == target) {
                mongoose.connection.close(function () {
                    console.log('Done.');
                    process.exit(0);
                });
            }
        }
    });
}
