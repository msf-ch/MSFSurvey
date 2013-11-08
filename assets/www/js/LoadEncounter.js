EncounterFile = Backbone.Model.extend({
	defaults : {
		encounter : undefined,
		file : undefined
	}
});

EncounterModel = Backbone.Model.extend({
	defaults : {
		obs : [],
		lastSaved : 0,
		firstSaved : 0,
		formName : "",
		formNameReadable : "",
		formPath : "",
		complete : false
	}
});

EncounterCollection = Backbone.Collection.extend({
	model : EncounterModel,
	
	comparator : function(encounter1, encounter2) {
		var complete1 = encounter1.get('complete');
		var complete2 = encounter2.get('complete');
		
		//Put incomplete encounters at the top of the list
		if (complete1 && !complete2) {
			return 1;
		} else if (!complete1 && complete2) {
			return -1;
		}
		
		//sort with most recently saved encounters at the top of the list
		var lastSaved1 = encounter1.get('lastSaved');
		var lastSaved2 = encounter2.get('lastSaved');
		if (lastSaved1 > lastSaved2) {
			return -1;
		} else if (lastSaved1 < lastSaved2) {
			return 1;
		}
		
		return 0;
	}
});

EncounterList = Backbone.View.extend({
	el : '#encounterList',
	
	initialize : function() {
	},
	
	render : function(encounters) {
		this.$el.html(_.template($("#tmpl-encounterList").html(), {encounterFiles : encounters}));
		this.$el.trigger('create');
	}
});

FormSelect = Backbone.View.extend({
	el : "#formSelectContainer",
	
	events : {
		'change' : 'change'
	},
	
	initialize : function() {
		var that = this;
		var success = function(forms) {
			that.forms = forms;
			that.render();
			that.change();
		};
		var fail = function(message) {
			alert(message);
		};
		
		cordova.exec(success, fail, "MSF", "getForms", []);
	},
	
	render : function() {
		this.$el.html(_.template($("#tmpl-formSelect").html(), {forms : this.forms}));
		this.$el.trigger('create');
	},
	
	change : function() {
		cordova.exec(function(encounters) {
			encounterList.render(new EncounterCollection(encounters));
		}, function(message) {alert('ERROR: ' + message)}, "MSF", "getEncounters", [{formName : this.$el.find(":checked").attr('value')}]);
	}
});

$(document).on('deviceready', function() {
	$(document).on("backbutton", function() {
		document.location.href = "home.html";
	});
	$(window).on("beforeunload", function() {
		$(document).off("backbutton");
		$(window).off("beforeunload");
	});
	$(document).ready(function() {
		encounterList = new EncounterList();
		formSelect = new FormSelect();
	});
});