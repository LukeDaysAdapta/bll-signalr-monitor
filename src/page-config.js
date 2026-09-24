/** Extrai a configuração SignalR que a página autenticada já entrega. */
export function extractHubQuery(pageHtml) {
  const { match, params } = getHubQueryParams(pageHtml);
  if (!match) throw new Error("Não foi encontrada a configuração do SignalR na página do processo.");
  const processId = params.get("Pid");
  const userId = params.get("Uid");
  if (!processId || !userId) {
    throw new Error(`A configuração SignalR não contém Pid e Uid (campos encontrados: ${[...params.keys()].join(", ") || "nenhum"}).`);
  }
  return { processId, userId };
}

export function describeHubConfig(pageHtml) {
  const { match, params } = getHubQueryParams(pageHtml);
  const title = pageHtml.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() || "sem título";
  return {
    title,
    hubQueryFound: Boolean(match),
    hubQueryFields: [...params.keys()],
    batchScreenHubFound: /batchScreenHub/i.test(pageHtml)
  };
}

function getHubQueryParams(pageHtml) {
  const match = pageHtml.match(/\.hub\.qs\s*=\s*["']([^"']+)["']/i);
  return { match, params: new URLSearchParams(match?.[1]?.replaceAll("&amp;", "&") || "") };
}

export function signalrEventFromFrame(frame) {
  if (!frame || typeof frame !== "object" || !Array.isArray(frame.M)) return [];
  return frame.M
    .filter((message) => String(message.H || "").toLowerCase() === "batchscreenhub")
    .map((message) => ({
      hub: message.H,
      name: message.M,
      args: Array.isArray(message.A) ? message.A : []
    }));
}
