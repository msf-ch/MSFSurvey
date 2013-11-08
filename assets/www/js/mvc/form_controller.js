/* form_controller.js
 * 
 * This file defines services used by the form. They are initialized on the "registerServices"
 * event from FormApp. They run their initialization code on "initServices".
 * 
 */

FormApp.once('registerServices', function() {
	
	
/*
 * FormService provides methods for dealing with the form as a whole, such as registering views
 * and saving form data.
 */
FormService = _.extend({
	views : [],
	
	initialize : function() {
		FormService.listenTo(FormApp, 'backbutton', FormService.backButtonPressed);
	},
	
	viewValueChange : function(sourceView) {
		var conceptId = sourceView.model.get('conceptId');
		var value = sourceView.getValue();
		//console.log('FormService registered viewValueChange: ' + conceptId + ' - Value = ' + value);
		ObsService.setObs(conceptId, value);
	},

	registerViews : function() {
		for (var i = 0; i < PageService.pageModels.length; i++) {
			PageService.pageModels.at(i).pageView.content.registerViews();
		}
	},
	
	registerView : function(view) {
		this.views.push(view);
		this.addListeners(view);
	},
	
	unregisterView : function(view) {
		view.off('viewValueChange');
		
		var index = this.views.indexOf(view);
		this.views.splice(index, 1);
	},
	
	addListeners : function(view) {
		if(view.hasValue) {
			view.on('viewValueChange', FormService.viewValueChange);
		}
		
		var conceptId = view.model.get("conceptId");
		if (conceptId) {
			view.listenTo(obsList, "initialize changeObsValue:" + view.model.get("conceptId"), function() {
				var viewValue = view.getValue();
				var modelValue = ObsService.getObs(view.model.get("conceptId"));
				if (viewValue != modelValue) {
					view.setValue(modelValue);
				}
			});
		}

		var hideIf = view.model.get('hideIf');
		if (hideIf && hideIf.condition) {
			view.listenTo(obsList, "initialize changeObsValue:" + hideIf.conceptIds.join(" changeObsValue:"), function(model, value, options) {
				if(EvaluationService.executeObsCondition(hideIf)) {
					view.hide();
				} else {
					view.show();
				}
			});
		}
		
		var showIf = view.model.get('showIf');
		if (showIf && showIf.condition) {
			view.listenTo(obsList, "initialize changeObsValue:" + showIf.conceptIds.join(" changeObsValue:"), function(model, value, options) {
				if(EvaluationService.executeObsCondition(showIf)) {
					view.show();
				} else {
					view.hide();
				}
			});
		}
		
		var calculatedValueSerialized = view.model.get('calculatedValue');
		if (calculatedValueSerialized && calculatedValueSerialized.functionCode) {
			view.listenTo(obsList, "initialize changeObsValue:" + calculatedValueSerialized.conceptIds.join(" changeObsValue:"), function(model, value, options) {
				console.log('Point 1 reached, value: ' + value);
				var calculatedValue = EvaluationService.executeCalculatedValueFunction(calculatedValueSerialized, view);
				console.log('Point 2 reached, calculated value: ' + calculatedValue);
				if (calculatedValue != undefined) {
					var conceptId = view.model.get('conceptId');
					ObsService.setObs(conceptId, calculatedValue);
				}
			});
		}
	},
	
	submit : function(complete) {
		FormApp.trigger("formSubmit", {"complete":complete});
		
		var encounterToSave = {};
		if (encounter) {
			encounterToSave = encounter;
			encounterToSave.obs = undefined;
		}
		
		//set properties of encounter
		encounterToSave.obs = obsList.toJSON();
		encounterToSave.lastSaved = new Date().getTime();
		encounterToSave.formName = Form.get('name');
		encounterToSave.formNameReadable = Form.get('nameReadable');
		encounterToSave.descriptors = [];
		encounterToSave.pageIndex = PageService.getActivePageIndex();
		
		var descriptors = Form.get('descriptors');
		if (descriptors && descriptors.length > 0) {
			for (var i = 0; i < descriptors.length; i++) {
				var generatedDescriptor = {label : descriptors[i].label, conceptId : descriptors[i].conceptId, value : ObsService.getObs(descriptors[i].conceptId)};
				encounterToSave.descriptors.push(generatedDescriptor);
			}
		}
		
		encounterToSave.complete = complete;
		
		cordova.exec(this.submitSuccessCallback, this.submitFailCallback, "MSF", "submit", [encounterToSave]);
	},
	
	saveIncomplete : function() {
		var popupvars = {headerText : "Confirmation de sauvegarde de formulaire",
		titleText : "Voulez-vous sauvegarder le formulaire et quitter?",
		bodyHTML : "<p>Les formulaires peuvent être modifiés ultérieurement.</p>" +
				"<a href='#' data-role='button' data-inline='true' data-rel='back' data-theme='c'>Annuler</a>" +
				"<a id='saveButton' href='#' data-role='button' data-inline='true' data-theme='e' style='float:right;'>Sauver</a>"};

		var popup = $(_.template($("#tmpl-genericpopup").html(), popupvars, {variable : "data"}));
		popup.find("#saveButton").on("click", function() {
			FormService.submit(false);
		});
		PageService.showPopup(popup);
	},
	
	submitSuccessCallback : function(args) {
		FormApp.trigger("formSubmitComplete");
		document.location.href = "home.html";
	},
	
	submitFailCallback : function(args) {
		//code on failing submit?
	},
	
	ready : function() {
	},
	
	backButtonPressed : function() {
		if (PageService.isFirstPageActive()) {
			var popupvars = {headerText : "Confirmation de sortie de formulaire",
							titleText : "Etes vous sûr de vouloir quitter ce formulaire?",
							bodyHTML : "<p>Toutes les réponses seront effacées.</p>" +
									"<a href='#' data-role='button' data-inline='true' data-rel='back' data-theme='c'>Annuler</a>" +
									"<a id='exitButton' href='#' data-role='button' data-inline='true' data-theme='e' style='float:right;'>Sortie</a>"};
			
			var popup = $(_.template($("#tmpl-genericpopup").html(), popupvars, {variable : "data"}));
			popup.find("#exitButton").on("click", function() {
				document.location.href = "home.html";
			});
			PageService.showPopup(popup);
		} else {
			PageService.prevPage();
		}
	}
}, Backbone.Events);
FormApp.registerService('FormService', FormService);

/*
 * ObsService provides methods to access and change observations.
 */
ObsService = _.extend({
	setObs : function(conceptId, value) {
		console.log('set obs ' + conceptId + ' to ' + value);
		ret = obsList.setValue(conceptId, value);
		return ret;
	},

	getObs : function(conceptId) {
		//console.log('get obs ' + conceptId);
		return obsList.getValue(conceptId);
	},
	
	initializeValues : function() {
		obsList.trigger('initialize');
	}
}, Backbone.Events);
FormApp.registerService('ObsService', ObsService);


/*
 * PageService provides methods to display and navigate through the pages in the form.
 */
PageService = _.extend({
	pageModels : undefined,
	activeIndex : -1,
	
	initialize : function() {
//		PageService.listenTo(FormApp, 'renderPages', PageService.renderPages);
//		PageService.listenTo(FormApp, 'decoratePages', PageService.decoratePages);

		PageService.on('pageshow', PageService.updatePageIndex);
	},
	
	setPageModels : function(pages) {
		if (!this.pageModels) {
			this.pageModels = new Backbone.Collection(pages, {
				model : PageModel
			});
		} else {
			this.pageModels.reset(pages);
		}
	},
	
	renderPages : function() {
		for (var i = 0; i < PageService.pageModels.length; i++) {
			var pageView = PageService.pageModels.at(i).generatePageView();
			PageService.listenTo(pageView, 'all', PageService.pageEventFired);
		}
	},
	
	decoratePages : function() {
		for (var i = 0; i < PageService.pageModels.length; i++) {
			PageService.pageModels.at(i).pageView.decorate();
		}
	},
	
	afterDecoratePages : function() {
		for (var i = 0; i < PageService.pageModels.length; i++) {
			PageService.pageModels.at(i).pageView.afterDecorate();
		}
	},
	
	pageEventFired : function(eventName) {
		var args = [eventName]; //ie ViewService:registered
		args = args.concat(Array.prototype.splice.call(arguments, 1));
		
		PageService.trigger.apply(this, args);
	},
	
	getActivePageIndex : function() {
		return this.activeIndex;
	},
	
	setActivePageIndex : function(pageIndex, options) {
		if (pageIndex >= this.pageModels.length) {
			alert('PageIndex exceeds number of pages!');
			return;
		}

		if (pageIndex < 0) {
			alert('PageIndex cannot be less than 0!');
			return;
		}
		
		var pageModel = this.pageModels.at(pageIndex);
		var pageView = pageModel.pageView;
		
		$.mobile.changePage(pageView.$el, options);
	},
	
	getActivePageModel : function() {
		try {
			return this.pageModels.at(this.getActivePageIndex());
		} catch(err) {
			return undefined;
		}
	},
	
	getActivePageView : function() {
		try {
			return this.pageModels.at(this.getActivePageIndex()).pageView;
		} catch(err) {
			return undefined;
		}
	},
	
	prevPage : function() {
		if (!$.mobile.pageContainer.is(".ui-mobile-viewport-transitioning")) { //make sure it isn't animating
			this.setActivePageIndex(this.activeIndex - 1, {});//, {transition:"slide",reverse:true});
		}
	},
	
	nextPage : function(force) {
		if (!$.mobile.pageContainer.is(".ui-mobile-viewport-transitioning")) {
			var pageView = this.pageModels.at(this.activeIndex).pageView;
			
			if (Form.getGlobalVariable('validation', 'validateOnNextPage') && !force) {
				var errors = ValidationService.validatePage(pageView);
				if (errors && errors.length > 0) {
					return;
				}
			}
			
			this.setActivePageIndex(this.activeIndex + 1);//, {transition:"slide",reverse:false});
		}
	},
	
	//Get the page view from a reference to the page div
	getPageFromElement : function(element) {
		var model;
		for(var i = 0; i < this.pageModels.length; i++) {
			model = this.pageModels.at(i);
			if (model.pageView.el == element) {
				return model.pageView;
			}
		}
	},
	
	//Is the user on the first page of the form (means you cannot press "back")
	isFirstPageActive : function() {
		return this.getActivePageIndex() == 0;
	},
	
	isLastPageActive : function() {
		return this.getActivePageIndex() == pageModels.length - 1;
	},
	
	showPopup : function(element, options) {
		var popup = this.getActivePageView().$el.children("div.ui-popup-container").children("div:jqmData(role='popup')");
		popup.html('').append(element);
		
		popup.trigger('create').popup('open', options);
		return popup;
	},
	
	hidePopup : function() {
		var popup = this.getActivePageView().$el.children("div.ui-popup-container").children("div:jqmData(role='popup')");
		
		popup.popup('close');
		return popup;
	},
	
	getIndexOfPage : function(page) {		
		var pageModel;
		for (var i = 0; i < PageService.pageModels.length; i++) {
			pageModel = PageService.pageModels.at(i);
			if (pageModel && page == pageModel || (pageModel.pageView && (page == pageModel || pageModel.pageView.$el[0] == page[0]))) {
				return i;
			}
		}
		
		return -1;
	},
	
	updatePageIndex : function() {
		PageService.activeIndex = PageService.getIndexOfPage($.mobile.activePage);
	}
	
}, Backbone.Events);
FormApp.registerService('PageService', PageService);



/*
 * EvaluationService provides methods to evaluate conditions, such as show/hide logic.]
 * 
 * Conditions are precompiled as functions on initialization to speed up execution during form entry.
 */

EvaluationService = _.extend({
		compileObsCondition : function(obsEvalSerialized) {
			var func = new Function(obsEvalSerialized.conceptIds, 'return ' + obsEvalSerialized.condition + ';');
			obsEvalSerialized.compiledCondition = func;
			
			return func;
		},
		
		executeObsCondition : function(obsEvalSerialized) {	
			var conceptIdValues = [];
			for (var i = 0; i < obsEvalSerialized.conceptIds.length; i++) {
				conceptIdValues[i] = ObsService.getObs(obsEvalSerialized.conceptIds[i]);
			}
			
			if (!obsEvalSerialized.compiledCondition) {
				//compile
				EvaluationService.compileObsCondition(obsEvalSerialized);
			}
			
			return obsEvalSerialized.compiledCondition.apply(obsEvalSerialized, conceptIdValues);
		},
		
		compileViewCondition : function(viewEvalSerialized, view) {
			var paramNames = ['view', 'value'];
			if (viewEvalSerialized.conceptIds) {
				paramNames = paramNames.concat(viewEvalSerialized.conceptIds);
			}
			
			var func = new Function(paramNames, 'return ' + viewEvalSerialized.condition + ';');
			viewEvalSerialized.compiledCondition = func;
			
			return func;
		},
		
		executeViewCondition : function(viewEvalSerialized, view) {	
			var paramValues = [view, view.getValue()];
			
			if(viewEvalSerialized.conceptIds) {
				for (var i = 0; i < viewEvalSerialized.conceptIds.length; i++) {
					paramValues.push(ObsService.getObs(viewEvalSerialized.conceptIds[i]));
				}
			}
			
			if (!viewEvalSerialized.compiledCondition) {
				//compile
				EvaluationService.compileViewCondition(viewEvalSerialized, view);
			}
			
			return viewEvalSerialized.compiledCondition.apply(viewEvalSerialized, paramValues);
		},
		compileCalculatedValueFunction : function(calculatedValueFunction) {
			var paramNames = ['_view', '_value'];
			if (calculatedValueFunction.conceptIds) {
				paramNames = paramNames.concat(calculatedValueFunction.conceptIds);
			}
			
			var func = new Function(paramNames, calculatedValueFunction.functionCode);
			calculatedValueFunction.compiledFunction = func;
			
			return func;
		},
		executeCalculatedValueFunction : function(calculatedValueFunction, view) {	
			var conceptIdValues = [view, view.getValue()];
			for (var i = 0; i < calculatedValueFunction.conceptIds.length; i++) {
				conceptIdValues.push(ObsService.getObs(calculatedValueFunction.conceptIds[i]));
			}
			
			if (!calculatedValueFunction.compiledFunction) {
				//compile
				EvaluationService.compileCalculatedValueFunction(calculatedValueFunction);
			}
			
			return calculatedValueFunction.compiledFunction.apply(calculatedValueFunction, conceptIdValues);
		},
}, Backbone.Events);
FormApp.registerService('EvaluationService', EvaluationService);

/* 
 * ViewService stores view classes for use during rendering.
 */

ViewService = _.extend({
	viewClasses : new (Backbone.Collection.extend({
		model : Backbone.Model.extend({
			idAttribute: "viewClassName",
			defaults : {
				"viewClassName" : undefined,
				"constructor" : undefined, //this is the View object with which one makes individual views
				"validators" : []
			},
			initialize : function() {
				
			}
		})
	})),
	
	registerViewClass : function(viewClassName, viewConstructor, validators) {
		var processedViewConstructor = viewConstructor.extend({"className" : viewClassName});
		ViewService.viewClasses.add({"viewClassName" : viewClassName, "viewConstructor" : processedViewConstructor, "validators" : validators});
	},
	
	getViewClass : function(viewClassName) {
		return ViewService.viewClasses.get(viewClassName);
	}
}, Backbone.Events);
FormApp.registerService('ViewService', ViewService);

/*
 * ValidationService is used to perform validation on the form, such as when there is a required value
 * or a particular pattern that must be matched for a question.
 */

ValidationService = _.extend({
	validatePage : function(pageView) {
		var viewsWithErrors =[];
		var formViews = pageView.$el.find(".formview:not(.viewhidden, .viewhidden *)"); //don't include any hidden views!
		
		var view;
		var viewErrors;
		for (var i = 0; i < formViews.length; i++) {
			view = $(formViews[i]).itemView();
			viewErrors = ValidationService.validateView(view);
			if (viewErrors && viewErrors.length > 0) {
				viewsWithErrors.push({'view' : view, errors : viewErrors});
			}
		}
		
		if (viewsWithErrors.length > 0) {
			pageView.content.$el.find('.errorheader').remove();
			pageView.content.$el.prepend(_.template($("#tmpl-errorheader").html(), {'errors' : viewsWithErrors}));
			$.mobile.silentScroll(0);
		} else {
			pageView.content.$el.find('.errorheader').remove();
		}
		
		return viewsWithErrors;
	},

	validateView : function(view) {
		var validationErrors = [];
		
		var validators = ViewService.getViewClass(view.className).get('validators');
		for(var i = 0; i < validators.length; i++) {
			try {
				validationErrors = validationErrors.concat(validators[i](view));
			} catch(err) {
				if (view.model != undefined) {
					console.error("Error executing validator on view " + view.model.get('conceptId') + ":" + JSON.stringify(err));
				}
			}
		}
		
		view.error(validationErrors.length > 0, validationErrors);
		
		return validationErrors;
	},
	
	_standardBounds : function(view) {
		var errors = [];
		
		var bounds = view.model.get('bounds');
		var value = view.getValue();
		if (bounds && value !== undefined && value !== '') {
			var stringValue = value.toString();
			
			 if (bounds.maxValue != undefined && value > bounds.maxValue) {
				 errors.push("La VALEUR ne doit pas dépasse " + bounds.maxValue); //Answer VALUE must be less than or equal to 
			 }
			 if (bounds.minValue != undefined && value < bounds.minValue) {
				 errors.push("La VALEUR doit être d'au moins " + bounds.minValue); //Answer VALUE must be more than or equal to
			 }

			 if (bounds.maxLength != undefined && stringValue.length > bounds.maxLength) {
				 errors.push("La LONGUEUR de la réponse ne doit pas dépasser " + bounds.maxLength + " caractères."); //Answer LENGTH must be less than or equal to x characters
			 }
			 if (bounds.minLength != undefined && stringValue.length < bounds.minLength) {
				 errors.push("La LONGUEUR de la réponse doit être d'au moins " + bounds.minLength + " caractères."); //Answer LENGTH must be more than or equal to x characters
			 }

			 if (bounds.exactLength != undefined && stringValue.length != bounds.exactLength) {
				 errors.push("La LONGUEUR de la réponse doit être exactement " + bounds.exactLength + " characters."); //Answer LENGTH must be exactly x characters.
			 }
			 
			 if (bounds.precisionExact != undefined) {
				 if (isNaN(parseFloat(stringValue)) || !isFinite(stringValue)) {
					 errors.push("La réponse doit être un nombre");
				 } else if (bounds.precisionExact == 0 && Math.floor(value) != value) {
					 //Nothing past the decimal place
					 errors.push("La réponse doit être un nombre entier");
				 } else if (bounds.precisionExact > 0 && ((stringValue.indexOf(".") != stringValue.length - bounds.precisionExact - 1) || (stringValue.indexOf(".") < 0))) {
					 errors.push("La valeur doit avoir avoir " + bounds.precisionExact + " chiffres après la virgule.");
				 }
			 }
		}
		
		return errors;
	}, 
	
	_standardRequired : function(view) {
		var value = view.getValue();
		var errors = [];
		
		if (view.model.get('required') && view.hasValue && !view.model.get('hiddenMode') && (value === undefined || value === '')) {
			errors.push("La réponse à cette question est obligatoire."); //This field is required, please enter a value.
		}
		return errors;
	},
	
	_standardValidators : function(view) {
		var errors = [];
		
		var validators = view.model.get('validators');
		if (validators) {
			for (var i = 0; i < validators.length; i++) {
				if (!EvaluationService.executeViewCondition(validators[i], view)) {
					errors.push(validators[i].errorMessage);
				}
			}
		}
		return errors;
	},
	
	_checkboxgroupRequired : function(view) {
		var errors = [];
		
		if (view.model.get('checkboxgroupBounds')) {
			var checkboxgroupBounds = view.model.get('checkboxgroupBounds');
			var checkBoxes = view.$el.find("input");
			var checked = checkBoxes.filter(":checked");
			var unchecked = checkBoxes.not(":checked");
			
			if (checkboxgroupBounds.minSelections && checked.length < checkboxgroupBounds.minSelections) {
				errors.push("S'il vous plaît assurez un minimum de " + checkboxgroupBounds.minSelections + " sélections.");
			}
			
			if (checkboxgroupBounds.maxSelections && checked.length > checkboxgroupBounds.maxSelections) {
				errors.push("S'il vous plaît assurez un maximum de " + checkboxgroupBounds.maxSelections + " sélections.");
			}
		}
		
		
		return errors;
	},
	
	_rankingRequired : function(view) {
		var errors = [];

		if (view.model.get('rankingBounds')) {
			var rankingBounds = view.model.get('rankingBounds');
			var childrenModels = view.model.childrenModels;
			var numberOfValuesSet = 0;
			
			for (var i = 0; i < childrenModels.length; i++) {
				if (ObsService.getObs(childrenModels.at(i).get('conceptId'))) {
					numberOfValuesSet++;
				}
			}
			
			if (rankingBounds.minSelections && numberOfValuesSet < rankingBounds.minSelections) {
				errors.push("S'il vous plaît rang d'un minimum de " + rankingBounds.minSelections + " sélections.");
			}
			
			if (rankingBounds.maxSelections && numberOfValuesSet > rankingBounds.maxSelections) {
				errors.push("S'il vous plaît rang d'un maximum de " + rankingBounds.maxSelections + " sélections.");
			}
		}
		
		return errors;
	}
}, Backbone.Events);
FormApp.registerService('ValidationService', ValidationService);


/*
 * UiService is a general class for UI events, but is currently only used to fix the position of the
 * footer on every page.
 */

UiService = _.extend({
	initialize : function() {
		$(window).on('resize', UiService.positionFooters);
		this.listenToOnce(FormApp, 'decoratePagesComplete', UiService.positionFooters);
	},
	
	positionFooters : function() {
		var page;
		for (var i = 0; i < PageService.pageModels.length; i++) {
			page = PageService.pageModels.at(i).pageView;
			
			//so height can be ascertained
			page.$el.css({position:"absolute",visibility:"hidden",display:"block"});
			
			if (!page) {
				return;
			}
			
			var content = page.content.$el;
			
			var headerHeight = page.header.$el.outerHeight(true);
			var contentHeight = content.outerHeight();
			var footerHeight = page.footer.$el.outerHeight(true);

			var pageHeight = headerHeight + contentHeight + footerHeight;

			var contentMargin = content.outerHeight() - content.height();
			var targetContentHeight = window.innerHeight - headerHeight
					- footerHeight - contentMargin;
			
			content.css("min-height", targetContentHeight + "px");
			if (!content.parent().is(":jqmData(role='page')")) {
				content.parent().css("min-height", targetContentHeight + "px");
			}
			
			page.$el.css({position:"", visibility:"", display:""});
		}
	}
}, Backbone.Events);
FormApp.registerService('UiService', UiService);

});