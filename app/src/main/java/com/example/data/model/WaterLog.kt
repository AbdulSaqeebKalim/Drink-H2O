package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "water_logs")
data class WaterLog(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val amountMl: Int,
    val timestamp: Long = System.currentTimeMillis(),
    val dateString: String, // e.g. "2026-09-19"
    val note: String = "Water"
)
