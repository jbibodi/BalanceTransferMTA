/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"ui-space/ui/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});