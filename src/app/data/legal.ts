/**
 * Legal documents (review change): every Terms / Privacy / disputes link in the prototype opens these placeholder PDFs
 * (lorem ipsum, in public/legal/) in a new tab, so the footer, the sign-up agreement line, the agent-contact consent
 * and the Agreements screen all go to the same place. Swap the files for the real documents, keeping the names.
 */
export const legalPdf = {
  terms: `${import.meta.env.BASE_URL}legal/housecue-terms-of-service.pdf`,
  privacy: `${import.meta.env.BASE_URL}legal/housecue-privacy-policy.pdf`,
} as const;

export type LegalDoc = keyof typeof legalPdf;

/** Open a legal PDF in a new tab (for buttons; use legalPdf with an <a target="_blank"> for links) */
export function openLegal(doc: LegalDoc) {
  window.open(legalPdf[doc], '_blank', 'noopener,noreferrer');
}
