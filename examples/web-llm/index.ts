import * as webllm from "@mlc-ai/web-llm";

let engine: webllm.MLCEngineInterface;

function setLabel(id: string, text: string) {
  const label = document.getElementById(id);
  if (label == null) {
    throw Error("Cannot find label " + id);
  }
  label.innerText = text;
}

async function initEngine() {
  const initProgressCallback = (report: webllm.InitProgressReport) => {
    setLabel("init-label", report.text);
  };
  // Option 1: If we do not specify appConfig, we use `prebuiltAppConfig` defined in `config.ts`
  const selectedModel = "Phi-3-mini-4k-instruct-q4f16_1-MLC-1k";
  engine = await webllm.CreateMLCEngine(
    selectedModel,
    {
      initProgressCallback: initProgressCallback,
      logLevel: "INFO", // specify the log level
    }
    // customize kv cache, use either context_window_size or sliding_window_size (with attention sink)
    //{
    //context_window_size: 2048,
    // sliding_window_size: 1024,
    // attention_sink_size: 4,
    //}
  );

  const content = `<html>
   <head></head>
   <body>
      <div dir="ltr">
         <table border="0" cellpadding="0" cellspacing="0" style="caption-side:bottom;border-collapse:collapse;color:rgb(33,37,41);font-family:"Courier New"">
            <tbody style="box-sizing:border-box;border-style:solid;border-width:0px">
               <tr style="box-sizing:border-box;border-style:solid;border-width:0px">
                  <td valign="top" style="box-sizing:border-box;border-color:inherit;border-style:solid;border-width:0px"><font size="2" face="Arial" style="box-sizing:border-box"><span style="box-sizing:border-box;font-weight:bolder"><u style="box-sizing:border-box">Claim:  </u></span></font></td>
                  <td style="box-sizing:border-box;border-color:inherit;border-style:solid;border-width:0px"><font size="2" face="Arial" style="box-sizing:border-box"><span style="box-sizing:border-box;font-weight:bolder"><u style="box-sizing:border-box">13-76H2-57L01</u></span></font></td>
               </tr>
            </tbody>
         </table>
         
      </div>
   </body>
</html>`;

  const inputLabel = document.getElementById("input-label");
  inputLabel.innerText = content;

  const messages = [
    {
      role: "system",
      content:
        "Parse the html given and extract the text from it. Return the text using json format {claimId: string, claimText: string}",
    },
    {
      role: "user",
      content,
    },
  ];

  const reply = await engine.chat.completions.create({
    messages: messages as webllm.ChatCompletionMessageParam[],
  });
  console.log(reply.choices[0].message);
  console.log(reply.usage);

  const label = document.getElementById("generate-label");
  label.innerText = reply.choices[0].message.content;
}

initEngine();
