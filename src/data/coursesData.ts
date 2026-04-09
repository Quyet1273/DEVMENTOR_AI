export interface Lesson {
  id: string;
  title: string;
  duration: string;
  content: string;
  codeExample?: string;
  quiz: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    hint: string;
  };
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: Lesson[];
}

export const courseContent: Record<string, CourseModule[]> = {
  '1': [ // HTML & CSS
    {
      id: 'module-1',
      title: 'HTML Cơ bản',
      lessons: [
        {
          id: 'lesson-1-1',
          title: 'Giới thiệu HTML',
          duration: '15 phút',
          content: `# Giới thiệu HTML

**HTML** (HyperText Markup Language) là ngôn ngữ đánh dấu để tạo cấu trúc trang web.

## Cấu trúc cơ bản

Một trang HTML cơ bản có cấu trúc như sau:

\`\`\`html
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trang web của tôi</title>
</head>
<body>
    <h1>Xin chào thế giới!</h1>
    <p>Đây là đoạn văn đầu tiên của tôi.</p>
</body>
</html>
\`\`\`

## Các thành phần chính

- **\`<!DOCTYPE html>\`**: Khai báo loại tài liệu
- **\`<html>\`**: Thẻ gốc chứa toàn bộ nội dung
- **\`<head>\`**: Chứa metadata (thông tin về trang)
- **\`<body>\`**: Chứa nội dung hiển thị trên trang

## Các thẻ HTML phổ biến

- **Tiêu đề**: \`<h1>\` đến \`<h6>\`
- **Đoạn văn**: \`<p>\`
- **Liên kết**: \`<a href="url">text</a>\`
- **Hình ảnh**: \`<img src="image.jpg" alt="mô tả">\`
- **Danh sách**: \`<ul>\`, \`<ol>\`, \`<li>\``,
          codeExample: `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Trang đầu tiên</title>
</head>
<body>
    <h1>Chào mừng đến với HTML!</h1>
    <p>HTML rất dễ học.</p>
    <a href="https://developer.mozilla.org">Tìm hiểu thêm</a>
</body>
</html>`,
          quiz: {
            question: 'Thẻ nào dùng để tạo tiêu đề lớn nhất trong HTML?',
            options: ['<title>', '<h1>', '<head>', '<header>'],
            correctAnswer: 1,
            explanation: '<h1> là thẻ heading lớn nhất (heading 1). <title> dùng trong <head> để đặt tên tab browser.',
            hint: 'Là thẻ heading với số 1 - tiêu đề cấp cao nhất'
          }
        },
        {
          id: 'lesson-1-2',
          title: 'Thẻ Semantic HTML',
          duration: '20 phút',
          content: `# Semantic HTML

**Semantic HTML** là việc sử dụng các thẻ HTML có ý nghĩa rõ ràng về nội dung.

## Tại sao quan trọng?

1. **SEO tốt hơn**: Giúp search engines hiểu cấu trúc trang
2. **Accessibility**: Người khuyết tật dùng screen reader dễ dàng hơn
3. **Dễ maintain**: Code dễ đọc và hiểu hơn

## Các thẻ Semantic phổ biến

### Layout Structure
\`\`\`html
<header>  <!-- Phần đầu trang -->
<nav>     <!-- Menu điều hướng -->
<main>    <!-- Nội dung chính -->
<article> <!-- Nội dung độc lập -->
<section> <!-- Phần/mục trong trang -->
<aside>   <!-- Nội dung phụ/sidebar -->
<footer>  <!-- Phần cuối trang -->
\`\`\`

### Content
\`\`\`html
<figure>     <!-- Hình ảnh có caption -->
<figcaption> <!-- Chú thích hình -->
<time>       <!-- Thời gian -->
<mark>       <!-- Highlight text -->
<code>       <!-- Code snippet -->
\`\`\``,
          codeExample: `<article>
  <header>
    <h1>Học Web Development</h1>
    <time datetime="2026-01-30">30 tháng 1, 2026</time>
  </header>
  
  <section>
    <h2>Giới thiệu</h2>
    <p>Semantic HTML giúp code <mark>có ý nghĩa</mark> hơn.</p>
  </section>
  
  <footer>
    <p>Tác giả: DevMentor AI</p>
  </footer>
</article>`,
          quiz: {
            question: 'Thẻ nào KHÔNG phải là thẻ semantic?',
            options: ['<header>', '<div>', '<nav>', '<article>'],
            correctAnswer: 1,
            explanation: '<div> là thẻ generic không có ý nghĩa semantic. Các thẻ còn lại đều mô tả rõ nội dung bên trong.',
            hint: 'Thẻ này được dùng phổ biến nhất nhưng không có ý nghĩa cụ thể'
          }
        }
      ]
    },
    {
      id: 'module-2',
      title: 'CSS Fundamentals',
      lessons: [
        {
          id: 'lesson-2-1',
          title: 'CSS Selectors',
          duration: '25 phút',
          content: `# CSS Selectors

Selectors giúp bạn chọn và style các HTML elements.

## Các loại Selectors cơ bản

### 1. Element Selector
Chọn tất cả elements cùng loại:
\`\`\`css
p {
    color: blue;
}
\`\`\`

### 2. Class Selector
Chọn elements có class cụ thể:
\`\`\`css
.highlight {
    background-color: yellow;
}
\`\`\`

### 3. ID Selector
Chọn element có ID cụ thể:
\`\`\`css
#header {
    font-size: 24px;
}
\`\`\`

### 4. Descendant Selector
Chọn element bên trong element khác:
\`\`\`css
div p {
    margin: 10px;
}
\`\`\`

### 5. Attribute Selector
Chọn theo attribute:
\`\`\`css
input[type="text"] {
    border: 1px solid gray;
}
\`\`\`

## Pseudo-classes
\`\`\`css
a:hover {
    color: red;
}

li:first-child {
    font-weight: bold;
}
\`\`\``,
          codeExample: `/* Element selector */
h1 {
    color: navy;
}

/* Class selector */
.card {
    padding: 20px;
    border-radius: 8px;
}

/* ID selector */
#main-title {
    font-size: 32px;
}

/* Hover effect */
button:hover {
    background-color: blue;
    cursor: pointer;
}`,
          quiz: {
            question: 'Selector nào chọn TẤT CẢ thẻ <p> có class "intro"?',
            options: ['p#intro', 'p.intro', 'p:intro', 'p[intro]'],
            correctAnswer: 1,
            explanation: 'Dấu chấm (.) đại diện cho class selector. p.intro nghĩa là tất cả thẻ p có class="intro"',
            hint: 'Class selector bắt đầu bằng dấu chấm (.)'
          }
        },
        {
          id: 'lesson-2-2',
          title: 'Box Model',
          duration: '30 phút',
          content: `# CSS Box Model

Mọi HTML element được coi như một hộp (box) với các thành phần:

## 4 thành phần chính

\`\`\`
┌─────────────────────────────┐
│       MARGIN (ngoài)        │
│  ┌──────────────────────┐   │
│  │   BORDER (viền)      │   │
│  │  ┌────────────────┐  │   │
│  │  │ PADDING (lót)  │  │   │
│  │  │  ┌──────────┐  │  │   │
│  │  │  │ CONTENT  │  │  │   │
│  │  │  └──────────┘  │  │   │
│  │  └────────────────┘  │   │
│  └──────────────────────┘   │
└─────────────────────────────┘
\`\`\`

### 1. Content
Nội dung thực tế (text, image, etc.)

### 2. Padding
Khoảng trống giữa content và border

### 3. Border
Đường viền bao quanh padding

### 4. Margin  
Khoảng cách với elements khác

## Ví dụ
\`\`\`css
.box {
    width: 300px;
    height: 200px;
    padding: 20px;
    border: 2px solid black;
    margin: 10px;
}
\`\`\`

**Tổng chiều rộng** = width + padding-left + padding-right + border-left + border-right
= 300 + 20 + 20 + 2 + 2 = **344px**

## Box-sizing
\`\`\`css
* {
    box-sizing: border-box;
}
\`\`\`
Với \`border-box\`, width bao gồm cả padding và border!`,
          codeExample: `.card {
    width: 300px;
    padding: 20px;      /* Lót trong */
    border: 2px solid #ccc; /* Viền */
    margin: 15px;       /* Khoảng cách ngoài */
    
    /* border-box để width = 300px TOTAL */
    box-sizing: border-box;
}`,
          quiz: {
            question: 'Với box-sizing: border-box, width: 200px, padding: 10px mỗi bên, thì TỔNG chiều rộng là?',
            options: ['200px', '220px', '240px', '180px'],
            correctAnswer: 0,
            explanation: 'Với border-box, width ĐÃ BAO GỒM padding và border. Nên tổng vẫn là 200px.',
            hint: 'border-box nghĩa là width đã tính tổng, không cộng thêm'
          }
        }
      ]
    }
  ],
  '2': [ // JavaScript Modern
    {
      id: 'module-1',
      title: 'JavaScript Basics',
      lessons: [
        {
          id: 'lesson-1-1',
          title: 'Variables và Data Types',
          duration: '20 phút',
          content: `# Variables và Data Types

## Khai báo biến

JavaScript có 3 cách khai báo biến:

### 1. let (ES6)
- Có thể thay đổi giá trị
- Block-scoped
\`\`\`javascript
let age = 25;
age = 26; // OK
\`\`\`

### 2. const (ES6)  
- KHÔNG thể re-assign
- Block-scoped
- Nên dùng mặc định
\`\`\`javascript
const name = "An";
// name = "Bình"; // ❌ Error!
\`\`\`

### 3. var (cũ - tránh dùng)
- Function-scoped
- Có hoisting issues

## Data Types

### Primitive Types
\`\`\`javascript
// String
let name = "John";

// Number
let age = 30;
let price = 19.99;

// Boolean
let isStudent = true;

// Undefined
let x;

// Null
let empty = null;

// Symbol (ES6)
let id = Symbol('id');
\`\`\`

### Reference Types
\`\`\`javascript
// Object
let person = {
    name: "An",
    age: 25
};

// Array
let numbers = [1, 2, 3, 4, 5];

// Function
function greet() {
    console.log("Hello!");
}
\`\`\``,
          codeExample: `// const cho giá trị không đổi
const PI = 3.14159;

// let cho giá trị thay đổi
let count = 0;
count++;

// Object với const
const user = {
    name: "Minh",
    age: 20
};
user.age = 21; // ✅ OK - thay đổi property
// user = {}; // ❌ Error - không thể re-assign`,
          quiz: {
            question: 'Khai báo nào SAI với const?',
            options: [
              'const x = 5;',
              'const arr = [1,2,3]; arr.push(4);',
              'const obj = {a: 1}; obj.a = 2;',
              'const y = 10; y = 20;'
            ],
            correctAnswer: 3,
            explanation: 'const KHÔNG thể re-assign. Nhưng với object/array, có thể thay đổi properties/elements bên trong.',
            hint: 'const không cho phép gán lại giá trị hoàn toàn mới'
          }
        },
        {
          id: 'lesson-1-2',
          title: 'Functions và Arrow Functions',
          duration: '25 phút',
          content: `# Functions trong JavaScript

## Function Declaration
\`\`\`javascript
function greet(name) {
    return "Hello, " + name;
}
\`\`\`

## Function Expression
\`\`\`javascript
const greet = function(name) {
    return "Hello, " + name;
};
\`\`\`

## Arrow Function (ES6) ⭐
Cú pháp ngắn gọn hơn:

### Cơ bản
\`\`\`javascript
const greet = (name) => {
    return "Hello, " + name;
};
\`\`\`

### Implicit Return (1 dòng)
\`\`\`javascript
const greet = (name) => "Hello, " + name;
\`\`\`

### Một parameter - bỏ ()
\`\`\`javascript
const square = x => x * x;
\`\`\`

### Không parameter
\`\`\`javascript
const sayHi = () => "Hi!";
\`\`\`

## So sánh

\`\`\`javascript
// Truyền thống
function add(a, b) {
    return a + b;
}

// Arrow function
const add = (a, b) => a + b;
\`\`\`

## Default Parameters
\`\`\`javascript
const greet = (name = "Guest") => {
    return \`Hello, \${name}\`;
};

greet();       // "Hello, Guest"
greet("An");   // "Hello, An"
\`\`\``,
          codeExample: `// Function thường
function multiply(a, b) {
    return a * b;
}

// Arrow function - full syntax
const multiply2 = (a, b) => {
    return a * b;
};

// Arrow function - short
const multiply3 = (a, b) => a * b;

// Sử dụng
console.log(multiply(5, 3));  // 15
console.log(multiply2(5, 3)); // 15
console.log(multiply3(5, 3)); // 15`,
          quiz: {
            question: 'Arrow function nào ĐÚNG để return x + 1?',
            options: [
              'const f = x => x + 1',
              'const f = x -> x + 1',
              'const f = (x) -> { x + 1 }',
              'const f => x => x + 1'
            ],
            correctAnswer: 0,
            explanation: 'Arrow function dùng =>. Với 1 parameter và 1 expression, có thể bỏ () và {} để viết ngắn gọn.',
            hint: 'Arrow function dùng mũi tên =>, không phải ->'
          }
        }
      ]
    }
  ],
  '9': [ // Bootstrap
    {
      id: 'module-1',
      title: 'Bootstrap Basics',
      lessons: [
        {
          id: 'lesson-1-1',
          title: 'Grid System',
          duration: '30 phút',
          content: `# Bootstrap Grid System

Bootstrap sử dụng hệ thống lưới 12 cột responsive.

## Breakpoints

\`\`\`
xs: < 576px   (Extra small - mobile)
sm: ≥ 576px   (Small - mobile landscape)
md: ≥ 768px   (Medium - tablets)
lg: ≥ 992px   (Large - desktops)
xl: ≥ 1200px  (Extra large)
xxl: ≥ 1400px (Extra extra large)
\`\`\`

## Container
\`\`\`html
<div class="container">     <!-- Fixed width -->
<div class="container-fluid"> <!-- Full width -->
\`\`\`

## Row và Column
\`\`\`html
<div class="container">
  <div class="row">
    <div class="col-md-6">50% on medium+</div>
    <div class="col-md-6">50% on medium+</div>
  </div>
</div>
\`\`\`

## Class patterns
- \`col-{breakpoint}-{size}\`
- \`col-md-6\`: 6/12 = 50% trên medium screens trở lên

## Responsive Layout
\`\`\`html
<!-- Mobile: full width, Desktop: 1/3 each -->
<div class="row">
  <div class="col-12 col-md-4">Column 1</div>
  <div class="col-12 col-md-4">Column 2</div>
  <div class="col-12 col-md-4">Column 3</div>
</div>
\`\`\``,
          codeExample: `<div class="container">
  <div class="row">
    <!-- Mobile: full, Tablet: half, Desktop: 1/3 -->
    <div class="col-12 col-md-6 col-lg-4">
      <div class="card">Card 1</div>
    </div>
    <div class="col-12 col-md-6 col-lg-4">
      <div class="card">Card 2</div>
    </div>
    <div class="col-12 col-md-6 col-lg-4">
      <div class="card">Card 3</div>
    </div>
  </div>
</div>`,
          quiz: {
            question: 'Class nào cho column chiếm 50% width trên tablet (md) trở lên?',
            options: ['col-6', 'col-md-6', 'col-lg-6', 'col-md-50'],
            correctAnswer: 1,
            explanation: 'col-md-6 = 6/12 = 50% width từ breakpoint medium (768px) trở lên.',
            hint: 'Cần breakpoint "md" và size là 6 (= 50% của 12 cột)'
          }
        }
      ]
    }
  ],
  '7': [ // Git & GitHub
    {
      id: 'module-1',
      title: 'Git Fundamentals',
      lessons: [
        {
          id: 'lesson-1-1',
          title: 'Giới thiệu Git',
          duration: '20 phút',
          content: `# Giới thiệu Git

**Git** là hệ thống quản lý phiên bản phân tán (Distributed Version Control System).

## Tại sao cần Git?

1. **Theo dõi thay đổi**: Lưu lại lịch sử mọi thay đổi trong code
2. **Làm việc nhóm**: Nhiều người cùng code trên một dự án
3. **Backup an toàn**: Code được lưu trữ nhiều nơi
4. **Quay lại quá khứ**: Dễ dàng hoàn tác khi có lỗi

## Cài đặt Git

### Windows
Download từ: https://git-scm.com

### macOS
\`\`\`bash
brew install git
\`\`\`

### Linux
\`\`\`bash
sudo apt install git
\`\`\`

## Cấu hình Git lần đầu

\`\`\`bash
git config --global user.name "Tên của bạn"
git config --global user.email "email@example.com"
\`\`\`

## Kiểm tra cài đặt

\`\`\`bash
git --version
git config --list
\`\`\``,
          codeExample: `# Cấu hình thông tin cá nhân
git config --global user.name "Nguyễn Văn A"
git config --global user.email "nguyenvana@gmail.com"

# Kiểm tra cấu hình
git config --global user.name
git config --global user.email

# Xem tất cả cấu hình
git config --list`,
          quiz: {
            question: 'Lệnh nào dùng để thiết lập tên người dùng trong Git?',
            options: [
              'git set user.name "Tên"',
              'git config --global user.name "Tên"',
              'git user --name "Tên"',
              'git setup name "Tên"'
            ],
            correctAnswer: 1,
            explanation: 'git config --global user.name "Tên" là lệnh đúng để thiết lập tên người dùng toàn cục trong Git.',
            hint: 'Sử dụng lệnh config với flag --global'
          }
        },
        {
          id: 'lesson-1-2',
          title: 'Git Workflow cơ bản',
          duration: '30 phút',
          content: `# Git Workflow cơ bản

## 3 vùng trong Git

\`\`\`
Working Directory  →  Staging Area  →  Repository
   (Thay đổi)         (git add)        (git commit)
\`\`\`

### 1. Working Directory
Nơi bạn làm việc với files

### 2. Staging Area
Vùng chuẩn bị cho commit

### 3. Repository
Lưu trữ lịch sử commits

## Các lệnh cơ bản

### Khởi tạo repository
\`\`\`bash
git init
\`\`\`

### Kiểm tra trạng thái
\`\`\`bash
git status
\`\`\`

### Thêm file vào staging
\`\`\`bash
git add file.txt        # Thêm 1 file
git add .               # Thêm tất cả
git add *.js            # Thêm file .js
\`\`\`

### Commit thay đổi
\`\`\`bash
git commit -m "Mô tả thay đổi"
\`\`\`

### Xem lịch sử
\`\`\`bash
git log
git log --oneline      # Gọn hơn
\`\`\`

## Workflow thực tế

\`\`\`bash
# 1. Khởi tạo
git init

# 2. Tạo file
echo "Hello Git" > index.html

# 3. Kiểm tra
git status

# 4. Add vào staging
git add index.html

# 5. Commit
git commit -m "Add index.html"

# 6. Xem lịch sử
git log
\`\`\``,
          codeExample: `# Tạo project mới
mkdir my-project
cd my-project

# Khởi tạo Git
git init

# Tạo file
echo "# My Project" > README.md

# Kiểm tra trạng thái
git status

# Add file
git add README.md

# Hoặc add tất cả
git add .

# Commit với message
git commit -m "Initial commit: Add README"

# Xem lịch sử
git log --oneline`,
          quiz: {
            question: 'Thứ tự ĐÚNG trong Git workflow là gì?',
            options: [
              'commit → add → status',
              'status → add → commit',
              'add → commit → status',
              'status → commit → add'
            ],
            correctAnswer: 1,
            explanation: 'Workflow đúng: Kiểm tra status → Add files vào staging → Commit changes. Status giúp xem files nào đã thay đổi trước khi add.',
            hint: 'Nên kiểm tra trạng thái trước, sau đó thêm file, cuối cùng commit'
          }
        },
        {
          id: 'lesson-1-3',
          title: 'Branches - Nhánh làm việc',
          duration: '35 phút',
          content: `# Git Branches

**Branch** (nhánh) cho phép phát triển tính năng độc lập mà không ảnh hưởng code chính.

## Tại sao dùng Branches?

- **Phát triển tính năng mới** không ảnh hưởng main
- **Làm việc song song** nhiều features
- **Dễ dàng thử nghiệm** và hủy bỏ

## Các lệnh Branch

### Xem branches
\`\`\`bash
git branch              # Xem local branches
git branch -a           # Xem tất cả
\`\`\`

### Tạo branch mới
\`\`\`bash
git branch feature-login
\`\`\`

### Chuyển branch
\`\`\`bash
git checkout feature-login
\`\`\`

### Tạo và chuyển (shortcut)
\`\`\`bash
git checkout -b feature-login
\`\`\`

### Merge branch
\`\`\`bash
# Chuyển về main
git checkout main

# Merge feature vào main
git merge feature-login
\`\`\`

### Xóa branch
\`\`\`bash
git branch -d feature-login
\`\`\`

## Workflow với Branches

\`\`\`bash
# 1. Tạo branch mới cho feature
git checkout -b add-navbar

# 2. Làm việc và commit
echo "navbar" > navbar.html
git add navbar.html
git commit -m "Add navbar"

# 3. Chuyển về main
git checkout main

# 4. Merge feature
git merge add-navbar

# 5. Xóa branch (optional)
git branch -d add-navbar
\`\`\`

## Branch Strategy

### main/master
Branch chính, code production

### develop
Branch phát triển

### feature/*
Branches cho tính năng mới

### hotfix/*
Branches sửa lỗi nhanh`,
          codeExample: `# Xem branches hiện có
git branch

# Tạo và chuyển sang branch mới
git checkout -b feature/user-profile

# Làm việc...
echo "User profile page" > profile.html
git add profile.html
git commit -m "Add user profile page"

# Chuyển về main
git checkout main

# Merge feature vào main
git merge feature/user-profile

# Xóa branch đã merge
git branch -d feature/user-profile

# Hoặc giữ lại để tiếp tục phát triển`,
          quiz: {
            question: 'Lệnh nào TẠO và CHUYỂN sang branch mới cùng lúc?',
            options: [
              'git branch -b new-feature',
              'git checkout -b new-feature',
              'git create -b new-feature',
              'git switch --create new-feature'
            ],
            correctAnswer: 1,
            explanation: 'git checkout -b <branch-name> tạo branch mới và chuyển sang branch đó ngay. Đây là shortcut của git branch + git checkout.',
            hint: 'Sử dụng checkout với flag -b'
          }
        }
      ]
    },
    {
      id: 'module-2',
      title: 'GitHub - Remote Repository',
      lessons: [
        {
          id: 'lesson-2-1',
          title: 'Làm việc với GitHub',
          duration: '25 phút',
          content: `# GitHub - Remote Repository

**GitHub** là nền tảng lưu trữ Git repository trên cloud.

## Tại sao dùng GitHub?

1. **Backup cloud**: Code an toàn trên internet
2. **Collaboration**: Làm việc nhóm dễ dàng
3. **Portfolio**: Showcase dự án của bạn
4. **Open Source**: Đóng góp cho cộng đồng

## Tạo Repository trên GitHub

1. Đăng nhập GitHub
2. Click nút "New repository"
3. Đặt tên repository
4. Chọn Public/Private
5. Click "Create repository"

## Kết nối Local với GitHub

### Push repository có sẵn
\`\`\`bash
git remote add origin https://github.com/username/repo.git
git branch -M main
git push -u origin main
\`\`\`

### Clone repository từ GitHub
\`\`\`bash
git clone https://github.com/username/repo.git
\`\`\`

## Các lệnh Remote

### Thêm remote
\`\`\`bash
git remote add origin <url>
\`\`\`

### Xem remotes
\`\`\`bash
git remote -v
\`\`\`

### Push code lên GitHub
\`\`\`bash
git push origin main
git push -u origin main  # Lần đầu
\`\`\`

### Pull code về
\`\`\`bash
git pull origin main
\`\`\`

### Fetch thay đổi
\`\`\`bash
git fetch origin
\`\`\``,
          codeExample: `# Tạo repository mới trên local
git init
echo "# My Project" > README.md
git add README.md
git commit -m "Initial commit"

# Kết nối với GitHub
git remote add origin https://github.com/username/my-project.git

# Push lên GitHub
git branch -M main
git push -u origin main

# Hoặc clone repository có sẵn
git clone https://github.com/username/existing-repo.git
cd existing-repo`,
          quiz: {
            question: 'Lệnh nào dùng để TẢI repository từ GitHub về máy?',
            options: [
              'git download <url>',
              'git clone <url>',
              'git pull <url>',
              'git fetch <url>'
            ],
            correctAnswer: 1,
            explanation: 'git clone <url> tải toàn bộ repository (code + lịch sử) từ GitHub về máy và tự động setup remote.',
            hint: 'Lệnh này tạo bản sao giống hệt repository gốc'
          }
        }
      ]
    }
  ],
  '15': [ // Docker & DevOps
    {
      id: 'module-1',
      title: 'Docker Basics',
      lessons: [
        {
          id: 'lesson-1-1',
          title: 'Giới thiệu Docker',
          duration: '25 phút',
          content: `# Giới thiệu Docker

**Docker** là nền tảng để phát triển, ship và chạy ứng dụng trong containers.

## Container là gì?

Container là **package** chứa:
- Ứng dụng của bạn
- Tất cả dependencies
- Runtime environment

→ Chạy được ở BẤT KỲ ĐÂU!

## So sánh: VM vs Container

### Virtual Machine
\`\`\`
App → Guest OS → Hypervisor → Host OS → Hardware
(Nặng, chậm khởi động)
\`\`\`

### Container
\`\`\`
App → Container Runtime → Host OS → Hardware
(Nhẹ, nhanh, hiệu quả)
\`\`\`

## Lợi ích của Docker

1. **Consistency**: "Works on my machine" → Works everywhere!
2. **Lightweight**: Nhẹ hơn VM rất nhiều
3. **Fast**: Khởi động trong giây
4. **Scalable**: Dễ dàng scale up/down
5. **Isolation**: Các app độc lập, không conflict

## Kiến trúc Docker

### Docker Image
- Blueprint (bản thiết kế)
- Read-only template
- Tạo từ Dockerfile

### Docker Container
- Instance của Image
- Running process
- Có thể start, stop, delete

### Docker Registry
- Nơi lưu trữ images
- Docker Hub (public)
- Private registry

## Cài đặt Docker

### Windows/Mac
Download Docker Desktop từ: https://www.docker.com

### Linux
\`\`\`bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
\`\`\`

### Kiểm tra
\`\`\`bash
docker --version
docker run hello-world
\`\`\``,
          codeExample: `# Kiểm tra Docker đã cài chưa
docker --version

# Chạy container đầu tiên
docker run hello-world

# List các images
docker images

# List containers đang chạy
docker ps

# List tất cả containers
docker ps -a

# Xem thông tin Docker
docker info`,
          quiz: {
            question: 'Điểm khác biệt CHÍNH giữa Docker Container và VM?',
            options: [
              'Container nhanh hơn vì không cần Guest OS',
              'Container an toàn hơn VM',
              'Container chỉ chạy trên Linux',
              'Container không thể chạy nhiều app'
            ],
            correctAnswer: 0,
            explanation: 'Container nhẹ và nhanh hơn vì chia sẻ kernel của Host OS, không cần cài đặt Guest OS riêng như VM.',
            hint: 'Container chia sẻ OS của host, không cần OS riêng'
          }
        },
        {
          id: 'lesson-1-2',
          title: 'Docker Images và Containers',
          duration: '30 phút',
          content: `# Docker Images và Containers

## Làm việc với Images

### Pull image từ Docker Hub
\`\`\`bash
docker pull nginx
docker pull node:18
docker pull python:3.11
\`\`\`

### List images
\`\`\`bash
docker images
\`\`\`

### Xóa image
\`\`\`bash
docker rmi image-name
\`\`\`

## Làm việc với Containers

### Run container
\`\`\`bash
# Basic
docker run nginx

# Detached mode (chạy nền)
docker run -d nginx

# Đặt tên container
docker run --name my-nginx nginx

# Map port
docker run -p 8080:80 nginx
\`\`\`

### Các lệnh Container

\`\`\`bash
# List containers đang chạy
docker ps

# List tất cả
docker ps -a

# Stop container
docker stop container-id

# Start container
docker start container-id

# Restart
docker restart container-id

# Xóa container
docker rm container-id

# Xóa khi stop
docker run --rm nginx
\`\`\`

### Exec vào container
\`\`\`bash
docker exec -it container-name bash
docker exec -it container-name sh
\`\`\`

### View logs
\`\`\`bash
docker logs container-name
docker logs -f container-name  # Follow
\`\`\`

## Port Mapping

\`\`\`
Host:Container
8080:80      # Host port 8080 → Container port 80
3000:3000    # Host 3000 → Container 3000
\`\`\`

### Ví dụ
\`\`\`bash
# Run nginx, access tại localhost:8080
docker run -d -p 8080:80 --name web nginx

# Run Node.js app
docker run -d -p 3000:3000 --name api node-app
\`\`\``,
          codeExample: `# Pull image
docker pull nginx:latest

# Run nginx container
docker run -d -p 8080:80 --name my-web nginx

# Kiểm tra container đang chạy
docker ps

# Xem logs
docker logs my-web

# Exec vào container
docker exec -it my-web bash

# Stop container
docker stop my-web

# Start lại
docker start my-web

# Xóa container
docker rm my-web

# Xóa image
docker rmi nginx`,
          quiz: {
            question: 'Lệnh "docker run -p 3000:8080 app" có ý nghĩa gì?',
            options: [
              'Container port 3000 → Host port 8080',
              'Host port 3000 → Container port 8080',
              'Chạy 3000 containers trên port 8080',
              'Copy port 3000 sang 8080'
            ],
            correctAnswer: 1,
            explanation: 'Format là HOST:CONTAINER. Vậy 3000:8080 nghĩa là Host port 3000 map tới Container port 8080.',
            hint: 'Format là HOST_PORT:CONTAINER_PORT'
          }
        },
        {
          id: 'lesson-1-3',
          title: 'Dockerfile - Tạo Image',
          duration: '35 phút',
          content: `# Dockerfile - Tạo Custom Image

**Dockerfile** là file text chứa instructions để build Docker image.

## Cấu trúc Dockerfile

### FROM - Base image
\`\`\`dockerfile
FROM node:18
FROM python:3.11
FROM ubuntu:22.04
\`\`\`

### WORKDIR - Thư mục làm việc
\`\`\`dockerfile
WORKDIR /app
\`\`\`

### COPY - Copy files
\`\`\`dockerfile
COPY package.json .
COPY . .
\`\`\`

### RUN - Chạy commands
\`\`\`dockerfile
RUN npm install
RUN pip install -r requirements.txt
\`\`\`

### CMD - Command mặc định
\`\`\`dockerfile
CMD ["npm", "start"]
CMD ["python", "app.py"]
\`\`\`

### EXPOSE - Khai báo port
\`\`\`dockerfile
EXPOSE 3000
\`\`\`

## Ví dụ: Node.js App

\`\`\`dockerfile
# Base image
FROM node:18

# Working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "start"]
\`\`\`

## Build Image

\`\`\`bash
docker build -t my-app .
docker build -t my-app:v1.0 .
\`\`\`

## Run Image

\`\`\`bash
docker run -p 3000:3000 my-app
\`\`\`

## Best Practices

1. **Use specific versions**
   \`\`\`dockerfile
   FROM node:18-alpine  # Tốt
   FROM node:latest     # Tránh
   \`\`\`

2. **Minimize layers**
   \`\`\`dockerfile
   RUN apt-get update && apt-get install -y \\
       package1 \\
       package2
   \`\`\`

3. **Use .dockerignore**
   \`\`\`
   node_modules
   .git
   .env
   \`\`\`

4. **Multi-stage builds** (advanced)`,
          codeExample: `# Dockerfile cho Node.js app
FROM node:18-alpine

WORKDIR /app

# Copy dependencies first (cache layer)
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start app
CMD ["node", "server.js"]

# Build image
# docker build -t my-node-app .

# Run container
# docker run -d -p 3000:3000 my-node-app`,
          quiz: {
            question: 'Trong Dockerfile, instruction nào COPY files vào image?',
            options: [
              'COPY và ADD đều được',
              'Chỉ COPY',
              'Chỉ ADD',
              'RUN cp'
            ],
            correctAnswer: 0,
            explanation: 'Cả COPY và ADD đều copy files. Nhưng COPY được recommend cho đơn giản. ADD có thêm features như auto-extract archives.',
            hint: 'Có 2 instructions, một trong đó được khuyên dùng hơn'
          }
        }
      ]
    }
  ]
};