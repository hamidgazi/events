package com.example.eventscountdown

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.view.View
import android.widget.RemoteViews
import org.json.JSONArray
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale

class EventsWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        const val PREFS_NAME = "events_widget_prefs"
        const val KEY_EVENTS_JSON = "events_json"

        fun saveAndRefresh(context: Context, eventsJson: String) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit().putString(KEY_EVENTS_JSON, eventsJson).apply()

            val appWidgetManager = AppWidgetManager.getInstance(context)
            
            // Refresh 4x2 widgets
            val thisWidget = ComponentName(context, EventsWidgetProvider::class.java)
            val allWidgetIds = appWidgetManager.getAppWidgetIds(thisWidget)
            for (id in allWidgetIds) {
                updateAppWidget(context, appWidgetManager, id)
            }

            // Refresh 2x2 widgets
            val compactWidget = ComponentName(context, EventsWidgetCompactProvider::class.java)
            val compactIds = appWidgetManager.getAppWidgetIds(compactWidget)
            for (id in compactIds) {
                EventsWidgetCompactProvider.updateAppWidget(context, appWidgetManager, id)
            }
        }

        fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            val views = RemoteViews(context.packageName, R.layout.widget_layout_4x2)
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val rawJson = prefs.getString(KEY_EVENTS_JSON, null)

            val eventList = parseAndSortEvents(rawJson)

            if (eventList.isEmpty()) {
                views.setViewVisibility(R.id.widget_content_box, View.GONE)
                views.setViewVisibility(R.id.widget_empty_text, View.VISIBLE)
            } else {
                views.setViewVisibility(R.id.widget_content_box, View.VISIBLE)
                views.setViewVisibility(R.id.widget_empty_text, View.GONE)

                // 1. Hero Event
                val hero = eventList[0]
                views.setTextViewText(R.id.widget_event_title, hero.name)
                views.setTextViewText(R.id.widget_target_date, hero.formattedDate)

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

                // 2. Secondary Event (if exists)
                if (eventList.size > 1) {
                    val sec = eventList[1]
                    views.setViewVisibility(R.id.widget_secondary_row, View.VISIBLE)
                    views.setTextViewText(R.id.widget_secondary_title, sec.name)
                    val secBadge = if (sec.daysLeft == 0L) "Today!" else if (sec.daysLeft == 1L) "Tomorrow" else "in ${sec.daysLeft}d"
                    views.setTextViewText(R.id.widget_secondary_badge, secBadge)
                } else {
                    views.setViewVisibility(R.id.widget_secondary_row, View.GONE)
                }
            }

            // Click Intent: Open Main App
            val openAppIntent = Intent(context, MainActivity::class.java)
            val pendingOpen = PendingIntent.getActivity(
                context, 0, openAppIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_root, pendingOpen)

            // Click Intent: [+] Quick Add Event
            val addIntent = Intent(context, MainActivity::class.java).apply {
                action = "ACTION_ADD_EVENT"
            }
            val pendingAdd = PendingIntent.getActivity(
                context, 1, addIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_btn_add, pendingAdd)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }

        fun parseAndSortEvents(rawJson: String?): List<WidgetEventItem> {
            if (rawJson.isNullOrBlank()) return emptyList()
            val list = mutableListOf<WidgetEventItem>()
            try {
                val array = JSONArray(rawJson)
                val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.US)
                val todayCal = Calendar.getInstance().apply {
                    set(Calendar.HOUR_OF_DAY, 0)
                    set(Calendar.MINUTE, 0)
                    set(Calendar.SECOND, 0)
                    set(Calendar.MILLISECOND, 0)
                }
                val todayMs = todayCal.timeInMillis
                val displaySdf = SimpleDateFormat("EEE, d MMM yyyy", Locale.US)

                for (i in 0 until array.length()) {
                    val obj = array.getJSONObject(i)
                    val name = obj.optString("name", "Event")
                    val dateStr = obj.optString("date", "")
                    if (dateStr.isNotBlank()) {
                        val parsedDate = sdf.parse(dateStr)
                        if (parsedDate != null) {
                            val eventMs = parsedDate.time
                            val diffDays = Math.round((eventMs - todayMs) / (1000.0 * 60 * 60 * 24))
                            list.add(WidgetEventItem(name, dateStr, displaySdf.format(parsedDate), diffDays))
                        }
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }

            return list.sortedWith(Comparator { a, b ->
                if (a.daysLeft >= 0 && b.daysLeft >= 0) {
                    a.daysLeft.compareTo(b.daysLeft)
                } else if (a.daysLeft < 0 && b.daysLeft < 0) {
                    b.daysLeft.compareTo(a.daysLeft)
                } else if (a.daysLeft >= 0) -1 else 1
            })
        }
    }
}

data class WidgetEventItem(
    val name: String,
    val dateStr: String,
    val formattedDate: String,
    val daysLeft: Long
)
