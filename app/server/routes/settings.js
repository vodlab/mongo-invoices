var DB = require('../modules/db-manager');
var ObjectID = require('mongodb').ObjectID;
var CT = require('../modules/country-list');
var helpers = require('./helpers');

exports.get = function get(req, res) {
	if (req.session.user == null){
		res.redirect('/?from='+req.url);
	} else if (req.session.user.role != 'admin'){
		res.redirect('/?from='+req.url);
	} else {
		DB.settings.findOne({}, function(e, result) {
			if (result) {
				if (!result.emailDispatcher) result.emailDispatcher = require('../modules/config.js')._config.emailDispatcher;
				res.render('settings', {	locals: { title: __('Settings'), countries : CT, result : result, msg:{}, udata : req.session.user } });
			} else {
				if (!global._config.emailDispatcher) global._config.emailDispatcher = require('./config.js')._config.emailDispatcher;
				res.render('settings', {	locals: { title: __('Settings'), countries : CT, result : _config, msg:{}, udata : req.session.user } });
			}
		});
	}
};

exports.post = function post(req, res) {
	if (req.session.user == null) {
		res.redirect('/?from='+req.url);
	} else {
		var errors = [];
		
		if (req.body.id) {
			if (req.body.emailDispatcher.password!="" && req.body.emailDispatcher.password==req.body.emailDispatcher.password_confirm) {
			} else {
				delete req.body.emailDispatcher.password;
			}
			delete req.body.emailDispatcher.password_confirm;
			DB.update_settings(req.body, req.session.user, function(e, o){
				errors.push({name:"",m:__("Settings saved with success")});
				res.render('settings', {	locals: { title: __("Settings"), countries : CT, result : o, msg:{c:errors}, udata : req.session.user } });
			});
		} else {
			DB.insert_settings(req.body, req.session.user, function(e, o){
				var msg = {};
				if (e){
					msg.e = [];
					msg.e.push({name:"",m:__("Error updating settings")});
				} else {
					msg.c = [];
					msg.c.push({name:"",m:__("Settings saved with success")});
				}
				res.redirect('/settings/');
			});
		}
	}
};
