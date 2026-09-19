package com.example.reminder

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.example.data.db.AppDatabase
import com.example.data.model.WaterLog
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class ReminderActionReceiver : BroadcastReceiver() {

    companion object {
        const val ACTION_MARK_DRANK = "com.example.reminder.ACTION_MARK_DRANK"
        const val ACTION_SNOOZE = "com.example.reminder.ACTION_SNOOZE"
        const val ACTION_TRIGGER_REMINDER = "com.example.reminder.ACTION_TRIGGER_REMINDER"
        const val EXTRA_AMOUNT_ML = "extra_amount_ml"
        const val EXTRA_SNOOZE_MINUTES = "extra_snooze_minutes"
    }

    override fun onReceive(context: Context, intent: Intent) {
        val pendingResult = goAsync()

        CoroutineScope(Dispatchers.IO).launch {
            try {
                when (intent.action) {
                    ACTION_MARK_DRANK -> {
                        val amount = intent.getIntExtra(EXTRA_AMOUNT_ML, 250)
                        val db = AppDatabase.getDatabase(context)
                        val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
                        val today = dateFormat.format(Date())

                        db.waterLogDao().insertLog(
                            WaterLog(
                                amountMl = amount,
                                timestamp = System.currentTimeMillis(),
                                dateString = today,
                                note = "Reminder quick log"
                            )
                        )
                        NotificationHelper.cancelReminder(context)
                        // Trigger reminder recalculation
                        ReminderScheduler.scheduleNextReminder(context)
                    }
                    ACTION_SNOOZE -> {
                        val minutes = intent.getIntExtra(EXTRA_SNOOZE_MINUTES, 10)
                        NotificationHelper.cancelReminder(context)
                        ReminderScheduler.scheduleSnooze(context, minutes)
                    }
                    ACTION_TRIGGER_REMINDER -> {
                        val db = AppDatabase.getDatabase(context)
                        val profile = db.userProfileDao().getProfileDirect()
                        if (profile != null && profile.remindersEnabled) {
                            val glassSize = 250
                            NotificationHelper.showHydrationReminder(
                                context = context,
                                amountMl = glassSize,
                                soundOption = profile.soundOption
                            )
                            ReminderScheduler.scheduleNextReminder(context)
                        }
                    }
                }
            } catch (_: Exception) {
                // Ignore receiver errors
            } finally {
                pendingResult.finish()
            }
        }
    }
}
