package org.msf.survey;

import org.msf.survey.monthly.fup.R;

import android.app.Activity;
import android.os.Bundle;
import android.view.Menu;
import android.view.View;

public class FinalActivity extends Activity {
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_final);
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		return true;
	}
	
	public void closeApp(View view) {
		this.finish();
		
	}
}
