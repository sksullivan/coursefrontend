(function () {
	"use strict";

	angular
		.module('scheedule')
		.service('AuthService', AuthService);

	function AuthService () {
		var as = this;

		as.init = function () {
			window.onSignIn = as.onSignIn;
		};

		as.onSignIn = function (googleUser) {
			var id_token = googleUser.getAuthResponse().id_token;
			console.log(id_token);
			$.post('/api/oauth/', {token: id_token});
		};

		as.init();
	}
})();