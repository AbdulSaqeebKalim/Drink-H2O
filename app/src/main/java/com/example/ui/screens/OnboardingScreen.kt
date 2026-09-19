package com.example.ui.screens

import android.app.TimePickerDialog
import androidx.compose.foundation.background
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
import androidx.compose.material.icons.filled.AccessTime
import androidx.compose.material.icons.filled.DirectionsWalk
import androidx.compose.material.icons.filled.Female
import androidx.compose.material.icons.filled.Height
import androidx.compose.material.icons.filled.Male
import androidx.compose.material.icons.filled.MonitorWeight
import androidx.compose.material.icons.filled.Nightlight
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.WaterDrop
import androidx.compose.material.icons.filled.WbSunny
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedCard
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
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
import androidx.compose.ui.unit.sp
import com.example.data.model.UserProfile
import com.example.util.HydrationCalculator
import java.util.Locale
import kotlin.math.roundToInt

@Composable
fun OnboardingScreen(
    initialProfile: UserProfile? = null,
    onSaveProfile: (UserProfile) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val scrollState = rememberScrollState()

    var ageText by remember { mutableStateOf(initialProfile?.age?.toString() ?: "26") }
    var isWeightLbs by remember { mutableStateOf(initialProfile?.isWeightLbs ?: false) }
    var weightText by remember {
        val initialWeight = if (initialProfile?.isWeightLbs == true) {
            HydrationCalculator.kgToLbs(initialProfile.weightKg).roundToInt().toString()
        } else {
            (initialProfile?.weightKg ?: 70f).roundToInt().toString()
        }
        mutableStateOf(initialWeight)
    }

    var isHeightFt by remember { mutableStateOf(initialProfile?.isHeightFt ?: false) }
    var heightCmText by remember { mutableStateOf(initialProfile?.heightCm?.roundToInt()?.toString() ?: "175") }
    var heightFtText by remember { mutableStateOf("5") }
    var heightInText by remember { mutableStateOf("9") }

    var gender by remember { mutableStateOf(initialProfile?.gender ?: "male") }
    var activityLevel by remember { mutableStateOf(initialProfile?.activityLevel ?: "medium") }
    var stepCountText by remember { mutableStateOf(initialProfile?.stepCount?.toString() ?: "7500") }

    var wakeHour by remember { mutableIntStateOf(initialProfile?.wakeHour ?: 7) }
    var wakeMinute by remember { mutableIntStateOf(initialProfile?.wakeMinute ?: 0) }

    var sleepHour by remember { mutableIntStateOf(initialProfile?.sleepHour ?: 23) }
    var sleepMinute by remember { mutableIntStateOf(initialProfile?.sleepMinute ?: 0) }

    // Real-time calculated daily goal
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
            .padding(horizontal = 20.dp, vertical = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // App Branding Header
        Box(
            modifier = Modifier
                .size(68.dp)
                .clip(CircleShape)
                .background(MaterialTheme.colorScheme.primaryContainer),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.WaterDrop,
                contentDescription = "Drink H2O Logo",
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(40.dp)
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        Text(
            text = "Welcome to Drink H2O",
            style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold),
            color = MaterialTheme.colorScheme.onSurface
        )

        Text(
            text = "Set up your profile to personalize your daily hydration goal and smart waking-hours reminder schedule.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp)
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Live Calculated Goal Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
            shape = RoundedCornerShape(16.dp)
        ) {
            Row(
                modifier = Modifier.padding(18.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(52.dp)
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.primary),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.WaterDrop,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.onPrimary,
                        modifier = Modifier.size(30.dp)
                    )
                }

                Spacer(modifier = Modifier.width(16.dp))

                Column {
                    Text(
                        text = "Recommended Daily Goal",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f)
                    )
                    Text(
                        text = "${calculatedGoal} ml (${String.format(Locale.getDefault(), "%.1f", calculatedGoal / 1000f)} L)",
                        style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.ExtraBold),
                        color = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                    Text(
                        text = "≈ ${(calculatedGoal / 250f).roundToInt()} glasses (250ml each)",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.9f)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Age & Gender Section
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Personal Information",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.primary
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Age input
                OutlinedTextField(
                    value = ageText,
                    onValueChange = { if (it.length <= 3 && it.all { ch -> ch.isDigit() }) ageText = it },
                    label = { Text("Age (years)") },
                    leadingIcon = { Icon(Icons.Default.Person, contentDescription = null) },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("age_input"),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(12.dp))

                Text(
                    text = "Gender",
                    style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold)
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    listOf("male" to "Male", "female" to "Female", "other" to "Other").forEach { (key, label) ->
                        FilterChip(
                            selected = gender == key,
                            onClick = { gender = key },
                            label = { Text(label) },
                            leadingIcon = {
                                when (key) {
                                    "male" -> Icon(Icons.Default.Male, contentDescription = null)
                                    "female" -> Icon(Icons.Default.Female, contentDescription = null)
                                    else -> Icon(Icons.Default.Person, contentDescription = null)
                                }
                            },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = MaterialTheme.colorScheme.primary,
                                selectedLabelColor = MaterialTheme.colorScheme.onPrimary,
                                selectedLeadingIconColor = MaterialTheme.colorScheme.onPrimary
                            ),
                            modifier = Modifier.testTag("gender_$key")
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Weight & Height Section
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Body Metrics",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.primary
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Weight Row with kg / lbs toggle
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedTextField(
                        value = weightText,
                        onValueChange = { weightText = it },
                        label = { Text(if (isWeightLbs) "Weight (lbs)" else "Weight (kg)") },
                        leadingIcon = { Icon(Icons.Default.MonitorWeight, contentDescription = null) },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        modifier = Modifier
                            .weight(1f)
                            .testTag("weight_input"),
                        singleLine = true
                    )

                    Spacer(modifier = Modifier.width(8.dp))

                    Row(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(MaterialTheme.colorScheme.surfaceVariant)
                    ) {
                        Box(
                            modifier = Modifier
                                .clickable {
                                    if (isWeightLbs) {
                                        val lbs = weightText.toFloatOrNull() ?: 154f
                                        weightText = HydrationCalculator.lbsToKg(lbs).roundToInt().toString()
                                        isWeightLbs = false
                                    }
                                }
                                .background(if (!isWeightLbs) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant)
                                .padding(horizontal = 12.dp, vertical = 14.dp)
                        ) {
                            Text(
                                "kg",
                                color = if (!isWeightLbs) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        Box(
                            modifier = Modifier
                                .clickable {
                                    if (!isWeightLbs) {
                                        val kg = weightText.toFloatOrNull() ?: 70f
                                        weightText = HydrationCalculator.kgToLbs(kg).roundToInt().toString()
                                        isWeightLbs = true
                                    }
                                }
                                .background(if (isWeightLbs) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant)
                                .padding(horizontal = 12.dp, vertical = 14.dp)
                        ) {
                            Text(
                                "lbs",
                                color = if (isWeightLbs) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Height input
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    if (!isHeightFt) {
                        OutlinedTextField(
                            value = heightCmText,
                            onValueChange = { heightCmText = it },
                            label = { Text("Height (cm)") },
                            leadingIcon = { Icon(Icons.Default.Height, contentDescription = null) },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier
                                .weight(1f)
                                .testTag("height_input"),
                            singleLine = true
                        )
                    } else {
                        Row(modifier = Modifier.weight(1f)) {
                            OutlinedTextField(
                                value = heightFtText,
                                onValueChange = { heightFtText = it },
                                label = { Text("ft") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                modifier = Modifier.weight(1f),
                                singleLine = true
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            OutlinedTextField(
                                value = heightInText,
                                onValueChange = { heightInText = it },
                                label = { Text("in") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                modifier = Modifier.weight(1f),
                                singleLine = true
                            )
                        }
                    }

                    Spacer(modifier = Modifier.width(8.dp))

                    Row(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(MaterialTheme.colorScheme.surfaceVariant)
                    ) {
                        Box(
                            modifier = Modifier
                                .clickable { isHeightFt = false }
                                .background(if (!isHeightFt) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant)
                                .padding(horizontal = 12.dp, vertical = 14.dp)
                        ) {
                            Text(
                                "cm",
                                color = if (!isHeightFt) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        Box(
                            modifier = Modifier
                                .clickable { isHeightFt = true }
                                .background(if (isHeightFt) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant)
                                .padding(horizontal = 12.dp, vertical = 14.dp)
                        ) {
                            Text(
                                "ft/in",
                                color = if (isHeightFt) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Activity Level & Step Count
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Physical Activity Level",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.primary
                )

                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    listOf("low" to "Low (<5k)", "medium" to "Medium (7.5k)", "high" to "High (10k+)").forEach { (lvl, title) ->
                        FilterChip(
                            selected = activityLevel == lvl,
                            onClick = {
                                activityLevel = lvl
                                when (lvl) {
                                    "low" -> stepCountText = "4000"
                                    "medium" -> stepCountText = "7500"
                                    "high" -> stepCountText = "11000"
                                }
                            },
                            label = { Text(title) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = MaterialTheme.colorScheme.primary,
                                selectedLabelColor = MaterialTheme.colorScheme.onPrimary
                            ),
                            modifier = Modifier.testTag("activity_$lvl")
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = stepCountText,
                    onValueChange = { stepCountText = it },
                    label = { Text("Daily Step Count") },
                    leadingIcon = { Icon(Icons.Default.DirectionsWalk, contentDescription = null) },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("steps_input"),
                    singleLine = true
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Wake and Sleep Times (For interval scheduling)
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Sleep & Wake Schedule",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.primary
                )
                Text(
                    text = "Reminders are only scheduled during waking hours (never while sleeping).",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                Spacer(modifier = Modifier.height(14.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Wake time card
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
                            }
                            .testTag("wake_time_button"),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    Icons.Default.WbSunny,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.primary,
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Wake Up", style = MaterialTheme.typography.labelMedium)
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            val amPm = if (wakeHour < 12) "AM" else "PM"
                            val displayH = if (wakeHour % 12 == 0) 12 else wakeHour % 12
                            Text(
                                text = String.format(Locale.getDefault(), "%d:%02d %s", displayH, wakeMinute, amPm),
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                    }

                    // Sleep time card
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
                            }
                            .testTag("sleep_time_button"),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    Icons.Default.Nightlight,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.primary,
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Bedtime", style = MaterialTheme.typography.labelMedium)
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            val amPm = if (sleepHour < 12) "AM" else "PM"
                            val displayH = if (sleepHour % 12 == 0) 12 else sleepHour % 12
                            Text(
                                text = String.format(Locale.getDefault(), "%d:%02d %s", displayH, sleepMinute, amPm),
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Save & Finish Button
        Button(
            onClick = {
                val age = ageText.toIntOrNull() ?: 26
                val rawWeight = weightText.toFloatOrNull() ?: 70f
                val weightKg = if (isWeightLbs) HydrationCalculator.lbsToKg(rawWeight) else rawWeight
                val heightCm = if (isHeightFt) {
                    val ft = heightFtText.toIntOrNull() ?: 5
                    val inch = heightInText.toIntOrNull() ?: 9
                    HydrationCalculator.ftInToCm(ft, inch)
                } else {
                    heightCmText.toFloatOrNull() ?: 175f
                }
                val steps = stepCountText.toIntOrNull() ?: 7500

                val profile = UserProfile(
                    age = age,
                    weightKg = weightKg,
                    isWeightLbs = isWeightLbs,
                    heightCm = heightCm,
                    isHeightFt = isHeightFt,
                    gender = gender,
                    activityLevel = activityLevel,
                    stepCount = steps,
                    wakeHour = wakeHour,
                    wakeMinute = wakeMinute,
                    sleepHour = sleepHour,
                    sleepMinute = sleepMinute,
                    dailyGoalMl = calculatedGoal,
                    isSetupCompleted = true,
                    soundOption = initialProfile?.soundOption ?: "droplet",
                    remindersEnabled = true,
                    themeMode = initialProfile?.themeMode ?: "system"
                )
                onSaveProfile(profile)
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(54.dp)
                .testTag("save_profile_button"),
            shape = RoundedCornerShape(14.dp)
        ) {
            Icon(Icons.Default.WaterDrop, contentDescription = null)
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "Save Profile & Start Hydrating",
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
            )
        }

        Spacer(modifier = Modifier.height(24.dp))
    }
}
