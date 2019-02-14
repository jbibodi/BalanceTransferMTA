/*eslint-disable no-console, no-alert */
/* eslint-disable sap-no-ui5base-prop */
function openErrorDialog(title,message) {
	var dialog = new sap.m.Dialog({
		title: title,
		type: 'Message',
		state: 'Error',
		content: new sap.m.Text({
			text: message
		}),
		beginButton: new sap.m.Button({
			text: 'OK',
			press: function () {
				dialog.close();
			}
		}),
		afterClose: function () {
			dialog.destroy();
		}
	});
	dialog.open();
}

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox"
], function (Controller,MessageBox) {
	"use strict";

	return Controller.extend("ui-space.ui.controller.TransferBalance", {
		/*handleRouteMatched: function (oEvent) {
			var oParams = {};

			if (oEvent.mParameters.data.context) {
				this.sContext = oEvent.mParameters.data.context;

			} else {
				if (this.getOwnerComponent().getComponentData()) {
					var patternConvert = function (oParam) {
						if (Object.keys(oParam).length !== 0) {
							for (var prop in oParam) {
								if (prop !== "sourcePrototype") {
									return prop + "(" + oParam[prop][0] + ")";
								}
							}
						}else{
							return "";
						}
					};

					this.sContext = patternConvert(this.getOwnerComponent().getComponentData().startupParameters);

				}
			}

			var oPath;

			if (this.sContext) {
				oPath = {
					path: "/" + this.sContext,
					parameters: oParams
				};
				this.getView().bindObject(oPath);
			}

		},*/
		_onButtonPress: function () {
			var self = this;
			var companyName = this.getView().byId("companyName").getValue();

			if (companyName.length !== 0) {
				var xhr = new XMLHttpRequest();
				//xhr.withCredentials = true;
				xhr.addEventListener("readystatechange", function () {
					if (this.status == 200) {
						sap.m.MessageToast.show("Amount Fetched Successfully!");
						self.getView().byId("autoAmount").setValue(this.responseText);
					} 
					else if(this.status == 400) {
						sap.m.MessageToast.show(JSON.parse(this.responseText).error.message);
						self.getView().byId("autoAmount").setValue("Amount- Auto populated");
					}
				});

				//setting request method
				var getUrl = "./getAmount/?companyName="+companyName;
				console.log(getUrl);
				xhr.open("GET", getUrl,true);
				xhr.send();
			} else {
				openErrorDialog('Empty details found!','Please enter all the details!');
			}
		},
		_onButtonPress1: function () {
			this.getView().byId("companyName").setValue("");
			this.getView().byId("autoAmount").setValue("Amount- Auto populated");
		},
		_onButtonPress2: function () {
			var self = this;
			var transferFrom = this.getView().byId("transferFrom").getValue();
			var transferTo = this.getView().byId("transferTo").getValue();
			var amountTransferred = this.getView().byId("amountTransferred").getValue();

			if (transferFrom.length !== 0 && transferTo.length !== 0 && amountTransferred.length !== 0) {
				var data = {
					"fromCompanyName":transferFrom,
					"toCompanyName":transferTo,
					"amount":amountTransferred
				};
				var xhr = new XMLHttpRequest();
				//xhr.withCredentials = true;
				xhr.addEventListener("readystatechange", function () {
					
					if (this.status == 200) {
						sap.m.MessageToast.show("Amount transferred Successfully!");
						self.getView().byId("transferFrom").setValue("");
						self.getView().byId("transferTo").setValue("");
						self.getView().byId("amountTransferred").setValue("");
					} 
					else if(this.status == 400) {
						sap.m.MessageToast.show(JSON.parse(this.responseText).error.message);
						self.getView().byId("transferFrom").setValue("");
						self.getView().byId("transferTo").setValue("");
						self.getView().byId("amountTransferred").setValue("");
					}
				});

				//setting request method
				xhr.open("POST", "./transferAmount");
				xhr.setRequestHeader("Content-Type", "application/json");
				xhr.setRequestHeader("Accept", "application/json; charset=utf-8");
				xhr.send(JSON.stringify(data));
			} else {
				openErrorDialog('Empty details found!','Please enter all the details!');
			}

		},
		_onButtonPress3: function () {
			this.getView().byId("transferFrom").setValue("");
			this.getView().byId("transferTo").setValue("");
			this.getView().byId("amountTransferred").setValue("");
		},
		onInit: function () {
			//this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			//this.oRouter.getTarget("TransferBalance").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			//this.oModel = this.getOwnerComponent().getModel();
		}
	});
});