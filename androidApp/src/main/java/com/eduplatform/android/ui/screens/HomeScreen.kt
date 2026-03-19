package com.eduplatform.android.ui.screens

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavHostController
import coil.compose.AsyncImage
import com.eduplatform.android.navigation.Screen
import com.eduplatform.presentation.viewmodel.CourseIntent
import com.eduplatform.presentation.viewmodel.CourseViewModel
import com.eduplatform.presentation.viewmodel.AuthViewModel
import org.koin.compose.koinInject

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(navController: NavHostController) {
    val vm: CourseViewModel = koinInject()
    val authVM: AuthViewModel = koinInject()
    val state by vm.state.collectAsStateWithLifecycle()
    val authState by authVM.state.collectAsStateWithLifecycle()

    LaunchedEffect(Unit) {
        vm.onIntent(CourseIntent.Load)
    }

    Scaffold(
        containerColor = Color.White
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
        ) {
            // 1. Header: Logo, Bildirim ve Profil İkonu (Login'e Bağlı)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Surface(
                        color = Color(0xFF3B82F6),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier
                            .size(40.dp)
                            .clickable { navController.navigate(Screen.Admin.route) } // GEÇİCİ: Admin Sayfasına Bağlandı
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(Icons.Default.School, null, tint = Color.White, modifier = Modifier.size(24.dp))
                        }
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Text("EduPlatform", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = Color(0xFF1E293B))
                }
                
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(onClick = { }) {
                        Icon(Icons.Default.Notifications, null, tint = Color(0xFF64748B))
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    
                    // PROFİL İKONU -> Login Sayfasına Yönlendirir
                    Surface(
                        modifier = Modifier
                            .size(36.dp)
                            .clickable { navController.navigate(Screen.Login.route) },
                        shape = CircleShape,
                        color = if (authState.isLoggedIn) Color(0xFFFFCCBC) else Color(0xFFE2E8F0)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(
                                imageVector = if (authState.isLoggedIn) Icons.Default.Person else Icons.Default.Login, 
                                contentDescription = "Giriş Yap", 
                                tint = if (authState.isLoggedIn) Color.White else Color(0xFF64748B), 
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }
                }
            }

            // 2. Arama Çubuğu
            OutlinedTextField(
                value = "",
                onValueChange = { },
                placeholder = { Text("Ne öğrenmek istersiniz?", color = Color(0xFF94A3B8), fontSize = 14.sp) },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
                    .height(52.dp),
                leadingIcon = { Icon(Icons.Default.Search, null, tint = Color(0xFF94A3B8)) },
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    unfocusedContainerColor = Color(0xFFF8FAFC),
                    focusedContainerColor = Color(0xFFF8FAFC),
                    unfocusedBorderColor = Color(0xFFF1F5F9),
                    focusedBorderColor = Color(0xFF3B82F6)
                ),
                singleLine = true
            )

            Spacer(modifier = Modifier.height(24.dp))

            // HomeScreen'den ÜST BANNER KALDIRILDI (Sadece LandingScreen'de olacak)

            // 3. Kategoriler
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(start = 20.dp, end = 20.dp, top = 8.dp, bottom = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Kategoriler", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = Color(0xFF1E293B))
                Text("Hepsini Gör", color = Color(0xFF3B82F6), fontSize = 14.sp, fontWeight = FontWeight.Medium)
            }

            val categories = listOf(
                CategoryItem("Yazılım", Icons.Default.Code),
                CategoryItem("Tasarım", Icons.Default.Palette),
                CategoryItem("Pazarlama", Icons.Default.TrendingUp),
                CategoryItem("Finans", Icons.Default.Payments)
            )

            LazyRow(
                contentPadding = PaddingValues(horizontal = 20.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(categories) { cat ->
                    CategoryChip(cat.title, cat.icon, cat.title == "Yazılım")
                }
            }

            // 4. Popüler Kurslar (2'li Grid)
            Text(
                "Popüler Eğitimler", 
                fontWeight = FontWeight.Bold, 
                fontSize = 18.sp,
                color = Color(0xFF1E293B),
                modifier = Modifier.padding(start = 20.dp, end = 20.dp, top = 24.dp, bottom = 16.dp)
            )

            if (state.isLoading) {
                Box(Modifier.fillMaxWidth().height(200.dp), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Color(0xFF3B82F6))
                }
            } else {
                Column(modifier = Modifier.padding(horizontal = 20.dp)) {
                    state.filteredCourses.chunked(2).forEach { rowCourses ->
                        Row(
                            modifier = Modifier.fillMaxWidth(), 
                            horizontalArrangement = Arrangement.spacedBy(16.dp)
                        ) {
                            rowCourses.forEach { course ->
                                Box(modifier = Modifier.weight(1f)) {
                                    CourseGridItem(course) { 
                                        navController.navigate(Screen.CourseDetail.go(course.id)) 
                                    }
                                }
                            }
                            if (rowCourses.size == 1) Spacer(modifier = Modifier.weight(1f))
                        }
                        Spacer(modifier = Modifier.height(20.dp))
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(100.dp))
        }
    }
}

data class CategoryItem(val title: String, val icon: ImageVector)

@Composable
fun CategoryChip(title: String, icon: ImageVector, isSelected: Boolean) {
    Surface(
        color = if (isSelected) Color(0xFF3B82F6) else Color(0xFFF1F5F9),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier.height(40.dp)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                icon, 
                null, 
                tint = if (isSelected) Color.White else Color(0xFF64748B), 
                modifier = Modifier.size(16.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                title, 
                color = if (isSelected) Color.White else Color(0xFF1E293B), 
                fontWeight = FontWeight.Medium,
                fontSize = 13.sp
            )
        }
    }
}

@Composable
fun CourseGridItem(course: com.eduplatform.domain.model.Course, onClick: () -> Unit) {
    Card(
        onClick = onClick,
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFFF8FAFC)),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column {
            AsyncImage(
                model = course.thumbnailUrl,
                contentDescription = null,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(100.dp),
                contentScale = ContentScale.Crop
            )
            
            Column(modifier = Modifier.padding(8.dp)) {
                Text(
                    course.title, 
                    fontWeight = FontWeight.Bold, 
                    fontSize = 13.sp, 
                    maxLines = 1,
                    color = Color(0xFF1E293B)
                )
                
                Spacer(modifier = Modifier.height(4.dp))
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Star, null, tint = Color(0xFFFFB300), modifier = Modifier.size(12.dp))
                        Text(" 4.8", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF64748B))
                    }
                    Text(
                        "Ücretsiz", 
                        color = Color(0xFF10B981), 
                        fontWeight = FontWeight.Bold, 
                        fontSize = 12.sp
                    )
                }
            }
        }
    }
}
