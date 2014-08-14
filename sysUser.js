var cp = require('child_process'),
	exec = cp.exec;

module.exports = function(){
	/*
		Thanks to Pablo Castellazzi via stackoverflow for the regex
		http://stackoverflow.com/questions/6949667/what-are-the-real-rules-for-linux-usernames-on-centos-6-and-rhel-6
	*/
	var validUsernameRegex = /^([a-z_][a-z0-9_]{0,30})$/;

	var buildFlags = function(flags){
		if(typeof flags == "object"){
			if(flags.length>0){
				return " "+flags.join(' ');
			}else{
				return '';
			}
		}else{
			if(flags.length!= undefined && flags.length>0){
				return " "+flags;
			}else{
				return '';
			}
		}
	}

	return {
		validate: function(username){
			return validUsernameRegex.test(username);
		},
		checkExists: function(username, callback){
			if(!this.validate(username)){
				return callback('Invalid username given');
			}
			exec('id -u "' + String(username).trim() + '"', function(error, stdout, stderr){
				if(error){
					return callback(false);
				}
				return callback(true);
			});
		},
		getUID: function(username, callback){
			if(!this.validate(username)){
				return callback('Invalid username given');
			}
			exec('id -u "' + String(username).trim() + '"', function(error, stdout, stderr){
				if(error){
					return callback('User does not exist');
				}
				return callback(null, parseInt(stdout));
			});
		},
		add: function(username, flags, callback){
			if(!callback){
				callback = flags;
				flags = '';
			}
			var sysUser = this;
			sysUser.checkExists(String(username).trim(), function(exists){
				if(exists){
					return callback('User already exists');
				}
				exec('adduser "' + username + '"' + buildFlags(flags), function(error, stdout, stderr){
					if(error){
						return callback(stderr);
					}
					return sysUser.getUID(username, callback);
				});
			});
		},
		delete: function(username, flags, callback){
			if(callback == undefined){
				callback = flags;
				flags = '';
			}
			this.checkExists(String(username).trim(), function(exists){
				if(!exists){
					return callback('User does not exist');
				}
				exec('userdel "' + String(username).trim() + '"' + buildFlags(flags), function(error, stdout, stderr){
					if(error){
						return callback(stderr);
					}
					return callback(null);
				});
			});
		},
		setGroup: function(username, group, callback){
			this.checkExists(username, function(exists){
				if(!exists){
					return callback('User does not exist');
				}
				exec('usermod -g "' + String(group) + '" "' + String(username) + '"', function(error, stdout, stderr){
					if(error){
						return callback(stderr);
					}
					return callback();
				});
			});
		},
		addToGroup: function(username, group, callback){
			this.checkExists(username, function(exists){
				if(!exists){
					return callback('User does not exist');
				}
				exec('usermod -a -G "' + String(group) + '" "' + String(username) + '"', function(error, stdout, stderr){
					if(stderr){
						return callback(stderr);
					}
					return callback();
				});
			});
		}
	}
}