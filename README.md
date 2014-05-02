Installation
=============
    npm install sysuser

What does it do?
=============

sysUser is a simple wrapper for unix commands such as useradd, userdel, & usermod to make changes to system users. In order for this to work the calling program MUST be running as root or have permissions to the user commands in command line. This NPM module is still in early development and has only been tested on the listed operating systems:

 - CentOS 6

Coding Examples
=============
```javascript
    var sysUser = require('sysuser')();

    // create user
    sysUser.add('appUser',['-d','/home/custom/HomeDir'],function(err,uid){
    	if(err){
    		console.log('ERROR',err);
    	}else{
    		console.log('removed');
    	}
    });
```
