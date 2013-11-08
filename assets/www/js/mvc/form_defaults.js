/*
 * form_defaults.js
 * 
 * This file defines the default view classes used by the form software. More can be added
 * in this or a separate file by binding to the "initViewClasses" function and calling
 * ViewService.registerViewClass()
 */

FormApp.once("initViewClasses", function() {
	ViewService.registerViewClass("text", TextView, [ValidationService._standardBounds, ValidationService._standardRequired, ValidationService._standardValidators]);
	ViewService.registerViewClass("number", NumberView, [ValidationService._standardBounds, ValidationService._standardRequired, ValidationService._standardValidators]);
	ViewService.registerViewClass("radio", RadioView, [ValidationService._standardBounds, ValidationService._standardRequired, ValidationService._standardValidators]);
	ViewService.registerViewClass("select", SelectView, [ValidationService._standardBounds, ValidationService._standardRequired, ValidationService._standardValidators]);
	ViewService.registerViewClass("checkboxgroup", CheckGroupView, [ValidationService._checkboxgroupRequired]);
	ViewService.registerViewClass("checkbox", CheckView, [ValidationService._standardRequired, ValidationService._standardValidators]);
	ViewService.registerViewClass("date", DateView, [ValidationService._standardBounds, ValidationService._standardRequired, ValidationService._standardValidators]);
	ViewService.registerViewClass("ranking", RankingView, [ValidationService._rankingRequired]);
	ViewService.registerViewClass("rankingitem", RankingItemView, []);
	ViewService.registerViewClass("submitpage", SubmitPageView, []);
	ViewService.registerViewClass("gps", GPSAcquireView, []);
	ViewService.registerViewClass("html", HTMLView, []);
	ViewService.registerViewClass("photo", PhotoView, []);
	ViewService.registerViewClass("selectjsonform", SelectJsonFormView, []);
	
	FormApp.trigger("defaultViewClassesRegistered");
});