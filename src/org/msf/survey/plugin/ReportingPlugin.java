package org.msf.survey.plugin;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

import org.apache.cordova.CordovaArgs;
import org.apache.cordova.api.CallbackContext;
import org.apache.cordova.api.CordovaPlugin;
import org.json.JSONException;
import org.json.JSONObject;
import org.msf.survey.CSVDataExport;
import org.msf.survey.Constants;
import org.msf.survey.FileUtilities;

/**
 * @author Nicholas Wilkie
 * 
 * Cordova plugin for reporting capabilities. At this point, only CSV export is implemented. 
 * 
 */

public class ReportingPlugin extends CordovaPlugin {
	public static final String ACTION_EXPORT_REPORT= "exportReport";
	
	@Override
	public boolean execute(String action, CordovaArgs args,
			CallbackContext callbackContext) throws JSONException {
		try {
			if (action.equals(ACTION_EXPORT_REPORT)) {
				this.exportReport(args, callbackContext);
				callbackContext.success();
			}
		} catch (IOException e) {
			e.printStackTrace();
			callbackContext.error(e.getMessage());
		}
		
		return super.execute(action, args, callbackContext);
	}
	
	public void exportReport(CordovaArgs args, CallbackContext callbackContext) throws IOException, JSONException {
		String[] formPaths = cordova.getActivity().getAssets().list(Constants.FORMS_ASSET_DIR_NAME);
		List<JSONObject> jsonForms = new ArrayList<JSONObject>();
		for (String formPath : formPaths) {
			try {
				InputStream is = cordova.getActivity().getAssets().open(new File(Constants.FORMS_ASSET_DIR_NAME, formPath).getPath());
				String jsonFormString = FileUtilities.readStringFromInputStream(is);
				JSONObject jsonFormObject = new JSONObject(jsonFormString);
				jsonForms.add(jsonFormObject);
			} catch (IOException e) {
				e.printStackTrace();
			} catch (JSONException e) {
				e.printStackTrace();
			}
		}
	
		CSVDataExport.generateDefaultReports(jsonForms);
	}
}
