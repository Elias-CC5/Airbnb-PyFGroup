# kotlinx.serialization genera serializadores en tiempo de compilación; R8 no
# debe eliminarlos ni renombrarlos o las respuestas de la API fallan al parsear.
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.**
-keepclassmembers class pe.pyfgroup.app.** {
    *** Companion;
}
-keepclasseswithmembers class pe.pyfgroup.app.** {
    kotlinx.serialization.KSerializer serializer(...);
}

# Retrofit conserva las firmas genéricas de las interfaces.
-keepattributes Signature
-keep,allowobfuscation,allowshrinking interface retrofit2.Call
-keep,allowobfuscation,allowshrinking class retrofit2.Response
-keep,allowobfuscation,allowshrinking class kotlin.coroutines.Continuation
