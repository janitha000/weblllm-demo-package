import { CreateMLCEngine } from "@mlc-ai/web-llm";
async function main() {
    const initProgressCallback = (initProgress) => {
        console.log(initProgress);
    };
    const selectedModel = "Llama-3.1-8B-Instruct-q4f32_1-MLC";
    const engine = await CreateMLCEngine(selectedModel, { initProgressCallback: initProgressCallback });
    const messages = [
        { role: "system", content: "You are a helpful AI assistant." },
        { role: "user", content: "Hello!" },
    ];
    const reply = await engine.chat.completions.create({
        messages: messages,
    });
    console.log(reply.choices[0].message);
    console.log(reply.usage);
}
async function main2() {
    console.log("main2");
}
main2();
//# sourceMappingURL=index.js.map