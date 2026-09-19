package com.example.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme =
  darkColorScheme(
    primary = CyanNeonPrimary,
    onPrimary = CyanNeonOnPrimary,
    primaryContainer = CyanNeonContainer,
    onPrimaryContainer = CyanNeonOnContainer,
    secondary = MintTealSecondary,
    onSecondary = MintTealOnSecondary,
    secondaryContainer = MintTealContainer,
    onSecondaryContainer = MintTealOnContainer,
    background = DeepOceanNavy,
    onBackground = Color(0xFFF1F5F9),
    surface = DeepOceanSurface,
    onSurface = Color(0xFFF1F5F9),
    surfaceVariant = DeepOceanSurfaceVariant,
    onSurfaceVariant = Color(0xFF94A3B8),
  )

private val LightColorScheme =
  lightColorScheme(
    primary = OceanBluePrimary,
    onPrimary = OceanBlueOnPrimary,
    primaryContainer = OceanBlueContainer,
    onPrimaryContainer = OceanBlueOnContainer,
    secondary = TealSecondary,
    onSecondary = TealOnSecondary,
    secondaryContainer = TealContainer,
    onSecondaryContainer = TealOnContainer,
    background = WaterBackground,
    onBackground = Color(0xFF0F172A),
    surface = WaterSurface,
    onSurface = Color(0xFF0F172A),
    surfaceVariant = WaterSurfaceVariant,
    onSurfaceVariant = Color(0xFF475569),
  )

@Composable
fun DrinkH2OTheme(
  darkTheme: Boolean = isSystemInDarkTheme(),
  content: @Composable () -> Unit,
) {
  val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

  MaterialTheme(
    colorScheme = colorScheme,
    typography = Typography,
    content = content
  )
}

