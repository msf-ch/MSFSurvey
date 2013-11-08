/*
Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
 */

package org.msf.survey;

import org.apache.cordova.Config;
import org.apache.cordova.DroidGap;

import android.os.Bundle;
import android.view.MotionEvent;
import android.view.View;

public class MSFSurveyFUP extends DroidGap implements View.OnTouchListener {
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		super.loadUrl(Config.getStartUrl());
	}

	@Override
	protected void onResume() {
		super.onResume();
		appView.setOnTouchListener(this);

		FileUtilities.ensureDirectoriesExist();
	}

	/*
	 * This is an attempted workaround to avoid issue where users can no
	 * longer enter data into forms. Seems to be a focus issue.
	 */
	public boolean onTouch(View v, MotionEvent event) {
		switch (event.getAction()) {
		case MotionEvent.ACTION_DOWN:
		case MotionEvent.ACTION_UP:
			if (!v.hasFocus()) {
				v.requestFocus();
			}
			break;
		}
		return false;
	}

}
