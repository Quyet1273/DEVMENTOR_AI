# DevMentor AI - Nền tảng học tập CNTT với AI

Nền tảng web hỗ trợ sinh viên CNTT học tập có hệ thống với AI integration.

## 🚀 Tính năng chính

### 1. Authentication & Onboarding
- Đăng ký/đăng nhập
- Onboarding flow thu thập thông tin học viên
- Profile management

### 2. Dashboard & Analytics
- Tổng quan tiến độ học tập
- Skill analytics với biểu đồ
- Tracking XP, level, streak
- Study time statistics

### 3. Personalized Roadmap
- Lộ trình học cá nhân hóa theo role
- Task management với progress tracking
- Auto-complete weeks với bonus XP
- Week-by-week structure

### 4. Courses System
- 15+ khóa học đa dạng (Frontend, Backend, Fullstack, Tools)
- Nội dung học có cấu trúc: Modules → Lessons
- Interactive quiz sau mỗi lesson
- Hint khi sai, auto-next khi đúng
- Progress tracking và XP rewards

### 5. AI Features
- **AI Chat**: Hỏi đáp 24/7 về lập trình
- **Quiz System**: Đánh giá năng lực
- **Mock Interview**: Luyện phỏng vấn
- **Resource Library**: Tài nguyên học tập

## 🛠️ Tech Stack

### Frontend (Current - Prototype)
- **React 18** với TypeScript
- **React Router** (Data mode) cho navigation
- **Tailwind CSS v4** cho styling
- **Recharts** cho data visualization
- **Context API** cho state management
- **localStorage** cho data persistence (prototype)

### Backend (Planned)
- **Node.js** với **Express**
- **MongoDB** hoặc **PostgreSQL**
- **JWT** authentication
- **OpenAI API** cho AI features

## 📦 Cài đặt

### Yêu cầu hệ thống
- Node.js >= 18.x
- npm >= 9.x hoặc yarn >= 1.22

### Bước 1: Clone repository
```bash
git clone <repository-url>
cd devmentor-ai
```

### Bước 2: Cài đặt dependencies
```bash
npm install
# hoặc
yarn install
```

### Bước 3: Chạy development server
```bash
npm run dev
# hoặc
yarn dev
```

Ứng dụng sẽ chạy tại: `http://localhost:5173`

### Bước 4: Build cho production
```bash
npm run build
# hoặc
yarn build
```

## 📁 Cấu trúc thư mục

```
devmentor-ai/
├── components/          # React components
│   ├── Landing.tsx     # Landing page
│   ├── Login.tsx       # Authentication
│   ├── Register.tsx
│   ├── Onboarding.tsx  # User onboarding
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Roadmap.tsx     # Learning roadmap
│   ├── Courses.tsx     # Course listing
│   ├── CourseLearn.tsx # Course learning interface
│   ├── Chat.tsx        # AI chat
│   ├── Quiz.tsx        # Quiz system
│   ├── MockInterview.tsx
│   ├── Resources.tsx
│   ├── Profile.tsx
│   ├── Sidebar.tsx     # Navigation sidebar
│   └── Root.tsx        # Root layout
├── context/            # React Context
│   └── AuthContext.tsx # Authentication state
├── data/              # Mock data & content
│   └── coursesData.ts # Course content & lessons
├── styles/            # Global styles
│   └── globals.css    # Tailwind config & custom styles
├── guidelines/        # Project guidelines
│   └── Guidelines.md
├── routes.ts          # React Router configuration
├── App.tsx           # Main app component
└── main.tsx          # Entry point
```

## 🎯 Tính năng hiện tại

### ✅ Đã hoàn thành (Prototype Frontend)
- [x] Authentication flow (Login/Register)
- [x] Onboarding với role selection
- [x] Dashboard với analytics
- [x] Roadmap system với auto-complete
- [x] Courses catalog (15 khóa học)
- [x] Course learning interface với quiz
- [x] AI Chat (mock responses)
- [x] Quiz system
- [x] Mock Interview
- [x] Resource Library
- [x] Profile management
- [x] Responsive design
- [x] Gamification (XP, levels, streaks)

### 🚧 Đang phát triển
- [ ] Backend API
- [ ] Database integration
- [ ] Real AI integration (OpenAI)
- [ ] User authentication với JWT
- [ ] Real-time features

## 📚 Hướng dẫn sử dụng

### Đăng ký tài khoản mới
1. Truy cập trang chủ
2. Click "Đăng ký ngay"
3. Điền thông tin: Email, tên, mật khẩu
4. Hoàn thành onboarding (chọn role, skills, goals)

### Học khóa học
1. Vào menu "Khóa học"
2. Chọn khóa học và click "Đăng ký ngay"
3. Click "Học ngay" để bắt đầu
4. Đọc nội dung lesson
5. Làm quiz để hoàn thành và unlock bài tiếp theo

### Theo dõi tiến độ
1. Vào Dashboard để xem:
   - Tổng quan XP, Level, Streak
   - Biểu đồ skill distribution
   - Study time statistics
   - Weekly activity

## 🔑 Accounts Demo (Development)

### Test Account
- Email: `test@devmentor.ai`
- Password: `password123`

## 📖 Documentation

Xem thêm tài liệu chi tiết:
- [SETUP.md](./SETUP.md) - Hướng dẫn setup chi tiết
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Kiến trúc hệ thống
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Database schema
- [API_SPECIFICATION.md](./API_SPECIFICATION.md) - Backend API spec

## 🤝 Đóng góp

Dự án đang trong giai đoạn phát triển. Contributions are welcome!

## 📄 License

MIT License

## 📞 Liên hệ

- GitHub: [Your GitHub]
- Email: [Your Email]

---

**Made with ❤️ by DevMentor Team**
