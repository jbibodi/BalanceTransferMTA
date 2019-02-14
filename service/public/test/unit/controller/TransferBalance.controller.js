/*global QUnit*/

sap.ui.define([
	"ui-space/ui/controller/TransferBalance.controller"
], function (oController) {
	"use strict";

	QUnit.module("TransferBalance Controller");

	QUnit.test("I should test the TransferBalance controller", function (assert) {
		var oAppController = new oController();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});