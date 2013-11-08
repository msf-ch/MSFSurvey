/* obs.js
 * 
 * This file simply defines the Obs object that is used to store data points in the form. The ObsList
 * triggers events "changeObsValue:*conceptId*" that can be used to listen for changes in a particular
 * conceptId.
 * 
 */

var Obs = Backbone.Model.extend({
	defaults : {
		conceptId : "",
		value : undefined
	},
	
	initialize : function(initValues, classParams) {
	},
	
	getValue : function() {
//		console.log("GET VALUE of element '" + conceptId + " -----  to value'" + value + "' backbonemodel.extend");
		return this.get("value");
	},
	
	setValue : function(value) {
		this.set("value", value);
//		console.log("Value of element '" + conceptId + " -----  to value'" + value + "' backbonemodel.extend");
	},
	
	setValueSilent : function(value) {
		this.set("value", value, {silent : true});
//		console.log(" --- setValueSilent --- Value of element '" + conceptId + " -----  to value'" + value + "' backbonemodel.extend");
	}
});


var ObsList = Backbone.Collection.extend({
	model : Obs,
	
	initialize : function() {
		//trigger event specific to the conceptId. (model, value, options)
		this.on("change:value",
				function(model, value, options) {/*console.log("change:value triggered for " + model.get('conceptId'));*/ this.trigger('changeObsValue:' + model.get('conceptId'), model, value, options)},
				this);
		this.on("add",
				function(model, options) {this.trigger('changeObsValue:' + model.get('conceptId'), model, model.get('value'), options)},
				this);
		this.on("remove",
				function(model, options) {this.trigger('changeObsValue:' + model.get('conceptId'), model, undefined, options)},
				this);
	},
    
	findObsFromConceptId : function(conceptIdToFind) {
		var results = this.where({conceptId : conceptIdToFind});
		if (results.length == 0) {
			return undefined;
		} else {
			return results[0];
		}
	},
	
	getValue : function(conceptId) {
		var ob = this.findObsFromConceptId(conceptId);
		if(ob) {
			return ob.get('value');
		} else {
			return undefined;
		}
	},
	
	setValue : function(conceptId, value) {
		var ob = this.findObsFromConceptId(conceptId);
		if (ob) {
			ob.set('value', value);
			//console.log("LIST:::::::   Set conceptid '" + conceptId + "to value'" + value + "' DUY DUY");
		} else {
			this.add({conceptId : conceptId, value : value});
		}
	},
});

var obsList = new ObsList;	
