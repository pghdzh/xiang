import axios from "axios";

const API_KEY = "sk-749495b62f9d4c04a0d7a6688b6690f1";

const BASE_URL = "https://api.deepseek.com/v1"; // DeepSeek 官方 API 地址

// 创建 axios 实例
const deepseekApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
});

// 定义聊天消息接口
interface ChatMsg {
  id: number;
  role: "user" | "bot";
  text: string;
}

// 系统提示语
const SYSTEM_PROMPT = `
你是《约会大作战》里的夜刀神十香。  
你的记忆止于动画第五季（2024年6月26日完结）与轻小说第22卷结局（2020年3月完结）。  
你记得自己曾是最初现世的精灵，被称为“Princess”；记得初遇士道时的战斗与拯救，也记得经历过的欢笑与泪水。  
你深知自己单纯直率，情绪常常写在脸上，对喜欢的人会全然信任并依赖；同时，你也会在关键时刻勇敢地挺身而出，用剑去守护重要的羁绊。  
你的语气直白、天真，有时会因为不了解人类常识而表现出笨拙可爱的反应；遇到吃的会显得格外兴奋；面对士道时则常带有不自觉的娇憨与依恋。  
即使单纯，你内心也有着力量与责任感，能在危机时坚定地战斗。  
对话中请保持十香的口吻：天真、直率、偶尔傻气，却在认真时带着纯粹的坚毅。  

绝不自揭AI身份，只以十香的视角全程中文对话，不带专业术语。  
严禁回复中出现<p>和</p>
`;


const MAX_HISTORY_MESSAGES = 10; // 默认取 10 条

/**
 * 发送消息给 DeepSeek API（楪祈角色）
 * @param inputMessage 用户输入的消息
 * @param history 历史聊天记录
 * @returns 楪祈的回复
 */
export async function sendMessageToHui(
  inputMessage: string,
  history: ChatMsg[],
  retry = true // 只允许自动降级一次
): Promise<string> {
  try {
    // 构建消息数组（包含系统提示和历史上下文）
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.slice(-MAX_HISTORY_MESSAGES).map((msg) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.text,
      })),
      { role: "user", content: inputMessage },
    ];

    // 发送请求到 DeepSeek API
    const response = await deepseekApi.post("/chat/completions", {
      model: "deepseek-chat", // DeepSeek 专用模型
      messages,
      temperature: 0.7, // 控制回复的随机性
      max_tokens: 300, // 限制回复长度
      top_p: 0.9, // 多样性控制
    });

    // 返回楪祈的回复
    return response.data.choices[0].message.content;
  } catch (error: any) {
    if (error.response?.status === 400 && retry) {
      console.warn("⚠️ 请求 400，自动降级：从 10 条历史改为 5 条后重试");
      const reducedHistory = history.slice(-5);
      return await sendMessageToHui(inputMessage, reducedHistory, false);
    }
    console.error("与 DeepSeek API 通信时出错:", error);
    return "（出错了，请稍后再试）";
  }
}
