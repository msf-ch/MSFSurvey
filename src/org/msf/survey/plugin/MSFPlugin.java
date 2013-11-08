/**
 * 
 */
package org.msf.survey.plugin;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileFilter;
import java.io.FileNotFoundException;
import java.io.FilenameFilter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.Date;
import java.util.Iterator;

import org.apache.cordova.api.CallbackContext;
import org.apache.cordova.api.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.msf.survey.Constants;
import org.msf.survey.FileUtilities;

import android.content.res.AssetManager;
import android.os.Environment;
import android.util.Log;

/**
 * @author Nicholas Wilkie
 * 
 * Cordova plugin to allow for functions that require interaction with Android outside of browser. Cordova calls execute()
 * with an action string, and this determines what method is executed.
 * 
 */
public class MSFPlugin extends CordovaPlugin {
	
	public static final String SUBMIT_ACTION = "submit";
	public static final String GET_ENCOUNTER_ACTION = "getEncounter";
	public static final String PAGE_FORWARD_ACTION = "forward";
	public static final String PAGE_BACKWARD_ACTION = "backward";
	public static final String GET_ENCOUNTERS = "getEncounters";
	public static final String GET_ENCOUNTER = "getEncounter";
	public static final String GET_FORMS = "getForms";
	public static final String GET_FORM = "getForm";
	public static final String ERASE_ENCOUNTERS = "eraseEncounters";
	public static final String ERASE_REPORTS = "eraseReports";

	/*
	 * (non-Javadoc)
	 * 
	 * @see org.apache.cordova.api.CordovaPlugin#execute(java.lang.String,
	 * org.json.JSONArray, org.apache.cordova.api.CallbackContext)
	 */
	@Override
	public boolean execute(String action, JSONArray args,
			CallbackContext callbackContext) throws JSONException {

		try {
			if (action.equalsIgnoreCase(SUBMIT_ACTION)) {
				saveEncounter(args, callbackContext);
			} else if (action.equalsIgnoreCase(GET_ENCOUNTER_ACTION)) {
				getEncounter(args, callbackContext);
			} else if (action.equalsIgnoreCase(GET_ENCOUNTERS)) {
				getEncounters(args, callbackContext);
			} else if (action.equalsIgnoreCase(GET_ENCOUNTERS)) {
				getEncounter(args, callbackContext);
			} else if (action.equalsIgnoreCase(GET_FORMS)) {
				getForms(args, callbackContext);
			} else if (action.equalsIgnoreCase(GET_FORM)) {
				getForm(args, callbackContext);
			} else if (action.equalsIgnoreCase(ERASE_ENCOUNTERS)) {
				eraseEncounters(args, callbackContext);
			} else if (action.equalsIgnoreCase(ERASE_REPORTS)) {
				eraseReports(args, callbackContext);
			}
		} catch (Exception e) {
			e.printStackTrace();
			callbackContext.error("Error in MSF Plugin: " + e.getMessage());
		}

		return super.execute(action, args, callbackContext);
	}

	public void getForms(JSONArray args, CallbackContext callbackContext)
			throws IOException {
		boolean includePages = false;

		try {
			if (args.length() > 0 && args.get(0) instanceof JSONObject) {
				JSONObject params = args.getJSONObject(0);
				includePages = params.has("includePages")
						&& params.get("includePages") instanceof Boolean
						&& params.getBoolean("includePages");
			}
		} catch (JSONException e1) {
		}

		JSONArray result = new JSONArray();

		AssetManager assets = cordova.getActivity().getAssets();
		String[] names = assets.list(Constants.FORMS_ASSET_DIR_NAME);

		for (String name : names) {
			// Read each file
			// Convert to JSON
			if (name.endsWith(".json")) {
				try {
					String jsonString = readStringFromAsset(new File(
							Constants.FORMS_ASSET_DIR_NAME, name).getPath());
					JSONObject jsonObject = new JSONObject(jsonString);
					if (!includePages) {
						jsonObject.remove("pages");
					}
					result.put(jsonObject);
				} catch (Exception e) {
					continue;
				}
			}
		}

		callbackContext.success(result);
	}

	public void getForm(JSONArray args, CallbackContext callbackContext)
			throws IOException, JSONException {
		JSONArray forms = getForms(args.getJSONObject(0), true);

		if (forms.length() == 1) {
			callbackContext.success(forms.getJSONObject(0));
		} else if (forms.length() == 0) {
			Log.d("MSFPlugin", "Form not found for args: " + args.toString());
			callbackContext.error("Form could not be found!");
		} else {
			Log.d("MSFPlugin",
					"Multiple forms found for args: " + args.toString());
			callbackContext.error("Multiple forms found");
		}
	}

	public JSONArray getForms(JSONObject paramsToMatch, boolean includePages)
			throws IOException, JSONException {
		JSONArray results = new JSONArray();

		AssetManager assets = cordova.getActivity().getAssets();
		String[] names = assets.list(Constants.FORMS_ASSET_DIR_NAME);
		boolean matched;

		for (String name : names) {
			// Read each file
			// Convert to JSON
			try {
				String jsonString = readStringFromAsset(new File(
						Constants.FORMS_ASSET_DIR_NAME, name).getPath());
				JSONObject jsonObject = new JSONObject(jsonString);
				if (paramsToMatch != null) {
					Iterator it = paramsToMatch.keys();
					String key;
					matched = false;
					while (it.hasNext()) {
						key = (String) it.next();
						if (jsonObject.has(key)
								&& paramsToMatch.get(key).equals(
										jsonObject.get(key))) {
							matched = true;
							break;
						}
					}
					if (!matched) {
						continue;
					}
				}
				if (!includePages) {
					jsonObject.remove("pages");
				}
				results.put(jsonObject);
			} catch (Exception e) {
				continue;
			}
		}

		return new JSONArray().put(results);
	}

	public String readStringFromAsset(String assetPath) throws IOException,
			JSONException {
		InputStream is = cordova.getActivity().getAssets().open(assetPath);
		String jsonString = FileUtilities.readStringFromInputStream(is);

		return jsonString;
	}

	public void getEncounters(JSONArray args, CallbackContext callbackContext)
			throws JSONException {
		String formName = null;
		if (args.length() > 0 && args.get(0) instanceof JSONObject) {
			JSONObject params = args.getJSONObject(0);
			if (params.has("formName")) {
				formName = params.getString("formName");
			}
		}

		
		File[] files = Constants.ENCOUNTER_DIR.listFiles();

		JSONArray result = new JSONArray();
		JSONObject o;
		for (File f : files) {
			try {
				o = FileUtilities.readJSONObjectFromFile(f);
				o.remove("obs");

				if (formName != null
						&& !o.getString("formName").equals(formName)) {
					continue;
				}
				result.put(o.accumulate("fileName", f.getName()));
			} catch (Exception e) {
				e.printStackTrace();
			}
		}

		callbackContext.success(result);
		return;
	}

	/*
	 * cordova.exec(callback(success){}, callback(fail){}, "MSF", "submit",
	 * [_encounter])
	 */
	public void saveEncounter(JSONArray args, CallbackContext callbackContext)
			throws JSONException {
		JSONObject encounter = args.getJSONObject(0);

		try {
			String fileName;
			if (!encounter.isNull("fileName")
					&& encounter.get("fileName") instanceof String
					&& encounter.getString("fileName").length() > 0) {
				fileName = encounter.getString("fileName");
				encounter.remove("fileName"); // put this in programmatically
			} else {
				fileName = FileUtilities.getSaveFileDatedName("encounter", encounter.getString("formName"), "enc");
			}
			File outputFile = new File(Constants.ENCOUNTER_DIR, fileName);

			outputFile.delete();
			outputFile.createNewFile();

			FileUtilities.writeJSONObjectToFile(outputFile, encounter);
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}

		callbackContext.success();
	}

	public void getEncounter(JSONArray args, CallbackContext callbackContext)
			throws JSONException {
		final String fileName = args.getString(0);

		File[] files = Constants.ENCOUNTER_DIR.listFiles(new FileFilter() {
			@Override
			public boolean accept(File pathname) {
				return pathname.getName().equals(fileName)
						|| pathname.getName().equals(fileName + ".enc");
			}
		});

		if (files.length == 0) {
			callbackContext.error("No such file");
			return;
		}

		try {
			JSONObject obsObject = FileUtilities.readJSONObjectFromFile(files[0]);
			obsObject.put("fileName", files[0].getName());
			callbackContext.success(obsObject);
		} catch (Exception e) {
			e.printStackTrace();
			callbackContext.error("Error loading file");
			return;
		}
	}
	
	public void eraseEncounters(JSONArray args, CallbackContext callbackContext) {
		File[] encounters = Constants.ENCOUNTER_DIR.listFiles(new FilenameFilter() {
			
			@Override
			public boolean accept(File dir, String filename) {
				return filename.endsWith(".enc");
			}
		});
		
		for (File f : encounters) {
			f.delete();
		}
		
		callbackContext.success();
	}
	
	public void eraseReports(JSONArray args, CallbackContext callbackContext) {
		File[] reports = Constants.REPORT_STORAGE_DIR.listFiles(new FilenameFilter() {
			
			@Override
			public boolean accept(File dir, String filename) {
				return filename.endsWith(".csv") && filename.startsWith("report-");
			}
		});
		
		for (File f : reports) {
			f.delete();
		}
		
		callbackContext.success();
	}
}
