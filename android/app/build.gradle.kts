plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.kotlin.serialization)
}

android {
    namespace = "pe.pyfgroup.app"

    // API 36 (Android 16). Google Play lo exige para envíos nuevos desde el
    // 31 de agosto de 2026. Si tu Android Studio aún no lo tiene, instálalo
    // desde el SDK Manager antes de sincronizar.
    compileSdk = 36

    defaultConfig {
        applicationId = "pe.pyfgroup.app"
        minSdk = 26
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"
    }

    buildTypes {
        debug {
            // Apunta al backend en producción. Si algún día levantas el backend
            // en local, el emulador llega a tu Mac por 10.0.2.2, no localhost.
            buildConfigField("String", "API_BASE_URL", "\"https://airbnb-pyfgroup.onrender.com/api/v1/\"")
            buildConfigField("boolean", "LOG_HTTP", "true")
        }
        release {
            buildConfigField("String", "API_BASE_URL", "\"https://airbnb-pyfgroup.onrender.com/api/v1/\"")
            // Nunca registrar cuerpos HTTP en release: ahí viajan tokens.
            buildConfigField("boolean", "LOG_HTTP", "false")

            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.activity.compose)

    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.material.icons)
    debugImplementation(libs.androidx.compose.ui.tooling)

    implementation(libs.androidx.navigation.compose)
    implementation(libs.androidx.datastore.preferences)

    implementation(libs.retrofit)
    implementation(libs.retrofit.serialization)
    implementation(libs.okhttp)
    implementation(libs.okhttp.logging)
    implementation(libs.kotlinx.serialization.json)

    implementation(libs.coil.compose)
}
