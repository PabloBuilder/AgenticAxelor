const TLS_ERRORS = /unable to verify the first certificate|unable to verify leaf signature|unable to get local issuer certificate|UNABLE_TO_VERIFY_LEAF_SIGNATURE|UNABLE_TO_GET_ISSUER_CERT_LOCALLY|SELF_SIGNED_CERT_IN_CHAIN|DEPTH_ZERO_SELF_SIGNED_CERT|self.signed certificate|CERT_HAS_EXPIRED|certificate has expired/i;

/** Add actionable guidance to failed tool results only; never retry an operation. */
export function addTlsGuidance(result: unknown): unknown {
  if (!result || typeof result !== "object") return result;
  const response = result as { isError?: unknown; content?: unknown };
  if (response.isError !== true || !Array.isArray(response.content)) return result;
  const match = response.content.some((item: unknown) => {
    if (!item || typeof item !== "object") return false;
    const entry = item as { type?: unknown; text?: unknown };
    return entry.type === "text" && typeof entry.text === "string" && TLS_ERRORS.test(entry.text);
  });
  if (!match) return result;
  return {
    ...response,
    content: [...response.content, {
      type: "text",
      text: "Erreur TLS : consulter .agents/knowledge/axelor-tls-troubleshooting.md avant de poursuivre. Ne pas désactiver la vérification TLS ni répéter automatiquement une écriture.",
    }],
  };
}
