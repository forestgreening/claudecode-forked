# 우리, 여기. - 기술 구현 계획서 (v2 - Revised)

> Flutter 기반 커플 추억 지도 앱 MVP 구현 계획
>
> **Revision Note**: Momus 검토 피드백 반영 (보안, 오프라인, 성능 SLA 등)

---

## 1. 요구사항 요약

### 1.1 프로젝트 정보
| 항목 | 값 |
|------|-----|
| 앱 이름 | 우리, 여기. |
| 프로젝트명 | `woori_yeogi` |
| 패키지명 | `com.sm.wooriyeogi` |
| 플랫폼 | iOS, Android |

### 1.2 MVP 기능 범위
| 우선순위 | 기능 | 설명 |
|----------|------|------|
| P0 | 추억 핀 찍기 | 지도에 장소 + 사진 + 메모 기록 |
| P0 | 커플 연결 | 초대 코드로 파트너 연결 |
| P1 | 추억 타임라인 | 시간순 목록 보기 |
| P1 | 기념일 알림 | 기념일 등록 및 푸시 알림 |
| P1 | 추억 검색 | 장소명, 날짜로 검색 |
| P1 | 통계 | 방문 장소 수, 인기 장소 등 |

### 1.3 Acceptance Criteria (구체화)

#### AC-1: 추억 핀 찍기
- [ ] 지도에서 위치 선택 가능 (GPS 정확도: 10m 이내)
- [ ] 현재 위치 버튼 클릭 시 3초 이내 위치 획득
- [ ] 사진 최대 10장 첨부 가능 (각 사진 최대 10MB, 자동 압축)
- [ ] 메모 작성 가능 (최대 1000자, 실시간 글자수 표시)
- [ ] 카테고리 선택 가능 (카페, 식당, 여행, 산책, 기타)
- [ ] 날짜 선택 가능 (과거 날짜 포함, 미래 날짜 불가)
- [ ] 저장 시 지도에 핀으로 즉시 표시 (1초 이내)
- [ ] 사진 업로드 실패 시 재시도 옵션 제공

#### AC-2: 커플 연결
- [ ] 회원가입 후 8자리 영숫자 초대 코드 자동 생성
- [ ] 초대 코드 중복 시 자동 재생성 (최대 3회 시도)
- [ ] 파트너가 코드 입력 시 500ms 이내 연결 완료
- [ ] 연결 후 모든 추억 실시간 동기화 (지연 시간 2초 이내)
- [ ] 커플 프로필 설정 (사귄 날짜, 커플명 최대 20자)

#### AC-3: 타임라인
- [ ] 추억을 시간순으로 목록 표시 (최신순 기본)
- [ ] 월별/연도별 필터 가능 (필터 적용 500ms 이내)
- [ ] 지도 뷰 ↔ 타임라인 뷰 전환 (전환 시간 300ms 이내)
- [ ] 무한 스크롤 (한 번에 20개씩 로드)

#### AC-4: 기념일 알림
- [ ] 기념일 등록 (제목 최대 30자, 날짜 필수)
- [ ] D-day / D+ 정확한 계산 및 표시
- [ ] 당일 오전 9시 푸시 알림 발송
- [ ] 1일 전, 7일 전 사전 알림 선택 가능

#### AC-5: 추억 검색
- [ ] 장소명으로 검색 (부분 일치, 한글 초성 검색 지원)
- [ ] 날짜 범위로 검색 (시작일 ~ 종료일)
- [ ] 카테고리로 필터 (복수 선택 가능)
- [ ] 검색 결과 500ms 이내 표시

#### AC-6: 통계
- [ ] 총 방문 장소 수 정확히 표시
- [ ] 가장 많이 간 장소 TOP 5 (동일 위치 50m 이내 병합)
- [ ] 월별 데이트 횟수 막대 그래프 (최근 12개월)

---

## 2. 기술 스택

### 2.1 프론트엔드
| 기술 | 버전 | 용도 |
|------|------|------|
| Flutter | 3.16.0 | 크로스플랫폼 프레임워크 |
| Dart | 3.2.0 | 프로그래밍 언어 |
| flutter_riverpod | ^2.4.9 | 상태 관리 |
| flutter_naver_map | ^1.0.2 | 네이버 지도 |
| go_router | ^12.1.3 | 라우팅 |
| freezed | ^2.4.6 | 불변 모델 생성 |
| image_picker | ^1.0.7 | 사진 선택 |
| cached_network_image | ^3.3.1 | 이미지 캐싱 |
| intl | ^0.18.1 | 날짜/시간 포맷 |
| fl_chart | ^0.65.0 | 통계 차트 |
| connectivity_plus | ^5.0.2 | 네트워크 상태 감지 |
| flutter_image_compress | ^2.1.0 | 이미지 압축 |

### 2.2 백엔드 (Firebase)
| 서비스 | 용도 |
|--------|------|
| Firebase Auth | 인증 (이메일, Google, Apple, 카카오, 네이버) |
| Cloud Firestore | 데이터베이스 (오프라인 캐시 활성화) |
| Firebase Storage | 사진 저장 |
| Firebase Cloud Messaging | 푸시 알림 |
| Cloud Functions | 알림 스케줄링, 백엔드 로직 |
| Firebase Analytics | 사용자 분석 |
| Firebase Crashlytics | 크래시 리포트 |

### 2.3 외부 API
| API | 용도 |
|-----|------|
| Naver Maps API | 지도 표시, 장소 검색 |
| Kakao OAuth | 카카오 로그인 |
| Naver OAuth | 네이버 로그인 |

---

## 3. 프로젝트 구조

```
woori_yeogi/
├── android/                    # Android 네이티브 설정
├── ios/                        # iOS 네이티브 설정
├── functions/                  # Firebase Cloud Functions
│   ├── src/
│   │   ├── index.ts           # 함수 진입점
│   │   ├── notifications.ts   # 푸시 알림 스케줄링
│   │   └── couples.ts         # 커플 관련 함수
│   ├── package.json
│   └── tsconfig.json
├── lib/
│   ├── main.dart              # 앱 진입점
│   ├── app.dart               # MaterialApp 설정
│   │
│   ├── core/                  # 핵심 유틸리티
│   │   ├── constants/
│   │   │   ├── app_colors.dart
│   │   │   ├── app_strings.dart
│   │   │   ├── app_sizes.dart
│   │   │   └── app_config.dart    # 설정 상수
│   │   ├── extensions/
│   │   │   ├── date_extension.dart
│   │   │   └── string_extension.dart
│   │   ├── utils/
│   │   │   ├── validators.dart
│   │   │   ├── helpers.dart
│   │   │   ├── image_compressor.dart  # 이미지 압축
│   │   │   └── invite_code_generator.dart  # 초대 코드 생성
│   │   ├── errors/
│   │   │   ├── failures.dart
│   │   │   └── error_handler.dart  # 전역 에러 처리
│   │   └── network/
│   │       └── connectivity_service.dart  # 네트워크 상태
│   │
│   ├── data/
│   │   ├── models/
│   │   │   ├── user_model.dart
│   │   │   ├── couple_model.dart
│   │   │   ├── memory_model.dart
│   │   │   ├── anniversary_model.dart
│   │   │   └── place_model.dart
│   │   ├── repositories/
│   │   │   ├── auth_repository.dart
│   │   │   ├── couple_repository.dart
│   │   │   ├── memory_repository.dart
│   │   │   └── anniversary_repository.dart
│   │   └── datasources/
│   │       ├── firebase_auth_datasource.dart
│   │       ├── firestore_datasource.dart
│   │       ├── storage_datasource.dart
│   │       └── fcm_datasource.dart
│   │
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── user.dart
│   │   │   ├── couple.dart
│   │   │   ├── memory.dart
│   │   │   └── anniversary.dart
│   │   └── usecases/
│   │       ├── auth/
│   │       ├── couple/
│   │       ├── memory/
│   │       └── anniversary/
│   │
│   ├── presentation/
│   │   ├── providers/
│   │   │   ├── auth_provider.dart
│   │   │   ├── couple_provider.dart
│   │   │   ├── memory_provider.dart
│   │   │   ├── anniversary_provider.dart
│   │   │   ├── statistics_provider.dart
│   │   │   ├── search_provider.dart
│   │   │   └── connectivity_provider.dart  # 네트워크 상태
│   │   ├── screens/
│   │   │   ├── splash/
│   │   │   ├── onboarding/
│   │   │   ├── auth/
│   │   │   │   ├── login_screen.dart
│   │   │   │   ├── register_screen.dart
│   │   │   │   └── widgets/
│   │   │   ├── couple/
│   │   │   │   ├── couple_connect_screen.dart
│   │   │   │   ├── couple_profile_screen.dart
│   │   │   │   └── widgets/
│   │   │   ├── home/
│   │   │   │   ├── home_screen.dart
│   │   │   │   ├── map_view.dart
│   │   │   │   └── widgets/
│   │   │   ├── memory/
│   │   │   │   ├── memory_detail_screen.dart
│   │   │   │   ├── memory_create_screen.dart
│   │   │   │   ├── memory_timeline_screen.dart
│   │   │   │   └── widgets/
│   │   │   ├── anniversary/
│   │   │   │   ├── anniversary_list_screen.dart
│   │   │   │   ├── anniversary_create_screen.dart
│   │   │   │   └── widgets/
│   │   │   ├── search/
│   │   │   │   ├── search_screen.dart
│   │   │   │   └── widgets/
│   │   │   ├── statistics/
│   │   │   │   ├── statistics_screen.dart
│   │   │   │   └── widgets/
│   │   │   └── settings/
│   │   │       ├── settings_screen.dart
│   │   │       └── widgets/
│   │   └── widgets/
│   │       ├── common/
│   │       │   ├── app_button.dart
│   │       │   ├── app_text_field.dart
│   │       │   ├── app_loading.dart
│   │       │   ├── app_error.dart
│   │       │   └── offline_banner.dart  # 오프라인 표시
│   │       └── memory/
│   │           ├── memory_card.dart
│   │           └── memory_pin.dart
│   │
│   ├── router/
│   │   └── app_router.dart
│   │
│   └── firebase_options.dart
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── test/
│   ├── unit/
│   ├── widget/
│   └── integration/
│
├── firestore.rules              # Firestore 보안 규칙
├── storage.rules                # Storage 보안 규칙
├── pubspec.yaml
├── analysis_options.yaml
└── README.md
```

---

## 4. 데이터 모델 (Firestore)

### 4.1 컬렉션 구조

```
firestore/
├── users/
│   └── {userId}/
│       ├── email: string
│       ├── displayName: string
│       ├── photoUrl: string?
│       ├── coupleId: string?
│       ├── inviteCode: string (8자리, unique)
│       ├── fcmToken: string?           # FCM 토큰
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
│
├── inviteCodes/                        # 초대 코드 인덱스 (중복 방지)
│   └── {inviteCode}/
│       └── userId: string
│
├── couples/
│   └── {coupleId}/
│       ├── user1Id: string
│       ├── user2Id: string
│       ├── coupleName: string?
│       ├── startDate: timestamp
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
│
├── memories/
│   └── {memoryId}/
│       ├── coupleId: string
│       ├── createdBy: string
│       ├── title: string
│       ├── content: string?
│       ├── category: string
│       ├── date: timestamp
│       ├── location: geopoint
│       ├── placeName: string
│       ├── address: string
│       ├── photos: array<string>
│       ├── photoCount: number          # 사진 수 (쿼리용)
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
│
└── anniversaries/
    └── {anniversaryId}/
        ├── coupleId: string
        ├── title: string
        ├── date: timestamp
        ├── isRecurring: boolean
        ├── notifyDaysBefore: array<number>  # [0, 1, 7]
        ├── lastNotifiedYear: number?    # 중복 알림 방지
        ├── createdAt: timestamp
        └── updatedAt: timestamp
```

### 4.2 Dart 모델

#### User Model
```dart
// lib/data/models/user_model.dart
@freezed
class UserModel with _$UserModel {
  const factory UserModel({
    required String id,
    required String email,
    required String displayName,
    String? photoUrl,
    String? coupleId,
    required String inviteCode,
    String? fcmToken,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _UserModel;

  factory UserModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return UserModel(
      id: doc.id,
      email: data['email'] ?? '',
      displayName: data['displayName'] ?? '',
      photoUrl: data['photoUrl'],
      coupleId: data['coupleId'],
      inviteCode: data['inviteCode'] ?? '',
      fcmToken: data['fcmToken'],
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      updatedAt: (data['updatedAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'email': email,
      'displayName': displayName,
      'photoUrl': photoUrl,
      'coupleId': coupleId,
      'inviteCode': inviteCode,
      'fcmToken': fcmToken,
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': Timestamp.fromDate(updatedAt),
    };
  }
}
```

#### Memory Model
```dart
// lib/data/models/memory_model.dart
@freezed
class MemoryModel with _$MemoryModel {
  const factory MemoryModel({
    required String id,
    required String coupleId,
    required String createdBy,
    required String title,
    String? content,
    required String category,
    required DateTime date,
    required double latitude,
    required double longitude,
    required String placeName,
    required String address,
    required List<String> photos,
    required int photoCount,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _MemoryModel;

  factory MemoryModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    final geoPoint = data['location'] as GeoPoint?;
    final photos = List<String>.from(data['photos'] ?? []);
    return MemoryModel(
      id: doc.id,
      coupleId: data['coupleId'] ?? '',
      createdBy: data['createdBy'] ?? '',
      title: data['title'] ?? '',
      content: data['content'],
      category: data['category'] ?? 'etc',
      date: (data['date'] as Timestamp?)?.toDate() ?? DateTime.now(),
      latitude: geoPoint?.latitude ?? 0,
      longitude: geoPoint?.longitude ?? 0,
      placeName: data['placeName'] ?? '',
      address: data['address'] ?? '',
      photos: photos,
      photoCount: photos.length,
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      updatedAt: (data['updatedAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'coupleId': coupleId,
      'createdBy': createdBy,
      'title': title,
      'content': content,
      'category': category,
      'date': Timestamp.fromDate(date),
      'location': GeoPoint(latitude, longitude),
      'placeName': placeName,
      'address': address,
      'photos': photos,
      'photoCount': photoCount,
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': Timestamp.fromDate(updatedAt),
    };
  }
}
```

---

## 5. 구현 단계

### Phase 1: 프로젝트 초기 설정

#### Step 1.1: Flutter 프로젝트 생성
```bash
flutter create --org com.sm woori_yeogi
cd woori_yeogi
```

#### Step 1.2: 의존성 추가 (pubspec.yaml)
```yaml
dependencies:
  flutter:
    sdk: flutter

  # State Management
  flutter_riverpod: ^2.4.9
  riverpod_annotation: ^2.3.3

  # Routing
  go_router: ^12.1.3

  # Firebase
  firebase_core: ^2.24.2
  firebase_auth: ^4.16.0
  cloud_firestore: ^4.14.0
  firebase_storage: ^11.6.0
  firebase_messaging: ^14.7.9
  firebase_analytics: ^10.8.0
  firebase_crashlytics: ^3.4.9

  # Social Login
  google_sign_in: ^6.2.1
  sign_in_with_apple: ^5.0.0
  kakao_flutter_sdk_user: ^1.6.1
  flutter_naver_login: ^1.8.0

  # Maps
  flutter_naver_map: ^1.0.2
  geolocator: ^10.1.0

  # UI
  cached_network_image: ^3.3.1
  image_picker: ^1.0.7
  photo_view: ^0.14.0
  fl_chart: ^0.65.0
  shimmer: ^3.0.0

  # Utils
  freezed_annotation: ^2.4.1
  json_annotation: ^4.8.1
  intl: ^0.18.1
  uuid: ^4.2.2

  # Network & Offline
  connectivity_plus: ^5.0.2
  flutter_image_compress: ^2.1.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.1
  build_runner: ^2.4.8
  freezed: ^2.4.6
  json_serializable: ^6.7.1
  riverpod_generator: ^2.3.9
  mockito: ^5.4.4
```

#### Step 1.3: Firebase 설정
```bash
# Firebase CLI 설치
npm install -g firebase-tools

# Firebase 로그인
firebase login

# FlutterFire CLI 설치
dart pub global activate flutterfire_cli

# Firebase 프로젝트 설정
flutterfire configure --project=woori-yeogi-app
```

#### Step 1.4: Firestore 오프라인 캐시 활성화
**파일**: `lib/main.dart`

```dart
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  // Firestore 오프라인 캐시 활성화
  FirebaseFirestore.instance.settings = const Settings(
    persistenceEnabled: true,
    cacheSizeBytes: Settings.CACHE_SIZE_UNLIMITED,
  );

  runApp(const ProviderScope(child: MyApp()));
}
```

#### Step 1.5: 네이버 지도 설정

**Android (android/app/src/main/AndroidManifest.xml)**
```xml
<manifest>
    <application>
        <!-- 네이버 지도 API 키는 local.properties에서 읽어옴 -->
        <meta-data
            android:name="com.naver.maps.map.CLIENT_ID"
            android:value="${NAVER_MAP_CLIENT_ID}" />
    </application>
</manifest>
```

**Android (android/local.properties)** - Git에서 제외
```properties
NAVER_MAP_CLIENT_ID=your_actual_client_id
```

**Android (android/app/build.gradle)**
```gradle
def localProperties = new Properties()
localProperties.load(new FileInputStream(rootProject.file("local.properties")))

android {
    defaultConfig {
        manifestPlaceholders = [
            NAVER_MAP_CLIENT_ID: localProperties['NAVER_MAP_CLIENT_ID']
        ]
    }
}
```

**iOS (ios/Runner/Info.plist)**
```xml
<key>NMFClientId</key>
<string>$(NAVER_MAP_CLIENT_ID)</string>
```

#### Step 1.6: 폴더 구조 생성
```bash
mkdir -p lib/{core/{constants,extensions,utils,errors,network},data/{models,repositories,datasources},domain/{entities,usecases},presentation/{providers,screens,widgets},router}
mkdir -p lib/presentation/screens/{splash,onboarding,auth,couple,home,memory,anniversary,search,statistics,settings}
mkdir -p lib/presentation/widgets/{common,memory}
mkdir -p assets/{images,icons,fonts}
mkdir -p test/{unit,widget,integration}
mkdir -p functions/src
```

---

### Phase 2: 인증 시스템 구현

#### Step 2.1: Auth Repository 구현
**파일**: `lib/data/repositories/auth_repository.dart`

```dart
class AuthRepository {
  final FirebaseAuth _auth;
  final FirebaseFirestore _firestore;
  final GoogleSignIn _googleSignIn;

  AuthRepository({
    FirebaseAuth? auth,
    FirebaseFirestore? firestore,
    GoogleSignIn? googleSignIn,
  })  : _auth = auth ?? FirebaseAuth.instance,
        _firestore = firestore ?? FirebaseFirestore.instance,
        _googleSignIn = googleSignIn ?? GoogleSignIn();

  // 현재 사용자 조회
  Future<UserModel?> getCurrentUser() async {
    final user = _auth.currentUser;
    if (user == null) return null;

    final doc = await _firestore.collection('users').doc(user.uid).get();
    if (!doc.exists) return null;

    return UserModel.fromFirestore(doc);
  }

  // 이메일 로그인
  Future<UserModel> signInWithEmail(String email, String password) async {
    try {
      final credential = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      return _getOrCreateUser(credential.user!);
    } on FirebaseAuthException catch (e) {
      throw _mapAuthException(e);
    }
  }

  // 이메일 회원가입
  Future<UserModel> signUpWithEmail(String email, String password, String displayName) async {
    try {
      final credential = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      await credential.user!.updateDisplayName(displayName);
      return _createUser(credential.user!, displayName);
    } on FirebaseAuthException catch (e) {
      throw _mapAuthException(e);
    }
  }

  // Google 로그인
  Future<UserModel> signInWithGoogle() async {
    try {
      final googleUser = await _googleSignIn.signIn();
      if (googleUser == null) throw AuthCancelledException();

      final googleAuth = await googleUser.authentication;
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      final userCredential = await _auth.signInWithCredential(credential);
      return _getOrCreateUser(userCredential.user!);
    } catch (e) {
      throw AuthFailedException(e.toString());
    }
  }

  // Apple 로그인
  Future<UserModel> signInWithApple() async {
    try {
      final appleCredential = await SignInWithApple.getAppleIDCredential(
        scopes: [
          AppleIDAuthorizationScopes.email,
          AppleIDAuthorizationScopes.fullName,
        ],
      );

      final oauthCredential = OAuthProvider('apple.com').credential(
        idToken: appleCredential.identityToken,
        accessToken: appleCredential.authorizationCode,
      );

      final userCredential = await _auth.signInWithCredential(oauthCredential);
      return _getOrCreateUser(userCredential.user!);
    } catch (e) {
      throw AuthFailedException(e.toString());
    }
  }

  // 카카오 로그인
  Future<UserModel> signInWithKakao() async {
    try {
      // 카카오 로그인
      OAuthToken token;
      if (await isKakaoTalkInstalled()) {
        token = await UserApi.instance.loginWithKakaoTalk();
      } else {
        token = await UserApi.instance.loginWithKakaoAccount();
      }

      // Firebase Custom Token 발급 (Cloud Function 필요)
      final customToken = await _getFirebaseCustomToken('kakao', token.accessToken);
      final userCredential = await _auth.signInWithCustomToken(customToken);

      return _getOrCreateUser(userCredential.user!);
    } catch (e) {
      throw AuthFailedException(e.toString());
    }
  }

  // 네이버 로그인
  Future<UserModel> signInWithNaver() async {
    try {
      final result = await FlutterNaverLogin.logIn();
      if (result.status != NaverLoginStatus.loggedIn) {
        throw AuthCancelledException();
      }

      // Firebase Custom Token 발급 (Cloud Function 필요)
      final customToken = await _getFirebaseCustomToken('naver', result.accessToken.accessToken);
      final userCredential = await _auth.signInWithCustomToken(customToken);

      return _getOrCreateUser(userCredential.user!);
    } catch (e) {
      throw AuthFailedException(e.toString());
    }
  }

  // 로그아웃
  Future<void> signOut() async {
    await Future.wait([
      _auth.signOut(),
      _googleSignIn.signOut(),
    ]);
  }

  // 사용자 생성 또는 조회
  Future<UserModel> _getOrCreateUser(User firebaseUser) async {
    final doc = await _firestore.collection('users').doc(firebaseUser.uid).get();

    if (doc.exists) {
      return UserModel.fromFirestore(doc);
    }

    return _createUser(firebaseUser, firebaseUser.displayName ?? 'User');
  }

  // 새 사용자 생성
  Future<UserModel> _createUser(User firebaseUser, String displayName) async {
    final inviteCode = await _generateUniqueInviteCode();
    final now = DateTime.now();

    final user = UserModel(
      id: firebaseUser.uid,
      email: firebaseUser.email ?? '',
      displayName: displayName,
      photoUrl: firebaseUser.photoURL,
      coupleId: null,
      inviteCode: inviteCode,
      fcmToken: null,
      createdAt: now,
      updatedAt: now,
    );

    // 트랜잭션으로 사용자 및 초대 코드 인덱스 생성
    await _firestore.runTransaction((transaction) async {
      transaction.set(
        _firestore.collection('users').doc(user.id),
        user.toFirestore(),
      );
      transaction.set(
        _firestore.collection('inviteCodes').doc(inviteCode),
        {'userId': user.id},
      );
    });

    return user;
  }

  // 8자리 고유 초대 코드 생성
  Future<String> _generateUniqueInviteCode() async {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 혼동 문자 제외
    final random = Random.secure();

    for (int attempt = 0; attempt < 10; attempt++) {
      final code = List.generate(8, (_) => chars[random.nextInt(chars.length)]).join();

      final doc = await _firestore.collection('inviteCodes').doc(code).get();
      if (!doc.exists) {
        return code;
      }
    }

    throw Exception('Failed to generate unique invite code');
  }

  // 에러 매핑
  AuthException _mapAuthException(FirebaseAuthException e) {
    switch (e.code) {
      case 'user-not-found':
        return AuthUserNotFoundException();
      case 'wrong-password':
        return AuthWrongPasswordException();
      case 'email-already-in-use':
        return AuthEmailAlreadyInUseException();
      default:
        return AuthFailedException(e.message ?? 'Unknown error');
    }
  }
}
```

#### Step 2.2: Auth Provider 구현
**파일**: `lib/presentation/providers/auth_provider.dart`

```dart
@riverpod
class Auth extends _$Auth {
  @override
  FutureOr<UserModel?> build() async {
    final authRepository = ref.watch(authRepositoryProvider);
    return authRepository.getCurrentUser();
  }

  Future<void> signInWithEmail(String email, String password) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final authRepository = ref.read(authRepositoryProvider);
      return authRepository.signInWithEmail(email, password);
    });
  }

  Future<void> signUpWithEmail(String email, String password, String displayName) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final authRepository = ref.read(authRepositoryProvider);
      return authRepository.signUpWithEmail(email, password, displayName);
    });
  }

  Future<void> signInWithGoogle() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final authRepository = ref.read(authRepositoryProvider);
      return authRepository.signInWithGoogle();
    });
  }

  Future<void> signInWithApple() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final authRepository = ref.read(authRepositoryProvider);
      return authRepository.signInWithApple();
    });
  }

  Future<void> signInWithKakao() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final authRepository = ref.read(authRepositoryProvider);
      return authRepository.signInWithKakao();
    });
  }

  Future<void> signInWithNaver() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final authRepository = ref.read(authRepositoryProvider);
      return authRepository.signInWithNaver();
    });
  }

  Future<void> signOut() async {
    final authRepository = ref.read(authRepositoryProvider);
    await authRepository.signOut();
    state = const AsyncData(null);
  }
}
```

#### Step 2.3: 로그인 화면 구현
**파일**: `lib/presentation/screens/auth/login_screen.dart`

```dart
class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    ref.listen(authProvider, (previous, next) {
      next.whenOrNull(
        data: (user) {
          if (user != null) {
            if (user.coupleId != null) {
              context.go('/home');
            } else {
              context.go('/couple/connect');
            }
          }
        },
        error: (error, _) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(error.toString())),
          );
        },
      );
    });

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // 로고
                Text('우리, 여기.', style: Theme.of(context).textTheme.headlineLarge),
                const SizedBox(height: 48),

                // 이메일 입력
                AppTextField(
                  controller: _emailController,
                  label: '이메일',
                  keyboardType: TextInputType.emailAddress,
                  validator: Validators.email,
                ),
                const SizedBox(height: 16),

                // 비밀번호 입력
                AppTextField(
                  controller: _passwordController,
                  label: '비밀번호',
                  obscureText: true,
                  validator: Validators.password,
                ),
                const SizedBox(height: 24),

                // 로그인 버튼
                AppButton(
                  onPressed: authState.isLoading ? null : _signInWithEmail,
                  label: '로그인',
                  isLoading: authState.isLoading,
                ),
                const SizedBox(height: 16),

                // 회원가입 링크
                TextButton(
                  onPressed: () => context.push('/register'),
                  child: const Text('계정이 없으신가요? 회원가입'),
                ),
                const SizedBox(height: 32),

                // 소셜 로그인 구분선
                const Row(
                  children: [
                    Expanded(child: Divider()),
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: 16),
                      child: Text('또는'),
                    ),
                    Expanded(child: Divider()),
                  ],
                ),
                const SizedBox(height: 24),

                // 소셜 로그인 버튼들
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _SocialLoginButton(
                      icon: 'assets/icons/google.png',
                      onPressed: () => ref.read(authProvider.notifier).signInWithGoogle(),
                    ),
                    const SizedBox(width: 16),
                    _SocialLoginButton(
                      icon: 'assets/icons/apple.png',
                      onPressed: () => ref.read(authProvider.notifier).signInWithApple(),
                    ),
                    const SizedBox(width: 16),
                    _SocialLoginButton(
                      icon: 'assets/icons/kakao.png',
                      onPressed: () => ref.read(authProvider.notifier).signInWithKakao(),
                    ),
                    const SizedBox(width: 16),
                    _SocialLoginButton(
                      icon: 'assets/icons/naver.png',
                      onPressed: () => ref.read(authProvider.notifier).signInWithNaver(),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _signInWithEmail() {
    if (_formKey.currentState?.validate() ?? false) {
      ref.read(authProvider.notifier).signInWithEmail(
        _emailController.text.trim(),
        _passwordController.text,
      );
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }
}
```

#### Step 2.4: 회원가입 화면 구현
**파일**: `lib/presentation/screens/auth/register_screen.dart`

(로그인 화면과 유사한 구조, signUpWithEmail 호출)

---

### Phase 3: 커플 연결 시스템 구현

#### Step 3.1: Couple Repository 구현
**파일**: `lib/data/repositories/couple_repository.dart`

```dart
class CoupleRepository {
  final FirebaseFirestore _firestore;

  CoupleRepository({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  // 초대 코드로 사용자 검색
  Future<UserModel?> findUserByInviteCode(String code) async {
    final codeDoc = await _firestore.collection('inviteCodes').doc(code.toUpperCase()).get();
    if (!codeDoc.exists) return null;

    final userId = codeDoc.data()?['userId'] as String?;
    if (userId == null) return null;

    final userDoc = await _firestore.collection('users').doc(userId).get();
    if (!userDoc.exists) return null;

    return UserModel.fromFirestore(userDoc);
  }

  // 커플 연결
  Future<CoupleModel> connectCouple(String user1Id, String user2Id) async {
    final now = DateTime.now();
    final coupleId = const Uuid().v4();

    final couple = CoupleModel(
      id: coupleId,
      user1Id: user1Id,
      user2Id: user2Id,
      coupleName: null,
      startDate: now,
      createdAt: now,
      updatedAt: now,
    );

    // 트랜잭션으로 커플 생성 및 사용자 업데이트
    await _firestore.runTransaction((transaction) async {
      // 커플 문서 생성
      transaction.set(
        _firestore.collection('couples').doc(coupleId),
        couple.toFirestore(),
      );

      // user1 업데이트
      transaction.update(
        _firestore.collection('users').doc(user1Id),
        {'coupleId': coupleId, 'updatedAt': Timestamp.now()},
      );

      // user2 업데이트
      transaction.update(
        _firestore.collection('users').doc(user2Id),
        {'coupleId': coupleId, 'updatedAt': Timestamp.now()},
      );
    });

    return couple;
  }

  // 커플 정보 실시간 조회
  Stream<CoupleModel?> watchCouple(String coupleId) {
    return _firestore
        .collection('couples')
        .doc(coupleId)
        .snapshots()
        .map((doc) => doc.exists ? CoupleModel.fromFirestore(doc) : null);
  }

  // 커플 정보 수정
  Future<void> updateCouple(String coupleId, {String? coupleName, DateTime? startDate}) async {
    final updates = <String, dynamic>{
      'updatedAt': Timestamp.now(),
    };

    if (coupleName != null) updates['coupleName'] = coupleName;
    if (startDate != null) updates['startDate'] = Timestamp.fromDate(startDate);

    await _firestore.collection('couples').doc(coupleId).update(updates);
  }
}
```

#### Step 3.2: Couple Provider 구현
**파일**: `lib/presentation/providers/couple_provider.dart`

```dart
@riverpod
Stream<CoupleModel?> couple(CoupleRef ref) {
  final user = ref.watch(authProvider).value;
  if (user?.coupleId == null) return Stream.value(null);

  final repository = ref.watch(coupleRepositoryProvider);
  return repository.watchCouple(user!.coupleId!);
}

@riverpod
class CoupleConnect extends _$CoupleConnect {
  @override
  FutureOr<void> build() {}

  Future<bool> connectWithCode(String code) async {
    state = const AsyncLoading();

    try {
      final repository = ref.read(coupleRepositoryProvider);
      final currentUser = ref.read(authProvider).value;

      if (currentUser == null) {
        state = AsyncError(Exception('Not logged in'), StackTrace.current);
        return false;
      }

      // 코드로 파트너 검색
      final partner = await repository.findUserByInviteCode(code);
      if (partner == null) {
        state = AsyncError(Exception('Invalid invite code'), StackTrace.current);
        return false;
      }

      // 자기 자신 체크
      if (partner.id == currentUser.id) {
        state = AsyncError(Exception('Cannot connect with yourself'), StackTrace.current);
        return false;
      }

      // 이미 커플인지 체크
      if (partner.coupleId != null) {
        state = AsyncError(Exception('Partner already has a couple'), StackTrace.current);
        return false;
      }

      // 커플 연결
      await repository.connectCouple(currentUser.id, partner.id);

      // 사용자 정보 새로고침
      ref.invalidate(authProvider);

      state = const AsyncData(null);
      return true;
    } catch (e, st) {
      state = AsyncError(e, st);
      return false;
    }
  }
}
```

#### Step 3.3: 커플 연결 화면 구현
**파일**: `lib/presentation/screens/couple/couple_connect_screen.dart`

```dart
class CoupleConnectScreen extends ConsumerStatefulWidget {
  const CoupleConnectScreen({super.key});

  @override
  ConsumerState<CoupleConnectScreen> createState() => _CoupleConnectScreenState();
}

class _CoupleConnectScreenState extends ConsumerState<CoupleConnectScreen> {
  final _codeController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).value;
    final connectState = ref.watch(coupleConnectProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('커플 연결'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => ref.read(authProvider.notifier).signOut(),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            // 내 초대 코드
            Card(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    const Text('내 초대 코드'),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          user?.inviteCode ?? '',
                          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                            letterSpacing: 4,
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.copy),
                          onPressed: () {
                            Clipboard.setData(ClipboardData(text: user?.inviteCode ?? ''));
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('코드가 복사되었습니다')),
                            );
                          },
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      '파트너에게 이 코드를 공유하세요',
                      style: TextStyle(color: Colors.grey),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 32),

            // 파트너 코드 입력
            const Text('파트너의 초대 코드 입력'),
            const SizedBox(height: 16),
            AppTextField(
              controller: _codeController,
              label: '8자리 코드',
              maxLength: 8,
              textCapitalization: TextCapitalization.characters,
            ),
            const SizedBox(height: 16),

            // 연결 버튼
            AppButton(
              onPressed: connectState.isLoading ? null : _connect,
              label: '커플 연결',
              isLoading: connectState.isLoading,
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _connect() async {
    final code = _codeController.text.trim();
    if (code.length != 8) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('8자리 코드를 입력해주세요')),
      );
      return;
    }

    final success = await ref.read(coupleConnectProvider.notifier).connectWithCode(code);
    if (success && mounted) {
      context.go('/couple/profile');
    }
  }

  @override
  void dispose() {
    _codeController.dispose();
    super.dispose();
  }
}
```

#### Step 3.4: 커플 프로필 화면 구현
**파일**: `lib/presentation/screens/couple/couple_profile_screen.dart`

(커플 이름, 사귄 날짜 설정)

---

### Phase 4: 지도 및 추억 핀 구현

#### Step 4.1: 홈 화면 (지도) 구현
**파일**: `lib/presentation/screens/home/home_screen.dart`

```dart
class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  NaverMapController? _mapController;
  final List<NMarker> _markers = [];

  @override
  Widget build(BuildContext context) {
    final memories = ref.watch(memoriesProvider);
    final isOnline = ref.watch(connectivityProvider);

    return Scaffold(
      body: Stack(
        children: [
          // 오프라인 배너
          if (!isOnline)
            Positioned(
              top: 0,
              left: 0,
              right: 0,
              child: Container(
                color: Colors.orange,
                padding: const EdgeInsets.all(8),
                child: const SafeArea(
                  bottom: false,
                  child: Text(
                    '오프라인 모드 - 일부 기능이 제한됩니다',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.white),
                  ),
                ),
              ),
            ),

          // 네이버 지도
          NaverMap(
            onMapReady: (controller) {
              _mapController = controller;
              _updateMarkers(memories.value ?? []);
            },
            options: const NaverMapViewOptions(
              initialCameraPosition: NCameraPosition(
                target: NLatLng(37.5666, 126.9784),
                zoom: 12,
              ),
              locationButtonEnable: true,
            ),
          ),

          // 추억 추가 버튼
          Positioned(
            bottom: 100,
            right: 20,
            child: FloatingActionButton(
              onPressed: () => context.push('/memory/create'),
              child: const Icon(Icons.add),
            ),
          ),
        ],
      ),
      bottomNavigationBar: const BottomNavBar(),
    );
  }

  void _updateMarkers(List<MemoryModel> memories) {
    if (_mapController == null) return;

    // 기존 마커 제거
    for (final marker in _markers) {
      _mapController!.deleteOverlay(marker.info);
    }
    _markers.clear();

    // 새 마커 추가 (클러스터링은 100개 이상일 때만)
    for (final memory in memories) {
      final marker = NMarker(
        id: memory.id,
        position: NLatLng(memory.latitude, memory.longitude),
        caption: NOverlayCaption(text: memory.title),
        icon: NOverlayImage.fromAssetImage('assets/icons/pin_${memory.category}.png'),
      );

      marker.setOnTapListener((overlay) {
        _showMemoryPreview(memory);
      });

      _markers.add(marker);
      _mapController!.addOverlay(marker);
    }
  }

  void _showMemoryPreview(MemoryModel memory) {
    showModalBottomSheet(
      context: context,
      builder: (context) => MemoryPreviewSheet(
        memory: memory,
        onTap: () {
          Navigator.pop(context);
          context.push('/memory/${memory.id}');
        },
      ),
    );
  }
}
```

#### Step 4.2: Memory Repository 구현
**파일**: `lib/data/repositories/memory_repository.dart`

```dart
class MemoryRepository {
  final FirebaseFirestore _firestore;
  final FirebaseStorage _storage;

  MemoryRepository({
    FirebaseFirestore? firestore,
    FirebaseStorage? storage,
  })  : _firestore = firestore ?? FirebaseFirestore.instance,
        _storage = storage ?? FirebaseStorage.instance;

  // 추억 목록 실시간 조회
  Stream<List<MemoryModel>> watchMemories(String coupleId) {
    return _firestore
        .collection('memories')
        .where('coupleId', isEqualTo: coupleId)
        .orderBy('date', descending: true)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => MemoryModel.fromFirestore(doc))
            .toList());
  }

  // 추억 생성
  Future<MemoryModel> createMemory({
    required String coupleId,
    required String createdBy,
    required String title,
    String? content,
    required String category,
    required DateTime date,
    required double latitude,
    required double longitude,
    required String placeName,
    required String address,
    required List<File> photoFiles,
    void Function(int uploaded, int total)? onProgress,
  }) async {
    final memoryId = const Uuid().v4();
    final now = DateTime.now();

    // 사진 업로드 (순차적으로, 실패 시 재시도 가능하도록)
    final photos = <String>[];
    for (int i = 0; i < photoFiles.length; i++) {
      final photoUrl = await _uploadPhoto(coupleId, memoryId, photoFiles[i], i);
      photos.add(photoUrl);
      onProgress?.call(i + 1, photoFiles.length);
    }

    final memory = MemoryModel(
      id: memoryId,
      coupleId: coupleId,
      createdBy: createdBy,
      title: title,
      content: content,
      category: category,
      date: date,
      latitude: latitude,
      longitude: longitude,
      placeName: placeName,
      address: address,
      photos: photos,
      photoCount: photos.length,
      createdAt: now,
      updatedAt: now,
    );

    await _firestore.collection('memories').doc(memoryId).set(memory.toFirestore());
    return memory;
  }

  // 사진 업로드 (압축 후)
  Future<String> _uploadPhoto(String coupleId, String memoryId, File file, int index) async {
    // 이미지 압축
    final compressedFile = await FlutterImageCompress.compressAndGetFile(
      file.path,
      '${file.parent.path}/compressed_$index.jpg',
      quality: 80,
      minWidth: 1920,
      minHeight: 1920,
    );

    final ref = _storage.ref('memories/$coupleId/$memoryId/photo_$index.jpg');

    // 업로드 (최대 3회 재시도)
    for (int attempt = 0; attempt < 3; attempt++) {
      try {
        await ref.putFile(compressedFile ?? file);
        return await ref.getDownloadURL();
      } catch (e) {
        if (attempt == 2) rethrow;
        await Future.delayed(Duration(seconds: attempt + 1));
      }
    }

    throw Exception('Failed to upload photo');
  }

  // 추억 수정
  Future<void> updateMemory(String memoryId, Map<String, dynamic> updates) async {
    updates['updatedAt'] = Timestamp.now();
    await _firestore.collection('memories').doc(memoryId).update(updates);
  }

  // 추억 삭제
  Future<void> deleteMemory(String memoryId, String coupleId) async {
    // 사진 삭제
    final ref = _storage.ref('memories/$coupleId/$memoryId');
    final items = await ref.listAll();
    for (final item in items.items) {
      await item.delete();
    }

    // 문서 삭제
    await _firestore.collection('memories').doc(memoryId).delete();
  }

  // 검색
  Future<List<MemoryModel>> searchMemories({
    required String coupleId,
    String? keyword,
    String? category,
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    Query query = _firestore
        .collection('memories')
        .where('coupleId', isEqualTo: coupleId);

    if (category != null) {
      query = query.where('category', isEqualTo: category);
    }

    if (startDate != null) {
      query = query.where('date', isGreaterThanOrEqualTo: Timestamp.fromDate(startDate));
    }

    if (endDate != null) {
      query = query.where('date', isLessThanOrEqualTo: Timestamp.fromDate(endDate));
    }

    final snapshot = await query.get();
    var results = snapshot.docs.map((doc) => MemoryModel.fromFirestore(doc)).toList();

    // 키워드 필터 (클라이언트 사이드)
    if (keyword != null && keyword.isNotEmpty) {
      final lowerKeyword = keyword.toLowerCase();
      results = results.where((m) =>
          m.title.toLowerCase().contains(lowerKeyword) ||
          m.placeName.toLowerCase().contains(lowerKeyword) ||
          (m.content?.toLowerCase().contains(lowerKeyword) ?? false)
      ).toList();
    }

    return results;
  }
}
```

#### Step 4.3: Memory Provider 구현
**파일**: `lib/presentation/providers/memory_provider.dart`

```dart
@riverpod
Stream<List<MemoryModel>> memories(MemoriesRef ref) {
  final couple = ref.watch(coupleProvider).value;
  if (couple == null) return Stream.value([]);

  final repository = ref.watch(memoryRepositoryProvider);
  return repository.watchMemories(couple.id);
}

@riverpod
class MemoryCreate extends _$MemoryCreate {
  @override
  FutureOr<void> build() {}

  int _uploadedCount = 0;
  int _totalCount = 0;

  int get uploadedCount => _uploadedCount;
  int get totalCount => _totalCount;

  Future<MemoryModel?> create({
    required String title,
    String? content,
    required String category,
    required DateTime date,
    required double latitude,
    required double longitude,
    required String placeName,
    required String address,
    required List<File> photos,
  }) async {
    state = const AsyncLoading();
    _uploadedCount = 0;
    _totalCount = photos.length;

    try {
      final couple = ref.read(coupleProvider).value;
      final user = ref.read(authProvider).value;

      if (couple == null || user == null) {
        throw Exception('Not connected');
      }

      final repository = ref.read(memoryRepositoryProvider);
      final memory = await repository.createMemory(
        coupleId: couple.id,
        createdBy: user.id,
        title: title,
        content: content,
        category: category,
        date: date,
        latitude: latitude,
        longitude: longitude,
        placeName: placeName,
        address: address,
        photoFiles: photos,
        onProgress: (uploaded, total) {
          _uploadedCount = uploaded;
          _totalCount = total;
          ref.notifyListeners();
        },
      );

      state = const AsyncData(null);
      return memory;
    } catch (e, st) {
      state = AsyncError(e, st);
      return null;
    }
  }
}
```

#### Step 4.4: 추억 생성 화면 구현
**파일**: `lib/presentation/screens/memory/memory_create_screen.dart`

(장소 선택, 사진 선택, 메모 입력, 저장)

#### Step 4.5: 추억 상세 화면 구현
**파일**: `lib/presentation/screens/memory/memory_detail_screen.dart`

(사진 슬라이더, 장소 정보, 메모, 수정/삭제)

---

### Phase 5: 타임라인 구현

#### Step 5.1: 타임라인 화면 구현
**파일**: `lib/presentation/screens/memory/memory_timeline_screen.dart`

```dart
class MemoryTimelineScreen extends ConsumerWidget {
  const MemoryTimelineScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final memories = ref.watch(memoriesProvider);
    final filter = ref.watch(timelineFilterProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('타임라인'),
        actions: [
          PopupMenuButton<TimelineFilter>(
            icon: const Icon(Icons.filter_list),
            onSelected: (value) {
              ref.read(timelineFilterProvider.notifier).state = value;
            },
            itemBuilder: (context) => [
              const PopupMenuItem(value: TimelineFilter.all, child: Text('전체')),
              const PopupMenuItem(value: TimelineFilter.thisYear, child: Text('올해')),
              const PopupMenuItem(value: TimelineFilter.thisMonth, child: Text('이번 달')),
            ],
          ),
        ],
      ),
      body: memories.when(
        data: (list) {
          final filtered = _applyFilter(list, filter);
          final grouped = _groupByMonth(filtered);

          if (grouped.isEmpty) {
            return const Center(child: Text('추억이 없습니다'));
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: grouped.length,
            itemBuilder: (context, index) {
              final month = grouped.keys.elementAt(index);
              final monthMemories = grouped[month]!;

              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 월 헤더
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    child: Text(
                      month,
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                  ),
                  // 추억 카드들
                  ...monthMemories.map((m) => MemoryCard(
                    memory: m,
                    onTap: () => context.push('/memory/${m.id}'),
                  )),
                ],
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
      ),
    );
  }

  Map<String, List<MemoryModel>> _groupByMonth(List<MemoryModel> memories) {
    final grouped = <String, List<MemoryModel>>{};

    for (final memory in memories) {
      final key = DateFormat('yyyy년 M월').format(memory.date);
      grouped.putIfAbsent(key, () => []).add(memory);
    }

    return grouped;
  }

  List<MemoryModel> _applyFilter(List<MemoryModel> memories, TimelineFilter filter) {
    final now = DateTime.now();

    switch (filter) {
      case TimelineFilter.all:
        return memories;
      case TimelineFilter.thisYear:
        return memories.where((m) => m.date.year == now.year).toList();
      case TimelineFilter.thisMonth:
        return memories.where((m) =>
          m.date.year == now.year && m.date.month == now.month
        ).toList();
    }
  }
}
```

---

### Phase 6: 기념일 시스템 구현

#### Step 6.1: Anniversary Repository 구현
**파일**: `lib/data/repositories/anniversary_repository.dart`

```dart
class AnniversaryRepository {
  final FirebaseFirestore _firestore;

  AnniversaryRepository({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  // 기념일 목록 조회
  Stream<List<AnniversaryModel>> watchAnniversaries(String coupleId) {
    return _firestore
        .collection('anniversaries')
        .where('coupleId', isEqualTo: coupleId)
        .orderBy('date')
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => AnniversaryModel.fromFirestore(doc))
            .toList());
  }

  // 기념일 생성
  Future<AnniversaryModel> createAnniversary({
    required String coupleId,
    required String title,
    required DateTime date,
    required bool isRecurring,
    required List<int> notifyDaysBefore,
  }) async {
    final id = const Uuid().v4();
    final now = DateTime.now();

    final anniversary = AnniversaryModel(
      id: id,
      coupleId: coupleId,
      title: title,
      date: date,
      isRecurring: isRecurring,
      notifyDaysBefore: notifyDaysBefore,
      lastNotifiedYear: null,
      createdAt: now,
      updatedAt: now,
    );

    await _firestore.collection('anniversaries').doc(id).set(anniversary.toFirestore());
    return anniversary;
  }

  // 기념일 삭제
  Future<void> deleteAnniversary(String id) async {
    await _firestore.collection('anniversaries').doc(id).delete();
  }
}
```

#### Step 6.2: Cloud Functions - 푸시 알림 스케줄러
**파일**: `functions/src/notifications.ts`

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

// 매일 오전 9시 실행 (KST 기준)
export const sendAnniversaryNotifications = functions.pubsub
  .schedule('0 0 * * *')  // UTC 00:00 = KST 09:00
  .timeZone('Asia/Seoul')
  .onRun(async (context) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 모든 기념일 조회
    const anniversariesSnapshot = await db.collection('anniversaries').get();

    for (const doc of anniversariesSnapshot.docs) {
      const anniversary = doc.data();
      const anniversaryDate = anniversary.date.toDate();
      const notifyDays = anniversary.notifyDaysBefore as number[];

      // D-day 계산
      let targetDate = new Date(anniversaryDate);
      if (anniversary.isRecurring) {
        targetDate.setFullYear(today.getFullYear());
        if (targetDate < today) {
          targetDate.setFullYear(today.getFullYear() + 1);
        }
      }

      const daysUntil = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // 알림 대상인지 확인
      if (!notifyDays.includes(daysUntil)) continue;

      // 중복 알림 방지 (올해 이미 보낸 경우)
      if (anniversary.lastNotifiedYear === today.getFullYear() && daysUntil === 0) continue;

      // 커플 사용자들의 FCM 토큰 조회
      const coupleDoc = await db.collection('couples').doc(anniversary.coupleId).get();
      if (!coupleDoc.exists) continue;

      const couple = coupleDoc.data()!;
      const userIds = [couple.user1Id, couple.user2Id];

      const tokens: string[] = [];
      for (const userId of userIds) {
        const userDoc = await db.collection('users').doc(userId).get();
        const fcmToken = userDoc.data()?.fcmToken;
        if (fcmToken) tokens.push(fcmToken);
      }

      if (tokens.length === 0) continue;

      // 알림 메시지 생성
      let body: string;
      if (daysUntil === 0) {
        body = `오늘은 "${anniversary.title}" 기념일이에요!`;
      } else {
        body = `"${anniversary.title}"까지 ${daysUntil}일 남았어요!`;
      }

      // 푸시 알림 전송
      await messaging.sendEachForMulticast({
        tokens,
        notification: {
          title: '우리, 여기.',
          body,
        },
        data: {
          type: 'anniversary',
          anniversaryId: doc.id,
        },
      });

      // 당일 알림인 경우 lastNotifiedYear 업데이트
      if (daysUntil === 0) {
        await doc.ref.update({ lastNotifiedYear: today.getFullYear() });
      }

      console.log(`Sent notification for anniversary ${doc.id} to ${tokens.length} devices`);
    }

    return null;
  });

// FCM 토큰 갱신 시 업데이트
export const updateFcmToken = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Not authenticated');
  }

  const { token } = data;
  if (!token) {
    throw new functions.https.HttpsError('invalid-argument', 'Token required');
  }

  await db.collection('users').doc(context.auth.uid).update({
    fcmToken: token,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true };
});
```

#### Step 6.3-6.4: 기념일 화면 구현
(목록 화면, 생성 화면)

---

### Phase 7: 검색 기능 구현

#### Step 7.1-7.2: 검색 화면 및 Provider 구현
(Phase 4에서 정의한 searchMemories 활용)

---

### Phase 8: 통계 기능 구현

#### Step 8.1: Statistics Provider 구현
**파일**: `lib/presentation/providers/statistics_provider.dart`

```dart
@freezed
class StatisticsModel with _$StatisticsModel {
  const factory StatisticsModel({
    required int totalPlaces,
    required List<PlaceCount> topPlaces,
    required Map<String, int> monthlyCount,
    required Map<String, int> categoryDistribution,
  }) = _StatisticsModel;
}

@freezed
class PlaceCount with _$PlaceCount {
  const factory PlaceCount({
    required String placeName,
    required int count,
  }) = _PlaceCount;
}

@riverpod
FutureOr<StatisticsModel> statistics(StatisticsRef ref) async {
  final memories = await ref.watch(memoriesProvider.future);

  // 총 방문 장소 수
  final totalPlaces = memories.length;

  // 인기 장소 (50m 이내 병합)
  final placeGroups = <String, int>{};
  for (final memory in memories) {
    // 간단히 placeName으로 그룹핑 (실제로는 좌표 거리 계산 필요)
    placeGroups[memory.placeName] = (placeGroups[memory.placeName] ?? 0) + 1;
  }
  final topPlaces = placeGroups.entries
      .map((e) => PlaceCount(placeName: e.key, count: e.value))
      .toList()
    ..sort((a, b) => b.count.compareTo(a.count));

  // 월별 횟수 (최근 12개월)
  final now = DateTime.now();
  final monthlyCount = <String, int>{};
  for (int i = 11; i >= 0; i--) {
    final month = DateTime(now.year, now.month - i);
    final key = DateFormat('yyyy-MM').format(month);
    monthlyCount[key] = 0;
  }
  for (final memory in memories) {
    final key = DateFormat('yyyy-MM').format(memory.date);
    if (monthlyCount.containsKey(key)) {
      monthlyCount[key] = monthlyCount[key]! + 1;
    }
  }

  // 카테고리 분포
  final categoryDistribution = <String, int>{};
  for (final memory in memories) {
    categoryDistribution[memory.category] =
        (categoryDistribution[memory.category] ?? 0) + 1;
  }

  return StatisticsModel(
    totalPlaces: totalPlaces,
    topPlaces: topPlaces.take(5).toList(),
    monthlyCount: monthlyCount,
    categoryDistribution: categoryDistribution,
  );
}
```

#### Step 8.2: 통계 화면 구현
**파일**: `lib/presentation/screens/statistics/statistics_screen.dart`

(fl_chart 활용 막대/파이 차트)

---

### Phase 9: 설정 및 마무리

#### Step 9.1-9.4: 설정 화면, 라우터, 테마, 에러 처리 구현

---

## 6. Firebase Security Rules (수정됨)

### 6.1 Firestore Rules
**파일**: `firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // 헬퍼 함수: 커플 멤버인지 확인
    function isCoupleMemeber(coupleId) {
      let couple = get(/databases/$(database)/documents/couples/$(coupleId)).data;
      return couple.user1Id == request.auth.uid || couple.user2Id == request.auth.uid;
    }

    // 사용자 컬렉션
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
      allow delete: if false; // 삭제는 Admin SDK로만
    }

    // 초대 코드 인덱스 (읽기만 허용, 쓰기는 트랜잭션으로)
    match /inviteCodes/{code} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        request.resource.data.userId == request.auth.uid;
    }

    // 커플 컬렉션
    match /couples/{coupleId} {
      allow read: if request.auth != null && isCoupleMemeber(coupleId);
      allow create: if request.auth != null &&
        (request.resource.data.user1Id == request.auth.uid ||
         request.resource.data.user2Id == request.auth.uid);
      allow update: if request.auth != null && isCoupleMemeber(coupleId);
      allow delete: if false;
    }

    // 추억 컬렉션
    match /memories/{memoryId} {
      allow read: if request.auth != null &&
        isCoupleMemeber(resource.data.coupleId);
      allow create: if request.auth != null &&
        isCoupleMemeber(request.resource.data.coupleId) &&
        request.resource.data.createdBy == request.auth.uid;
      allow update: if request.auth != null &&
        isCoupleMemeber(resource.data.coupleId);
      allow delete: if request.auth != null &&
        isCoupleMemeber(resource.data.coupleId);
    }

    // 기념일 컬렉션
    match /anniversaries/{anniversaryId} {
      allow read: if request.auth != null &&
        isCoupleMemeber(resource.data.coupleId);
      allow create: if request.auth != null &&
        isCoupleMemeber(request.resource.data.coupleId);
      allow update: if request.auth != null &&
        isCoupleMemeber(resource.data.coupleId);
      allow delete: if request.auth != null &&
        isCoupleMemeber(resource.data.coupleId);
    }
  }
}
```

### 6.2 Storage Rules (수정됨 - 보안 강화)
**파일**: `storage.rules`

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // 헬퍼 함수: Firestore에서 커플 멤버인지 확인
    function isCoupleMemeber(coupleId) {
      let couple = firestore.get(/databases/(default)/documents/couples/$(coupleId)).data;
      return couple.user1Id == request.auth.uid || couple.user2Id == request.auth.uid;
    }

    // 추억 사진
    match /memories/{coupleId}/{memoryId}/{fileName} {
      allow read: if request.auth != null && isCoupleMemeber(coupleId);
      allow write: if request.auth != null &&
        isCoupleMemeber(coupleId) &&
        request.resource.size < 10 * 1024 * 1024 && // 10MB 제한
        request.resource.contentType.matches('image/.*'); // 이미지만
    }

    // 프로필 사진
    match /profiles/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        request.auth.uid == userId &&
        request.resource.size < 5 * 1024 * 1024 &&
        request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

## 7. 리스크 및 대응 (확장)

### 7.1 기술적 리스크

| 리스크 | 영향 | 대응 |
|--------|------|------|
| 네이버 지도 플러그인 버그 | 높음 | Google Maps Flutter 폴백 구현 준비, 이슈 추적 |
| 소셜 로그인 연동 복잡 | 중간 | 이메일 로그인 우선 구현, 소셜 로그인 순차 추가 (Google → Apple → 카카오 → 네이버) |
| 이미지 업로드 실패 | 중간 | 자동 재시도 (3회), 실패 시 개별 사진 재업로드 UI 제공 |
| Firestore 쿼리 제한 | 중간 | 복합 인덱스 사전 생성, 페이지네이션 적용 (20개 단위) |
| **초대 코드 충돌** | 낮음 | 8자리 영숫자 (2조 조합), DB 중복 체크, 최대 10회 재생성 |
| **오프라인 데이터 충돌** | 중간 | Firestore 오프라인 캐시 + 서버 타임스탬프 우선 정책 |
| **FCM 토큰 만료** | 낮음 | 앱 실행 시 토큰 갱신 체크, Cloud Function으로 갱신 |
| **지도 마커 성능 (100+)** | 중간 | 마커 클러스터링 적용 (100개 초과 시) |

### 7.2 비즈니스 리스크

| 리스크 | 영향 | 대응 |
|--------|------|------|
| 커플 해체 시 데이터 | 중간 | 데이터 소유권 정책 명시, 해체 시 각자 사본 다운로드 후 삭제 옵션 |
| 개인정보 유출 | 높음 | Security Rules 철저 설정, API 키 환경변수 분리 |
| **위치 데이터 PIPA 준수** | 높음 | 위치 정보 수집 동의 화면, 개인정보처리방침 작성 |
| **앱스토어 심사 거절** | 중간 | Apple 로그인 필수 포함, 가이드라인 사전 검토 |

### 7.3 에러 처리 전략
**파일**: `lib/core/errors/error_handler.dart`

```dart
class ErrorHandler {
  static String getMessage(Object error) {
    if (error is FirebaseAuthException) {
      return _authErrorMessage(error);
    }
    if (error is FirebaseException) {
      return _firebaseErrorMessage(error);
    }
    if (error is SocketException) {
      return '네트워크 연결을 확인해주세요';
    }
    return '오류가 발생했습니다. 다시 시도해주세요';
  }

  static String _authErrorMessage(FirebaseAuthException e) {
    switch (e.code) {
      case 'user-not-found':
        return '등록되지 않은 이메일입니다';
      case 'wrong-password':
        return '비밀번호가 일치하지 않습니다';
      case 'email-already-in-use':
        return '이미 사용 중인 이메일입니다';
      case 'weak-password':
        return '비밀번호는 6자 이상이어야 합니다';
      default:
        return '로그인에 실패했습니다';
    }
  }

  static String _firebaseErrorMessage(FirebaseException e) {
    if (e.code == 'unavailable') {
      return '서버에 연결할 수 없습니다. 오프라인 모드로 전환됩니다';
    }
    return '서비스 오류가 발생했습니다';
  }
}
```

---

## 8. 성능 SLA (구체화)

### 8.1 성능 목표

| 지표 | 목표 | 측정 방법 |
|------|------|----------|
| **앱 콜드 스타트** | < 3초 | Firebase Performance Monitoring |
| **지도 초기 로드** | < 2초 | 지도 onMapReady 콜백까지 |
| **지도 렌더링 (100핀)** | 60fps 유지 | 프레임 드롭 없음 |
| **이미지 로드** | < 2초/장 | cached_network_image 캐시 후 |
| **추억 저장** | < 5초 (사진 10장 기준) | 압축 + 업로드 완료까지 |
| **실시간 동기화 지연** | < 2초 | Firestore 스냅샷 수신까지 |
| **검색 결과 표시** | < 500ms | 쿼리 실행 후 UI 표시까지 |
| **화면 전환** | < 300ms | 애니메이션 완료까지 |

### 8.2 테스트 체크리스트

#### 단위 테스트
- [ ] UserModel.fromFirestore 정확히 파싱 (null 필드 처리 포함)
- [ ] MemoryModel.toFirestore 정확히 변환
- [ ] 초대 코드 생성 (8자리, 혼동 문자 제외)
- [ ] D-day 계산 정확성 (윤년 포함)

#### 통합 테스트
- [ ] 회원가입 → 초대 코드 생성 → 커플 연결 플로우
- [ ] 추억 생성 → 사진 업로드 → 지도 핀 표시 플로우
- [ ] 오프라인 → 온라인 전환 시 데이터 동기화

#### E2E 테스트
- [ ] 전체 사용자 시나리오 (가입 → 연결 → 추억 등록 → 검색 → 통계)
- [ ] iOS 실제 기기 테스트 (iPhone 12 이상)
- [ ] Android 실제 기기 테스트 (Galaxy S21 이상)

#### 성능 테스트
- [ ] 추억 100개 등록 후 지도 렌더링: 60fps 유지
- [ ] 사진 10장 동시 업로드: 10초 이내 완료
- [ ] 콜드 스타트 시간: 3초 이내

---

## 9. 구현 순서 요약

```
Phase 1: 프로젝트 초기 설정
    ├── Step 1.1: Flutter 프로젝트 생성
    ├── Step 1.2: 의존성 추가
    ├── Step 1.3: Firebase 설정
    ├── Step 1.4: Firestore 오프라인 캐시 활성화
    ├── Step 1.5: 네이버 지도 설정 (API 키 보안)
    └── Step 1.6: 폴더 구조 생성

Phase 2: 인증 시스템
    ├── Step 2.1: Auth Repository (5가지 로그인)
    ├── Step 2.2: Auth Provider
    ├── Step 2.3: 로그인 화면
    └── Step 2.4: 회원가입 화면

Phase 3: 커플 연결
    ├── Step 3.1: Couple Repository (8자리 코드, 중복 검사)
    ├── Step 3.2: Couple Provider
    ├── Step 3.3: 커플 연결 화면
    └── Step 3.4: 커플 프로필 화면

Phase 4: 지도 및 추억 핀
    ├── Step 4.1: 홈 화면 (지도 + 오프라인 배너)
    ├── Step 4.2: Memory Repository (재시도 로직 포함)
    ├── Step 4.3: Memory Provider
    ├── Step 4.4: 추억 생성 화면
    └── Step 4.5: 추억 상세 화면

Phase 5: 타임라인
    ├── Step 5.1: 타임라인 화면
    └── Step 5.2: 뷰 전환

Phase 6: 기념일
    ├── Step 6.1: Anniversary Repository
    ├── Step 6.2: Cloud Functions (푸시 알림 스케줄러)
    ├── Step 6.3: 기념일 목록 화면
    └── Step 6.4: 기념일 생성 화면

Phase 7: 검색
    ├── Step 7.1: 검색 화면
    └── Step 7.2: Search Provider

Phase 8: 통계
    ├── Step 8.1: Statistics Provider
    └── Step 8.2: 통계 화면

Phase 9: 마무리
    ├── Step 9.1: 설정 화면
    ├── Step 9.2: 라우터
    ├── Step 9.3: 테마
    ├── Step 9.4: 에러 처리
    └── Step 9.5: Security Rules 배포
```

---

## 10. 다음 단계

이 계획서를 기반으로:
1. **`/sisyphus`** - 구현 시작
2. **`/review`** - 재검토 요청 (선택)

---

*Generated by Prometheus - Strategic Planning Consultant*
*Revised: 2026-01-15 (Momus feedback applied)*

### Revision History
- v1.0 (2026-01-15): 초안 작성
- v2.0 (2026-01-15): Momus 검토 피드백 반영
  - Storage Rules 보안 강화
  - 초대 코드 8자리 확장 + 중복 검사
  - 의존성 버전 통일
  - 오프라인 전략 추가
  - Cloud Functions 코드 추가
  - 성능 SLA 정의
  - 누락된 리스크 추가
  - 에러 처리 전략 추가
