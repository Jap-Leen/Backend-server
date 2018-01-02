var express = require('express');
var users = express.Router();
var database = require('../Database/database');
var cors = require('cors')
var jwt = require('jsonwebtoken');
var token;

users.use(cors());

process.env.SECRET_KEY = "jap";

users.post('/register', function(req, res) {

    var today = new Date();
    var appData = {
        "error": 1,
        "data": ""
    };
    var userData = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        created: today,
	type: req.body.ty,
	
    }

    database.connection.getConnection(function(err, connection) {
        if (err) {
            appData["error"] = 1;
            appData["data"] = "Internal Server Error";
            res.status(500).json(appData);
        } else {
            connection.query('INSERT INTO Users SET ?', userData, function(err, rows, fields) {
                if (!err) {
                    appData.error = 0;
                    appData["data"] = "User registered successfully!";
                    res.status(201).json(appData);
                } else {
			console.log(err);
                    appData["data"] = "Error Occured!";
			
                    res.status(400).json(appData);
                }
            });
            connection.release();
        }
    });
});

users.post('/login', function(req, res) {

    var appData = {};
    var email = req.body.email;
    var password = req.body.password;

    database.connection.getConnection(function(err, connection) {
        if (err) {
            appData["error"] = 1;
            appData["data"] = "Internal Server Error";
            res.status(500).json(appData);
        } else {
            connection.query('SELECT * FROM users WHERE email = ?', [email], function(err, rows, fields) {
                if (err) {
                    appData.error = 1;
                    appData["data"] = "Error Occured!";
                    res.status(400).json(appData);
                } else {
                    if (rows.length > 0) {
                        if (rows[0].password == password) {
                            token = jwt.sign(rows[0], process.env.SECRET_KEY, {
                                expiresIn: 5000
                            });
                            appData.error = 0;
                            appData["token"] = token;
                            res.status(200).json(appData);
                        } else {
                            appData.error = 1;
                            appData["data"] = "Email and Password does not match";
                            res.status(204).json(appData);
                        }
                    } else {
                        appData.error = 1;
                        appData["data"] = "Email does not exists!";
                        res.status(204).json(appData);
                    }
                }
            });
            connection.release();
        }
    });
});



users.get('/getbooksavailable', function(req, res) {
	var token = req.body.token || req.headers['token'];
    var appData = {};
    if (token) {
        jwt.verify(token, process.env.SECRET_KEY, function(err) {
            if (err) {var appData = {};
		       var verr="error";
	              var vdata="data";
                       appData[verr] = 1;
	
                    appData[vdata] = "Token is invalid";
			console.log(err);
                res.status(500).json(appData);
            } else {   var appData = {};
                database.connection.getConnection(function(err, connection) {
        	if (err) {
            	appData["error"] = 1;
            	appData["data"] = "Internal Server Error";
           	 res.status(500).json(appData);
      		  } else {
           	 connection.query('SELECT * FROM booksavailable', function(err, rows, fields) {
                if (!err) {
                    appData["error"] = 0;
                    appData["data"] = rows;
                    res.status(200).json(appData);
                } else {
                    appData["data"] = "No data found";
                    res.status(204).json(appData);
                }
            });
            connection.release();
        }
    });
            }
        });
    } else {
        appData["error"] = 1;
        appData["data"] = "Please send a token";
        res.status(403).json(appData);
    }
 

});
users.get('/getbooksrequested', function(req, res) {
	var token = req.body.token || req.headers['token'];
    var appData = {};
    if (token) {
        jwt.verify(token, process.env.SECRET_KEY, function(err) {
            if (err) {
                appData["error"] = 1;
                appData["data"] = "Token is invalid";
                res.status(500).json(appData);
            } else { var appData = {};

                database.connection.getConnection(function(err, connection) {
        if (err) {
            appData["error"] = 1;
            appData["data"] = "Internal Server Error";
            res.status(500).json(appData);
        } else {
            connection.query('SELECT * FROM booksrequested', function(err, rows, fields) {
                if (!err) {
                    appData["error"] = 0;
                    appData["data"] = rows;
                    res.status(200).json(appData);
                } else {
                    appData["data"] = "No data found";
                    res.status(204).json(appData);
                }
            });
            connection.release();
        }
    });
            }
        });
    } else {
        appData["error"] = 1;
        appData["data"] = "Please send a token";
        res.status(403).json(appData);
    }
   
    
});
users.get('/getallbooks', function(req, res) {
	var token = req.body.token || req.headers['token'];
    var appData = {};
    if (token) {
        jwt.verify(token, process.env.SECRET_KEY, function(err) {
            if (err) {
                appData["error"] = 1;
                appData["data"] = "Token is invalid";
                res.status(500).json(appData);
            } else {   var appData = {};
                database.connection.getConnection(function(err, connection) {
        if (err) {
            appData["error"] = 1;
            appData["data"] = "Internal Server Error";
            res.status(500).json(appData);
        } else {
            connection.query('SELECT isbnNumber, quantity, email, created FROM booksavailable UNION SELECT isbnNumber, quantity, email, created FROM booksrequested', function(err, rows, fields) {
                if (!err) {
                    appData["error"] = 0;
                    appData["data"] = rows;
                    res.status(200).json(appData);
                } else {console.log(err);
                    appData["data"] = "No data found";
                    res.status(204).json(appData);
                }
            });
            connection.release();
        }
    });
            }
        });
    } else {
        appData["error"] = 1;
        appData["data"] = "Please send a token";
        res.status(403).json(appData);
    }
 

    
});

users.post('/createrequest', function(req, res) {
	var token = req.body.token || req.headers['token'];
    var appData = {};
    if (token) {
        jwt.verify(token, process.env.SECRET_KEY, function(err, decoded) {
            if (err) {
                appData["error"] = 1;
                appData["data"] = "Token is invalid";
                res.status(500).json(appData);
            } else { var today = new Date();
var appData = {};
    var userData={
	location : req.body.location,
	isbnNumber : req.body.isbnNumber,
	quantity: req.body.quantity,
	email:decoded.email,
	created : today,
	}
                  database.connection.getConnection(function(err, connection) {
        if (err) {
            appData["error"] = 1;
            appData["data"] = "Internal Server Error";
            res.status(500).json(appData);
        } else {
            connection.query('INSERT INTO booksrequested SET ?',userData,  function(err, rows, fields) {
                if (!err) { 
                    appData.error = 0;
                    appData["data"] = "Book requested successfully!";
                    res.status(201).json(appData);
			
                } else {
			console.log(err);
                    appData["data"] = "Error Occured!";
			
                    res.status(400).json(appData);
                }
            });
            connection.release();
        }
    });
            }
        });
    } else {
        appData["error"] = 1;
        appData["data"] = "Please send a token";
        res.status(403).json(appData);
    }
	
   

  
});

users.post('/createavailable', function(req, res) {
	var token = req.body.token || req.headers['token'];
   
    if (token) {
        jwt.verify(token, process.env.SECRET_KEY, function(err,decoded) {
            if (err) { var appData = {};
		       var verr="error";
	              var vdata="data";
                       appData[verr] = 1;
	
                    appData[vdata] = "Token is invalid";
			console.log(err);
                res.status(500).json(appData);
            } else { var today = new Date();
	var userData={
	location : req.body.location,
	imageurl : req.body.imageurl,
	isbnNumber: req.body.isbnNumber,
	quantity: req.body.quantity,
	email:decoded.email,
	created: today,
	
	}
    var appData = {};
                database.connection.getConnection(function(err, connection) {
        if (err) {
            appData["error"] = 1;
            appData["data"] = "Internal Server Error";
            res.status(500).json(appData);
        } else {
            connection.query('INSERT INTO booksavailable SET ?', userData,  function(err, rows, fields) {
                if (!err) {
                    appData.error = 0;
                    appData["data"] = "Book added successfully!";
                    res.status(201).json(appData);
			
                } else {
			console.log(err);
                    appData["data"] = "Error Occured!";
			
                    res.status(400).json(appData);
                }


                
            });
            connection.release();
        }
    });
            }
        });
    } else {
        appData["error"] = 1;
        appData["data"] = "Please send a token";
        res.status(403).json(appData);
    }
	
    

    
});
users.get('/getmyavailable', function(req, res) {
	var token = req.body.token || req.headers['token'];
    var appData = {};
    if (token) {
        jwt.verify(token, process.env.SECRET_KEY, function(err, decoded) {
            if (err) {
                appData["error"] = 1;
                appData["data"] = "Token is invalid";
                res.status(500).json(appData);
            } else {
                 console.log(decoded.email)
                 var appData = {};
                  database.connection.getConnection(function(err, connection) {
        if (err) {
            appData["error"] = 1;
            appData["data"] = "Internal Server Error";
            res.status(500).json(appData);
        } else {
            connection.query('SELECT * FROM booksavailable WHERE email= ?',[decoded.email],  function(err, rows, fields) {
                if (!err) {
                    appData["error"] = 0;
                    appData["data"] = rows;
                    res.status(200).json(appData);
                } else {console.log(err);
                    appData["data"] = "No data found";
                    res.status(204).json(appData);
                }
            });
            connection.release();
        }
    });
            }
        });
    } else {
        appData["error"] = 1;
        appData["data"] = "Please send a token";
        res.status(403).json(appData);
    }
  
  
});
users.get('/getmyrequested', function(req, res) {
	var token = req.body.token || req.headers['token'];
    var appData = {};
    if (token) {
        jwt.verify(token, process.env.SECRET_KEY, function(err, decoded) {
            if (err) {
                appData["error"] = 1;
                appData["data"] = "Token is invalid";
                res.status(500).json(appData);
            } else {
                 console.log(decoded.email)
                 var appData = {};
                  database.connection.getConnection(function(err, connection) {
        if (err) {
            appData["error"] = 1;
            appData["data"] = "Internal Server Error";
            res.status(500).json(appData);
        } else {
            connection.query('SELECT * FROM booksrequested WHERE email= ?',[decoded.email],  function(err, rows, fields) {
                if (!err) {
                    appData["error"] = 0;
                    appData["data"] = rows;
                    res.status(200).json(appData);
                } else {console.log(err);
                    appData["data"] = "No data found";
                    res.status(204).json(appData);
                }
            });
            connection.release();
        }
    });
            }
        });
    } else {
        appData["error"] = 1;
        appData["data"] = "Please send a token";
        res.status(403).json(appData);
    }
 
});
users.get('/mytransactions', function(req, res) {
	var token = req.body.token || req.headers['token'];
    var appData = {};
    if (token) {
        jwt.verify(token, process.env.SECRET_KEY, function(err, decoded) {
            if (err) {
                appData["error"] = 1;
                appData["data"] = "Token is invalid";
                res.status(500).json(appData);
            } else {
                 console.log(decoded.email)
                 var appData = {};
                  database.connection.getConnection(function(err, connection) {
        if (err) {
            appData["error"] = 1;
            appData["data"] = "Internal Server Error";
            res.status(500).json(appData);
        } else {
            connection.query('SELECT * FROM transactions WHERE email= ?',[decoded.email],  function(err, rows, fields) {
                if (!err) {
                    appData["error"] = 0;
                    appData["data"] = rows;
                    res.status(200).json(appData);
                } else {console.log(err);
                    appData["data"] = "No data found";
                    res.status(204).json(appData);
                }
            });
            connection.release();
        }
    });
            }
        });
    } else {
        appData["error"] = 1;
        appData["data"] = "Please send a token";
        res.status(403).json(appData);
    }
 
});
module.exports = users;
