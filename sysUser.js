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
		checkExists: function(username,callback){
			if(this.validate(username)){
				exec('id -u '+String(username),function(error,stdout,stderr){
					if(error){
						callback(null, false);
					}else{
						callback(null, true);
					}
				});
			}else{
				callback('Invalid username given');
			}
		},
		getUID: function(username,callback){
			if(this.validate(username)){
				exec('id -u '+String(username),function(error,stdout,stderr){
					if(error){
						callback('User does not exist');
					}else{
						callback(null, stdout);
					}
				});
			}else{
				callback('Invalid username given');
			}
		},
		add: function(username,flags,callback){
			if(callback == undefined){
				callback = flags;
				flags = '';
			}
			username = String(username); // just to do some basic sanitization
			this.checkExists(username,function(err,exists){
				if(err){
					callback(err);
				}else{
					if(exists === true){
						callback('User already exists');
					}else{
						var cmd = 'adduser '+username+buildFlags(flags);
						console.log('CMD',cmd);
						exec(cmd,function(error,stdout,stderr){
							if(error){
								callback(stderr);
							}else{
								exec('id -u '+username,function(error,stdout,stderr){
									if(error){
										callback(stderr);
									}else{
										callback(null,stdout);
									}
								});
							}
						});
					}
				}
			});
		},
		delete: function(username,flags,callback){
			if(callback == undefined){
				callback = flags;
				flags = '';
			}
			this.checkExists(username,function(err,exists){
				if(err){
					callback(err);
				}else{
					if(exists === true){
						exec('userdel '+String(username)+buildFlags(flags),function(error,stdout,stderr){
							if(error){
								callback(stderr);
							}else{
								callback(null);
							}
						});
					}else{
						callback('User does not exist');
					}
				}
			});
		},
		setGroup: function(username,group,callback){
			exec('usermod -g '+String(group)+' '+String(username),function(error,stdout,stderr){
				if(error){
					callback(stderr);
				}else{
					callback();
				}
			});
		},
		addToGroup: function(username,group,callback){
			exec('usermod -G '+String(group)+' '+String(username),function(error,stdout,stderr){
				if(error){
					callback(stderr);
				}else{
					callback();
				}
			});
		}
	}
}