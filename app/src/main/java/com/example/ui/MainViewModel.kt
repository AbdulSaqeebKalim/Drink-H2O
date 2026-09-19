package com.example.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.db.AppDatabase
import com.example.data.model.UserProfile
import com.example.data.model.WaterLog
import com.example.data.repository.WaterRepository
import com.example.reminder.NotificationHelper
import com.example.reminder.ReminderScheduler
import com.example.util.HydrationCalculator
import com.example.util.SoundPlayer
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

enum class AppNavScreen {
    HOME,
    HISTORY,
    SETTINGS
}

class MainViewModel(application: Application) : AndroidViewModel(application) {

    private val repository: WaterRepository
    private val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())

    val todayDateString: String = dateFormat.format(Date())

    val userProfile: StateFlow<UserProfile?>
    val todayLogs: StateFlow<List<WaterLog>>
    val allLogs: StateFlow<List<WaterLog>>

    private val _currentScreen = MutableStateFlow(AppNavScreen.HOME)
    val currentScreen: StateFlow<AppNavScreen> = _currentScreen.asStateFlow()

    private val _nextReminderTime = MutableStateFlow(0L)
    val nextReminderTime: StateFlow<Long> = _nextReminderTime.asStateFlow()

    private val _inAppBannerMessage = MutableStateFlow<String?>(null)
    val inAppBannerMessage: StateFlow<String?> = _inAppBannerMessage.asStateFlow()

    init {
        val db = AppDatabase.getDatabase(application)
        repository = WaterRepository(db.userProfileDao(), db.waterLogDao())

        userProfile = repository.userProfile.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = null
        )

        todayLogs = repository.getLogsForDate(todayDateString).stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

        allLogs = repository.allLogs.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

        refreshNextReminderTime()
    }

    fun navigateTo(screen: AppNavScreen) {
        _currentScreen.value = screen
    }

    fun refreshNextReminderTime() {
        viewModelScope.launch {
            val profile = repository.getProfileDirect()
            if (profile != null && profile.remindersEnabled) {
                val next = ReminderScheduler.calculateNextReminderMillis(profile)
                _nextReminderTime.value = next
            } else {
                _nextReminderTime.value = 0L
            }
        }
    }

    fun saveProfile(profile: UserProfile) {
        viewModelScope.launch {
            repository.saveProfile(profile)
            ReminderScheduler.scheduleNextReminder(getApplication())
            refreshNextReminderTime()
            _inAppBannerMessage.value = "Hydration goal updated to ${profile.dailyGoalMl} ml"
        }
    }

    fun logWater(amountMl: Int, note: String = "Water") {
        viewModelScope.launch {
            repository.logWater(amountMl, note)
            val profile = userProfile.value
            val sound = profile?.soundOption ?: "droplet"
            SoundPlayer.playSound(getApplication(), sound)
            _inAppBannerMessage.value = "Logged +$amountMl ml! Great job! 💧"
            refreshNextReminderTime()
        }
    }

    fun deleteLog(id: Long) {
        viewModelScope.launch {
            repository.deleteLog(id)
        }
    }

    fun clearToday() {
        viewModelScope.launch {
            repository.clearLogsForDate(todayDateString)
            _inAppBannerMessage.value = "Today's logs reset"
        }
    }

    fun snoozeReminder(minutes: Int) {
        viewModelScope.launch {
            ReminderScheduler.scheduleSnooze(getApplication(), minutes)
            val next = System.currentTimeMillis() + (minutes * 60 * 1000L)
            _nextReminderTime.value = next
            _inAppBannerMessage.value = "Reminder snoozed for $minutes minutes ⏰"
        }
    }

    fun triggerTestReminder() {
        viewModelScope.launch {
            val profile = userProfile.value ?: UserProfile()
            NotificationHelper.showHydrationReminder(
                context = getApplication(),
                amountMl = 250,
                soundOption = profile.soundOption
            )
            _inAppBannerMessage.value = "Test reminder triggered with ${profile.soundOption} sound 🔔"
        }
    }

    fun dismissBanner() {
        _inAppBannerMessage.value = null
    }

    fun calculateGoalFor(
        weightKg: Float,
        steps: Int,
        activityLevel: String,
        age: Int,
        gender: String
    ): Int {
        return HydrationCalculator.calculateDailyGoal(
            weightKg = weightKg,
            stepCount = steps,
            activityLevel = activityLevel,
            age = age,
            gender = gender
        )
    }
}
