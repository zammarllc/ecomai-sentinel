const { PRIVACY_NOTICE } = require('./openai');

function ensurePrivacyNotice(text) {
  if (!text) return PRIVACY_NOTICE;

  return text.includes(PRIVACY_NOTICE) ? text : `${text.trim()}\n\n${PRIVACY_NOTICE}`;
}

module.exports = {
  ensurePrivacyNotice
};
