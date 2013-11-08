/* page.js
 * 
 * This file defines the components of a page.
 * 
 *  Important classes: PageModel and PageView
 */

FormApp.once('initPageClasses', function() {

	
/**
 * PageModel represents the data model of page elements in a form. It consists of a header,
 * content, and footer. HeaderModel, ContentModel, and FooterModel are used to describe the components
 * respectively.
 */
PageModel = Backbone.Model.extend({
	defaults : {
		theme : "c",
		header : {},
		content : {},
		footer : {}
	},
	
	initialize : function(initValues, classParams) {
		this.set('header', new HeaderModel(initValues.header));
		this.set('content', new ContentModel(initValues.content));
		this.set('footer', new FooterModel(initValues.footer));
	},
	
	generatePageView : function() {
		var element = $("<div></div>").appendTo($("body"));
		this.pageView = new PageView({model : this, el : element});
		
		return this.pageView;
	}
});

HeaderModel = Backbone.Model.extend({
	defaults : {
		theme : "b"
	}
});

ContentModel = Backbone.Model.extend({
	defaults : {
		theme : "c"
	},
	
	initialize : function(initValues, classParams) {
	}
});

FooterModel = Backbone.Model.extend({
	defaults : {
		theme : "c",
		
		footerIconPosition : "top",
		
		footerButton1Text : "Précédent",
		footerButton1Theme : "a",
		footerButton1Icon : "arrow-l",
		footerButton1Action : "prev",
		footerButton1Disabled : false,
		

		footerButton2Text : "Sauver",
		footerButton2Theme : "a",
		footerButton2Icon : "info",
		footerButton2Action : "save",
		footerButton2Disabled : false,
		

		footerButton3Text : "Suivant",
		footerButton3Theme : "a",
		footerButton3Icon : "arrow-r",
		footerButton3Action : "next",
		footerButton3Disabled : false
	}
});

/**
 * PageView is in charge of rendering and event managenet for the page. JQuery Mobile decoration is performed
 * during the "decorate" event, so JQM-dependent events cannot be called on the page until this has finished.
 * 
 * Functionality for each component of a page is delegated to Header, Content, and Footer classes.
 */
PageView = Backbone.View.extend({
	events: {
		"pageshow" : "onShow",
		"pagebeforeshow" : "beforeShow",
		"pagehide" : "onHide",
		"pagebeforehide" : "beforeHide"
	},
	
	tagName: "div",
	
	initialize : function() {
		console.log("PageView initializing");
		this.model = this.options.model;
		
		this.template = $("#tmpl-page").html();

		this.render();
	},
	
	render : function() {
		console.log('page rendering');
		
		this.$el.data('form-page-view', this);
		
		this.$el.html(_.template(this.template, {}, {variable : "data"}));
		this.$el.attr('data-role', 'page').attr('data-theme', this.model.get('theme')).attr('formpage', 'true');
		
		//this.header = new Header({el : this.$el.children(":jqmData(role='header')"), page : this, model : this.model.get('header')});
		this.header = new Header({el : this.$el.children("[pageheader]"), page : this, model : this.model.get('header')});
		this.content = new Content({el : this.$el.children(":jqmData(role='content')"), page : this, model : this.model.get('content')});
		this.footer = new Footer({el : this.$el.children(":jqmData(role='footer')"), page : this, model : this.model.get('footer')});
		
		this.header.render();
		this.content.render();
		this.footer.render();
	},
	
	decorate : function() {
		this.$el.page();
		this.trigger('pageDecorated', this);
	},
	
	afterDecorate : function() {
		var formItems = this.$el.find(":form-item");
		var itemView;
		for (var i = 0; i < formItems.length; i++) {
			itemView = $(formItems[i]).data("form-item-view");
			if (itemView && itemView.afterDecorate) {
				itemView.afterDecorate();
			}
		}
		
		this.trigger('pageAfterDecorated', this);
	},
	
	beforeShow : function() {
		this.footer.refresh();
//		$.mobile.silentScroll(0);
		
		this.trigger('pagebeforeshow', this);
	},
	
	onShow : function() {
		$.mobile.silentScroll(0);
		
		this.trigger('pageshow', this);
	},
	
	beforehide : function() {
		this.trigger('pagebeforehide', this);
	},
	
	onHide : function() {
		this.trigger('pagehide', this);
	}
});

var Header = Backbone.View.extend({
	events : {
		"taphold" : "onTapHold"
	},
	
	initialize : function() {
		console.log("Header initializing");
		this.model = this.options.model;
	},
	
	render : function() {
		this.$el.addClass('ui-bar ui-bar-' + this.model.get('theme'));
		this.$el.html(_.template($("#tmpl-header").html(), this.model.toJSON(), {variable : "data"}));
	},
	
	onTapHold : function() {
//		this.$el.siblings(":jqmData(role='panel')").panel('open');
	}
});

Content = Backbone.View.extend({
	initialize : function() {
		console.log("Content initializing");
		this.model = this.options.model;
		this.page = this.options.page;
	},
	
	render : function() {
		this.$el.attr('data-theme', this.model.get('theme'));
		this.$el.css("min-height", "0px");
		this.renderModels(this.$el, this.model.get('views'));
	},
	
	renderModels : function(parentElement, modelList) {
		for (var i = 0; i < modelList.length; i++) {
			new FormItemViewModel(modelList[i]).generateView($("<div></div>").appendTo(parentElement), {page : this.page});
		}
	},
	
	registerViews : function() {
		var content = this;
		this.$el.find(":form-item").each(function(index, element) {
			var formView = $(element).itemView();
			if (formView) {
				formView.page = content.page;
				FormService.registerView(formView);
			}
		});
		this.page.trigger('viewsRegistered');
	}
});

Footer = Backbone.View.extend({
	initialize : function() {
		console.log("Footer initializing");
		this.model = this.options.model;
		
		this.render();
	},
	
	events: {
		"click" : "render",
		"click a[action='prev']" : "prev",
		"click a[action='save']" : "save",
		"click a[action='next']" : "next",
		"click a[action='submit']" : "submit"
	},
	
	render : function() {
		this.$el.attr('data-theme', this.model.get('theme'));
		
		this.$el.html(_.template($("#tmpl-footer").html(), this.model.toJSON(), {variable : "data"}));
		this.$el.children().navbar();
		
		if (this.model.get('footerButton1Disabled')) {
			this.disableButton($(this.$el.find("li > a")[0]));
		}
		
		if (this.model.get('footerButton2Disabled')) {
			this.disableButton($(this.$el.find("li > a")[1]));
		}
		
		if (this.model.get('footerButton3Disabled')) {
			this.disableButton($(this.$el.find("li > a")[2]));
		}
		
		this.refresh();
	},
	
	refresh : function() {
		//Disable prev if first page
		if (PageService.getIndexOfPage(this.$el.parents(":form-page")) == 0) {
			this.disableButton($(this.$el.find("li > a[action='prev']")));
		}
	},
	
	disableButton : function(button) {
		button.addClass('ui-disabled');
	},
	
	enableButton : function(button) {
		button.removeClass('ui-disabled');
	},
	
	isEnabled : function() {
		return !this.$el.is(".ui-disabled");
	},
	
	prev : function(e) {
		console.log('prev button pressed');
		if(this.isEnabled()) {
			PageService.prevPage();
		}
	},
	
	save : function(e) {
		console.log('save button pressed');
		if(this.isEnabled()) {
			FormService.saveIncomplete();
		}
	},
	
	next : function(e) {
		console.log('next button pressed');
		if(this.isEnabled()) {
			PageService.nextPage();
		}
	},
	
	submit : function(e) {
		console.log('submit button pressed');
		if(this.isEnabled()) {
			FormService.submit(true);
		}
	}
});
});
