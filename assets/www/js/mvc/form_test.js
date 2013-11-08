$(function() {
	if(sessionStorage["testIterationsRemaining"] > 1) {
		sessionStorage["testIterationsRemaining"]--;
		
		FormService.submitSuccessCallback = function() {
			sessionStorage.formFilePath = formFilePath;
			location.reload(true);
		}
	} else {
		sessionStorage["testIterationsRemaining"] = 0;
	}

	var count = 1;
	var setValueToFormView = function(formView) {
		if(formView == undefined) {
			return;
		}
		var viewType = formView.className;
		if (viewType == "text") {
			formView.setValue("text-" + ++count);
			formView.defaultValueChanged();
		} else if (viewType == "number") {
			formView.setValue(++count);
			formView.defaultValueChanged();
		} else if (viewType == "radio") {
			var options = formView.model.get('options');
			var idx = Math.floor(Math.random() * options.length);
			formView.setValue(options[idx].value);
			formView.defaultValueChanged();
		} else if (viewType == "select") {
			var options = formView.model.get('options');
			var idx = Math.floor(Math.random() * options.length);
			formView.setValue(options[idx].value);
			formView.defaultValueChanged();
		} else if (viewType == "checkboxgroup") {
			
		} else if (viewType == "checkbox") {
			if (Math.floor(Math.random() * 3) > 1) {
				formView.setValue(true);
			}
			formView.defaultValueChanged();
		} else if (viewType == "date") {
			formView.$el.find("input").mobiscroll('setDate', new Date(), true);
			formView.defaultValueChanged();
		} else if (viewType == "submitpage") {
		}
	}
	
	var fillPage = function($page) {
		var formViews = $page.find("[formView]").each(function() {
			var $this = $(this);
			if ($this.is(":visible")) {
				setValueToFormView($this.itemView());
			}
		}).promise().done(function() {
			if (PageService.pageModels.length > PageService.getActivePageIndex() + 1) {
				PageService.nextPage();
			} else {
				FormService.submit(true);
			}
		});
	}
	
	PageService.on('pageshow', function(args) {
		Form.setGlobalVariable("validation", "validateOnNextPage", false);
		fillPage(args[0].$el);
	});
});
