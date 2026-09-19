package com.example.ui.screens

import android.app.TimePickerDialog
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bedtime
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.DirectionsWalk
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.MusicNote
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Save
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.WbSunny
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedCard
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.example.data.model.UserProfile
import com.example.util.HydrationCalculator
import com.example.util.SoundPlayer
import java.util.Locale
import kotlin.math.roundToInt

@Composable
fun SettingsScreen(
    profile: UserProfile,
    onSaveProfile: (UserProfile) -> Unit,
    onClearToday: () -> Unit,
    onTestSound: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val scrollState = rememberScrollState()

    var ageText by remember(profile) { mutableStateOf(profile.age.toString()) }
    var isWeightLbs by remember(profile) { mutableStateOf(profile.isWeightLbs) }
    var weightText by remember(profile) {
        val initialWeight = if (profile.isWeightLbs) {
            HydrationCalculator.kgToLbs(profile.weightKg).roundToInt().toString()
        } else {
            profile.weightKg.roundToInt().toString()
        }
        mutableStateOf(initialWeight)
    }

    var gender by remember(profile) { mutableStateOf(profile.gender) }
    var activityLevel by remember(profile) { mutableStateOf(profile.activityLevel) }
    var stepCountText by remember(profile) { mutableStateOf(profile.stepCount.toString()) }

    var wakeHour by remember(profile) { mutableIntStateOf(profile.wakeHour) }
    var wakeMinute by remember(profile) { mutableIntStateOf(profile.wakeMinute) }
    var sleepHour by remember(profile) { mutableIntStateOf(profile.sleepHour) }
    var sleepMinute by remember(profile) { mutableIntStateOf(profile.sleepMinute) }

    var selectedSound by remember(profile) { mutableStateOf(profile.soundOption) }
    var remindersEnabled by remember(profile) { mutableStateOf(profile.remindersEnabled) }
    var themeMode by remember(profile) { mutableStateOf(profile.themeMode) }

    var showResetDialog by remember { mutableStateOf(false) }

    // Dynamic goal calculation preview
    val calculatedGoal by remember {
        derivedStateOf {
            val age = ageText.toIntOrNull() ?: 26
            val rawWeight = weightText.toFloatOrNull() ?: 70f
            val weightKg = if (isWeightLbs) HydrationCalculator.lbsToKg(rawWeight) else rawWeight
            val steps = stepCountText.toIntOrNull() ?: 7500

            HydrationCalculator.calculateDailyGoal(
                weightKg = weightKg,
                stepCount = steps,
                activityLevel = activityLevel,
                age = age,
                gender = gender
            )
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(scrollState)
            .padding(horizontal = 20.dp, vertical = 16.dp)
    ) {
        // Settings Header
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
                imageVector = Icons.Default.Settings,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(28.dp)
            )
            Spacer(modifier = Modifier.width(10.dp))
            Column {
                Text(
                    text = "Settings & Profile",
                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = "Personalize your goals, reminders, and theme",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        Spacer(modifier = Modifier.height(18.dp))

        // Appearance / Theme Switch Card (Sun / Moon)
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            shape = RoundedCornerShape(18.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Appearance",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.primary
                )

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    listOf("light" to "Light", "dark" to "Dark", "system" to "System").forEach { (mode, label) ->
                        FilterChip(
                            selected = themeMode == mode,
                            onClick = {
                                themeMode = mode
                                val updated = profile.copy(themeMode = mode)
                                onSaveProfile(updated)
                            },
                            label = { Text(label) },
                            leadingIcon = {
                                when (mode) {
                                    "light" -> Icon(Icons.Default.LightMode, contentDescription = null)
                                    "dark" -> Icon(Icons.Default.DarkMode, contentDescription = null)
                                    else -> Icon(Icons.Default.WbSunny, contentDescription = null)
                                }
                            },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = MaterialTheme.colorScheme.primary,
                                selectedLabelColor = MaterialTheme.colorScheme.onPrimary,
                                selectedLeadingIconColor = MaterialTheme.colorScheme.onPrimary
                            ),
                            modifier = Modifier.testTag("theme_chip_$mode")
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Ringtone / Sound Selector Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            shape = RoundedCornerShape(18.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Reminder Ringtone",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.primary
                    )
                    Icon(
                        Icons.Default.MusicNote,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary
                    )
                }

                Text(
                    text = "Select sound played when a reminder triggers (volume respects device settings).",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                Spacer(modifier = Modifier.height(10.dp))

                SoundPlayer.SoundType.values().forEach { sound ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                selectedSound = sound.id
                                val updated = profile.copy(soundOption = sound.id)
                                onSaveProfile(updated)
                            }
                            .padding(vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(
                            selected = selectedSound == sound.id,
                            onClick = {
                                selectedSound = sound.id
                                val updated = profile.copy(soundOption = sound.id)
                                onSaveProfile(updated)
                            },
                            modifier = Modifier.testTag("radio_sound_${sound.id}")
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = sound.displayName,
                                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold)
                            )
                            Text(
                                text = sound.description,
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }

                        IconButton(
                            onClick = { onTestSound(sound.id) },
                            modifier = Modifier.testTag("test_sound_${sound.id}")
                        ) {
                            Icon(
                                Icons.Default.PlayArrow,
                                contentDescription = "Play sound preview",
                                tint = MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Reminders & Notifications Toggle
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            shape = RoundedCornerShape(18.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Smart Notifications",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.primary
                        )
                        Text(
                            text = "Evenly spaced between waking hours only",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    Switch(
                        checked = remindersEnabled,
                        onCheckedChange = {
                            remindersEnabled = it
                            val updated = profile.copy(remindersEnabled = it)
                            onSaveProfile(updated)
                        },
                        modifier = Modifier.testTag("reminders_switch")
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Wake & Sleep Time Pickers
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedCard(
                        modifier = Modifier
                            .weight(1f)
                            .clickable {
                                TimePickerDialog(
                                    context,
                                    { _, h, m ->
                                        wakeHour = h
                                        wakeMinute = m
                                    },
                                    wakeHour,
                                    wakeMinute,
                                    false
                                ).show()
                            },
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            Text("Wake Up", style = MaterialTheme.typography.labelSmall)
                            val amPm = if (wakeHour < 12) "AM" else "PM"
                            val displayH = if (wakeHour % 12 == 0) 12 else wakeHour % 12
                            Text(
                                text = String.format(Locale.getDefault(), "%d:%02d %s", displayH, wakeMinute, amPm),
                                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                    }

                    OutlinedCard(
                        modifier = Modifier
                            .weight(1f)
                            .clickable {
                                TimePickerDialog(
                                    context,
                                    { _, h, m ->
                                        sleepHour = h
                                        sleepMinute = m
                                    },
                                    sleepHour,
                                    sleepMinute,
                                    false
                                ).show()
                            },
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            Text("Bedtime", style = MaterialTheme.typography.labelSmall)
                            val amPm = if (sleepHour < 12) "AM" else "PM"
                            val displayH = if (sleepHour % 12 == 0) 12 else sleepHour % 12
                            Text(
                                text = String.format(Locale.getDefault(), "%d:%02d %s", displayH, sleepMinute, amPm),
                                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Profile Metrics Form (Auto recalculated goal)
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            shape = RoundedCornerShape(18.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Edit Profile & Hydration Goal",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.primary
                    )
                }

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = "Current calculated goal: $calculatedGoal ml/day",
                    style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.secondary
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Age & Weight
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedTextField(
                        value = ageText,
                        onValueChange = { if (it.all { ch -> ch.isDigit() }) ageText = it },
                        label = { Text("Age") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )

                    OutlinedTextField(
                        value = weightText,
                        onValueChange = { weightText = it },
                        label = { Text(if (isWeightLbs) "Weight (lbs)" else "Weight (kg)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        modifier = Modifier.weight(1.3f),
                        singleLine = true
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Steps & Activity
                OutlinedTextField(
                    value = stepCountText,
                    onValueChange = { stepCountText = it },
                    label = { Text("Daily Steps") },
                    leadingIcon = { Icon(Icons.Default.DirectionsWalk, contentDescription = null) },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Save Changes Button
                Button(
                    onClick = {
                        val age = ageText.toIntOrNull() ?: 26
                        val rawWeight = weightText.toFloatOrNull() ?: 70f
                        val weightKg = if (isWeightLbs) HydrationCalculator.lbsToKg(rawWeight) else rawWeight
                        val steps = stepCountText.toIntOrNull() ?: 7500

                        val updated = profile.copy(
                            age = age,
                            weightKg = weightKg,
                            isWeightLbs = isWeightLbs,
                            gender = gender,
                            activityLevel = activityLevel,
                            stepCount = steps,
                            wakeHour = wakeHour,
                            wakeMinute = wakeMinute,
                            sleepHour = sleepHour,
                            sleepMinute = sleepMinute,
                            dailyGoalMl = calculatedGoal,
                            soundOption = selectedSound,
                            remindersEnabled = remindersEnabled,
                            themeMode = themeMode
                        )
                        onSaveProfile(updated)
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp)
                        .testTag("save_settings_button"),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(Icons.Default.Save, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Save & Recalculate Schedule", fontWeight = FontWeight.Bold)
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Reset Today's Log Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            shape = RoundedCornerShape(18.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Data Management",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.error
                )
                Text(
                    text = "Reset all water logged today back to 0 ml.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedButton(
                    onClick = { showResetDialog = true },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(Icons.Default.Refresh, contentDescription = null, tint = MaterialTheme.colorScheme.error)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Reset Today's Progress", color = MaterialTheme.colorScheme.error)
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))
    }

    if (showResetDialog) {
        AlertDialog(
            onDismissRequest = { showResetDialog = false },
            title = { Text("Reset Today's Water?") },
            text = { Text("This will remove all intake logged today. Past days' history will remain untouched.") },
            confirmButton = {
                Button(
                    onClick = {
                        onClearToday()
                        showResetDialog = false
                    }
                ) {
                    Text("Reset")
                }
            },
            dismissButton = {
                TextButton(onClick = { showResetDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}
