package com.example.eventscountdown

import android.content.Context
import android.webkit.JavascriptInterface

class AndroidWidgetBridge(private val context: Context) {

    @JavascriptInterface
    fun syncEvents(eventsJson: String) {
        EventsWidgetProvider.saveAndRefresh(context, eventsJson)
    }
}
