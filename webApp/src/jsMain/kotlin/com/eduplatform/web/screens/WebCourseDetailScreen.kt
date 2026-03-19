package com.eduplatform.web.screens

import androidx.compose.runtime.*
import com.eduplatform.presentation.viewmodel.*
import org.jetbrains.compose.web.attributes.*
import org.jetbrains.compose.web.css.*
import org.jetbrains.compose.web.dom.*
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject

@Composable
fun WebCourseDetailScreen(courseId: String, onNav: (String) -> Unit) {
    val koin = object : KoinComponent {}
    val authVM: AuthViewModel by koin.inject()
    val courseVM: CourseViewModel by koin.inject()
    val lessonVM: LessonViewModel by koin.inject()

    val authState by authVM.state.collectAsState()
    val courseState by courseVM.state.collectAsState()
    val lessonState by lessonVM.state.collectAsState()

    val userId = authState.currentUser?.id ?: ""
    val course = courseState.courses.find { it.id == courseId }
    val isEnrolled = courseId in courseState.enrolledCourseIds

    LaunchedEffect(courseId, userId) {
        if (courseState.courses.isEmpty()) {
            courseVM.onIntent(CourseIntent.Load)
        }
        if (userId.isNotEmpty()) {
            courseVM.onIntent(CourseIntent.LoadUserEntries(userId))
            lessonVM.onIntent(LessonIntent.Load(userId, courseId))
        }
    }

    Div({
        style {
            maxWidth(1000.px)
            property("margin", "0 auto")
            paddingTop(40.px)
        }
    }) {

        Div({
            style {
                display(DisplayStyle.Flex)
                gap(32.px)
            }
        }) {
            // Main Content (Left)
            Div({ style { flex(7) } }) {
                Img(src = course?.thumbnailUrl ?: "", attrs = {
                    style {
                        width(100.percent)
                        height(400.px)
                        borderRadius(16.px)
                        property("object-fit", "cover")
                        marginBottom(24.px)
                    }
                })

                H1({ style { marginBottom(12.px) } }) { Text(course?.title ?: "") }
                
                Div({ style { display(DisplayStyle.Flex); gap(12.px); marginBottom(24.px) } }) {
                    Span({ style { color(Color("#4F46E5")); fontWeight(600) } }) { Text(course?.category ?: "") }
                    Span({ style { color(Color("#64748B")) } }) { Text("•") }
                    Span({ style { color(Color("#64748B")) } }) { Text("${course?.durationMinutes} dakika") }
                }

                Div({
                    style {
                        backgroundColor(Color("#F8FAFC"))
                        padding(24.px)
                        borderRadius(16.px)
                        marginBottom(32.px)
                        property("border", "1px solid #E2E8F0")
                    }
                }) {
                    H3({ style { marginBottom(12.px); color(Color("#4F46E5")); fontWeight(700) } }) { Text("Eğitim Hakkında") }
                    P({ style { property("line-height", "1.6"); color(Color("#475569")); margin(0.px) } }) {
                        Text(course?.description ?: "Bu eğitim için henüz bir açıklama girilmemiş.")
                    }
                }

                H3({ style { marginBottom(16.px) } }) { Text("Eğitim İçeriği") }
                Div({
                    style {
                        backgroundColor(Color.white)
                        borderRadius(12.px)
                        border(1.px, LineStyle.Solid, Color("#E2E8F0"))
                        overflow("hidden")
                    }
                }) {
                    lessonState.lessons.forEachIndexed { index, lesson ->
                        Div({
                            style {
                                padding(16.px)
                                display(DisplayStyle.Flex)
                                alignItems(AlignItems.Center)
                                gap(12.px)
                                if (index < lessonState.lessons.lastIndex) {
                                    property("border-bottom", "1px solid #E2E8F0")
                                }
                                cursor(if (isEnrolled) "pointer" else "default")
                                backgroundColor(if (isEnrolled) Color.white else Color("#F8FAFC"))
                            }
                            if (isEnrolled) {
                                onClick { onNav("/lesson/${lesson.id}/$courseId") }
                            }
                        }) {
                            Span({ style { fontWeight(600); color(Color("#94A3B8")); width(24.px) } }) { Text("${index + 1}") }
                            Div({ style { flex(1) } }) {
                                Div({ style { fontWeight(500); color(if (isEnrolled) Color("#1E293B") else Color("#94A3B8")) } }) { Text(lesson.title) }
                                Div({ style { fontSize(12.px); color(Color("#64748B")) } }) { 
                                    Text(if (lesson.contentType == "video") "Video Ders" else "Okuma Parçası") 
                                }
                            }
                            if (lesson.id in lessonState.completedLessonIds) {
                                Span({ style { color(Color("#10B981")); fontWeight(700) } }) { Text("✓") }
                            }
                        }
                    }
                }
            }

            // Side Panel (Right)
            Div({ style { flex(3) } }) {
                Div({
                    style {
                        position(Position.Sticky)
                        top(24.px)
                        padding(24.px)
                        backgroundColor(Color.white)
                        borderRadius(16.px)
                        property("box-shadow", "0 4px 6px -1px rgba(0, 0, 0, 0.1)")
                    }
                }) {
                    H4({ style { marginBottom(8.px) } }) { Text("Eğitmen") }
                    Div({ style { fontWeight(600); marginBottom(24.px) } }) { Text(course?.instructorName ?: "") }

                    if (!isEnrolled) {
                        Button({
                            style {
                                width(100.percent)
                                padding(14.px)
                                backgroundColor(Color("#4F46E5"))
                                color(Color.white)
                                border(0.px)
                                borderRadius(8.px)
                                fontWeight(600)
                                cursor("pointer")
                            }
                            onClick { 
                                if (authState.isLoggedIn) {
                                    courseVM.onIntent(CourseIntent.Enroll(userId, courseId)) 
                                } else {
                                    onNav("/login")
                                }
                            }
                        }) {
                            if (courseState.enrollingCourseId == courseId) Text("Kaydediliyor...")
                            else Text("Eğitime Kayıt Ol")
                        }
                    } else {
                        Div({
                            style {
                                padding(12.px)
                                backgroundColor(Color("#F0FDF4"))
                                color(Color("#16A34A"))
                                borderRadius(8.px)
                                textAlign("center")
                                fontWeight(600)
                                marginBottom(16.px)
                            }
                        }) { Text("Kayıtlısınız") }

                        if (course?.hasCertificate == true) {
                            Button({
                                style {
                                    width(100.percent)
                                    padding(14.px)
                                    backgroundColor(Color.white)
                                    color(Color("#4F46E5"))
                                    border(2.px, LineStyle.Solid, Color("#4F46E5"))
                                    borderRadius(8.px)
                                    fontWeight(600)
                                    cursor("pointer")
                                }
                                onClick { onNav("/quiz/$courseId") }
                            }) { Text("Sertifika Sınavına Gir") }
                        }
                    }
                }
            }
        }
    }
}
