import "./globals.css";

export const metadata = {
  title: "Thi Thử Online TOEIC - Đề 12",
  description: "Trang web thi thử TOEIC Online chính thức - Đề 12 với đầy đủ 200 câu hỏi và đáp án.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
