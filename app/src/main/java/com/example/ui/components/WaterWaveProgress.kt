package com.example.ui.components

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.CyanNeonPrimary
import com.example.ui.theme.OceanBluePrimary
import com.example.ui.theme.WaterLevelGradEnd
import com.example.ui.theme.WaterLevelGradStart
import kotlin.math.PI
import kotlin.math.sin

@Composable
fun WaterWaveProgress(
    currentMl: Int,
    goalMl: Int,
    modifier: Modifier = Modifier,
    size: Dp = 230.dp
) {
    val progress = if (goalMl > 0) (currentMl.toFloat() / goalMl.toFloat()).coerceIn(0f, 1.25f) else 0f
    val percentInt = (progress * 100).toInt()

    // Smooth wave oscillation animation
    val infiniteTransition = rememberInfiniteTransition(label = "wave_anim")
    val waveOffset by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 2f * PI.toFloat(),
        animationSpec = infiniteRepeatable(
            animation = tween(2800, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "wave_offset"
    )

    val waveOffset2 by infiniteTransition.animateFloat(
        initialValue = 2f * PI.toFloat(),
        targetValue = 0f,
        animationSpec = infiniteRepeatable(
            animation = tween(3800, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "wave_offset_2"
    )

    Box(
        modifier = modifier
            .size(size)
            .shadow(16.dp, CircleShape, spotColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.35f))
            .clip(CircleShape)
            .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f)),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val canvasWidth = this.size.width
            val canvasHeight = this.size.height
            val waterLevelY = canvasHeight * (1f - progress.coerceIn(0.04f, 1f))

            // Back wave (semi-transparent)
            val backPath = Path()
            backPath.moveTo(0f, canvasHeight)
            backPath.lineTo(0f, waterLevelY)

            val waveHeight = 14.dp.toPx()
            val waveLength = canvasWidth

            for (x in 0..canvasWidth.toInt() step 5) {
                val radian = (x / waveLength) * 2f * PI.toFloat() + waveOffset2
                val y = waterLevelY + sin(radian) * (waveHeight * 0.75f)
                backPath.lineTo(x.toFloat(), y)
            }
            backPath.lineTo(canvasWidth, canvasHeight)
            backPath.close()

            drawPath(
                path = backPath,
                color = WaterLevelGradStart.copy(alpha = 0.45f)
            )

            // Front wave
            val frontPath = Path()
            frontPath.moveTo(0f, canvasHeight)
            frontPath.lineTo(0f, waterLevelY)

            for (x in 0..canvasWidth.toInt() step 5) {
                val radian = (x / waveLength) * 2f * PI.toFloat() + waveOffset
                val y = waterLevelY + sin(radian) * waveHeight
                frontPath.lineTo(x.toFloat(), y)
            }
            frontPath.lineTo(canvasWidth, canvasHeight)
            frontPath.close()

            drawPath(
                path = frontPath,
                brush = Brush.verticalGradient(
                    colors = listOf(
                        WaterLevelGradStart.copy(alpha = 0.85f),
                        WaterLevelGradEnd.copy(alpha = 0.95f)
                    ),
                    startY = waterLevelY,
                    endY = canvasHeight
                )
            )

            // Outer border ring
            drawCircle(
                color = WaterLevelGradStart.copy(alpha = 0.6f),
                radius = (canvasWidth / 2f) - 3f,
                style = Stroke(width = 6.dp.toPx())
            )
        }

        // Foreground stats
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                text = "$percentInt%",
                style = MaterialTheme.typography.displaySmall.copy(
                    fontWeight = FontWeight.ExtraBold,
                    letterSpacing = (-0.5).sp
                ),
                color = if (progress >= 0.55f) Color.White else MaterialTheme.colorScheme.onSurface
            )

            Text(
                text = "$currentMl / $goalMl ml",
                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                color = if (progress >= 0.55f) Color.White.copy(alpha = 0.95f) else MaterialTheme.colorScheme.primary
            )

            Spacer(modifier = Modifier.height(2.dp))

            val remaining = (goalMl - currentMl).coerceAtLeast(0)
            Text(
                text = if (remaining == 0) "Goal Achieved! 🎉" else "${remaining}ml left",
                style = MaterialTheme.typography.labelMedium,
                color = if (progress >= 0.55f) Color.White.copy(alpha = 0.85f) else MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}
