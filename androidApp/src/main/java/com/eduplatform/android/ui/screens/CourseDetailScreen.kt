package com.eduplatform.android.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavHostController
import coil.compose.AsyncImage
import com.eduplatform.android.navigation.Screen
import com.eduplatform.android.ui.components.EduButton
import com.eduplatform.android.ui.theme.Tertiary
import com.eduplatform.presentation.viewmodel.*
import org.koin.compose.koinInject
import org.koin.core.parameter.parametersOf

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CourseDetailScreen(courseId: String, navController: NavHostController) {
    val courseVM: CourseViewModel = koinInject()
    val lessonVM: LessonViewModel = koinInject()
    val authVM: AuthViewModel = koinInject()

    val authState by authVM.state.collectAsStateWithLifecycle()
    val courseState by courseVM.state.collectAsStateWithLifecycle()
    val lessonState by lessonVM.state.collectAsStateWithLifecycle()

    val userId = authState.currentUser?.id ?: ""

    LaunchedEffect(courseId, userId) {
        if (courseState.courses.isEmpty()) {
            courseVM.onIntent(CourseIntent.Load)
        }
        if (userId.isNotEmpty()) {
            courseVM.onIntent(CourseIntent.LoadUserEntries(userId))
            lessonVM.onIntent(LessonIntent.Load(userId, courseId))
        }
    }

    val course = courseState.courses.firstOrNull { it.id == courseId }
    val isEnrolled = courseId in courseState.enrolledCourseIds

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(course?.title ?: "Eğitim Detayı") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Geri")
                    }
                }
            )
        },
        bottomBar = {
            Surface(tonalElevation = 8.dp) {
                Column(modifier = Modifier.padding(16.dp)) {
                    if (!isEnrolled) {
                        EduButton(
                            text = "Eğitime Kayıt Ol",
                            modifier = Modifier.fillMaxWidth(),
                            isLoading = courseState.enrollingCourseId == courseId,
                            onClick = { courseVM.onIntent(CourseIntent.Enroll(userId, courseId)) }
                        )
                    } else if (course?.hasCertificate == true) {
                        EduButton(
                            text = "Sertifika Sınavına Gir",
                            modifier = Modifier.fillMaxWidth(),
                            outlined = true,
                            onClick = { navController.navigate(Screen.Quiz.go(courseId)) }
                        )
                    }
                }
            }
        }
    ) { padding ->
        LazyColumn(modifier = Modifier.padding(padding)) {
            item {
                AsyncImage(
                    model = course?.thumbnailUrl,
                    contentDescription = null,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(220.dp),
                    contentScale = ContentScale.Crop
                )
            }

            item {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        SuggestionChip(onClick = {}, label = { Text(course?.category ?: "") })
                        SuggestionChip(
                            onClick = {},
                            label = { Text("${course?.durationMinutes} dk") },
                            icon = { Icon(Icons.Default.Timer, null, modifier = Modifier.size(16.dp)) }
                        )
                    }
                    
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    Text(
                        text = course?.title ?: "",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold
                    )
                    
                    Text(
                        text = "Eğitmen: ${course?.instructorName}",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.primary
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Card(
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f)),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                text = "Eğitim Hakkında",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.primary
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = course?.description ?: "Bu eğitim için henüz bir açıklama girilmemiş.",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Button(
                            onClick = { /* Scroll to lessons or already here */ },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.secondaryContainer, contentColor = MaterialTheme.colorScheme.onSecondaryContainer)
                        ) {
                            Icon(Icons.Default.List, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Dersler")
                        }

                        if (isEnrolled && course?.hasCertificate == true) {
                            Button(
                                onClick = { navController.navigate(Screen.Quiz.go(courseId)) },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Icon(Icons.Default.Quiz, contentDescription = null, modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Sınav")
                            }
                        }
                    }
                }
            }

            item {
                Text(
                    text = "Eğitim İçeriği",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(start = 16.dp, end = 16.dp, top = 16.dp, bottom = 8.dp)
                )
            }

            items(lessonState.lessons) { lesson ->
                ListItem(
                    headlineContent = { Text(lesson.title) },
                    supportingContent = { Text(if (lesson.contentType == "video") "Video Ders" else "Metin İçerik") },
                    leadingContent = {
                        Icon(
                            imageVector = if (lesson.contentType == "video") Icons.Default.PlayCircle else Icons.Default.Article,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary
                        )
                    },
                    trailingContent = {
                        if (lesson.id in lessonState.completedLessonIds) {
                            Icon(Icons.Default.CheckCircle, contentDescription = "Tamamlandı", tint = Tertiary)
                        }
                    },
                    modifier = Modifier.clickable(enabled = isEnrolled) {
                        navController.navigate(Screen.LessonPlayer.go(lesson.id, courseId))
                    }
                )
                HorizontalDivider(modifier = Modifier.padding(horizontal = 16.dp), thickness = 0.5.dp)
            }
            
            item { Spacer(modifier = Modifier.height(100.dp)) }
        }
    }
}
