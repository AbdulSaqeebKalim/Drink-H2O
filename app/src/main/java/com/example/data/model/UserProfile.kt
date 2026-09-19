package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "user_profile")
data class UserProfile(
    @PrimaryKey val id: Int = 1,
    val age: Int = 26,
    val weightKg: Float = 70f,
    val isWeightLbs: Boolean = false,
    val heightCm: Float = 175f,
    val isHeightFt: Boolean = false,
    val gender: String = "other", // "male", "female", "other"
    val activityLevel: String = "medium", // "low", "medium", "high"
    val stepCount: Int = 7500,
    val wakeHour: Int = 7,
    val wakeMinute: Int = 0,
    val sleepHour: Int = 23,
    val sleepMinute: Int = 0,
    val dailyGoalMl: Int = 2500,
    val isSetupCompleted: Boolean = false,
    val soundOption: String = "droplet", // "droplet", "gentle_chime", "ripple"
    val remindersEnabled: Boolean = true,
    val themeMode: String = "system" // "system", "light", "dark"
)
