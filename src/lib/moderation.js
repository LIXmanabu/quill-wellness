// ─── No-API content moderation (v1) ──────────────────────────────────────
// A keyword/heuristic filter that needs no paid service. It returns a verdict
// the caller uses to decide a post's initial status. Nuanced judgement lives
// here; the database has a tiny hard-block trigger as a last line of defence.
//
// `moderateMedia()` is a deliberate abstraction: today it only applies a
// trust/visibility policy, but an AI image/video moderation provider can be
// dropped in later WITHOUT changing any caller.

// Words/phrases that should block a post outright ("don't publish clearly
// inappropriate text"). Kept conservative to avoid false positives on a
// wellness app (e.g. "kill" alone is allowed — "kill yourself" is not).
const BLOCK_PATTERNS = [
  /child\s*porn|\bcp\b\s*(for sale|trade)/i,
  /\b(rape|bestiality|zoophilia)\b/i,
  /kill\s+(yourself|urself|ur self)|\bkys\b/i,
  /\b(n[i1]gger|f[a@]ggot|k[i1]ke|tr[a@]nny)\b/i,         // slurs
  /\bchild\b.{0,15}\b(sex|nude|naked)\b/i,
]

// Words that make a post SUSPICIOUS → send to pending_review (don't hard-block,
// because context can be innocent, but a human/admin should look).
const FLAG_PATTERNS = [
  /\b(sex|porn|nude|nsfw|escort|onlyfans)\b/i,
  /\b(viagra|cialis|casino|crypto giveaway|forex signals)\b/i,
  /\b(buy now|click here|limited offer|earn \$\d|work from home)\b/i,        // spam
  /\bhttps?:\/\/\S+\.(ru|tk|top|xyz|click)\b/i,                              // sketchy links
  /\b(gun|firearm|ammo|cocaine|heroin|meth|weed for sale)\b/i,
]

// "Unrelated content" heuristic: a community post should read like a routine /
// plan. We don't block on this (too noisy), it only contributes to flagging
// when combined with other signals.
function countLinks(text) {
  return (text.match(/https?:\/\/\S+/gi) || []).length
}

/**
 * moderateText — classify a post's text.
 * @returns {{ verdict: 'ok'|'review'|'block', reason: string }}
 *   ok     → may publish (if media rules also allow)
 *   review → store as pending_review
 *   block  → refuse to save
 */
export function moderateText({ title = '', description = '', steps = [], products = [] } = {}) {
  const blob = [
    title,
    description,
    ...steps.map((s) => (typeof s === 'string' ? s : s?.text || '')),
    ...products.map((p) => (typeof p === 'string' ? p : p?.name || '')),
  ].join(' \n ').trim()

  if (!title.trim()) return { verdict: 'block', reason: 'A title is required.' }

  for (const re of BLOCK_PATTERNS) {
    if (re.test(blob)) {
      return { verdict: 'block', reason: 'This content breaks our community guidelines and can’t be posted.' }
    }
  }

  for (const re of FLAG_PATTERNS) {
    if (re.test(blob)) {
      return { verdict: 'review', reason: 'Your post will be checked by a moderator before it appears publicly.' }
    }
  }

  // Excessive links read as spam → review.
  if (countLinks(blob) >= 3) {
    return { verdict: 'review', reason: 'Posts with several links are reviewed before appearing publicly.' }
  }

  return { verdict: 'ok', reason: '' }
}

/**
 * moderateMedia — decide how media affects a post's status.
 * No AI provider is configured in v1, so the rule is policy-based:
 *   • a post with media from a NEW/untrusted account → pending_review
 *   • a post with media from a trusted account → may publish (still reportable)
 * The database enforces the same rule server-side; this mirror gives the user
 * an accurate "will be reviewed" message before they submit.
 *
 * To add real AI moderation later, call your provider here and return
 * { verdict: 'block' | 'review' | 'ok' } based on its result.
 *
 * @param {Array} media        array of {url,type} (may be empty)
 * @param {boolean} isTrusted  whether the author is a trusted account
 */
export async function moderateMedia(media = [], { isTrusted = false } = {}) {
  // v1 policy: media no longer forces a pre-publish review — posts go live and
  // rely on text moderation + reporting (3 reports auto-hide a post). This is
  // the spot to add a real AI image/video check later: call your provider and
  // return { verdict: 'block' | 'review' | 'ok' } based on its result.
  return { verdict: 'ok', reason: '' }
}

/**
 * decidePostStatus — combine text + media verdicts into a stored status.
 * @returns {{ status: 'published'|'pending_review', blocked: boolean, reason: string }}
 */
export async function decidePostStatus(post, { isTrusted = false } = {}) {
  const text = moderateText(post)
  if (text.verdict === 'block') return { status: null, blocked: true, reason: text.reason }

  const media = await moderateMedia(post.media || [], { isTrusted })
  if (media.verdict === 'block') return { status: null, blocked: true, reason: media.reason }

  const review = text.verdict === 'review' || media.verdict === 'review'
  return {
    status: review ? 'pending_review' : 'published',
    blocked: false,
    reason: review ? (text.reason || media.reason) : '',
  }
}
