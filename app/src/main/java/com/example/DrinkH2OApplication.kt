package com.example

import android.app.Application
import com.example.reminder.NotificationHelper

class DrinkH2OApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        NotificationHelper.createNotificationChannel(this)
    }
}
