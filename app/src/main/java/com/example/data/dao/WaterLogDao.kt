package com.example.data.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.example.data.model.WaterLog
import kotlinx.coroutines.flow.Flow

@Dao
interface WaterLogDao {
    @Query("SELECT * FROM water_logs WHERE dateString = :dateString ORDER BY timestamp DESC")
    fun getLogsForDate(dateString: String): Flow<List<WaterLog>>

    @Query("SELECT * FROM water_logs ORDER BY timestamp DESC")
    fun getAllLogs(): Flow<List<WaterLog>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLog(log: WaterLog): Long

    @Query("DELETE FROM water_logs WHERE id = :id")
    suspend fun deleteLogById(id: Long)

    @Query("DELETE FROM water_logs WHERE dateString = :dateString")
    suspend fun clearLogsForDate(dateString: String)
}
