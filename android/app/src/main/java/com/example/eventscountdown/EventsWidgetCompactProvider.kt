package com.example.eventscountdown

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.view.View
import android.widget.RemoteViews

class EventsWidgetCompactProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            val views = RemoteViews(context.packageName, R.layout.widget_layout_2x2)
            val prefs = context.getSharedPreferences(EventsWidgetProvider.PREFS_NAME, Context.MODE_PRIVATE)
            val rawJson = prefs.getString(EventsWidgetProvider.KEY_EVENTS_JSON, null)

            val eventList = EventsWidgetProvider.parseAndSortEvents(rawJson)

            if (eventList.isEmpty()) {
                views.setTextViewText(R.id.widget_days_number, "--")
                views.setTextViewText(R.id.widget_days_label, "NO EVENTS")
                views.setTextViewText(R.id.widget_event_title, "Tap to open")
                views.setTextColor(R.id.widget_days_number, Color.parseColor("#8b949e"))
            } else {
                val hero = eventList[0]
                views.setTextViewText(R.id.widget_event_title, hero.name)

                if (hero.daysLeft == 0L) {
                    views.setTextViewText(R.id.widget_days_number, "TODAY")
                    views.setTextViewText(R.id.widget_days_label, "CELEBRATE! 🎉")
                    views.setTextColor(R.id.widget_days_number, Color.parseColor("#ff4444"))
                } else if (hero.daysLeft == 1L) {
                    views.setTextViewText(R.id.widget_days_number, "1")
                    views.setTextViewText(R.id.widget_days_label, "TOMORROW")
                    views.setTextColor(R.id.widget_days_number, Color.parseColor("#ff8c00"))
                } else if (hero.daysLeft > 1L) {
                    views.setTextViewText(R.id.widget_days_number, hero.daysLeft.toString())
                    views.setTextViewText(R.id.widget_days_label, "DAYS LEFT")
                    val color = if (hero.daysLeft <= 3L) "#ff8c00" else if (hero.daysLeft <= 7L) "#e8b030" else "#388bfd"
                    views.setTextColor(R.id.widget_days_number, Color.parseColor(color))
                } else {
                    views.setTextViewText(R.id.widget_days_number, Math.abs(hero.daysLeft).toString())
                    views.setTextViewText(R.id.widget_days_label, "DAYS AGO")
                    views.setTextColor(R.id.widget_days_number, Color.parseColor("#8b949e"))
                }
            }

            val openAppIntent = Intent(context, MainActivity::class.java)
            val pendingOpen = PendingIntent.getActivity(
                context, 0, openAppIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_root, pendingOpen)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
