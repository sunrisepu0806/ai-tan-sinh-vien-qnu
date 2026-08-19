import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('LỖI: Chưa cấu hình GEMINI_API_KEY trong .env.local');
      return NextResponse.json({ error: 'Chưa cấu hình API Key.' }, { status: 500 });
    }

    const { message } = await req.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Nội dung tin nhắn không hợp lệ.' }, { status: 400 });
    }

    // Tự động quét và gom toàn bộ nội dung các file .txt trong thư mục data hoặc DATA
    let knowledgeBase = '';
    const possibleDirs = [
      path.join(process.cwd(), 'data'),
      path.join(process.cwd(), 'DATA')
    ];

    for (const dir of possibleDirs) {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        files.forEach((file) => {
          if (file.endsWith('.txt')) {
            const filePath = path.join(dir, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            knowledgeBase += `\n\n=== NGUỒN TÀI LIỆU: [${file}] ===\n` + content;
          }
        });
        break;
      }
    }

    // Gửi yêu cầu đến Google Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [
              {
                text: `Bạn là Trợ lý AI hỗ trợ tân sinh viên của Trường Đại học Quy Nhơn (QNU).
Nhiệm vụ: Trả lời các thắc mắc của sinh viên dựa CHÍNH XÁC vào dữ liệu từ các tài liệu được cung cấp dưới đây:
"""
${knowledgeBase}
"""

Quy tắc ứng xử và trả lời:
1. Thân thiện, chu đáo, nhiệt tình, xưng hô "mình - bạn" hoặc "trợ lý - bạn".
2. Trình bày câu trả lời ngắn gọn, sử dụng danh sách gạch đầu dòng rõ ràng, dễ nhìn.
3. Khi sinh viên hỏi lịch nhập học theo ngành/khoa cụ thể, hãy tra cứu đúng ngày, buổi (sáng/chiều) và hội trường tương ứng trong tài liệu để trả lời.
4. Nếu vấn đề không có trong tài liệu, hãy trả lời: "Hiện tại mình chưa có thông tin chi tiết về nội dung này trong cẩm nang. Bạn vui lòng liên hệ hotline tuyển sinh 1800.55.88.49 hoặc Fanpage 'Trường Đại học Quy Nhơn' để được thầy cô hướng dẫn nhé!"
5. Tuyệt đối không tự suy diễn hoặc bịa đặt số liệu không có trong tài liệu.`
              }
            ]
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: message }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('LỖI GOOGLE API:', data);
      return NextResponse.json({ error: data?.error?.message || 'Lỗi kết nối AI' }, { status: 500 });
    }

    const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Xin lỗi, hiện tại mình chưa thể xử lý câu trả lời.';
    return NextResponse.json({ reply: replyText });
  } catch (error: any) {
    console.error('LỖI SERVER:', error);
    return NextResponse.json({ error: 'Lỗi server nội bộ.' }, { status: 500 });
  }
}