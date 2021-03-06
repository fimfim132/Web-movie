const showtime = require('../models/showtime');

var express     = require('express'),
    multer      = require('multer'),
    Movie       = require('../models/movie'),
    Cinema      = require('../models/cinema'),
    Comment     = require('../models/comment'),
    Theater     = require('../models/theater'),
    path        = require('path'),
    storage     = multer.diskStorage({
                    destination: function(req, file, callback){
                        callback(null, 'public/uploads');
                    },
                    filename: function(req, file, callback){
                        callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
                    }
    }),
    imgFilter = function(req, file, callback){
        if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)){
            return callback(new Error('Only JPG, JPEG, PNG anf GIF image file are allowed!'),false);
        }
        callback(null, true);
    },
    upload = multer({storage: storage, fileFilter: imgFilter}),
    router      = express.Router({mergeParams: true});

router.get('/add/movie', function(req, res){
    res.render('admin/movie.ejs');
});

router.post('/add/movie',upload.single('img'),  function(req, res){
    req.body.movie
    req.body.movie.img = '/uploads/'+ req.file.filename;
    Movie.create(req.body.movie, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            req.flash('success', 'Add movie successfully');
            res.redirect('/movies');
        }
    });
});

router.get('/:id/edit', function(req, res){
    Movie.findById(req.params.id, function(err, foundMovie){
        if(err){
            console.log(err);
        } else {
            res.render('admin/edit.ejs', {movie: foundMovie});
        }
    });
});

router.get('/add/cinema', function(req, res){
    res.render('admin/cinema.ejs');
});

router.post('/add/cinema', function(req, res){
    Cinema.create(req.body.cinema, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            for(i=1; i <= req.body.numoftheater; i++){
                Theater.create({name: i}, function(err, createTheater){
                    if(err){
                        console.log(err);
                    }else{
                        Cinema.findOneAndUpdate({"_id": newlyCreated._id}, {$push: {theaters: createTheater._id}}).exec(function(err, pushTheater){
                            if(err){
                                console.log(err);
                            }else{
                                console.log(pushTheater);
                            }
                        })
                    }
                });
            }
            res.redirect('/cinemas');
            req.flash('success', 'Add cinema successfully');
        }
    });
});

router.get('/:id', function(req, res){
    Theater.findById(req.params.id, function(err, foundTheater){
        if(err){
            console.log(err);
        } else {
            res.render('admin/theater.ejs', {theater: foundTheater});
        }
    });
});


router.put('/:theaters_id', function(req, res){
    Theater.findByIdAndUpdate(req.params.theaters_id, req.body.theater, function(err, updatedMovie){
        if(err){
            console.log(err);
        } else {
            res.redirect('/cinemas');
            req.flash('success', 'Edit successfully');
        }
    });
});

router.delete('/:movie_id', function(req, res){
    Movie.findByIdAndRemove(req.params.movie_id, function(err){
        if(err){
            console.log(err);
            res.redirect('/movies/');
            req.flash('error', err.message);
        } else {
            res.redirect('/movies/');
            req.flash('success', 'Delete movie successfully');
        }
    });
});

router.post('/:cinema_id', function(req, res){
    Cinema.findByIdAndRemove(req.params.cinema_id, function(err, foundCinema){
        if(err){
            console.log(err);
            res.redirect('/cinemas/');
            req.flash('error', err.message);
        } else {
            res.redirect('/cinemas/');
            req.flash('success', 'Add cinema successfully');
        }
    });
});



module.exports = router;