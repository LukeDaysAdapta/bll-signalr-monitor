import { readFile } from "node:fs/promises";

export function loadConfig(env = process.env) {
  const cookie = env.BLL_COOKIE;

  if (!cookie) throw new Error("BLL_COOKIE não foi informado no ambiente do processo.");
  const maxProcesses = Number(env.MAX_PROCESSES || 20);
  if (!Number.isInteger(maxProcesses) || maxProcesses < 1) {
    throw new Error("MAX_PROCESSES deve ser um inteiro positivo.");
  }

  return {
    cookie,
    storageDir: env.STORAGE_DIR || "./storage",
    maxProcesses,
    processUrl: env.PROCESS_URL,
    processUrlsFile: env.PROCESS_URLS_FILE
  };
}

export async function loadProcessUrls(config, readFileImpl = readFile) {
  let input;
  if (config.processUrlsFile) {
    input = await readFileImpl(config.processUrlsFile, "utf8");
  } else if (config.processUrl) {
    input = config.processUrl;
  } else {
    throw new Error("Informe PROCESS_URL ou PROCESS_URLS_FILE.");
  }

  const uniqueUrls = [...new Set(input.split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#")))];
  if (uniqueUrls.length > config.maxProcesses) {
    throw new Error(`A lista contém ${uniqueUrls.length} processos, acima de MAX_PROCESSES=${config.maxProcesses}.`);
  }
  return uniqueUrls.map(validateProcessUrl);
}

function validateProcessUrl(processUrl) {
  const url = new URL(processUrl);
  if (url.origin !== "https://bllcompras.com" || url.pathname !== "/BatchList") {
    throw new Error("Cada URL deve ser https://bllcompras.com/BatchList com param1.");
  }
  const processId = url.searchParams.get("param1");
  if (!processId) throw new Error("Cada URL deve conter param1.");
  return { baseUrl: url.origin, processUrl: url.toString(), processId };
}
