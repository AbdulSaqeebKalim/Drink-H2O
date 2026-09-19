package com.example.ui

import android.Manifest
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.asPaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.outlined.History
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.data.model.UserProfile
import com.example.ui.screens.HistoryScreen
import com.example.ui.screens.HomeScreen
import com.example.ui.screens.OnboardingScreen
import com.example.ui.screens.SettingsScreen
import com.example.ui.theme.DrinkH2OTheme
import com.example.util.SoundPlayer
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun DrinkH2OApp(
    viewModel: MainViewModel = viewModel()
) {
    val context = LocalContext.current
    val userProfile by viewModel.userProfile.collectAsStateWithLifecycle()
    val todayLogs by viewModel.todayLogs.collectAsStateWithLifecycle()
    val allLogs by viewModel.allLogs.collectAsStateWithLifecycle()
    val currentScreen by viewModel.currentScreen.collectAsStateWithLifecycle()
    val nextReminderMillis by viewModel.nextReminderTime.collectAsStateWithLifecycle()
    val bannerMessage by viewModel.inAppBannerMessage.collectAsStateWithLifecycle()

    val coroutineScope = rememberCoroutineScope()
    val snackbarHostState = remember { SnackbarHostState() }

    // Notification permission launcher for Android 13+
    val notificationPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { _ ->
        viewModel.refreshNextReminderTime()
    }

    // Determine dark theme
    val systemDark = isSystemInDarkTheme()
    val isDark = when (userProfile?.themeMode) {
        "dark" -> true
        "light" -> false
        else -> systemDark
    }

    DrinkH2OTheme(darkTheme = isDark) {
        // Auto-dismiss banner after 3 seconds
        LaunchedEffect(bannerMessage) {
            if (bannerMessage != null) {
                delay(2800)
                viewModel.dismissBanner()
            }
        }

        val isProfileSetup = userProfile != null && userProfile!!.isSetupCompleted

        if (!isProfileSetup) {
            // First time onboarding setup
            Scaffold(
                contentWindowInsets = WindowInsets.safeDrawing,
                modifier = Modifier.fillMaxSize()
            ) { paddingValues ->
                OnboardingScreen(
                    initialProfile = userProfile,
                    onSaveProfile = { newProfile ->
                        viewModel.saveProfile(newProfile)
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                            notificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
                        }
                    },
                    modifier = Modifier.padding(paddingValues)
                )
            }
        } else {
            val profile = userProfile!!

            Scaffold(
                contentWindowInsets = WindowInsets.safeDrawing,
                snackbarHost = { SnackbarHost(snackbarHostState) },
                bottomBar = {
                    NavigationBar(
                        containerColor = MaterialTheme.colorScheme.surface,
                        tonalElevation = 8.dp,
                        windowInsets = WindowInsets.navigationBars,
                        modifier = Modifier.testTag("bottom_navigation_bar")
                    ) {
                        NavigationBarItem(
                            selected = currentScreen == AppNavScreen.HOME,
                            onClick = { viewModel.navigateTo(AppNavScreen.HOME) },
                            icon = {
                                Icon(
                                    imageVector = if (currentScreen == AppNavScreen.HOME) Icons.Filled.Home else Icons.Outlined.Home,
                                    contentDescription = "Home"
                                )
                            },
                            label = { Text("Home") },
                            colors = NavigationBarItemDefaults.colors(
                                indicatorColor = MaterialTheme.colorScheme.primaryContainer,
                                selectedIconColor = MaterialTheme.colorScheme.primary,
                                selectedTextColor = MaterialTheme.colorScheme.primary
                            ),
                            modifier = Modifier.testTag("nav_home")
                        )

                        NavigationBarItem(
                            selected = currentScreen == AppNavScreen.HISTORY,
                            onClick = { viewModel.navigateTo(AppNavScreen.HISTORY) },
                            icon = {
                                Icon(
                                    imageVector = if (currentScreen == AppNavScreen.HISTORY) Icons.Filled.History else Icons.Outlined.History,
                                    contentDescription = "History"
                                )
                            },
                            label = { Text("History") },
                            colors = NavigationBarItemDefaults.colors(
                                indicatorColor = MaterialTheme.colorScheme.primaryContainer,
                                selectedIconColor = MaterialTheme.colorScheme.primary,
                                selectedTextColor = MaterialTheme.colorScheme.primary
                            ),
                            modifier = Modifier.testTag("nav_history")
                        )

                        NavigationBarItem(
                            selected = currentScreen == AppNavScreen.SETTINGS,
                            onClick = { viewModel.navigateTo(AppNavScreen.SETTINGS) },
                            icon = {
                                Icon(
                                    imageVector = if (currentScreen == AppNavScreen.SETTINGS) Icons.Filled.Settings else Icons.Outlined.Settings,
                                    contentDescription = "Settings"
                                )
                            },
                            label = { Text("Settings") },
                            colors = NavigationBarItemDefaults.colors(
                                indicatorColor = MaterialTheme.colorScheme.primaryContainer,
                                selectedIconColor = MaterialTheme.colorScheme.primary,
                                selectedTextColor = MaterialTheme.colorScheme.primary
                            ),
                            modifier = Modifier.testTag("nav_settings")
                        )
                    }
                },
                modifier = Modifier.fillMaxSize()
            ) { paddingValues ->
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues)
                ) {
                    when (currentScreen) {
                        AppNavScreen.HOME -> {
                            HomeScreen(
                                profile = profile,
                                todayLogs = todayLogs,
                                nextReminderMillis = nextReminderMillis,
                                onLogWater = { amount, note ->
                                    viewModel.logWater(amount, note)
                                },
                                onSnooze = { minutes ->
                                    viewModel.snoozeReminder(minutes)
                                },
                                onTriggerTestReminder = {
                                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                                        notificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
                                    }
                                    viewModel.triggerTestReminder()
                                },
                                onNavigateToSettings = {
                                    viewModel.navigateTo(AppNavScreen.SETTINGS)
                                }
                            )
                        }

                        AppNavScreen.HISTORY -> {
                            HistoryScreen(
                                profile = profile,
                                allLogs = allLogs,
                                onDeleteLog = { id -> viewModel.deleteLog(id) }
                            )
                        }

                        AppNavScreen.SETTINGS -> {
                            SettingsScreen(
                                profile = profile,
                                onSaveProfile = { updated ->
                                    viewModel.saveProfile(updated)
                                },
                                onClearToday = {
                                    viewModel.clearToday()
                                },
                                onTestSound = { soundId ->
                                    SoundPlayer.playSound(context, soundId)
                                }
                            )
                        }
                    }

                    // Floating In-App Feedback Banner
                    AnimatedVisibility(
                        visible = bannerMessage != null,
                        enter = slideInVertically(initialOffsetY = { -it }) + fadeIn(),
                        exit = slideOutVertically(targetOffsetY = { -it }) + fadeOut(),
                        modifier = Modifier
                            .align(Alignment.TopCenter)
                            .padding(top = 12.dp, start = 20.dp, end = 20.dp)
                    ) {
                        Card(
                            colors = CardDefaults.cardColors(
                                containerColor = MaterialTheme.colorScheme.primary
                            ),
                            elevation = CardDefaults.cardElevation(defaultElevation = 6.dp),
                            shape = MaterialTheme.shapes.medium,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = bannerMessage ?: "",
                                color = MaterialTheme.colorScheme.onPrimary,
                                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                                modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}
