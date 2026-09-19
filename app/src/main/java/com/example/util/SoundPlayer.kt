package com.example.util

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlin.math.PI
import kotlin.math.exp
import kotlin.math.sin

object SoundPlayer {

    enum class SoundType(val id: String, val displayName: String, val description: String) {
        DROPLET("droplet", "Water Droplet", "Crisp, soothing droplet chime"),
        GENTLE_CHIME("gentle_chime", "Gentle Chime", "Harmonious crystal bell chime"),
        OCEAN_RIPPLE("ripple", "Ocean Ripple", "Double cascading water ripples")
    }

    fun playSound(context: Context, soundType: String) {
        CoroutineScope(Dispatchers.Default).launch {
            try {
                when (soundType) {
                    SoundType.GENTLE_CHIME.id -> playGentleChime()
                    SoundType.OCEAN_RIPPLE.id -> playOceanRipple()
                    else -> playWaterDroplet()
                }
            } catch (_: Exception) {
                // Ignore audio player errors safely
            }
        }
        triggerVibration(context)
    }

    private fun playWaterDroplet() {
        val sampleRate = 44100
        val durationMs = 350
        val totalSamples = (sampleRate * durationMs) / 1000
        val pcm = ShortArray(totalSamples)

        for (i in 0 until totalSamples) {
            val t = i.toFloat() / sampleRate
            val progress = i.toFloat() / totalSamples
            // Pitch sweeps down smoothly like a droplet hitting water: 1350Hz down to 850Hz
            val freq = 1350f - (progress * 500f)
            val envelope = exp(-progress * 9f) // sharp attack, gentle decay
            val sample = sin(2.0 * PI * freq * t) * envelope
            pcm[i] = (sample * Short.MAX_VALUE * 0.75f).toInt().toShort()
        }
        playAudioBuffer(pcm, sampleRate)
    }

    private fun playGentleChime() {
        val sampleRate = 44100
        val durationMs = 600
        val totalSamples = (sampleRate * durationMs) / 1000
        val pcm = ShortArray(totalSamples)

        for (i in 0 until totalSamples) {
            val t = i.toFloat() / sampleRate
            val progress = i.toFloat() / totalSamples
            // Harmonic bell: 528 Hz (Love frequency) + 660 Hz (Major 3rd harmonic) + 792 Hz
            val envelope = exp(-progress * 5f)
            val s1 = sin(2.0 * PI * 528.0 * t) * 0.55
            val s2 = sin(2.0 * PI * 660.0 * t) * 0.35
            val s3 = sin(2.0 * PI * 792.0 * t) * 0.15
            val combined = (s1 + s2 + s3) * envelope
            pcm[i] = (combined * Short.MAX_VALUE * 0.7f).toInt().toShort()
        }
        playAudioBuffer(pcm, sampleRate)
    }

    private fun playOceanRipple() {
        val sampleRate = 44100
        val durationMs = 500
        val totalSamples = (sampleRate * durationMs) / 1000
        val pcm = ShortArray(totalSamples)

        val firstDropEnd = (totalSamples * 0.45).toInt()
        for (i in 0 until totalSamples) {
            val t = i.toFloat() / sampleRate
            val sample: Double
            if (i < firstDropEnd) {
                val progress = i.toFloat() / firstDropEnd
                val freq = 1200f - (progress * 400f)
                val envelope = exp(-progress * 7f)
                sample = sin(2.0 * PI * freq * t) * envelope * 0.65
            } else {
                val drop2Index = i - firstDropEnd
                val drop2Total = totalSamples - firstDropEnd
                val progress = drop2Index.toFloat() / drop2Total
                val freq = 1450f - (progress * 450f)
                val envelope = exp(-progress * 8f)
                sample = sin(2.0 * PI * freq * t) * envelope * 0.75
            }
            pcm[i] = (sample * Short.MAX_VALUE).toInt().toShort()
        }
        playAudioBuffer(pcm, sampleRate)
    }

    private fun playAudioBuffer(pcm: ShortArray, sampleRate: Int) {
        val minBufferSize = AudioTrack.getMinBufferSize(
            sampleRate,
            AudioFormat.CHANNEL_OUT_MONO,
            AudioFormat.ENCODING_PCM_16BIT
        )
        val bufferSize = maxOf(pcm.size * 2, minBufferSize)

        val audioTrack = AudioTrack.Builder()
            .setAudioAttributes(
                AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build()
            )
            .setAudioFormat(
                AudioFormat.Builder()
                    .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                    .setSampleRate(sampleRate)
                    .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                    .build()
            )
            .setBufferSizeInBytes(bufferSize)
            .setTransferMode(AudioTrack.MODE_STATIC)
            .build()

        audioTrack.write(pcm, 0, pcm.size)
        audioTrack.play()
        Thread.sleep(650)
        audioTrack.release()
    }

    private fun triggerVibration(context: Context) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
                val vibrator = vibratorManager?.defaultVibrator
                vibrator?.vibrate(VibrationEffect.createWaveform(longArrayOf(0, 120, 80, 160), -1))
            } else {
                @Suppress("DEPRECATION")
                val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
                @Suppress("DEPRECATION")
                vibrator?.vibrate(longArrayOf(0, 120, 80, 160), -1)
            }
        } catch (_: Exception) {
            // Ignore vibration errors
        }
    }
}
