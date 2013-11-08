/*form_model.js
 * 
 * This file defines the structure of a form JSON object. It also provides methods to access global
 * variables defined in the "global" object.
 * 
 * Example form:
 * 
 * {
 * 		name : "my_form",				//name should be all lowercase, no spaces
 * 		nameReadbable : "My form!!",	//format however you'd like
 * 		description : "This form is to demonstrate forms.",
 * 		descriptors : [	
 * 										//descriptors are searchable concept values that
 * 										//are displayed when re-loading encounters to identify
 * 										//patients. The form should contain any conceptIds used
 * 										//as a descriptor.
 * 			{
 * 				"label":"Village name",
 * 				"conceptId":"village_name"
 * 			},
 * 			{
 * 				"label":"Metronidazole administered",
 * 				"conceptId":"metro_dose"
 * 			}
 * 		],
 * 		global : {						//not really using global yet
 * 		},
 * 		pages : [
 * 			//multiple page objects go here
 * 		]
 * }
 */

FormModel = Backbone.Model.extend({
	defaults : {
		name : undefined,
		nameReadable : undefined,
		description : undefined,
		descriptors : [],
		global : {validation: {validateOnNextPage: true}, debug : {debugMode : false}},
		pages : []
	},
	
	initialize : function() {
		this.defaultGlobal();
	},
	
	defaultGlobal : function() {
		var currentGlobal = this.get('global');
		var newGlobal = $.extend(true, {}, this.defaults.global, this.currentGlobal);
		this.set('global', newGlobal);
		
//		for (var prop in this.defaults.global) {
//			if(!currentGlobal[prop]) {
//				currentGlobal[prop] = {};
//			}
//			_.defaults(currentGlobal[prop], this.defaults.global[prop]);
//		}
	},
	
	getGlobalVariable : function(category, variable) {
		var global = this.get('global');
		if(!global[category]) {
			return undefined;
		} else {
			var category = global[category];
			return category[variable];
		}
	},
	
	setGlobalVariable : function(category, variable, value) {
		var global = this.get('global');
		if(!global[category]) {
			global[category] = {}
		}
		var category = global[category];
		category[variable] = value;
		
		this.trigger("changeglobal", category, variable, value);
		this.trigger("changeglobal:" + category, variable, value);
		this.trigger("changeglobal:" + category + ":" + variable, value);
	}
});

Encounter = Backbone.Model.extend({
	defaults : {
		obs : [],
		lastSaved : undefined,
		formName : "",
		formNameReadable : "",
		descriptors : [],
		completed : true,
		lastPage : undefined
	}
});