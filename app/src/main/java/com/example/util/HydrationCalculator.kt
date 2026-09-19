package com.example.util

import kotlin.math.roundToInt

object HydrationCalculator {

    /**
     * Standard hydration formula:
     * - Base: ~35ml per kg of body weight
     * - Step count / activity adjustments:
     *     Low (< 5,000 steps): +150ml
     *     Medium (5,000 - 9,999 steps): +400ml
     *     High (10,000+ steps): +750ml
     *     Or custom step formula: +100ml per 1,000 steps above 3,000
     * - Gender adjustment:
     *     Male: +250ml (higher average muscle mass)
     *     Female: standard baseline
     *     Other: +100ml
     * - Age adjustment:
     *     < 30: +150ml (higher metabolic rate)
     *     30 - 55: baseline
     *     > 55: -100ml (kidney fluid sensitivity)
     */
    fun calculateDailyGoal(
        weightKg: Float,
        stepCount: Int,
        activityLevel: String,
        age: Int,
        gender: String
    ): Int {
        val safeWeight = weightKg.coerceIn(30f, 200f)
        val base = (safeWeight * 35f).roundToInt()

        val stepAdjustment = if (stepCount > 0) {
            val extraSteps = (stepCount - 3000).coerceAtLeast(0)
            ((extraSteps / 1000f) * 100f).roundToInt()
        } else {
            when (activityLevel.lowercase()) {
                "high" -> 750
                "medium" -> 400
                else -> 150
            }
        }

        val genderAdjustment = when (gender.lowercase()) {
            "male" -> 250
            "female" -> 0
            else -> 100
        }

        val ageAdjustment = when {
            age in 1..29 -> 150
            age in 30..55 -> 0
            else -> -100
        }

        val calculated = base + stepAdjustment + genderAdjustment + ageAdjustment
        // Clamp to sensible range: 1200ml to 5000ml, rounded to nearest 50ml
        val rounded = ((calculated + 25) / 50) * 50
        return rounded.coerceIn(1200, 5000)
    }

    fun lbsToKg(lbs: Float): Float = lbs * 0.45359237f
    fun kgToLbs(kg: Float): Float = kg / 0.45359237f

    fun cmToFtIn(cm: Float): Pair<Int, Int> {
        val totalInches = (cm / 2.54f).roundToInt()
        val feet = totalInches / 12
        val inches = totalInches % 12
        return Pair(feet, inches)
    }

    fun ftInToCm(feet: Int, inches: Int): Float {
        return (feet * 12 + inches) * 2.54f
    }
}
