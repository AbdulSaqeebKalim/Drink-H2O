package com.example

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import com.example.util.HydrationCalculator
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class ExampleRobolectricTest {

  @Test
  fun `read string from context`() {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val appName = context.getString(R.string.app_name)
    assertEquals("Drink H2O", appName)
  }

  @Test
  fun `hydration calculator computes reasonable goal`() {
    val goal = HydrationCalculator.calculateDailyGoal(
      weightKg = 70f,
      stepCount = 7500,
      activityLevel = "medium",
      age = 26,
      gender = "male"
    )
    assertTrue("Goal should be between 2000ml and 4000ml", goal in 2000..4000)
  }
}

