define({ "api": [  {    "type": "getUserInfo",    "url": "/return",    "title": "the user information given the userid",    "name": "GetUserInfo",    "group": "User",    "version": "0.1.0",    "parameter": {      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "user_id",            "description": "<p>User's unique id</p>"          }        ]      }    },    "success": {      "examples": [        {          "title": "Success-Response:",          "content": "HTTP/1.1 250 OK\n{\n    userId: user_id,\n    username: username,\n    email: email    \n  }",          "type": "json"        }      ]    },    "filename": "./routes/userlogin.js",    "groupTitle": "User"  },  {    "type": "login",    "url": "/user",    "title": "login",    "name": "Login",    "group": "User",    "version": "0.1.0",    "parameter": {      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "email",            "description": "<p>User's email</p>"          },          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "password",            "description": "<p>Entered password</p>"          }        ]      }    },    "success": {      "examples": [        {          "title": "Success-Response:",          "content": "HTTP/1.1 250 OK\n{\n    \"success\": \"user login sucessfully\"\n  }",          "type": "json"        }      ]    },    "error": {      "examples": [        {          "title": "Error-Response:",          "content": "HTTP/1.1 422\n{\n  \"error\": \"Email does not exist\"\n}",          "type": "json"        },        {          "title": "Error-Response:",          "content": "HTTP/1.1 422\n{\n  \"error\": \"Email and password does not match\"\n}",          "type": "json"        }      ]    },    "filename": "./routes/userlogin.js",    "groupTitle": "User"  },  {    "type": "register",    "url": "/Register",    "title": "a new user",    "name": "Register",    "group": "User",    "version": "0.1.0",    "parameter": {      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "username",            "description": "<p>Username</p>"          },          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "email",            "description": "<p>User's email</p>"          },          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "password",            "description": "<p>User entered password</p>"          }        ]      }    },    "success": {      "examples": [        {          "title": "Success-Response:",          "content": "HTTP/1.1 250 OK\n{\n    \"success\": \"user registered sucessfully\"\n  }",          "type": "json"        }      ]    },    "error": {      "examples": [        {          "title": "Error-Response:",          "content": "HTTP/1.1 422\n{\n  \"error\": \"Email already registered!\"\n}",          "type": "json"        }      ]    },    "filename": "./routes/userlogin.js",    "groupTitle": "User"  },  {    "type": "resetpassword",    "url": "/check",    "title": "if user enter authentication code right or vaild then update the password",    "name": "Resetpassword",    "group": "User",    "version": "0.1.0",    "parameter": {      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "email",            "description": "<p>User's email</p>"          },          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "password",            "description": "<p>User's new password</p>"          },          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "aucode",            "description": "<p>User entered authentication code</p>"          }        ]      },      "examples": [        {          "title": "Request-Example:",          "content": "{\n  \"email\": \"jwu108@illinois.edu\",\n  \"password\": \"12345678\",\n  \"aucode\": \"Ml7eX4Q85L\"\n}",          "type": "json"        }      ]    },    "success": {      "examples": [        {          "title": "Success-Response:",          "content": "HTTP/1.1 250 OK\n{\n    \"success\": \"Reset successfully\"\n  }",          "type": "json"        }      ]    },    "error": {      "examples": [        {          "title": "authentication code exipried:",          "content": "HTTP/1.1 422\n{\n  \"error\": \"aucode expired!\"\n}",          "type": "json"        },        {          "title": "authentication code exipried:",          "content": "HTTP/1.1 422\n{\n  \"error\": \"aucode unmatched!\"\n}",          "type": "json"        }      ]    },    "filename": "./routes/userlogin.js",    "groupTitle": "User"  },  {    "type": "sendemail",    "url": "/user",    "title": "click sendemail to send reset information",    "name": "Sendemail",    "group": "User",    "version": "0.1.0",    "parameter": {      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "email",            "description": "<p>User's email</p>"          }        ]      }    },    "success": {      "examples": [        {          "title": "Success-Response:",          "content": "HTTP/1.1 250 OK\n{\n    \"success\": \"Email sended successfully\"\n  }",          "type": "json"        }      ]    },    "error": {      "examples": [        {          "title": "Error-Response:",          "content": "HTTP/1.1 422\n{\n  \"error\": \"Email does not exist\"\n}",          "type": "json"        }      ]    },    "filename": "./routes/userlogin.js",    "groupTitle": "User"  }] });
