package org.msf.survey.plugin;

import java.util.Map;

import org.apache.cordova.api.CallbackContext;
import org.apache.cordova.api.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;

public class EnvironmentVariablePlugin extends CordovaPlugin {

	public static final String PREFERENCES_FILE_PREFIX = "envvars-";
	
	public static final String GET_VARS = "getVars";
	public static final String SET_VARS = "setVars";

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
			if (action.equalsIgnoreCase(GET_VARS)) {
				getVariables(callbackContext, args.getString(0), args.getJSONArray(1));
			} else if (action.equalsIgnoreCase(SET_VARS)) {
				setVariables(callbackContext, args.getString(0), args.getJSONArray(1), args.getJSONArray(2));
			}
		} catch (Exception e) {
			e.printStackTrace();
			callbackContext.error("Error in Environment Variable Plugin: " + e.getMessage());
		}

		return super.execute(action, args, callbackContext);
	}
	
	private SharedPreferences getNamedPreferences(String libraryName) {
		return cordova.getActivity().getSharedPreferences(PREFERENCES_FILE_PREFIX + libraryName, Context.MODE_PRIVATE);
	}
	
	public void getVariables(CallbackContext callbackContext, String libraryName, JSONArray variableNames) throws JSONException {
		SharedPreferences prefs = getNamedPreferences(libraryName);
		Map<String, ?> prefsMap = prefs.getAll();
		
		JSONArray results = new JSONArray();
		String variableName;
		for (int i = 0; i < variableNames.length(); i++) {
			variableName = variableNames.getString(i);
			if (prefsMap.containsKey(variableName)) {
				results.put(prefsMap.get(variableName));
			} else {
				results.put(org.json.JSONObject.NULL);
			}
		}
		
		callbackContext.success(results);
	}
	
	public void setVariables(CallbackContext callbackContext, String libraryName, JSONArray variableNames, JSONArray variableValues) throws JSONException {
		SharedPreferences prefs = getNamedPreferences(libraryName);
		Editor editor = prefs.edit();
		
		String variableName;
		Object value;
		for (int i = 0; i < variableNames.length(); i++) {
			variableName = variableNames.getString(i);
			value = variableValues.get(i);
			
			if (value instanceof Integer) {
				editor.putInt(variableName, (Integer)value);
			} else if (value instanceof Long) {
				editor.putLong(variableName, (Long)value);
			} else if (value instanceof Float) {
				editor.putFloat(variableName, (Float)value);
			} else if (value instanceof Double) {
				editor.putFloat(variableName, ((Double)value).floatValue());
			} else if (value instanceof String) {
				editor.putString(variableName, (String)value);
			} else if (value instanceof Boolean) {
				editor.putBoolean(variableName, (Boolean)value);
			}
		}
		
		editor.commit();
		
		callbackContext.success();
	}
}
