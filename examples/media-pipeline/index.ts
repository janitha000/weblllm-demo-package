import {
  FilesetResolver,
  LlmInference,
  WebGpuOptions,
} from "@mediapipe/tasks-genai";
import axios from "axios";
import { get, set } from "idb-keyval";

function setLabel(id: string, text: string) {
  const label = document.getElementById(id);
  if (label == null) {
    throw Error("Cannot find label " + id);
  }
  label.innerText = text;
}

async function main() {
  const genai = await FilesetResolver.forGenAiTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai/wasm"
  );
  const gpu = await LlmInference.createWebGpuDevice();

  const llmInference = await LlmInference.createFromOptions(genai, {
    baseOptions: {
      modelAssetPath: await restoreFileFromIDB(),
      gpuOptions: {
        device: gpu,
      },
    },
    //maxTokens: maxTokens,
    //topK: topK,
    //temperature: temperature,
    //randomSeed: randomSeed,
  });

  const messages = [
    {
      role: "system",
      content:
        "Parse the html given and extract the text from it. If there is no text, just return empty string",
    },
    {
      role: "user",
      content: "<html><body><h1>Hello</h1></body></html>",
    },
  ];

  const reply = await llmInference.generateResponse(
    "Parse the html given and extract the text from it. If there is no text, just return empty string"
  );

  console.log(reply);
}

async function downloadModel(localMode: boolean = true) {
  const localURL =
    "http://127.0.0.1:8000/models/mp-gemma/gemma-2b-it-gpu-int4.bin";
  const remoteURL =
    "https://storage.googleapis.com/jmstore/kaggleweb/grader/g-2b-it-gpu-int4.bin";

  const url = localMode ? localURL : remoteURL;
  const startTime = Date.now();

  const response = await axios.get(url, {
    responseType: "blob",
    onDownloadProgress: (progressEvent) => {
      const progress = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total!
      );
      const timeElapsed = (Date.now() - startTime) / 1000;

      console.log("Model Download Progress: " + progress + "%");
      console.log("Time Elapsed: " + timeElapsed + "s");
    },
  });
  const blob = response.data;

  console.log("Model Download Progress: " + 100 + "%");

  await storeFileInIDB(blob);
}

async function storeFileInIDB(blob: Blob) {
  const start = performance.now();
  await set("gemma-2b-it-gpu-int4.bin", blob);

  const end = performance.now();
  console.log("Model file cached in IDB." + (end - start) / 1000 + "s");
}

async function restoreFileFromIDB(): Promise<string> {
  const start = performance.now();

  const file: Blob = (await get("gemma-2b-it-cpu-int4.bin")) as Blob;
  if (!file) {
    console.log("Model file not found in IDB. Downloading...");
    await downloadModel();
    return restoreFileFromIDB();
  }

  const end = performance.now();
  console.log("Cached model file found in IDB." + (end - start) / 1000 + "s");

  return URL.createObjectURL(file);
}

main();
