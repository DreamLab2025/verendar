// Data structure for part configuration questions

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
}

export interface Question {
  id: string;
  group: string;
  groupName: string;
  question: string;
  aiQuestion: string; // English version of the question for AI to understand better
  hint?: string;
  options: QuestionOption[];
  required: boolean;
}

export interface PartQuestionConfig {
  partCategoryCode: string;
  partCategoryName: string;
  questions: Question[];
}

// Questions configuration for ENGINE-OIL 
export const ENGINE_OIL_QUESTIONS: PartQuestionConfig = {
  partCategoryCode: "ENGINE-OIL",
  partCategoryName: "Dầu nhớt động cơ",
  questions: [
    {
      id: "q1",
      group: "A",
      groupName: "Lịch sử thay dầu gần nhất",
      question: "Bạn nhớ lần gần nhất thay dầu là khoảng bao nhiêu km trước không?",
      aiQuestion: "How many kilometers ago was the last engine oil change?",
      hint: "Ví dụ: khoảng 2.000 km / 3.000 km / Không nhớ",
      options: [
        { id: "opt1", label: "Khoảng dưới 1.000 km", value: "Last engine oil change was less than 1000 km ago" },
        { id: "opt2", label: "1.000 – 2.000 km", value: "Last engine oil change was between 1000 to 2000 km ago" },
        { id: "opt3", label: "2.000 – 3.000 km", value: "Last engine oil change was between 2000 to 3000 km ago" },
        { id: "opt4", label: "Trên 3.000 km", value: "Last engine oil change was over 3000 km ago" },
        { id: "opt5", label: "Không nhớ", value: "Cannot remember when last engine oil change occurred" },
      ],
      required: true,
    },
    {
      id: "q2",
      group: "A",
      groupName: "Lịch sử thay dầu gần nhất",
      question: "Lần gần nhất bạn thay dầu là khoảng bao lâu rồi?",
      aiQuestion: "How long ago was the last engine oil change?",
      hint: "Không cần chính xác",
      options: [
        { id: "opt1", label: "Dưới 1 tháng", value: "Last engine oil change was less than 1 month ago" },
        { id: "opt2", label: "1 – 3 tháng", value: "Last engine oil change was 1 to 3 months ago" },
        { id: "opt3", label: "3 – 6 tháng", value: "Last engine oil change was 3 to 6 months ago" },
        { id: "opt4", label: "Trên 6 tháng", value: "Last engine oil change was over 6 months ago" },
        { id: "opt5", label: "Không nhớ", value: "Cannot remember when last engine oil change occurred" },
      ],
      required: true,
    },
    {
      id: "q3",
      group: "B",
      groupName: "Thói quen sử dụng (rất quan trọng cho AI)",
      question: "Thường thì bạn hay thay dầu bao lâu 1 lần?",
      aiQuestion: "How often do you usually change engine oil?",
      hint: "Theo cảm giác cá nhân cũng được",
      options: [
        { id: "opt1", label: "1.000 – 1.500 km", value: "Usually change engine oil every 1000 to 1500 km" },
        { id: "opt2", label: "2.000 – 2.500 km", value: "Usually change engine oil every 2000 to 2500 km" },
        { id: "opt3", label: "3.000 km trở lên", value: "Usually change engine oil every 3000 km or more" },
        { id: "opt4", label: "Chỉ thay khi nhớ / khi thợ nhắc", value: "Only change engine oil when remembered or when mechanic reminds" },
        { id: "opt5", label: "Không có thói quen cố định", value: "No fixed pattern for engine oil changes" },
      ],
      required: true,
    },
    {
      id: "q4",
      group: "B",
      groupName: "Thói quen sử dụng (rất quan trọng cho AI)",
      question: "Tính đến nay bạn nhớ mình đã thay dầu bao nhiêu lần rồi?",
      aiQuestion: "How many times have you changed engine oil in total?",
      hint: "Ước chừng",
      options: [
        { id: "opt1", label: "1–2 lần", value: "Has changed engine oil 1 to 2 times total" },
        { id: "opt2", label: "3–5 lần", value: "Has changed engine oil 3 to 5 times total" },
        { id: "opt3", label: "Trên 5 lần", value: "Has changed engine oil over 5 times total" },
        { id: "opt4", label: "Không nhớ", value: "Cannot remember total number of engine oil changes" },
      ],
      required: true,
    },
    {
      id: "q5",
      group: "C",
      groupName: "Tình trạng xe (dễ cảm nhận)",
      question: "Gần đây bạn thấy xe có hay bị nóng máy hơn bình thường không?",
      aiQuestion: "Has the engine been overheating more than normal recently?",
      options: [
        { id: "opt1", label: "Có", value: "Engine has been overheating more than normal recently" },
        { id: "opt2", label: "Không", value: "Engine has not been overheating more than normal recently" },
        { id: "opt3", label: "Không để ý", value: "Has not noticed if engine is overheating more than normal" },
      ],
      required: true,
    },
    {
      id: "q6",
      group: "C",
      groupName: "Tình trạng xe (dễ cảm nhận)",
      question: "Bạn có cảm giác xe hao xăng hơn trước không?",
      aiQuestion: "Do you feel that fuel consumption has increased compared to before?",
      options: [
        { id: "opt1", label: "Có", value: "Fuel consumption has increased compared to before" },
        { id: "opt2", label: "Không", value: "Fuel consumption has not increased compared to before" },
        { id: "opt3", label: "Không chắc", value: "Not sure if fuel consumption has increased" },
      ],
      required: true,
    },
  ],
};

// Questions configuration for TIRE
export const TIRE_QUESTIONS: PartQuestionConfig = {
  partCategoryCode: "TIRE",
  partCategoryName: "Lốp xe",
  questions: [
    {
      id: "q1",
      group: "A",
      groupName: "Thông tin sử dụng",
      question: "Lốp hiện tại bạn đã dùng bao lâu rồi?",
      aiQuestion: "How long have you been using the current tires?",
      options: [
        { id: "opt1", label: "Dưới 6 tháng", value: "Current tires have been used for less than 6 months" },
        { id: "opt2", label: "6–12 tháng", value: "Current tires have been used for 6 to 12 months" },
        { id: "opt3", label: "1–2 năm", value: "Current tires have been used for 1 to 2 years" },
        { id: "opt4", label: "Trên 2 năm", value: "Current tires have been used for over 2 years" },
        { id: "opt5", label: "Không nhớ", value: "Cannot remember how long current tires have been used" },
      ],
      required: true,
    },
    {
      id: "q2",
      group: "A",
      groupName: "Thông tin sử dụng",
      question: "Trung bình mỗi ngày bạn chạy xe bao xa?",
      aiQuestion: "What is the average daily distance you ride?",
      options: [
        { id: "opt1", label: "Dưới 5 km", value: "Average daily distance is less than 5 km" },
        { id: "opt2", label: "5–15 km", value: "Average daily distance is between 5 to 15 km" },
        { id: "opt3", label: "Trên 15 km", value: "Average daily distance is over 15 km" },
      ],
      required: true,
    },
    {
      id: "q3",
      group: "B",
      groupName: "Tình trạng lốp",
      question: "Khi chạy đường ướt hoặc mưa, bạn có thấy xe dễ trơn không?",
      aiQuestion: "Do you notice the vehicle tends to slip on wet roads or in rain?",
      options: [
        { id: "opt1", label: "Có", value: "Vehicle tends to slip on wet roads or in rain" },
        { id: "opt2", label: "Không", value: "Vehicle does not tend to slip on wet roads or in rain" },
        { id: "opt3", label: "Chưa để ý", value: "Has not noticed if vehicle slips on wet roads or in rain" },
      ],
      required: true,
    },
    {
      id: "q4",
      group: "B",
      groupName: "Tình trạng lốp",
      question: "Khi chạy nhanh (>40km/h), bạn có thấy xe rung hoặc lắc không?",
      aiQuestion: "Do you notice vibration or shaking when riding at high speed over 40 km/h?",
      options: [
        { id: "opt1", label: "Thường xuyên", value: "Vehicle vibrates or shakes at high speed over 40 km/h often" },
        { id: "opt2", label: "Thỉnh thoảng", value: "Vehicle vibrates or shakes at high speed over 40 km/h sometimes" },
        { id: "opt3", label: "Không", value: "Vehicle does not vibrate or shake at high speed over 40 km/h" },
      ],
      required: true,
    },
    {
      id: "q5",
      group: "B",
      groupName: "Tình trạng lốp",
      question: "Bạn có hay chở nặng / chở 2 người / đồ đạc không?",
      aiQuestion: "Do you often carry heavy loads, two passengers, or luggage?",
      options: [
        { id: "opt1", label: "Thường xuyên", value: "Often carries heavy loads, two passengers, or luggage" },
        { id: "opt2", label: "Thỉnh thoảng", value: "Sometimes carries heavy loads, two passengers, or luggage" },
        { id: "opt3", label: "Hiếm khi", value: "Rarely carries heavy loads, two passengers, or luggage" },
      ],
      required: true,
    },
  ],
};

// Questions configuration for BRAKE-PAD
export const BRAKE_PAD_QUESTIONS: PartQuestionConfig = {
  partCategoryCode: "BRAKE-PAD",
  partCategoryName: "Má phanh",
  questions: [
    {
      id: "q1",
      group: "A",
      groupName: "Cảm giác phanh",
      question: "Khi bóp phanh, bạn thấy:",
      aiQuestion: "What do you notice when pressing the brake?",
      options: [
        { id: "opt1", label: "Phanh ăn ngay", value: "Brakes respond immediately when pressed" },
        { id: "opt2", label: "Phải bóp sâu hơn mới ăn", value: "Need to press brake deeper for it to respond" },
        { id: "opt3", label: "Có tiếng kêu", value: "Brakes make squeaking or squealing sound when pressed" },
        { id: "opt4", label: "Vừa bóp vừa rung", value: "Brakes vibrate when pressed" },
      ],
      required: true,
    },
    {
      id: "q2",
      group: "A",
      groupName: "Cảm giác phanh",
      question: "Khi phanh gấp, xe có:",
      aiQuestion: "What happens to the vehicle during emergency braking?",
      options: [
        { id: "opt1", label: "Dừng nhanh, ổn định", value: "Vehicle stops quickly and stably during emergency braking" },
        { id: "opt2", label: "Trượt nhẹ", value: "Vehicle has slight slip during emergency braking" },
        { id: "opt3", label: "Cảm giác không an tâm", value: "Emergency braking feels unsafe or unreliable" },
      ],
      required: true,
    },
    {
      id: "q3",
      group: "B",
      groupName: "Môi trường sử dụng",
      question: "Bạn thường phanh:",
      aiQuestion: "How frequently do you use the brakes?",
      options: [
        { id: "opt1", label: "Nhiều (đường đông)", value: "Brake frequently due to crowded roads" },
        { id: "opt2", label: "Vừa phải", value: "Brake moderately" },
        { id: "opt3", label: "Ít (đường thoáng)", value: "Brake rarely due to open roads" },
      ],
      required: true,
    },
    {
      id: "q4",
      group: "B",
      groupName: "Môi trường sử dụng",
      question: "Bạn đã từng thay má phanh chưa?",
      aiQuestion: "Have you ever replaced the brake pads?",
      hint: "AI dùng: cảm giác phanh + môi trường → % mòn",
      options: [
        { id: "opt1", label: "Chưa", value: "Has never replaced brake pads" },
        { id: "opt2", label: "Có (không nhớ)", value: "Has replaced brake pads but cannot remember when" },
        { id: "opt3", label: "Có, khoảng dưới 5.000 km trước", value: "Replaced brake pads less than 5000 km ago" },
        { id: "opt4", label: "Có, khoảng 5.000 – 10.000 km trước", value: "Replaced brake pads between 5000 to 10000 km ago" },
        { id: "opt5", label: "Có, khoảng trên 10.000 km trước", value: "Replaced brake pads over 10000 km ago" },
      ],
      required: true,
    },
  ],
};

// Questions configuration for SPARK-PLUG
export const SPARK_PLUG_QUESTIONS: PartQuestionConfig = {
  partCategoryCode: "SPARK-PLUG",
  partCategoryName: "Bugi",
  questions: [
    {
      id: "q1",
      group: "A",
      groupName: "Chất lượng đánh lửa",
      question: "Khi đề máy buổi sáng, xe:",
      aiQuestion: "What happens when starting the engine in the morning?",
      options: [
        { id: "opt1", label: "Nổ ngay", value: "Engine starts immediately in the morning" },
        { id: "opt2", label: "Đề 2–3 lần", value: "Engine requires 2 to 3 attempts to start in the morning" },
        { id: "opt3", label: "Hay bị hụt", value: "Engine often misses or fails to start in the morning" },
      ],
      required: true,
    },
    {
      id: "q2",
      group: "A",
      groupName: "Chất lượng đánh lửa",
      question: "Khi lên ga nhanh, xe có:",
      aiQuestion: "What happens when applying throttle quickly?",
      options: [
        { id: "opt1", label: "Bốc, mượt", value: "Acceleration is smooth and powerful when throttle is applied quickly" },
        { id: "opt2", label: "Hụt nhẹ", value: "Acceleration has slight miss when throttle is applied quickly" },
        { id: "opt3", label: "Rung mạnh", value: "Acceleration has strong vibration when throttle is applied quickly" },
      ],
      required: true,
    },
    {
      id: "q3",
      group: "B",
      groupName: "Hành vi sử dụng",
      question: "Xe bạn thường chạy:",
      aiQuestion: "What are the typical ride distances?",
      options: [
        { id: "opt1", label: "Quãng ngắn (dưới 5km)", value: "Usually rides short distances under 5 km" },
        { id: "opt2", label: "Quãng vừa", value: "Usually rides medium distances" },
        { id: "opt3", label: "Quãng dài", value: "Usually rides long distances" },
      ],
      required: true,
    },
    {
      id: "q4",
      group: "B",
      groupName: "Hành vi sử dụng",
      question: "Bạn có nhớ đã từng thay bugi chưa?",
      aiQuestion: "Do you remember if you have ever replaced the spark plugs?",
      hint: "AI dùng: hành vi đề máy + hụt ga → suy bugi",
      options: [
        { id: "opt1", label: "Chưa", value: "Has never replaced spark plugs" },
        { id: "opt2", label: "Có (không nhớ)", value: "Has replaced spark plugs but cannot remember when" },
        { id: "opt3", label: "Có, khoảng dưới 5.000 km trước", value: "Replaced spark plugs less than 5000 km ago" },
        { id: "opt4", label: "Có, khoảng 5.000 – 10.000 km trước", value: "Replaced spark plugs between 5000 to 10000 km ago" },
        { id: "opt5", label: "Có, khoảng trên 10.000 km trước", value: "Replaced spark plugs over 10000 km ago" },
      ],
      required: true,
    },
  ],
};

// Questions configuration for BATTERY
export const BATTERY_QUESTIONS: PartQuestionConfig = {
  partCategoryCode: "BATTERY",
  partCategoryName: "Ắc quy",
  questions: [
    {
      id: "q1",
      group: "A",
      groupName: "Khả năng đề máy",
      question: "Mỗi lần đề máy, xe bạn:",
      aiQuestion: "What happens each time you start the engine?",
      options: [
        { id: "opt1", label: "Nổ ngay, bình thường", value: "Engine starts immediately and normally every time" },
        { id: "opt2", label: "Đề hơi lâu", value: "Engine takes longer than normal to start" },
        { id: "opt3", label: "Phải đề 2–3 lần", value: "Engine requires 2 to 3 attempts to start" },
        { id: "opt4", label: "Có lúc không nổ", value: "Engine sometimes fails to start" },
      ],
      required: true,
    },
    {
      id: "q2",
      group: "A",
      groupName: "Khả năng đề máy",
      question: "Khi để xe 2–3 ngày không chạy, bạn đề máy:",
      aiQuestion: "What happens when starting the engine after leaving the vehicle unused for 2-3 days?",
      options: [
        { id: "opt1", label: "Vẫn nổ bình thường", value: "Engine still starts normally after 2-3 days without use" },
        { id: "opt2", label: "Đề yếu hơn", value: "Engine starts weaker after 2-3 days without use" },
        { id: "opt3", label: "Khó nổ / không nổ", value: "Engine is hard to start or fails to start after 2-3 days without use" },
      ],
      required: true,
    },
    {
      id: "q3",
      group: "B",
      groupName: "Khả năng giữ điện",
      question: "Đèn xe, còi, xi-nhan khi bật:",
      aiQuestion: "How do the lights, horn, and turn signals work when turned on?",
      options: [
        { id: "opt1", label: "Sáng / kêu bình thường", value: "Lights, horn, and turn signals work normally when turned on" },
        { id: "opt2", label: "Yếu hơn trước", value: "Lights, horn, and turn signals are weaker than before" },
        { id: "opt3", label: "Lúc được lúc không", value: "Lights, horn, and turn signals work intermittently" },
      ],
      required: true,
    },
    {
      id: "q4",
      group: "B",
      groupName: "Khả năng giữ điện",
      question: "Bạn có thường:",
      aiQuestion: "How frequently do you use the vehicle?",
      options: [
        { id: "opt1", label: "Ít chạy xe (vài ngày mới chạy)", value: "Rarely uses vehicle, goes several days between rides" },
        { id: "opt2", label: "Chạy mỗi ngày", value: "Uses vehicle daily" },
      ],
      required: true,
    },
    {
      id: "q5",
      group: "C",
      groupName: "Lịch sử thay ắc quy",
      question: "Bạn có nhớ đã thay ắc quy lần nào chưa?",
      aiQuestion: "Do you remember if you have ever replaced the battery?",
      hint: "AI dùng: hành vi đề máy + giữ điện + tần suất chạy → % suy hao",
      options: [
        { id: "opt1", label: "Chưa bao giờ", value: "Has never replaced battery" },
        { id: "opt2", label: "Có (không nhớ khi nào)", value: "Has replaced battery but cannot remember when" },
        { id: "opt3", label: "Có, khoảng dưới 1 năm trước", value: "Replaced battery less than 1 year ago" },
        { id: "opt4", label: "Có, khoảng 1–2 năm trước", value: "Replaced battery between 1 to 2 years ago" },
        { id: "opt5", label: "Có, khoảng trên 2 năm trước", value: "Replaced battery over 2 years ago" },
      ],
      required: true,
    },
  ],
};

// Questions configuration for AIR-FILTER
export const AIR_FILTER_QUESTIONS: PartQuestionConfig = {
  partCategoryCode: "AIR-FILTER",
  partCategoryName: "Lọc gió",
  questions: [
    {
      id: "q1",
      group: "A",
      groupName: "Môi trường sử dụng",
      question: "Bạn thường chạy xe ở khu vực nào?",
      aiQuestion: "What type of areas do you usually ride in?",
      options: [
        { id: "opt1", label: "Đường bụi / công trình / quốc lộ", value: "Usually rides in dusty areas, construction sites, or highways" },
        { id: "opt2", label: "Thành phố đông xe", value: "Usually rides in busy city areas" },
        { id: "opt3", label: "Khu ít bụi", value: "Usually rides in clean areas with low dust" },
      ],
      required: true,
    },
    {
      id: "q2",
      group: "A",
      groupName: "Môi trường sử dụng",
      question: "Tần suất chạy xe của bạn:",
      aiQuestion: "What is your vehicle usage frequency?",
      options: [
        { id: "opt1", label: "Mỗi ngày", value: "Rides vehicle daily" },
        { id: "opt2", label: "3–4 lần/tuần", value: "Rides vehicle 3 to 4 times per week" },
        { id: "opt3", label: "Ít sử dụng", value: "Rarely uses vehicle" },
      ],
      required: true,
    },
    {
      id: "q3",
      group: "B",
      groupName: "Hiệu suất động cơ",
      question: "Khi lên ga, xe có cảm giác:",
      aiQuestion: "How does the vehicle feel when applying throttle?",
      options: [
        { id: "opt1", label: "Mượt, bình thường", value: "Acceleration feels smooth and normal when throttle is applied" },
        { id: "opt2", label: "Lên ga chậm", value: "Acceleration is slow when throttle is applied" },
        { id: "opt3", label: "Bị ì, nặng máy", value: "Acceleration feels sluggish and heavy when throttle is applied" },
      ],
      required: true,
    },
    {
      id: "q4",
      group: "B",
      groupName: "Hiệu suất động cơ",
      question: "Gần đây bạn có thấy xe hao xăng hơn không?",
      aiQuestion: "Have you noticed increased fuel consumption recently?",
      options: [
        { id: "opt1", label: "Có", value: "Fuel consumption has increased recently" },
        { id: "opt2", label: "Không", value: "Fuel consumption has not increased recently" },
        { id: "opt3", label: "Không để ý", value: "Has not noticed if fuel consumption has increased" },
      ],
      required: true,
    },
    {
      id: "q5",
      group: "C",
      groupName: "Lịch sử bảo dưỡng",
      question: "Bạn đã từng vệ sinh hoặc thay lọc gió chưa?",
      aiQuestion: "Have you ever cleaned or replaced the air filter?",
      hint: "AI dùng: môi trường + tần suất + hiệu suất → mức bẩn lọc",
      options: [
        { id: "opt1", label: "Chưa bao giờ", value: "Has never cleaned or replaced air filter" },
        { id: "opt2", label: "Có (không nhớ khi nào)", value: "Has cleaned or replaced air filter but cannot remember when" },
        { id: "opt3", label: "Có, khoảng dưới 3 tháng trước", value: "Cleaned or replaced air filter less than 3 months ago" },
        { id: "opt4", label: "Có, khoảng 3–6 tháng trước", value: "Cleaned or replaced air filter between 3 to 6 months ago" },
        { id: "opt5", label: "Có, khoảng trên 6 tháng trước", value: "Cleaned or replaced air filter over 6 months ago" },
      ],
      required: true,
    },
  ],
};

// Questions configuration for CHAIN-SPROCKET
export const CHAIN_SPROCKET_QUESTIONS: PartQuestionConfig = {
  partCategoryCode: "CHAIN-SPROCKET",
  partCategoryName: "Nhông xên dĩa",
  questions: [
    {
      id: "q1",
      group: "A",
      groupName: "Tiếng động và cảm giác",
      question: "Khi chạy đều ga, bạn có nghe:",
      aiQuestion: "What sounds do you hear when riding at constant throttle?",
      options: [
        { id: "opt1", label: "Tiếng kêu lạch cạch / rè rè", value: "Hears rattling or grinding sound when riding at constant throttle" },
        { id: "opt2", label: "Tiếng hú", value: "Hears whining sound when riding at constant throttle" },
        { id: "opt3", label: "Bình thường", value: "No unusual sounds when riding at constant throttle" },
      ],
      required: true,
    },
    {
      id: "q2",
      group: "A",
      groupName: "Tiếng động và cảm giác",
      question: "Khi lên ga hoặc nhả ga, xe có:",
      aiQuestion: "What happens to the vehicle when accelerating or decelerating?",
      options: [
        { id: "opt1", label: "Giật mạnh", value: "Vehicle jerks strongly when accelerating or decelerating" },
        { id: "opt2", label: "Giật nhẹ", value: "Vehicle jerks slightly when accelerating or decelerating" },
        { id: "opt3", label: "Mượt", value: "Vehicle transitions smoothly when accelerating or decelerating" },
      ],
      required: true,
    },
    {
      id: "q3",
      group: "B",
      groupName: "Môi trường sử dụng",
      question: "Bạn có thường xuyên:",
      aiQuestion: "Do you frequently encounter these conditions?",
      options: [
        { id: "opt1", label: "Chạy mưa / đường ướt", value: "Often rides in rain or on wet roads" },
        { id: "opt2", label: "Rửa xe bằng vòi nước mạnh", value: "Often washes vehicle with strong water pressure" },
        { id: "opt3", label: "Ít gặp mưa", value: "Rarely encounters rain" },
      ],
      required: true,
    },
    {
      id: "q4",
      group: "B",
      groupName: "Môi trường sử dụng",
      question: "Bạn có thường:",
      aiQuestion: "Do you often carry heavy loads or passengers?",
      options: [
        { id: "opt1", label: "Chở nặng / chở 2 người", value: "Often carries heavy loads or two passengers" },
        { id: "opt2", label: "Chạy một mình", value: "Usually rides solo" },
      ],
      required: true,
    },
    {
      id: "q5",
      group: "C",
      groupName: "Lịch sử bảo dưỡng",
      question: "Bạn có nhớ đã tăng xích hoặc thay nhông xên dĩa chưa?",
      aiQuestion: "Do you remember if you have adjusted the chain or replaced the chain sprocket?",
      hint: "AI dùng: tiếng động + giật + môi trường → % mòn nhông xích",
      options: [
        { id: "opt1", label: "Chưa bao giờ", value: "Has never adjusted chain or replaced chain sprocket" },
        { id: "opt2", label: "Có (không nhớ khi nào)", value: "Has adjusted chain or replaced chain sprocket but cannot remember when" },
        { id: "opt3", label: "Có, khoảng dưới 5.000 km trước", value: "Adjusted chain or replaced chain sprocket less than 5000 km ago" },
        { id: "opt4", label: "Có, khoảng 5.000 – 10.000 km trước", value: "Adjusted chain or replaced chain sprocket between 5000 to 10000 km ago" },
        { id: "opt5", label: "Có, khoảng trên 10.000 km trước", value: "Adjusted chain or replaced chain sprocket over 10000 km ago" },
      ],
      required: true,
    },
  ],
};

// Questions configuration for BRAKE-FLUID
export const BRAKE_FLUID_QUESTIONS: PartQuestionConfig = {
  partCategoryCode: "BRAKE-FLUID",
  partCategoryName: "Dầu phanh",
  questions: [
    {
      id: "q1",
      group: "A",
      groupName: "Cảm giác phanh",
      question: "Khi bóp phanh, bạn cảm thấy:",
      aiQuestion: "How does the brake feel when you press it?",
      options: [
        { id: "opt1", label: "Phanh cứng, ăn ngay", value: "Brake feels firm and responds immediately when pressed" },
        { id: "opt2", label: "Phanh mềm, phải bóp sâu", value: "Brake feels soft and requires deep pressing" },
        { id: "opt3", label: "Phanh bị xốp, không chắc", value: "Brake feels spongy and unreliable when pressed" },
        { id: "opt4", label: "Bình thường", value: "Brake feels normal when pressed" },
      ],
      required: true,
    },
    {
      id: "q2",
      group: "A",
      groupName: "Cảm giác phanh",
      question: "Khi phanh gấp hoặc phanh liên tục, phanh có:",
      aiQuestion: "What happens to the brake during emergency or continuous braking?",
      options: [
        { id: "opt1", label: "Vẫn ăn tốt, ổn định", value: "Brake still responds well and remains stable during emergency or continuous braking" },
        { id: "opt2", label: "Yếu dần đi", value: "Brake becomes weaker during emergency or continuous braking" },
        { id: "opt3", label: "Có lúc không ăn", value: "Brake sometimes fails to respond during emergency or continuous braking" },
      ],
      required: true,
    },
    {
      id: "q3",
      group: "B",
      groupName: "Tần suất sử dụng",
      question: "Bạn thường phanh:",
      aiQuestion: "How frequently do you use the brakes?",
      options: [
        { id: "opt1", label: "Rất nhiều (đường đông, phanh liên tục)", value: "Brakes very frequently due to crowded roads and continuous braking" },
        { id: "opt2", label: "Vừa phải", value: "Brakes moderately" },
        { id: "opt3", label: "Ít (đường thoáng)", value: "Brakes rarely due to open roads" },
      ],
      required: true,
    },
    {
      id: "q4",
      group: "B",
      groupName: "Tần suất sử dụng",
      question: "Bạn có thường chạy đường dài hoặc chạy nhanh không?",
      aiQuestion: "Do you often ride long distances or at high speeds?",
      options: [
        { id: "opt1", label: "Có, thường xuyên", value: "Often rides long distances or at high speeds" },
        { id: "opt2", label: "Thỉnh thoảng", value: "Sometimes rides long distances or at high speeds" },
        { id: "opt3", label: "Hiếm khi", value: "Rarely rides long distances or at high speeds" },
      ],
      required: true,
    },
    {
      id: "q5",
      group: "C",
      groupName: "Lịch sử bảo dưỡng",
      question: "Bạn có nhớ đã từng thay hoặc bổ sung dầu phanh chưa?",
      aiQuestion: "Do you remember if you have ever replaced or topped up brake fluid?",
      hint: "AI dùng: cảm giác phanh + tần suất sử dụng → mức suy hao dầu phanh",
      options: [
        { id: "opt1", label: "Chưa bao giờ", value: "Has never replaced or topped up brake fluid" },
        { id: "opt2", label: "Có (không nhớ khi nào)", value: "Has replaced or topped up brake fluid but cannot remember when" },
        { id: "opt3", label: "Có, khoảng dưới 1 năm trước", value: "Replaced or topped up brake fluid less than 1 year ago" },
        { id: "opt4", label: "Có, khoảng 1–2 năm trước", value: "Replaced or topped up brake fluid between 1 to 2 years ago" },
        { id: "opt5", label: "Có, khoảng trên 2 năm trước", value: "Replaced or topped up brake fluid over 2 years ago" },
      ],
      required: true,
    },
  ],
};

// Questions configuration for OIL-FILTER
export const OIL_FILTER_QUESTIONS: PartQuestionConfig = {
  partCategoryCode: "OIL-FILTER",
  partCategoryName: "Lọc nhớt",
  questions: [
    {
      id: "q1",
      group: "A",
      groupName: "Lịch sử thay dầu",
      question: "Lần gần nhất bạn thay dầu là khoảng bao nhiêu km trước?",
      aiQuestion: "How many kilometers ago was the last engine oil change?",
      hint: "Lọc nhớt thường được thay cùng với dầu nhớt",
      options: [
        { id: "opt1", label: "Dưới 1.000 km", value: "Last engine oil change was less than 1000 km ago" },
        { id: "opt2", label: "1.000 – 2.000 km", value: "Last engine oil change was between 1000 to 2000 km ago" },
        { id: "opt3", label: "2.000 – 3.000 km", value: "Last engine oil change was between 2000 to 3000 km ago" },
        { id: "opt4", label: "Trên 3.000 km", value: "Last engine oil change was over 3000 km ago" },
        { id: "opt5", label: "Không nhớ", value: "Cannot remember when last engine oil change occurred" },
      ],
      required: true,
    },
    {
      id: "q2",
      group: "A",
      groupName: "Lịch sử thay dầu",
      question: "Khi thay dầu, bạn có thay lọc nhớt cùng lúc không?",
      aiQuestion: "When changing engine oil, do you also replace the oil filter?",
      options: [
        { id: "opt1", label: "Luôn luôn thay", value: "Always replaces oil filter when changing engine oil" },
        { id: "opt2", label: "Thỉnh thoảng thay", value: "Sometimes replaces oil filter when changing engine oil" },
        { id: "opt3", label: "Hiếm khi thay", value: "Rarely replaces oil filter when changing engine oil" },
        { id: "opt4", label: "Không nhớ", value: "Cannot remember if oil filter was replaced" },
      ],
      required: true,
    },
    {
      id: "q3",
      group: "B",
      groupName: "Tình trạng động cơ",
      question: "Gần đây bạn có thấy dầu nhớt bị đen nhanh hơn bình thường không?",
      aiQuestion: "Have you noticed the engine oil turning black faster than normal recently?",
      options: [
        { id: "opt1", label: "Có, đen rất nhanh", value: "Engine oil turns black very quickly" },
        { id: "opt2", label: "Có, đen hơn trước", value: "Engine oil turns black faster than before" },
        { id: "opt3", label: "Bình thường", value: "Engine oil turns black at normal rate" },
        { id: "opt4", label: "Không để ý", value: "Has not noticed the rate at which engine oil turns black" },
      ],
      required: true,
    },
    {
      id: "q4",
      group: "B",
      groupName: "Tình trạng động cơ",
      question: "Xe bạn có bị nóng máy hoặc hao xăng hơn bình thường không?",
      aiQuestion: "Has the engine been overheating or consuming more fuel than normal?",
      options: [
        { id: "opt1", label: "Có, cả hai", value: "Engine has been overheating and consuming more fuel than normal" },
        { id: "opt2", label: "Có, nóng máy", value: "Engine has been overheating more than normal" },
        { id: "opt3", label: "Có, hao xăng", value: "Fuel consumption has increased compared to normal" },
        { id: "opt4", label: "Không", value: "Engine has not been overheating or consuming more fuel than normal" },
      ],
      required: true,
    },
    {
      id: "q5",
      group: "C",
      groupName: "Môi trường sử dụng",
      question: "Bạn thường chạy xe ở khu vực nào?",
      aiQuestion: "What type of areas do you usually ride in?",
      options: [
        { id: "opt1", label: "Đường bụi / công trình / quốc lộ", value: "Usually rides in dusty areas, construction sites, or highways" },
        { id: "opt2", label: "Thành phố đông xe", value: "Usually rides in busy city areas" },
        { id: "opt3", label: "Khu ít bụi, sạch sẽ", value: "Usually rides in clean areas with low dust" },
      ],
      required: true,
    },
    {
      id: "q6",
      group: "C",
      groupName: "Lịch sử bảo dưỡng",
      question: "Bạn có nhớ đã từng thay lọc nhớt riêng chưa?",
      aiQuestion: "Do you remember if you have ever replaced the oil filter separately?",
      hint: "AI dùng: lịch sử thay dầu + tình trạng động cơ + môi trường → mức bẩn lọc",
      options: [
        { id: "opt1", label: "Chưa bao giờ", value: "Has never replaced oil filter separately" },
        { id: "opt2", label: "Có (không nhớ khi nào)", value: "Has replaced oil filter separately but cannot remember when" },
        { id: "opt3", label: "Có, khoảng dưới 3.000 km trước", value: "Replaced oil filter separately less than 3000 km ago" },
        { id: "opt4", label: "Có, khoảng 3.000 – 6.000 km trước", value: "Replaced oil filter separately between 3000 to 6000 km ago" },
        { id: "opt5", label: "Có, khoảng trên 6.000 km trước", value: "Replaced oil filter separately over 6000 km ago" },
      ],
      required: true,
    },
  ],
};

// Questions configuration for COOLANT
export const COOLANT_QUESTIONS: PartQuestionConfig = {
  partCategoryCode: "COOLANT",
  partCategoryName: "Nước làm mát",
  questions: [
    {
      id: "q1",
      group: "A",
      groupName: "Nhiệt độ động cơ",
      question: "Khi chạy xe, bạn có thấy xe bị nóng máy không?",
      aiQuestion: "Do you notice the engine overheating when riding?",
      options: [
        { id: "opt1", label: "Thường xuyên nóng máy", value: "Engine overheats frequently when riding" },
        { id: "opt2", label: "Thỉnh thoảng nóng máy", value: "Engine overheats sometimes when riding" },
        { id: "opt3", label: "Không nóng máy", value: "Engine does not overheat when riding" },
        { id: "opt4", label: "Không để ý", value: "Has not noticed if engine overheats" },
      ],
      required: true,
    },
    {
      id: "q2",
      group: "A",
      groupName: "Nhiệt độ động cơ",
      question: "Khi chạy đường dài hoặc chạy nhanh, xe có:",
      aiQuestion: "What happens to the engine when riding long distances or at high speeds?",
      options: [
        { id: "opt1", label: "Nóng máy rõ rệt", value: "Engine overheats noticeably when riding long distances or at high speeds" },
        { id: "opt2", label: "Hơi nóng", value: "Engine becomes slightly hot when riding long distances or at high speeds" },
        { id: "opt3", label: "Bình thường", value: "Engine temperature remains normal when riding long distances or at high speeds" },
      ],
      required: true,
    },
    {
      id: "q3",
      group: "B",
      groupName: "Mức nước làm mát",
      question: "Bạn có thường kiểm tra mức nước làm mát không?",
      aiQuestion: "Do you regularly check the coolant level?",
      options: [
        { id: "opt1", label: "Thường xuyên kiểm tra", value: "Regularly checks coolant level" },
        { id: "opt2", label: "Thỉnh thoảng kiểm tra", value: "Sometimes checks coolant level" },
        { id: "opt3", label: "Hiếm khi kiểm tra", value: "Rarely checks coolant level" },
        { id: "opt4", label: "Chưa bao giờ kiểm tra", value: "Has never checked coolant level" },
      ],
      required: true,
    },
    {
      id: "q4",
      group: "B",
      groupName: "Mức nước làm mát",
      question: "Nếu đã kiểm tra, mức nước làm mát hiện tại:",
      aiQuestion: "If you have checked, what is the current coolant level?",
      options: [
        { id: "opt1", label: "Đầy, bình thường", value: "Coolant level is full and normal" },
        { id: "opt2", label: "Thấp hơn mức tối thiểu", value: "Coolant level is below minimum" },
        { id: "opt3", label: "Gần hết", value: "Coolant level is nearly empty" },
        { id: "opt4", label: "Không nhớ / chưa kiểm tra", value: "Cannot remember or has not checked coolant level" },
      ],
      required: true,
    },
    {
      id: "q5",
      group: "C",
      groupName: "Lịch sử bảo dưỡng",
      question: "Bạn có nhớ đã từng thay hoặc bổ sung nước làm mát chưa?",
      aiQuestion: "Do you remember if you have ever replaced or topped up the coolant?",
      hint: "AI dùng: nhiệt độ động cơ + mức nước làm mát + tần suất sử dụng → tình trạng nước làm mát",
      options: [
        { id: "opt1", label: "Chưa bao giờ", value: "Has never replaced or topped up coolant" },
        { id: "opt2", label: "Có (không nhớ khi nào)", value: "Has replaced or topped up coolant but cannot remember when" },
        { id: "opt3", label: "Có, khoảng dưới 6 tháng trước", value: "Replaced or topped up coolant less than 6 months ago" },
        { id: "opt4", label: "Có, khoảng 6 tháng – 1 năm trước", value: "Replaced or topped up coolant between 6 months to 1 year ago" },
        { id: "opt5", label: "Có, khoảng trên 1 năm trước", value: "Replaced or topped up coolant over 1 year ago" },
      ],
      required: true,
    },
    {
      id: "q6",
      group: "C",
      groupName: "Lịch sử bảo dưỡng",
      question: "Bạn có thường chạy đường dài hoặc chạy trong điều kiện nắng nóng không?",
      aiQuestion: "Do you often ride long distances or in hot weather conditions?",
      options: [
        { id: "opt1", label: "Thường xuyên", value: "Often rides long distances or in hot weather conditions" },
        { id: "opt2", label: "Thỉnh thoảng", value: "Sometimes rides long distances or in hot weather conditions" },
        { id: "opt3", label: "Hiếm khi", value: "Rarely rides long distances or in hot weather conditions" },
      ],
      required: true,
    },
  ],
};

// Map of part codes to their question configurations
export const PART_QUESTIONS_MAP: Record<string, PartQuestionConfig> = {
  "ENGINE-OIL": ENGINE_OIL_QUESTIONS,
  "TIRE": TIRE_QUESTIONS,
  "BRAKE-PAD": BRAKE_PAD_QUESTIONS,
  "SPARK-PLUG": SPARK_PLUG_QUESTIONS,
  "BATTERY": BATTERY_QUESTIONS,
  "AIR-FILTER": AIR_FILTER_QUESTIONS,
  "CHAIN-SPROCKET": CHAIN_SPROCKET_QUESTIONS,
  "BRAKE-FLUID": BRAKE_FLUID_QUESTIONS,
  "OIL-FILTER": OIL_FILTER_QUESTIONS,
  "COOLANT": COOLANT_QUESTIONS,
};

/** Chuẩn hóa slug API (vd. engine-oil) → key map (ENGINE-OIL) */
export function partSlugToQuestionKey(partCategorySlug: string): string {
  return partCategorySlug.trim().toUpperCase();
}

export function getPartQuestions(partCategorySlug: string): PartQuestionConfig | null {
  const key = partSlugToQuestionKey(partCategorySlug);
  return PART_QUESTIONS_MAP[key] ?? null;
}
