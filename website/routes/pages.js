
exports.index = function(req, res){
	res.render('index');
};

exports.admin = function(req, res){
	//todo check user cookie

	res.render('admin');
};