package com.example.reminder

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import com.example.data.db.AppDatabase
import com.example.data.model.UserProfile
import java.util.Calendar

object ReminderScheduler {

    private const val PREFS_NAME = "drink_h2o_reminder_prefs"
    private const val KEY_NEXT_REMINDER = "key_next_reminder_timestamp"

    fun getNextReminderTimestamp(context: Context): Long {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getLong(KEY_NEXT_REMINDER, 0L)
    }

    private fun setNextReminderTimestamp(context: Context, timestamp: Long) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().putLong(KEY_NEXT_REMINDER, timestamp).apply()
    }

    suspend fun scheduleNextReminder(context: Context) {
        val db = AppDatabase.getDatabase(context)
        val profile = db.userProfileDao().getProfileDirect() ?: return

        if (!profile.remindersEnabled) {
            cancelAlarms(context)
            setNextReminderTimestamp(context, 0L)
            return
        }

        val nextTime = calculateNextReminderMillis(profile)
        setNextReminderTimestamp(context, nextTime)

        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
        val intent = Intent(context, ReminderActionReceiver::class.java).apply {
            action = ReminderActionReceiver.ACTION_TRIGGER_REMINDER
        }
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            500,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        try {
            alarmManager.setAndAllowWhileIdle(
                AlarmManager.RTC_WAKEUP,
                nextTime,
                pendingIntent
            )
        } catch (_: SecurityException) {
            // In case exact alarm permission is restricted
        }
    }

    fun scheduleSnooze(context: Context, minutes: Int) {
        val snoozeMillis = System.currentTimeMillis() + (minutes * 60 * 1000L)
        setNextReminderTimestamp(context, snoozeMillis)

        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
        val intent = Intent(context, ReminderActionReceiver::class.java).apply {
            action = ReminderActionReceiver.ACTION_TRIGGER_REMINDER
        }
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            501,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        try {
            alarmManager.setAndAllowWhileIdle(
                AlarmManager.RTC_WAKEUP,
                snoozeMillis,
                pendingIntent
            )
        } catch (_: SecurityException) {
            // Ignore
        }
    }

    fun cancelAlarms(context: Context) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
        val intent = Intent(context, ReminderActionReceiver::class.java).apply {
            action = ReminderActionReceiver.ACTION_TRIGGER_REMINDER
        }
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            500,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        alarmManager.cancel(pendingIntent)
    }

    fun calculateNextReminderMillis(profile: UserProfile): Long {
        val now = Calendar.getInstance()
        val currentMinutes = now.get(Calendar.HOUR_OF_DAY) * 60 + now.get(Calendar.MINUTE)

        val wakeMinutes = profile.wakeHour * 60 + profile.wakeMinute
        val sleepMinutes = profile.sleepHour * 60 + profile.sleepMinute

        val wakingDuration = if (sleepMinutes > wakeMinutes) {
            sleepMinutes - wakeMinutes
        } else {
            (1440 - wakeMinutes) + sleepMinutes
        }

        val glassesNeeded = (profile.dailyGoalMl / 250).coerceIn(4, 16)
        val intervalMinutes = (wakingDuration / glassesNeeded).coerceIn(30, 180)

        // Case 1: Current time is during sleeping hours (after sleep or before wake)
        val isWakingTime = if (sleepMinutes > wakeMinutes) {
            currentMinutes in wakeMinutes until sleepMinutes
        } else {
            currentMinutes >= wakeMinutes || currentMinutes < sleepMinutes
        }

        val targetCal = Calendar.getInstance()
        if (!isWakingTime) {
            // Schedule for next wake time + interval
            if (currentMinutes >= sleepMinutes && sleepMinutes > wakeMinutes) {
                targetCal.add(Calendar.DAY_OF_YEAR, 1)
            }
            targetCal.set(Calendar.HOUR_OF_DAY, profile.wakeHour)
            targetCal.set(Calendar.MINUTE, profile.wakeMinute)
            targetCal.set(Calendar.SECOND, 0)
            targetCal.set(Calendar.MILLISECOND, 0)
            targetCal.add(Calendar.MINUTE, intervalMinutes)
            return targetCal.timeInMillis
        }

        // Case 2: Currently awake, find the next interval boundary
        var slot = wakeMinutes
        while (slot <= currentMinutes) {
            slot += intervalMinutes
        }

        if (slot >= sleepMinutes && sleepMinutes > wakeMinutes) {
            // Next slot would be after sleep, schedule tomorrow morning
            targetCal.add(Calendar.DAY_OF_YEAR, 1)
            targetCal.set(Calendar.HOUR_OF_DAY, profile.wakeHour)
            targetCal.set(Calendar.MINUTE, profile.wakeMinute)
            targetCal.set(Calendar.SECOND, 0)
            targetCal.set(Calendar.MILLISECOND, 0)
            targetCal.add(Calendar.MINUTE, intervalMinutes)
            return targetCal.timeInMillis
        }

        targetCal.set(Calendar.HOUR_OF_DAY, slot / 60)
        targetCal.set(Calendar.MINUTE, slot % 60)
        targetCal.set(Calendar.SECOND, 0)
        targetCal.set(Calendar.MILLISECOND, 0)

        if (targetCal.timeInMillis <= now.timeInMillis) {
            targetCal.add(Calendar.MINUTE, intervalMinutes)
        }
        return targetCal.timeInMillis
    }
}
