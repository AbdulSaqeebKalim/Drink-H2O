package com.example.data.repository

import com.example.data.dao.UserProfileDao
import com.example.data.dao.WaterLogDao
import com.example.data.model.UserProfile
import com.example.data.model.WaterLog
import kotlinx.coroutines.flow.Flow
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class WaterRepository(
    private val profileDao: UserProfileDao,
    private val waterLogDao: WaterLogDao
) {
    val userProfile: Flow<UserProfile?> = profileDao.getUserProfile()
    val allLogs: Flow<List<WaterLog>> = waterLogDao.getAllLogs()

    fun getLogsForDate(dateString: String): Flow<List<WaterLog>> {
        return waterLogDao.getLogsForDate(dateString)
    }

    suspend fun getProfileDirect(): UserProfile? {
        return profileDao.getProfileDirect()
    }

    suspend fun saveProfile(profile: UserProfile) {
        profileDao.saveProfile(profile)
    }

    suspend fun logWater(amountMl: Int, note: String = "Water"): Long {
        val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val today = dateFormat.format(Date())
        return waterLogDao.insertLog(
            WaterLog(
                amountMl = amountMl,
                timestamp = System.currentTimeMillis(),
                dateString = today,
                note = note
            )
        )
    }

    suspend fun deleteLog(id: Long) {
        waterLogDao.deleteLogById(id)
    }

    suspend fun clearLogsForDate(dateString: String) {
        waterLogDao.clearLogsForDate(dateString)
    }
}
