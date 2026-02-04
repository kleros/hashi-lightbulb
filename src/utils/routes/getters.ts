import { ROUTES } from "./registry";
import { Bridges, type FlatRouteFile, type HashiAddress } from "../types";
import { Address } from "viem";
import { resolveChain, type UIChain } from "@/utils/chains";

/* --------------------------------------------------
   Internal helper
-------------------------------------------------- */

function routeKey(sourceChainId: number, destinationChainId: number): string {
  return `${sourceChainId}-${destinationChainId}`;
}

export function getRoute(
  sourceChainId: number,
  destinationChainId: number,
): FlatRouteFile | undefined {
  return ROUTES[routeKey(sourceChainId, destinationChainId)];
}

function bridgeField(
  bridge: Bridges,
  kind: "Reporter" | "Adapter",
): keyof FlatRouteFile {
  return `${bridge}${kind}` as keyof FlatRouteFile;
}

/* --------------------------------------------------
   Public getters – bridges
-------------------------------------------------- */

export function getBridgeAddresses(
  sourceChainId: number,
  destinationChainId: number,
  bridge: Bridges,
): HashiAddress | undefined {
  const route = getRoute(sourceChainId, destinationChainId);
  if (!route) return undefined;

  const reporter = route[bridgeField(bridge, "Reporter")] as Address;
  const adapter = route[bridgeField(bridge, "Adapter")] as Address;

  if (!reporter || !adapter) return undefined;

  return { reporter, adapter };
}

export function getReporter(
  sourceChainId: number,
  destinationChainId: number,
  bridge: Bridges,
) {
  return getBridgeAddresses(sourceChainId, destinationChainId, bridge)
    ?.reporter;
}

export function getAdapter(
  sourceChainId: number,
  destinationChainId: number,
  bridge: Bridges,
) {
  return getBridgeAddresses(sourceChainId, destinationChainId, bridge)?.adapter;
}

/* --------------------------------------------------
   Public getters – route extras
-------------------------------------------------- */

export function getLightbulb(
  sourceChainId: number,
  destinationChainId: number,
) {
  console.log(sourceChainId, destinationChainId);
  return getRoute(sourceChainId, destinationChainId)?.lightbulb;
}

export function getSwitch(sourceChainId: number, destinationChainId: number) {
  return getRoute(sourceChainId, destinationChainId)?.switch;
}

export function getYaho(sourceChainId: number, destinationChainId: number) {
  return getRoute(sourceChainId, destinationChainId)?.yaho;
}

export function getYaru(sourceChainId: number, destinationChainId: number) {
  return getRoute(sourceChainId, destinationChainId)?.yaru;
}

export function getAllSourceChains(): UIChain[] {
  const chainIds = new Set<number>();

  for (const key of Object.keys(ROUTES)) {
    const [source] = key.split("-").map(Number);
    if (!Number.isNaN(source)) chainIds.add(source);
  }

  return Array.from(chainIds)
    .map((id) => resolveChain(id))
    .sort((a, b) => a.id - b.id);
}

export function getAllDestinationChains(): UIChain[] {
  const chainIds = new Set<number>();

  for (const key of Object.keys(ROUTES)) {
    const [, destination] = key.split("-").map(Number);
    if (!Number.isNaN(destination)) chainIds.add(destination);
  }

  return Array.from(chainIds)
    .map((id) => resolveChain(id))
    .sort((a, b) => a.id - b.id);
}

export function getDestinationChainsForSourceChain(
  sourceChainId: number,
): UIChain[] {
  const chainIds = new Set<number>();

  for (const key of Object.keys(ROUTES)) {
    const [source, destination] = key.split("-").map(Number);

    if (source === sourceChainId && !Number.isNaN(destination)) {
      chainIds.add(destination);
    }
  }

  return Array.from(chainIds)
    .map((id) => resolveChain(id))
    .sort((a, b) => a.id - b.id);
}
/* --------------------------------------------------
   Convenience helpers (UI-friendly)
-------------------------------------------------- */

export function hasRoute(
  sourceChainId: number,
  destinationChainId: number,
): boolean {
  return !!getRoute(sourceChainId, destinationChainId);
}

export function hasBridge(
  sourceChainId: number,
  destinationChainId: number,
  bridge: Bridges,
): boolean {
  return !!getBridgeAddresses(sourceChainId, destinationChainId, bridge);
}

export function getAvailableBridges(
  sourceChainId: number,
  destinationChainId: number,
): Bridges[] {
  const route = getRoute(sourceChainId, destinationChainId);
  if (!route) return [];

  return Object.values(Bridges).filter(
    (bridge) =>
      route[bridgeField(bridge, "Reporter")] &&
      route[bridgeField(bridge, "Adapter")],
  );
}
