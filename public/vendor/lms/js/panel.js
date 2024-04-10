/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@sentry-internal/feedback/esm/index.js":
/*!*************************************************************!*\
  !*** ./node_modules/@sentry-internal/feedback/esm/index.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Feedback": () => (/* binding */ Feedback),
/* harmony export */   "sendFeedback": () => (/* binding */ sendFeedback)
/* harmony export */ });
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/worldwide.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/browser.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/logger.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/isBrowser.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/esm/utils/prepareEvent.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/esm/hub.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/esm/exports.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/esm/envelope.js");



// exporting a separate copy of `WINDOW` rather than exporting the one from `@sentry/browser`
// prevents the browser package from being bundled in the CDN bundle, and avoids a
// circular dependency between the browser and feedback packages
const WINDOW = _sentry_utils__WEBPACK_IMPORTED_MODULE_0__.GLOBAL_OBJ ;

const LIGHT_BACKGROUND = '#ffffff';
const INHERIT = 'inherit';
const SUBMIT_COLOR = 'rgba(108, 95, 199, 1)';
const LIGHT_THEME = {
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
  fontSize: '14px',

  background: LIGHT_BACKGROUND,
  backgroundHover: '#f6f6f7',
  foreground: '#2b2233',
  border: '1.5px solid rgba(41, 35, 47, 0.13)',
  boxShadow: '0px 4px 24px 0px rgba(43, 34, 51, 0.12)',

  success: '#268d75',
  error: '#df3338',

  submitBackground: 'rgba(88, 74, 192, 1)',
  submitBackgroundHover: SUBMIT_COLOR,
  submitBorder: SUBMIT_COLOR,
  submitOutlineFocus: '#29232f',
  submitForeground: LIGHT_BACKGROUND,
  submitForegroundHover: LIGHT_BACKGROUND,

  cancelBackground: 'transparent',
  cancelBackgroundHover: 'var(--background-hover)',
  cancelBorder: 'var(--border)',
  cancelOutlineFocus: 'var(--input-outline-focus)',
  cancelForeground: 'var(--foreground)',
  cancelForegroundHover: 'var(--foreground)',

  inputBackground: INHERIT,
  inputForeground: INHERIT,
  inputBorder: 'var(--border)',
  inputOutlineFocus: SUBMIT_COLOR,
};

const DEFAULT_THEME = {
  light: LIGHT_THEME,
  dark: {
    ...LIGHT_THEME,

    background: '#29232f',
    backgroundHover: '#352f3b',
    foreground: '#ebe6ef',
    border: '1.5px solid rgba(235, 230, 239, 0.15)',

    success: '#2da98c',
    error: '#f55459',
  },
};

const ACTOR_LABEL = 'Report a Bug';
const CANCEL_BUTTON_LABEL = 'Cancel';
const SUBMIT_BUTTON_LABEL = 'Send Bug Report';
const FORM_TITLE = 'Report a Bug';
const EMAIL_PLACEHOLDER = 'your.email@example.org';
const EMAIL_LABEL = 'Email';
const MESSAGE_PLACEHOLDER = "What's the bug? What did you expect?";
const MESSAGE_LABEL = 'Description';
const NAME_PLACEHOLDER = 'Your Name';
const NAME_LABEL = 'Name';
const SUCCESS_MESSAGE_TEXT = 'Thank you for your report!';

const FEEDBACK_WIDGET_SOURCE = 'widget';
const FEEDBACK_API_SOURCE = 'api';

/**
 * Prepare a feedback event & enrich it with the SDK metadata.
 */
async function prepareFeedbackEvent({
  client,
  scope,
  event,
}) {
  const eventHint = {};
  if (client.emit) {
    client.emit('preprocessEvent', event, eventHint);
  }

  const preparedEvent = (await (0,_sentry_core__WEBPACK_IMPORTED_MODULE_1__.prepareEvent)(
    client.getOptions(),
    event,
    eventHint,
    scope,
    client,
    (0,_sentry_core__WEBPACK_IMPORTED_MODULE_2__.getIsolationScope)(),
  )) ;

  if (preparedEvent === null) {
    // Taken from baseclient's `_processEvent` method, where this is handled for errors/transactions
    client.recordDroppedEvent('event_processor', 'feedback', event);
    return null;
  }

  // This normally happens in browser client "_prepareEvent"
  // but since we do not use this private method from the client, but rather the plain import
  // we need to do this manually.
  preparedEvent.platform = preparedEvent.platform || 'javascript';

  return preparedEvent;
}

/**
 * Send feedback using transport
 */
async function sendFeedbackRequest(
  { feedback: { message, email, name, source, url } },
  { includeReplay = true } = {},
) {
  const client = (0,_sentry_core__WEBPACK_IMPORTED_MODULE_3__.getClient)();
  const transport = client && client.getTransport();
  const dsn = client && client.getDsn();

  if (!client || !transport || !dsn) {
    return;
  }

  const baseEvent = {
    contexts: {
      feedback: {
        contact_email: email,
        name,
        message,
        url,
        source,
      },
    },
    type: 'feedback',
  };

  return (0,_sentry_core__WEBPACK_IMPORTED_MODULE_3__.withScope)(async scope => {
    // No use for breadcrumbs in feedback
    scope.clearBreadcrumbs();

    if ([FEEDBACK_API_SOURCE, FEEDBACK_WIDGET_SOURCE].includes(String(source))) {
      scope.setLevel('info');
    }

    const feedbackEvent = await prepareFeedbackEvent({
      scope,
      client,
      event: baseEvent,
    });

    if (!feedbackEvent) {
      return;
    }

    if (client.emit) {
      client.emit('beforeSendFeedback', feedbackEvent, { includeReplay: Boolean(includeReplay) });
    }

    const envelope = (0,_sentry_core__WEBPACK_IMPORTED_MODULE_4__.createEventEnvelope)(feedbackEvent, dsn, client.getOptions()._metadata, client.getOptions().tunnel);

    let response;

    try {
      response = await transport.send(envelope);
    } catch (err) {
      const error = new Error('Unable to send Feedback');

      try {
        // In case browsers don't allow this property to be writable
        // @ts-expect-error This needs lib es2022 and newer
        error.cause = err;
      } catch (e) {
        // nothing to do
      }
      throw error;
    }

    // TODO (v8): we can remove this guard once transport.send's type signature doesn't include void anymore
    if (!response) {
      return;
    }

    // Require valid status codes, otherwise can assume feedback was not sent successfully
    if (typeof response.statusCode === 'number' && (response.statusCode < 200 || response.statusCode >= 300)) {
      throw new Error('Unable to send Feedback');
    }

    return response;
  });
}

/*
 * For reference, the fully built event looks something like this:
 * {
 *     "type": "feedback",
 *     "event_id": "d2132d31b39445f1938d7e21b6bf0ec4",
 *     "timestamp": 1597977777.6189718,
 *     "dist": "1.12",
 *     "platform": "javascript",
 *     "environment": "production",
 *     "release": 42,
 *     "tags": {"transaction": "/organizations/:orgId/performance/:eventSlug/"},
 *     "sdk": {"name": "name", "version": "version"},
 *     "user": {
 *         "id": "123",
 *         "username": "user",
 *         "email": "user@site.com",
 *         "ip_address": "192.168.11.12",
 *     },
 *     "request": {
 *         "url": None,
 *         "headers": {
 *             "user-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.5 Safari/605.1.15"
 *         },
 *     },
 *     "contexts": {
 *         "feedback": {
 *             "message": "test message",
 *             "contact_email": "test@example.com",
 *             "type": "feedback",
 *         },
 *         "trace": {
 *             "trace_id": "4C79F60C11214EB38604F4AE0781BFB2",
 *             "span_id": "FA90FDEAD5F74052",
 *             "type": "trace",
 *         },
 *         "replay": {
 *             "replay_id": "e2d42047b1c5431c8cba85ee2a8ab25d",
 *         },
 *     },
 *   }
 */

/**
 * Public API to send a Feedback item to Sentry
 */
function sendFeedback(
  { name, email, message, source = FEEDBACK_API_SOURCE, url = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_5__.getLocationHref)() },
  options = {},
) {
  if (!message) {
    throw new Error('Unable to submit feedback with empty message');
  }

  return sendFeedbackRequest(
    {
      feedback: {
        name,
        email,
        message,
        url,
        source,
      },
    },
    options,
  );
}

/**
 * This serves as a build time flag that will be true by default, but false in non-debug builds or if users replace `__SENTRY_DEBUG__` in their generated code.
 *
 * ATTENTION: This constant must never cross package boundaries (i.e. be exported) to guarantee that it can be used for tree shaking.
 */
const DEBUG_BUILD = (typeof __SENTRY_DEBUG__ === 'undefined' || __SENTRY_DEBUG__);

/**
 * Quick and dirty deep merge for the Feedback integration options
 */
function mergeOptions(
  defaultOptions,
  optionOverrides,
) {
  return {
    ...defaultOptions,
    ...optionOverrides,
    themeDark: {
      ...defaultOptions.themeDark,
      ...optionOverrides.themeDark,
    },
    themeLight: {
      ...defaultOptions.themeLight,
      ...optionOverrides.themeLight,
    },
  };
}

/**
 * Creates <style> element for widget actor (button that opens the dialog)
 */
function createActorStyles(d) {
  const style = d.createElement('style');
  style.textContent = `
.widget__actor {
  line-height: 25px;

  display: flex;
  align-items: center;
  gap: 8px;

  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  padding: 12px 16px;
  text-decoration: none;
  z-index: 9000;

  color: var(--foreground);
  background-color: var(--background);
  border: var(--border);
  box-shadow: var(--box-shadow);
  opacity: 1;
  transition: opacity 0.1s ease-in-out;
}

.widget__actor:hover {
  background-color: var(--background-hover);
}

.widget__actor svg {
  width: 16px;
  height: 16px;
}

.widget__actor--hidden {
  opacity: 0;
  pointer-events: none;
  visibility: hidden;
}

.widget__actor__text {
}

.feedback-icon path {
  fill: var(--foreground);
}
`;

  return style;
}

/**
 * Creates <style> element for widget dialog
 */
function createDialogStyles(d) {
  const style = d.createElement('style');

  style.textContent = `
.dialog {
  line-height: 25px;
  background-color: rgba(0, 0, 0, 0.05);
  border: none;
  position: fixed;
  inset: 0;
  z-index: 10000;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 1;
  transition: opacity 0.2s ease-in-out;
}

.dialog:not([open]) {
  opacity: 0;
  pointer-events: none;
  visibility: hidden;
}
.dialog:not([open]) .dialog__content {
  transform: translate(0, -16px) scale(0.98);
}

.dialog__content {
  position: fixed;
  left: var(--left);
  right: var(--right);
  bottom: var(--bottom);
  top: var(--top);

  border: var(--border);
  border-radius: 20px;
  background-color: var(--background);
  color: var(--foreground);

  width: 320px;
  max-width: 100%;
  max-height: calc(100% - 2rem);
  display: flex;
  flex-direction: column;
  box-shadow: var(--box-shadow);
  transition: transform 0.2s ease-in-out;
  transform: translate(0, 0) scale(1);
}

.dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 20px;
  font-weight: 600;
  padding: 24px 24px 0 24px;
  margin: 0;
  margin-bottom: 16px;
}

.brand-link {
  display: inline-flex;
}

.error {
  color: var(--error);
  margin-bottom: 16px;
}

.form {
  display: grid;
  overflow: auto;
  flex-direction: column;
  gap: 16px;
  padding: 0 24px 24px;
}

.form__error-container {
  color: var(--error);
}

.form__error-container--hidden {
  display: none;
}

.form__label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0px;
}

.form__label__text {
  display: grid;
  gap: 4px;
  align-items: center;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
}

.form__label__text--required {
  font-size: 0.85em;
}

.form__input {
  font-family: inherit;
  line-height: inherit;
  background-color: var(--input-background);
  box-sizing: border-box;
  border: var(--input-border);
  border-radius: 6px;
  color: var(--input-foreground);
  font-size: 14px;
  font-weight: 500;
  padding: 6px 12px;
}

.form__input:focus-visible {
  outline: 1px auto var(--input-outline-focus);
}

.form__input--textarea {
  font-family: inherit;
  resize: vertical;
}

.btn-group {
  display: grid;
  gap: 8px;
  margin-top: 8px;
}

.btn {
  line-height: inherit;
  border: var(--cancel-border);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  padding: 6px 16px;
}
.btn[disabled] {
  opacity: 0.6;
  pointer-events: none;
}

.btn--primary {
  background-color: var(--submit-background);
  border-color: var(--submit-border);
  color: var(--submit-foreground);
}
.btn--primary:hover {
  background-color: var(--submit-background-hover);
  color: var(--submit-foreground-hover);
}
.btn--primary:focus-visible {
  outline: 1px auto var(--submit-outline-focus);
}

.btn--default {
  background-color: var(--cancel-background);
  color: var(--cancel-foreground);
  font-weight: 500;
}
.btn--default:hover {
  background-color: var(--cancel-background-hover);
  color: var(--cancel-foreground-hover);
}
.btn--default:focus-visible {
  outline: 1px auto var(--cancel-outline-focus);
}

.success-message {
  background-color: var(--background);
  border: var(--border);
  border-radius: 12px;
  box-shadow: var(--box-shadow);
  font-weight: 600;
  color: var(--success);
  padding: 12px 24px;
  line-height: 25px;
  display: grid;
  align-items: center;
  grid-auto-flow: column;
  gap: 6px;
  cursor: default;
}

.success-icon path {
  fill: var(--success);
}
`;

  return style;
}

function getThemedCssVariables(theme) {
  return `
  --background: ${theme.background};
  --background-hover: ${theme.backgroundHover};
  --foreground: ${theme.foreground};
  --error: ${theme.error};
  --success: ${theme.success};
  --border: ${theme.border};
  --box-shadow: ${theme.boxShadow};

  --submit-background: ${theme.submitBackground};
  --submit-background-hover: ${theme.submitBackgroundHover};
  --submit-border: ${theme.submitBorder};
  --submit-outline-focus: ${theme.submitOutlineFocus};
  --submit-foreground: ${theme.submitForeground};
  --submit-foreground-hover: ${theme.submitForegroundHover};

  --cancel-background: ${theme.cancelBackground};
  --cancel-background-hover: ${theme.cancelBackgroundHover};
  --cancel-border: ${theme.cancelBorder};
  --cancel-outline-focus: ${theme.cancelOutlineFocus};
  --cancel-foreground: ${theme.cancelForeground};
  --cancel-foreground-hover: ${theme.cancelForegroundHover};

  --input-background: ${theme.inputBackground};
  --input-foreground: ${theme.inputForeground};
  --input-border: ${theme.inputBorder};
  --input-outline-focus: ${theme.inputOutlineFocus};
  `;
}

/**
 * Creates <style> element for widget actor (button that opens the dialog)
 */
function createMainStyles(
  d,
  colorScheme,
  themes,
) {
  const style = d.createElement('style');
  style.textContent = `
:host {
  --bottom: 1rem;
  --right: 1rem;
  --top: auto;
  --left: auto;
  --z-index: 100000;
  --font-family: ${themes.light.fontFamily};
  --font-size: ${themes.light.fontSize};

  position: fixed;
  left: var(--left);
  right: var(--right);
  bottom: var(--bottom);
  top: var(--top);
  z-index: var(--z-index);

  font-family: var(--font-family);
  font-size: var(--font-size);

  ${getThemedCssVariables(colorScheme === 'dark' ? themes.dark : themes.light)}
}

${
  colorScheme === 'system'
    ? `
@media (prefers-color-scheme: dark) {
  :host {
    ${getThemedCssVariables(themes.dark)}
  }
}`
    : ''
}
}`;

  return style;
}

/**
 * Creates shadow host
 */
function createShadowHost({ id, colorScheme, themeDark, themeLight })

 {
  try {
    const doc = WINDOW.document;

    // Create the host
    const host = doc.createElement('div');
    host.id = id;

    // Create the shadow root
    const shadow = host.attachShadow({ mode: 'open' });

    shadow.appendChild(createMainStyles(doc, colorScheme, { dark: themeDark, light: themeLight }));
    shadow.appendChild(createDialogStyles(doc));

    return { shadow, host };
  } catch (e) {
    // Shadow DOM probably not supported
    _sentry_utils__WEBPACK_IMPORTED_MODULE_6__.logger.warn('[Feedback] Browser does not support shadow DOM API');
    throw new Error('Browser does not support shadow DOM API.');
  }
}

/**
 * Handles UI behavior of dialog when feedback is submitted, calls
 * `sendFeedback` to send feedback.
 */
async function handleFeedbackSubmit(
  dialog,
  feedback,
  options,
) {
  if (!dialog) {
    // Not sure when this would happen
    return;
  }

  const showFetchError = () => {
    if (!dialog) {
      return;
    }
    dialog.showError('There was a problem submitting feedback, please wait and try again.');
  };

  dialog.hideError();

  try {
    const resp = await sendFeedback({ ...feedback, source: FEEDBACK_WIDGET_SOURCE }, options);

    // Success!
    return resp;
  } catch (err) {
    DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_6__.logger.error(err);
    showFetchError();
  }
}

/**
 * Helper function to set a dict of attributes on element (w/ specified namespace)
 */
function setAttributesNS(el, attributes) {
  Object.entries(attributes).forEach(([key, val]) => {
    el.setAttributeNS(null, key, val);
  });
  return el;
}

const SIZE = 20;
const XMLNS$2 = 'http://www.w3.org/2000/svg';

/**
 * Feedback Icon
 */
function Icon() {
  const createElementNS = (tagName) =>
    WINDOW.document.createElementNS(XMLNS$2, tagName);
  const svg = setAttributesNS(createElementNS('svg'), {
    class: 'feedback-icon',
    width: `${SIZE}`,
    height: `${SIZE}`,
    viewBox: `0 0 ${SIZE} ${SIZE}`,
    fill: 'none',
  });

  const g = setAttributesNS(createElementNS('g'), {
    clipPath: 'url(#clip0_57_80)',
  });

  const path = setAttributesNS(createElementNS('path'), {
    ['fill-rule']: 'evenodd',
    ['clip-rule']: 'evenodd',
    d: 'M15.6622 15H12.3997C12.2129 14.9959 12.031 14.9396 11.8747 14.8375L8.04965 12.2H7.49956V19.1C7.4875 19.3348 7.3888 19.5568 7.22256 19.723C7.05632 19.8892 6.83435 19.9879 6.59956 20H2.04956C1.80193 19.9968 1.56535 19.8969 1.39023 19.7218C1.21511 19.5467 1.1153 19.3101 1.11206 19.0625V12.2H0.949652C0.824431 12.2017 0.700142 12.1783 0.584123 12.1311C0.468104 12.084 0.362708 12.014 0.274155 11.9255C0.185602 11.8369 0.115689 11.7315 0.0685419 11.6155C0.0213952 11.4995 -0.00202913 11.3752 -0.00034808 11.25V3.75C-0.00900498 3.62067 0.0092504 3.49095 0.0532651 3.36904C0.0972798 3.24712 0.166097 3.13566 0.255372 3.04168C0.344646 2.94771 0.452437 2.87327 0.571937 2.82307C0.691437 2.77286 0.82005 2.74798 0.949652 2.75H8.04965L11.8747 0.1625C12.031 0.0603649 12.2129 0.00407221 12.3997 0H15.6622C15.9098 0.00323746 16.1464 0.103049 16.3215 0.278167C16.4966 0.453286 16.5964 0.689866 16.5997 0.9375V3.25269C17.3969 3.42959 18.1345 3.83026 18.7211 4.41679C19.5322 5.22788 19.9878 6.32796 19.9878 7.47502C19.9878 8.62209 19.5322 9.72217 18.7211 10.5333C18.1345 11.1198 17.3969 11.5205 16.5997 11.6974V14.0125C16.6047 14.1393 16.5842 14.2659 16.5395 14.3847C16.4948 14.5035 16.4268 14.6121 16.3394 14.7042C16.252 14.7962 16.147 14.8698 16.0307 14.9206C15.9144 14.9714 15.7891 14.9984 15.6622 15ZM1.89695 10.325H1.88715V4.625H8.33715C8.52423 4.62301 8.70666 4.56654 8.86215 4.4625L12.6872 1.875H14.7247V13.125H12.6872L8.86215 10.4875C8.70666 10.3835 8.52423 10.327 8.33715 10.325H2.20217C2.15205 10.3167 2.10102 10.3125 2.04956 10.3125C1.9981 10.3125 1.94708 10.3167 1.89695 10.325ZM2.98706 12.2V18.1625H5.66206V12.2H2.98706ZM16.5997 9.93612V5.01393C16.6536 5.02355 16.7072 5.03495 16.7605 5.04814C17.1202 5.13709 17.4556 5.30487 17.7425 5.53934C18.0293 5.77381 18.2605 6.06912 18.4192 6.40389C18.578 6.73866 18.6603 7.10452 18.6603 7.47502C18.6603 7.84552 18.578 8.21139 18.4192 8.54616C18.2605 8.88093 18.0293 9.17624 17.7425 9.41071C17.4556 9.64518 17.1202 9.81296 16.7605 9.90191C16.7072 9.91509 16.6536 9.9265 16.5997 9.93612Z',
  });
  svg.appendChild(g).appendChild(path);

  const speakerDefs = createElementNS('defs');
  const speakerClipPathDef = setAttributesNS(createElementNS('clipPath'), {
    id: 'clip0_57_80',
  });

  const speakerRect = setAttributesNS(createElementNS('rect'), {
    width: `${SIZE}`,
    height: `${SIZE}`,
    fill: 'white',
  });

  speakerClipPathDef.appendChild(speakerRect);
  speakerDefs.appendChild(speakerClipPathDef);

  svg.appendChild(speakerDefs).appendChild(speakerClipPathDef).appendChild(speakerRect);

  return {
    get el() {
      return svg;
    },
  };
}

/**
 * Helper function to create an element. Could be used as a JSX factory
 * (i.e. React-like syntax).
 */
function createElement(
  tagName,
  attributes,
  ...children
) {
  const doc = WINDOW.document;
  const element = doc.createElement(tagName);

  if (attributes) {
    Object.entries(attributes).forEach(([attribute, attributeValue]) => {
      if (attribute === 'className' && typeof attributeValue === 'string') {
        // JSX does not allow class as a valid name
        element.setAttribute('class', attributeValue);
      } else if (typeof attributeValue === 'boolean' && attributeValue) {
        element.setAttribute(attribute, '');
      } else if (typeof attributeValue === 'string') {
        element.setAttribute(attribute, attributeValue);
      } else if (attribute.startsWith('on') && typeof attributeValue === 'function') {
        element.addEventListener(attribute.substring(2).toLowerCase(), attributeValue);
      }
    });
  }
  for (const child of children) {
    appendChild(element, child);
  }

  return element;
}

function appendChild(parent, child) {
  const doc = WINDOW.document;
  if (typeof child === 'undefined' || child === null) {
    return;
  }

  if (Array.isArray(child)) {
    for (const value of child) {
      appendChild(parent, value);
    }
  } else if (child === false) ; else if (typeof child === 'string') {
    parent.appendChild(doc.createTextNode(child));
  } else if (child instanceof Node) {
    parent.appendChild(child);
  } else {
    parent.appendChild(doc.createTextNode(String(child)));
  }
}

/**
 *
 */
function Actor({ buttonLabel, onClick }) {
  function _handleClick(e) {
    onClick && onClick(e);
  }

  const el = createElement(
    'button',
    {
      type: 'button',
      className: 'widget__actor',
      ['aria-label']: buttonLabel,
      ['aria-hidden']: 'false',
    },
    Icon().el,
    buttonLabel
      ? createElement(
          'span',
          {
            className: 'widget__actor__text',
          },
          buttonLabel,
        )
      : null,
  );

  el.addEventListener('click', _handleClick);

  return {
    get el() {
      return el;
    },
    show: () => {
      el.classList.remove('widget__actor--hidden');
      el.setAttribute('aria-hidden', 'false');
    },
    hide: () => {
      el.classList.add('widget__actor--hidden');
      el.setAttribute('aria-hidden', 'true');
    },
  };
}

/**
 *
 */
function SubmitButton({ label }) {
  const el = createElement(
    'button',
    {
      type: 'submit',
      className: 'btn btn--primary',
      ['aria-label']: label,
    },
    label,
  );

  return {
    el,
  };
}

function retrieveStringValue(formData, key) {
  const value = formData.get(key);
  if (typeof value === 'string') {
    return value.trim();
  }
  return '';
}

/**
 * Creates the form element
 */
function Form({
  nameLabel,
  namePlaceholder,
  emailLabel,
  emailPlaceholder,
  messageLabel,
  messagePlaceholder,
  cancelButtonLabel,
  submitButtonLabel,

  showName,
  showEmail,
  isNameRequired,
  isEmailRequired,

  defaultName,
  defaultEmail,
  onCancel,
  onSubmit,
}) {
  const { el: submitEl } = SubmitButton({
    label: submitButtonLabel,
  });

  function handleSubmit(e) {
    e.preventDefault();

    if (!(e.target instanceof HTMLFormElement)) {
      return;
    }

    try {
      if (onSubmit) {
        const formData = new FormData(e.target );
        const feedback = {
          name: retrieveStringValue(formData, 'name'),
          email: retrieveStringValue(formData, 'email'),
          message: retrieveStringValue(formData, 'message'),
        };

        onSubmit(feedback);
      }
    } catch (e2) {
      // pass
    }
  }

  const errorEl = createElement('div', {
    className: 'form__error-container form__error-container--hidden',
    ['aria-hidden']: 'true',
  });

  function showError(message) {
    errorEl.textContent = message;
    errorEl.classList.remove('form__error-container--hidden');
    errorEl.setAttribute('aria-hidden', 'false');
  }

  function hideError() {
    errorEl.textContent = '';
    errorEl.classList.add('form__error-container--hidden');
    errorEl.setAttribute('aria-hidden', 'true');
  }

  const nameEl = createElement('input', {
    id: 'name',
    type: showName ? 'text' : 'hidden',
    ['aria-hidden']: showName ? 'false' : 'true',
    name: 'name',
    required: isNameRequired,
    className: 'form__input',
    placeholder: namePlaceholder,
    value: defaultName,
  });

  const emailEl = createElement('input', {
    id: 'email',
    type: showEmail ? 'text' : 'hidden',
    ['aria-hidden']: showEmail ? 'false' : 'true',
    name: 'email',
    required: isEmailRequired,
    className: 'form__input',
    placeholder: emailPlaceholder,
    value: defaultEmail,
  });

  const messageEl = createElement('textarea', {
    id: 'message',
    autoFocus: 'true',
    rows: '5',
    name: 'message',
    required: true,
    className: 'form__input form__input--textarea',
    placeholder: messagePlaceholder,
  });

  const cancelEl = createElement(
    'button',
    {
      type: 'button',
      className: 'btn btn--default',
      ['aria-label']: cancelButtonLabel,
      onClick: (e) => {
        onCancel && onCancel(e);
      },
    },
    cancelButtonLabel,
  );

  const formEl = createElement(
    'form',
    {
      className: 'form',
      onSubmit: handleSubmit,
    },
    [
      errorEl,

      showName &&
        createElement(
          'label',
          {
            htmlFor: 'name',
            className: 'form__label',
          },
          [
            createElement(
              'span',
              { className: 'form__label__text' },
              nameLabel,
              isNameRequired && createElement('span', { className: 'form__label__text--required' }, ' (required)'),
            ),
            nameEl,
          ],
        ),
      !showName && nameEl,

      showEmail &&
        createElement(
          'label',
          {
            htmlFor: 'email',
            className: 'form__label',
          },
          [
            createElement(
              'span',
              { className: 'form__label__text' },
              emailLabel,
              isEmailRequired && createElement('span', { className: 'form__label__text--required' }, ' (required)'),
            ),
            emailEl,
          ],
        ),
      !showEmail && emailEl,

      createElement(
        'label',
        {
          htmlFor: 'message',
          className: 'form__label',
        },
        [
          createElement(
            'span',
            { className: 'form__label__text' },
            messageLabel,
            createElement('span', { className: 'form__label__text--required' }, ' (required)'),
          ),
          messageEl,
        ],
      ),

      createElement(
        'div',
        {
          className: 'btn-group',
        },
        [submitEl, cancelEl],
      ),
    ],
  );

  return {
    get el() {
      return formEl;
    },
    showError,
    hideError,
  };
}

const XMLNS$1 = 'http://www.w3.org/2000/svg';

/**
 * Sentry Logo
 */
function Logo({ colorScheme }) {
  const createElementNS = (tagName) =>
    WINDOW.document.createElementNS(XMLNS$1, tagName);
  const svg = setAttributesNS(createElementNS('svg'), {
    class: 'sentry-logo',
    width: '32',
    height: '30',
    viewBox: '0 0 72 66',
    fill: 'none',
  });

  const path = setAttributesNS(createElementNS('path'), {
    transform: 'translate(11, 11)',
    d: 'M29,2.26a4.67,4.67,0,0,0-8,0L14.42,13.53A32.21,32.21,0,0,1,32.17,40.19H27.55A27.68,27.68,0,0,0,12.09,17.47L6,28a15.92,15.92,0,0,1,9.23,12.17H4.62A.76.76,0,0,1,4,39.06l2.94-5a10.74,10.74,0,0,0-3.36-1.9l-2.91,5a4.54,4.54,0,0,0,1.69,6.24A4.66,4.66,0,0,0,4.62,44H19.15a19.4,19.4,0,0,0-8-17.31l2.31-4A23.87,23.87,0,0,1,23.76,44H36.07a35.88,35.88,0,0,0-16.41-31.8l4.67-8a.77.77,0,0,1,1.05-.27c.53.29,20.29,34.77,20.66,35.17a.76.76,0,0,1-.68,1.13H40.6q.09,1.91,0,3.81h4.78A4.59,4.59,0,0,0,50,39.43a4.49,4.49,0,0,0-.62-2.28Z',
  });
  svg.append(path);

  const defs = createElementNS('defs');
  const style = createElementNS('style');

  if (colorScheme === 'system') {
    style.textContent = `
    @media (prefers-color-scheme: dark) {
      path: {
        fill: '#fff';
      }
    }
    `;
  }

  style.textContent = `
    path {
      fill: ${colorScheme === 'dark' ? '#fff' : '#362d59'};
    }`;

  defs.append(style);
  svg.append(defs);

  return {
    get el() {
      return svg;
    },
  };
}

/**
 * Feedback dialog component that has the form
 */
function Dialog({
  formTitle,
  showBranding,
  showName,
  showEmail,
  isNameRequired,
  isEmailRequired,
  colorScheme,
  defaultName,
  defaultEmail,
  onClosed,
  onCancel,
  onSubmit,
  ...textLabels
}) {
  let el = null;

  /**
   * Handles when the dialog is clicked. In our case, the dialog is the
   * semi-transparent bg behind the form. We want clicks outside of the form to
   * hide the form.
   */
  function handleDialogClick() {
    close();

    // Only this should trigger `onClose`, we don't want the `close()` method to
    // trigger it, otherwise it can cause cycles.
    onClosed && onClosed();
  }

  /**
   * Close the dialog
   */
  function close() {
    if (el) {
      el.open = false;
    }
  }

  /**
   * Opens the dialog
   */
  function open() {
    if (el) {
      el.open = true;
    }
  }

  /**
   * Check if dialog is currently opened
   */
  function checkIsOpen() {
    return (el && el.open === true) || false;
  }

  const {
    el: formEl,
    showError,
    hideError,
  } = Form({
    showEmail,
    showName,
    isEmailRequired,
    isNameRequired,

    defaultName,
    defaultEmail,
    onSubmit,
    onCancel,
    ...textLabels,
  });

  el = createElement(
    'dialog',
    {
      className: 'dialog',
      open: true,
      onClick: handleDialogClick,
    },
    createElement(
      'div',
      {
        className: 'dialog__content',
        onClick: e => {
          // Stop event propagation so clicks on content modal do not propagate to dialog (which will close dialog)
          e.stopPropagation();
        },
      },
      createElement(
        'h2',
        { className: 'dialog__header' },
        formTitle,
        showBranding &&
          createElement(
            'a',
            {
              className: 'brand-link',
              target: '_blank',
              href: 'https://sentry.io/welcome/',
              title: 'Powered by Sentry',
              rel: 'noopener noreferrer',
            },
            Logo({ colorScheme }).el,
          ),
      ),
      formEl,
    ),
  );

  return {
    get el() {
      return el;
    },
    showError,
    hideError,
    open,
    close,
    checkIsOpen,
  };
}

const WIDTH = 16;
const HEIGHT = 17;
const XMLNS = 'http://www.w3.org/2000/svg';

/**
 * Success Icon (checkmark)
 */
function SuccessIcon() {
  const createElementNS = (tagName) =>
    WINDOW.document.createElementNS(XMLNS, tagName);
  const svg = setAttributesNS(createElementNS('svg'), {
    class: 'success-icon',
    width: `${WIDTH}`,
    height: `${HEIGHT}`,
    viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
    fill: 'none',
  });

  const g = setAttributesNS(createElementNS('g'), {
    clipPath: 'url(#clip0_57_156)',
  });

  const path2 = setAttributesNS(createElementNS('path'), {
    ['fill-rule']: 'evenodd',
    ['clip-rule']: 'evenodd',
    d: 'M3.55544 15.1518C4.87103 16.0308 6.41775 16.5 8 16.5C10.1217 16.5 12.1566 15.6571 13.6569 14.1569C15.1571 12.6566 16 10.6217 16 8.5C16 6.91775 15.5308 5.37103 14.6518 4.05544C13.7727 2.73985 12.5233 1.71447 11.0615 1.10897C9.59966 0.503466 7.99113 0.34504 6.43928 0.653721C4.88743 0.962403 3.46197 1.72433 2.34315 2.84315C1.22433 3.96197 0.462403 5.38743 0.153721 6.93928C-0.15496 8.49113 0.00346625 10.0997 0.608967 11.5615C1.21447 13.0233 2.23985 14.2727 3.55544 15.1518ZM4.40546 3.1204C5.46945 2.40946 6.72036 2.03 8 2.03C9.71595 2.03 11.3616 2.71166 12.575 3.92502C13.7883 5.13838 14.47 6.78405 14.47 8.5C14.47 9.77965 14.0905 11.0306 13.3796 12.0945C12.6687 13.1585 11.6582 13.9878 10.476 14.4775C9.29373 14.9672 7.99283 15.0953 6.73777 14.8457C5.48271 14.596 4.32987 13.9798 3.42502 13.075C2.52018 12.1701 1.90397 11.0173 1.65432 9.76224C1.40468 8.50718 1.5328 7.20628 2.0225 6.02404C2.5122 4.8418 3.34148 3.83133 4.40546 3.1204Z',
  });
  const path = setAttributesNS(createElementNS('path'), {
    d: 'M6.68775 12.4297C6.78586 12.4745 6.89218 12.4984 7 12.5C7.11275 12.4955 7.22315 12.4664 7.32337 12.4145C7.4236 12.3627 7.51121 12.2894 7.58 12.2L12 5.63999C12.0848 5.47724 12.1071 5.28902 12.0625 5.11098C12.0178 4.93294 11.9095 4.77744 11.7579 4.67392C11.6064 4.57041 11.4221 4.52608 11.24 4.54931C11.0579 4.57254 10.8907 4.66173 10.77 4.79999L6.88 10.57L5.13 8.56999C5.06508 8.49566 4.98613 8.43488 4.89768 8.39111C4.80922 8.34735 4.713 8.32148 4.61453 8.31498C4.51605 8.30847 4.41727 8.32147 4.32382 8.35322C4.23038 8.38497 4.14413 8.43484 4.07 8.49999C3.92511 8.63217 3.83692 8.81523 3.82387 9.01092C3.81083 9.2066 3.87393 9.39976 4 9.54999L6.43 12.24C6.50187 12.3204 6.58964 12.385 6.68775 12.4297Z',
  });

  svg.appendChild(g).append(path, path2);

  const speakerDefs = createElementNS('defs');
  const speakerClipPathDef = setAttributesNS(createElementNS('clipPath'), {
    id: 'clip0_57_156',
  });

  const speakerRect = setAttributesNS(createElementNS('rect'), {
    width: `${WIDTH}`,
    height: `${WIDTH}`,
    fill: 'white',
    transform: 'translate(0 0.5)',
  });

  speakerClipPathDef.appendChild(speakerRect);
  speakerDefs.appendChild(speakerClipPathDef);

  svg.appendChild(speakerDefs).appendChild(speakerClipPathDef).appendChild(speakerRect);

  return {
    get el() {
      return svg;
    },
  };
}

/**
 * Feedback dialog component that has the form
 */
function SuccessMessage({ message, onRemove }) {
  function remove() {
    if (!el) {
      return;
    }

    el.remove();
    onRemove && onRemove();
  }

  const el = createElement(
    'div',
    {
      className: 'success-message',
      onClick: remove,
    },
    SuccessIcon().el,
    message,
  );

  return {
    el,
    remove,
  };
}

/**
 * Creates a new widget. Returns public methods that control widget behavior.
 */
function createWidget({
  shadow,
  options: { shouldCreateActor = true, ...options },
  attachTo,
}) {
  let actor;
  let dialog;
  let isDialogOpen = false;

  /**
   * Show the success message for 5 seconds
   */
  function showSuccessMessage() {
    if (!shadow) {
      return;
    }

    try {
      const success = SuccessMessage({
        message: options.successMessageText,
        onRemove: () => {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          showActor();
        },
      });

      if (!success.el) {
        throw new Error('Unable to show success message');
      }

      shadow.appendChild(success.el);

      const timeoutId = setTimeout(() => {
        if (success) {
          success.remove();
        }
      }, 5000);
    } catch (err) {
      // TODO: error handling
      _sentry_utils__WEBPACK_IMPORTED_MODULE_6__.logger.error(err);
    }
  }

  /**
   * Handler for when the feedback form is completed by the user. This will
   * create and send the feedback message as an event.
   */
  async function _handleFeedbackSubmit(feedback) {
    if (!dialog) {
      return;
    }

    // Simple validation for now, just check for non-empty required fields
    const emptyField = [];
    if (options.isNameRequired && !feedback.name) {
      emptyField.push(options.nameLabel);
    }
    if (options.isEmailRequired && !feedback.email) {
      emptyField.push(options.emailLabel);
    }
    if (!feedback.message) {
      emptyField.push(options.messageLabel);
    }
    if (emptyField.length > 0) {
      dialog.showError(`Please enter in the following required fields: ${emptyField.join(', ')}`);
      return;
    }

    const result = await handleFeedbackSubmit(dialog, feedback);

    // Error submitting feedback
    if (!result) {
      if (options.onSubmitError) {
        options.onSubmitError();
      }

      return;
    }

    // Success
    removeDialog();
    showSuccessMessage();

    if (options.onSubmitSuccess) {
      options.onSubmitSuccess();
    }
  }

  /**
   * Displays the default actor
   */
  function showActor() {
    actor && actor.show();
  }

  /**
   * Hides the default actor
   */
  function hideActor() {
    actor && actor.hide();
  }

  /**
   * Removes the default actor element
   */
  function removeActor() {
    actor && actor.el && actor.el.remove();
  }

  /**
   *
   */
  function openDialog() {
    try {
      if (dialog) {
        dialog.open();
        isDialogOpen = true;
        if (options.onFormOpen) {
          options.onFormOpen();
        }
        return;
      }

      const userKey = options.useSentryUser;
      const scope = (0,_sentry_core__WEBPACK_IMPORTED_MODULE_3__.getCurrentScope)();
      const user = scope && scope.getUser();

      dialog = Dialog({
        colorScheme: options.colorScheme,
        showBranding: options.showBranding,
        showName: options.showName || options.isNameRequired,
        showEmail: options.showEmail || options.isEmailRequired,
        isNameRequired: options.isNameRequired,
        isEmailRequired: options.isEmailRequired,
        formTitle: options.formTitle,
        cancelButtonLabel: options.cancelButtonLabel,
        submitButtonLabel: options.submitButtonLabel,
        emailLabel: options.emailLabel,
        emailPlaceholder: options.emailPlaceholder,
        messageLabel: options.messageLabel,
        messagePlaceholder: options.messagePlaceholder,
        nameLabel: options.nameLabel,
        namePlaceholder: options.namePlaceholder,
        defaultName: (userKey && user && user[userKey.name]) || '',
        defaultEmail: (userKey && user && user[userKey.email]) || '',
        onClosed: () => {
          showActor();
          isDialogOpen = false;

          if (options.onFormClose) {
            options.onFormClose();
          }
        },
        onCancel: () => {
          closeDialog();
          showActor();
        },
        onSubmit: _handleFeedbackSubmit,
      });

      if (!dialog.el) {
        throw new Error('Unable to open Feedback dialog');
      }

      shadow.appendChild(dialog.el);

      // Hides the default actor whenever dialog is opened
      hideActor();

      if (options.onFormOpen) {
        options.onFormOpen();
      }
    } catch (err) {
      // TODO: Error handling?
      _sentry_utils__WEBPACK_IMPORTED_MODULE_6__.logger.error(err);
    }
  }

  /**
   * Closes the dialog
   */
  function closeDialog() {
    if (dialog) {
      dialog.close();
      isDialogOpen = false;

      if (options.onFormClose) {
        options.onFormClose();
      }
    }
  }

  /**
   * Removes the dialog element from DOM
   */
  function removeDialog() {
    if (dialog) {
      closeDialog();
      const dialogEl = dialog.el;
      dialogEl && dialogEl.remove();
      dialog = undefined;
    }
  }

  /**
   *
   */
  function handleActorClick() {
    // Open dialog
    if (!isDialogOpen) {
      openDialog();
    }

    // Hide actor button
    hideActor();
  }

  if (attachTo) {
    attachTo.addEventListener('click', handleActorClick);
  } else if (shouldCreateActor) {
    actor = Actor({ buttonLabel: options.buttonLabel, onClick: handleActorClick });
    actor.el && shadow.appendChild(actor.el);
  }

  return {
    get actor() {
      return actor;
    },
    get dialog() {
      return dialog;
    },

    showActor,
    hideActor,
    removeActor,

    openDialog,
    closeDialog,
    removeDialog,
  };
}

const doc = WINDOW.document;

/**
 * Feedback integration. When added as an integration to the SDK, it will
 * inject a button in the bottom-right corner of the window that opens a
 * feedback modal when clicked.
 */
class Feedback  {
  /**
   * @inheritDoc
   */
   static __initStatic() {this.id = 'Feedback';}

  /**
   * @inheritDoc
   */

  /**
   * Feedback configuration options
   */

  /**
   * Reference to widget element that is created when autoInject is true
   */

  /**
   * List of all widgets that are created from the integration
   */

  /**
   * Reference to the host element where widget is inserted
   */

  /**
   * Refernce to Shadow DOM root
   */

  /**
   * Tracks if actor styles have ever been inserted into shadow DOM
   */

   constructor({
    id = 'sentry-feedback',
    showBranding = true,
    autoInject = true,
    showEmail = true,
    showName = true,
    useSentryUser = {
      email: 'email',
      name: 'username',
    },
    isEmailRequired = false,
    isNameRequired = false,

    themeDark,
    themeLight,
    colorScheme = 'system',

    buttonLabel = ACTOR_LABEL,
    cancelButtonLabel = CANCEL_BUTTON_LABEL,
    submitButtonLabel = SUBMIT_BUTTON_LABEL,
    formTitle = FORM_TITLE,
    emailPlaceholder = EMAIL_PLACEHOLDER,
    emailLabel = EMAIL_LABEL,
    messagePlaceholder = MESSAGE_PLACEHOLDER,
    messageLabel = MESSAGE_LABEL,
    namePlaceholder = NAME_PLACEHOLDER,
    nameLabel = NAME_LABEL,
    successMessageText = SUCCESS_MESSAGE_TEXT,

    onFormClose,
    onFormOpen,
    onSubmitError,
    onSubmitSuccess,
  } = {}) {
    // Initializations
    this.name = Feedback.id;

    // tsc fails if these are not initialized explicitly constructor, e.g. can't call `_initialize()`
    this._host = null;
    this._shadow = null;
    this._widget = null;
    this._widgets = new Set();
    this._hasInsertedActorStyles = false;

    this.options = {
      id,
      showBranding,
      autoInject,
      isEmailRequired,
      isNameRequired,
      showEmail,
      showName,
      useSentryUser,

      colorScheme,
      themeDark: {
        ...DEFAULT_THEME.dark,
        ...themeDark,
      },
      themeLight: {
        ...DEFAULT_THEME.light,
        ...themeLight,
      },

      buttonLabel,
      cancelButtonLabel,
      submitButtonLabel,
      formTitle,
      emailLabel,
      emailPlaceholder,
      messageLabel,
      messagePlaceholder,
      nameLabel,
      namePlaceholder,
      successMessageText,

      onFormClose,
      onFormOpen,
      onSubmitError,
      onSubmitSuccess,
    };
  }

  /**
   * Setup and initialize feedback container
   */
   setupOnce() {
    if (!(0,_sentry_utils__WEBPACK_IMPORTED_MODULE_7__.isBrowser)()) {
      return;
    }

    try {
      this._cleanupWidgetIfExists();

      const { autoInject } = this.options;

      if (!autoInject) {
        // Nothing to do here
        return;
      }

      this._createWidget(this.options);
    } catch (err) {
      DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_6__.logger.error(err);
    }
  }

  /**
   * Allows user to open the dialog box. Creates a new widget if
   * `autoInject` was false, otherwise re-uses the default widget that was
   * created during initialization of the integration.
   */
   openDialog() {
    if (!this._widget) {
      this._createWidget({ ...this.options, shouldCreateActor: false });
    }

    if (!this._widget) {
      return;
    }

    this._widget.openDialog();
  }

  /**
   * Closes the dialog for the default widget, if it exists
   */
   closeDialog() {
    if (!this._widget) {
      // Nothing to do if widget does not exist
      return;
    }

    this._widget.closeDialog();
  }

  /**
   * Adds click listener to attached element to open a feedback dialog
   */
   attachTo(el, optionOverrides) {
    try {
      const options = mergeOptions(this.options, optionOverrides || {});

      return this._ensureShadowHost(options, ({ shadow }) => {
        const targetEl =
          typeof el === 'string' ? doc.querySelector(el) : typeof el.addEventListener === 'function' ? el : null;

        if (!targetEl) {
          DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_6__.logger.error('[Feedback] Unable to attach to target element');
          return null;
        }

        const widget = createWidget({ shadow, options, attachTo: targetEl });
        this._widgets.add(widget);

        if (!this._widget) {
          this._widget = widget;
        }

        return widget;
      });
    } catch (err) {
      DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_6__.logger.error(err);
      return null;
    }
  }

  /**
   * Creates a new widget. Accepts partial options to override any options passed to constructor.
   */
   createWidget(
    optionOverrides,
  ) {
    try {
      return this._createWidget(mergeOptions(this.options, optionOverrides || {}));
    } catch (err) {
      DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_6__.logger.error(err);
      return null;
    }
  }

  /**
   * Removes a single widget
   */
   removeWidget(widget) {
    if (!widget) {
      return false;
    }

    try {
      if (this._widgets.has(widget)) {
        widget.removeActor();
        widget.removeDialog();
        this._widgets.delete(widget);

        if (this._widget === widget) {
          // TODO: is more clean-up needed? e.g. call remove()
          this._widget = null;
        }

        return true;
      }
    } catch (err) {
      DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_6__.logger.error(err);
    }

    return false;
  }

  /**
   * Returns the default (first-created) widget
   */
   getWidget() {
    return this._widget;
  }

  /**
   * Removes the Feedback integration (including host, shadow DOM, and all widgets)
   */
   remove() {
    if (this._host) {
      this._host.remove();
    }
    this._initialize();
  }

  /**
   * Initializes values of protected properties
   */
   _initialize() {
    this._host = null;
    this._shadow = null;
    this._widget = null;
    this._widgets = new Set();
    this._hasInsertedActorStyles = false;
  }

  /**
   * Clean-up the widget if it already exists in the DOM. This shouldn't happen
   * in prod, but can happen in development with hot module reloading.
   */
   _cleanupWidgetIfExists() {
    if (this._host) {
      this.remove();
    }
    const existingFeedback = doc.querySelector(`#${this.options.id}`);
    if (existingFeedback) {
      existingFeedback.remove();
    }
  }

  /**
   * Creates a new widget, after ensuring shadow DOM exists
   */
   _createWidget(options) {
    return this._ensureShadowHost(options, ({ shadow }) => {
      const widget = createWidget({ shadow, options });

      if (!this._hasInsertedActorStyles && widget.actor) {
        shadow.appendChild(createActorStyles(doc));
        this._hasInsertedActorStyles = true;
      }

      this._widgets.add(widget);

      if (!this._widget) {
        this._widget = widget;
      }

      return widget;
    });
  }

  /**
   * Ensures that shadow DOM exists and is added to the DOM
   */
   _ensureShadowHost(
    options,
    cb,
  ) {
    let needsAppendHost = false;

    // Don't create if it already exists
    if (!this._shadow || !this._host) {
      const { id, colorScheme, themeLight, themeDark } = options;
      const { shadow, host } = createShadowHost({
        id,
        colorScheme,
        themeLight,
        themeDark,
      });
      this._shadow = shadow;
      this._host = host;
      needsAppendHost = true;
    }

    // set data attribute on host for different themes
    this._host.dataset.sentryFeedbackColorscheme = options.colorScheme;

    const result = cb({ shadow: this._shadow, host: this._host });

    if (needsAppendHost) {
      doc.body.appendChild(this._host);
    }

    return result;
  }
} Feedback.__initStatic();


//# sourceMappingURL=index.js.map


/***/ }),

/***/ "./node_modules/@sentry/browser/esm/client.js":
/*!****************************************************!*\
  !*** ./node_modules/@sentry/browser/esm/client.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BrowserClient": () => (/* binding */ BrowserClient)
/* harmony export */ });
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/esm/baseclient.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/esm/version.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/env.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/logger.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/clientreport.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/dsn.js");
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./debug-build.js */ "./node_modules/@sentry/browser/esm/debug-build.js");
/* harmony import */ var _eventbuilder_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./eventbuilder.js */ "./node_modules/@sentry/browser/esm/eventbuilder.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./helpers.js */ "./node_modules/@sentry/browser/esm/helpers.js");
/* harmony import */ var _userfeedback_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./userfeedback.js */ "./node_modules/@sentry/browser/esm/userfeedback.js");







/**
 * Configuration options for the Sentry Browser SDK.
 * @see @sentry/types Options for more information.
 */

/**
 * The Sentry Browser SDK Client.
 *
 * @see BrowserOptions for documentation on configuration options.
 * @see SentryClient for usage documentation.
 */
class BrowserClient extends _sentry_core__WEBPACK_IMPORTED_MODULE_0__.BaseClient {
  /**
   * Creates a new Browser SDK instance.
   *
   * @param options Configuration options for this SDK.
   */
   constructor(options) {
    const sdkSource = _helpers_js__WEBPACK_IMPORTED_MODULE_1__.WINDOW.SENTRY_SDK_SOURCE || (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_2__.getSDKSource)();

    options._metadata = options._metadata || {};
    options._metadata.sdk = options._metadata.sdk || {
      name: 'sentry.javascript.browser',
      packages: [
        {
          name: `${sdkSource}:@sentry/browser`,
          version: _sentry_core__WEBPACK_IMPORTED_MODULE_3__.SDK_VERSION,
        },
      ],
      version: _sentry_core__WEBPACK_IMPORTED_MODULE_3__.SDK_VERSION,
    };

    super(options);

    if (options.sendClientReports && _helpers_js__WEBPACK_IMPORTED_MODULE_1__.WINDOW.document) {
      _helpers_js__WEBPACK_IMPORTED_MODULE_1__.WINDOW.document.addEventListener('visibilitychange', () => {
        if (_helpers_js__WEBPACK_IMPORTED_MODULE_1__.WINDOW.document.visibilityState === 'hidden') {
          this._flushOutcomes();
        }
      });
    }
  }

  /**
   * @inheritDoc
   */
   eventFromException(exception, hint) {
    return (0,_eventbuilder_js__WEBPACK_IMPORTED_MODULE_4__.eventFromException)(this._options.stackParser, exception, hint, this._options.attachStacktrace);
  }

  /**
   * @inheritDoc
   */
   eventFromMessage(
    message,
    // eslint-disable-next-line deprecation/deprecation
    level = 'info',
    hint,
  ) {
    return (0,_eventbuilder_js__WEBPACK_IMPORTED_MODULE_4__.eventFromMessage)(this._options.stackParser, message, level, hint, this._options.attachStacktrace);
  }

  /**
   * Sends user feedback to Sentry.
   */
   captureUserFeedback(feedback) {
    if (!this._isEnabled()) {
      _debug_build_js__WEBPACK_IMPORTED_MODULE_5__.DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_6__.logger.warn('SDK not enabled, will not capture user feedback.');
      return;
    }

    const envelope = (0,_userfeedback_js__WEBPACK_IMPORTED_MODULE_7__.createUserFeedbackEnvelope)(feedback, {
      metadata: this.getSdkMetadata(),
      dsn: this.getDsn(),
      tunnel: this.getOptions().tunnel,
    });

    // _sendEnvelope should not throw
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this._sendEnvelope(envelope);
  }

  /**
   * @inheritDoc
   */
   _prepareEvent(event, hint, scope) {
    event.platform = event.platform || 'javascript';
    return super._prepareEvent(event, hint, scope);
  }

  /**
   * Sends client reports as an envelope.
   */
   _flushOutcomes() {
    const outcomes = this._clearOutcomes();

    if (outcomes.length === 0) {
      _debug_build_js__WEBPACK_IMPORTED_MODULE_5__.DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_6__.logger.log('No outcomes to send');
      return;
    }

    // This is really the only place where we want to check for a DSN and only send outcomes then
    if (!this._dsn) {
      _debug_build_js__WEBPACK_IMPORTED_MODULE_5__.DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_6__.logger.log('No dsn provided, will not send outcomes');
      return;
    }

    _debug_build_js__WEBPACK_IMPORTED_MODULE_5__.DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_6__.logger.log('Sending outcomes:', outcomes);

    const envelope = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_8__.createClientReportEnvelope)(outcomes, this._options.tunnel && (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_9__.dsnToString)(this._dsn));

    // _sendEnvelope should not throw
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this._sendEnvelope(envelope);
  }
}


//# sourceMappingURL=client.js.map


/***/ }),

/***/ "./node_modules/@sentry/browser/esm/debug-build.js":
/*!*********************************************************!*\
  !*** ./node_modules/@sentry/browser/esm/debug-build.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DEBUG_BUILD": () => (/* binding */ DEBUG_BUILD)
/* harmony export */ });
/**
 * This serves as a build time flag that will be true by default, but false in non-debug builds or if users replace `__SENTRY_DEBUG__` in their generated code.
 *
 * ATTENTION: This constant must never cross package boundaries (i.e. be exported) to guarantee that it can be used for tree shaking.
 */
const DEBUG_BUILD = (typeof __SENTRY_DEBUG__ === 'undefined' || __SENTRY_DEBUG__);


//# sourceMappingURL=debug-build.js.map


/***/ }),

/***/ "./node_modules/@sentry/browser/esm/eventbuilder.js":
/*!**********************************************************!*\
  !*** ./node_modules/@sentry/browser/esm/eventbuilder.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "eventFromError": () => (/* binding */ eventFromError),
/* harmony export */   "eventFromException": () => (/* binding */ eventFromException),
/* harmony export */   "eventFromMessage": () => (/* binding */ eventFromMessage),
/* harmony export */   "eventFromPlainObject": () => (/* binding */ eventFromPlainObject),
/* harmony export */   "eventFromString": () => (/* binding */ eventFromString),
/* harmony export */   "eventFromUnknownInput": () => (/* binding */ eventFromUnknownInput),
/* harmony export */   "exceptionFromError": () => (/* binding */ exceptionFromError),
/* harmony export */   "parseStackFrames": () => (/* binding */ parseStackFrames)
/* harmony export */ });
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/esm/exports.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/is.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/normalize.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/misc.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/syncpromise.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/object.js");



/**
 * This function creates an exception from a JavaScript Error
 */
function exceptionFromError(stackParser, ex) {
  // Get the frames first since Opera can lose the stack if we touch anything else first
  const frames = parseStackFrames(stackParser, ex);

  const exception = {
    type: ex && ex.name,
    value: extractMessage(ex),
  };

  if (frames.length) {
    exception.stacktrace = { frames };
  }

  if (exception.type === undefined && exception.value === '') {
    exception.value = 'Unrecoverable error caught';
  }

  return exception;
}

/**
 * @hidden
 */
function eventFromPlainObject(
  stackParser,
  exception,
  syntheticException,
  isUnhandledRejection,
) {
  const client = (0,_sentry_core__WEBPACK_IMPORTED_MODULE_0__.getClient)();
  const normalizeDepth = client && client.getOptions().normalizeDepth;

  const event = {
    exception: {
      values: [
        {
          type: (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_1__.isEvent)(exception) ? exception.constructor.name : isUnhandledRejection ? 'UnhandledRejection' : 'Error',
          value: getNonErrorObjectExceptionValue(exception, { isUnhandledRejection }),
        },
      ],
    },
    extra: {
      __serialized__: (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_2__.normalizeToSize)(exception, normalizeDepth),
    },
  };

  if (syntheticException) {
    const frames = parseStackFrames(stackParser, syntheticException);
    if (frames.length) {
      // event.exception.values[0] has been set above
      (event.exception ).values[0].stacktrace = { frames };
    }
  }

  return event;
}

/**
 * @hidden
 */
function eventFromError(stackParser, ex) {
  return {
    exception: {
      values: [exceptionFromError(stackParser, ex)],
    },
  };
}

/** Parses stack frames from an error */
function parseStackFrames(
  stackParser,
  ex,
) {
  // Access and store the stacktrace property before doing ANYTHING
  // else to it because Opera is not very good at providing it
  // reliably in other circumstances.
  const stacktrace = ex.stacktrace || ex.stack || '';

  const popSize = getPopSize(ex);

  try {
    return stackParser(stacktrace, popSize);
  } catch (e) {
    // no-empty
  }

  return [];
}

// Based on our own mapping pattern - https://github.com/getsentry/sentry/blob/9f08305e09866c8bd6d0c24f5b0aabdd7dd6c59c/src/sentry/lang/javascript/errormapping.py#L83-L108
const reactMinifiedRegexp = /Minified React error #\d+;/i;

function getPopSize(ex) {
  if (ex) {
    if (typeof ex.framesToPop === 'number') {
      return ex.framesToPop;
    }

    if (reactMinifiedRegexp.test(ex.message)) {
      return 1;
    }
  }

  return 0;
}

/**
 * There are cases where stacktrace.message is an Event object
 * https://github.com/getsentry/sentry-javascript/issues/1949
 * In this specific case we try to extract stacktrace.message.error.message
 */
function extractMessage(ex) {
  const message = ex && ex.message;
  if (!message) {
    return 'No error message';
  }
  if (message.error && typeof message.error.message === 'string') {
    return message.error.message;
  }
  return message;
}

/**
 * Creates an {@link Event} from all inputs to `captureException` and non-primitive inputs to `captureMessage`.
 * @hidden
 */
function eventFromException(
  stackParser,
  exception,
  hint,
  attachStacktrace,
) {
  const syntheticException = (hint && hint.syntheticException) || undefined;
  const event = eventFromUnknownInput(stackParser, exception, syntheticException, attachStacktrace);
  (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_3__.addExceptionMechanism)(event); // defaults to { type: 'generic', handled: true }
  event.level = 'error';
  if (hint && hint.event_id) {
    event.event_id = hint.event_id;
  }
  return (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_4__.resolvedSyncPromise)(event);
}

/**
 * Builds and Event from a Message
 * @hidden
 */
function eventFromMessage(
  stackParser,
  message,
  // eslint-disable-next-line deprecation/deprecation
  level = 'info',
  hint,
  attachStacktrace,
) {
  const syntheticException = (hint && hint.syntheticException) || undefined;
  const event = eventFromString(stackParser, message, syntheticException, attachStacktrace);
  event.level = level;
  if (hint && hint.event_id) {
    event.event_id = hint.event_id;
  }
  return (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_4__.resolvedSyncPromise)(event);
}

/**
 * @hidden
 */
function eventFromUnknownInput(
  stackParser,
  exception,
  syntheticException,
  attachStacktrace,
  isUnhandledRejection,
) {
  let event;

  if ((0,_sentry_utils__WEBPACK_IMPORTED_MODULE_1__.isErrorEvent)(exception ) && (exception ).error) {
    // If it is an ErrorEvent with `error` property, extract it to get actual Error
    const errorEvent = exception ;
    return eventFromError(stackParser, errorEvent.error );
  }

  // If it is a `DOMError` (which is a legacy API, but still supported in some browsers) then we just extract the name
  // and message, as it doesn't provide anything else. According to the spec, all `DOMExceptions` should also be
  // `Error`s, but that's not the case in IE11, so in that case we treat it the same as we do a `DOMError`.
  //
  // https://developer.mozilla.org/en-US/docs/Web/API/DOMError
  // https://developer.mozilla.org/en-US/docs/Web/API/DOMException
  // https://webidl.spec.whatwg.org/#es-DOMException-specialness
  if ((0,_sentry_utils__WEBPACK_IMPORTED_MODULE_1__.isDOMError)(exception) || (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_1__.isDOMException)(exception )) {
    const domException = exception ;

    if ('stack' in (exception )) {
      event = eventFromError(stackParser, exception );
    } else {
      const name = domException.name || ((0,_sentry_utils__WEBPACK_IMPORTED_MODULE_1__.isDOMError)(domException) ? 'DOMError' : 'DOMException');
      const message = domException.message ? `${name}: ${domException.message}` : name;
      event = eventFromString(stackParser, message, syntheticException, attachStacktrace);
      (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_3__.addExceptionTypeValue)(event, message);
    }
    if ('code' in domException) {
      // eslint-disable-next-line deprecation/deprecation
      event.tags = { ...event.tags, 'DOMException.code': `${domException.code}` };
    }

    return event;
  }
  if ((0,_sentry_utils__WEBPACK_IMPORTED_MODULE_1__.isError)(exception)) {
    // we have a real Error object, do nothing
    return eventFromError(stackParser, exception);
  }
  if ((0,_sentry_utils__WEBPACK_IMPORTED_MODULE_1__.isPlainObject)(exception) || (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_1__.isEvent)(exception)) {
    // If it's a plain object or an instance of `Event` (the built-in JS kind, not this SDK's `Event` type), serialize
    // it manually. This will allow us to group events based on top-level keys which is much better than creating a new
    // group on any key/value change.
    const objectException = exception ;
    event = eventFromPlainObject(stackParser, objectException, syntheticException, isUnhandledRejection);
    (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_3__.addExceptionMechanism)(event, {
      synthetic: true,
    });
    return event;
  }

  // If none of previous checks were valid, then it means that it's not:
  // - an instance of DOMError
  // - an instance of DOMException
  // - an instance of Event
  // - an instance of Error
  // - a valid ErrorEvent (one with an error property)
  // - a plain Object
  //
  // So bail out and capture it as a simple message:
  event = eventFromString(stackParser, exception , syntheticException, attachStacktrace);
  (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_3__.addExceptionTypeValue)(event, `${exception}`, undefined);
  (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_3__.addExceptionMechanism)(event, {
    synthetic: true,
  });

  return event;
}

/**
 * @hidden
 */
function eventFromString(
  stackParser,
  input,
  syntheticException,
  attachStacktrace,
) {
  const event = {
    message: input,
  };

  if (attachStacktrace && syntheticException) {
    const frames = parseStackFrames(stackParser, syntheticException);
    if (frames.length) {
      event.exception = {
        values: [{ value: input, stacktrace: { frames } }],
      };
    }
  }

  return event;
}

function getNonErrorObjectExceptionValue(
  exception,
  { isUnhandledRejection },
) {
  const keys = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_5__.extractExceptionKeysForMessage)(exception);
  const captureType = isUnhandledRejection ? 'promise rejection' : 'exception';

  // Some ErrorEvent instances do not have an `error` property, which is why they are not handled before
  // We still want to try to get a decent message for these cases
  if ((0,_sentry_utils__WEBPACK_IMPORTED_MODULE_1__.isErrorEvent)(exception)) {
    return `Event \`ErrorEvent\` captured as ${captureType} with message \`${exception.message}\``;
  }

  if ((0,_sentry_utils__WEBPACK_IMPORTED_MODULE_1__.isEvent)(exception)) {
    const className = getObjectClassName(exception);
    return `Event \`${className}\` (type=${exception.type}) captured as ${captureType}`;
  }

  return `Object captured as ${captureType} with keys: ${keys}`;
}

function getObjectClassName(obj) {
  try {
    const prototype = Object.getPrototypeOf(obj);
    return prototype ? prototype.constructor.name : undefined;
  } catch (e) {
    // ignore errors here
  }
}


//# sourceMappingURL=eventbuilder.js.map


/***/ }),

/***/ "./node_modules/@sentry/browser/esm/helpers.js":
/*!*****************************************************!*\
  !*** ./node_modules/@sentry/browser/esm/helpers.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "WINDOW": () => (/* binding */ WINDOW),
/* harmony export */   "ignoreNextOnError": () => (/* binding */ ignoreNextOnError),
/* harmony export */   "shouldIgnoreOnError": () => (/* binding */ shouldIgnoreOnError),
/* harmony export */   "wrap": () => (/* binding */ wrap)
/* harmony export */ });
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/esm/exports.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/worldwide.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/object.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/misc.js");



const WINDOW = _sentry_utils__WEBPACK_IMPORTED_MODULE_0__.GLOBAL_OBJ ;

let ignoreOnError = 0;

/**
 * @hidden
 */
function shouldIgnoreOnError() {
  return ignoreOnError > 0;
}

/**
 * @hidden
 */
function ignoreNextOnError() {
  // onerror should trigger before setTimeout
  ignoreOnError++;
  setTimeout(() => {
    ignoreOnError--;
  });
}

/**
 * Instruments the given function and sends an event to Sentry every time the
 * function throws an exception.
 *
 * @param fn A function to wrap. It is generally safe to pass an unbound function, because the returned wrapper always
 * has a correct `this` context.
 * @returns The wrapped function.
 * @hidden
 */
function wrap(
  fn,
  options

 = {},
  before,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) {
  // for future readers what this does is wrap a function and then create
  // a bi-directional wrapping between them.
  //
  // example: wrapped = wrap(original);
  //  original.__sentry_wrapped__ -> wrapped
  //  wrapped.__sentry_original__ -> original

  if (typeof fn !== 'function') {
    return fn;
  }

  try {
    // if we're dealing with a function that was previously wrapped, return
    // the original wrapper.
    const wrapper = fn.__sentry_wrapped__;
    if (wrapper) {
      return wrapper;
    }

    // We don't wanna wrap it twice
    if ((0,_sentry_utils__WEBPACK_IMPORTED_MODULE_1__.getOriginalFunction)(fn)) {
      return fn;
    }
  } catch (e) {
    // Just accessing custom props in some Selenium environments
    // can cause a "Permission denied" exception (see raven-js#495).
    // Bail on wrapping and return the function as-is (defers to window.onerror).
    return fn;
  }

  /* eslint-disable prefer-rest-params */
  // It is important that `sentryWrapped` is not an arrow function to preserve the context of `this`
  const sentryWrapped = function () {
    const args = Array.prototype.slice.call(arguments);

    try {
      if (before && typeof before === 'function') {
        before.apply(this, arguments);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      const wrappedArguments = args.map((arg) => wrap(arg, options));

      // Attempt to invoke user-land function
      // NOTE: If you are a Sentry user, and you are seeing this stack frame, it
      //       means the sentry.javascript SDK caught an error invoking your application code. This
      //       is expected behavior and NOT indicative of a bug with sentry.javascript.
      return fn.apply(this, wrappedArguments);
    } catch (ex) {
      ignoreNextOnError();

      (0,_sentry_core__WEBPACK_IMPORTED_MODULE_2__.withScope)(scope => {
        scope.addEventProcessor(event => {
          if (options.mechanism) {
            (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_3__.addExceptionTypeValue)(event, undefined, undefined);
            (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_3__.addExceptionMechanism)(event, options.mechanism);
          }

          event.extra = {
            ...event.extra,
            arguments: args,
          };

          return event;
        });

        (0,_sentry_core__WEBPACK_IMPORTED_MODULE_2__.captureException)(ex);
      });

      throw ex;
    }
  };
  /* eslint-enable prefer-rest-params */

  // Accessing some objects may throw
  // ref: https://github.com/getsentry/sentry-javascript/issues/1168
  try {
    for (const property in fn) {
      if (Object.prototype.hasOwnProperty.call(fn, property)) {
        sentryWrapped[property] = fn[property];
      }
    }
  } catch (_oO) {} // eslint-disable-line no-empty

  // Signal that this function has been wrapped/filled already
  // for both debugging and to prevent it to being wrapped/filled twice
  (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_1__.markFunctionWrapped)(sentryWrapped, fn);

  (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_1__.addNonEnumerableProperty)(fn, '__sentry_wrapped__', sentryWrapped);

  // Restore original function name (not all browsers allow that)
  try {
    const descriptor = Object.getOwnPropertyDescriptor(sentryWrapped, 'name') ;
    if (descriptor.configurable) {
      Object.defineProperty(sentryWrapped, 'name', {
        get() {
          return fn.name;
        },
      });
    }
    // eslint-disable-next-line no-empty
  } catch (_oO) {}

  return sentryWrapped;
}

/**
 * All properties the report dialog supports
 */


//# sourceMappingURL=helpers.js.map


/***/ }),

/***/ "./node_modules/@sentry/browser/esm/integrations/breadcrumbs.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@sentry/browser/esm/integrations/breadcrumbs.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Breadcrumbs": () => (/* binding */ Breadcrumbs)
/* harmony export */ });
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/esm/integration.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/esm/exports.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/instrument/console.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/instrument/dom.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/instrument/xhr.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/instrument/fetch.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/instrument/history.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/misc.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/logger.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/browser.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/severity.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/string.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/url.js");
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../debug-build.js */ "./node_modules/@sentry/browser/esm/debug-build.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../helpers.js */ "./node_modules/@sentry/browser/esm/helpers.js");





/* eslint-disable max-lines */

/** maxStringLength gets capped to prevent 100 breadcrumbs exceeding 1MB event payload size */
const MAX_ALLOWED_STRING_LENGTH = 1024;

const INTEGRATION_NAME = 'Breadcrumbs';

const breadcrumbsIntegration = (options = {}) => {
  const _options = {
    console: true,
    dom: true,
    fetch: true,
    history: true,
    sentry: true,
    xhr: true,
    ...options,
  };

  return {
    name: INTEGRATION_NAME,
    setup(client) {
      if (_options.console) {
        (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.addConsoleInstrumentationHandler)(_getConsoleBreadcrumbHandler(client));
      }
      if (_options.dom) {
        (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_1__.addClickKeypressInstrumentationHandler)(_getDomBreadcrumbHandler(client, _options.dom));
      }
      if (_options.xhr) {
        (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_2__.addXhrInstrumentationHandler)(_getXhrBreadcrumbHandler(client));
      }
      if (_options.fetch) {
        (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_3__.addFetchInstrumentationHandler)(_getFetchBreadcrumbHandler(client));
      }
      if (_options.history) {
        (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_4__.addHistoryInstrumentationHandler)(_getHistoryBreadcrumbHandler(client));
      }
      if (_options.sentry && client.on) {
        client.on('beforeSendEvent', _getSentryBreadcrumbHandler(client));
      }
    },
  };
};

/**
 * Default Breadcrumbs instrumentations
 */
// eslint-disable-next-line deprecation/deprecation
const Breadcrumbs = (0,_sentry_core__WEBPACK_IMPORTED_MODULE_5__.convertIntegrationFnToClass)(INTEGRATION_NAME, breadcrumbsIntegration);

/**
 * Adds a breadcrumb for Sentry events or transactions if this option is enabled.
 */
function _getSentryBreadcrumbHandler(client) {
  return function addSentryBreadcrumb(event) {
    if ((0,_sentry_core__WEBPACK_IMPORTED_MODULE_6__.getClient)() !== client) {
      return;
    }

    (0,_sentry_core__WEBPACK_IMPORTED_MODULE_6__.addBreadcrumb)(
      {
        category: `sentry.${event.type === 'transaction' ? 'transaction' : 'event'}`,
        event_id: event.event_id,
        level: event.level,
        message: (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_7__.getEventDescription)(event),
      },
      {
        event,
      },
    );
  };
}

/**
 * A HOC that creaes a function that creates breadcrumbs from DOM API calls.
 * This is a HOC so that we get access to dom options in the closure.
 */
function _getDomBreadcrumbHandler(
  client,
  dom,
) {
  return function _innerDomBreadcrumb(handlerData) {
    if ((0,_sentry_core__WEBPACK_IMPORTED_MODULE_6__.getClient)() !== client) {
      return;
    }

    let target;
    let componentName;
    let keyAttrs = typeof dom === 'object' ? dom.serializeAttribute : undefined;

    let maxStringLength =
      typeof dom === 'object' && typeof dom.maxStringLength === 'number' ? dom.maxStringLength : undefined;
    if (maxStringLength && maxStringLength > MAX_ALLOWED_STRING_LENGTH) {
      _debug_build_js__WEBPACK_IMPORTED_MODULE_8__.DEBUG_BUILD &&
        _sentry_utils__WEBPACK_IMPORTED_MODULE_9__.logger.warn(
          `\`dom.maxStringLength\` cannot exceed ${MAX_ALLOWED_STRING_LENGTH}, but a value of ${maxStringLength} was configured. Sentry will use ${MAX_ALLOWED_STRING_LENGTH} instead.`,
        );
      maxStringLength = MAX_ALLOWED_STRING_LENGTH;
    }

    if (typeof keyAttrs === 'string') {
      keyAttrs = [keyAttrs];
    }

    // Accessing event.target can throw (see getsentry/raven-js#838, #768)
    try {
      const event = handlerData.event ;
      const element = _isEvent(event) ? event.target : event;

      target = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_10__.htmlTreeAsString)(element, { keyAttrs, maxStringLength });
      componentName = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_10__.getComponentName)(element);
    } catch (e) {
      target = '<unknown>';
    }

    if (target.length === 0) {
      return;
    }

    const breadcrumb = {
      category: `ui.${handlerData.name}`,
      message: target,
    };

    if (componentName) {
      breadcrumb.data = { 'ui.component_name': componentName };
    }

    (0,_sentry_core__WEBPACK_IMPORTED_MODULE_6__.addBreadcrumb)(breadcrumb, {
      event: handlerData.event,
      name: handlerData.name,
      global: handlerData.global,
    });
  };
}

/**
 * Creates breadcrumbs from console API calls
 */
function _getConsoleBreadcrumbHandler(client) {
  return function _consoleBreadcrumb(handlerData) {
    if ((0,_sentry_core__WEBPACK_IMPORTED_MODULE_6__.getClient)() !== client) {
      return;
    }

    const breadcrumb = {
      category: 'console',
      data: {
        arguments: handlerData.args,
        logger: 'console',
      },
      level: (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_11__.severityLevelFromString)(handlerData.level),
      message: (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_12__.safeJoin)(handlerData.args, ' '),
    };

    if (handlerData.level === 'assert') {
      if (handlerData.args[0] === false) {
        breadcrumb.message = `Assertion failed: ${(0,_sentry_utils__WEBPACK_IMPORTED_MODULE_12__.safeJoin)(handlerData.args.slice(1), ' ') || 'console.assert'}`;
        breadcrumb.data.arguments = handlerData.args.slice(1);
      } else {
        // Don't capture a breadcrumb for passed assertions
        return;
      }
    }

    (0,_sentry_core__WEBPACK_IMPORTED_MODULE_6__.addBreadcrumb)(breadcrumb, {
      input: handlerData.args,
      level: handlerData.level,
    });
  };
}

/**
 * Creates breadcrumbs from XHR API calls
 */
function _getXhrBreadcrumbHandler(client) {
  return function _xhrBreadcrumb(handlerData) {
    if ((0,_sentry_core__WEBPACK_IMPORTED_MODULE_6__.getClient)() !== client) {
      return;
    }

    const { startTimestamp, endTimestamp } = handlerData;

    const sentryXhrData = handlerData.xhr[_sentry_utils__WEBPACK_IMPORTED_MODULE_2__.SENTRY_XHR_DATA_KEY];

    // We only capture complete, non-sentry requests
    if (!startTimestamp || !endTimestamp || !sentryXhrData) {
      return;
    }

    const { method, url, status_code, body } = sentryXhrData;

    const data = {
      method,
      url,
      status_code,
    };

    const hint = {
      xhr: handlerData.xhr,
      input: body,
      startTimestamp,
      endTimestamp,
    };

    (0,_sentry_core__WEBPACK_IMPORTED_MODULE_6__.addBreadcrumb)(
      {
        category: 'xhr',
        data,
        type: 'http',
      },
      hint,
    );
  };
}

/**
 * Creates breadcrumbs from fetch API calls
 */
function _getFetchBreadcrumbHandler(client) {
  return function _fetchBreadcrumb(handlerData) {
    if ((0,_sentry_core__WEBPACK_IMPORTED_MODULE_6__.getClient)() !== client) {
      return;
    }

    const { startTimestamp, endTimestamp } = handlerData;

    // We only capture complete fetch requests
    if (!endTimestamp) {
      return;
    }

    if (handlerData.fetchData.url.match(/sentry_key/) && handlerData.fetchData.method === 'POST') {
      // We will not create breadcrumbs for fetch requests that contain `sentry_key` (internal sentry requests)
      return;
    }

    if (handlerData.error) {
      const data = handlerData.fetchData;
      const hint = {
        data: handlerData.error,
        input: handlerData.args,
        startTimestamp,
        endTimestamp,
      };

      (0,_sentry_core__WEBPACK_IMPORTED_MODULE_6__.addBreadcrumb)(
        {
          category: 'fetch',
          data,
          level: 'error',
          type: 'http',
        },
        hint,
      );
    } else {
      const response = handlerData.response ;
      const data = {
        ...handlerData.fetchData,
        status_code: response && response.status,
      };
      const hint = {
        input: handlerData.args,
        response,
        startTimestamp,
        endTimestamp,
      };
      (0,_sentry_core__WEBPACK_IMPORTED_MODULE_6__.addBreadcrumb)(
        {
          category: 'fetch',
          data,
          type: 'http',
        },
        hint,
      );
    }
  };
}

/**
 * Creates breadcrumbs from history API calls
 */
function _getHistoryBreadcrumbHandler(client) {
  return function _historyBreadcrumb(handlerData) {
    if ((0,_sentry_core__WEBPACK_IMPORTED_MODULE_6__.getClient)() !== client) {
      return;
    }

    let from = handlerData.from;
    let to = handlerData.to;
    const parsedLoc = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_13__.parseUrl)(_helpers_js__WEBPACK_IMPORTED_MODULE_14__.WINDOW.location.href);
    let parsedFrom = from ? (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_13__.parseUrl)(from) : undefined;
    const parsedTo = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_13__.parseUrl)(to);

    // Initial pushState doesn't provide `from` information
    if (!parsedFrom || !parsedFrom.path) {
      parsedFrom = parsedLoc;
    }

    // Use only the path component of the URL if the URL matches the current
    // document (almost all the time when using pushState)
    if (parsedLoc.protocol === parsedTo.protocol && parsedLoc.host === parsedTo.host) {
      to = parsedTo.relative;
    }
    if (parsedLoc.protocol === parsedFrom.protocol && parsedLoc.host === parsedFrom.host) {
      from = parsedFrom.relative;
    }

    (0,_sentry_core__WEBPACK_IMPORTED_MODULE_6__.addBreadcrumb)({
      category: 'navigation',
      data: {
        from,
        to,
      },
    });
  };
}

function _isEvent(event) {
  return !!event && !!(event ).target;
}


//# sourceMappingURL=breadcrumbs.js.map


/***/ }),

/***/ "./node_modules/@sentry/browser/esm/integrations/dedupe.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@sentry/browser/esm/integrations/dedupe.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Dedupe": () => (/* binding */ Dedupe)
/* harmony export */ });
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/esm/integration.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/logger.js");
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../debug-build.js */ "./node_modules/@sentry/browser/esm/debug-build.js");




const INTEGRATION_NAME = 'Dedupe';

const dedupeIntegration = () => {
  let previousEvent;

  return {
    name: INTEGRATION_NAME,
    processEvent(currentEvent) {
      // We want to ignore any non-error type events, e.g. transactions or replays
      // These should never be deduped, and also not be compared against as _previousEvent.
      if (currentEvent.type) {
        return currentEvent;
      }

      // Juuust in case something goes wrong
      try {
        if (_shouldDropEvent(currentEvent, previousEvent)) {
          _debug_build_js__WEBPACK_IMPORTED_MODULE_0__.DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_1__.logger.warn('Event dropped due to being a duplicate of previously captured event.');
          return null;
        }
      } catch (_oO) {} // eslint-disable-line no-empty

      return (previousEvent = currentEvent);
    },
  };
};

/** Deduplication filter */
// eslint-disable-next-line deprecation/deprecation
const Dedupe = (0,_sentry_core__WEBPACK_IMPORTED_MODULE_2__.convertIntegrationFnToClass)(INTEGRATION_NAME, dedupeIntegration);

function _shouldDropEvent(currentEvent, previousEvent) {
  if (!previousEvent) {
    return false;
  }

  if (_isSameMessageEvent(currentEvent, previousEvent)) {
    return true;
  }

  if (_isSameExceptionEvent(currentEvent, previousEvent)) {
    return true;
  }

  return false;
}

function _isSameMessageEvent(currentEvent, previousEvent) {
  const currentMessage = currentEvent.message;
  const previousMessage = previousEvent.message;

  // If neither event has a message property, they were both exceptions, so bail out
  if (!currentMessage && !previousMessage) {
    return false;
  }

  // If only one event has a stacktrace, but not the other one, they are not the same
  if ((currentMessage && !previousMessage) || (!currentMessage && previousMessage)) {
    return false;
  }

  if (currentMessage !== previousMessage) {
    return false;
  }

  if (!_isSameFingerprint(currentEvent, previousEvent)) {
    return false;
  }

  if (!_isSameStacktrace(currentEvent, previousEvent)) {
    return false;
  }

  return true;
}

function _isSameExceptionEvent(currentEvent, previousEvent) {
  const previousException = _getExceptionFromEvent(previousEvent);
  const currentException = _getExceptionFromEvent(currentEvent);

  if (!previousException || !currentException) {
    return false;
  }

  if (previousException.type !== currentException.type || previousException.value !== currentException.value) {
    return false;
  }

  if (!_isSameFingerprint(currentEvent, previousEvent)) {
    return false;
  }

  if (!_isSameStacktrace(currentEvent, previousEvent)) {
    return false;
  }

  return true;
}

function _isSameStacktrace(currentEvent, previousEvent) {
  let currentFrames = _getFramesFromEvent(currentEvent);
  let previousFrames = _getFramesFromEvent(previousEvent);

  // If neither event has a stacktrace, they are assumed to be the same
  if (!currentFrames && !previousFrames) {
    return true;
  }

  // If only one event has a stacktrace, but not the other one, they are not the same
  if ((currentFrames && !previousFrames) || (!currentFrames && previousFrames)) {
    return false;
  }

  currentFrames = currentFrames ;
  previousFrames = previousFrames ;

  // If number of frames differ, they are not the same
  if (previousFrames.length !== currentFrames.length) {
    return false;
  }

  // Otherwise, compare the two
  for (let i = 0; i < previousFrames.length; i++) {
    const frameA = previousFrames[i];
    const frameB = currentFrames[i];

    if (
      frameA.filename !== frameB.filename ||
      frameA.lineno !== frameB.lineno ||
      frameA.colno !== frameB.colno ||
      frameA.function !== frameB.function
    ) {
      return false;
    }
  }

  return true;
}

function _isSameFingerprint(currentEvent, previousEvent) {
  let currentFingerprint = currentEvent.fingerprint;
  let previousFingerprint = previousEvent.fingerprint;

  // If neither event has a fingerprint, they are assumed to be the same
  if (!currentFingerprint && !previousFingerprint) {
    return true;
  }

  // If only one event has a fingerprint, but not the other one, they are not the same
  if ((currentFingerprint && !previousFingerprint) || (!currentFingerprint && previousFingerprint)) {
    return false;
  }

  currentFingerprint = currentFingerprint ;
  previousFingerprint = previousFingerprint ;

  // Otherwise, compare the two
  try {
    return !!(currentFingerprint.join('') === previousFingerprint.join(''));
  } catch (_oO) {
    return false;
  }
}

function _getExceptionFromEvent(event) {
  return event.exception && event.exception.values && event.exception.values[0];
}

function _getFramesFromEvent(event) {
  const exception = event.exception;

  if (exception) {
    try {
      // @ts-expect-error Object could be undefined
      return exception.values[0].stacktrace.frames;
    } catch (_oO) {
      return undefined;
    }
  }
  return undefined;
}


//# sourceMappingURL=dedupe.js.map


/***/ }),

/***/ "./node_modules/@sentry/browser/esm/integrations/globalhandlers.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@sentry/browser/esm/integrations/globalhandlers.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "GlobalHandlers": () => (/* binding */ GlobalHandlers)
/* harmony export */ });
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/esm/integration.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/esm/exports.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/instrument/globalError.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/is.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/instrument/globalUnhandledRejection.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/browser.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/logger.js");
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../debug-build.js */ "./node_modules/@sentry/browser/esm/debug-build.js");
/* harmony import */ var _eventbuilder_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../eventbuilder.js */ "./node_modules/@sentry/browser/esm/eventbuilder.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../helpers.js */ "./node_modules/@sentry/browser/esm/helpers.js");






/* eslint-disable @typescript-eslint/no-unsafe-member-access */

const INTEGRATION_NAME = 'GlobalHandlers';

const globalHandlersIntegrations = (options = {}) => {
  const _options = {
    onerror: true,
    onunhandledrejection: true,
    ...options,
  };

  return {
    name: INTEGRATION_NAME,
    setupOnce() {
      Error.stackTraceLimit = 50;
    },
    setup(client) {
      if (_options.onerror) {
        _installGlobalOnErrorHandler(client);
        globalHandlerLog('onerror');
      }
      if (_options.onunhandledrejection) {
        _installGlobalOnUnhandledRejectionHandler(client);
        globalHandlerLog('onunhandledrejection');
      }
    },
  };
};

/** Global handlers */
// eslint-disable-next-line deprecation/deprecation
const GlobalHandlers = (0,_sentry_core__WEBPACK_IMPORTED_MODULE_0__.convertIntegrationFnToClass)(INTEGRATION_NAME, globalHandlersIntegrations);

function _installGlobalOnErrorHandler(client) {
  (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_1__.addGlobalErrorInstrumentationHandler)(data => {
    const { stackParser, attachStacktrace } = getOptions();

    if ((0,_sentry_core__WEBPACK_IMPORTED_MODULE_2__.getClient)() !== client || (0,_helpers_js__WEBPACK_IMPORTED_MODULE_3__.shouldIgnoreOnError)()) {
      return;
    }

    const { msg, url, line, column, error } = data;

    const event =
      error === undefined && (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_4__.isString)(msg)
        ? _eventFromIncompleteOnError(msg, url, line, column)
        : _enhanceEventWithInitialFrame(
            (0,_eventbuilder_js__WEBPACK_IMPORTED_MODULE_5__.eventFromUnknownInput)(stackParser, error || msg, undefined, attachStacktrace, false),
            url,
            line,
            column,
          );

    event.level = 'error';

    (0,_sentry_core__WEBPACK_IMPORTED_MODULE_2__.captureEvent)(event, {
      originalException: error,
      mechanism: {
        handled: false,
        type: 'onerror',
      },
    });
  });
}

function _installGlobalOnUnhandledRejectionHandler(client) {
  (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_6__.addGlobalUnhandledRejectionInstrumentationHandler)(e => {
    const { stackParser, attachStacktrace } = getOptions();

    if ((0,_sentry_core__WEBPACK_IMPORTED_MODULE_2__.getClient)() !== client || (0,_helpers_js__WEBPACK_IMPORTED_MODULE_3__.shouldIgnoreOnError)()) {
      return;
    }

    const error = _getUnhandledRejectionError(e );

    const event = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_4__.isPrimitive)(error)
      ? _eventFromRejectionWithPrimitive(error)
      : (0,_eventbuilder_js__WEBPACK_IMPORTED_MODULE_5__.eventFromUnknownInput)(stackParser, error, undefined, attachStacktrace, true);

    event.level = 'error';

    (0,_sentry_core__WEBPACK_IMPORTED_MODULE_2__.captureEvent)(event, {
      originalException: error,
      mechanism: {
        handled: false,
        type: 'onunhandledrejection',
      },
    });
  });
}

function _getUnhandledRejectionError(error) {
  if ((0,_sentry_utils__WEBPACK_IMPORTED_MODULE_4__.isPrimitive)(error)) {
    return error;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const e = error ;

  // dig the object of the rejection out of known event types
  try {
    // PromiseRejectionEvents store the object of the rejection under 'reason'
    // see https://developer.mozilla.org/en-US/docs/Web/API/PromiseRejectionEvent
    if ('reason' in e) {
      return e.reason;
    }

    // something, somewhere, (likely a browser extension) effectively casts PromiseRejectionEvents
    // to CustomEvents, moving the `promise` and `reason` attributes of the PRE into
    // the CustomEvent's `detail` attribute, since they're not part of CustomEvent's spec
    // see https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent and
    // https://github.com/getsentry/sentry-javascript/issues/2380
    else if ('detail' in e && 'reason' in e.detail) {
      return e.detail.reason;
    }
  } catch (e2) {} // eslint-disable-line no-empty

  return error;
}

/**
 * Create an event from a promise rejection where the `reason` is a primitive.
 *
 * @param reason: The `reason` property of the promise rejection
 * @returns An Event object with an appropriate `exception` value
 */
function _eventFromRejectionWithPrimitive(reason) {
  return {
    exception: {
      values: [
        {
          type: 'UnhandledRejection',
          // String() is needed because the Primitive type includes symbols (which can't be automatically stringified)
          value: `Non-Error promise rejection captured with value: ${String(reason)}`,
        },
      ],
    },
  };
}

/**
 * This function creates a stack from an old, error-less onerror handler.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function _eventFromIncompleteOnError(msg, url, line, column) {
  const ERROR_TYPES_RE =
    /^(?:[Uu]ncaught (?:exception: )?)?(?:((?:Eval|Internal|Range|Reference|Syntax|Type|URI|)Error): )?(.*)$/i;

  // If 'message' is ErrorEvent, get real message from inside
  let message = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_4__.isErrorEvent)(msg) ? msg.message : msg;
  let name = 'Error';

  const groups = message.match(ERROR_TYPES_RE);
  if (groups) {
    name = groups[1];
    message = groups[2];
  }

  const event = {
    exception: {
      values: [
        {
          type: name,
          value: message,
        },
      ],
    },
  };

  return _enhanceEventWithInitialFrame(event, url, line, column);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function _enhanceEventWithInitialFrame(event, url, line, column) {
  // event.exception
  const e = (event.exception = event.exception || {});
  // event.exception.values
  const ev = (e.values = e.values || []);
  // event.exception.values[0]
  const ev0 = (ev[0] = ev[0] || {});
  // event.exception.values[0].stacktrace
  const ev0s = (ev0.stacktrace = ev0.stacktrace || {});
  // event.exception.values[0].stacktrace.frames
  const ev0sf = (ev0s.frames = ev0s.frames || []);

  const colno = isNaN(parseInt(column, 10)) ? undefined : column;
  const lineno = isNaN(parseInt(line, 10)) ? undefined : line;
  const filename = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_4__.isString)(url) && url.length > 0 ? url : (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_7__.getLocationHref)();

  // event.exception.values[0].stacktrace.frames
  if (ev0sf.length === 0) {
    ev0sf.push({
      colno,
      filename,
      function: '?',
      in_app: true,
      lineno,
    });
  }

  return event;
}

function globalHandlerLog(type) {
  _debug_build_js__WEBPACK_IMPORTED_MODULE_8__.DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_9__.logger.log(`Global Handler attached: ${type}`);
}

function getOptions() {
  const client = (0,_sentry_core__WEBPACK_IMPORTED_MODULE_2__.getClient)();
  const options = (client && client.getOptions()) || {
    stackParser: () => [],
    attachStacktrace: false,
  };
  return options;
}


//# sourceMappingURL=globalhandlers.js.map


/***/ }),

/***/ "./node_modules/@sentry/browser/esm/integrations/httpcontext.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@sentry/browser/esm/integrations/httpcontext.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "HttpContext": () => (/* binding */ HttpContext)
/* harmony export */ });
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/esm/integration.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../helpers.js */ "./node_modules/@sentry/browser/esm/helpers.js");



const INTEGRATION_NAME = 'HttpContext';

const httpContextIntegration = () => {
  return {
    name: INTEGRATION_NAME,
    preprocessEvent(event) {
      // if none of the information we want exists, don't bother
      if (!_helpers_js__WEBPACK_IMPORTED_MODULE_0__.WINDOW.navigator && !_helpers_js__WEBPACK_IMPORTED_MODULE_0__.WINDOW.location && !_helpers_js__WEBPACK_IMPORTED_MODULE_0__.WINDOW.document) {
        return;
      }

      // grab as much info as exists and add it to the event
      const url = (event.request && event.request.url) || (_helpers_js__WEBPACK_IMPORTED_MODULE_0__.WINDOW.location && _helpers_js__WEBPACK_IMPORTED_MODULE_0__.WINDOW.location.href);
      const { referrer } = _helpers_js__WEBPACK_IMPORTED_MODULE_0__.WINDOW.document || {};
      const { userAgent } = _helpers_js__WEBPACK_IMPORTED_MODULE_0__.WINDOW.navigator || {};

      const headers = {
        ...(event.request && event.request.headers),
        ...(referrer && { Referer: referrer }),
        ...(userAgent && { 'User-Agent': userAgent }),
      };
      const request = { ...event.request, ...(url && { url }), headers };

      event.request = request;
    },
  };
};

/** HttpContext integration collects information about HTTP request headers */
// eslint-disable-next-line deprecation/deprecation
const HttpContext = (0,_sentry_core__WEBPACK_IMPORTED_MODULE_1__.convertIntegrationFnToClass)(INTEGRATION_NAME, httpContextIntegration);


//# sourceMappingURL=httpcontext.js.map


/***/ }),

/***/ "./node_modules/@sentry/browser/esm/integrations/linkederrors.js":
/*!***********************************************************************!*\
  !*** ./node_modules/@sentry/browser/esm/integrations/linkederrors.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "LinkedErrors": () => (/* binding */ LinkedErrors)
/* harmony export */ });
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/esm/integration.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/aggregate-errors.js");
/* harmony import */ var _eventbuilder_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../eventbuilder.js */ "./node_modules/@sentry/browser/esm/eventbuilder.js");




const DEFAULT_KEY = 'cause';
const DEFAULT_LIMIT = 5;

const INTEGRATION_NAME = 'LinkedErrors';

const linkedErrorsIntegration = (options = {}) => {
  const limit = options.limit || DEFAULT_LIMIT;
  const key = options.key || DEFAULT_KEY;

  return {
    name: INTEGRATION_NAME,
    preprocessEvent(event, hint, client) {
      const options = client.getOptions();

      (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.applyAggregateErrorsToEvent)(
        // This differs from the LinkedErrors integration in core by using a different exceptionFromError function
        _eventbuilder_js__WEBPACK_IMPORTED_MODULE_1__.exceptionFromError,
        options.stackParser,
        options.maxValueLength,
        key,
        limit,
        event,
        hint,
      );
    },
  };
};

/** Aggregrate linked errors in an event. */
// eslint-disable-next-line deprecation/deprecation
const LinkedErrors = (0,_sentry_core__WEBPACK_IMPORTED_MODULE_2__.convertIntegrationFnToClass)(INTEGRATION_NAME, linkedErrorsIntegration);


//# sourceMappingURL=linkederrors.js.map


/***/ }),

/***/ "./node_modules/@sentry/browser/esm/integrations/trycatch.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@sentry/browser/esm/integrations/trycatch.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TryCatch": () => (/* binding */ TryCatch)
/* harmony export */ });
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/esm/integration.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/object.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/stacktrace.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../helpers.js */ "./node_modules/@sentry/browser/esm/helpers.js");




const DEFAULT_EVENT_TARGET = [
  'EventTarget',
  'Window',
  'Node',
  'ApplicationCache',
  'AudioTrackList',
  'BroadcastChannel',
  'ChannelMergerNode',
  'CryptoOperation',
  'EventSource',
  'FileReader',
  'HTMLUnknownElement',
  'IDBDatabase',
  'IDBRequest',
  'IDBTransaction',
  'KeyOperation',
  'MediaController',
  'MessagePort',
  'ModalWindow',
  'Notification',
  'SVGElementInstance',
  'Screen',
  'SharedWorker',
  'TextTrack',
  'TextTrackCue',
  'TextTrackList',
  'WebSocket',
  'WebSocketWorker',
  'Worker',
  'XMLHttpRequest',
  'XMLHttpRequestEventTarget',
  'XMLHttpRequestUpload',
];

const INTEGRATION_NAME = 'TryCatch';

const tryCatchIntegration = (options = {}) => {
  const _options = {
    XMLHttpRequest: true,
    eventTarget: true,
    requestAnimationFrame: true,
    setInterval: true,
    setTimeout: true,
    ...options,
  };

  return {
    name: INTEGRATION_NAME,
    // TODO: This currently only works for the first client this is setup
    // We may want to adjust this to check for client etc.
    setupOnce() {
      if (_options.setTimeout) {
        (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.fill)(_helpers_js__WEBPACK_IMPORTED_MODULE_1__.WINDOW, 'setTimeout', _wrapTimeFunction);
      }

      if (_options.setInterval) {
        (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.fill)(_helpers_js__WEBPACK_IMPORTED_MODULE_1__.WINDOW, 'setInterval', _wrapTimeFunction);
      }

      if (_options.requestAnimationFrame) {
        (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.fill)(_helpers_js__WEBPACK_IMPORTED_MODULE_1__.WINDOW, 'requestAnimationFrame', _wrapRAF);
      }

      if (_options.XMLHttpRequest && "XMLHttpRequest" in _helpers_js__WEBPACK_IMPORTED_MODULE_1__.WINDOW) {
        (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.fill)(XMLHttpRequest.prototype, 'send', _wrapXHR);
      }

      const eventTargetOption = _options.eventTarget;
      if (eventTargetOption) {
        const eventTarget = Array.isArray(eventTargetOption) ? eventTargetOption : DEFAULT_EVENT_TARGET;
        eventTarget.forEach(_wrapEventTarget);
      }
    },
  };
};

/** Wrap timer functions and event targets to catch errors and provide better meta data */
// eslint-disable-next-line deprecation/deprecation
const TryCatch = (0,_sentry_core__WEBPACK_IMPORTED_MODULE_2__.convertIntegrationFnToClass)(INTEGRATION_NAME, tryCatchIntegration);

function _wrapTimeFunction(original) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function ( ...args) {
    const originalCallback = args[0];
    args[0] = (0,_helpers_js__WEBPACK_IMPORTED_MODULE_1__.wrap)(originalCallback, {
      mechanism: {
        data: { function: (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_3__.getFunctionName)(original) },
        handled: false,
        type: 'instrument',
      },
    });
    return original.apply(this, args);
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function _wrapRAF(original) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function ( callback) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return original.apply(this, [
      (0,_helpers_js__WEBPACK_IMPORTED_MODULE_1__.wrap)(callback, {
        mechanism: {
          data: {
            function: 'requestAnimationFrame',
            handler: (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_3__.getFunctionName)(original),
          },
          handled: false,
          type: 'instrument',
        },
      }),
    ]);
  };
}

function _wrapXHR(originalSend) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function ( ...args) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const xhr = this;
    const xmlHttpRequestProps = ['onload', 'onerror', 'onprogress', 'onreadystatechange'];

    xmlHttpRequestProps.forEach(prop => {
      if (prop in xhr && typeof xhr[prop] === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.fill)(xhr, prop, function (original) {
          const wrapOptions = {
            mechanism: {
              data: {
                function: prop,
                handler: (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_3__.getFunctionName)(original),
              },
              handled: false,
              type: 'instrument',
            },
          };

          // If Instrument integration has been called before TryCatch, get the name of original function
          const originalFunction = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.getOriginalFunction)(original);
          if (originalFunction) {
            wrapOptions.mechanism.data.handler = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_3__.getFunctionName)(originalFunction);
          }

          // Otherwise wrap directly
          return (0,_helpers_js__WEBPACK_IMPORTED_MODULE_1__.wrap)(original, wrapOptions);
        });
      }
    });

    return originalSend.apply(this, args);
  };
}

function _wrapEventTarget(target) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globalObject = _helpers_js__WEBPACK_IMPORTED_MODULE_1__.WINDOW ;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const proto = globalObject[target] && globalObject[target].prototype;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, no-prototype-builtins
  if (!proto || !proto.hasOwnProperty || !proto.hasOwnProperty('addEventListener')) {
    return;
  }

  (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.fill)(proto, 'addEventListener', function (original,)

 {
    return function (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any

      eventName,
      fn,
      options,
    ) {
      try {
        if (typeof fn.handleEvent === 'function') {
          // ESlint disable explanation:
          //  First, it is generally safe to call `wrap` with an unbound function. Furthermore, using `.bind()` would
          //  introduce a bug here, because bind returns a new function that doesn't have our
          //  flags(like __sentry_original__) attached. `wrap` checks for those flags to avoid unnecessary wrapping.
          //  Without those flags, every call to addEventListener wraps the function again, causing a memory leak.
          // eslint-disable-next-line @typescript-eslint/unbound-method
          fn.handleEvent = (0,_helpers_js__WEBPACK_IMPORTED_MODULE_1__.wrap)(fn.handleEvent, {
            mechanism: {
              data: {
                function: 'handleEvent',
                handler: (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_3__.getFunctionName)(fn),
                target,
              },
              handled: false,
              type: 'instrument',
            },
          });
        }
      } catch (err) {
        // can sometimes get 'Permission denied to access property "handle Event'
      }

      return original.apply(this, [
        eventName,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (0,_helpers_js__WEBPACK_IMPORTED_MODULE_1__.wrap)(fn , {
          mechanism: {
            data: {
              function: 'addEventListener',
              handler: (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_3__.getFunctionName)(fn),
              target,
            },
            handled: false,
            type: 'instrument',
          },
        }),
        options,
      ]);
    };
  });

  (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.fill)(
    proto,
    'removeEventListener',
    function (
      originalRemoveEventListener,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) {
      return function (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any

        eventName,
        fn,
        options,
      ) {
        /**
         * There are 2 possible scenarios here:
         *
         * 1. Someone passes a callback, which was attached prior to Sentry initialization, or by using unmodified
         * method, eg. `document.addEventListener.call(el, name, handler). In this case, we treat this function
         * as a pass-through, and call original `removeEventListener` with it.
         *
         * 2. Someone passes a callback, which was attached after Sentry was initialized, which means that it was using
         * our wrapped version of `addEventListener`, which internally calls `wrap` helper.
         * This helper "wraps" whole callback inside a try/catch statement, and attached appropriate metadata to it,
         * in order for us to make a distinction between wrapped/non-wrapped functions possible.
         * If a function was wrapped, it has additional property of `__sentry_wrapped__`, holding the handler.
         *
         * When someone adds a handler prior to initialization, and then do it again, but after,
         * then we have to detach both of them. Otherwise, if we'd detach only wrapped one, it'd be impossible
         * to get rid of the initial handler and it'd stick there forever.
         */
        const wrappedEventHandler = fn ;
        try {
          const originalEventHandler = wrappedEventHandler && wrappedEventHandler.__sentry_wrapped__;
          if (originalEventHandler) {
            originalRemoveEventListener.call(this, eventName, originalEventHandler, options);
          }
        } catch (e) {
          // ignore, accessing __sentry_wrapped__ will throw in some Selenium environments
        }
        return originalRemoveEventListener.call(this, eventName, wrappedEventHandler, options);
      };
    },
  );
}


//# sourceMappingURL=trycatch.js.map


/***/ }),

/***/ "./node_modules/@sentry/browser/esm/sdk.js":
/*!*************************************************!*\
  !*** ./node_modules/@sentry/browser/esm/sdk.js ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "captureUserFeedback": () => (/* binding */ captureUserFeedback),
/* harmony export */   "defaultIntegrations": () => (/* binding */ defaultIntegrations),
/* harmony export */   "forceLoad": () => (/* binding */ forceLoad),
/* harmony export */   "init": () => (/* binding */ init),
/* harmony export */   "onLoad": () => (/* binding */ onLoad),
/* harmony export */   "showReportDialog": () => (/* binding */ showReportDialog),
/* harmony export */   "wrap": () => (/* binding */ wrap)
/* harmony export */ });
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/esm/integrations/inboundfilters.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/esm/integrations/functiontostring.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/esm/integration.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/esm/sdk.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/esm/hub.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/esm/api.js");
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/esm/exports.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/stacktrace.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/supports.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/logger.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/instrument/history.js");
/* harmony import */ var _client_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./client.js */ "./node_modules/@sentry/browser/esm/client.js");
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./debug-build.js */ "./node_modules/@sentry/browser/esm/debug-build.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./helpers.js */ "./node_modules/@sentry/browser/esm/helpers.js");
/* harmony import */ var _integrations_globalhandlers_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./integrations/globalhandlers.js */ "./node_modules/@sentry/browser/esm/integrations/globalhandlers.js");
/* harmony import */ var _integrations_trycatch_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./integrations/trycatch.js */ "./node_modules/@sentry/browser/esm/integrations/trycatch.js");
/* harmony import */ var _integrations_breadcrumbs_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./integrations/breadcrumbs.js */ "./node_modules/@sentry/browser/esm/integrations/breadcrumbs.js");
/* harmony import */ var _integrations_linkederrors_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./integrations/linkederrors.js */ "./node_modules/@sentry/browser/esm/integrations/linkederrors.js");
/* harmony import */ var _integrations_httpcontext_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./integrations/httpcontext.js */ "./node_modules/@sentry/browser/esm/integrations/httpcontext.js");
/* harmony import */ var _integrations_dedupe_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./integrations/dedupe.js */ "./node_modules/@sentry/browser/esm/integrations/dedupe.js");
/* harmony import */ var _stack_parsers_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./stack-parsers.js */ "./node_modules/@sentry/browser/esm/stack-parsers.js");
/* harmony import */ var _transports_fetch_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./transports/fetch.js */ "./node_modules/@sentry/browser/esm/transports/fetch.js");
/* harmony import */ var _transports_xhr_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./transports/xhr.js */ "./node_modules/@sentry/browser/esm/transports/xhr.js");















const defaultIntegrations = [
  new _sentry_core__WEBPACK_IMPORTED_MODULE_0__.InboundFilters(),
  new _sentry_core__WEBPACK_IMPORTED_MODULE_1__.FunctionToString(),
  new _integrations_trycatch_js__WEBPACK_IMPORTED_MODULE_2__.TryCatch(),
  new _integrations_breadcrumbs_js__WEBPACK_IMPORTED_MODULE_3__.Breadcrumbs(),
  new _integrations_globalhandlers_js__WEBPACK_IMPORTED_MODULE_4__.GlobalHandlers(),
  new _integrations_linkederrors_js__WEBPACK_IMPORTED_MODULE_5__.LinkedErrors(),
  new _integrations_dedupe_js__WEBPACK_IMPORTED_MODULE_6__.Dedupe(),
  new _integrations_httpcontext_js__WEBPACK_IMPORTED_MODULE_7__.HttpContext(),
];

/**
 * A magic string that build tooling can leverage in order to inject a release value into the SDK.
 */

/**
 * The Sentry Browser SDK Client.
 *
 * To use this SDK, call the {@link init} function as early as possible when
 * loading the web page. To set context information or send manual events, use
 * the provided methods.
 *
 * @example
 *
 * ```
 *
 * import { init } from '@sentry/browser';
 *
 * init({
 *   dsn: '__DSN__',
 *   // ...
 * });
 * ```
 *
 * @example
 * ```
 *
 * import { configureScope } from '@sentry/browser';
 * configureScope((scope: Scope) => {
 *   scope.setExtra({ battery: 0.7 });
 *   scope.setTag({ user_mode: 'admin' });
 *   scope.setUser({ id: '4711' });
 * });
 * ```
 *
 * @example
 * ```
 *
 * import { addBreadcrumb } from '@sentry/browser';
 * addBreadcrumb({
 *   message: 'My Breadcrumb',
 *   // ...
 * });
 * ```
 *
 * @example
 *
 * ```
 *
 * import * as Sentry from '@sentry/browser';
 * Sentry.captureMessage('Hello, world!');
 * Sentry.captureException(new Error('Good bye'));
 * Sentry.captureEvent({
 *   message: 'Manual',
 *   stacktrace: [
 *     // ...
 *   ],
 * });
 * ```
 *
 * @see {@link BrowserOptions} for documentation on configuration options.
 */
function init(options = {}) {
  if (options.defaultIntegrations === undefined) {
    options.defaultIntegrations = defaultIntegrations;
  }
  if (options.release === undefined) {
    // This allows build tooling to find-and-replace __SENTRY_RELEASE__ to inject a release value
    if (typeof __SENTRY_RELEASE__ === 'string') {
      options.release = __SENTRY_RELEASE__;
    }

    // This supports the variable that sentry-webpack-plugin injects
    if (_helpers_js__WEBPACK_IMPORTED_MODULE_8__.WINDOW.SENTRY_RELEASE && _helpers_js__WEBPACK_IMPORTED_MODULE_8__.WINDOW.SENTRY_RELEASE.id) {
      options.release = _helpers_js__WEBPACK_IMPORTED_MODULE_8__.WINDOW.SENTRY_RELEASE.id;
    }
  }
  if (options.autoSessionTracking === undefined) {
    options.autoSessionTracking = true;
  }
  if (options.sendClientReports === undefined) {
    options.sendClientReports = true;
  }

  const clientOptions = {
    ...options,
    stackParser: (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_9__.stackParserFromStackParserOptions)(options.stackParser || _stack_parsers_js__WEBPACK_IMPORTED_MODULE_10__.defaultStackParser),
    integrations: (0,_sentry_core__WEBPACK_IMPORTED_MODULE_11__.getIntegrationsToSetup)(options),
    transport: options.transport || ((0,_sentry_utils__WEBPACK_IMPORTED_MODULE_12__.supportsFetch)() ? _transports_fetch_js__WEBPACK_IMPORTED_MODULE_13__.makeFetchTransport : _transports_xhr_js__WEBPACK_IMPORTED_MODULE_14__.makeXHRTransport),
  };

  (0,_sentry_core__WEBPACK_IMPORTED_MODULE_15__.initAndBind)(_client_js__WEBPACK_IMPORTED_MODULE_16__.BrowserClient, clientOptions);

  if (options.autoSessionTracking) {
    startSessionTracking();
  }
}

/**
 * Present the user with a report dialog.
 *
 * @param options Everything is optional, we try to fetch all info need from the global scope.
 */
function showReportDialog(options = {}, hub = (0,_sentry_core__WEBPACK_IMPORTED_MODULE_17__.getCurrentHub)()) {
  // doesn't work without a document (React Native)
  if (!_helpers_js__WEBPACK_IMPORTED_MODULE_8__.WINDOW.document) {
    _debug_build_js__WEBPACK_IMPORTED_MODULE_18__.DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_19__.logger.error('Global document not defined in showReportDialog call');
    return;
  }

  const { client, scope } = hub.getStackTop();
  const dsn = options.dsn || (client && client.getDsn());
  if (!dsn) {
    _debug_build_js__WEBPACK_IMPORTED_MODULE_18__.DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_19__.logger.error('DSN not configured for showReportDialog call');
    return;
  }

  if (scope) {
    options.user = {
      ...scope.getUser(),
      ...options.user,
    };
  }

  if (!options.eventId) {
    options.eventId = hub.lastEventId();
  }

  const script = _helpers_js__WEBPACK_IMPORTED_MODULE_8__.WINDOW.document.createElement('script');
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = (0,_sentry_core__WEBPACK_IMPORTED_MODULE_20__.getReportDialogEndpoint)(dsn, options);

  if (options.onLoad) {
    script.onload = options.onLoad;
  }

  const { onClose } = options;
  if (onClose) {
    const reportDialogClosedMessageHandler = (event) => {
      if (event.data === '__sentry_reportdialog_closed__') {
        try {
          onClose();
        } finally {
          _helpers_js__WEBPACK_IMPORTED_MODULE_8__.WINDOW.removeEventListener('message', reportDialogClosedMessageHandler);
        }
      }
    };
    _helpers_js__WEBPACK_IMPORTED_MODULE_8__.WINDOW.addEventListener('message', reportDialogClosedMessageHandler);
  }

  const injectionPoint = _helpers_js__WEBPACK_IMPORTED_MODULE_8__.WINDOW.document.head || _helpers_js__WEBPACK_IMPORTED_MODULE_8__.WINDOW.document.body;
  if (injectionPoint) {
    injectionPoint.appendChild(script);
  } else {
    _debug_build_js__WEBPACK_IMPORTED_MODULE_18__.DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_19__.logger.error('Not injecting report dialog. No injection point found in HTML');
  }
}

/**
 * This function is here to be API compatible with the loader.
 * @hidden
 */
function forceLoad() {
  // Noop
}

/**
 * This function is here to be API compatible with the loader.
 * @hidden
 */
function onLoad(callback) {
  callback();
}

/**
 * Wrap code within a try/catch block so the SDK is able to capture errors.
 *
 * @deprecated This function will be removed in v8.
 * It is not part of Sentry's official API and it's easily replaceable by using a try/catch block
 * and calling Sentry.captureException.
 *
 * @param fn A function to wrap.
 *
 * @returns The result of wrapped function call.
 */
// TODO(v8): Remove this function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function wrap(fn) {
  return (0,_helpers_js__WEBPACK_IMPORTED_MODULE_8__.wrap)(fn)();
}

function startSessionOnHub(hub) {
  hub.startSession({ ignoreDuration: true });
  hub.captureSession();
}

/**
 * Enable automatic Session Tracking for the initial page load.
 */
function startSessionTracking() {
  if (typeof _helpers_js__WEBPACK_IMPORTED_MODULE_8__.WINDOW.document === 'undefined') {
    _debug_build_js__WEBPACK_IMPORTED_MODULE_18__.DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_19__.logger.warn('Session tracking in non-browser environment with @sentry/browser is not supported.');
    return;
  }

  const hub = (0,_sentry_core__WEBPACK_IMPORTED_MODULE_17__.getCurrentHub)();

  // The only way for this to be false is for there to be a version mismatch between @sentry/browser (>= 6.0.0) and
  // @sentry/hub (< 5.27.0). In the simple case, there won't ever be such a mismatch, because the two packages are
  // pinned at the same version in package.json, but there are edge cases where it's possible. See
  // https://github.com/getsentry/sentry-javascript/issues/3207 and
  // https://github.com/getsentry/sentry-javascript/issues/3234 and
  // https://github.com/getsentry/sentry-javascript/issues/3278.
  if (!hub.captureSession) {
    return;
  }

  // The session duration for browser sessions does not track a meaningful
  // concept that can be used as a metric.
  // Automatically captured sessions are akin to page views, and thus we
  // discard their duration.
  startSessionOnHub(hub);

  // We want to create a session for every navigation as well
  (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_21__.addHistoryInstrumentationHandler)(({ from, to }) => {
    // Don't create an additional session for the initial route or if the location did not change
    if (from !== undefined && from !== to) {
      startSessionOnHub((0,_sentry_core__WEBPACK_IMPORTED_MODULE_17__.getCurrentHub)());
    }
  });
}

/**
 * Captures user feedback and sends it to Sentry.
 */
function captureUserFeedback(feedback) {
  const client = (0,_sentry_core__WEBPACK_IMPORTED_MODULE_22__.getClient)();
  if (client) {
    client.captureUserFeedback(feedback);
  }
}


//# sourceMappingURL=sdk.js.map


/***/ }),

/***/ "./node_modules/@sentry/browser/esm/stack-parsers.js":
/*!***********************************************************!*\
  !*** ./node_modules/@sentry/browser/esm/stack-parsers.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "chromeStackLineParser": () => (/* binding */ chromeStackLineParser),
/* harmony export */   "defaultStackLineParsers": () => (/* binding */ defaultStackLineParsers),
/* harmony export */   "defaultStackParser": () => (/* binding */ defaultStackParser),
/* harmony export */   "geckoStackLineParser": () => (/* binding */ geckoStackLineParser),
/* harmony export */   "opera10StackLineParser": () => (/* binding */ opera10StackLineParser),
/* harmony export */   "opera11StackLineParser": () => (/* binding */ opera11StackLineParser),
/* harmony export */   "winjsStackLineParser": () => (/* binding */ winjsStackLineParser)
/* harmony export */ });
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/stacktrace.js");


// global reference to slice
const UNKNOWN_FUNCTION = '?';

const OPERA10_PRIORITY = 10;
const OPERA11_PRIORITY = 20;
const CHROME_PRIORITY = 30;
const WINJS_PRIORITY = 40;
const GECKO_PRIORITY = 50;

function createFrame(filename, func, lineno, colno) {
  const frame = {
    filename,
    function: func,
    in_app: true, // All browser frames are considered in_app
  };

  if (lineno !== undefined) {
    frame.lineno = lineno;
  }

  if (colno !== undefined) {
    frame.colno = colno;
  }

  return frame;
}

// Chromium based browsers: Chrome, Brave, new Opera, new Edge
const chromeRegex =
  /^\s*at (?:(.+?\)(?: \[.+\])?|.*?) ?\((?:address at )?)?(?:async )?((?:<anonymous>|[-a-z]+:|.*bundle|\/)?.*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;
const chromeEvalRegex = /\((\S*)(?::(\d+))(?::(\d+))\)/;

const chrome = line => {
  const parts = chromeRegex.exec(line);

  if (parts) {
    const isEval = parts[2] && parts[2].indexOf('eval') === 0; // start of line

    if (isEval) {
      const subMatch = chromeEvalRegex.exec(parts[2]);

      if (subMatch) {
        // throw out eval line/column and use top-most line/column number
        parts[2] = subMatch[1]; // url
        parts[3] = subMatch[2]; // line
        parts[4] = subMatch[3]; // column
      }
    }

    // Kamil: One more hack won't hurt us right? Understanding and adding more rules on top of these regexps right now
    // would be way too time consuming. (TODO: Rewrite whole RegExp to be more readable)
    const [func, filename] = extractSafariExtensionDetails(parts[1] || UNKNOWN_FUNCTION, parts[2]);

    return createFrame(filename, func, parts[3] ? +parts[3] : undefined, parts[4] ? +parts[4] : undefined);
  }

  return;
};

const chromeStackLineParser = [CHROME_PRIORITY, chrome];

// gecko regex: `(?:bundle|\d+\.js)`: `bundle` is for react native, `\d+\.js` also but specifically for ram bundles because it
// generates filenames without a prefix like `file://` the filenames in the stacktrace are just 42.js
// We need this specific case for now because we want no other regex to match.
const geckoREgex =
  /^\s*(.*?)(?:\((.*?)\))?(?:^|@)?((?:[-a-z]+)?:\/.*?|\[native code\]|[^@]*(?:bundle|\d+\.js)|\/[\w\-. /=]+)(?::(\d+))?(?::(\d+))?\s*$/i;
const geckoEvalRegex = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i;

const gecko = line => {
  const parts = geckoREgex.exec(line);

  if (parts) {
    const isEval = parts[3] && parts[3].indexOf(' > eval') > -1;
    if (isEval) {
      const subMatch = geckoEvalRegex.exec(parts[3]);

      if (subMatch) {
        // throw out eval line/column and use top-most line number
        parts[1] = parts[1] || 'eval';
        parts[3] = subMatch[1];
        parts[4] = subMatch[2];
        parts[5] = ''; // no column when eval
      }
    }

    let filename = parts[3];
    let func = parts[1] || UNKNOWN_FUNCTION;
    [func, filename] = extractSafariExtensionDetails(func, filename);

    return createFrame(filename, func, parts[4] ? +parts[4] : undefined, parts[5] ? +parts[5] : undefined);
  }

  return;
};

const geckoStackLineParser = [GECKO_PRIORITY, gecko];

const winjsRegex = /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:[-a-z]+):.*?):(\d+)(?::(\d+))?\)?\s*$/i;

const winjs = line => {
  const parts = winjsRegex.exec(line);

  return parts
    ? createFrame(parts[2], parts[1] || UNKNOWN_FUNCTION, +parts[3], parts[4] ? +parts[4] : undefined)
    : undefined;
};

const winjsStackLineParser = [WINJS_PRIORITY, winjs];

const opera10Regex = / line (\d+).*script (?:in )?(\S+)(?:: in function (\S+))?$/i;

const opera10 = line => {
  const parts = opera10Regex.exec(line);
  return parts ? createFrame(parts[2], parts[3] || UNKNOWN_FUNCTION, +parts[1]) : undefined;
};

const opera10StackLineParser = [OPERA10_PRIORITY, opera10];

const opera11Regex =
  / line (\d+), column (\d+)\s*(?:in (?:<anonymous function: ([^>]+)>|([^)]+))\(.*\))? in (.*):\s*$/i;

const opera11 = line => {
  const parts = opera11Regex.exec(line);
  return parts ? createFrame(parts[5], parts[3] || parts[4] || UNKNOWN_FUNCTION, +parts[1], +parts[2]) : undefined;
};

const opera11StackLineParser = [OPERA11_PRIORITY, opera11];

const defaultStackLineParsers = [chromeStackLineParser, geckoStackLineParser, winjsStackLineParser];

const defaultStackParser = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.createStackParser)(...defaultStackLineParsers);

/**
 * Safari web extensions, starting version unknown, can produce "frames-only" stacktraces.
 * What it means, is that instead of format like:
 *
 * Error: wat
 *   at function@url:row:col
 *   at function@url:row:col
 *   at function@url:row:col
 *
 * it produces something like:
 *
 *   function@url:row:col
 *   function@url:row:col
 *   function@url:row:col
 *
 * Because of that, it won't be captured by `chrome` RegExp and will fall into `Gecko` branch.
 * This function is extracted so that we can use it in both places without duplicating the logic.
 * Unfortunately "just" changing RegExp is too complicated now and making it pass all tests
 * and fix this case seems like an impossible, or at least way too time-consuming task.
 */
const extractSafariExtensionDetails = (func, filename) => {
  const isSafariExtension = func.indexOf('safari-extension') !== -1;
  const isSafariWebExtension = func.indexOf('safari-web-extension') !== -1;

  return isSafariExtension || isSafariWebExtension
    ? [
        func.indexOf('@') !== -1 ? func.split('@')[0] : UNKNOWN_FUNCTION,
        isSafariExtension ? `safari-extension:${filename}` : `safari-web-extension:${filename}`,
      ]
    : [func, filename];
};


//# sourceMappingURL=stack-parsers.js.map


/***/ }),

/***/ "./node_modules/@sentry/browser/esm/transports/fetch.js":
/*!**************************************************************!*\
  !*** ./node_modules/@sentry/browser/esm/transports/fetch.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "makeFetchTransport": () => (/* binding */ makeFetchTransport)
/* harmony export */ });
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/esm/transports/base.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/syncpromise.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils.js */ "./node_modules/@sentry/browser/esm/transports/utils.js");




/**
 * Creates a Transport that uses the Fetch API to send events to Sentry.
 */
function makeFetchTransport(
  options,
  nativeFetch = (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.getNativeFetchImplementation)(),
) {
  let pendingBodySize = 0;
  let pendingCount = 0;

  function makeRequest(request) {
    const requestSize = request.body.length;
    pendingBodySize += requestSize;
    pendingCount++;

    const requestOptions = {
      body: request.body,
      method: 'POST',
      referrerPolicy: 'origin',
      headers: options.headers,
      // Outgoing requests are usually cancelled when navigating to a different page, causing a "TypeError: Failed to
      // fetch" error and sending a "network_error" client-outcome - in Chrome, the request status shows "(cancelled)".
      // The `keepalive` flag keeps outgoing requests alive, even when switching pages. We want this since we're
      // frequently sending events right before the user is switching pages (eg. whenfinishing navigation transactions).
      // Gotchas:
      // - `keepalive` isn't supported by Firefox
      // - As per spec (https://fetch.spec.whatwg.org/#http-network-or-cache-fetch):
      //   If the sum of contentLength and inflightKeepaliveBytes is greater than 64 kibibytes, then return a network error.
      //   We will therefore only activate the flag when we're below that limit.
      // There is also a limit of requests that can be open at the same time, so we also limit this to 15
      // See https://github.com/getsentry/sentry-javascript/pull/7553 for details
      keepalive: pendingBodySize <= 60000 && pendingCount < 15,
      ...options.fetchOptions,
    };

    try {
      return nativeFetch(options.url, requestOptions).then(response => {
        pendingBodySize -= requestSize;
        pendingCount--;
        return {
          statusCode: response.status,
          headers: {
            'x-sentry-rate-limits': response.headers.get('X-Sentry-Rate-Limits'),
            'retry-after': response.headers.get('Retry-After'),
          },
        };
      });
    } catch (e) {
      (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.clearCachedFetchImplementation)();
      pendingBodySize -= requestSize;
      pendingCount--;
      return (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_1__.rejectedSyncPromise)(e);
    }
  }

  return (0,_sentry_core__WEBPACK_IMPORTED_MODULE_2__.createTransport)(options, makeRequest);
}


//# sourceMappingURL=fetch.js.map


/***/ }),

/***/ "./node_modules/@sentry/browser/esm/transports/utils.js":
/*!**************************************************************!*\
  !*** ./node_modules/@sentry/browser/esm/transports/utils.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "clearCachedFetchImplementation": () => (/* binding */ clearCachedFetchImplementation),
/* harmony export */   "getNativeFetchImplementation": () => (/* binding */ getNativeFetchImplementation)
/* harmony export */ });
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/supports.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/logger.js");
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../debug-build.js */ "./node_modules/@sentry/browser/esm/debug-build.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../helpers.js */ "./node_modules/@sentry/browser/esm/helpers.js");




let cachedFetchImpl = undefined;

/**
 * A special usecase for incorrectly wrapped Fetch APIs in conjunction with ad-blockers.
 * Whenever someone wraps the Fetch API and returns the wrong promise chain,
 * this chain becomes orphaned and there is no possible way to capture it's rejections
 * other than allowing it bubble up to this very handler. eg.
 *
 * const f = window.fetch;
 * window.fetch = function () {
 *   const p = f.apply(this, arguments);
 *
 *   p.then(function() {
 *     console.log('hi.');
 *   });
 *
 *   return p;
 * }
 *
 * `p.then(function () { ... })` is producing a completely separate promise chain,
 * however, what's returned is `p` - the result of original `fetch` call.
 *
 * This mean, that whenever we use the Fetch API to send our own requests, _and_
 * some ad-blocker blocks it, this orphaned chain will _always_ reject,
 * effectively causing another event to be captured.
 * This makes a whole process become an infinite loop, which we need to somehow
 * deal with, and break it in one way or another.
 *
 * To deal with this issue, we are making sure that we _always_ use the real
 * browser Fetch API, instead of relying on what `window.fetch` exposes.
 * The only downside to this would be missing our own requests as breadcrumbs,
 * but because we are already not doing this, it should be just fine.
 *
 * Possible failed fetch error messages per-browser:
 *
 * Chrome:  Failed to fetch
 * Edge:    Failed to Fetch
 * Firefox: NetworkError when attempting to fetch resource
 * Safari:  resource blocked by content blocker
 */
function getNativeFetchImplementation() {
  if (cachedFetchImpl) {
    return cachedFetchImpl;
  }

  /* eslint-disable @typescript-eslint/unbound-method */

  // Fast path to avoid DOM I/O
  if ((0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.isNativeFetch)(_helpers_js__WEBPACK_IMPORTED_MODULE_1__.WINDOW.fetch)) {
    return (cachedFetchImpl = _helpers_js__WEBPACK_IMPORTED_MODULE_1__.WINDOW.fetch.bind(_helpers_js__WEBPACK_IMPORTED_MODULE_1__.WINDOW));
  }

  const document = _helpers_js__WEBPACK_IMPORTED_MODULE_1__.WINDOW.document;
  let fetchImpl = _helpers_js__WEBPACK_IMPORTED_MODULE_1__.WINDOW.fetch;
  // eslint-disable-next-line deprecation/deprecation
  if (document && typeof document.createElement === 'function') {
    try {
      const sandbox = document.createElement('iframe');
      sandbox.hidden = true;
      document.head.appendChild(sandbox);
      const contentWindow = sandbox.contentWindow;
      if (contentWindow && contentWindow.fetch) {
        fetchImpl = contentWindow.fetch;
      }
      document.head.removeChild(sandbox);
    } catch (e) {
      _debug_build_js__WEBPACK_IMPORTED_MODULE_2__.DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_3__.logger.warn('Could not create sandbox iframe for pure fetch check, bailing to window.fetch: ', e);
    }
  }

  return (cachedFetchImpl = fetchImpl.bind(_helpers_js__WEBPACK_IMPORTED_MODULE_1__.WINDOW));
  /* eslint-enable @typescript-eslint/unbound-method */
}

/** Clears cached fetch impl */
function clearCachedFetchImplementation() {
  cachedFetchImpl = undefined;
}


//# sourceMappingURL=utils.js.map


/***/ }),

/***/ "./node_modules/@sentry/browser/esm/transports/xhr.js":
/*!************************************************************!*\
  !*** ./node_modules/@sentry/browser/esm/transports/xhr.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "makeXHRTransport": () => (/* binding */ makeXHRTransport)
/* harmony export */ });
/* harmony import */ var _sentry_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @sentry/core */ "./node_modules/@sentry/core/esm/transports/base.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/syncpromise.js");



/**
 * The DONE ready state for XmlHttpRequest
 *
 * Defining it here as a constant b/c XMLHttpRequest.DONE is not always defined
 * (e.g. during testing, it is `undefined`)
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/readyState}
 */
const XHR_READYSTATE_DONE = 4;

/**
 * Creates a Transport that uses the XMLHttpRequest API to send events to Sentry.
 */
function makeXHRTransport(options) {
  function makeRequest(request) {
    return new _sentry_utils__WEBPACK_IMPORTED_MODULE_0__.SyncPromise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.onerror = reject;

      xhr.onreadystatechange = () => {
        if (xhr.readyState === XHR_READYSTATE_DONE) {
          resolve({
            statusCode: xhr.status,
            headers: {
              'x-sentry-rate-limits': xhr.getResponseHeader('X-Sentry-Rate-Limits'),
              'retry-after': xhr.getResponseHeader('Retry-After'),
            },
          });
        }
      };

      xhr.open('POST', options.url);

      for (const header in options.headers) {
        if (Object.prototype.hasOwnProperty.call(options.headers, header)) {
          xhr.setRequestHeader(header, options.headers[header]);
        }
      }

      xhr.send(request.body);
    });
  }

  return (0,_sentry_core__WEBPACK_IMPORTED_MODULE_1__.createTransport)(options, makeRequest);
}


//# sourceMappingURL=xhr.js.map


/***/ }),

/***/ "./node_modules/@sentry/browser/esm/userfeedback.js":
/*!**********************************************************!*\
  !*** ./node_modules/@sentry/browser/esm/userfeedback.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createUserFeedbackEnvelope": () => (/* binding */ createUserFeedbackEnvelope)
/* harmony export */ });
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/dsn.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/envelope.js");


/**
 * Creates an envelope from a user feedback.
 */
function createUserFeedbackEnvelope(
  feedback,
  {
    metadata,
    tunnel,
    dsn,
  }

,
) {
  const headers = {
    event_id: feedback.event_id,
    sent_at: new Date().toISOString(),
    ...(metadata &&
      metadata.sdk && {
        sdk: {
          name: metadata.sdk.name,
          version: metadata.sdk.version,
        },
      }),
    ...(!!tunnel && !!dsn && { dsn: (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.dsnToString)(dsn) }),
  };
  const item = createUserFeedbackEnvelopeItem(feedback);

  return (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_1__.createEnvelope)(headers, [item]);
}

function createUserFeedbackEnvelopeItem(feedback) {
  const feedbackHeaders = {
    type: 'user_report',
  };
  return [feedbackHeaders, feedback];
}


//# sourceMappingURL=userfeedback.js.map


/***/ }),

/***/ "./node_modules/@sentry/core/esm/api.js":
/*!**********************************************!*\
  !*** ./node_modules/@sentry/core/esm/api.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getEnvelopeEndpointWithUrlEncodedAuth": () => (/* binding */ getEnvelopeEndpointWithUrlEncodedAuth),
/* harmony export */   "getReportDialogEndpoint": () => (/* binding */ getReportDialogEndpoint)
/* harmony export */ });
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/object.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/dsn.js");


const SENTRY_API_VERSION = '7';

/** Returns the prefix to construct Sentry ingestion API endpoints. */
function getBaseApiEndpoint(dsn) {
  const protocol = dsn.protocol ? `${dsn.protocol}:` : '';
  const port = dsn.port ? `:${dsn.port}` : '';
  return `${protocol}//${dsn.host}${port}${dsn.path ? `/${dsn.path}` : ''}/api/`;
}

/** Returns the ingest API endpoint for target. */
function _getIngestEndpoint(dsn) {
  return `${getBaseApiEndpoint(dsn)}${dsn.projectId}/envelope/`;
}

/** Returns a URL-encoded string with auth config suitable for a query string. */
function _encodedAuth(dsn, sdkInfo) {
  return (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.urlEncode)({
    // We send only the minimum set of required information. See
    // https://github.com/getsentry/sentry-javascript/issues/2572.
    sentry_key: dsn.publicKey,
    sentry_version: SENTRY_API_VERSION,
    ...(sdkInfo && { sentry_client: `${sdkInfo.name}/${sdkInfo.version}` }),
  });
}

/**
 * Returns the envelope endpoint URL with auth in the query string.
 *
 * Sending auth as part of the query string and not as custom HTTP headers avoids CORS preflight requests.
 */
function getEnvelopeEndpointWithUrlEncodedAuth(
  dsn,
  // TODO (v8): Remove `tunnelOrOptions` in favor of `options`, and use the substitute code below
  // options: ClientOptions = {} as ClientOptions,
  tunnelOrOptions = {} ,
) {
  // TODO (v8): Use this code instead
  // const { tunnel, _metadata = {} } = options;
  // return tunnel ? tunnel : `${_getIngestEndpoint(dsn)}?${_encodedAuth(dsn, _metadata.sdk)}`;

  const tunnel = typeof tunnelOrOptions === 'string' ? tunnelOrOptions : tunnelOrOptions.tunnel;
  const sdkInfo =
    typeof tunnelOrOptions === 'string' || !tunnelOrOptions._metadata ? undefined : tunnelOrOptions._metadata.sdk;

  return tunnel ? tunnel : `${_getIngestEndpoint(dsn)}?${_encodedAuth(dsn, sdkInfo)}`;
}

/** Returns the url to the report dialog endpoint. */
function getReportDialogEndpoint(
  dsnLike,
  dialogOptions

,
) {
  const dsn = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_1__.makeDsn)(dsnLike);
  if (!dsn) {
    return '';
  }

  const endpoint = `${getBaseApiEndpoint(dsn)}embed/error-page/`;

  let encodedOptions = `dsn=${(0,_sentry_utils__WEBPACK_IMPORTED_MODULE_1__.dsnToString)(dsn)}`;
  for (const key in dialogOptions) {
    if (key === 'dsn') {
      continue;
    }

    if (key === 'onClose') {
      continue;
    }

    if (key === 'user') {
      const user = dialogOptions.user;
      if (!user) {
        continue;
      }
      if (user.name) {
        encodedOptions += `&name=${encodeURIComponent(user.name)}`;
      }
      if (user.email) {
        encodedOptions += `&email=${encodeURIComponent(user.email)}`;
      }
    } else {
      encodedOptions += `&${encodeURIComponent(key)}=${encodeURIComponent(dialogOptions[key] )}`;
    }
  }

  return `${endpoint}?${encodedOptions}`;
}


//# sourceMappingURL=api.js.map


/***/ }),

/***/ "./node_modules/@sentry/core/esm/baseclient.js":
/*!*****************************************************!*\
  !*** ./node_modules/@sentry/core/esm/baseclient.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BaseClient": () => (/* binding */ BaseClient),
/* harmony export */   "addEventProcessor": () => (/* binding */ addEventProcessor)
/* harmony export */ });
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/dsn.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/logger.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/misc.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/is.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/syncpromise.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/envelope.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/error.js");
/* harmony import */ var _api_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./api.js */ "./node_modules/@sentry/core/esm/api.js");
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./debug-build.js */ "./node_modules/@sentry/core/esm/debug-build.js");
/* harmony import */ var _envelope_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./envelope.js */ "./node_modules/@sentry/core/esm/envelope.js");
/* harmony import */ var _exports_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./exports.js */ "./node_modules/@sentry/core/esm/exports.js");
/* harmony import */ var _hub_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./hub.js */ "./node_modules/@sentry/core/esm/hub.js");
/* harmony import */ var _integration_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./integration.js */ "./node_modules/@sentry/core/esm/integration.js");
/* harmony import */ var _metrics_envelope_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./metrics/envelope.js */ "./node_modules/@sentry/core/esm/metrics/envelope.js");
/* harmony import */ var _session_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./session.js */ "./node_modules/@sentry/core/esm/session.js");
/* harmony import */ var _tracing_dynamicSamplingContext_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./tracing/dynamicSamplingContext.js */ "./node_modules/@sentry/core/esm/tracing/dynamicSamplingContext.js");
/* harmony import */ var _utils_prepareEvent_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./utils/prepareEvent.js */ "./node_modules/@sentry/core/esm/utils/prepareEvent.js");












const ALREADY_SEEN_ERROR = "Not capturing exception because it's already been captured.";

/**
 * Base implementation for all JavaScript SDK clients.
 *
 * Call the constructor with the corresponding options
 * specific to the client subclass. To access these options later, use
 * {@link Client.getOptions}.
 *
 * If a Dsn is specified in the options, it will be parsed and stored. Use
 * {@link Client.getDsn} to retrieve the Dsn at any moment. In case the Dsn is
 * invalid, the constructor will throw a {@link SentryException}. Note that
 * without a valid Dsn, the SDK will not send any events to Sentry.
 *
 * Before sending an event, it is passed through
 * {@link BaseClient._prepareEvent} to add SDK information and scope data
 * (breadcrumbs and context). To add more custom information, override this
 * method and extend the resulting prepared event.
 *
 * To issue automatically created events (e.g. via instrumentation), use
 * {@link Client.captureEvent}. It will prepare the event and pass it through
 * the callback lifecycle. To issue auto-breadcrumbs, use
 * {@link Client.addBreadcrumb}.
 *
 * @example
 * class NodeClient extends BaseClient<NodeOptions> {
 *   public constructor(options: NodeOptions) {
 *     super(options);
 *   }
 *
 *   // ...
 * }
 */
class BaseClient {
  /**
   * A reference to a metrics aggregator
   *
   * @experimental Note this is alpha API. It may experience breaking changes in the future.
   */

  /** Options passed to the SDK. */

  /** The client Dsn, if specified in options. Without this Dsn, the SDK will be disabled. */

  /** Array of set up integrations. */

  /** Indicates whether this client's integrations have been set up. */

  /** Number of calls being processed */

  /** Holds flushable  */

  // eslint-disable-next-line @typescript-eslint/ban-types

  /**
   * Initializes this client instance.
   *
   * @param options Options for the client.
   */
   constructor(options) {
    this._options = options;
    this._integrations = {};
    this._integrationsInitialized = false;
    this._numProcessing = 0;
    this._outcomes = {};
    this._hooks = {};
    this._eventProcessors = [];

    if (options.dsn) {
      this._dsn = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.makeDsn)(options.dsn);
    } else {
      _debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_2__.logger.warn('No DSN provided, client will not send events.');
    }

    if (this._dsn) {
      const url = (0,_api_js__WEBPACK_IMPORTED_MODULE_3__.getEnvelopeEndpointWithUrlEncodedAuth)(this._dsn, options);
      this._transport = options.transport({
        recordDroppedEvent: this.recordDroppedEvent.bind(this),
        ...options.transportOptions,
        url,
      });
    }
  }

  /**
   * @inheritDoc
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
   captureException(exception, hint, scope) {
    // ensure we haven't captured this very object before
    if ((0,_sentry_utils__WEBPACK_IMPORTED_MODULE_4__.checkOrSetAlreadyCaught)(exception)) {
      _debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_2__.logger.log(ALREADY_SEEN_ERROR);
      return;
    }

    let eventId = hint && hint.event_id;

    this._process(
      this.eventFromException(exception, hint)
        .then(event => this._captureEvent(event, hint, scope))
        .then(result => {
          eventId = result;
        }),
    );

    return eventId;
  }

  /**
   * @inheritDoc
   */
   captureMessage(
    message,
    // eslint-disable-next-line deprecation/deprecation
    level,
    hint,
    scope,
  ) {
    let eventId = hint && hint.event_id;

    const promisedEvent = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_5__.isPrimitive)(message)
      ? this.eventFromMessage(String(message), level, hint)
      : this.eventFromException(message, hint);

    this._process(
      promisedEvent
        .then(event => this._captureEvent(event, hint, scope))
        .then(result => {
          eventId = result;
        }),
    );

    return eventId;
  }

  /**
   * @inheritDoc
   */
   captureEvent(event, hint, scope) {
    // ensure we haven't captured this very object before
    if (hint && hint.originalException && (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_4__.checkOrSetAlreadyCaught)(hint.originalException)) {
      _debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_2__.logger.log(ALREADY_SEEN_ERROR);
      return;
    }

    let eventId = hint && hint.event_id;

    this._process(
      this._captureEvent(event, hint, scope).then(result => {
        eventId = result;
      }),
    );

    return eventId;
  }

  /**
   * @inheritDoc
   */
   captureSession(session) {
    if (!(typeof session.release === 'string')) {
      _debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_2__.logger.warn('Discarded session because of missing or non-string release');
    } else {
      this.sendSession(session);
      // After sending, we set init false to indicate it's not the first occurrence
      (0,_session_js__WEBPACK_IMPORTED_MODULE_6__.updateSession)(session, { init: false });
    }
  }

  /**
   * @inheritDoc
   */
   getDsn() {
    return this._dsn;
  }

  /**
   * @inheritDoc
   */
   getOptions() {
    return this._options;
  }

  /**
   * @see SdkMetadata in @sentry/types
   *
   * @return The metadata of the SDK
   */
   getSdkMetadata() {
    return this._options._metadata;
  }

  /**
   * @inheritDoc
   */
   getTransport() {
    return this._transport;
  }

  /**
   * @inheritDoc
   */
   flush(timeout) {
    const transport = this._transport;
    if (transport) {
      if (this.metricsAggregator) {
        this.metricsAggregator.flush();
      }
      return this._isClientDoneProcessing(timeout).then(clientFinished => {
        return transport.flush(timeout).then(transportFlushed => clientFinished && transportFlushed);
      });
    } else {
      return (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_7__.resolvedSyncPromise)(true);
    }
  }

  /**
   * @inheritDoc
   */
   close(timeout) {
    return this.flush(timeout).then(result => {
      this.getOptions().enabled = false;
      if (this.metricsAggregator) {
        this.metricsAggregator.close();
      }
      return result;
    });
  }

  /** Get all installed event processors. */
   getEventProcessors() {
    return this._eventProcessors;
  }

  /** @inheritDoc */
   addEventProcessor(eventProcessor) {
    this._eventProcessors.push(eventProcessor);
  }

  /**
   * Sets up the integrations
   */
   setupIntegrations(forceInitialize) {
    if ((forceInitialize && !this._integrationsInitialized) || (this._isEnabled() && !this._integrationsInitialized)) {
      this._integrations = (0,_integration_js__WEBPACK_IMPORTED_MODULE_8__.setupIntegrations)(this, this._options.integrations);
      this._integrationsInitialized = true;
    }
  }

  /**
   * Gets an installed integration by its `id`.
   *
   * @returns The installed integration or `undefined` if no integration with that `id` was installed.
   */
   getIntegrationById(integrationId) {
    return this._integrations[integrationId];
  }

  /**
   * @inheritDoc
   */
   getIntegration(integration) {
    try {
      return (this._integrations[integration.id] ) || null;
    } catch (_oO) {
      _debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_2__.logger.warn(`Cannot retrieve integration ${integration.id} from the current Client`);
      return null;
    }
  }

  /**
   * @inheritDoc
   */
   addIntegration(integration) {
    (0,_integration_js__WEBPACK_IMPORTED_MODULE_8__.setupIntegration)(this, integration, this._integrations);
  }

  /**
   * @inheritDoc
   */
   sendEvent(event, hint = {}) {
    this.emit('beforeSendEvent', event, hint);

    let env = (0,_envelope_js__WEBPACK_IMPORTED_MODULE_9__.createEventEnvelope)(event, this._dsn, this._options._metadata, this._options.tunnel);

    for (const attachment of hint.attachments || []) {
      env = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_10__.addItemToEnvelope)(
        env,
        (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_10__.createAttachmentEnvelopeItem)(
          attachment,
          this._options.transportOptions && this._options.transportOptions.textEncoder,
        ),
      );
    }

    const promise = this._sendEnvelope(env);
    if (promise) {
      promise.then(sendResponse => this.emit('afterSendEvent', event, sendResponse), null);
    }
  }

  /**
   * @inheritDoc
   */
   sendSession(session) {
    const env = (0,_envelope_js__WEBPACK_IMPORTED_MODULE_9__.createSessionEnvelope)(session, this._dsn, this._options._metadata, this._options.tunnel);

    // _sendEnvelope should not throw
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this._sendEnvelope(env);
  }

  /**
   * @inheritDoc
   */
   recordDroppedEvent(reason, category, _event) {
    // Note: we use `event` in replay, where we overwrite this hook.

    if (this._options.sendClientReports) {
      // We want to track each category (error, transaction, session, replay_event) separately
      // but still keep the distinction between different type of outcomes.
      // We could use nested maps, but it's much easier to read and type this way.
      // A correct type for map-based implementation if we want to go that route
      // would be `Partial<Record<SentryRequestType, Partial<Record<Outcome, number>>>>`
      // With typescript 4.1 we could even use template literal types
      const key = `${reason}:${category}`;
      _debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_2__.logger.log(`Adding outcome: "${key}"`);

      // The following works because undefined + 1 === NaN and NaN is falsy
      this._outcomes[key] = this._outcomes[key] + 1 || 1;
    }
  }

  /**
   * @inheritDoc
   */
   captureAggregateMetrics(metricBucketItems) {
    _debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_2__.logger.log(`Flushing aggregated metrics, number of metrics: ${metricBucketItems.length}`);
    const metricsEnvelope = (0,_metrics_envelope_js__WEBPACK_IMPORTED_MODULE_11__.createMetricEnvelope)(
      metricBucketItems,
      this._dsn,
      this._options._metadata,
      this._options.tunnel,
    );

    // _sendEnvelope should not throw
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this._sendEnvelope(metricsEnvelope);
  }

  // Keep on() & emit() signatures in sync with types' client.ts interface
  /* eslint-disable @typescript-eslint/unified-signatures */

  /** @inheritdoc */

  /** @inheritdoc */
   on(hook, callback) {
    if (!this._hooks[hook]) {
      this._hooks[hook] = [];
    }

    // @ts-expect-error We assue the types are correct
    this._hooks[hook].push(callback);
  }

  /** @inheritdoc */

  /** @inheritdoc */
   emit(hook, ...rest) {
    if (this._hooks[hook]) {
      this._hooks[hook].forEach(callback => callback(...rest));
    }
  }

  /* eslint-enable @typescript-eslint/unified-signatures */

  /** Updates existing session based on the provided event */
   _updateSessionFromEvent(session, event) {
    let crashed = false;
    let errored = false;
    const exceptions = event.exception && event.exception.values;

    if (exceptions) {
      errored = true;

      for (const ex of exceptions) {
        const mechanism = ex.mechanism;
        if (mechanism && mechanism.handled === false) {
          crashed = true;
          break;
        }
      }
    }

    // A session is updated and that session update is sent in only one of the two following scenarios:
    // 1. Session with non terminal status and 0 errors + an error occurred -> Will set error count to 1 and send update
    // 2. Session with non terminal status and 1 error + a crash occurred -> Will set status crashed and send update
    const sessionNonTerminal = session.status === 'ok';
    const shouldUpdateAndSend = (sessionNonTerminal && session.errors === 0) || (sessionNonTerminal && crashed);

    if (shouldUpdateAndSend) {
      (0,_session_js__WEBPACK_IMPORTED_MODULE_6__.updateSession)(session, {
        ...(crashed && { status: 'crashed' }),
        errors: session.errors || Number(errored || crashed),
      });
      this.captureSession(session);
    }
  }

  /**
   * Determine if the client is finished processing. Returns a promise because it will wait `timeout` ms before saying
   * "no" (resolving to `false`) in order to give the client a chance to potentially finish first.
   *
   * @param timeout The time, in ms, after which to resolve to `false` if the client is still busy. Passing `0` (or not
   * passing anything) will make the promise wait as long as it takes for processing to finish before resolving to
   * `true`.
   * @returns A promise which will resolve to `true` if processing is already done or finishes before the timeout, and
   * `false` otherwise
   */
   _isClientDoneProcessing(timeout) {
    return new _sentry_utils__WEBPACK_IMPORTED_MODULE_7__.SyncPromise(resolve => {
      let ticked = 0;
      const tick = 1;

      const interval = setInterval(() => {
        if (this._numProcessing == 0) {
          clearInterval(interval);
          resolve(true);
        } else {
          ticked += tick;
          if (timeout && ticked >= timeout) {
            clearInterval(interval);
            resolve(false);
          }
        }
      }, tick);
    });
  }

  /** Determines whether this SDK is enabled and a transport is present. */
   _isEnabled() {
    return this.getOptions().enabled !== false && this._transport !== undefined;
  }

  /**
   * Adds common information to events.
   *
   * The information includes release and environment from `options`,
   * breadcrumbs and context (extra, tags and user) from the scope.
   *
   * Information that is already present in the event is never overwritten. For
   * nested objects, such as the context, keys are merged.
   *
   * @param event The original event.
   * @param hint May contain additional information about the original exception.
   * @param scope A scope containing event metadata.
   * @returns A new event with more information.
   */
   _prepareEvent(
    event,
    hint,
    scope,
    isolationScope = (0,_hub_js__WEBPACK_IMPORTED_MODULE_12__.getIsolationScope)(),
  ) {
    const options = this.getOptions();
    const integrations = Object.keys(this._integrations);
    if (!hint.integrations && integrations.length > 0) {
      hint.integrations = integrations;
    }

    this.emit('preprocessEvent', event, hint);

    return (0,_utils_prepareEvent_js__WEBPACK_IMPORTED_MODULE_13__.prepareEvent)(options, event, hint, scope, this, isolationScope).then(evt => {
      if (evt === null) {
        return evt;
      }

      // If a trace context is not set on the event, we use the propagationContext set on the event to
      // generate a trace context. If the propagationContext does not have a dynamic sampling context, we
      // also generate one for it.
      const { propagationContext } = evt.sdkProcessingMetadata || {};
      const trace = evt.contexts && evt.contexts.trace;
      if (!trace && propagationContext) {
        const { traceId: trace_id, spanId, parentSpanId, dsc } = propagationContext ;
        evt.contexts = {
          trace: {
            trace_id,
            span_id: spanId,
            parent_span_id: parentSpanId,
          },
          ...evt.contexts,
        };

        const dynamicSamplingContext = dsc ? dsc : (0,_tracing_dynamicSamplingContext_js__WEBPACK_IMPORTED_MODULE_14__.getDynamicSamplingContextFromClient)(trace_id, this, scope);

        evt.sdkProcessingMetadata = {
          dynamicSamplingContext,
          ...evt.sdkProcessingMetadata,
        };
      }
      return evt;
    });
  }

  /**
   * Processes the event and logs an error in case of rejection
   * @param event
   * @param hint
   * @param scope
   */
   _captureEvent(event, hint = {}, scope) {
    return this._processEvent(event, hint, scope).then(
      finalEvent => {
        return finalEvent.event_id;
      },
      reason => {
        if (_debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD) {
          // If something's gone wrong, log the error as a warning. If it's just us having used a `SentryError` for
          // control flow, log just the message (no stack) as a log-level log.
          const sentryError = reason ;
          if (sentryError.logLevel === 'log') {
            _sentry_utils__WEBPACK_IMPORTED_MODULE_2__.logger.log(sentryError.message);
          } else {
            _sentry_utils__WEBPACK_IMPORTED_MODULE_2__.logger.warn(sentryError);
          }
        }
        return undefined;
      },
    );
  }

  /**
   * Processes an event (either error or message) and sends it to Sentry.
   *
   * This also adds breadcrumbs and context information to the event. However,
   * platform specific meta data (such as the User's IP address) must be added
   * by the SDK implementor.
   *
   *
   * @param event The event to send to Sentry.
   * @param hint May contain additional information about the original exception.
   * @param scope A scope containing event metadata.
   * @returns A SyncPromise that resolves with the event or rejects in case event was/will not be send.
   */
   _processEvent(event, hint, scope) {
    const options = this.getOptions();
    const { sampleRate } = options;

    const isTransaction = isTransactionEvent(event);
    const isError = isErrorEvent(event);
    const eventType = event.type || 'error';
    const beforeSendLabel = `before send for type \`${eventType}\``;

    // 1.0 === 100% events are sent
    // 0.0 === 0% events are sent
    // Sampling for transaction happens somewhere else
    if (isError && typeof sampleRate === 'number' && Math.random() > sampleRate) {
      this.recordDroppedEvent('sample_rate', 'error', event);
      return (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_7__.rejectedSyncPromise)(
        new _sentry_utils__WEBPACK_IMPORTED_MODULE_15__.SentryError(
          `Discarding event because it's not included in the random sample (sampling rate = ${sampleRate})`,
          'log',
        ),
      );
    }

    const dataCategory = eventType === 'replay_event' ? 'replay' : eventType;

    return this._prepareEvent(event, hint, scope)
      .then(prepared => {
        if (prepared === null) {
          this.recordDroppedEvent('event_processor', dataCategory, event);
          throw new _sentry_utils__WEBPACK_IMPORTED_MODULE_15__.SentryError('An event processor returned `null`, will not send event.', 'log');
        }

        const isInternalException = hint.data && (hint.data ).__sentry__ === true;
        if (isInternalException) {
          return prepared;
        }

        const result = processBeforeSend(options, prepared, hint);
        return _validateBeforeSendResult(result, beforeSendLabel);
      })
      .then(processedEvent => {
        if (processedEvent === null) {
          this.recordDroppedEvent('before_send', dataCategory, event);
          throw new _sentry_utils__WEBPACK_IMPORTED_MODULE_15__.SentryError(`${beforeSendLabel} returned \`null\`, will not send event.`, 'log');
        }

        const session = scope && scope.getSession();
        if (!isTransaction && session) {
          this._updateSessionFromEvent(session, processedEvent);
        }

        // None of the Sentry built event processor will update transaction name,
        // so if the transaction name has been changed by an event processor, we know
        // it has to come from custom event processor added by a user
        const transactionInfo = processedEvent.transaction_info;
        if (isTransaction && transactionInfo && processedEvent.transaction !== event.transaction) {
          const source = 'custom';
          processedEvent.transaction_info = {
            ...transactionInfo,
            source,
          };
        }

        this.sendEvent(processedEvent, hint);
        return processedEvent;
      })
      .then(null, reason => {
        if (reason instanceof _sentry_utils__WEBPACK_IMPORTED_MODULE_15__.SentryError) {
          throw reason;
        }

        this.captureException(reason, {
          data: {
            __sentry__: true,
          },
          originalException: reason,
        });
        throw new _sentry_utils__WEBPACK_IMPORTED_MODULE_15__.SentryError(
          `Event processing pipeline threw an error, original event will not be sent. Details have been sent as a new event.\nReason: ${reason}`,
        );
      });
  }

  /**
   * Occupies the client with processing and event
   */
   _process(promise) {
    this._numProcessing++;
    void promise.then(
      value => {
        this._numProcessing--;
        return value;
      },
      reason => {
        this._numProcessing--;
        return reason;
      },
    );
  }

  /**
   * @inheritdoc
   */
   _sendEnvelope(envelope) {
    this.emit('beforeEnvelope', envelope);

    if (this._isEnabled() && this._transport) {
      return this._transport.send(envelope).then(null, reason => {
        _debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_2__.logger.error('Error while sending event:', reason);
      });
    } else {
      _debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_2__.logger.error('Transport disabled');
    }
  }

  /**
   * Clears outcomes on this client and returns them.
   */
   _clearOutcomes() {
    const outcomes = this._outcomes;
    this._outcomes = {};
    return Object.keys(outcomes).map(key => {
      const [reason, category] = key.split(':') ;
      return {
        reason,
        category,
        quantity: outcomes[key],
      };
    });
  }

  /**
   * @inheritDoc
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types

}

/**
 * Verifies that return value of configured `beforeSend` or `beforeSendTransaction` is of expected type, and returns the value if so.
 */
function _validateBeforeSendResult(
  beforeSendResult,
  beforeSendLabel,
) {
  const invalidValueError = `${beforeSendLabel} must return \`null\` or a valid event.`;
  if ((0,_sentry_utils__WEBPACK_IMPORTED_MODULE_5__.isThenable)(beforeSendResult)) {
    return beforeSendResult.then(
      event => {
        if (!(0,_sentry_utils__WEBPACK_IMPORTED_MODULE_5__.isPlainObject)(event) && event !== null) {
          throw new _sentry_utils__WEBPACK_IMPORTED_MODULE_15__.SentryError(invalidValueError);
        }
        return event;
      },
      e => {
        throw new _sentry_utils__WEBPACK_IMPORTED_MODULE_15__.SentryError(`${beforeSendLabel} rejected with ${e}`);
      },
    );
  } else if (!(0,_sentry_utils__WEBPACK_IMPORTED_MODULE_5__.isPlainObject)(beforeSendResult) && beforeSendResult !== null) {
    throw new _sentry_utils__WEBPACK_IMPORTED_MODULE_15__.SentryError(invalidValueError);
  }
  return beforeSendResult;
}

/**
 * Process the matching `beforeSendXXX` callback.
 */
function processBeforeSend(
  options,
  event,
  hint,
) {
  const { beforeSend, beforeSendTransaction } = options;

  if (isErrorEvent(event) && beforeSend) {
    return beforeSend(event, hint);
  }

  if (isTransactionEvent(event) && beforeSendTransaction) {
    return beforeSendTransaction(event, hint);
  }

  return event;
}

function isErrorEvent(event) {
  return event.type === undefined;
}

function isTransactionEvent(event) {
  return event.type === 'transaction';
}

/**
 * Add an event processor to the current client.
 * This event processor will run for all events processed by this client.
 */
function addEventProcessor(callback) {
  const client = (0,_exports_js__WEBPACK_IMPORTED_MODULE_16__.getClient)();

  if (!client || !client.addEventProcessor) {
    return;
  }

  client.addEventProcessor(callback);
}


//# sourceMappingURL=baseclient.js.map


/***/ }),

/***/ "./node_modules/@sentry/core/esm/constants.js":
/*!****************************************************!*\
  !*** ./node_modules/@sentry/core/esm/constants.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DEFAULT_ENVIRONMENT": () => (/* binding */ DEFAULT_ENVIRONMENT)
/* harmony export */ });
const DEFAULT_ENVIRONMENT = 'production';


//# sourceMappingURL=constants.js.map


/***/ }),

/***/ "./node_modules/@sentry/core/esm/debug-build.js":
/*!******************************************************!*\
  !*** ./node_modules/@sentry/core/esm/debug-build.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DEBUG_BUILD": () => (/* binding */ DEBUG_BUILD)
/* harmony export */ });
/**
 * This serves as a build time flag that will be true by default, but false in non-debug builds or if users replace `__SENTRY_DEBUG__` in their generated code.
 *
 * ATTENTION: This constant must never cross package boundaries (i.e. be exported) to guarantee that it can be used for tree shaking.
 */
const DEBUG_BUILD = (typeof __SENTRY_DEBUG__ === 'undefined' || __SENTRY_DEBUG__);


//# sourceMappingURL=debug-build.js.map


/***/ }),

/***/ "./node_modules/@sentry/core/esm/envelope.js":
/*!***************************************************!*\
  !*** ./node_modules/@sentry/core/esm/envelope.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createEventEnvelope": () => (/* binding */ createEventEnvelope),
/* harmony export */   "createSessionEnvelope": () => (/* binding */ createSessionEnvelope)
/* harmony export */ });
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/envelope.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/dsn.js");


/**
 * Apply SdkInfo (name, version, packages, integrations) to the corresponding event key.
 * Merge with existing data if any.
 **/
function enhanceEventWithSdkInfo(event, sdkInfo) {
  if (!sdkInfo) {
    return event;
  }
  event.sdk = event.sdk || {};
  event.sdk.name = event.sdk.name || sdkInfo.name;
  event.sdk.version = event.sdk.version || sdkInfo.version;
  event.sdk.integrations = [...(event.sdk.integrations || []), ...(sdkInfo.integrations || [])];
  event.sdk.packages = [...(event.sdk.packages || []), ...(sdkInfo.packages || [])];
  return event;
}

/** Creates an envelope from a Session */
function createSessionEnvelope(
  session,
  dsn,
  metadata,
  tunnel,
) {
  const sdkInfo = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.getSdkMetadataForEnvelopeHeader)(metadata);
  const envelopeHeaders = {
    sent_at: new Date().toISOString(),
    ...(sdkInfo && { sdk: sdkInfo }),
    ...(!!tunnel && dsn && { dsn: (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_1__.dsnToString)(dsn) }),
  };

  const envelopeItem =
    'aggregates' in session ? [{ type: 'sessions' }, session] : [{ type: 'session' }, session.toJSON()];

  return (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.createEnvelope)(envelopeHeaders, [envelopeItem]);
}

/**
 * Create an Envelope from an event.
 */
function createEventEnvelope(
  event,
  dsn,
  metadata,
  tunnel,
) {
  const sdkInfo = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.getSdkMetadataForEnvelopeHeader)(metadata);

  /*
    Note: Due to TS, event.type may be `replay_event`, theoretically.
    In practice, we never call `createEventEnvelope` with `replay_event` type,
    and we'd have to adjut a looot of types to make this work properly.
    We want to avoid casting this around, as that could lead to bugs (e.g. when we add another type)
    So the safe choice is to really guard against the replay_event type here.
  */
  const eventType = event.type && event.type !== 'replay_event' ? event.type : 'event';

  enhanceEventWithSdkInfo(event, metadata && metadata.sdk);

  const envelopeHeaders = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.createEventEnvelopeHeaders)(event, sdkInfo, tunnel, dsn);

  // Prevent this data (which, if it exists, was used in earlier steps in the processing pipeline) from being sent to
  // sentry. (Note: Our use of this property comes and goes with whatever we might be debugging, whatever hacks we may
  // have temporarily added, etc. Even if we don't happen to be using it at some point in the future, let's not get rid
  // of this `delete`, lest we miss putting it back in the next time the property is in use.)
  delete event.sdkProcessingMetadata;

  const eventItem = [{ type: eventType }, event];
  return (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.createEnvelope)(envelopeHeaders, [eventItem]);
}


//# sourceMappingURL=envelope.js.map


/***/ }),

/***/ "./node_modules/@sentry/core/esm/eventProcessors.js":
/*!**********************************************************!*\
  !*** ./node_modules/@sentry/core/esm/eventProcessors.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "addGlobalEventProcessor": () => (/* binding */ addGlobalEventProcessor),
/* harmony export */   "getGlobalEventProcessors": () => (/* binding */ getGlobalEventProcessors),
/* harmony export */   "notifyEventProcessors": () => (/* binding */ notifyEventProcessors)
/* harmony export */ });
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/worldwide.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/syncpromise.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/logger.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/is.js");
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./debug-build.js */ "./node_modules/@sentry/core/esm/debug-build.js");



/**
 * Returns the global event processors.
 * @deprecated Global event processors will be removed in v8.
 */
function getGlobalEventProcessors() {
  return (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.getGlobalSingleton)('globalEventProcessors', () => []);
}

/**
 * Add a EventProcessor to be kept globally.
 * @deprecated Use `addEventProcessor` instead. Global event processors will be removed in v8.
 */
function addGlobalEventProcessor(callback) {
  // eslint-disable-next-line deprecation/deprecation
  getGlobalEventProcessors().push(callback);
}

/**
 * Process an array of event processors, returning the processed event (or `null` if the event was dropped).
 */
function notifyEventProcessors(
  processors,
  event,
  hint,
  index = 0,
) {
  return new _sentry_utils__WEBPACK_IMPORTED_MODULE_1__.SyncPromise((resolve, reject) => {
    const processor = processors[index];
    if (event === null || typeof processor !== 'function') {
      resolve(event);
    } else {
      const result = processor({ ...event }, hint) ;

      _debug_build_js__WEBPACK_IMPORTED_MODULE_2__.DEBUG_BUILD && processor.id && result === null && _sentry_utils__WEBPACK_IMPORTED_MODULE_3__.logger.log(`Event processor "${processor.id}" dropped event`);

      if ((0,_sentry_utils__WEBPACK_IMPORTED_MODULE_4__.isThenable)(result)) {
        void result
          .then(final => notifyEventProcessors(processors, final, hint, index + 1).then(resolve))
          .then(null, reject);
      } else {
        void notifyEventProcessors(processors, result, hint, index + 1)
          .then(resolve)
          .then(null, reject);
      }
    }
  });
}


//# sourceMappingURL=eventProcessors.js.map


/***/ }),

/***/ "./node_modules/@sentry/core/esm/exports.js":
/*!**************************************************!*\
  !*** ./node_modules/@sentry/core/esm/exports.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "addBreadcrumb": () => (/* binding */ addBreadcrumb),
/* harmony export */   "captureCheckIn": () => (/* binding */ captureCheckIn),
/* harmony export */   "captureEvent": () => (/* binding */ captureEvent),
/* harmony export */   "captureException": () => (/* binding */ captureException),
/* harmony export */   "captureMessage": () => (/* binding */ captureMessage),
/* harmony export */   "close": () => (/* binding */ close),
/* harmony export */   "configureScope": () => (/* binding */ configureScope),
/* harmony export */   "flush": () => (/* binding */ flush),
/* harmony export */   "getClient": () => (/* binding */ getClient),
/* harmony export */   "getCurrentScope": () => (/* binding */ getCurrentScope),
/* harmony export */   "lastEventId": () => (/* binding */ lastEventId),
/* harmony export */   "setContext": () => (/* binding */ setContext),
/* harmony export */   "setExtra": () => (/* binding */ setExtra),
/* harmony export */   "setExtras": () => (/* binding */ setExtras),
/* harmony export */   "setTag": () => (/* binding */ setTag),
/* harmony export */   "setTags": () => (/* binding */ setTags),
/* harmony export */   "setUser": () => (/* binding */ setUser),
/* harmony export */   "startTransaction": () => (/* binding */ startTransaction),
/* harmony export */   "withMonitor": () => (/* binding */ withMonitor),
/* harmony export */   "withScope": () => (/* binding */ withScope)
/* harmony export */ });
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/logger.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/misc.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/time.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/is.js");
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./debug-build.js */ "./node_modules/@sentry/core/esm/debug-build.js");
/* harmony import */ var _hub_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./hub.js */ "./node_modules/@sentry/core/esm/hub.js");
/* harmony import */ var _utils_prepareEvent_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils/prepareEvent.js */ "./node_modules/@sentry/core/esm/utils/prepareEvent.js");





// Note: All functions in this file are typed with a return value of `ReturnType<Hub[HUB_FUNCTION]>`,
// where HUB_FUNCTION is some method on the Hub class.
//
// This is done to make sure the top level SDK methods stay in sync with the hub methods.
// Although every method here has an explicit return type, some of them (that map to void returns) do not
// contain `return` keywords. This is done to save on bundle size, as `return` is not minifiable.

/**
 * Captures an exception event and sends it to Sentry.
 * This accepts an event hint as optional second parameter.
 * Alternatively, you can also pass a CaptureContext directly as second parameter.
 */
function captureException(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  exception,
  hint,
) {
  return (0,_hub_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentHub)().captureException(exception, (0,_utils_prepareEvent_js__WEBPACK_IMPORTED_MODULE_1__.parseEventHintOrCaptureContext)(hint));
}

/**
 * Captures a message event and sends it to Sentry.
 *
 * @param message The message to send to Sentry.
 * @param Severity Define the level of the message.
 * @returns The generated eventId.
 */
function captureMessage(
  message,
  // eslint-disable-next-line deprecation/deprecation
  captureContext,
) {
  // This is necessary to provide explicit scopes upgrade, without changing the original
  // arity of the `captureMessage(message, level)` method.
  const level = typeof captureContext === 'string' ? captureContext : undefined;
  const context = typeof captureContext !== 'string' ? { captureContext } : undefined;
  return (0,_hub_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentHub)().captureMessage(message, level, context);
}

/**
 * Captures a manually created event and sends it to Sentry.
 *
 * @param event The event to send to Sentry.
 * @returns The generated eventId.
 */
function captureEvent(event, hint) {
  return (0,_hub_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentHub)().captureEvent(event, hint);
}

/**
 * Callback to set context information onto the scope.
 * @param callback Callback function that receives Scope.
 *
 * @deprecated Use getCurrentScope() directly.
 */
function configureScope(callback) {
  // eslint-disable-next-line deprecation/deprecation
  (0,_hub_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentHub)().configureScope(callback);
}

/**
 * Records a new breadcrumb which will be attached to future events.
 *
 * Breadcrumbs will be added to subsequent events to provide more context on
 * user's actions prior to an error or crash.
 *
 * @param breadcrumb The breadcrumb to record.
 */
function addBreadcrumb(breadcrumb, hint) {
  (0,_hub_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentHub)().addBreadcrumb(breadcrumb, hint);
}

/**
 * Sets context data with the given name.
 * @param name of the context
 * @param context Any kind of data. This data will be normalized.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setContext(name, context) {
  (0,_hub_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentHub)().setContext(name, context);
}

/**
 * Set an object that will be merged sent as extra data with the event.
 * @param extras Extras object to merge into current context.
 */
function setExtras(extras) {
  (0,_hub_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentHub)().setExtras(extras);
}

/**
 * Set key:value that will be sent as extra data with the event.
 * @param key String of extra
 * @param extra Any kind of data. This data will be normalized.
 */
function setExtra(key, extra) {
  (0,_hub_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentHub)().setExtra(key, extra);
}

/**
 * Set an object that will be merged sent as tags data with the event.
 * @param tags Tags context object to merge into current context.
 */
function setTags(tags) {
  (0,_hub_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentHub)().setTags(tags);
}

/**
 * Set key:value that will be sent as tags data with the event.
 *
 * Can also be used to unset a tag, by passing `undefined`.
 *
 * @param key String key of tag
 * @param value Value of tag
 */
function setTag(key, value) {
  (0,_hub_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentHub)().setTag(key, value);
}

/**
 * Updates user context information for future events.
 *
 * @param user User context object to be set in the current context. Pass `null` to unset the user.
 */
function setUser(user) {
  (0,_hub_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentHub)().setUser(user);
}

/**
 * Creates a new scope with and executes the given operation within.
 * The scope is automatically removed once the operation
 * finishes or throws.
 *
 * This is essentially a convenience function for:
 *
 *     pushScope();
 *     callback();
 *     popScope();
 *
 * @param callback that will be enclosed into push/popScope.
 */
function withScope(callback) {
  return (0,_hub_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentHub)().withScope(callback);
}

/**
 * Starts a new `Transaction` and returns it. This is the entry point to manual tracing instrumentation.
 *
 * A tree structure can be built by adding child spans to the transaction, and child spans to other spans. To start a
 * new child span within the transaction or any span, call the respective `.startChild()` method.
 *
 * Every child span must be finished before the transaction is finished, otherwise the unfinished spans are discarded.
 *
 * The transaction must be finished with a call to its `.end()` method, at which point the transaction with all its
 * finished child spans will be sent to Sentry.
 *
 * NOTE: This function should only be used for *manual* instrumentation. Auto-instrumentation should call
 * `startTransaction` directly on the hub.
 *
 * @param context Properties of the new `Transaction`.
 * @param customSamplingContext Information given to the transaction sampling function (along with context-dependent
 * default values). See {@link Options.tracesSampler}.
 *
 * @returns The transaction which was just started
 */
function startTransaction(
  context,
  customSamplingContext,
) {
  return (0,_hub_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentHub)().startTransaction({ ...context }, customSamplingContext);
}

/**
 * Create a cron monitor check in and send it to Sentry.
 *
 * @param checkIn An object that describes a check in.
 * @param upsertMonitorConfig An optional object that describes a monitor config. Use this if you want
 * to create a monitor automatically when sending a check in.
 */
function captureCheckIn(checkIn, upsertMonitorConfig) {
  const scope = getCurrentScope();
  const client = getClient();
  if (!client) {
    _debug_build_js__WEBPACK_IMPORTED_MODULE_2__.DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_3__.logger.warn('Cannot capture check-in. No client defined.');
  } else if (!client.captureCheckIn) {
    _debug_build_js__WEBPACK_IMPORTED_MODULE_2__.DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_3__.logger.warn('Cannot capture check-in. Client does not support sending check-ins.');
  } else {
    return client.captureCheckIn(checkIn, upsertMonitorConfig, scope);
  }

  return (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_4__.uuid4)();
}

/**
 * Wraps a callback with a cron monitor check in. The check in will be sent to Sentry when the callback finishes.
 *
 * @param monitorSlug The distinct slug of the monitor.
 * @param upsertMonitorConfig An optional object that describes a monitor config. Use this if you want
 * to create a monitor automatically when sending a check in.
 */
function withMonitor(
  monitorSlug,
  callback,
  upsertMonitorConfig,
) {
  const checkInId = captureCheckIn({ monitorSlug, status: 'in_progress' }, upsertMonitorConfig);
  const now = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_5__.timestampInSeconds)();

  function finishCheckIn(status) {
    captureCheckIn({ monitorSlug, status, checkInId, duration: (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_5__.timestampInSeconds)() - now });
  }

  let maybePromiseResult;
  try {
    maybePromiseResult = callback();
  } catch (e) {
    finishCheckIn('error');
    throw e;
  }

  if ((0,_sentry_utils__WEBPACK_IMPORTED_MODULE_6__.isThenable)(maybePromiseResult)) {
    Promise.resolve(maybePromiseResult).then(
      () => {
        finishCheckIn('ok');
      },
      () => {
        finishCheckIn('error');
      },
    );
  } else {
    finishCheckIn('ok');
  }

  return maybePromiseResult;
}

/**
 * Call `flush()` on the current client, if there is one. See {@link Client.flush}.
 *
 * @param timeout Maximum time in ms the client should wait to flush its event queue. Omitting this parameter will cause
 * the client to wait until all events are sent before resolving the promise.
 * @returns A promise which resolves to `true` if the queue successfully drains before the timeout, or `false` if it
 * doesn't (or if there's no client defined).
 */
async function flush(timeout) {
  const client = getClient();
  if (client) {
    return client.flush(timeout);
  }
  _debug_build_js__WEBPACK_IMPORTED_MODULE_2__.DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_3__.logger.warn('Cannot flush events. No client defined.');
  return Promise.resolve(false);
}

/**
 * Call `close()` on the current client, if there is one. See {@link Client.close}.
 *
 * @param timeout Maximum time in ms the client should wait to flush its event queue before shutting down. Omitting this
 * parameter will cause the client to wait until all events are sent before disabling itself.
 * @returns A promise which resolves to `true` if the queue successfully drains before the timeout, or `false` if it
 * doesn't (or if there's no client defined).
 */
async function close(timeout) {
  const client = getClient();
  if (client) {
    return client.close(timeout);
  }
  _debug_build_js__WEBPACK_IMPORTED_MODULE_2__.DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_3__.logger.warn('Cannot flush events and disable SDK. No client defined.');
  return Promise.resolve(false);
}

/**
 * This is the getter for lastEventId.
 *
 * @returns The last event id of a captured event.
 */
function lastEventId() {
  return (0,_hub_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentHub)().lastEventId();
}

/**
 * Get the currently active client.
 */
function getClient() {
  return (0,_hub_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentHub)().getClient();
}

/**
 * Get the currently active scope.
 */
function getCurrentScope() {
  return (0,_hub_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentHub)().getScope();
}


//# sourceMappingURL=exports.js.map


/***/ }),

/***/ "./node_modules/@sentry/core/esm/hub.js":
/*!**********************************************!*\
  !*** ./node_modules/@sentry/core/esm/hub.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "API_VERSION": () => (/* binding */ API_VERSION),
/* harmony export */   "Hub": () => (/* binding */ Hub),
/* harmony export */   "ensureHubOnCarrier": () => (/* binding */ ensureHubOnCarrier),
/* harmony export */   "getCurrentHub": () => (/* binding */ getCurrentHub),
/* harmony export */   "getHubFromCarrier": () => (/* binding */ getHubFromCarrier),
/* harmony export */   "getIsolationScope": () => (/* binding */ getIsolationScope),
/* harmony export */   "getMainCarrier": () => (/* binding */ getMainCarrier),
/* harmony export */   "makeMain": () => (/* binding */ makeMain),
/* harmony export */   "runWithAsyncContext": () => (/* binding */ runWithAsyncContext),
/* harmony export */   "setAsyncContextStrategy": () => (/* binding */ setAsyncContextStrategy),
/* harmony export */   "setHubOnCarrier": () => (/* binding */ setHubOnCarrier)
/* harmony export */ });
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/misc.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/time.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/logger.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/worldwide.js");
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./constants.js */ "./node_modules/@sentry/core/esm/constants.js");
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./debug-build.js */ "./node_modules/@sentry/core/esm/debug-build.js");
/* harmony import */ var _scope_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./scope.js */ "./node_modules/@sentry/core/esm/scope.js");
/* harmony import */ var _session_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./session.js */ "./node_modules/@sentry/core/esm/session.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./version.js */ "./node_modules/@sentry/core/esm/version.js");







/**
 * API compatibility version of this hub.
 *
 * WARNING: This number should only be increased when the global interface
 * changes and new methods are introduced.
 *
 * @hidden
 */
const API_VERSION = parseFloat(_version_js__WEBPACK_IMPORTED_MODULE_0__.SDK_VERSION);

/**
 * Default maximum number of breadcrumbs added to an event. Can be overwritten
 * with {@link Options.maxBreadcrumbs}.
 */
const DEFAULT_BREADCRUMBS = 100;

/**
 * @inheritDoc
 */
class Hub  {
  /** Is a {@link Layer}[] containing the client and scope */

  /** Contains the last event id of a captured event.  */

  /**
   * Creates a new instance of the hub, will push one {@link Layer} into the
   * internal stack on creation.
   *
   * @param client bound to the hub.
   * @param scope bound to the hub.
   * @param version number, higher number means higher priority.
   */
   constructor(
    client,
    scope = new _scope_js__WEBPACK_IMPORTED_MODULE_1__.Scope(),
    isolationScope = new _scope_js__WEBPACK_IMPORTED_MODULE_1__.Scope(),
      _version = API_VERSION,
  ) {this._version = _version;
    this._stack = [{ scope }];
    if (client) {
      this.bindClient(client);
    }

    this._isolationScope = isolationScope;
  }

  /**
   * @inheritDoc
   */
   isOlderThan(version) {
    return this._version < version;
  }

  /**
   * @inheritDoc
   */
   bindClient(client) {
    const top = this.getStackTop();
    top.client = client;
    if (client && client.setupIntegrations) {
      client.setupIntegrations();
    }
  }

  /**
   * @inheritDoc
   *
   * @deprecated Use `withScope` instead.
   */
   pushScope() {
    // We want to clone the content of prev scope
    const scope = this.getScope().clone();
    this.getStack().push({
      client: this.getClient(),
      scope,
    });
    return scope;
  }

  /**
   * @inheritDoc
   *
   * @deprecated Use `withScope` instead.
   */
   popScope() {
    if (this.getStack().length <= 1) return false;
    return !!this.getStack().pop();
  }

  /**
   * @inheritDoc
   */
   withScope(callback) {
    // eslint-disable-next-line deprecation/deprecation
    const scope = this.pushScope();
    try {
      return callback(scope);
    } finally {
      // eslint-disable-next-line deprecation/deprecation
      this.popScope();
    }
  }

  /**
   * @inheritDoc
   */
   getClient() {
    return this.getStackTop().client ;
  }

  /** Returns the scope of the top stack. */
   getScope() {
    return this.getStackTop().scope;
  }

  /** @inheritdoc */
   getIsolationScope() {
    return this._isolationScope;
  }

  /** Returns the scope stack for domains or the process. */
   getStack() {
    return this._stack;
  }

  /** Returns the topmost scope layer in the order domain > local > process. */
   getStackTop() {
    return this._stack[this._stack.length - 1];
  }

  /**
   * @inheritDoc
   */
   captureException(exception, hint) {
    const eventId = (this._lastEventId = hint && hint.event_id ? hint.event_id : (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_2__.uuid4)());
    const syntheticException = new Error('Sentry syntheticException');
    this._withClient((client, scope) => {
      client.captureException(
        exception,
        {
          originalException: exception,
          syntheticException,
          ...hint,
          event_id: eventId,
        },
        scope,
      );
    });
    return eventId;
  }

  /**
   * @inheritDoc
   */
   captureMessage(
    message,
    // eslint-disable-next-line deprecation/deprecation
    level,
    hint,
  ) {
    const eventId = (this._lastEventId = hint && hint.event_id ? hint.event_id : (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_2__.uuid4)());
    const syntheticException = new Error(message);
    this._withClient((client, scope) => {
      client.captureMessage(
        message,
        level,
        {
          originalException: message,
          syntheticException,
          ...hint,
          event_id: eventId,
        },
        scope,
      );
    });
    return eventId;
  }

  /**
   * @inheritDoc
   */
   captureEvent(event, hint) {
    const eventId = hint && hint.event_id ? hint.event_id : (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_2__.uuid4)();
    if (!event.type) {
      this._lastEventId = eventId;
    }

    this._withClient((client, scope) => {
      client.captureEvent(event, { ...hint, event_id: eventId }, scope);
    });
    return eventId;
  }

  /**
   * @inheritDoc
   */
   lastEventId() {
    return this._lastEventId;
  }

  /**
   * @inheritDoc
   */
   addBreadcrumb(breadcrumb, hint) {
    const { scope, client } = this.getStackTop();

    if (!client) return;

    const { beforeBreadcrumb = null, maxBreadcrumbs = DEFAULT_BREADCRUMBS } =
      (client.getOptions && client.getOptions()) || {};

    if (maxBreadcrumbs <= 0) return;

    const timestamp = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_3__.dateTimestampInSeconds)();
    const mergedBreadcrumb = { timestamp, ...breadcrumb };
    const finalBreadcrumb = beforeBreadcrumb
      ? ((0,_sentry_utils__WEBPACK_IMPORTED_MODULE_4__.consoleSandbox)(() => beforeBreadcrumb(mergedBreadcrumb, hint)) )
      : mergedBreadcrumb;

    if (finalBreadcrumb === null) return;

    if (client.emit) {
      client.emit('beforeAddBreadcrumb', finalBreadcrumb, hint);
    }

    scope.addBreadcrumb(finalBreadcrumb, maxBreadcrumbs);
  }

  /**
   * @inheritDoc
   */
   setUser(user) {
    this.getScope().setUser(user);
  }

  /**
   * @inheritDoc
   */
   setTags(tags) {
    this.getScope().setTags(tags);
  }

  /**
   * @inheritDoc
   */
   setExtras(extras) {
    this.getScope().setExtras(extras);
  }

  /**
   * @inheritDoc
   */
   setTag(key, value) {
    this.getScope().setTag(key, value);
  }

  /**
   * @inheritDoc
   */
   setExtra(key, extra) {
    this.getScope().setExtra(key, extra);
  }

  /**
   * @inheritDoc
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
   setContext(name, context) {
    this.getScope().setContext(name, context);
  }

  /**
   * @inheritDoc
   *
   * @deprecated Use `getScope()` directly.
   */
   configureScope(callback) {
    const { scope, client } = this.getStackTop();
    if (client) {
      callback(scope);
    }
  }

  /**
   * @inheritDoc
   */
   run(callback) {
    const oldHub = makeMain(this);
    try {
      callback(this);
    } finally {
      makeMain(oldHub);
    }
  }

  /**
   * @inheritDoc
   */
   getIntegration(integration) {
    const client = this.getClient();
    if (!client) return null;
    try {
      return client.getIntegration(integration);
    } catch (_oO) {
      _debug_build_js__WEBPACK_IMPORTED_MODULE_5__.DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_4__.logger.warn(`Cannot retrieve integration ${integration.id} from the current Hub`);
      return null;
    }
  }

  /**
   * @inheritDoc
   */
   startTransaction(context, customSamplingContext) {
    const result = this._callExtensionMethod('startTransaction', context, customSamplingContext);

    if (_debug_build_js__WEBPACK_IMPORTED_MODULE_5__.DEBUG_BUILD && !result) {
      const client = this.getClient();
      if (!client) {
        _sentry_utils__WEBPACK_IMPORTED_MODULE_4__.logger.warn(
          "Tracing extension 'startTransaction' is missing. You should 'init' the SDK before calling 'startTransaction'",
        );
      } else {
        _sentry_utils__WEBPACK_IMPORTED_MODULE_4__.logger.warn(`Tracing extension 'startTransaction' has not been added. Call 'addTracingExtensions' before calling 'init':
Sentry.addTracingExtensions();
Sentry.init({...});
`);
      }
    }

    return result;
  }

  /**
   * @inheritDoc
   */
   traceHeaders() {
    return this._callExtensionMethod('traceHeaders');
  }

  /**
   * @inheritDoc
   */
   captureSession(endSession = false) {
    // both send the update and pull the session from the scope
    if (endSession) {
      return this.endSession();
    }

    // only send the update
    this._sendSessionUpdate();
  }

  /**
   * @inheritDoc
   */
   endSession() {
    const layer = this.getStackTop();
    const scope = layer.scope;
    const session = scope.getSession();
    if (session) {
      (0,_session_js__WEBPACK_IMPORTED_MODULE_6__.closeSession)(session);
    }
    this._sendSessionUpdate();

    // the session is over; take it off of the scope
    scope.setSession();
  }

  /**
   * @inheritDoc
   */
   startSession(context) {
    const { scope, client } = this.getStackTop();
    const { release, environment = _constants_js__WEBPACK_IMPORTED_MODULE_7__.DEFAULT_ENVIRONMENT } = (client && client.getOptions()) || {};

    // Will fetch userAgent if called from browser sdk
    const { userAgent } = _sentry_utils__WEBPACK_IMPORTED_MODULE_8__.GLOBAL_OBJ.navigator || {};

    const session = (0,_session_js__WEBPACK_IMPORTED_MODULE_6__.makeSession)({
      release,
      environment,
      user: scope.getUser(),
      ...(userAgent && { userAgent }),
      ...context,
    });

    // End existing session if there's one
    const currentSession = scope.getSession && scope.getSession();
    if (currentSession && currentSession.status === 'ok') {
      (0,_session_js__WEBPACK_IMPORTED_MODULE_6__.updateSession)(currentSession, { status: 'exited' });
    }
    this.endSession();

    // Afterwards we set the new session on the scope
    scope.setSession(session);

    return session;
  }

  /**
   * Returns if default PII should be sent to Sentry and propagated in ourgoing requests
   * when Tracing is used.
   */
   shouldSendDefaultPii() {
    const client = this.getClient();
    const options = client && client.getOptions();
    return Boolean(options && options.sendDefaultPii);
  }

  /**
   * Sends the current Session on the scope
   */
   _sendSessionUpdate() {
    const { scope, client } = this.getStackTop();

    const session = scope.getSession();
    if (session && client && client.captureSession) {
      client.captureSession(session);
    }
  }

  /**
   * Internal helper function to call a method on the top client if it exists.
   *
   * @param method The method to call on the client.
   * @param args Arguments to pass to the client function.
   */
   _withClient(callback) {
    const { scope, client } = this.getStackTop();
    if (client) {
      callback(client, scope);
    }
  }

  /**
   * Calls global extension method and binding current instance to the function call
   */
  // @ts-expect-error Function lacks ending return statement and return type does not include 'undefined'. ts(2366)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
   _callExtensionMethod(method, ...args) {
    const carrier = getMainCarrier();
    const sentry = carrier.__SENTRY__;
    if (sentry && sentry.extensions && typeof sentry.extensions[method] === 'function') {
      return sentry.extensions[method].apply(this, args);
    }
    _debug_build_js__WEBPACK_IMPORTED_MODULE_5__.DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_4__.logger.warn(`Extension method ${method} couldn't be found, doing nothing.`);
  }
}

/**
 * Returns the global shim registry.
 *
 * FIXME: This function is problematic, because despite always returning a valid Carrier,
 * it has an optional `__SENTRY__` property, which then in turn requires us to always perform an unnecessary check
 * at the call-site. We always access the carrier through this function, so we can guarantee that `__SENTRY__` is there.
 **/
function getMainCarrier() {
  _sentry_utils__WEBPACK_IMPORTED_MODULE_8__.GLOBAL_OBJ.__SENTRY__ = _sentry_utils__WEBPACK_IMPORTED_MODULE_8__.GLOBAL_OBJ.__SENTRY__ || {
    extensions: {},
    hub: undefined,
  };
  return _sentry_utils__WEBPACK_IMPORTED_MODULE_8__.GLOBAL_OBJ;
}

/**
 * Replaces the current main hub with the passed one on the global object
 *
 * @returns The old replaced hub
 */
function makeMain(hub) {
  const registry = getMainCarrier();
  const oldHub = getHubFromCarrier(registry);
  setHubOnCarrier(registry, hub);
  return oldHub;
}

/**
 * Returns the default hub instance.
 *
 * If a hub is already registered in the global carrier but this module
 * contains a more recent version, it replaces the registered version.
 * Otherwise, the currently registered hub will be returned.
 */
function getCurrentHub() {
  // Get main carrier (global for every environment)
  const registry = getMainCarrier();

  if (registry.__SENTRY__ && registry.__SENTRY__.acs) {
    const hub = registry.__SENTRY__.acs.getCurrentHub();

    if (hub) {
      return hub;
    }
  }

  // Return hub that lives on a global object
  return getGlobalHub(registry);
}

/**
 * Get the currently active isolation scope.
 * The isolation scope is active for the current exection context,
 * meaning that it will remain stable for the same Hub.
 */
function getIsolationScope() {
  return getCurrentHub().getIsolationScope();
}

function getGlobalHub(registry = getMainCarrier()) {
  // If there's no hub, or its an old API, assign a new one
  if (!hasHubOnCarrier(registry) || getHubFromCarrier(registry).isOlderThan(API_VERSION)) {
    setHubOnCarrier(registry, new Hub());
  }

  // Return hub that lives on a global object
  return getHubFromCarrier(registry);
}

/**
 * @private Private API with no semver guarantees!
 *
 * If the carrier does not contain a hub, a new hub is created with the global hub client and scope.
 */
function ensureHubOnCarrier(carrier, parent = getGlobalHub()) {
  // If there's no hub on current domain, or it's an old API, assign a new one
  if (!hasHubOnCarrier(carrier) || getHubFromCarrier(carrier).isOlderThan(API_VERSION)) {
    const client = parent.getClient();
    const scope = parent.getScope();
    const isolationScope = parent.getIsolationScope();
    setHubOnCarrier(carrier, new Hub(client, scope.clone(), isolationScope.clone()));
  }
}

/**
 * @private Private API with no semver guarantees!
 *
 * Sets the global async context strategy
 */
function setAsyncContextStrategy(strategy) {
  // Get main carrier (global for every environment)
  const registry = getMainCarrier();
  registry.__SENTRY__ = registry.__SENTRY__ || {};
  registry.__SENTRY__.acs = strategy;
}

/**
 * Runs the supplied callback in its own async context. Async Context strategies are defined per SDK.
 *
 * @param callback The callback to run in its own async context
 * @param options Options to pass to the async context strategy
 * @returns The result of the callback
 */
function runWithAsyncContext(callback, options = {}) {
  const registry = getMainCarrier();

  if (registry.__SENTRY__ && registry.__SENTRY__.acs) {
    return registry.__SENTRY__.acs.runWithAsyncContext(callback, options);
  }

  // if there was no strategy, fallback to just calling the callback
  return callback();
}

/**
 * This will tell whether a carrier has a hub on it or not
 * @param carrier object
 */
function hasHubOnCarrier(carrier) {
  return !!(carrier && carrier.__SENTRY__ && carrier.__SENTRY__.hub);
}

/**
 * This will create a new {@link Hub} and add to the passed object on
 * __SENTRY__.hub.
 * @param carrier object
 * @hidden
 */
function getHubFromCarrier(carrier) {
  return (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_8__.getGlobalSingleton)('hub', () => new Hub(), carrier);
}

/**
 * This will set passed {@link Hub} on the passed object's __SENTRY__.hub attribute
 * @param carrier object
 * @param hub Hub
 * @returns A boolean indicating success or failure
 */
function setHubOnCarrier(carrier, hub) {
  if (!carrier) return false;
  const __SENTRY__ = (carrier.__SENTRY__ = carrier.__SENTRY__ || {});
  __SENTRY__.hub = hub;
  return true;
}


//# sourceMappingURL=hub.js.map


/***/ }),

/***/ "./node_modules/@sentry/core/esm/integration.js":
/*!******************************************************!*\
  !*** ./node_modules/@sentry/core/esm/integration.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "addIntegration": () => (/* binding */ addIntegration),
/* harmony export */   "convertIntegrationFnToClass": () => (/* binding */ convertIntegrationFnToClass),
/* harmony export */   "getIntegrationsToSetup": () => (/* binding */ getIntegrationsToSetup),
/* harmony export */   "installedIntegrations": () => (/* binding */ installedIntegrations),
/* harmony export */   "setupIntegration": () => (/* binding */ setupIntegration),
/* harmony export */   "setupIntegrations": () => (/* binding */ setupIntegrations)
/* harmony export */ });
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/misc.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/logger.js");
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./debug-build.js */ "./node_modules/@sentry/core/esm/debug-build.js");
/* harmony import */ var _eventProcessors_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./eventProcessors.js */ "./node_modules/@sentry/core/esm/eventProcessors.js");
/* harmony import */ var _exports_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./exports.js */ "./node_modules/@sentry/core/esm/exports.js");
/* harmony import */ var _hub_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./hub.js */ "./node_modules/@sentry/core/esm/hub.js");






const installedIntegrations = [];

/** Map of integrations assigned to a client */

/**
 * Remove duplicates from the given array, preferring the last instance of any duplicate. Not guaranteed to
 * preseve the order of integrations in the array.
 *
 * @private
 */
function filterDuplicates(integrations) {
  const integrationsByName = {};

  integrations.forEach(currentInstance => {
    const { name } = currentInstance;

    const existingInstance = integrationsByName[name];

    // We want integrations later in the array to overwrite earlier ones of the same type, except that we never want a
    // default instance to overwrite an existing user instance
    if (existingInstance && !existingInstance.isDefaultInstance && currentInstance.isDefaultInstance) {
      return;
    }

    integrationsByName[name] = currentInstance;
  });

  return Object.keys(integrationsByName).map(k => integrationsByName[k]);
}

/** Gets integrations to install */
function getIntegrationsToSetup(options) {
  const defaultIntegrations = options.defaultIntegrations || [];
  const userIntegrations = options.integrations;

  // We flag default instances, so that later we can tell them apart from any user-created instances of the same class
  defaultIntegrations.forEach(integration => {
    integration.isDefaultInstance = true;
  });

  let integrations;

  if (Array.isArray(userIntegrations)) {
    integrations = [...defaultIntegrations, ...userIntegrations];
  } else if (typeof userIntegrations === 'function') {
    integrations = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.arrayify)(userIntegrations(defaultIntegrations));
  } else {
    integrations = defaultIntegrations;
  }

  const finalIntegrations = filterDuplicates(integrations);

  // The `Debug` integration prints copies of the `event` and `hint` which will be passed to `beforeSend` or
  // `beforeSendTransaction`. It therefore has to run after all other integrations, so that the changes of all event
  // processors will be reflected in the printed values. For lack of a more elegant way to guarantee that, we therefore
  // locate it and, assuming it exists, pop it out of its current spot and shove it onto the end of the array.
  const debugIndex = findIndex(finalIntegrations, integration => integration.name === 'Debug');
  if (debugIndex !== -1) {
    const [debugInstance] = finalIntegrations.splice(debugIndex, 1);
    finalIntegrations.push(debugInstance);
  }

  return finalIntegrations;
}

/**
 * Given a list of integration instances this installs them all. When `withDefaults` is set to `true` then all default
 * integrations are added unless they were already provided before.
 * @param integrations array of integration instances
 * @param withDefault should enable default integrations
 */
function setupIntegrations(client, integrations) {
  const integrationIndex = {};

  integrations.forEach(integration => {
    // guard against empty provided integrations
    if (integration) {
      setupIntegration(client, integration, integrationIndex);
    }
  });

  return integrationIndex;
}

/** Setup a single integration.  */
function setupIntegration(client, integration, integrationIndex) {
  integrationIndex[integration.name] = integration;

  // `setupOnce` is only called the first time
  if (installedIntegrations.indexOf(integration.name) === -1) {
    // eslint-disable-next-line deprecation/deprecation
    integration.setupOnce(_eventProcessors_js__WEBPACK_IMPORTED_MODULE_1__.addGlobalEventProcessor, _hub_js__WEBPACK_IMPORTED_MODULE_2__.getCurrentHub);
    installedIntegrations.push(integration.name);
  }

  // `setup` is run for each client
  if (integration.setup && typeof integration.setup === 'function') {
    integration.setup(client);
  }

  if (client.on && typeof integration.preprocessEvent === 'function') {
    const callback = integration.preprocessEvent.bind(integration) ;
    client.on('preprocessEvent', (event, hint) => callback(event, hint, client));
  }

  if (client.addEventProcessor && typeof integration.processEvent === 'function') {
    const callback = integration.processEvent.bind(integration) ;

    const processor = Object.assign((event, hint) => callback(event, hint, client), {
      id: integration.name,
    });

    client.addEventProcessor(processor);
  }

  _debug_build_js__WEBPACK_IMPORTED_MODULE_3__.DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_4__.logger.log(`Integration installed: ${integration.name}`);
}

/** Add an integration to the current hub's client. */
function addIntegration(integration) {
  const client = (0,_exports_js__WEBPACK_IMPORTED_MODULE_5__.getClient)();

  if (!client || !client.addIntegration) {
    _debug_build_js__WEBPACK_IMPORTED_MODULE_3__.DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_4__.logger.warn(`Cannot add integration "${integration.name}" because no SDK Client is available.`);
    return;
  }

  client.addIntegration(integration);
}

// Polyfill for Array.findIndex(), which is not supported in ES5
function findIndex(arr, callback) {
  for (let i = 0; i < arr.length; i++) {
    if (callback(arr[i]) === true) {
      return i;
    }
  }

  return -1;
}

/**
 * Convert a new integration function to the legacy class syntax.
 * In v8, we can remove this and instead export the integration functions directly.
 *
 * @deprecated This will be removed in v8!
 */
function convertIntegrationFnToClass(
  name,
  fn,
)

 {
  return Object.assign(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function ConvertedIntegration(...rest) {
      return {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        setupOnce: () => {},
        ...fn(...rest),
      };
    },
    { id: name },
  )

;
}


//# sourceMappingURL=integration.js.map


/***/ }),

/***/ "./node_modules/@sentry/core/esm/integrations/functiontostring.js":
/*!************************************************************************!*\
  !*** ./node_modules/@sentry/core/esm/integrations/functiontostring.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "FunctionToString": () => (/* binding */ FunctionToString)
/* harmony export */ });
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/object.js");
/* harmony import */ var _integration_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../integration.js */ "./node_modules/@sentry/core/esm/integration.js");



let originalFunctionToString;

const INTEGRATION_NAME = 'FunctionToString';

const functionToStringIntegration = () => {
  return {
    name: INTEGRATION_NAME,
    setupOnce() {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      originalFunctionToString = Function.prototype.toString;

      // intrinsics (like Function.prototype) might be immutable in some environments
      // e.g. Node with --frozen-intrinsics, XS (an embedded JavaScript engine) or SES (a JavaScript proposal)
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Function.prototype.toString = function ( ...args) {
          const context = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.getOriginalFunction)(this) || this;
          return originalFunctionToString.apply(context, args);
        };
      } catch (e) {
        // ignore errors here, just don't patch this
      }
    },
  };
};

/** Patch toString calls to return proper name for wrapped functions */
// eslint-disable-next-line deprecation/deprecation
const FunctionToString = (0,_integration_js__WEBPACK_IMPORTED_MODULE_1__.convertIntegrationFnToClass)(INTEGRATION_NAME, functionToStringIntegration);


//# sourceMappingURL=functiontostring.js.map


/***/ }),

/***/ "./node_modules/@sentry/core/esm/integrations/inboundfilters.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@sentry/core/esm/integrations/inboundfilters.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "InboundFilters": () => (/* binding */ InboundFilters)
/* harmony export */ });
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/logger.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/misc.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/string.js");
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../debug-build.js */ "./node_modules/@sentry/core/esm/debug-build.js");
/* harmony import */ var _integration_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../integration.js */ "./node_modules/@sentry/core/esm/integration.js");




// "Script error." is hard coded into browsers for errors that it can't read.
// this is the result of a script being pulled in from an external domain and CORS.
const DEFAULT_IGNORE_ERRORS = [/^Script error\.?$/, /^Javascript error: Script error\.? on line 0$/];

const DEFAULT_IGNORE_TRANSACTIONS = [
  /^.*\/healthcheck$/,
  /^.*\/healthy$/,
  /^.*\/live$/,
  /^.*\/ready$/,
  /^.*\/heartbeat$/,
  /^.*\/health$/,
  /^.*\/healthz$/,
];

/** Options for the InboundFilters integration */

const INTEGRATION_NAME = 'InboundFilters';
const inboundFiltersIntegration = (options) => {
  return {
    name: INTEGRATION_NAME,
    processEvent(event, _hint, client) {
      const clientOptions = client.getOptions();
      const mergedOptions = _mergeOptions(options, clientOptions);
      return _shouldDropEvent(event, mergedOptions) ? null : event;
    },
  };
};

/** Inbound filters configurable by the user */
// eslint-disable-next-line deprecation/deprecation
const InboundFilters = (0,_integration_js__WEBPACK_IMPORTED_MODULE_0__.convertIntegrationFnToClass)(INTEGRATION_NAME, inboundFiltersIntegration);

function _mergeOptions(
  internalOptions = {},
  clientOptions = {},
) {
  return {
    allowUrls: [...(internalOptions.allowUrls || []), ...(clientOptions.allowUrls || [])],
    denyUrls: [...(internalOptions.denyUrls || []), ...(clientOptions.denyUrls || [])],
    ignoreErrors: [
      ...(internalOptions.ignoreErrors || []),
      ...(clientOptions.ignoreErrors || []),
      ...(internalOptions.disableErrorDefaults ? [] : DEFAULT_IGNORE_ERRORS),
    ],
    ignoreTransactions: [
      ...(internalOptions.ignoreTransactions || []),
      ...(clientOptions.ignoreTransactions || []),
      ...(internalOptions.disableTransactionDefaults ? [] : DEFAULT_IGNORE_TRANSACTIONS),
    ],
    ignoreInternal: internalOptions.ignoreInternal !== undefined ? internalOptions.ignoreInternal : true,
  };
}

function _shouldDropEvent(event, options) {
  if (options.ignoreInternal && _isSentryError(event)) {
    _debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD &&
      _sentry_utils__WEBPACK_IMPORTED_MODULE_2__.logger.warn(`Event dropped due to being internal Sentry Error.\nEvent: ${(0,_sentry_utils__WEBPACK_IMPORTED_MODULE_3__.getEventDescription)(event)}`);
    return true;
  }
  if (_isIgnoredError(event, options.ignoreErrors)) {
    _debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD &&
      _sentry_utils__WEBPACK_IMPORTED_MODULE_2__.logger.warn(
        `Event dropped due to being matched by \`ignoreErrors\` option.\nEvent: ${(0,_sentry_utils__WEBPACK_IMPORTED_MODULE_3__.getEventDescription)(event)}`,
      );
    return true;
  }
  if (_isIgnoredTransaction(event, options.ignoreTransactions)) {
    _debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD &&
      _sentry_utils__WEBPACK_IMPORTED_MODULE_2__.logger.warn(
        `Event dropped due to being matched by \`ignoreTransactions\` option.\nEvent: ${(0,_sentry_utils__WEBPACK_IMPORTED_MODULE_3__.getEventDescription)(event)}`,
      );
    return true;
  }
  if (_isDeniedUrl(event, options.denyUrls)) {
    _debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD &&
      _sentry_utils__WEBPACK_IMPORTED_MODULE_2__.logger.warn(
        `Event dropped due to being matched by \`denyUrls\` option.\nEvent: ${(0,_sentry_utils__WEBPACK_IMPORTED_MODULE_3__.getEventDescription)(
          event,
        )}.\nUrl: ${_getEventFilterUrl(event)}`,
      );
    return true;
  }
  if (!_isAllowedUrl(event, options.allowUrls)) {
    _debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD &&
      _sentry_utils__WEBPACK_IMPORTED_MODULE_2__.logger.warn(
        `Event dropped due to not being matched by \`allowUrls\` option.\nEvent: ${(0,_sentry_utils__WEBPACK_IMPORTED_MODULE_3__.getEventDescription)(
          event,
        )}.\nUrl: ${_getEventFilterUrl(event)}`,
      );
    return true;
  }
  return false;
}

function _isIgnoredError(event, ignoreErrors) {
  // If event.type, this is not an error
  if (event.type || !ignoreErrors || !ignoreErrors.length) {
    return false;
  }

  return _getPossibleEventMessages(event).some(message => (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_4__.stringMatchesSomePattern)(message, ignoreErrors));
}

function _isIgnoredTransaction(event, ignoreTransactions) {
  if (event.type !== 'transaction' || !ignoreTransactions || !ignoreTransactions.length) {
    return false;
  }

  const name = event.transaction;
  return name ? (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_4__.stringMatchesSomePattern)(name, ignoreTransactions) : false;
}

function _isDeniedUrl(event, denyUrls) {
  // TODO: Use Glob instead?
  if (!denyUrls || !denyUrls.length) {
    return false;
  }
  const url = _getEventFilterUrl(event);
  return !url ? false : (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_4__.stringMatchesSomePattern)(url, denyUrls);
}

function _isAllowedUrl(event, allowUrls) {
  // TODO: Use Glob instead?
  if (!allowUrls || !allowUrls.length) {
    return true;
  }
  const url = _getEventFilterUrl(event);
  return !url ? true : (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_4__.stringMatchesSomePattern)(url, allowUrls);
}

function _getPossibleEventMessages(event) {
  const possibleMessages = [];

  if (event.message) {
    possibleMessages.push(event.message);
  }

  let lastException;
  try {
    // @ts-expect-error Try catching to save bundle size
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    lastException = event.exception.values[event.exception.values.length - 1];
  } catch (e) {
    // try catching to save bundle size checking existence of variables
  }

  if (lastException) {
    if (lastException.value) {
      possibleMessages.push(lastException.value);
      if (lastException.type) {
        possibleMessages.push(`${lastException.type}: ${lastException.value}`);
      }
    }
  }

  if (_debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD && possibleMessages.length === 0) {
    _sentry_utils__WEBPACK_IMPORTED_MODULE_2__.logger.error(`Could not extract message for event ${(0,_sentry_utils__WEBPACK_IMPORTED_MODULE_3__.getEventDescription)(event)}`);
  }

  return possibleMessages;
}

function _isSentryError(event) {
  try {
    // @ts-expect-error can't be a sentry error if undefined
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return event.exception.values[0].type === 'SentryError';
  } catch (e) {
    // ignore
  }
  return false;
}

function _getLastValidUrl(frames = []) {
  for (let i = frames.length - 1; i >= 0; i--) {
    const frame = frames[i];

    if (frame && frame.filename !== '<anonymous>' && frame.filename !== '[native code]') {
      return frame.filename || null;
    }
  }

  return null;
}

function _getEventFilterUrl(event) {
  try {
    let frames;
    try {
      // @ts-expect-error we only care about frames if the whole thing here is defined
      frames = event.exception.values[0].stacktrace.frames;
    } catch (e) {
      // ignore
    }
    return frames ? _getLastValidUrl(frames) : null;
  } catch (oO) {
    _debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_2__.logger.error(`Cannot extract url for event ${(0,_sentry_utils__WEBPACK_IMPORTED_MODULE_3__.getEventDescription)(event)}`);
    return null;
  }
}


//# sourceMappingURL=inboundfilters.js.map


/***/ }),

/***/ "./node_modules/@sentry/core/esm/metrics/constants.js":
/*!************************************************************!*\
  !*** ./node_modules/@sentry/core/esm/metrics/constants.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "COUNTER_METRIC_TYPE": () => (/* binding */ COUNTER_METRIC_TYPE),
/* harmony export */   "DEFAULT_BROWSER_FLUSH_INTERVAL": () => (/* binding */ DEFAULT_BROWSER_FLUSH_INTERVAL),
/* harmony export */   "DEFAULT_FLUSH_INTERVAL": () => (/* binding */ DEFAULT_FLUSH_INTERVAL),
/* harmony export */   "DISTRIBUTION_METRIC_TYPE": () => (/* binding */ DISTRIBUTION_METRIC_TYPE),
/* harmony export */   "GAUGE_METRIC_TYPE": () => (/* binding */ GAUGE_METRIC_TYPE),
/* harmony export */   "MAX_WEIGHT": () => (/* binding */ MAX_WEIGHT),
/* harmony export */   "NAME_AND_TAG_KEY_NORMALIZATION_REGEX": () => (/* binding */ NAME_AND_TAG_KEY_NORMALIZATION_REGEX),
/* harmony export */   "SET_METRIC_TYPE": () => (/* binding */ SET_METRIC_TYPE),
/* harmony export */   "TAG_VALUE_NORMALIZATION_REGEX": () => (/* binding */ TAG_VALUE_NORMALIZATION_REGEX)
/* harmony export */ });
const COUNTER_METRIC_TYPE = 'c' ;
const GAUGE_METRIC_TYPE = 'g' ;
const SET_METRIC_TYPE = 's' ;
const DISTRIBUTION_METRIC_TYPE = 'd' ;

/**
 * Normalization regex for metric names and metric tag names.
 *
 * This enforces that names and tag keys only contain alphanumeric characters,
 * underscores, forward slashes, periods, and dashes.
 *
 * See: https://develop.sentry.dev/sdk/metrics/#normalization
 */
const NAME_AND_TAG_KEY_NORMALIZATION_REGEX = /[^a-zA-Z0-9_/.-]+/g;

/**
 * Normalization regex for metric tag values.
 *
 * This enforces that values only contain words, digits, or the following
 * special characters: _:/@.{}[\]$-
 *
 * See: https://develop.sentry.dev/sdk/metrics/#normalization
 */
const TAG_VALUE_NORMALIZATION_REGEX = /[^\w\d_:/@.{}[\]$-]+/g;

/**
 * This does not match spec in https://develop.sentry.dev/sdk/metrics
 * but was chosen to optimize for the most common case in browser environments.
 */
const DEFAULT_BROWSER_FLUSH_INTERVAL = 5000;

/**
 * SDKs are required to bucket into 10 second intervals (rollup in seconds)
 * which is the current lower bound of metric accuracy.
 */
const DEFAULT_FLUSH_INTERVAL = 10000;

/**
 * The maximum number of metrics that should be stored in memory.
 */
const MAX_WEIGHT = 10000;


//# sourceMappingURL=constants.js.map


/***/ }),

/***/ "./node_modules/@sentry/core/esm/metrics/envelope.js":
/*!***********************************************************!*\
  !*** ./node_modules/@sentry/core/esm/metrics/envelope.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createMetricEnvelope": () => (/* binding */ createMetricEnvelope)
/* harmony export */ });
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/dsn.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/envelope.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils.js */ "./node_modules/@sentry/core/esm/metrics/utils.js");



/**
 * Create envelope from a metric aggregate.
 */
function createMetricEnvelope(
  metricBucketItems,
  dsn,
  metadata,
  tunnel,
) {
  const headers = {
    sent_at: new Date().toISOString(),
  };

  if (metadata && metadata.sdk) {
    headers.sdk = {
      name: metadata.sdk.name,
      version: metadata.sdk.version,
    };
  }

  if (!!tunnel && dsn) {
    headers.dsn = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.dsnToString)(dsn);
  }

  const item = createMetricEnvelopeItem(metricBucketItems);
  return (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_1__.createEnvelope)(headers, [item]);
}

function createMetricEnvelopeItem(metricBucketItems) {
  const payload = (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.serializeMetricBuckets)(metricBucketItems);
  const metricHeaders = {
    type: 'statsd',
    length: payload.length,
  };
  return [metricHeaders, payload];
}


//# sourceMappingURL=envelope.js.map


/***/ }),

/***/ "./node_modules/@sentry/core/esm/metrics/utils.js":
/*!********************************************************!*\
  !*** ./node_modules/@sentry/core/esm/metrics/utils.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getBucketKey": () => (/* binding */ getBucketKey),
/* harmony export */   "sanitizeTags": () => (/* binding */ sanitizeTags),
/* harmony export */   "serializeMetricBuckets": () => (/* binding */ serializeMetricBuckets),
/* harmony export */   "simpleHash": () => (/* binding */ simpleHash)
/* harmony export */ });
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/object.js");
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./constants.js */ "./node_modules/@sentry/core/esm/metrics/constants.js");



/**
 * Generate bucket key from metric properties.
 */
function getBucketKey(
  metricType,
  name,
  unit,
  tags,
) {
  const stringifiedTags = Object.entries((0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.dropUndefinedKeys)(tags)).sort((a, b) => a[0].localeCompare(b[0]));
  return `${metricType}${name}${unit}${stringifiedTags}`;
}

/* eslint-disable no-bitwise */
/**
 * Simple hash function for strings.
 */
function simpleHash(s) {
  let rv = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    rv = (rv << 5) - rv + c;
    rv &= rv;
  }
  return rv >>> 0;
}
/* eslint-enable no-bitwise */

/**
 * Serialize metrics buckets into a string based on statsd format.
 *
 * Example of format:
 * metric.name@second:1:1.2|d|#a:value,b:anothervalue|T12345677
 * Segments:
 * name: metric.name
 * unit: second
 * value: [1, 1.2]
 * type of metric: d (distribution)
 * tags: { a: value, b: anothervalue }
 * timestamp: 12345677
 */
function serializeMetricBuckets(metricBucketItems) {
  let out = '';
  for (const item of metricBucketItems) {
    const tagEntries = Object.entries(item.tags);
    const maybeTags = tagEntries.length > 0 ? `|#${tagEntries.map(([key, value]) => `${key}:${value}`).join(',')}` : '';
    out += `${item.name}@${item.unit}:${item.metric}|${item.metricType}${maybeTags}|T${item.timestamp}\n`;
  }
  return out;
}

/**
 * Sanitizes tags.
 */
function sanitizeTags(unsanitizedTags) {
  const tags = {};
  for (const key in unsanitizedTags) {
    if (Object.prototype.hasOwnProperty.call(unsanitizedTags, key)) {
      const sanitizedKey = key.replace(_constants_js__WEBPACK_IMPORTED_MODULE_1__.NAME_AND_TAG_KEY_NORMALIZATION_REGEX, '_');
      tags[sanitizedKey] = String(unsanitizedTags[key]).replace(_constants_js__WEBPACK_IMPORTED_MODULE_1__.TAG_VALUE_NORMALIZATION_REGEX, '_');
    }
  }
  return tags;
}


//# sourceMappingURL=utils.js.map


/***/ }),

/***/ "./node_modules/@sentry/core/esm/scope.js":
/*!************************************************!*\
  !*** ./node_modules/@sentry/core/esm/scope.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Scope": () => (/* binding */ Scope),
/* harmony export */   "getGlobalScope": () => (/* binding */ getGlobalScope),
/* harmony export */   "setGlobalScope": () => (/* binding */ setGlobalScope)
/* harmony export */ });
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/is.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/time.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/misc.js");
/* harmony import */ var _eventProcessors_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./eventProcessors.js */ "./node_modules/@sentry/core/esm/eventProcessors.js");
/* harmony import */ var _session_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./session.js */ "./node_modules/@sentry/core/esm/session.js");
/* harmony import */ var _utils_applyScopeDataToEvent_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utils/applyScopeDataToEvent.js */ "./node_modules/@sentry/core/esm/utils/applyScopeDataToEvent.js");





/**
 * Default value for maximum number of breadcrumbs added to an event.
 */
const DEFAULT_MAX_BREADCRUMBS = 100;

/**
 * The global scope is kept in this module.
 * When accessing this via `getGlobalScope()` we'll make sure to set one if none is currently present.
 */
let globalScope;

/**
 * Holds additional event information. {@link Scope.applyToEvent} will be
 * called by the client before an event will be sent.
 */
class Scope  {
  /** Flag if notifying is happening. */

  /** Callback for client to receive scope changes. */

  /** Callback list that will be called after {@link applyToEvent}. */

  /** Array of breadcrumbs. */

  /** User */

  /** Tags */

  /** Extra */

  /** Contexts */

  /** Attachments */

  /** Propagation Context for distributed tracing */

  /**
   * A place to stash data which is needed at some point in the SDK's event processing pipeline but which shouldn't get
   * sent to Sentry
   */

  /** Fingerprint */

  /** Severity */
  // eslint-disable-next-line deprecation/deprecation

  /** Transaction Name */

  /** Span */

  /** Session */

  /** Request Mode Session Status */

  // NOTE: Any field which gets added here should get added not only to the constructor but also to the `clone` method.

   constructor() {
    this._notifyingListeners = false;
    this._scopeListeners = [];
    this._eventProcessors = [];
    this._breadcrumbs = [];
    this._attachments = [];
    this._user = {};
    this._tags = {};
    this._extra = {};
    this._contexts = {};
    this._sdkProcessingMetadata = {};
    this._propagationContext = generatePropagationContext();
  }

  /**
   * Inherit values from the parent scope.
   * @deprecated Use `scope.clone()` and `new Scope()` instead.
   */
   static clone(scope) {
    return scope ? scope.clone() : new Scope();
  }

  /**
   * Clone this scope instance.
   */
   clone() {
    const newScope = new Scope();
    newScope._breadcrumbs = [...this._breadcrumbs];
    newScope._tags = { ...this._tags };
    newScope._extra = { ...this._extra };
    newScope._contexts = { ...this._contexts };
    newScope._user = this._user;
    newScope._level = this._level;
    newScope._span = this._span;
    newScope._session = this._session;
    newScope._transactionName = this._transactionName;
    newScope._fingerprint = this._fingerprint;
    newScope._eventProcessors = [...this._eventProcessors];
    newScope._requestSession = this._requestSession;
    newScope._attachments = [...this._attachments];
    newScope._sdkProcessingMetadata = { ...this._sdkProcessingMetadata };
    newScope._propagationContext = { ...this._propagationContext };

    return newScope;
  }

  /**
   * Add internal on change listener. Used for sub SDKs that need to store the scope.
   * @hidden
   */
   addScopeListener(callback) {
    this._scopeListeners.push(callback);
  }

  /**
   * @inheritDoc
   */
   addEventProcessor(callback) {
    this._eventProcessors.push(callback);
    return this;
  }

  /**
   * @inheritDoc
   */
   setUser(user) {
    this._user = user || {};
    if (this._session) {
      (0,_session_js__WEBPACK_IMPORTED_MODULE_0__.updateSession)(this._session, { user });
    }
    this._notifyScopeListeners();
    return this;
  }

  /**
   * @inheritDoc
   */
   getUser() {
    return this._user;
  }

  /**
   * @inheritDoc
   */
   getRequestSession() {
    return this._requestSession;
  }

  /**
   * @inheritDoc
   */
   setRequestSession(requestSession) {
    this._requestSession = requestSession;
    return this;
  }

  /**
   * @inheritDoc
   */
   setTags(tags) {
    this._tags = {
      ...this._tags,
      ...tags,
    };
    this._notifyScopeListeners();
    return this;
  }

  /**
   * @inheritDoc
   */
   setTag(key, value) {
    this._tags = { ...this._tags, [key]: value };
    this._notifyScopeListeners();
    return this;
  }

  /**
   * @inheritDoc
   */
   setExtras(extras) {
    this._extra = {
      ...this._extra,
      ...extras,
    };
    this._notifyScopeListeners();
    return this;
  }

  /**
   * @inheritDoc
   */
   setExtra(key, extra) {
    this._extra = { ...this._extra, [key]: extra };
    this._notifyScopeListeners();
    return this;
  }

  /**
   * @inheritDoc
   */
   setFingerprint(fingerprint) {
    this._fingerprint = fingerprint;
    this._notifyScopeListeners();
    return this;
  }

  /**
   * @inheritDoc
   */
   setLevel(
    // eslint-disable-next-line deprecation/deprecation
    level,
  ) {
    this._level = level;
    this._notifyScopeListeners();
    return this;
  }

  /**
   * @inheritDoc
   */
   setTransactionName(name) {
    this._transactionName = name;
    this._notifyScopeListeners();
    return this;
  }

  /**
   * @inheritDoc
   */
   setContext(key, context) {
    if (context === null) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete this._contexts[key];
    } else {
      this._contexts[key] = context;
    }

    this._notifyScopeListeners();
    return this;
  }

  /**
   * @inheritDoc
   */
   setSpan(span) {
    this._span = span;
    this._notifyScopeListeners();
    return this;
  }

  /**
   * @inheritDoc
   */
   getSpan() {
    return this._span;
  }

  /**
   * @inheritDoc
   */
   getTransaction() {
    // Often, this span (if it exists at all) will be a transaction, but it's not guaranteed to be. Regardless, it will
    // have a pointer to the currently-active transaction.
    const span = this.getSpan();
    return span && span.transaction;
  }

  /**
   * @inheritDoc
   */
   setSession(session) {
    if (!session) {
      delete this._session;
    } else {
      this._session = session;
    }
    this._notifyScopeListeners();
    return this;
  }

  /**
   * @inheritDoc
   */
   getSession() {
    return this._session;
  }

  /**
   * @inheritDoc
   */
   update(captureContext) {
    if (!captureContext) {
      return this;
    }

    if (typeof captureContext === 'function') {
      const updatedScope = (captureContext )(this);
      return updatedScope instanceof Scope ? updatedScope : this;
    }

    if (captureContext instanceof Scope) {
      this._tags = { ...this._tags, ...captureContext._tags };
      this._extra = { ...this._extra, ...captureContext._extra };
      this._contexts = { ...this._contexts, ...captureContext._contexts };
      if (captureContext._user && Object.keys(captureContext._user).length) {
        this._user = captureContext._user;
      }
      if (captureContext._level) {
        this._level = captureContext._level;
      }
      if (captureContext._fingerprint) {
        this._fingerprint = captureContext._fingerprint;
      }
      if (captureContext._requestSession) {
        this._requestSession = captureContext._requestSession;
      }
      if (captureContext._propagationContext) {
        this._propagationContext = captureContext._propagationContext;
      }
    } else if ((0,_sentry_utils__WEBPACK_IMPORTED_MODULE_1__.isPlainObject)(captureContext)) {
      // eslint-disable-next-line no-param-reassign
      captureContext = captureContext ;
      this._tags = { ...this._tags, ...captureContext.tags };
      this._extra = { ...this._extra, ...captureContext.extra };
      this._contexts = { ...this._contexts, ...captureContext.contexts };
      if (captureContext.user) {
        this._user = captureContext.user;
      }
      if (captureContext.level) {
        this._level = captureContext.level;
      }
      if (captureContext.fingerprint) {
        this._fingerprint = captureContext.fingerprint;
      }
      if (captureContext.requestSession) {
        this._requestSession = captureContext.requestSession;
      }
      if (captureContext.propagationContext) {
        this._propagationContext = captureContext.propagationContext;
      }
    }

    return this;
  }

  /**
   * @inheritDoc
   */
   clear() {
    this._breadcrumbs = [];
    this._tags = {};
    this._extra = {};
    this._user = {};
    this._contexts = {};
    this._level = undefined;
    this._transactionName = undefined;
    this._fingerprint = undefined;
    this._requestSession = undefined;
    this._span = undefined;
    this._session = undefined;
    this._notifyScopeListeners();
    this._attachments = [];
    this._propagationContext = generatePropagationContext();
    return this;
  }

  /**
   * @inheritDoc
   */
   addBreadcrumb(breadcrumb, maxBreadcrumbs) {
    const maxCrumbs = typeof maxBreadcrumbs === 'number' ? maxBreadcrumbs : DEFAULT_MAX_BREADCRUMBS;

    // No data has been changed, so don't notify scope listeners
    if (maxCrumbs <= 0) {
      return this;
    }

    const mergedBreadcrumb = {
      timestamp: (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_2__.dateTimestampInSeconds)(),
      ...breadcrumb,
    };

    const breadcrumbs = this._breadcrumbs;
    breadcrumbs.push(mergedBreadcrumb);
    this._breadcrumbs = breadcrumbs.length > maxCrumbs ? breadcrumbs.slice(-maxCrumbs) : breadcrumbs;

    this._notifyScopeListeners();

    return this;
  }

  /**
   * @inheritDoc
   */
   getLastBreadcrumb() {
    return this._breadcrumbs[this._breadcrumbs.length - 1];
  }

  /**
   * @inheritDoc
   */
   clearBreadcrumbs() {
    this._breadcrumbs = [];
    this._notifyScopeListeners();
    return this;
  }

  /**
   * @inheritDoc
   */
   addAttachment(attachment) {
    this._attachments.push(attachment);
    return this;
  }

  /**
   * @inheritDoc
   * @deprecated Use `getScopeData()` instead.
   */
   getAttachments() {
    const data = this.getScopeData();

    return data.attachments;
  }

  /**
   * @inheritDoc
   */
   clearAttachments() {
    this._attachments = [];
    return this;
  }

  /** @inheritDoc */
   getScopeData() {
    const {
      _breadcrumbs,
      _attachments,
      _contexts,
      _tags,
      _extra,
      _user,
      _level,
      _fingerprint,
      _eventProcessors,
      _propagationContext,
      _sdkProcessingMetadata,
      _transactionName,
      _span,
    } = this;

    return {
      breadcrumbs: _breadcrumbs,
      attachments: _attachments,
      contexts: _contexts,
      tags: _tags,
      extra: _extra,
      user: _user,
      level: _level,
      fingerprint: _fingerprint || [],
      eventProcessors: _eventProcessors,
      propagationContext: _propagationContext,
      sdkProcessingMetadata: _sdkProcessingMetadata,
      transactionName: _transactionName,
      span: _span,
    };
  }

  /**
   * Applies data from the scope to the event and runs all event processors on it.
   *
   * @param event Event
   * @param hint Object containing additional information about the original exception, for use by the event processors.
   * @hidden
   * @deprecated Use `applyScopeDataToEvent()` directly
   */
   applyToEvent(
    event,
    hint = {},
    additionalEventProcessors = [],
  ) {
    (0,_utils_applyScopeDataToEvent_js__WEBPACK_IMPORTED_MODULE_3__.applyScopeDataToEvent)(event, this.getScopeData());

    // TODO (v8): Update this order to be: Global > Client > Scope
    const eventProcessors = [
      ...additionalEventProcessors,
      // eslint-disable-next-line deprecation/deprecation
      ...(0,_eventProcessors_js__WEBPACK_IMPORTED_MODULE_4__.getGlobalEventProcessors)(),
      ...this._eventProcessors,
    ];

    return (0,_eventProcessors_js__WEBPACK_IMPORTED_MODULE_4__.notifyEventProcessors)(eventProcessors, event, hint);
  }

  /**
   * Add data which will be accessible during event processing but won't get sent to Sentry
   */
   setSDKProcessingMetadata(newData) {
    this._sdkProcessingMetadata = { ...this._sdkProcessingMetadata, ...newData };

    return this;
  }

  /**
   * @inheritDoc
   */
   setPropagationContext(context) {
    this._propagationContext = context;
    return this;
  }

  /**
   * @inheritDoc
   */
   getPropagationContext() {
    return this._propagationContext;
  }

  /**
   * This will be called on every set call.
   */
   _notifyScopeListeners() {
    // We need this check for this._notifyingListeners to be able to work on scope during updates
    // If this check is not here we'll produce endless recursion when something is done with the scope
    // during the callback.
    if (!this._notifyingListeners) {
      this._notifyingListeners = true;
      this._scopeListeners.forEach(callback => {
        callback(this);
      });
      this._notifyingListeners = false;
    }
  }
}

/**
 * Get the global scope.
 * This scope is applied to _all_ events.
 */
function getGlobalScope() {
  if (!globalScope) {
    globalScope = new Scope();
  }

  return globalScope;
}

/**
 * This is mainly needed for tests.
 * DO NOT USE this, as this is an internal API and subject to change.
 * @hidden
 */
function setGlobalScope(scope) {
  globalScope = scope;
}

function generatePropagationContext() {
  return {
    traceId: (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_5__.uuid4)(),
    spanId: (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_5__.uuid4)().substring(16),
  };
}


//# sourceMappingURL=scope.js.map


/***/ }),

/***/ "./node_modules/@sentry/core/esm/sdk.js":
/*!**********************************************!*\
  !*** ./node_modules/@sentry/core/esm/sdk.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "initAndBind": () => (/* binding */ initAndBind)
/* harmony export */ });
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/logger.js");
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./debug-build.js */ "./node_modules/@sentry/core/esm/debug-build.js");
/* harmony import */ var _hub_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./hub.js */ "./node_modules/@sentry/core/esm/hub.js");




/** A class object that can instantiate Client objects. */

/**
 * Internal function to create a new SDK client instance. The client is
 * installed and then bound to the current scope.
 *
 * @param clientClass The client class to instantiate.
 * @param options Options to pass to the client.
 */
function initAndBind(
  clientClass,
  options,
) {
  if (options.debug === true) {
    if (_debug_build_js__WEBPACK_IMPORTED_MODULE_0__.DEBUG_BUILD) {
      _sentry_utils__WEBPACK_IMPORTED_MODULE_1__.logger.enable();
    } else {
      // use `console.warn` rather than `logger.warn` since by non-debug bundles have all `logger.x` statements stripped
      (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_1__.consoleSandbox)(() => {
        // eslint-disable-next-line no-console
        console.warn('[Sentry] Cannot initialize SDK with `debug` option using a non-debug bundle.');
      });
    }
  }
  const hub = (0,_hub_js__WEBPACK_IMPORTED_MODULE_2__.getCurrentHub)();
  const scope = hub.getScope();
  scope.update(options.initialScope);

  const client = new clientClass(options);
  hub.bindClient(client);
}


//# sourceMappingURL=sdk.js.map


/***/ }),

/***/ "./node_modules/@sentry/core/esm/session.js":
/*!**************************************************!*\
  !*** ./node_modules/@sentry/core/esm/session.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "closeSession": () => (/* binding */ closeSession),
/* harmony export */   "makeSession": () => (/* binding */ makeSession),
/* harmony export */   "updateSession": () => (/* binding */ updateSession)
/* harmony export */ });
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/time.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/misc.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/object.js");


/**
 * Creates a new `Session` object by setting certain default parameters. If optional @param context
 * is passed, the passed properties are applied to the session object.
 *
 * @param context (optional) additional properties to be applied to the returned session object
 *
 * @returns a new `Session` object
 */
function makeSession(context) {
  // Both timestamp and started are in seconds since the UNIX epoch.
  const startingTime = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.timestampInSeconds)();

  const session = {
    sid: (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_1__.uuid4)(),
    init: true,
    timestamp: startingTime,
    started: startingTime,
    duration: 0,
    status: 'ok',
    errors: 0,
    ignoreDuration: false,
    toJSON: () => sessionToJSON(session),
  };

  if (context) {
    updateSession(session, context);
  }

  return session;
}

/**
 * Updates a session object with the properties passed in the context.
 *
 * Note that this function mutates the passed object and returns void.
 * (Had to do this instead of returning a new and updated session because closing and sending a session
 * makes an update to the session after it was passed to the sending logic.
 * @see BaseClient.captureSession )
 *
 * @param session the `Session` to update
 * @param context the `SessionContext` holding the properties that should be updated in @param session
 */
// eslint-disable-next-line complexity
function updateSession(session, context = {}) {
  if (context.user) {
    if (!session.ipAddress && context.user.ip_address) {
      session.ipAddress = context.user.ip_address;
    }

    if (!session.did && !context.did) {
      session.did = context.user.id || context.user.email || context.user.username;
    }
  }

  session.timestamp = context.timestamp || (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.timestampInSeconds)();

  if (context.abnormal_mechanism) {
    session.abnormal_mechanism = context.abnormal_mechanism;
  }

  if (context.ignoreDuration) {
    session.ignoreDuration = context.ignoreDuration;
  }
  if (context.sid) {
    // Good enough uuid validation. — Kamil
    session.sid = context.sid.length === 32 ? context.sid : (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_1__.uuid4)();
  }
  if (context.init !== undefined) {
    session.init = context.init;
  }
  if (!session.did && context.did) {
    session.did = `${context.did}`;
  }
  if (typeof context.started === 'number') {
    session.started = context.started;
  }
  if (session.ignoreDuration) {
    session.duration = undefined;
  } else if (typeof context.duration === 'number') {
    session.duration = context.duration;
  } else {
    const duration = session.timestamp - session.started;
    session.duration = duration >= 0 ? duration : 0;
  }
  if (context.release) {
    session.release = context.release;
  }
  if (context.environment) {
    session.environment = context.environment;
  }
  if (!session.ipAddress && context.ipAddress) {
    session.ipAddress = context.ipAddress;
  }
  if (!session.userAgent && context.userAgent) {
    session.userAgent = context.userAgent;
  }
  if (typeof context.errors === 'number') {
    session.errors = context.errors;
  }
  if (context.status) {
    session.status = context.status;
  }
}

/**
 * Closes a session by setting its status and updating the session object with it.
 * Internally calls `updateSession` to update the passed session object.
 *
 * Note that this function mutates the passed session (@see updateSession for explanation).
 *
 * @param session the `Session` object to be closed
 * @param status the `SessionStatus` with which the session was closed. If you don't pass a status,
 *               this function will keep the previously set status, unless it was `'ok'` in which case
 *               it is changed to `'exited'`.
 */
function closeSession(session, status) {
  let context = {};
  if (status) {
    context = { status };
  } else if (session.status === 'ok') {
    context = { status: 'exited' };
  }

  updateSession(session, context);
}

/**
 * Serializes a passed session object to a JSON object with a slightly different structure.
 * This is necessary because the Sentry backend requires a slightly different schema of a session
 * than the one the JS SDKs use internally.
 *
 * @param session the session to be converted
 *
 * @returns a JSON object of the passed session
 */
function sessionToJSON(session) {
  return (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_2__.dropUndefinedKeys)({
    sid: `${session.sid}`,
    init: session.init,
    // Make sure that sec is converted to ms for date constructor
    started: new Date(session.started * 1000).toISOString(),
    timestamp: new Date(session.timestamp * 1000).toISOString(),
    status: session.status,
    errors: session.errors,
    did: typeof session.did === 'number' || typeof session.did === 'string' ? `${session.did}` : undefined,
    duration: session.duration,
    abnormal_mechanism: session.abnormal_mechanism,
    attrs: {
      release: session.release,
      environment: session.environment,
      ip_address: session.ipAddress,
      user_agent: session.userAgent,
    },
  });
}


//# sourceMappingURL=session.js.map


/***/ }),

/***/ "./node_modules/@sentry/core/esm/tracing/dynamicSamplingContext.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@sentry/core/esm/tracing/dynamicSamplingContext.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getDynamicSamplingContextFromClient": () => (/* binding */ getDynamicSamplingContextFromClient)
/* harmony export */ });
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/object.js");
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants.js */ "./node_modules/@sentry/core/esm/constants.js");



/**
 * Creates a dynamic sampling context from a client.
 *
 * Dispatchs the `createDsc` lifecycle hook as a side effect.
 */
function getDynamicSamplingContextFromClient(
  trace_id,
  client,
  scope,
) {
  const options = client.getOptions();

  const { publicKey: public_key } = client.getDsn() || {};
  const { segment: user_segment } = (scope && scope.getUser()) || {};

  const dsc = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.dropUndefinedKeys)({
    environment: options.environment || _constants_js__WEBPACK_IMPORTED_MODULE_1__.DEFAULT_ENVIRONMENT,
    release: options.release,
    user_segment,
    public_key,
    trace_id,
  }) ;

  client.emit && client.emit('createDsc', dsc);

  return dsc;
}


//# sourceMappingURL=dynamicSamplingContext.js.map


/***/ }),

/***/ "./node_modules/@sentry/core/esm/transports/base.js":
/*!**********************************************************!*\
  !*** ./node_modules/@sentry/core/esm/transports/base.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DEFAULT_TRANSPORT_BUFFER_SIZE": () => (/* binding */ DEFAULT_TRANSPORT_BUFFER_SIZE),
/* harmony export */   "createTransport": () => (/* binding */ createTransport)
/* harmony export */ });
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/promisebuffer.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/envelope.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/ratelimit.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/syncpromise.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/logger.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/error.js");
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../debug-build.js */ "./node_modules/@sentry/core/esm/debug-build.js");



const DEFAULT_TRANSPORT_BUFFER_SIZE = 30;

/**
 * Creates an instance of a Sentry `Transport`
 *
 * @param options
 * @param makeRequest
 */
function createTransport(
  options,
  makeRequest,
  buffer = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.makePromiseBuffer)(
    options.bufferSize || DEFAULT_TRANSPORT_BUFFER_SIZE,
  ),
) {
  let rateLimits = {};
  const flush = (timeout) => buffer.drain(timeout);

  function send(envelope) {
    const filteredEnvelopeItems = [];

    // Drop rate limited items from envelope
    (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_1__.forEachEnvelopeItem)(envelope, (item, type) => {
      const envelopeItemDataCategory = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_1__.envelopeItemTypeToDataCategory)(type);
      if ((0,_sentry_utils__WEBPACK_IMPORTED_MODULE_2__.isRateLimited)(rateLimits, envelopeItemDataCategory)) {
        const event = getEventForEnvelopeItem(item, type);
        options.recordDroppedEvent('ratelimit_backoff', envelopeItemDataCategory, event);
      } else {
        filteredEnvelopeItems.push(item);
      }
    });

    // Skip sending if envelope is empty after filtering out rate limited events
    if (filteredEnvelopeItems.length === 0) {
      return (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_3__.resolvedSyncPromise)();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filteredEnvelope = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_1__.createEnvelope)(envelope[0], filteredEnvelopeItems );

    // Creates client report for each item in an envelope
    const recordEnvelopeLoss = (reason) => {
      (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_1__.forEachEnvelopeItem)(filteredEnvelope, (item, type) => {
        const event = getEventForEnvelopeItem(item, type);
        options.recordDroppedEvent(reason, (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_1__.envelopeItemTypeToDataCategory)(type), event);
      });
    };

    const requestTask = () =>
      makeRequest({ body: (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_1__.serializeEnvelope)(filteredEnvelope, options.textEncoder) }).then(
        response => {
          // We don't want to throw on NOK responses, but we want to at least log them
          if (response.statusCode !== undefined && (response.statusCode < 200 || response.statusCode >= 300)) {
            _debug_build_js__WEBPACK_IMPORTED_MODULE_4__.DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_5__.logger.warn(`Sentry responded with status code ${response.statusCode} to sent event.`);
          }

          rateLimits = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_2__.updateRateLimits)(rateLimits, response);
          return response;
        },
        error => {
          recordEnvelopeLoss('network_error');
          throw error;
        },
      );

    return buffer.add(requestTask).then(
      result => result,
      error => {
        if (error instanceof _sentry_utils__WEBPACK_IMPORTED_MODULE_6__.SentryError) {
          _debug_build_js__WEBPACK_IMPORTED_MODULE_4__.DEBUG_BUILD && _sentry_utils__WEBPACK_IMPORTED_MODULE_5__.logger.error('Skipped sending event because buffer is full.');
          recordEnvelopeLoss('queue_overflow');
          return (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_3__.resolvedSyncPromise)();
        } else {
          throw error;
        }
      },
    );
  }

  // We use this to identifify if the transport is the base transport
  // TODO (v8): Remove this again as we'll no longer need it
  send.__sentry__baseTransport__ = true;

  return {
    send,
    flush,
  };
}

function getEventForEnvelopeItem(item, type) {
  if (type !== 'event' && type !== 'transaction') {
    return undefined;
  }

  return Array.isArray(item) ? (item )[1] : undefined;
}


//# sourceMappingURL=base.js.map


/***/ }),

/***/ "./node_modules/@sentry/core/esm/utils/applyScopeDataToEvent.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@sentry/core/esm/utils/applyScopeDataToEvent.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "applyScopeDataToEvent": () => (/* binding */ applyScopeDataToEvent),
/* harmony export */   "mergePropOverwrite": () => (/* binding */ mergePropOverwrite),
/* harmony export */   "mergeScopeData": () => (/* binding */ mergeScopeData)
/* harmony export */ });
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/misc.js");


/**
 * Applies data from the scope to the event and runs all event processors on it.
 */
function applyScopeDataToEvent(event, data) {
  const { fingerprint, span, breadcrumbs, sdkProcessingMetadata, propagationContext } = data;

  // Apply general data
  applyDataToEvent(event, data);

  // We want to set the trace context for normal events only if there isn't already
  // a trace context on the event. There is a product feature in place where we link
  // errors with transaction and it relies on that.
  if (span) {
    applySpanToEvent(event, span);
  }

  applyFingerprintToEvent(event, fingerprint);
  applyBreadcrumbsToEvent(event, breadcrumbs);
  applySdkMetadataToEvent(event, sdkProcessingMetadata, propagationContext);
}

/** Merge data of two scopes together. */
function mergeScopeData(data, mergeData) {
  const {
    extra,
    tags,
    user,
    contexts,
    level,
    sdkProcessingMetadata,
    breadcrumbs,
    fingerprint,
    eventProcessors,
    attachments,
    propagationContext,
    transactionName,
    span,
  } = mergeData;

  mergePropOverwrite(data, 'extra', extra);
  mergePropOverwrite(data, 'tags', tags);
  mergePropOverwrite(data, 'user', user);
  mergePropOverwrite(data, 'contexts', contexts);
  mergePropOverwrite(data, 'sdkProcessingMetadata', sdkProcessingMetadata);

  if (level) {
    data.level = level;
  }

  if (transactionName) {
    data.transactionName = transactionName;
  }

  if (span) {
    data.span = span;
  }

  if (breadcrumbs.length) {
    data.breadcrumbs = [...data.breadcrumbs, ...breadcrumbs];
  }

  if (fingerprint.length) {
    data.fingerprint = [...data.fingerprint, ...fingerprint];
  }

  if (eventProcessors.length) {
    data.eventProcessors = [...data.eventProcessors, ...eventProcessors];
  }

  if (attachments.length) {
    data.attachments = [...data.attachments, ...attachments];
  }

  data.propagationContext = { ...data.propagationContext, ...propagationContext };
}

/**
 * Merge properties, overwriting existing keys.
 * Exported only for tests.
 */
function mergePropOverwrite

(data, prop, mergeVal) {
  if (mergeVal && Object.keys(mergeVal).length) {
    data[prop] = { ...data[prop], ...mergeVal };
  }
}

function applyDataToEvent(event, data) {
  const { extra, tags, user, contexts, level, transactionName } = data;

  if (extra && Object.keys(extra).length) {
    event.extra = { ...extra, ...event.extra };
  }
  if (tags && Object.keys(tags).length) {
    event.tags = { ...tags, ...event.tags };
  }
  if (user && Object.keys(user).length) {
    event.user = { ...user, ...event.user };
  }
  if (contexts && Object.keys(contexts).length) {
    event.contexts = { ...contexts, ...event.contexts };
  }
  if (level) {
    event.level = level;
  }
  if (transactionName) {
    event.transaction = transactionName;
  }
}

function applyBreadcrumbsToEvent(event, breadcrumbs) {
  const mergedBreadcrumbs = [...(event.breadcrumbs || []), ...breadcrumbs];
  event.breadcrumbs = mergedBreadcrumbs.length ? mergedBreadcrumbs : undefined;
}

function applySdkMetadataToEvent(
  event,
  sdkProcessingMetadata,
  propagationContext,
) {
  event.sdkProcessingMetadata = {
    ...event.sdkProcessingMetadata,
    ...sdkProcessingMetadata,
    propagationContext: propagationContext,
  };
}

function applySpanToEvent(event, span) {
  event.contexts = { trace: span.getTraceContext(), ...event.contexts };
  const transaction = span.transaction;
  if (transaction) {
    event.sdkProcessingMetadata = {
      dynamicSamplingContext: transaction.getDynamicSamplingContext(),
      ...event.sdkProcessingMetadata,
    };
    const transactionName = transaction.name;
    if (transactionName) {
      event.tags = { transaction: transactionName, ...event.tags };
    }
  }
}

/**
 * Applies fingerprint from the scope to the event if there's one,
 * uses message if there's one instead or get rid of empty fingerprint
 */
function applyFingerprintToEvent(event, fingerprint) {
  // Make sure it's an array first and we actually have something in place
  event.fingerprint = event.fingerprint ? (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.arrayify)(event.fingerprint) : [];

  // If we have something on the scope, then merge it with event
  if (fingerprint) {
    event.fingerprint = event.fingerprint.concat(fingerprint);
  }

  // If we have no data at all, remove empty array default
  if (event.fingerprint && !event.fingerprint.length) {
    delete event.fingerprint;
  }
}


//# sourceMappingURL=applyScopeDataToEvent.js.map


/***/ }),

/***/ "./node_modules/@sentry/core/esm/utils/prepareEvent.js":
/*!*************************************************************!*\
  !*** ./node_modules/@sentry/core/esm/utils/prepareEvent.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "applyDebugIds": () => (/* binding */ applyDebugIds),
/* harmony export */   "applyDebugMeta": () => (/* binding */ applyDebugMeta),
/* harmony export */   "parseEventHintOrCaptureContext": () => (/* binding */ parseEventHintOrCaptureContext),
/* harmony export */   "prepareEvent": () => (/* binding */ prepareEvent)
/* harmony export */ });
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/misc.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/time.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/string.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/worldwide.js");
/* harmony import */ var _sentry_utils__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @sentry/utils */ "./node_modules/@sentry/utils/esm/normalize.js");
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../constants.js */ "./node_modules/@sentry/core/esm/constants.js");
/* harmony import */ var _eventProcessors_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../eventProcessors.js */ "./node_modules/@sentry/core/esm/eventProcessors.js");
/* harmony import */ var _scope_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../scope.js */ "./node_modules/@sentry/core/esm/scope.js");
/* harmony import */ var _applyScopeDataToEvent_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./applyScopeDataToEvent.js */ "./node_modules/@sentry/core/esm/utils/applyScopeDataToEvent.js");






/**
 * This type makes sure that we get either a CaptureContext, OR an EventHint.
 * It does not allow mixing them, which could lead to unexpected outcomes, e.g. this is disallowed:
 * { user: { id: '123' }, mechanism: { handled: false } }
 */

/**
 * Adds common information to events.
 *
 * The information includes release and environment from `options`,
 * breadcrumbs and context (extra, tags and user) from the scope.
 *
 * Information that is already present in the event is never overwritten. For
 * nested objects, such as the context, keys are merged.
 *
 * Note: This also triggers callbacks for `addGlobalEventProcessor`, but not `beforeSend`.
 *
 * @param event The original event.
 * @param hint May contain additional information about the original exception.
 * @param scope A scope containing event metadata.
 * @returns A new event with more information.
 * @hidden
 */
function prepareEvent(
  options,
  event,
  hint,
  scope,
  client,
  isolationScope,
) {
  const { normalizeDepth = 3, normalizeMaxBreadth = 1000 } = options;
  const prepared = {
    ...event,
    event_id: event.event_id || hint.event_id || (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.uuid4)(),
    timestamp: event.timestamp || (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_1__.dateTimestampInSeconds)(),
  };
  const integrations = hint.integrations || options.integrations.map(i => i.name);

  applyClientOptions(prepared, options);
  applyIntegrationsMetadata(prepared, integrations);

  // Only put debug IDs onto frames for error events.
  if (event.type === undefined) {
    applyDebugIds(prepared, options.stackParser);
  }

  // If we have scope given to us, use it as the base for further modifications.
  // This allows us to prevent unnecessary copying of data if `captureContext` is not provided.
  const finalScope = getFinalScope(scope, hint.captureContext);

  if (hint.mechanism) {
    (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_0__.addExceptionMechanism)(prepared, hint.mechanism);
  }

  const clientEventProcessors = client && client.getEventProcessors ? client.getEventProcessors() : [];

  // This should be the last thing called, since we want that
  // {@link Hub.addEventProcessor} gets the finished prepared event.
  // Merge scope data together
  const data = (0,_scope_js__WEBPACK_IMPORTED_MODULE_2__.getGlobalScope)().getScopeData();

  if (isolationScope) {
    const isolationData = isolationScope.getScopeData();
    (0,_applyScopeDataToEvent_js__WEBPACK_IMPORTED_MODULE_3__.mergeScopeData)(data, isolationData);
  }

  if (finalScope) {
    const finalScopeData = finalScope.getScopeData();
    (0,_applyScopeDataToEvent_js__WEBPACK_IMPORTED_MODULE_3__.mergeScopeData)(data, finalScopeData);
  }

  const attachments = [...(hint.attachments || []), ...data.attachments];
  if (attachments.length) {
    hint.attachments = attachments;
  }

  (0,_applyScopeDataToEvent_js__WEBPACK_IMPORTED_MODULE_3__.applyScopeDataToEvent)(prepared, data);

  // TODO (v8): Update this order to be: Global > Client > Scope
  const eventProcessors = [
    ...clientEventProcessors,
    // eslint-disable-next-line deprecation/deprecation
    ...(0,_eventProcessors_js__WEBPACK_IMPORTED_MODULE_4__.getGlobalEventProcessors)(),
    // Run scope event processors _after_ all other processors
    ...data.eventProcessors,
  ];

  const result = (0,_eventProcessors_js__WEBPACK_IMPORTED_MODULE_4__.notifyEventProcessors)(eventProcessors, prepared, hint);

  return result.then(evt => {
    if (evt) {
      // We apply the debug_meta field only after all event processors have ran, so that if any event processors modified
      // file names (e.g.the RewriteFrames integration) the filename -> debug ID relationship isn't destroyed.
      // This should not cause any PII issues, since we're only moving data that is already on the event and not adding
      // any new data
      applyDebugMeta(evt);
    }

    if (typeof normalizeDepth === 'number' && normalizeDepth > 0) {
      return normalizeEvent(evt, normalizeDepth, normalizeMaxBreadth);
    }
    return evt;
  });
}

/**
 *  Enhances event using the client configuration.
 *  It takes care of all "static" values like environment, release and `dist`,
 *  as well as truncating overly long values.
 * @param event event instance to be enhanced
 */
function applyClientOptions(event, options) {
  const { environment, release, dist, maxValueLength = 250 } = options;

  if (!('environment' in event)) {
    event.environment = 'environment' in options ? environment : _constants_js__WEBPACK_IMPORTED_MODULE_5__.DEFAULT_ENVIRONMENT;
  }

  if (event.release === undefined && release !== undefined) {
    event.release = release;
  }

  if (event.dist === undefined && dist !== undefined) {
    event.dist = dist;
  }

  if (event.message) {
    event.message = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_6__.truncate)(event.message, maxValueLength);
  }

  const exception = event.exception && event.exception.values && event.exception.values[0];
  if (exception && exception.value) {
    exception.value = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_6__.truncate)(exception.value, maxValueLength);
  }

  const request = event.request;
  if (request && request.url) {
    request.url = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_6__.truncate)(request.url, maxValueLength);
  }
}

const debugIdStackParserCache = new WeakMap();

/**
 * Puts debug IDs into the stack frames of an error event.
 */
function applyDebugIds(event, stackParser) {
  const debugIdMap = _sentry_utils__WEBPACK_IMPORTED_MODULE_7__.GLOBAL_OBJ._sentryDebugIds;

  if (!debugIdMap) {
    return;
  }

  let debugIdStackFramesCache;
  const cachedDebugIdStackFrameCache = debugIdStackParserCache.get(stackParser);
  if (cachedDebugIdStackFrameCache) {
    debugIdStackFramesCache = cachedDebugIdStackFrameCache;
  } else {
    debugIdStackFramesCache = new Map();
    debugIdStackParserCache.set(stackParser, debugIdStackFramesCache);
  }

  // Build a map of filename -> debug_id
  const filenameDebugIdMap = Object.keys(debugIdMap).reduce((acc, debugIdStackTrace) => {
    let parsedStack;
    const cachedParsedStack = debugIdStackFramesCache.get(debugIdStackTrace);
    if (cachedParsedStack) {
      parsedStack = cachedParsedStack;
    } else {
      parsedStack = stackParser(debugIdStackTrace);
      debugIdStackFramesCache.set(debugIdStackTrace, parsedStack);
    }

    for (let i = parsedStack.length - 1; i >= 0; i--) {
      const stackFrame = parsedStack[i];
      if (stackFrame.filename) {
        acc[stackFrame.filename] = debugIdMap[debugIdStackTrace];
        break;
      }
    }
    return acc;
  }, {});

  try {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    event.exception.values.forEach(exception => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      exception.stacktrace.frames.forEach(frame => {
        if (frame.filename) {
          frame.debug_id = filenameDebugIdMap[frame.filename];
        }
      });
    });
  } catch (e) {
    // To save bundle size we're just try catching here instead of checking for the existence of all the different objects.
  }
}

/**
 * Moves debug IDs from the stack frames of an error event into the debug_meta field.
 */
function applyDebugMeta(event) {
  // Extract debug IDs and filenames from the stack frames on the event.
  const filenameDebugIdMap = {};
  try {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    event.exception.values.forEach(exception => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      exception.stacktrace.frames.forEach(frame => {
        if (frame.debug_id) {
          if (frame.abs_path) {
            filenameDebugIdMap[frame.abs_path] = frame.debug_id;
          } else if (frame.filename) {
            filenameDebugIdMap[frame.filename] = frame.debug_id;
          }
          delete frame.debug_id;
        }
      });
    });
  } catch (e) {
    // To save bundle size we're just try catching here instead of checking for the existence of all the different objects.
  }

  if (Object.keys(filenameDebugIdMap).length === 0) {
    return;
  }

  // Fill debug_meta information
  event.debug_meta = event.debug_meta || {};
  event.debug_meta.images = event.debug_meta.images || [];
  const images = event.debug_meta.images;
  Object.keys(filenameDebugIdMap).forEach(filename => {
    images.push({
      type: 'sourcemap',
      code_file: filename,
      debug_id: filenameDebugIdMap[filename],
    });
  });
}

/**
 * This function adds all used integrations to the SDK info in the event.
 * @param event The event that will be filled with all integrations.
 */
function applyIntegrationsMetadata(event, integrationNames) {
  if (integrationNames.length > 0) {
    event.sdk = event.sdk || {};
    event.sdk.integrations = [...(event.sdk.integrations || []), ...integrationNames];
  }
}

/**
 * Applies `normalize` function on necessary `Event` attributes to make them safe for serialization.
 * Normalized keys:
 * - `breadcrumbs.data`
 * - `user`
 * - `contexts`
 * - `extra`
 * @param event Event
 * @returns Normalized event
 */
function normalizeEvent(event, depth, maxBreadth) {
  if (!event) {
    return null;
  }

  const normalized = {
    ...event,
    ...(event.breadcrumbs && {
      breadcrumbs: event.breadcrumbs.map(b => ({
        ...b,
        ...(b.data && {
          data: (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_8__.normalize)(b.data, depth, maxBreadth),
        }),
      })),
    }),
    ...(event.user && {
      user: (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_8__.normalize)(event.user, depth, maxBreadth),
    }),
    ...(event.contexts && {
      contexts: (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_8__.normalize)(event.contexts, depth, maxBreadth),
    }),
    ...(event.extra && {
      extra: (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_8__.normalize)(event.extra, depth, maxBreadth),
    }),
  };

  // event.contexts.trace stores information about a Transaction. Similarly,
  // event.spans[] stores information about child Spans. Given that a
  // Transaction is conceptually a Span, normalization should apply to both
  // Transactions and Spans consistently.
  // For now the decision is to skip normalization of Transactions and Spans,
  // so this block overwrites the normalized event to add back the original
  // Transaction information prior to normalization.
  if (event.contexts && event.contexts.trace && normalized.contexts) {
    normalized.contexts.trace = event.contexts.trace;

    // event.contexts.trace.data may contain circular/dangerous data so we need to normalize it
    if (event.contexts.trace.data) {
      normalized.contexts.trace.data = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_8__.normalize)(event.contexts.trace.data, depth, maxBreadth);
    }
  }

  // event.spans[].data may contain circular/dangerous data so we need to normalize it
  if (event.spans) {
    normalized.spans = event.spans.map(span => {
      // We cannot use the spread operator here because `toJSON` on `span` is non-enumerable
      if (span.data) {
        span.data = (0,_sentry_utils__WEBPACK_IMPORTED_MODULE_8__.normalize)(span.data, depth, maxBreadth);
      }
      return span;
    });
  }

  return normalized;
}

function getFinalScope(scope, captureContext) {
  if (!captureContext) {
    return scope;
  }

  const finalScope = scope ? scope.clone() : new _scope_js__WEBPACK_IMPORTED_MODULE_2__.Scope();
  finalScope.update(captureContext);
  return finalScope;
}

/**
 * Parse either an `EventHint` directly, or convert a `CaptureContext` to an `EventHint`.
 * This is used to allow to update method signatures that used to accept a `CaptureContext` but should now accept an `EventHint`.
 */
function parseEventHintOrCaptureContext(
  hint,
) {
  if (!hint) {
    return undefined;
  }

  // If you pass a Scope or `() => Scope` as CaptureContext, we just return this as captureContext
  if (hintIsScopeOrFunction(hint)) {
    return { captureContext: hint };
  }

  if (hintIsScopeContext(hint)) {
    return {
      captureContext: hint,
    };
  }

  return hint;
}

function hintIsScopeOrFunction(
  hint,
) {
  return hint instanceof _scope_js__WEBPACK_IMPORTED_MODULE_2__.Scope || typeof hint === 'function';
}

const captureContextKeys = [
  'user',
  'level',
  'extra',
  'contexts',
  'tags',
  'fingerprint',
  'requestSession',
  'propagationContext',
] ;

function hintIsScopeContext(hint) {
  return Object.keys(hint).some(key => captureContextKeys.includes(key ));
}


//# sourceMappingURL=prepareEvent.js.map


/***/ }),

/***/ "./node_modules/@sentry/core/esm/version.js":
/*!**************************************************!*\
  !*** ./node_modules/@sentry/core/esm/version.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SDK_VERSION": () => (/* binding */ SDK_VERSION)
/* harmony export */ });
const SDK_VERSION = '7.91.0';


//# sourceMappingURL=version.js.map


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/aggregate-errors.js":
/*!************************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/aggregate-errors.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "applyAggregateErrorsToEvent": () => (/* binding */ applyAggregateErrorsToEvent)
/* harmony export */ });
/* harmony import */ var _is_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./is.js */ "./node_modules/@sentry/utils/esm/is.js");
/* harmony import */ var _string_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./string.js */ "./node_modules/@sentry/utils/esm/string.js");



/**
 * Creates exceptions inside `event.exception.values` for errors that are nested on properties based on the `key` parameter.
 */
function applyAggregateErrorsToEvent(
  exceptionFromErrorImplementation,
  parser,
  maxValueLimit = 250,
  key,
  limit,
  event,
  hint,
) {
  if (!event.exception || !event.exception.values || !hint || !(0,_is_js__WEBPACK_IMPORTED_MODULE_0__.isInstanceOf)(hint.originalException, Error)) {
    return;
  }

  // Generally speaking the last item in `event.exception.values` is the exception originating from the original Error
  const originalException =
    event.exception.values.length > 0 ? event.exception.values[event.exception.values.length - 1] : undefined;

  // We only create exception grouping if there is an exception in the event.
  if (originalException) {
    event.exception.values = truncateAggregateExceptions(
      aggregateExceptionsFromError(
        exceptionFromErrorImplementation,
        parser,
        limit,
        hint.originalException ,
        key,
        event.exception.values,
        originalException,
        0,
      ),
      maxValueLimit,
    );
  }
}

function aggregateExceptionsFromError(
  exceptionFromErrorImplementation,
  parser,
  limit,
  error,
  key,
  prevExceptions,
  exception,
  exceptionId,
) {
  if (prevExceptions.length >= limit + 1) {
    return prevExceptions;
  }

  let newExceptions = [...prevExceptions];

  if ((0,_is_js__WEBPACK_IMPORTED_MODULE_0__.isInstanceOf)(error[key], Error)) {
    applyExceptionGroupFieldsForParentException(exception, exceptionId);
    const newException = exceptionFromErrorImplementation(parser, error[key]);
    const newExceptionId = newExceptions.length;
    applyExceptionGroupFieldsForChildException(newException, key, newExceptionId, exceptionId);
    newExceptions = aggregateExceptionsFromError(
      exceptionFromErrorImplementation,
      parser,
      limit,
      error[key],
      key,
      [newException, ...newExceptions],
      newException,
      newExceptionId,
    );
  }

  // This will create exception grouping for AggregateErrors
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AggregateError
  if (Array.isArray(error.errors)) {
    error.errors.forEach((childError, i) => {
      if ((0,_is_js__WEBPACK_IMPORTED_MODULE_0__.isInstanceOf)(childError, Error)) {
        applyExceptionGroupFieldsForParentException(exception, exceptionId);
        const newException = exceptionFromErrorImplementation(parser, childError);
        const newExceptionId = newExceptions.length;
        applyExceptionGroupFieldsForChildException(newException, `errors[${i}]`, newExceptionId, exceptionId);
        newExceptions = aggregateExceptionsFromError(
          exceptionFromErrorImplementation,
          parser,
          limit,
          childError,
          key,
          [newException, ...newExceptions],
          newException,
          newExceptionId,
        );
      }
    });
  }

  return newExceptions;
}

function applyExceptionGroupFieldsForParentException(exception, exceptionId) {
  // Don't know if this default makes sense. The protocol requires us to set these values so we pick *some* default.
  exception.mechanism = exception.mechanism || { type: 'generic', handled: true };

  exception.mechanism = {
    ...exception.mechanism,
    is_exception_group: true,
    exception_id: exceptionId,
  };
}

function applyExceptionGroupFieldsForChildException(
  exception,
  source,
  exceptionId,
  parentId,
) {
  // Don't know if this default makes sense. The protocol requires us to set these values so we pick *some* default.
  exception.mechanism = exception.mechanism || { type: 'generic', handled: true };

  exception.mechanism = {
    ...exception.mechanism,
    type: 'chained',
    source,
    exception_id: exceptionId,
    parent_id: parentId,
  };
}

/**
 * Truncate the message (exception.value) of all exceptions in the event.
 * Because this event processor is ran after `applyClientOptions`,
 * we need to truncate the message of the added exceptions here.
 */
function truncateAggregateExceptions(exceptions, maxValueLength) {
  return exceptions.map(exception => {
    if (exception.value) {
      exception.value = (0,_string_js__WEBPACK_IMPORTED_MODULE_1__.truncate)(exception.value, maxValueLength);
    }
    return exception;
  });
}


//# sourceMappingURL=aggregate-errors.js.map


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/browser.js":
/*!***************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/browser.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getComponentName": () => (/* binding */ getComponentName),
/* harmony export */   "getDomElement": () => (/* binding */ getDomElement),
/* harmony export */   "getLocationHref": () => (/* binding */ getLocationHref),
/* harmony export */   "htmlTreeAsString": () => (/* binding */ htmlTreeAsString)
/* harmony export */ });
/* harmony import */ var _is_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./is.js */ "./node_modules/@sentry/utils/esm/is.js");
/* harmony import */ var _worldwide_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./worldwide.js */ "./node_modules/@sentry/utils/esm/worldwide.js");



// eslint-disable-next-line deprecation/deprecation
const WINDOW = (0,_worldwide_js__WEBPACK_IMPORTED_MODULE_0__.getGlobalObject)();

const DEFAULT_MAX_STRING_LENGTH = 80;

/**
 * Given a child DOM element, returns a query-selector statement describing that
 * and its ancestors
 * e.g. [HTMLElement] => body > div > input#foo.btn[name=baz]
 * @returns generated DOM path
 */
function htmlTreeAsString(
  elem,
  options = {},
) {
  if (!elem) {
    return '<unknown>';
  }

  // try/catch both:
  // - accessing event.target (see getsentry/raven-js#838, #768)
  // - `htmlTreeAsString` because it's complex, and just accessing the DOM incorrectly
  // - can throw an exception in some circumstances.
  try {
    let currentElem = elem ;
    const MAX_TRAVERSE_HEIGHT = 5;
    const out = [];
    let height = 0;
    let len = 0;
    const separator = ' > ';
    const sepLength = separator.length;
    let nextStr;
    const keyAttrs = Array.isArray(options) ? options : options.keyAttrs;
    const maxStringLength = (!Array.isArray(options) && options.maxStringLength) || DEFAULT_MAX_STRING_LENGTH;

    while (currentElem && height++ < MAX_TRAVERSE_HEIGHT) {
      nextStr = _htmlElementAsString(currentElem, keyAttrs);
      // bail out if
      // - nextStr is the 'html' element
      // - the length of the string that would be created exceeds maxStringLength
      //   (ignore this limit if we are on the first iteration)
      if (nextStr === 'html' || (height > 1 && len + out.length * sepLength + nextStr.length >= maxStringLength)) {
        break;
      }

      out.push(nextStr);

      len += nextStr.length;
      currentElem = currentElem.parentNode;
    }

    return out.reverse().join(separator);
  } catch (_oO) {
    return '<unknown>';
  }
}

/**
 * Returns a simple, query-selector representation of a DOM element
 * e.g. [HTMLElement] => input#foo.btn[name=baz]
 * @returns generated DOM path
 */
function _htmlElementAsString(el, keyAttrs) {
  const elem = el

;

  const out = [];
  let className;
  let classes;
  let key;
  let attr;
  let i;

  if (!elem || !elem.tagName) {
    return '';
  }

  // @ts-expect-error WINDOW has HTMLElement
  if (WINDOW.HTMLElement) {
    // If using the component name annotation plugin, this value may be available on the DOM node
    if (elem instanceof HTMLElement && elem.dataset && elem.dataset['sentryComponent']) {
      return elem.dataset['sentryComponent'];
    }
  }

  out.push(elem.tagName.toLowerCase());

  // Pairs of attribute keys defined in `serializeAttribute` and their values on element.
  const keyAttrPairs =
    keyAttrs && keyAttrs.length
      ? keyAttrs.filter(keyAttr => elem.getAttribute(keyAttr)).map(keyAttr => [keyAttr, elem.getAttribute(keyAttr)])
      : null;

  if (keyAttrPairs && keyAttrPairs.length) {
    keyAttrPairs.forEach(keyAttrPair => {
      out.push(`[${keyAttrPair[0]}="${keyAttrPair[1]}"]`);
    });
  } else {
    if (elem.id) {
      out.push(`#${elem.id}`);
    }

    // eslint-disable-next-line prefer-const
    className = elem.className;
    if (className && (0,_is_js__WEBPACK_IMPORTED_MODULE_1__.isString)(className)) {
      classes = className.split(/\s+/);
      for (i = 0; i < classes.length; i++) {
        out.push(`.${classes[i]}`);
      }
    }
  }
  const allowedAttrs = ['aria-label', 'type', 'name', 'title', 'alt'];
  for (i = 0; i < allowedAttrs.length; i++) {
    key = allowedAttrs[i];
    attr = elem.getAttribute(key);
    if (attr) {
      out.push(`[${key}="${attr}"]`);
    }
  }
  return out.join('');
}

/**
 * A safe form of location.href
 */
function getLocationHref() {
  try {
    return WINDOW.document.location.href;
  } catch (oO) {
    return '';
  }
}

/**
 * Gets a DOM element by using document.querySelector.
 *
 * This wrapper will first check for the existance of the function before
 * actually calling it so that we don't have to take care of this check,
 * every time we want to access the DOM.
 *
 * Reason: DOM/querySelector is not available in all environments.
 *
 * We have to cast to any because utils can be consumed by a variety of environments,
 * and we don't want to break TS users. If you know what element will be selected by
 * `document.querySelector`, specify it as part of the generic call. For example,
 * `const element = getDomElement<Element>('selector');`
 *
 * @param selector the selector string passed on to document.querySelector
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getDomElement(selector) {
  if (WINDOW.document && WINDOW.document.querySelector) {
    return WINDOW.document.querySelector(selector) ;
  }
  return null;
}

/**
 * Given a DOM element, traverses up the tree until it finds the first ancestor node
 * that has the `data-sentry-component` attribute. This attribute is added at build-time
 * by projects that have the component name annotation plugin installed.
 *
 * @returns a string representation of the component for the provided DOM element, or `null` if not found
 */
function getComponentName(elem) {
  // @ts-expect-error WINDOW has HTMLElement
  if (!WINDOW.HTMLElement) {
    return null;
  }

  let currentElem = elem ;
  const MAX_TRAVERSE_HEIGHT = 5;
  for (let i = 0; i < MAX_TRAVERSE_HEIGHT; i++) {
    if (!currentElem) {
      return null;
    }

    if (currentElem instanceof HTMLElement && currentElem.dataset['sentryComponent']) {
      return currentElem.dataset['sentryComponent'];
    }

    currentElem = currentElem.parentNode;
  }

  return null;
}


//# sourceMappingURL=browser.js.map


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/clientreport.js":
/*!********************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/clientreport.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createClientReportEnvelope": () => (/* binding */ createClientReportEnvelope)
/* harmony export */ });
/* harmony import */ var _envelope_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./envelope.js */ "./node_modules/@sentry/utils/esm/envelope.js");
/* harmony import */ var _time_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./time.js */ "./node_modules/@sentry/utils/esm/time.js");



/**
 * Creates client report envelope
 * @param discarded_events An array of discard events
 * @param dsn A DSN that can be set on the header. Optional.
 */
function createClientReportEnvelope(
  discarded_events,
  dsn,
  timestamp,
) {
  const clientReportItem = [
    { type: 'client_report' },
    {
      timestamp: timestamp || (0,_time_js__WEBPACK_IMPORTED_MODULE_0__.dateTimestampInSeconds)(),
      discarded_events,
    },
  ];
  return (0,_envelope_js__WEBPACK_IMPORTED_MODULE_1__.createEnvelope)(dsn ? { dsn } : {}, [clientReportItem]);
}


//# sourceMappingURL=clientreport.js.map


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/debug-build.js":
/*!*******************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/debug-build.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DEBUG_BUILD": () => (/* binding */ DEBUG_BUILD)
/* harmony export */ });
/**
 * This serves as a build time flag that will be true by default, but false in non-debug builds or if users replace `__SENTRY_DEBUG__` in their generated code.
 *
 * ATTENTION: This constant must never cross package boundaries (i.e. be exported) to guarantee that it can be used for tree shaking.
 */
const DEBUG_BUILD = (typeof __SENTRY_DEBUG__ === 'undefined' || __SENTRY_DEBUG__);


//# sourceMappingURL=debug-build.js.map


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/dsn.js":
/*!***********************************************!*\
  !*** ./node_modules/@sentry/utils/esm/dsn.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "dsnFromString": () => (/* binding */ dsnFromString),
/* harmony export */   "dsnToString": () => (/* binding */ dsnToString),
/* harmony export */   "makeDsn": () => (/* binding */ makeDsn)
/* harmony export */ });
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./debug-build.js */ "./node_modules/@sentry/utils/esm/debug-build.js");
/* harmony import */ var _logger_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./logger.js */ "./node_modules/@sentry/utils/esm/logger.js");



/** Regular expression used to parse a Dsn. */
const DSN_REGEX = /^(?:(\w+):)\/\/(?:(\w+)(?::(\w+)?)?@)([\w.-]+)(?::(\d+))?\/(.+)/;

function isValidProtocol(protocol) {
  return protocol === 'http' || protocol === 'https';
}

/**
 * Renders the string representation of this Dsn.
 *
 * By default, this will render the public representation without the password
 * component. To get the deprecated private representation, set `withPassword`
 * to true.
 *
 * @param withPassword When set to true, the password will be included.
 */
function dsnToString(dsn, withPassword = false) {
  const { host, path, pass, port, projectId, protocol, publicKey } = dsn;
  return (
    `${protocol}://${publicKey}${withPassword && pass ? `:${pass}` : ''}` +
    `@${host}${port ? `:${port}` : ''}/${path ? `${path}/` : path}${projectId}`
  );
}

/**
 * Parses a Dsn from a given string.
 *
 * @param str A Dsn as string
 * @returns Dsn as DsnComponents or undefined if @param str is not a valid DSN string
 */
function dsnFromString(str) {
  const match = DSN_REGEX.exec(str);

  if (!match) {
    // This should be logged to the console
    (0,_logger_js__WEBPACK_IMPORTED_MODULE_0__.consoleSandbox)(() => {
      // eslint-disable-next-line no-console
      console.error(`Invalid Sentry Dsn: ${str}`);
    });
    return undefined;
  }

  const [protocol, publicKey, pass = '', host, port = '', lastPath] = match.slice(1);
  let path = '';
  let projectId = lastPath;

  const split = projectId.split('/');
  if (split.length > 1) {
    path = split.slice(0, -1).join('/');
    projectId = split.pop() ;
  }

  if (projectId) {
    const projectMatch = projectId.match(/^\d+/);
    if (projectMatch) {
      projectId = projectMatch[0];
    }
  }

  return dsnFromComponents({ host, pass, path, projectId, port, protocol: protocol , publicKey });
}

function dsnFromComponents(components) {
  return {
    protocol: components.protocol,
    publicKey: components.publicKey || '',
    pass: components.pass || '',
    host: components.host,
    port: components.port || '',
    path: components.path || '',
    projectId: components.projectId,
  };
}

function validateDsn(dsn) {
  if (!_debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD) {
    return true;
  }

  const { port, projectId, protocol } = dsn;

  const requiredComponents = ['protocol', 'publicKey', 'host', 'projectId'];
  const hasMissingRequiredComponent = requiredComponents.find(component => {
    if (!dsn[component]) {
      _logger_js__WEBPACK_IMPORTED_MODULE_0__.logger.error(`Invalid Sentry Dsn: ${component} missing`);
      return true;
    }
    return false;
  });

  if (hasMissingRequiredComponent) {
    return false;
  }

  if (!projectId.match(/^\d+$/)) {
    _logger_js__WEBPACK_IMPORTED_MODULE_0__.logger.error(`Invalid Sentry Dsn: Invalid projectId ${projectId}`);
    return false;
  }

  if (!isValidProtocol(protocol)) {
    _logger_js__WEBPACK_IMPORTED_MODULE_0__.logger.error(`Invalid Sentry Dsn: Invalid protocol ${protocol}`);
    return false;
  }

  if (port && isNaN(parseInt(port, 10))) {
    _logger_js__WEBPACK_IMPORTED_MODULE_0__.logger.error(`Invalid Sentry Dsn: Invalid port ${port}`);
    return false;
  }

  return true;
}

/**
 * Creates a valid Sentry Dsn object, identifying a Sentry instance and project.
 * @returns a valid DsnComponents object or `undefined` if @param from is an invalid DSN source
 */
function makeDsn(from) {
  const components = typeof from === 'string' ? dsnFromString(from) : dsnFromComponents(from);
  if (!components || !validateDsn(components)) {
    return undefined;
  }
  return components;
}


//# sourceMappingURL=dsn.js.map


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/env.js":
/*!***********************************************!*\
  !*** ./node_modules/@sentry/utils/esm/env.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getSDKSource": () => (/* binding */ getSDKSource),
/* harmony export */   "isBrowserBundle": () => (/* binding */ isBrowserBundle)
/* harmony export */ });
/*
 * This module exists for optimizations in the build process through rollup and terser.  We define some global
 * constants, which can be overridden during build. By guarding certain pieces of code with functions that return these
 * constants, we can control whether or not they appear in the final bundle. (Any code guarded by a false condition will
 * never run, and will hence be dropped during treeshaking.) The two primary uses for this are stripping out calls to
 * `logger` and preventing node-related code from appearing in browser bundles.
 *
 * Attention:
 * This file should not be used to define constants/flags that are intended to be used for tree-shaking conducted by
 * users. These flags should live in their respective packages, as we identified user tooling (specifically webpack)
 * having issues tree-shaking these constants across package boundaries.
 * An example for this is the __SENTRY_DEBUG__ constant. It is declared in each package individually because we want
 * users to be able to shake away expressions that it guards.
 */

/**
 * Figures out if we're building a browser bundle.
 *
 * @returns true if this is a browser bundle build.
 */
function isBrowserBundle() {
  return typeof __SENTRY_BROWSER_BUNDLE__ !== 'undefined' && !!__SENTRY_BROWSER_BUNDLE__;
}

/**
 * Get source of SDK.
 */
function getSDKSource() {
  // @ts-expect-error "npm" is injected by rollup during build process
  return "npm";
}


//# sourceMappingURL=env.js.map


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/envelope.js":
/*!****************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/envelope.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "addItemToEnvelope": () => (/* binding */ addItemToEnvelope),
/* harmony export */   "createAttachmentEnvelopeItem": () => (/* binding */ createAttachmentEnvelopeItem),
/* harmony export */   "createEnvelope": () => (/* binding */ createEnvelope),
/* harmony export */   "createEventEnvelopeHeaders": () => (/* binding */ createEventEnvelopeHeaders),
/* harmony export */   "envelopeContainsItemType": () => (/* binding */ envelopeContainsItemType),
/* harmony export */   "envelopeItemTypeToDataCategory": () => (/* binding */ envelopeItemTypeToDataCategory),
/* harmony export */   "forEachEnvelopeItem": () => (/* binding */ forEachEnvelopeItem),
/* harmony export */   "getSdkMetadataForEnvelopeHeader": () => (/* binding */ getSdkMetadataForEnvelopeHeader),
/* harmony export */   "parseEnvelope": () => (/* binding */ parseEnvelope),
/* harmony export */   "serializeEnvelope": () => (/* binding */ serializeEnvelope)
/* harmony export */ });
/* harmony import */ var _dsn_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./dsn.js */ "./node_modules/@sentry/utils/esm/dsn.js");
/* harmony import */ var _normalize_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./normalize.js */ "./node_modules/@sentry/utils/esm/normalize.js");
/* harmony import */ var _object_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./object.js */ "./node_modules/@sentry/utils/esm/object.js");




/**
 * Creates an envelope.
 * Make sure to always explicitly provide the generic to this function
 * so that the envelope types resolve correctly.
 */
function createEnvelope(headers, items = []) {
  return [headers, items] ;
}

/**
 * Add an item to an envelope.
 * Make sure to always explicitly provide the generic to this function
 * so that the envelope types resolve correctly.
 */
function addItemToEnvelope(envelope, newItem) {
  const [headers, items] = envelope;
  return [headers, [...items, newItem]] ;
}

/**
 * Convenience function to loop through the items and item types of an envelope.
 * (This function was mostly created because working with envelope types is painful at the moment)
 *
 * If the callback returns true, the rest of the items will be skipped.
 */
function forEachEnvelopeItem(
  envelope,
  callback,
) {
  const envelopeItems = envelope[1];

  for (const envelopeItem of envelopeItems) {
    const envelopeItemType = envelopeItem[0].type;
    const result = callback(envelopeItem, envelopeItemType);

    if (result) {
      return true;
    }
  }

  return false;
}

/**
 * Returns true if the envelope contains any of the given envelope item types
 */
function envelopeContainsItemType(envelope, types) {
  return forEachEnvelopeItem(envelope, (_, type) => types.includes(type));
}

/**
 * Encode a string to UTF8.
 */
function encodeUTF8(input, textEncoder) {
  const utf8 = textEncoder || new TextEncoder();
  return utf8.encode(input);
}

/**
 * Serializes an envelope.
 */
function serializeEnvelope(envelope, textEncoder) {
  const [envHeaders, items] = envelope;

  // Initially we construct our envelope as a string and only convert to binary chunks if we encounter binary data
  let parts = JSON.stringify(envHeaders);

  function append(next) {
    if (typeof parts === 'string') {
      parts = typeof next === 'string' ? parts + next : [encodeUTF8(parts, textEncoder), next];
    } else {
      parts.push(typeof next === 'string' ? encodeUTF8(next, textEncoder) : next);
    }
  }

  for (const item of items) {
    const [itemHeaders, payload] = item;

    append(`\n${JSON.stringify(itemHeaders)}\n`);

    if (typeof payload === 'string' || payload instanceof Uint8Array) {
      append(payload);
    } else {
      let stringifiedPayload;
      try {
        stringifiedPayload = JSON.stringify(payload);
      } catch (e) {
        // In case, despite all our efforts to keep `payload` circular-dependency-free, `JSON.strinify()` still
        // fails, we try again after normalizing it again with infinite normalization depth. This of course has a
        // performance impact but in this case a performance hit is better than throwing.
        stringifiedPayload = JSON.stringify((0,_normalize_js__WEBPACK_IMPORTED_MODULE_0__.normalize)(payload));
      }
      append(stringifiedPayload);
    }
  }

  return typeof parts === 'string' ? parts : concatBuffers(parts);
}

function concatBuffers(buffers) {
  const totalLength = buffers.reduce((acc, buf) => acc + buf.length, 0);

  const merged = new Uint8Array(totalLength);
  let offset = 0;
  for (const buffer of buffers) {
    merged.set(buffer, offset);
    offset += buffer.length;
  }

  return merged;
}

/**
 * Parses an envelope
 */
function parseEnvelope(
  env,
  textEncoder,
  textDecoder,
) {
  let buffer = typeof env === 'string' ? textEncoder.encode(env) : env;

  function readBinary(length) {
    const bin = buffer.subarray(0, length);
    // Replace the buffer with the remaining data excluding trailing newline
    buffer = buffer.subarray(length + 1);
    return bin;
  }

  function readJson() {
    let i = buffer.indexOf(0xa);
    // If we couldn't find a newline, we must have found the end of the buffer
    if (i < 0) {
      i = buffer.length;
    }

    return JSON.parse(textDecoder.decode(readBinary(i))) ;
  }

  const envelopeHeader = readJson();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = [];

  while (buffer.length) {
    const itemHeader = readJson();
    const binaryLength = typeof itemHeader.length === 'number' ? itemHeader.length : undefined;

    items.push([itemHeader, binaryLength ? readBinary(binaryLength) : readJson()]);
  }

  return [envelopeHeader, items];
}

/**
 * Creates attachment envelope items
 */
function createAttachmentEnvelopeItem(
  attachment,
  textEncoder,
) {
  const buffer = typeof attachment.data === 'string' ? encodeUTF8(attachment.data, textEncoder) : attachment.data;

  return [
    (0,_object_js__WEBPACK_IMPORTED_MODULE_1__.dropUndefinedKeys)({
      type: 'attachment',
      length: buffer.length,
      filename: attachment.filename,
      content_type: attachment.contentType,
      attachment_type: attachment.attachmentType,
    }),
    buffer,
  ];
}

const ITEM_TYPE_TO_DATA_CATEGORY_MAP = {
  session: 'session',
  sessions: 'session',
  attachment: 'attachment',
  transaction: 'transaction',
  event: 'error',
  client_report: 'internal',
  user_report: 'default',
  profile: 'profile',
  replay_event: 'replay',
  replay_recording: 'replay',
  check_in: 'monitor',
  feedback: 'feedback',
  // TODO: This is a temporary workaround until we have a proper data category for metrics
  statsd: 'unknown',
};

/**
 * Maps the type of an envelope item to a data category.
 */
function envelopeItemTypeToDataCategory(type) {
  return ITEM_TYPE_TO_DATA_CATEGORY_MAP[type];
}

/** Extracts the minimal SDK info from from the metadata or an events */
function getSdkMetadataForEnvelopeHeader(metadataOrEvent) {
  if (!metadataOrEvent || !metadataOrEvent.sdk) {
    return;
  }
  const { name, version } = metadataOrEvent.sdk;
  return { name, version };
}

/**
 * Creates event envelope headers, based on event, sdk info and tunnel
 * Note: This function was extracted from the core package to make it available in Replay
 */
function createEventEnvelopeHeaders(
  event,
  sdkInfo,
  tunnel,
  dsn,
) {
  const dynamicSamplingContext = event.sdkProcessingMetadata && event.sdkProcessingMetadata.dynamicSamplingContext;
  return {
    event_id: event.event_id ,
    sent_at: new Date().toISOString(),
    ...(sdkInfo && { sdk: sdkInfo }),
    ...(!!tunnel && dsn && { dsn: (0,_dsn_js__WEBPACK_IMPORTED_MODULE_2__.dsnToString)(dsn) }),
    ...(dynamicSamplingContext && {
      trace: (0,_object_js__WEBPACK_IMPORTED_MODULE_1__.dropUndefinedKeys)({ ...dynamicSamplingContext }),
    }),
  };
}


//# sourceMappingURL=envelope.js.map


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/error.js":
/*!*************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/error.js ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SentryError": () => (/* binding */ SentryError)
/* harmony export */ });
/** An error emitted by Sentry SDKs and related utilities. */
class SentryError extends Error {
  /** Display name of this error instance. */

   constructor( message, logLevel = 'warn') {
    super(message);this.message = message;
    this.name = new.target.prototype.constructor.name;
    // This sets the prototype to be `Error`, not `SentryError`. It's unclear why we do this, but commenting this line
    // out causes various (seemingly totally unrelated) playwright tests consistently time out. FYI, this makes
    // instances of `SentryError` fail `obj instanceof SentryError` checks.
    Object.setPrototypeOf(this, new.target.prototype);
    this.logLevel = logLevel;
  }
}


//# sourceMappingURL=error.js.map


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/instrument/_handlers.js":
/*!****************************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/instrument/_handlers.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "addHandler": () => (/* binding */ addHandler),
/* harmony export */   "maybeInstrument": () => (/* binding */ maybeInstrument),
/* harmony export */   "resetInstrumentationHandlers": () => (/* binding */ resetInstrumentationHandlers),
/* harmony export */   "triggerHandlers": () => (/* binding */ triggerHandlers)
/* harmony export */ });
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../debug-build.js */ "./node_modules/@sentry/utils/esm/debug-build.js");
/* harmony import */ var _logger_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../logger.js */ "./node_modules/@sentry/utils/esm/logger.js");
/* harmony import */ var _stacktrace_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../stacktrace.js */ "./node_modules/@sentry/utils/esm/stacktrace.js");




// We keep the handlers globally
const handlers = {};
const instrumented = {};

/** Add a handler function. */
function addHandler(type, handler) {
  handlers[type] = handlers[type] || [];
  (handlers[type] ).push(handler);
}

/**
 * Reset all instrumentation handlers.
 * This can be used by tests to ensure we have a clean slate of instrumentation handlers.
 */
function resetInstrumentationHandlers() {
  Object.keys(handlers).forEach(key => {
    handlers[key ] = undefined;
  });
}

/** Maybe run an instrumentation function, unless it was already called. */
function maybeInstrument(type, instrumentFn) {
  if (!instrumented[type]) {
    instrumentFn();
    instrumented[type] = true;
  }
}

/** Trigger handlers for a given instrumentation type. */
function triggerHandlers(type, data) {
  const typeHandlers = type && handlers[type];
  if (!typeHandlers) {
    return;
  }

  for (const handler of typeHandlers) {
    try {
      handler(data);
    } catch (e) {
      _debug_build_js__WEBPACK_IMPORTED_MODULE_0__.DEBUG_BUILD &&
        _logger_js__WEBPACK_IMPORTED_MODULE_1__.logger.error(
          `Error while triggering instrumentation handler.\nType: ${type}\nName: ${(0,_stacktrace_js__WEBPACK_IMPORTED_MODULE_2__.getFunctionName)(handler)}\nError:`,
          e,
        );
    }
  }
}


//# sourceMappingURL=_handlers.js.map


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/instrument/console.js":
/*!**************************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/instrument/console.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "addConsoleInstrumentationHandler": () => (/* binding */ addConsoleInstrumentationHandler)
/* harmony export */ });
/* harmony import */ var _logger_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../logger.js */ "./node_modules/@sentry/utils/esm/logger.js");
/* harmony import */ var _object_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../object.js */ "./node_modules/@sentry/utils/esm/object.js");
/* harmony import */ var _worldwide_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../worldwide.js */ "./node_modules/@sentry/utils/esm/worldwide.js");
/* harmony import */ var _handlers_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_handlers.js */ "./node_modules/@sentry/utils/esm/instrument/_handlers.js");





/**
 * Add an instrumentation handler for when a console.xxx method is called.
 *
 * Use at your own risk, this might break without changelog notice, only used internally.
 * @hidden
 */
function addConsoleInstrumentationHandler(handler) {
  const type = 'console';
  (0,_handlers_js__WEBPACK_IMPORTED_MODULE_0__.addHandler)(type, handler);
  (0,_handlers_js__WEBPACK_IMPORTED_MODULE_0__.maybeInstrument)(type, instrumentConsole);
}

function instrumentConsole() {
  if (!("console" in _worldwide_js__WEBPACK_IMPORTED_MODULE_1__.GLOBAL_OBJ)) {
    return;
  }

  _logger_js__WEBPACK_IMPORTED_MODULE_2__.CONSOLE_LEVELS.forEach(function (level) {
    if (!(level in _worldwide_js__WEBPACK_IMPORTED_MODULE_1__.GLOBAL_OBJ.console)) {
      return;
    }

    (0,_object_js__WEBPACK_IMPORTED_MODULE_3__.fill)(_worldwide_js__WEBPACK_IMPORTED_MODULE_1__.GLOBAL_OBJ.console, level, function (originalConsoleMethod) {
      _logger_js__WEBPACK_IMPORTED_MODULE_2__.originalConsoleMethods[level] = originalConsoleMethod;

      return function (...args) {
        const handlerData = { args, level };
        (0,_handlers_js__WEBPACK_IMPORTED_MODULE_0__.triggerHandlers)('console', handlerData);

        const log = _logger_js__WEBPACK_IMPORTED_MODULE_2__.originalConsoleMethods[level];
        log && log.apply(_worldwide_js__WEBPACK_IMPORTED_MODULE_1__.GLOBAL_OBJ.console, args);
      };
    });
  });
}


//# sourceMappingURL=console.js.map


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/instrument/dom.js":
/*!**********************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/instrument/dom.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "addClickKeypressInstrumentationHandler": () => (/* binding */ addClickKeypressInstrumentationHandler),
/* harmony export */   "instrumentDOM": () => (/* binding */ instrumentDOM)
/* harmony export */ });
/* harmony import */ var _misc_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../misc.js */ "./node_modules/@sentry/utils/esm/misc.js");
/* harmony import */ var _object_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../object.js */ "./node_modules/@sentry/utils/esm/object.js");
/* harmony import */ var _worldwide_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../worldwide.js */ "./node_modules/@sentry/utils/esm/worldwide.js");
/* harmony import */ var _handlers_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_handlers.js */ "./node_modules/@sentry/utils/esm/instrument/_handlers.js");





const WINDOW = _worldwide_js__WEBPACK_IMPORTED_MODULE_0__.GLOBAL_OBJ ;
const DEBOUNCE_DURATION = 1000;

let debounceTimerID;
let lastCapturedEventType;
let lastCapturedEventTargetId;

/**
 * Add an instrumentation handler for when a click or a keypress happens.
 *
 * Use at your own risk, this might break without changelog notice, only used internally.
 * @hidden
 */
function addClickKeypressInstrumentationHandler(handler) {
  const type = 'dom';
  (0,_handlers_js__WEBPACK_IMPORTED_MODULE_1__.addHandler)(type, handler);
  (0,_handlers_js__WEBPACK_IMPORTED_MODULE_1__.maybeInstrument)(type, instrumentDOM);
}

/** Exported for tests only. */
function instrumentDOM() {
  if (!WINDOW.document) {
    return;
  }

  // Make it so that any click or keypress that is unhandled / bubbled up all the way to the document triggers our dom
  // handlers. (Normally we have only one, which captures a breadcrumb for each click or keypress.) Do this before
  // we instrument `addEventListener` so that we don't end up attaching this handler twice.
  const triggerDOMHandler = _handlers_js__WEBPACK_IMPORTED_MODULE_1__.triggerHandlers.bind(null, 'dom');
  const globalDOMEventHandler = makeDOMEventHandler(triggerDOMHandler, true);
  WINDOW.document.addEventListener('click', globalDOMEventHandler, false);
  WINDOW.document.addEventListener('keypress', globalDOMEventHandler, false);

  // After hooking into click and keypress events bubbled up to `document`, we also hook into user-handled
  // clicks & keypresses, by adding an event listener of our own to any element to which they add a listener. That
  // way, whenever one of their handlers is triggered, ours will be, too. (This is needed because their handler
  // could potentially prevent the event from bubbling up to our global listeners. This way, our handler are still
  // guaranteed to fire at least once.)
  ['EventTarget', 'Node'].forEach((target) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const proto = (WINDOW )[target] && (WINDOW )[target].prototype;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, no-prototype-builtins
    if (!proto || !proto.hasOwnProperty || !proto.hasOwnProperty('addEventListener')) {
      return;
    }

    (0,_object_js__WEBPACK_IMPORTED_MODULE_2__.fill)(proto, 'addEventListener', function (originalAddEventListener) {
      return function (

        type,
        listener,
        options,
      ) {
        if (type === 'click' || type == 'keypress') {
          try {
            const el = this ;
            const handlers = (el.__sentry_instrumentation_handlers__ = el.__sentry_instrumentation_handlers__ || {});
            const handlerForType = (handlers[type] = handlers[type] || { refCount: 0 });

            if (!handlerForType.handler) {
              const handler = makeDOMEventHandler(triggerDOMHandler);
              handlerForType.handler = handler;
              originalAddEventListener.call(this, type, handler, options);
            }

            handlerForType.refCount++;
          } catch (e) {
            // Accessing dom properties is always fragile.
            // Also allows us to skip `addEventListenrs` calls with no proper `this` context.
          }
        }

        return originalAddEventListener.call(this, type, listener, options);
      };
    });

    (0,_object_js__WEBPACK_IMPORTED_MODULE_2__.fill)(
      proto,
      'removeEventListener',
      function (originalRemoveEventListener) {
        return function (

          type,
          listener,
          options,
        ) {
          if (type === 'click' || type == 'keypress') {
            try {
              const el = this ;
              const handlers = el.__sentry_instrumentation_handlers__ || {};
              const handlerForType = handlers[type];

              if (handlerForType) {
                handlerForType.refCount--;
                // If there are no longer any custom handlers of the current type on this element, we can remove ours, too.
                if (handlerForType.refCount <= 0) {
                  originalRemoveEventListener.call(this, type, handlerForType.handler, options);
                  handlerForType.handler = undefined;
                  delete handlers[type]; // eslint-disable-line @typescript-eslint/no-dynamic-delete
                }

                // If there are no longer any custom handlers of any type on this element, cleanup everything.
                if (Object.keys(handlers).length === 0) {
                  delete el.__sentry_instrumentation_handlers__;
                }
              }
            } catch (e) {
              // Accessing dom properties is always fragile.
              // Also allows us to skip `addEventListenrs` calls with no proper `this` context.
            }
          }

          return originalRemoveEventListener.call(this, type, listener, options);
        };
      },
    );
  });
}

/**
 * Check whether the event is similar to the last captured one. For example, two click events on the same button.
 */
function isSimilarToLastCapturedEvent(event) {
  // If both events have different type, then user definitely performed two separate actions. e.g. click + keypress.
  if (event.type !== lastCapturedEventType) {
    return false;
  }

  try {
    // If both events have the same type, it's still possible that actions were performed on different targets.
    // e.g. 2 clicks on different buttons.
    if (!event.target || (event.target )._sentryId !== lastCapturedEventTargetId) {
      return false;
    }
  } catch (e) {
    // just accessing `target` property can throw an exception in some rare circumstances
    // see: https://github.com/getsentry/sentry-javascript/issues/838
  }

  // If both events have the same type _and_ same `target` (an element which triggered an event, _not necessarily_
  // to which an event listener was attached), we treat them as the same action, as we want to capture
  // only one breadcrumb. e.g. multiple clicks on the same button, or typing inside a user input box.
  return true;
}

/**
 * Decide whether an event should be captured.
 * @param event event to be captured
 */
function shouldSkipDOMEvent(eventType, target) {
  // We are only interested in filtering `keypress` events for now.
  if (eventType !== 'keypress') {
    return false;
  }

  if (!target || !target.tagName) {
    return true;
  }

  // Only consider keypress events on actual input elements. This will disregard keypresses targeting body
  // e.g.tabbing through elements, hotkeys, etc.
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
    return false;
  }

  return true;
}

/**
 * Wraps addEventListener to capture UI breadcrumbs
 */
function makeDOMEventHandler(
  handler,
  globalListener = false,
) {
  return (event) => {
    // It's possible this handler might trigger multiple times for the same
    // event (e.g. event propagation through node ancestors).
    // Ignore if we've already captured that event.
    if (!event || event['_sentryCaptured']) {
      return;
    }

    const target = getEventTarget(event);

    // We always want to skip _some_ events.
    if (shouldSkipDOMEvent(event.type, target)) {
      return;
    }

    // Mark event as "seen"
    (0,_object_js__WEBPACK_IMPORTED_MODULE_2__.addNonEnumerableProperty)(event, '_sentryCaptured', true);

    if (target && !target._sentryId) {
      // Add UUID to event target so we can identify if
      (0,_object_js__WEBPACK_IMPORTED_MODULE_2__.addNonEnumerableProperty)(target, '_sentryId', (0,_misc_js__WEBPACK_IMPORTED_MODULE_3__.uuid4)());
    }

    const name = event.type === 'keypress' ? 'input' : event.type;

    // If there is no last captured event, it means that we can safely capture the new event and store it for future comparisons.
    // If there is a last captured event, see if the new event is different enough to treat it as a unique one.
    // If that's the case, emit the previous event and store locally the newly-captured DOM event.
    if (!isSimilarToLastCapturedEvent(event)) {
      const handlerData = { event, name, global: globalListener };
      handler(handlerData);
      lastCapturedEventType = event.type;
      lastCapturedEventTargetId = target ? target._sentryId : undefined;
    }

    // Start a new debounce timer that will prevent us from capturing multiple events that should be grouped together.
    clearTimeout(debounceTimerID);
    debounceTimerID = WINDOW.setTimeout(() => {
      lastCapturedEventTargetId = undefined;
      lastCapturedEventType = undefined;
    }, DEBOUNCE_DURATION);
  };
}

function getEventTarget(event) {
  try {
    return event.target ;
  } catch (e) {
    // just accessing `target` property can throw an exception in some rare circumstances
    // see: https://github.com/getsentry/sentry-javascript/issues/838
    return null;
  }
}


//# sourceMappingURL=dom.js.map


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/instrument/fetch.js":
/*!************************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/instrument/fetch.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "addFetchInstrumentationHandler": () => (/* binding */ addFetchInstrumentationHandler),
/* harmony export */   "parseFetchArgs": () => (/* binding */ parseFetchArgs)
/* harmony export */ });
/* harmony import */ var _object_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../object.js */ "./node_modules/@sentry/utils/esm/object.js");
/* harmony import */ var _supports_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../supports.js */ "./node_modules/@sentry/utils/esm/supports.js");
/* harmony import */ var _worldwide_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../worldwide.js */ "./node_modules/@sentry/utils/esm/worldwide.js");
/* harmony import */ var _handlers_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_handlers.js */ "./node_modules/@sentry/utils/esm/instrument/_handlers.js");





/**
 * Add an instrumentation handler for when a fetch request happens.
 * The handler function is called once when the request starts and once when it ends,
 * which can be identified by checking if it has an `endTimestamp`.
 *
 * Use at your own risk, this might break without changelog notice, only used internally.
 * @hidden
 */
function addFetchInstrumentationHandler(handler) {
  const type = 'fetch';
  (0,_handlers_js__WEBPACK_IMPORTED_MODULE_0__.addHandler)(type, handler);
  (0,_handlers_js__WEBPACK_IMPORTED_MODULE_0__.maybeInstrument)(type, instrumentFetch);
}

function instrumentFetch() {
  if (!(0,_supports_js__WEBPACK_IMPORTED_MODULE_1__.supportsNativeFetch)()) {
    return;
  }

  (0,_object_js__WEBPACK_IMPORTED_MODULE_2__.fill)(_worldwide_js__WEBPACK_IMPORTED_MODULE_3__.GLOBAL_OBJ, 'fetch', function (originalFetch) {
    return function (...args) {
      const { method, url } = parseFetchArgs(args);

      const handlerData = {
        args,
        fetchData: {
          method,
          url,
        },
        startTimestamp: Date.now(),
      };

      (0,_handlers_js__WEBPACK_IMPORTED_MODULE_0__.triggerHandlers)('fetch', {
        ...handlerData,
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return originalFetch.apply(_worldwide_js__WEBPACK_IMPORTED_MODULE_3__.GLOBAL_OBJ, args).then(
        (response) => {
          const finishedHandlerData = {
            ...handlerData,
            endTimestamp: Date.now(),
            response,
          };

          (0,_handlers_js__WEBPACK_IMPORTED_MODULE_0__.triggerHandlers)('fetch', finishedHandlerData);
          return response;
        },
        (error) => {
          const erroredHandlerData = {
            ...handlerData,
            endTimestamp: Date.now(),
            error,
          };

          (0,_handlers_js__WEBPACK_IMPORTED_MODULE_0__.triggerHandlers)('fetch', erroredHandlerData);
          // NOTE: If you are a Sentry user, and you are seeing this stack frame,
          //       it means the sentry.javascript SDK caught an error invoking your application code.
          //       This is expected behavior and NOT indicative of a bug with sentry.javascript.
          throw error;
        },
      );
    };
  });
}

function hasProp(obj, prop) {
  return !!obj && typeof obj === 'object' && !!(obj )[prop];
}

function getUrlFromResource(resource) {
  if (typeof resource === 'string') {
    return resource;
  }

  if (!resource) {
    return '';
  }

  if (hasProp(resource, 'url')) {
    return resource.url;
  }

  if (resource.toString) {
    return resource.toString();
  }

  return '';
}

/**
 * Parses the fetch arguments to find the used Http method and the url of the request.
 * Exported for tests only.
 */
function parseFetchArgs(fetchArgs) {
  if (fetchArgs.length === 0) {
    return { method: 'GET', url: '' };
  }

  if (fetchArgs.length === 2) {
    const [url, options] = fetchArgs ;

    return {
      url: getUrlFromResource(url),
      method: hasProp(options, 'method') ? String(options.method).toUpperCase() : 'GET',
    };
  }

  const arg = fetchArgs[0];
  return {
    url: getUrlFromResource(arg ),
    method: hasProp(arg, 'method') ? String(arg.method).toUpperCase() : 'GET',
  };
}


//# sourceMappingURL=fetch.js.map


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/instrument/globalError.js":
/*!******************************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/instrument/globalError.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "addGlobalErrorInstrumentationHandler": () => (/* binding */ addGlobalErrorInstrumentationHandler)
/* harmony export */ });
/* harmony import */ var _worldwide_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../worldwide.js */ "./node_modules/@sentry/utils/esm/worldwide.js");
/* harmony import */ var _handlers_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_handlers.js */ "./node_modules/@sentry/utils/esm/instrument/_handlers.js");



let _oldOnErrorHandler = null;

/**
 * Add an instrumentation handler for when an error is captured by the global error handler.
 *
 * Use at your own risk, this might break without changelog notice, only used internally.
 * @hidden
 */
function addGlobalErrorInstrumentationHandler(handler) {
  const type = 'error';
  (0,_handlers_js__WEBPACK_IMPORTED_MODULE_0__.addHandler)(type, handler);
  (0,_handlers_js__WEBPACK_IMPORTED_MODULE_0__.maybeInstrument)(type, instrumentError);
}

function instrumentError() {
  _oldOnErrorHandler = _worldwide_js__WEBPACK_IMPORTED_MODULE_1__.GLOBAL_OBJ.onerror;

  _worldwide_js__WEBPACK_IMPORTED_MODULE_1__.GLOBAL_OBJ.onerror = function (
    msg,
    url,
    line,
    column,
    error,
  ) {
    const handlerData = {
      column,
      error,
      line,
      msg,
      url,
    };
    (0,_handlers_js__WEBPACK_IMPORTED_MODULE_0__.triggerHandlers)('error', handlerData);

    if (_oldOnErrorHandler && !_oldOnErrorHandler.__SENTRY_LOADER__) {
      // eslint-disable-next-line prefer-rest-params
      return _oldOnErrorHandler.apply(this, arguments);
    }

    return false;
  };

  _worldwide_js__WEBPACK_IMPORTED_MODULE_1__.GLOBAL_OBJ.onerror.__SENTRY_INSTRUMENTED__ = true;
}


//# sourceMappingURL=globalError.js.map


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/instrument/globalUnhandledRejection.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/instrument/globalUnhandledRejection.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "addGlobalUnhandledRejectionInstrumentationHandler": () => (/* binding */ addGlobalUnhandledRejectionInstrumentationHandler)
/* harmony export */ });
/* harmony import */ var _worldwide_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../worldwide.js */ "./node_modules/@sentry/utils/esm/worldwide.js");
/* harmony import */ var _handlers_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_handlers.js */ "./node_modules/@sentry/utils/esm/instrument/_handlers.js");



let _oldOnUnhandledRejectionHandler = null;

/**
 * Add an instrumentation handler for when an unhandled promise rejection is captured.
 *
 * Use at your own risk, this might break without changelog notice, only used internally.
 * @hidden
 */
function addGlobalUnhandledRejectionInstrumentationHandler(
  handler,
) {
  const type = 'unhandledrejection';
  (0,_handlers_js__WEBPACK_IMPORTED_MODULE_0__.addHandler)(type, handler);
  (0,_handlers_js__WEBPACK_IMPORTED_MODULE_0__.maybeInstrument)(type, instrumentUnhandledRejection);
}

function instrumentUnhandledRejection() {
  _oldOnUnhandledRejectionHandler = _worldwide_js__WEBPACK_IMPORTED_MODULE_1__.GLOBAL_OBJ.onunhandledrejection;

  _worldwide_js__WEBPACK_IMPORTED_MODULE_1__.GLOBAL_OBJ.onunhandledrejection = function (e) {
    const handlerData = e;
    (0,_handlers_js__WEBPACK_IMPORTED_MODULE_0__.triggerHandlers)('unhandledrejection', handlerData);

    if (_oldOnUnhandledRejectionHandler && !_oldOnUnhandledRejectionHandler.__SENTRY_LOADER__) {
      // eslint-disable-next-line prefer-rest-params
      return _oldOnUnhandledRejectionHandler.apply(this, arguments);
    }

    return true;
  };

  _worldwide_js__WEBPACK_IMPORTED_MODULE_1__.GLOBAL_OBJ.onunhandledrejection.__SENTRY_INSTRUMENTED__ = true;
}


//# sourceMappingURL=globalUnhandledRejection.js.map


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/instrument/history.js":
/*!**************************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/instrument/history.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "addHistoryInstrumentationHandler": () => (/* binding */ addHistoryInstrumentationHandler)
/* harmony export */ });
/* harmony import */ var _object_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../object.js */ "./node_modules/@sentry/utils/esm/object.js");
/* harmony import */ var _worldwide_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../worldwide.js */ "./node_modules/@sentry/utils/esm/worldwide.js");
/* harmony import */ var _vendor_supportsHistory_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../vendor/supportsHistory.js */ "./node_modules/@sentry/utils/esm/vendor/supportsHistory.js");
/* harmony import */ var _handlers_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_handlers.js */ "./node_modules/@sentry/utils/esm/instrument/_handlers.js");







const WINDOW = _worldwide_js__WEBPACK_IMPORTED_MODULE_0__.GLOBAL_OBJ ;

let lastHref;

/**
 * Add an instrumentation handler for when a fetch request happens.
 * The handler function is called once when the request starts and once when it ends,
 * which can be identified by checking if it has an `endTimestamp`.
 *
 * Use at your own risk, this might break without changelog notice, only used internally.
 * @hidden
 */
function addHistoryInstrumentationHandler(handler) {
  const type = 'history';
  (0,_handlers_js__WEBPACK_IMPORTED_MODULE_1__.addHandler)(type, handler);
  (0,_handlers_js__WEBPACK_IMPORTED_MODULE_1__.maybeInstrument)(type, instrumentHistory);
}

function instrumentHistory() {
  if (!(0,_vendor_supportsHistory_js__WEBPACK_IMPORTED_MODULE_2__.supportsHistory)()) {
    return;
  }

  const oldOnPopState = WINDOW.onpopstate;
  WINDOW.onpopstate = function ( ...args) {
    const to = WINDOW.location.href;
    // keep track of the current URL state, as we always receive only the updated state
    const from = lastHref;
    lastHref = to;
    const handlerData = { from, to };
    (0,_handlers_js__WEBPACK_IMPORTED_MODULE_1__.triggerHandlers)('history', handlerData);
    if (oldOnPopState) {
      // Apparently this can throw in Firefox when incorrectly implemented plugin is installed.
      // https://github.com/getsentry/sentry-javascript/issues/3344
      // https://github.com/bugsnag/bugsnag-js/issues/469
      try {
        return oldOnPopState.apply(this, args);
      } catch (_oO) {
        // no-empty
      }
    }
  };

  function historyReplacementFunction(originalHistoryFunction) {
    return function ( ...args) {
      const url = args.length > 2 ? args[2] : undefined;
      if (url) {
        // coerce to string (this is what pushState does)
        const from = lastHref;
        const to = String(url);
        // keep track of the current URL state, as we always receive only the updated state
        lastHref = to;
        const handlerData = { from, to };
        (0,_handlers_js__WEBPACK_IMPORTED_MODULE_1__.triggerHandlers)('history', handlerData);
      }
      return originalHistoryFunction.apply(this, args);
    };
  }

  (0,_object_js__WEBPACK_IMPORTED_MODULE_3__.fill)(WINDOW.history, 'pushState', historyReplacementFunction);
  (0,_object_js__WEBPACK_IMPORTED_MODULE_3__.fill)(WINDOW.history, 'replaceState', historyReplacementFunction);
}


//# sourceMappingURL=history.js.map


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/instrument/xhr.js":
/*!**********************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/instrument/xhr.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SENTRY_XHR_DATA_KEY": () => (/* binding */ SENTRY_XHR_DATA_KEY),
/* harmony export */   "addXhrInstrumentationHandler": () => (/* binding */ addXhrInstrumentationHandler),
/* harmony export */   "instrumentXHR": () => (/* binding */ instrumentXHR)
/* harmony export */ });
/* harmony import */ var _is_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../is.js */ "./node_modules/@sentry/utils/esm/is.js");
/* harmony import */ var _object_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../object.js */ "./node_modules/@sentry/utils/esm/object.js");
/* harmony import */ var _worldwide_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../worldwide.js */ "./node_modules/@sentry/utils/esm/worldwide.js");
/* harmony import */ var _handlers_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_handlers.js */ "./node_modules/@sentry/utils/esm/instrument/_handlers.js");





const WINDOW = _worldwide_js__WEBPACK_IMPORTED_MODULE_0__.GLOBAL_OBJ ;

const SENTRY_XHR_DATA_KEY = '__sentry_xhr_v3__';

/**
 * Add an instrumentation handler for when an XHR request happens.
 * The handler function is called once when the request starts and once when it ends,
 * which can be identified by checking if it has an `endTimestamp`.
 *
 * Use at your own risk, this might break without changelog notice, only used internally.
 * @hidden
 */
function addXhrInstrumentationHandler(handler) {
  const type = 'xhr';
  (0,_handlers_js__WEBPACK_IMPORTED_MODULE_1__.addHandler)(type, handler);
  (0,_handlers_js__WEBPACK_IMPORTED_MODULE_1__.maybeInstrument)(type, instrumentXHR);
}

/** Exported only for tests. */
function instrumentXHR() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (!(WINDOW ).XMLHttpRequest) {
    return;
  }

  const xhrproto = XMLHttpRequest.prototype;

  (0,_object_js__WEBPACK_IMPORTED_MODULE_2__.fill)(xhrproto, 'open', function (originalOpen) {
    return function ( ...args) {
      const startTimestamp = Date.now();

      // open() should always be called with two or more arguments
      // But to be on the safe side, we actually validate this and bail out if we don't have a method & url
      const method = (0,_is_js__WEBPACK_IMPORTED_MODULE_3__.isString)(args[0]) ? args[0].toUpperCase() : undefined;
      const url = parseUrl(args[1]);

      if (!method || !url) {
        return originalOpen.apply(this, args);
      }

      this[SENTRY_XHR_DATA_KEY] = {
        method,
        url,
        request_headers: {},
      };

      // if Sentry key appears in URL, don't capture it as a request
      if (method === 'POST' && url.match(/sentry_key/)) {
        this.__sentry_own_request__ = true;
      }

      const onreadystatechangeHandler = () => {
        // For whatever reason, this is not the same instance here as from the outer method
        const xhrInfo = this[SENTRY_XHR_DATA_KEY];

        if (!xhrInfo) {
          return;
        }

        if (this.readyState === 4) {
          try {
            // touching statusCode in some platforms throws
            // an exception
            xhrInfo.status_code = this.status;
          } catch (e) {
            /* do nothing */
          }

          const handlerData = {
            args: [method, url],
            endTimestamp: Date.now(),
            startTimestamp,
            xhr: this,
          };
          (0,_handlers_js__WEBPACK_IMPORTED_MODULE_1__.triggerHandlers)('xhr', handlerData);
        }
      };

      if ('onreadystatechange' in this && typeof this.onreadystatechange === 'function') {
        (0,_object_js__WEBPACK_IMPORTED_MODULE_2__.fill)(this, 'onreadystatechange', function (original) {
          return function ( ...readyStateArgs) {
            onreadystatechangeHandler();
            return original.apply(this, readyStateArgs);
          };
        });
      } else {
        this.addEventListener('readystatechange', onreadystatechangeHandler);
      }

      // Intercepting `setRequestHeader` to access the request headers of XHR instance.
      // This will only work for user/library defined headers, not for the default/browser-assigned headers.
      // Request cookies are also unavailable for XHR, as `Cookie` header can't be defined by `setRequestHeader`.
      (0,_object_js__WEBPACK_IMPORTED_MODULE_2__.fill)(this, 'setRequestHeader', function (original) {
        return function ( ...setRequestHeaderArgs) {
          const [header, value] = setRequestHeaderArgs;

          const xhrInfo = this[SENTRY_XHR_DATA_KEY];

          if (xhrInfo && (0,_is_js__WEBPACK_IMPORTED_MODULE_3__.isString)(header) && (0,_is_js__WEBPACK_IMPORTED_MODULE_3__.isString)(value)) {
            xhrInfo.request_headers[header.toLowerCase()] = value;
          }

          return original.apply(this, setRequestHeaderArgs);
        };
      });

      return originalOpen.apply(this, args);
    };
  });

  (0,_object_js__WEBPACK_IMPORTED_MODULE_2__.fill)(xhrproto, 'send', function (originalSend) {
    return function ( ...args) {
      const sentryXhrData = this[SENTRY_XHR_DATA_KEY];

      if (!sentryXhrData) {
        return originalSend.apply(this, args);
      }

      if (args[0] !== undefined) {
        sentryXhrData.body = args[0];
      }

      const handlerData = {
        args: [sentryXhrData.method, sentryXhrData.url],
        startTimestamp: Date.now(),
        xhr: this,
      };
      (0,_handlers_js__WEBPACK_IMPORTED_MODULE_1__.triggerHandlers)('xhr', handlerData);

      return originalSend.apply(this, args);
    };
  });
}

function parseUrl(url) {
  if ((0,_is_js__WEBPACK_IMPORTED_MODULE_3__.isString)(url)) {
    return url;
  }

  try {
    // url can be a string or URL
    // but since URL is not available in IE11, we do not check for it,
    // but simply assume it is an URL and return `toString()` from it (which returns the full URL)
    // If that fails, we just return undefined
    return (url ).toString();
  } catch (e2) {} // eslint-disable-line no-empty

  return undefined;
}


//# sourceMappingURL=xhr.js.map


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/is.js":
/*!**********************************************!*\
  !*** ./node_modules/@sentry/utils/esm/is.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isDOMError": () => (/* binding */ isDOMError),
/* harmony export */   "isDOMException": () => (/* binding */ isDOMException),
/* harmony export */   "isElement": () => (/* binding */ isElement),
/* harmony export */   "isError": () => (/* binding */ isError),
/* harmony export */   "isErrorEvent": () => (/* binding */ isErrorEvent),
/* harmony export */   "isEvent": () => (/* binding */ isEvent),
/* harmony export */   "isInstanceOf": () => (/* binding */ isInstanceOf),
/* harmony export */   "isNaN": () => (/* binding */ isNaN),
/* harmony export */   "isPlainObject": () => (/* binding */ isPlainObject),
/* harmony export */   "isPrimitive": () => (/* binding */ isPrimitive),
/* harmony export */   "isRegExp": () => (/* binding */ isRegExp),
/* harmony export */   "isString": () => (/* binding */ isString),
/* harmony export */   "isSyntheticEvent": () => (/* binding */ isSyntheticEvent),
/* harmony export */   "isThenable": () => (/* binding */ isThenable),
/* harmony export */   "isVueViewModel": () => (/* binding */ isVueViewModel)
/* harmony export */ });
// eslint-disable-next-line @typescript-eslint/unbound-method
const objectToString = Object.prototype.toString;

/**
 * Checks whether given value's type is one of a few Error or Error-like
 * {@link isError}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isError(wat) {
  switch (objectToString.call(wat)) {
    case '[object Error]':
    case '[object Exception]':
    case '[object DOMException]':
      return true;
    default:
      return isInstanceOf(wat, Error);
  }
}
/**
 * Checks whether given value is an instance of the given built-in class.
 *
 * @param wat The value to be checked
 * @param className
 * @returns A boolean representing the result.
 */
function isBuiltin(wat, className) {
  return objectToString.call(wat) === `[object ${className}]`;
}

/**
 * Checks whether given value's type is ErrorEvent
 * {@link isErrorEvent}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isErrorEvent(wat) {
  return isBuiltin(wat, 'ErrorEvent');
}

/**
 * Checks whether given value's type is DOMError
 * {@link isDOMError}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isDOMError(wat) {
  return isBuiltin(wat, 'DOMError');
}

/**
 * Checks whether given value's type is DOMException
 * {@link isDOMException}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isDOMException(wat) {
  return isBuiltin(wat, 'DOMException');
}

/**
 * Checks whether given value's type is a string
 * {@link isString}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isString(wat) {
  return isBuiltin(wat, 'String');
}

/**
 * Checks whether given value is a primitive (undefined, null, number, boolean, string, bigint, symbol)
 * {@link isPrimitive}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isPrimitive(wat) {
  return wat === null || (typeof wat !== 'object' && typeof wat !== 'function');
}

/**
 * Checks whether given value's type is an object literal
 * {@link isPlainObject}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isPlainObject(wat) {
  return isBuiltin(wat, 'Object');
}

/**
 * Checks whether given value's type is an Event instance
 * {@link isEvent}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isEvent(wat) {
  return typeof Event !== 'undefined' && isInstanceOf(wat, Event);
}

/**
 * Checks whether given value's type is an Element instance
 * {@link isElement}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isElement(wat) {
  return typeof Element !== 'undefined' && isInstanceOf(wat, Element);
}

/**
 * Checks whether given value's type is an regexp
 * {@link isRegExp}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isRegExp(wat) {
  return isBuiltin(wat, 'RegExp');
}

/**
 * Checks whether given value has a then function.
 * @param wat A value to be checked.
 */
function isThenable(wat) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return Boolean(wat && wat.then && typeof wat.then === 'function');
}

/**
 * Checks whether given value's type is a SyntheticEvent
 * {@link isSyntheticEvent}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isSyntheticEvent(wat) {
  return isPlainObject(wat) && 'nativeEvent' in wat && 'preventDefault' in wat && 'stopPropagation' in wat;
}

/**
 * Checks whether given value is NaN
 * {@link isNaN}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isNaN(wat) {
  return typeof wat === 'number' && wat !== wat;
}

/**
 * Checks whether given value's type is an instance of provided constructor.
 * {@link isInstanceOf}.
 *
 * @param wat A value to be checked.
 * @param base A constructor to be used in a check.
 * @returns A boolean representing the result.
 */
function isInstanceOf(wat, base) {
  try {
    return wat instanceof base;
  } catch (_e) {
    return false;
  }
}

/**
 * Checks whether given value's type is a Vue ViewModel.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isVueViewModel(wat) {
  // Not using Object.prototype.toString because in Vue 3 it would read the instance's Symbol(Symbol.toStringTag) property.
  return !!(typeof wat === 'object' && wat !== null && ((wat ).__isVue || (wat )._isVue));
}


//# sourceMappingURL=is.js.map


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/isBrowser.js":
/*!*****************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/isBrowser.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isBrowser": () => (/* binding */ isBrowser)
/* harmony export */ });
/* harmony import */ var _node_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./node.js */ "./node_modules/@sentry/utils/esm/node.js");
/* harmony import */ var _worldwide_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./worldwide.js */ "./node_modules/@sentry/utils/esm/worldwide.js");



/**
 * Returns true if we are in the browser.
 */
function isBrowser() {
  // eslint-disable-next-line no-restricted-globals
  return typeof window !== 'undefined' && (!(0,_node_js__WEBPACK_IMPORTED_MODULE_0__.isNodeEnv)() || isElectronNodeRenderer());
}

// Electron renderers with nodeIntegration enabled are detected as Node.js so we specifically test for them
function isElectronNodeRenderer() {
  return (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    _worldwide_js__WEBPACK_IMPORTED_MODULE_1__.GLOBAL_OBJ.process !== undefined && _worldwide_js__WEBPACK_IMPORTED_MODULE_1__.GLOBAL_OBJ.process.type === 'renderer'
  );
}


//# sourceMappingURL=isBrowser.js.map


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/logger.js":
/*!**************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/logger.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CONSOLE_LEVELS": () => (/* binding */ CONSOLE_LEVELS),
/* harmony export */   "consoleSandbox": () => (/* binding */ consoleSandbox),
/* harmony export */   "logger": () => (/* binding */ logger),
/* harmony export */   "originalConsoleMethods": () => (/* binding */ originalConsoleMethods)
/* harmony export */ });
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./debug-build.js */ "./node_modules/@sentry/utils/esm/debug-build.js");
/* harmony import */ var _worldwide_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./worldwide.js */ "./node_modules/@sentry/utils/esm/worldwide.js");



/** Prefix for logging strings */
const PREFIX = 'Sentry Logger ';

const CONSOLE_LEVELS = [
  'debug',
  'info',
  'warn',
  'error',
  'log',
  'assert',
  'trace',
] ;

/** This may be mutated by the console instrumentation. */
const originalConsoleMethods

 = {};

/** JSDoc */

/**
 * Temporarily disable sentry console instrumentations.
 *
 * @param callback The function to run against the original `console` messages
 * @returns The results of the callback
 */
function consoleSandbox(callback) {
  if (!("console" in _worldwide_js__WEBPACK_IMPORTED_MODULE_0__.GLOBAL_OBJ)) {
    return callback();
  }

  const console = _worldwide_js__WEBPACK_IMPORTED_MODULE_0__.GLOBAL_OBJ.console ;
  const wrappedFuncs = {};

  const wrappedLevels = Object.keys(originalConsoleMethods) ;

  // Restore all wrapped console methods
  wrappedLevels.forEach(level => {
    const originalConsoleMethod = originalConsoleMethods[level] ;
    wrappedFuncs[level] = console[level] ;
    console[level] = originalConsoleMethod;
  });

  try {
    return callback();
  } finally {
    // Revert restoration to wrapped state
    wrappedLevels.forEach(level => {
      console[level] = wrappedFuncs[level] ;
    });
  }
}

function makeLogger() {
  let enabled = false;
  const logger = {
    enable: () => {
      enabled = true;
    },
    disable: () => {
      enabled = false;
    },
    isEnabled: () => enabled,
  };

  if (_debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD) {
    CONSOLE_LEVELS.forEach(name => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      logger[name] = (...args) => {
        if (enabled) {
          consoleSandbox(() => {
            _worldwide_js__WEBPACK_IMPORTED_MODULE_0__.GLOBAL_OBJ.console[name](`${PREFIX}[${name}]:`, ...args);
          });
        }
      };
    });
  } else {
    CONSOLE_LEVELS.forEach(name => {
      logger[name] = () => undefined;
    });
  }

  return logger ;
}

const logger = makeLogger();


//# sourceMappingURL=logger.js.map


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/memo.js":
/*!************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/memo.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "memoBuilder": () => (/* binding */ memoBuilder)
/* harmony export */ });
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Helper to decycle json objects
 */
function memoBuilder() {
  const hasWeakSet = typeof WeakSet === 'function';
  const inner = hasWeakSet ? new WeakSet() : [];
  function memoize(obj) {
    if (hasWeakSet) {
      if (inner.has(obj)) {
        return true;
      }
      inner.add(obj);
      return false;
    }
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < inner.length; i++) {
      const value = inner[i];
      if (value === obj) {
        return true;
      }
    }
    inner.push(obj);
    return false;
  }

  function unmemoize(obj) {
    if (hasWeakSet) {
      inner.delete(obj);
    } else {
      for (let i = 0; i < inner.length; i++) {
        if (inner[i] === obj) {
          inner.splice(i, 1);
          break;
        }
      }
    }
  }
  return [memoize, unmemoize];
}


//# sourceMappingURL=memo.js.map


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/misc.js":
/*!************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/misc.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "addContextToFrame": () => (/* binding */ addContextToFrame),
/* harmony export */   "addExceptionMechanism": () => (/* binding */ addExceptionMechanism),
/* harmony export */   "addExceptionTypeValue": () => (/* binding */ addExceptionTypeValue),
/* harmony export */   "arrayify": () => (/* binding */ arrayify),
/* harmony export */   "checkOrSetAlreadyCaught": () => (/* binding */ checkOrSetAlreadyCaught),
/* harmony export */   "getEventDescription": () => (/* binding */ getEventDescription),
/* harmony export */   "parseSemver": () => (/* binding */ parseSemver),
/* harmony export */   "uuid4": () => (/* binding */ uuid4)
/* harmony export */ });
/* harmony import */ var _object_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./object.js */ "./node_modules/@sentry/utils/esm/object.js");
/* harmony import */ var _string_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./string.js */ "./node_modules/@sentry/utils/esm/string.js");
/* harmony import */ var _worldwide_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./worldwide.js */ "./node_modules/@sentry/utils/esm/worldwide.js");




/**
 * UUID4 generator
 *
 * @returns string Generated UUID4.
 */
function uuid4() {
  const gbl = _worldwide_js__WEBPACK_IMPORTED_MODULE_0__.GLOBAL_OBJ ;
  const crypto = gbl.crypto || gbl.msCrypto;

  let getRandomByte = () => Math.random() * 16;
  try {
    if (crypto && crypto.randomUUID) {
      return crypto.randomUUID().replace(/-/g, '');
    }
    if (crypto && crypto.getRandomValues) {
      getRandomByte = () => {
        // crypto.getRandomValues might return undefined instead of the typed array
        // in old Chromium versions (e.g. 23.0.1235.0 (151422))
        // However, `typedArray` is still filled in-place.
        // @see https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues#typedarray
        const typedArray = new Uint8Array(1);
        crypto.getRandomValues(typedArray);
        return typedArray[0];
      };
    }
  } catch (_) {
    // some runtimes can crash invoking crypto
    // https://github.com/getsentry/sentry-javascript/issues/8935
  }

  // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/2117523#2117523
  // Concatenating the following numbers as strings results in '10000000100040008000100000000000'
  return (([1e7] ) + 1e3 + 4e3 + 8e3 + 1e11).replace(/[018]/g, c =>
    // eslint-disable-next-line no-bitwise
    ((c ) ^ ((getRandomByte() & 15) >> ((c ) / 4))).toString(16),
  );
}

function getFirstException(event) {
  return event.exception && event.exception.values ? event.exception.values[0] : undefined;
}

/**
 * Extracts either message or type+value from an event that can be used for user-facing logs
 * @returns event's description
 */
function getEventDescription(event) {
  const { message, event_id: eventId } = event;
  if (message) {
    return message;
  }

  const firstException = getFirstException(event);
  if (firstException) {
    if (firstException.type && firstException.value) {
      return `${firstException.type}: ${firstException.value}`;
    }
    return firstException.type || firstException.value || eventId || '<unknown>';
  }
  return eventId || '<unknown>';
}

/**
 * Adds exception values, type and value to an synthetic Exception.
 * @param event The event to modify.
 * @param value Value of the exception.
 * @param type Type of the exception.
 * @hidden
 */
function addExceptionTypeValue(event, value, type) {
  const exception = (event.exception = event.exception || {});
  const values = (exception.values = exception.values || []);
  const firstException = (values[0] = values[0] || {});
  if (!firstException.value) {
    firstException.value = value || '';
  }
  if (!firstException.type) {
    firstException.type = type || 'Error';
  }
}

/**
 * Adds exception mechanism data to a given event. Uses defaults if the second parameter is not passed.
 *
 * @param event The event to modify.
 * @param newMechanism Mechanism data to add to the event.
 * @hidden
 */
function addExceptionMechanism(event, newMechanism) {
  const firstException = getFirstException(event);
  if (!firstException) {
    return;
  }

  const defaultMechanism = { type: 'generic', handled: true };
  const currentMechanism = firstException.mechanism;
  firstException.mechanism = { ...defaultMechanism, ...currentMechanism, ...newMechanism };

  if (newMechanism && 'data' in newMechanism) {
    const mergedData = { ...(currentMechanism && currentMechanism.data), ...newMechanism.data };
    firstException.mechanism.data = mergedData;
  }
}

// https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
const SEMVER_REGEXP =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

/**
 * Represents Semantic Versioning object
 */

/**
 * Parses input into a SemVer interface
 * @param input string representation of a semver version
 */
function parseSemver(input) {
  const match = input.match(SEMVER_REGEXP) || [];
  const major = parseInt(match[1], 10);
  const minor = parseInt(match[2], 10);
  const patch = parseInt(match[3], 10);
  return {
    buildmetadata: match[5],
    major: isNaN(major) ? undefined : major,
    minor: isNaN(minor) ? undefined : minor,
    patch: isNaN(patch) ? undefined : patch,
    prerelease: match[4],
  };
}

/**
 * This function adds context (pre/post/line) lines to the provided frame
 *
 * @param lines string[] containing all lines
 * @param frame StackFrame that will be mutated
 * @param linesOfContext number of context lines we want to add pre/post
 */
function addContextToFrame(lines, frame, linesOfContext = 5) {
  // When there is no line number in the frame, attaching context is nonsensical and will even break grouping
  if (frame.lineno === undefined) {
    return;
  }

  const maxLines = lines.length;
  const sourceLine = Math.max(Math.min(maxLines - 1, frame.lineno - 1), 0);

  frame.pre_context = lines
    .slice(Math.max(0, sourceLine - linesOfContext), sourceLine)
    .map((line) => (0,_string_js__WEBPACK_IMPORTED_MODULE_1__.snipLine)(line, 0));

  frame.context_line = (0,_string_js__WEBPACK_IMPORTED_MODULE_1__.snipLine)(lines[Math.min(maxLines - 1, sourceLine)], frame.colno || 0);

  frame.post_context = lines
    .slice(Math.min(sourceLine + 1, maxLines), sourceLine + 1 + linesOfContext)
    .map((line) => (0,_string_js__WEBPACK_IMPORTED_MODULE_1__.snipLine)(line, 0));
}

/**
 * Checks whether or not we've already captured the given exception (note: not an identical exception - the very object
 * in question), and marks it captured if not.
 *
 * This is useful because it's possible for an error to get captured by more than one mechanism. After we intercept and
 * record an error, we rethrow it (assuming we've intercepted it before it's reached the top-level global handlers), so
 * that we don't interfere with whatever effects the error might have had were the SDK not there. At that point, because
 * the error has been rethrown, it's possible for it to bubble up to some other code we've instrumented. If it's not
 * caught after that, it will bubble all the way up to the global handlers (which of course we also instrument). This
 * function helps us ensure that even if we encounter the same error more than once, we only record it the first time we
 * see it.
 *
 * Note: It will ignore primitives (always return `false` and not mark them as seen), as properties can't be set on
 * them. {@link: Object.objectify} can be used on exceptions to convert any that are primitives into their equivalent
 * object wrapper forms so that this check will always work. However, because we need to flag the exact object which
 * will get rethrown, and because that rethrowing happens outside of the event processing pipeline, the objectification
 * must be done before the exception captured.
 *
 * @param A thrown exception to check or flag as having been seen
 * @returns `true` if the exception has already been captured, `false` if not (with the side effect of marking it seen)
 */
function checkOrSetAlreadyCaught(exception) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (exception && (exception ).__sentry_captured__) {
    return true;
  }

  try {
    // set it this way rather than by assignment so that it's not ennumerable and therefore isn't recorded by the
    // `ExtraErrorData` integration
    (0,_object_js__WEBPACK_IMPORTED_MODULE_2__.addNonEnumerableProperty)(exception , '__sentry_captured__', true);
  } catch (err) {
    // `exception` is a primitive, so we can't mark it seen
  }

  return false;
}

/**
 * Checks whether the given input is already an array, and if it isn't, wraps it in one.
 *
 * @param maybeArray Input to turn into an array, if necessary
 * @returns The input, if already an array, or an array with the input as the only element, if not
 */
function arrayify(maybeArray) {
  return Array.isArray(maybeArray) ? maybeArray : [maybeArray];
}


//# sourceMappingURL=misc.js.map


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/node-stack-trace.js":
/*!************************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/node-stack-trace.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "filenameIsInApp": () => (/* binding */ filenameIsInApp),
/* harmony export */   "node": () => (/* binding */ node)
/* harmony export */ });
/**
 * Does this filename look like it's part of the app code?
 */
function filenameIsInApp(filename, isNative = false) {
  const isInternal =
    isNative ||
    (filename &&
      // It's not internal if it's an absolute linux path
      !filename.startsWith('/') &&
      // It's not internal if it's an absolute windows path
      !filename.includes(':\\') &&
      // It's not internal if the path is starting with a dot
      !filename.startsWith('.') &&
      // It's not internal if the frame has a protocol. In node, this is usually the case if the file got pre-processed with a bundler like webpack
      !filename.match(/^[a-zA-Z]([a-zA-Z0-9.\-+])*:\/\//)); // Schema from: https://stackoverflow.com/a/3641782

  // in_app is all that's not an internal Node function or a module within node_modules
  // note that isNative appears to return true even for node core libraries
  // see https://github.com/getsentry/raven-node/issues/176

  return !isInternal && filename !== undefined && !filename.includes('node_modules/');
}

/** Node Stack line parser */
// eslint-disable-next-line complexity
function node(getModule) {
  const FILENAME_MATCH = /^\s*[-]{4,}$/;
  const FULL_MATCH = /at (?:async )?(?:(.+?)\s+\()?(?:(.+):(\d+):(\d+)?|([^)]+))\)?/;

  // eslint-disable-next-line complexity
  return (line) => {
    const lineMatch = line.match(FULL_MATCH);

    if (lineMatch) {
      let object;
      let method;
      let functionName;
      let typeName;
      let methodName;

      if (lineMatch[1]) {
        functionName = lineMatch[1];

        let methodStart = functionName.lastIndexOf('.');
        if (functionName[methodStart - 1] === '.') {
          methodStart--;
        }

        if (methodStart > 0) {
          object = functionName.slice(0, methodStart);
          method = functionName.slice(methodStart + 1);
          const objectEnd = object.indexOf('.Module');
          if (objectEnd > 0) {
            functionName = functionName.slice(objectEnd + 1);
            object = object.slice(0, objectEnd);
          }
        }
        typeName = undefined;
      }

      if (method) {
        typeName = object;
        methodName = method;
      }

      if (method === '<anonymous>') {
        methodName = undefined;
        functionName = undefined;
      }

      if (functionName === undefined) {
        methodName = methodName || '<anonymous>';
        functionName = typeName ? `${typeName}.${methodName}` : methodName;
      }

      let filename = lineMatch[2] && lineMatch[2].startsWith('file://') ? lineMatch[2].slice(7) : lineMatch[2];
      const isNative = lineMatch[5] === 'native';

      if (!filename && lineMatch[5] && !isNative) {
        filename = lineMatch[5];
      }

      return {
        filename,
        module: getModule ? getModule(filename) : undefined,
        function: functionName,
        lineno: parseInt(lineMatch[3], 10) || undefined,
        colno: parseInt(lineMatch[4], 10) || undefined,
        in_app: filenameIsInApp(filename, isNative),
      };
    }

    if (line.match(FILENAME_MATCH)) {
      return {
        filename: line,
      };
    }

    return undefined;
  };
}


//# sourceMappingURL=node-stack-trace.js.map


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/node.js":
/*!************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/node.js ***!
  \************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "dynamicRequire": () => (/* binding */ dynamicRequire),
/* harmony export */   "isNodeEnv": () => (/* binding */ isNodeEnv),
/* harmony export */   "loadModule": () => (/* binding */ loadModule)
/* harmony export */ });
/* harmony import */ var _env_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./env.js */ "./node_modules/@sentry/utils/esm/env.js");
/* module decorator */ module = __webpack_require__.hmd(module);
/* provided dependency */ var process = __webpack_require__(/*! process/browser.js */ "./node_modules/process/browser.js");


/**
 * NOTE: In order to avoid circular dependencies, if you add a function to this module and it needs to print something,
 * you must either a) use `console.log` rather than the logger, or b) put your function elsewhere.
 */

/**
 * Checks whether we're in the Node.js or Browser environment
 *
 * @returns Answer to given question
 */
function isNodeEnv() {
  // explicitly check for browser bundles as those can be optimized statically
  // by terser/rollup.
  return (
    !(0,_env_js__WEBPACK_IMPORTED_MODULE_0__.isBrowserBundle)() &&
    Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]'
  );
}

/**
 * Requires a module which is protected against bundler minification.
 *
 * @param request The module path to resolve
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
function dynamicRequire(mod, request) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return mod.require(request);
}

/**
 * Helper for dynamically loading module that should work with linked dependencies.
 * The problem is that we _should_ be using `require(require.resolve(moduleName, { paths: [cwd()] }))`
 * However it's _not possible_ to do that with Webpack, as it has to know all the dependencies during
 * build time. `require.resolve` is also not available in any other way, so we cannot create,
 * a fake helper like we do with `dynamicRequire`.
 *
 * We always prefer to use local package, thus the value is not returned early from each `try/catch` block.
 * That is to mimic the behavior of `require.resolve` exactly.
 *
 * @param moduleName module name to require
 * @returns possibly required module
 */
function loadModule(moduleName) {
  let mod;

  try {
    mod = dynamicRequire(module, moduleName);
  } catch (e) {
    // no-empty
  }

  try {
    const { cwd } = dynamicRequire(module, 'process');
    mod = dynamicRequire(module, `${cwd()}/node_modules/${moduleName}`) ;
  } catch (e) {
    // no-empty
  }

  return mod;
}


//# sourceMappingURL=node.js.map


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/normalize.js":
/*!*****************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/normalize.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "normalize": () => (/* binding */ normalize),
/* harmony export */   "normalizeToSize": () => (/* binding */ normalizeToSize),
/* harmony export */   "walk": () => (/* binding */ visit)
/* harmony export */ });
/* harmony import */ var _is_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./is.js */ "./node_modules/@sentry/utils/esm/is.js");
/* harmony import */ var _memo_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./memo.js */ "./node_modules/@sentry/utils/esm/memo.js");
/* harmony import */ var _object_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./object.js */ "./node_modules/@sentry/utils/esm/object.js");
/* harmony import */ var _stacktrace_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./stacktrace.js */ "./node_modules/@sentry/utils/esm/stacktrace.js");





/**
 * Recursively normalizes the given object.
 *
 * - Creates a copy to prevent original input mutation
 * - Skips non-enumerable properties
 * - When stringifying, calls `toJSON` if implemented
 * - Removes circular references
 * - Translates non-serializable values (`undefined`/`NaN`/functions) to serializable format
 * - Translates known global objects/classes to a string representations
 * - Takes care of `Error` object serialization
 * - Optionally limits depth of final output
 * - Optionally limits number of properties/elements included in any single object/array
 *
 * @param input The object to be normalized.
 * @param depth The max depth to which to normalize the object. (Anything deeper stringified whole.)
 * @param maxProperties The max number of elements or properties to be included in any single array or
 * object in the normallized output.
 * @returns A normalized version of the object, or `"**non-serializable**"` if any errors are thrown during normalization.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalize(input, depth = 100, maxProperties = +Infinity) {
  try {
    // since we're at the outermost level, we don't provide a key
    return visit('', input, depth, maxProperties);
  } catch (err) {
    return { ERROR: `**non-serializable** (${err})` };
  }
}

/** JSDoc */
function normalizeToSize(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  object,
  // Default Node.js REPL depth
  depth = 3,
  // 100kB, as 200kB is max payload size, so half sounds reasonable
  maxSize = 100 * 1024,
) {
  const normalized = normalize(object, depth);

  if (jsonSize(normalized) > maxSize) {
    return normalizeToSize(object, depth - 1, maxSize);
  }

  return normalized ;
}

/**
 * Visits a node to perform normalization on it
 *
 * @param key The key corresponding to the given node
 * @param value The node to be visited
 * @param depth Optional number indicating the maximum recursion depth
 * @param maxProperties Optional maximum number of properties/elements included in any single object/array
 * @param memo Optional Memo class handling decycling
 */
function visit(
  key,
  value,
  depth = +Infinity,
  maxProperties = +Infinity,
  memo = (0,_memo_js__WEBPACK_IMPORTED_MODULE_0__.memoBuilder)(),
) {
  const [memoize, unmemoize] = memo;

  // Get the simple cases out of the way first
  if (
    value == null || // this matches null and undefined -> eqeq not eqeqeq
    (['number', 'boolean', 'string'].includes(typeof value) && !(0,_is_js__WEBPACK_IMPORTED_MODULE_1__.isNaN)(value))
  ) {
    return value ;
  }

  const stringified = stringifyValue(key, value);

  // Anything we could potentially dig into more (objects or arrays) will have come back as `"[object XXXX]"`.
  // Everything else will have already been serialized, so if we don't see that pattern, we're done.
  if (!stringified.startsWith('[object ')) {
    return stringified;
  }

  // From here on, we can assert that `value` is either an object or an array.

  // Do not normalize objects that we know have already been normalized. As a general rule, the
  // "__sentry_skip_normalization__" property should only be used sparingly and only should only be set on objects that
  // have already been normalized.
  if ((value )['__sentry_skip_normalization__']) {
    return value ;
  }

  // We can set `__sentry_override_normalization_depth__` on an object to ensure that from there
  // We keep a certain amount of depth.
  // This should be used sparingly, e.g. we use it for the redux integration to ensure we get a certain amount of state.
  const remainingDepth =
    typeof (value )['__sentry_override_normalization_depth__'] === 'number'
      ? ((value )['__sentry_override_normalization_depth__'] )
      : depth;

  // We're also done if we've reached the max depth
  if (remainingDepth === 0) {
    // At this point we know `serialized` is a string of the form `"[object XXXX]"`. Clean it up so it's just `"[XXXX]"`.
    return stringified.replace('object ', '');
  }

  // If we've already visited this branch, bail out, as it's circular reference. If not, note that we're seeing it now.
  if (memoize(value)) {
    return '[Circular ~]';
  }

  // If the value has a `toJSON` method, we call it to extract more information
  const valueWithToJSON = value ;
  if (valueWithToJSON && typeof valueWithToJSON.toJSON === 'function') {
    try {
      const jsonValue = valueWithToJSON.toJSON();
      // We need to normalize the return value of `.toJSON()` in case it has circular references
      return visit('', jsonValue, remainingDepth - 1, maxProperties, memo);
    } catch (err) {
      // pass (The built-in `toJSON` failed, but we can still try to do it ourselves)
    }
  }

  // At this point we know we either have an object or an array, we haven't seen it before, and we're going to recurse
  // because we haven't yet reached the max depth. Create an accumulator to hold the results of visiting each
  // property/entry, and keep track of the number of items we add to it.
  const normalized = (Array.isArray(value) ? [] : {}) ;
  let numAdded = 0;

  // Before we begin, convert`Error` and`Event` instances into plain objects, since some of each of their relevant
  // properties are non-enumerable and otherwise would get missed.
  const visitable = (0,_object_js__WEBPACK_IMPORTED_MODULE_2__.convertToPlainObject)(value );

  for (const visitKey in visitable) {
    // Avoid iterating over fields in the prototype if they've somehow been exposed to enumeration.
    if (!Object.prototype.hasOwnProperty.call(visitable, visitKey)) {
      continue;
    }

    if (numAdded >= maxProperties) {
      normalized[visitKey] = '[MaxProperties ~]';
      break;
    }

    // Recursively visit all the child nodes
    const visitValue = visitable[visitKey];
    normalized[visitKey] = visit(visitKey, visitValue, remainingDepth - 1, maxProperties, memo);

    numAdded++;
  }

  // Once we've visited all the branches, remove the parent from memo storage
  unmemoize(value);

  // Return accumulated values
  return normalized;
}

/* eslint-disable complexity */
/**
 * Stringify the given value. Handles various known special values and types.
 *
 * Not meant to be used on simple primitives which already have a string representation, as it will, for example, turn
 * the number 1231 into "[Object Number]", nor on `null`, as it will throw.
 *
 * @param value The value to stringify
 * @returns A stringified representation of the given value
 */
function stringifyValue(
  key,
  // this type is a tiny bit of a cheat, since this function does handle NaN (which is technically a number), but for
  // our internal use, it'll do
  value,
) {
  try {
    if (key === 'domain' && value && typeof value === 'object' && (value )._events) {
      return '[Domain]';
    }

    if (key === 'domainEmitter') {
      return '[DomainEmitter]';
    }

    // It's safe to use `global`, `window`, and `document` here in this manner, as we are asserting using `typeof` first
    // which won't throw if they are not present.

    if (typeof __webpack_require__.g !== 'undefined' && value === __webpack_require__.g) {
      return '[Global]';
    }

    // eslint-disable-next-line no-restricted-globals
    if (typeof window !== 'undefined' && value === window) {
      return '[Window]';
    }

    // eslint-disable-next-line no-restricted-globals
    if (typeof document !== 'undefined' && value === document) {
      return '[Document]';
    }

    if ((0,_is_js__WEBPACK_IMPORTED_MODULE_1__.isVueViewModel)(value)) {
      return '[VueViewModel]';
    }

    // React's SyntheticEvent thingy
    if ((0,_is_js__WEBPACK_IMPORTED_MODULE_1__.isSyntheticEvent)(value)) {
      return '[SyntheticEvent]';
    }

    if (typeof value === 'number' && value !== value) {
      return '[NaN]';
    }

    if (typeof value === 'function') {
      return `[Function: ${(0,_stacktrace_js__WEBPACK_IMPORTED_MODULE_3__.getFunctionName)(value)}]`;
    }

    if (typeof value === 'symbol') {
      return `[${String(value)}]`;
    }

    // stringified BigInts are indistinguishable from regular numbers, so we need to label them to avoid confusion
    if (typeof value === 'bigint') {
      return `[BigInt: ${String(value)}]`;
    }

    // Now that we've knocked out all the special cases and the primitives, all we have left are objects. Simply casting
    // them to strings means that instances of classes which haven't defined their `toStringTag` will just come out as
    // `"[object Object]"`. If we instead look at the constructor's name (which is the same as the name of the class),
    // we can make sure that only plain objects come out that way.
    const objName = getConstructorName(value);

    // Handle HTML Elements
    if (/^HTML(\w*)Element$/.test(objName)) {
      return `[HTMLElement: ${objName}]`;
    }

    return `[object ${objName}]`;
  } catch (err) {
    return `**non-serializable** (${err})`;
  }
}
/* eslint-enable complexity */

function getConstructorName(value) {
  const prototype = Object.getPrototypeOf(value);

  return prototype ? prototype.constructor.name : 'null prototype';
}

/** Calculates bytes size of input string */
function utf8Length(value) {
  // eslint-disable-next-line no-bitwise
  return ~-encodeURI(value).split(/%..|./).length;
}

/** Calculates bytes size of input object */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function jsonSize(value) {
  return utf8Length(JSON.stringify(value));
}


//# sourceMappingURL=normalize.js.map


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/object.js":
/*!**************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/object.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "addNonEnumerableProperty": () => (/* binding */ addNonEnumerableProperty),
/* harmony export */   "convertToPlainObject": () => (/* binding */ convertToPlainObject),
/* harmony export */   "dropUndefinedKeys": () => (/* binding */ dropUndefinedKeys),
/* harmony export */   "extractExceptionKeysForMessage": () => (/* binding */ extractExceptionKeysForMessage),
/* harmony export */   "fill": () => (/* binding */ fill),
/* harmony export */   "getOriginalFunction": () => (/* binding */ getOriginalFunction),
/* harmony export */   "markFunctionWrapped": () => (/* binding */ markFunctionWrapped),
/* harmony export */   "objectify": () => (/* binding */ objectify),
/* harmony export */   "urlEncode": () => (/* binding */ urlEncode)
/* harmony export */ });
/* harmony import */ var _browser_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./browser.js */ "./node_modules/@sentry/utils/esm/browser.js");
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./debug-build.js */ "./node_modules/@sentry/utils/esm/debug-build.js");
/* harmony import */ var _is_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./is.js */ "./node_modules/@sentry/utils/esm/is.js");
/* harmony import */ var _logger_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./logger.js */ "./node_modules/@sentry/utils/esm/logger.js");
/* harmony import */ var _string_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./string.js */ "./node_modules/@sentry/utils/esm/string.js");






/**
 * Replace a method in an object with a wrapped version of itself.
 *
 * @param source An object that contains a method to be wrapped.
 * @param name The name of the method to be wrapped.
 * @param replacementFactory A higher-order function that takes the original version of the given method and returns a
 * wrapped version. Note: The function returned by `replacementFactory` needs to be a non-arrow function, in order to
 * preserve the correct value of `this`, and the original method must be called using `origMethod.call(this, <other
 * args>)` or `origMethod.apply(this, [<other args>])` (rather than being called directly), again to preserve `this`.
 * @returns void
 */
function fill(source, name, replacementFactory) {
  if (!(name in source)) {
    return;
  }

  const original = source[name] ;
  const wrapped = replacementFactory(original) ;

  // Make sure it's a function first, as we need to attach an empty prototype for `defineProperties` to work
  // otherwise it'll throw "TypeError: Object.defineProperties called on non-object"
  if (typeof wrapped === 'function') {
    markFunctionWrapped(wrapped, original);
  }

  source[name] = wrapped;
}

/**
 * Defines a non-enumerable property on the given object.
 *
 * @param obj The object on which to set the property
 * @param name The name of the property to be set
 * @param value The value to which to set the property
 */
function addNonEnumerableProperty(obj, name, value) {
  try {
    Object.defineProperty(obj, name, {
      // enumerable: false, // the default, so we can save on bundle size by not explicitly setting it
      value: value,
      writable: true,
      configurable: true,
    });
  } catch (o_O) {
    _debug_build_js__WEBPACK_IMPORTED_MODULE_0__.DEBUG_BUILD && _logger_js__WEBPACK_IMPORTED_MODULE_1__.logger.log(`Failed to add non-enumerable property "${name}" to object`, obj);
  }
}

/**
 * Remembers the original function on the wrapped function and
 * patches up the prototype.
 *
 * @param wrapped the wrapper function
 * @param original the original function that gets wrapped
 */
function markFunctionWrapped(wrapped, original) {
  try {
    const proto = original.prototype || {};
    wrapped.prototype = original.prototype = proto;
    addNonEnumerableProperty(wrapped, '__sentry_original__', original);
  } catch (o_O) {} // eslint-disable-line no-empty
}

/**
 * This extracts the original function if available.  See
 * `markFunctionWrapped` for more information.
 *
 * @param func the function to unwrap
 * @returns the unwrapped version of the function if available.
 */
function getOriginalFunction(func) {
  return func.__sentry_original__;
}

/**
 * Encodes given object into url-friendly format
 *
 * @param object An object that contains serializable values
 * @returns string Encoded
 */
function urlEncode(object) {
  return Object.keys(object)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(object[key])}`)
    .join('&');
}

/**
 * Transforms any `Error` or `Event` into a plain object with all of their enumerable properties, and some of their
 * non-enumerable properties attached.
 *
 * @param value Initial source that we have to transform in order for it to be usable by the serializer
 * @returns An Event or Error turned into an object - or the value argurment itself, when value is neither an Event nor
 *  an Error.
 */
function convertToPlainObject(
  value,
)

 {
  if ((0,_is_js__WEBPACK_IMPORTED_MODULE_2__.isError)(value)) {
    return {
      message: value.message,
      name: value.name,
      stack: value.stack,
      ...getOwnProperties(value),
    };
  } else if ((0,_is_js__WEBPACK_IMPORTED_MODULE_2__.isEvent)(value)) {
    const newObj

 = {
      type: value.type,
      target: serializeEventTarget(value.target),
      currentTarget: serializeEventTarget(value.currentTarget),
      ...getOwnProperties(value),
    };

    if (typeof CustomEvent !== 'undefined' && (0,_is_js__WEBPACK_IMPORTED_MODULE_2__.isInstanceOf)(value, CustomEvent)) {
      newObj.detail = value.detail;
    }

    return newObj;
  } else {
    return value;
  }
}

/** Creates a string representation of the target of an `Event` object */
function serializeEventTarget(target) {
  try {
    return (0,_is_js__WEBPACK_IMPORTED_MODULE_2__.isElement)(target) ? (0,_browser_js__WEBPACK_IMPORTED_MODULE_3__.htmlTreeAsString)(target) : Object.prototype.toString.call(target);
  } catch (_oO) {
    return '<unknown>';
  }
}

/** Filters out all but an object's own properties */
function getOwnProperties(obj) {
  if (typeof obj === 'object' && obj !== null) {
    const extractedProps = {};
    for (const property in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, property)) {
        extractedProps[property] = (obj )[property];
      }
    }
    return extractedProps;
  } else {
    return {};
  }
}

/**
 * Given any captured exception, extract its keys and create a sorted
 * and truncated list that will be used inside the event message.
 * eg. `Non-error exception captured with keys: foo, bar, baz`
 */
function extractExceptionKeysForMessage(exception, maxLength = 40) {
  const keys = Object.keys(convertToPlainObject(exception));
  keys.sort();

  if (!keys.length) {
    return '[object has no keys]';
  }

  if (keys[0].length >= maxLength) {
    return (0,_string_js__WEBPACK_IMPORTED_MODULE_4__.truncate)(keys[0], maxLength);
  }

  for (let includedKeys = keys.length; includedKeys > 0; includedKeys--) {
    const serialized = keys.slice(0, includedKeys).join(', ');
    if (serialized.length > maxLength) {
      continue;
    }
    if (includedKeys === keys.length) {
      return serialized;
    }
    return (0,_string_js__WEBPACK_IMPORTED_MODULE_4__.truncate)(serialized, maxLength);
  }

  return '';
}

/**
 * Given any object, return a new object having removed all fields whose value was `undefined`.
 * Works recursively on objects and arrays.
 *
 * Attention: This function keeps circular references in the returned object.
 */
function dropUndefinedKeys(inputValue) {
  // This map keeps track of what already visited nodes map to.
  // Our Set - based memoBuilder doesn't work here because we want to the output object to have the same circular
  // references as the input object.
  const memoizationMap = new Map();

  // This function just proxies `_dropUndefinedKeys` to keep the `memoBuilder` out of this function's API
  return _dropUndefinedKeys(inputValue, memoizationMap);
}

function _dropUndefinedKeys(inputValue, memoizationMap) {
  if ((0,_is_js__WEBPACK_IMPORTED_MODULE_2__.isPlainObject)(inputValue)) {
    // If this node has already been visited due to a circular reference, return the object it was mapped to in the new object
    const memoVal = memoizationMap.get(inputValue);
    if (memoVal !== undefined) {
      return memoVal ;
    }

    const returnValue = {};
    // Store the mapping of this value in case we visit it again, in case of circular data
    memoizationMap.set(inputValue, returnValue);

    for (const key of Object.keys(inputValue)) {
      if (typeof inputValue[key] !== 'undefined') {
        returnValue[key] = _dropUndefinedKeys(inputValue[key], memoizationMap);
      }
    }

    return returnValue ;
  }

  if (Array.isArray(inputValue)) {
    // If this node has already been visited due to a circular reference, return the array it was mapped to in the new object
    const memoVal = memoizationMap.get(inputValue);
    if (memoVal !== undefined) {
      return memoVal ;
    }

    const returnValue = [];
    // Store the mapping of this value in case we visit it again, in case of circular data
    memoizationMap.set(inputValue, returnValue);

    inputValue.forEach((item) => {
      returnValue.push(_dropUndefinedKeys(item, memoizationMap));
    });

    return returnValue ;
  }

  return inputValue;
}

/**
 * Ensure that something is an object.
 *
 * Turns `undefined` and `null` into `String`s and all other primitives into instances of their respective wrapper
 * classes (String, Boolean, Number, etc.). Acts as the identity function on non-primitives.
 *
 * @param wat The subject of the objectification
 * @returns A version of `wat` which can safely be used with `Object` class methods
 */
function objectify(wat) {
  let objectified;
  switch (true) {
    case wat === undefined || wat === null:
      objectified = new String(wat);
      break;

    // Though symbols and bigints do have wrapper classes (`Symbol` and `BigInt`, respectively), for whatever reason
    // those classes don't have constructors which can be used with the `new` keyword. We therefore need to cast each as
    // an object in order to wrap it.
    case typeof wat === 'symbol' || typeof wat === 'bigint':
      objectified = Object(wat);
      break;

    // this will catch the remaining primitives: `String`, `Number`, and `Boolean`
    case (0,_is_js__WEBPACK_IMPORTED_MODULE_2__.isPrimitive)(wat):
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      objectified = new (wat ).constructor(wat);
      break;

    // by process of elimination, at this point we know that `wat` must already be an object
    default:
      objectified = wat;
      break;
  }
  return objectified;
}


//# sourceMappingURL=object.js.map


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/promisebuffer.js":
/*!*********************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/promisebuffer.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "makePromiseBuffer": () => (/* binding */ makePromiseBuffer)
/* harmony export */ });
/* harmony import */ var _error_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./error.js */ "./node_modules/@sentry/utils/esm/error.js");
/* harmony import */ var _syncpromise_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./syncpromise.js */ "./node_modules/@sentry/utils/esm/syncpromise.js");



/**
 * Creates an new PromiseBuffer object with the specified limit
 * @param limit max number of promises that can be stored in the buffer
 */
function makePromiseBuffer(limit) {
  const buffer = [];

  function isReady() {
    return limit === undefined || buffer.length < limit;
  }

  /**
   * Remove a promise from the queue.
   *
   * @param task Can be any PromiseLike<T>
   * @returns Removed promise.
   */
  function remove(task) {
    return buffer.splice(buffer.indexOf(task), 1)[0];
  }

  /**
   * Add a promise (representing an in-flight action) to the queue, and set it to remove itself on fulfillment.
   *
   * @param taskProducer A function producing any PromiseLike<T>; In previous versions this used to be `task:
   *        PromiseLike<T>`, but under that model, Promises were instantly created on the call-site and their executor
   *        functions therefore ran immediately. Thus, even if the buffer was full, the action still happened. By
   *        requiring the promise to be wrapped in a function, we can defer promise creation until after the buffer
   *        limit check.
   * @returns The original promise.
   */
  function add(taskProducer) {
    if (!isReady()) {
      return (0,_syncpromise_js__WEBPACK_IMPORTED_MODULE_0__.rejectedSyncPromise)(new _error_js__WEBPACK_IMPORTED_MODULE_1__.SentryError('Not adding Promise because buffer limit was reached.'));
    }

    // start the task and add its promise to the queue
    const task = taskProducer();
    if (buffer.indexOf(task) === -1) {
      buffer.push(task);
    }
    void task
      .then(() => remove(task))
      // Use `then(null, rejectionHandler)` rather than `catch(rejectionHandler)` so that we can use `PromiseLike`
      // rather than `Promise`. `PromiseLike` doesn't have a `.catch` method, making its polyfill smaller. (ES5 didn't
      // have promises, so TS has to polyfill when down-compiling.)
      .then(null, () =>
        remove(task).then(null, () => {
          // We have to add another catch here because `remove()` starts a new promise chain.
        }),
      );
    return task;
  }

  /**
   * Wait for all promises in the queue to resolve or for timeout to expire, whichever comes first.
   *
   * @param timeout The time, in ms, after which to resolve to `false` if the queue is still non-empty. Passing `0` (or
   * not passing anything) will make the promise wait as long as it takes for the queue to drain before resolving to
   * `true`.
   * @returns A promise which will resolve to `true` if the queue is already empty or drains before the timeout, and
   * `false` otherwise
   */
  function drain(timeout) {
    return new _syncpromise_js__WEBPACK_IMPORTED_MODULE_0__.SyncPromise((resolve, reject) => {
      let counter = buffer.length;

      if (!counter) {
        return resolve(true);
      }

      // wait for `timeout` ms and then resolve to `false` (if not cancelled first)
      const capturedSetTimeout = setTimeout(() => {
        if (timeout && timeout > 0) {
          resolve(false);
        }
      }, timeout);

      // if all promises resolve in time, cancel the timer and resolve to `true`
      buffer.forEach(item => {
        void (0,_syncpromise_js__WEBPACK_IMPORTED_MODULE_0__.resolvedSyncPromise)(item).then(() => {
          if (!--counter) {
            clearTimeout(capturedSetTimeout);
            resolve(true);
          }
        }, reject);
      });
    });
  }

  return {
    $: buffer,
    add,
    drain,
  };
}


//# sourceMappingURL=promisebuffer.js.map


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/ratelimit.js":
/*!*****************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/ratelimit.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DEFAULT_RETRY_AFTER": () => (/* binding */ DEFAULT_RETRY_AFTER),
/* harmony export */   "disabledUntil": () => (/* binding */ disabledUntil),
/* harmony export */   "isRateLimited": () => (/* binding */ isRateLimited),
/* harmony export */   "parseRetryAfterHeader": () => (/* binding */ parseRetryAfterHeader),
/* harmony export */   "updateRateLimits": () => (/* binding */ updateRateLimits)
/* harmony export */ });
// Intentionally keeping the key broad, as we don't know for sure what rate limit headers get returned from backend

const DEFAULT_RETRY_AFTER = 60 * 1000; // 60 seconds

/**
 * Extracts Retry-After value from the request header or returns default value
 * @param header string representation of 'Retry-After' header
 * @param now current unix timestamp
 *
 */
function parseRetryAfterHeader(header, now = Date.now()) {
  const headerDelay = parseInt(`${header}`, 10);
  if (!isNaN(headerDelay)) {
    return headerDelay * 1000;
  }

  const headerDate = Date.parse(`${header}`);
  if (!isNaN(headerDate)) {
    return headerDate - now;
  }

  return DEFAULT_RETRY_AFTER;
}

/**
 * Gets the time that the given category is disabled until for rate limiting.
 * In case no category-specific limit is set but a general rate limit across all categories is active,
 * that time is returned.
 *
 * @return the time in ms that the category is disabled until or 0 if there's no active rate limit.
 */
function disabledUntil(limits, category) {
  return limits[category] || limits.all || 0;
}

/**
 * Checks if a category is rate limited
 */
function isRateLimited(limits, category, now = Date.now()) {
  return disabledUntil(limits, category) > now;
}

/**
 * Update ratelimits from incoming headers.
 *
 * @return the updated RateLimits object.
 */
function updateRateLimits(
  limits,
  { statusCode, headers },
  now = Date.now(),
) {
  const updatedRateLimits = {
    ...limits,
  };

  // "The name is case-insensitive."
  // https://developer.mozilla.org/en-US/docs/Web/API/Headers/get
  const rateLimitHeader = headers && headers['x-sentry-rate-limits'];
  const retryAfterHeader = headers && headers['retry-after'];

  if (rateLimitHeader) {
    /**
     * rate limit headers are of the form
     *     <header>,<header>,..
     * where each <header> is of the form
     *     <retry_after>: <categories>: <scope>: <reason_code>
     * where
     *     <retry_after> is a delay in seconds
     *     <categories> is the event type(s) (error, transaction, etc) being rate limited and is of the form
     *         <category>;<category>;...
     *     <scope> is what's being limited (org, project, or key) - ignored by SDK
     *     <reason_code> is an arbitrary string like "org_quota" - ignored by SDK
     */
    for (const limit of rateLimitHeader.trim().split(',')) {
      const [retryAfter, categories] = limit.split(':', 2);
      const headerDelay = parseInt(retryAfter, 10);
      const delay = (!isNaN(headerDelay) ? headerDelay : 60) * 1000; // 60sec default
      if (!categories) {
        updatedRateLimits.all = now + delay;
      } else {
        for (const category of categories.split(';')) {
          updatedRateLimits[category] = now + delay;
        }
      }
    }
  } else if (retryAfterHeader) {
    updatedRateLimits.all = now + parseRetryAfterHeader(retryAfterHeader, now);
  } else if (statusCode === 429) {
    updatedRateLimits.all = now + 60 * 1000;
  }

  return updatedRateLimits;
}


//# sourceMappingURL=ratelimit.js.map


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/severity.js":
/*!****************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/severity.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "severityFromString": () => (/* binding */ severityFromString),
/* harmony export */   "severityLevelFromString": () => (/* binding */ severityLevelFromString),
/* harmony export */   "validSeverityLevels": () => (/* binding */ validSeverityLevels)
/* harmony export */ });
// Note: Ideally the `SeverityLevel` type would be derived from `validSeverityLevels`, but that would mean either
//
// a) moving `validSeverityLevels` to `@sentry/types`,
// b) moving the`SeverityLevel` type here, or
// c) importing `validSeverityLevels` from here into `@sentry/types`.
//
// Option A would make `@sentry/types` a runtime dependency of `@sentry/utils` (not good), and options B and C would
// create a circular dependency between `@sentry/types` and `@sentry/utils` (also not good). So a TODO accompanying the
// type, reminding anyone who changes it to change this list also, will have to do.

const validSeverityLevels = ['fatal', 'error', 'warning', 'log', 'info', 'debug'];

/**
 * Converts a string-based level into a member of the deprecated {@link Severity} enum.
 *
 * @deprecated `severityFromString` is deprecated. Please use `severityLevelFromString` instead.
 *
 * @param level String representation of Severity
 * @returns Severity
 */
function severityFromString(level) {
  return severityLevelFromString(level) ;
}

/**
 * Converts a string-based level into a `SeverityLevel`, normalizing it along the way.
 *
 * @param level String representation of desired `SeverityLevel`.
 * @returns The `SeverityLevel` corresponding to the given string, or 'log' if the string isn't a valid level.
 */
function severityLevelFromString(level) {
  return (level === 'warn' ? 'warning' : validSeverityLevels.includes(level) ? level : 'log') ;
}


//# sourceMappingURL=severity.js.map


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/stacktrace.js":
/*!******************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/stacktrace.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createStackParser": () => (/* binding */ createStackParser),
/* harmony export */   "filenameIsInApp": () => (/* reexport safe */ _node_stack_trace_js__WEBPACK_IMPORTED_MODULE_0__.filenameIsInApp),
/* harmony export */   "getFunctionName": () => (/* binding */ getFunctionName),
/* harmony export */   "nodeStackLineParser": () => (/* binding */ nodeStackLineParser),
/* harmony export */   "stackParserFromStackParserOptions": () => (/* binding */ stackParserFromStackParserOptions),
/* harmony export */   "stripSentryFramesAndReverse": () => (/* binding */ stripSentryFramesAndReverse)
/* harmony export */ });
/* harmony import */ var _node_stack_trace_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./node-stack-trace.js */ "./node_modules/@sentry/utils/esm/node-stack-trace.js");



const STACKTRACE_FRAME_LIMIT = 50;
// Used to sanitize webpack (error: *) wrapped stack errors
const WEBPACK_ERROR_REGEXP = /\(error: (.*)\)/;
const STRIP_FRAME_REGEXP = /captureMessage|captureException/;

/**
 * Creates a stack parser with the supplied line parsers
 *
 * StackFrames are returned in the correct order for Sentry Exception
 * frames and with Sentry SDK internal frames removed from the top and bottom
 *
 */
function createStackParser(...parsers) {
  const sortedParsers = parsers.sort((a, b) => a[0] - b[0]).map(p => p[1]);

  return (stack, skipFirst = 0) => {
    const frames = [];
    const lines = stack.split('\n');

    for (let i = skipFirst; i < lines.length; i++) {
      const line = lines[i];
      // Ignore lines over 1kb as they are unlikely to be stack frames.
      // Many of the regular expressions use backtracking which results in run time that increases exponentially with
      // input size. Huge strings can result in hangs/Denial of Service:
      // https://github.com/getsentry/sentry-javascript/issues/2286
      if (line.length > 1024) {
        continue;
      }

      // https://github.com/getsentry/sentry-javascript/issues/5459
      // Remove webpack (error: *) wrappers
      const cleanedLine = WEBPACK_ERROR_REGEXP.test(line) ? line.replace(WEBPACK_ERROR_REGEXP, '$1') : line;

      // https://github.com/getsentry/sentry-javascript/issues/7813
      // Skip Error: lines
      if (cleanedLine.match(/\S*Error: /)) {
        continue;
      }

      for (const parser of sortedParsers) {
        const frame = parser(cleanedLine);

        if (frame) {
          frames.push(frame);
          break;
        }
      }

      if (frames.length >= STACKTRACE_FRAME_LIMIT) {
        break;
      }
    }

    return stripSentryFramesAndReverse(frames);
  };
}

/**
 * Gets a stack parser implementation from Options.stackParser
 * @see Options
 *
 * If options contains an array of line parsers, it is converted into a parser
 */
function stackParserFromStackParserOptions(stackParser) {
  if (Array.isArray(stackParser)) {
    return createStackParser(...stackParser);
  }
  return stackParser;
}

/**
 * Removes Sentry frames from the top and bottom of the stack if present and enforces a limit of max number of frames.
 * Assumes stack input is ordered from top to bottom and returns the reverse representation so call site of the
 * function that caused the crash is the last frame in the array.
 * @hidden
 */
function stripSentryFramesAndReverse(stack) {
  if (!stack.length) {
    return [];
  }

  const localStack = Array.from(stack);

  // If stack starts with one of our API calls, remove it (starts, meaning it's the top of the stack - aka last call)
  if (/sentryWrapped/.test(localStack[localStack.length - 1].function || '')) {
    localStack.pop();
  }

  // Reversing in the middle of the procedure allows us to just pop the values off the stack
  localStack.reverse();

  // If stack ends with one of our internal API calls, remove it (ends, meaning it's the bottom of the stack - aka top-most call)
  if (STRIP_FRAME_REGEXP.test(localStack[localStack.length - 1].function || '')) {
    localStack.pop();

    // When using synthetic events, we will have a 2 levels deep stack, as `new Error('Sentry syntheticException')`
    // is produced within the hub itself, making it:
    //
    //   Sentry.captureException()
    //   getCurrentHub().captureException()
    //
    // instead of just the top `Sentry` call itself.
    // This forces us to possibly strip an additional frame in the exact same was as above.
    if (STRIP_FRAME_REGEXP.test(localStack[localStack.length - 1].function || '')) {
      localStack.pop();
    }
  }

  return localStack.slice(0, STACKTRACE_FRAME_LIMIT).map(frame => ({
    ...frame,
    filename: frame.filename || localStack[localStack.length - 1].filename,
    function: frame.function || '?',
  }));
}

const defaultFunctionName = '<anonymous>';

/**
 * Safely extract function name from itself
 */
function getFunctionName(fn) {
  try {
    if (!fn || typeof fn !== 'function') {
      return defaultFunctionName;
    }
    return fn.name || defaultFunctionName;
  } catch (e) {
    // Just accessing custom props in some Selenium environments
    // can cause a "Permission denied" exception (see raven-js#495).
    return defaultFunctionName;
  }
}

/**
 * Node.js stack line parser
 *
 * This is in @sentry/utils so it can be used from the Electron SDK in the browser for when `nodeIntegration == true`.
 * This allows it to be used without referencing or importing any node specific code which causes bundlers to complain
 */
function nodeStackLineParser(getModule) {
  return [90, (0,_node_stack_trace_js__WEBPACK_IMPORTED_MODULE_0__.node)(getModule)];
}


//# sourceMappingURL=stacktrace.js.map


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/string.js":
/*!**************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/string.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isMatchingPattern": () => (/* binding */ isMatchingPattern),
/* harmony export */   "safeJoin": () => (/* binding */ safeJoin),
/* harmony export */   "snipLine": () => (/* binding */ snipLine),
/* harmony export */   "stringMatchesSomePattern": () => (/* binding */ stringMatchesSomePattern),
/* harmony export */   "truncate": () => (/* binding */ truncate)
/* harmony export */ });
/* harmony import */ var _is_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./is.js */ "./node_modules/@sentry/utils/esm/is.js");


/**
 * Truncates given string to the maximum characters count
 *
 * @param str An object that contains serializable values
 * @param max Maximum number of characters in truncated string (0 = unlimited)
 * @returns string Encoded
 */
function truncate(str, max = 0) {
  if (typeof str !== 'string' || max === 0) {
    return str;
  }
  return str.length <= max ? str : `${str.slice(0, max)}...`;
}

/**
 * This is basically just `trim_line` from
 * https://github.com/getsentry/sentry/blob/master/src/sentry/lang/javascript/processor.py#L67
 *
 * @param str An object that contains serializable values
 * @param max Maximum number of characters in truncated string
 * @returns string Encoded
 */
function snipLine(line, colno) {
  let newLine = line;
  const lineLength = newLine.length;
  if (lineLength <= 150) {
    return newLine;
  }
  if (colno > lineLength) {
    // eslint-disable-next-line no-param-reassign
    colno = lineLength;
  }

  let start = Math.max(colno - 60, 0);
  if (start < 5) {
    start = 0;
  }

  let end = Math.min(start + 140, lineLength);
  if (end > lineLength - 5) {
    end = lineLength;
  }
  if (end === lineLength) {
    start = Math.max(end - 140, 0);
  }

  newLine = newLine.slice(start, end);
  if (start > 0) {
    newLine = `'{snip} ${newLine}`;
  }
  if (end < lineLength) {
    newLine += ' {snip}';
  }

  return newLine;
}

/**
 * Join values in array
 * @param input array of values to be joined together
 * @param delimiter string to be placed in-between values
 * @returns Joined values
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safeJoin(input, delimiter) {
  if (!Array.isArray(input)) {
    return '';
  }

  const output = [];
  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < input.length; i++) {
    const value = input[i];
    try {
      // This is a hack to fix a Vue3-specific bug that causes an infinite loop of
      // console warnings. This happens when a Vue template is rendered with
      // an undeclared variable, which we try to stringify, ultimately causing
      // Vue to issue another warning which repeats indefinitely.
      // see: https://github.com/getsentry/sentry-javascript/pull/8981
      if ((0,_is_js__WEBPACK_IMPORTED_MODULE_0__.isVueViewModel)(value)) {
        output.push('[VueViewModel]');
      } else {
        output.push(String(value));
      }
    } catch (e) {
      output.push('[value cannot be serialized]');
    }
  }

  return output.join(delimiter);
}

/**
 * Checks if the given value matches a regex or string
 *
 * @param value The string to test
 * @param pattern Either a regex or a string against which `value` will be matched
 * @param requireExactStringMatch If true, `value` must match `pattern` exactly. If false, `value` will match
 * `pattern` if it contains `pattern`. Only applies to string-type patterns.
 */
function isMatchingPattern(
  value,
  pattern,
  requireExactStringMatch = false,
) {
  if (!(0,_is_js__WEBPACK_IMPORTED_MODULE_0__.isString)(value)) {
    return false;
  }

  if ((0,_is_js__WEBPACK_IMPORTED_MODULE_0__.isRegExp)(pattern)) {
    return pattern.test(value);
  }
  if ((0,_is_js__WEBPACK_IMPORTED_MODULE_0__.isString)(pattern)) {
    return requireExactStringMatch ? value === pattern : value.includes(pattern);
  }

  return false;
}

/**
 * Test the given string against an array of strings and regexes. By default, string matching is done on a
 * substring-inclusion basis rather than a strict equality basis
 *
 * @param testString The string to test
 * @param patterns The patterns against which to test the string
 * @param requireExactStringMatch If true, `testString` must match one of the given string patterns exactly in order to
 * count. If false, `testString` will match a string pattern if it contains that pattern.
 * @returns
 */
function stringMatchesSomePattern(
  testString,
  patterns = [],
  requireExactStringMatch = false,
) {
  return patterns.some(pattern => isMatchingPattern(testString, pattern, requireExactStringMatch));
}


//# sourceMappingURL=string.js.map


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/supports.js":
/*!****************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/supports.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isNativeFetch": () => (/* binding */ isNativeFetch),
/* harmony export */   "supportsDOMError": () => (/* binding */ supportsDOMError),
/* harmony export */   "supportsDOMException": () => (/* binding */ supportsDOMException),
/* harmony export */   "supportsErrorEvent": () => (/* binding */ supportsErrorEvent),
/* harmony export */   "supportsFetch": () => (/* binding */ supportsFetch),
/* harmony export */   "supportsNativeFetch": () => (/* binding */ supportsNativeFetch),
/* harmony export */   "supportsReferrerPolicy": () => (/* binding */ supportsReferrerPolicy),
/* harmony export */   "supportsReportingObserver": () => (/* binding */ supportsReportingObserver)
/* harmony export */ });
/* harmony import */ var _debug_build_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./debug-build.js */ "./node_modules/@sentry/utils/esm/debug-build.js");
/* harmony import */ var _logger_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./logger.js */ "./node_modules/@sentry/utils/esm/logger.js");
/* harmony import */ var _worldwide_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./worldwide.js */ "./node_modules/@sentry/utils/esm/worldwide.js");




// eslint-disable-next-line deprecation/deprecation
const WINDOW = (0,_worldwide_js__WEBPACK_IMPORTED_MODULE_0__.getGlobalObject)();

/**
 * Tells whether current environment supports ErrorEvent objects
 * {@link supportsErrorEvent}.
 *
 * @returns Answer to the given question.
 */
function supportsErrorEvent() {
  try {
    new ErrorEvent('');
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Tells whether current environment supports DOMError objects
 * {@link supportsDOMError}.
 *
 * @returns Answer to the given question.
 */
function supportsDOMError() {
  try {
    // Chrome: VM89:1 Uncaught TypeError: Failed to construct 'DOMError':
    // 1 argument required, but only 0 present.
    // @ts-expect-error It really needs 1 argument, not 0.
    new DOMError('');
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Tells whether current environment supports DOMException objects
 * {@link supportsDOMException}.
 *
 * @returns Answer to the given question.
 */
function supportsDOMException() {
  try {
    new DOMException('');
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Tells whether current environment supports Fetch API
 * {@link supportsFetch}.
 *
 * @returns Answer to the given question.
 */
function supportsFetch() {
  if (!('fetch' in WINDOW)) {
    return false;
  }

  try {
    new Headers();
    new Request('http://www.example.com');
    new Response();
    return true;
  } catch (e) {
    return false;
  }
}
/**
 * isNativeFetch checks if the given function is a native implementation of fetch()
 */
// eslint-disable-next-line @typescript-eslint/ban-types
function isNativeFetch(func) {
  return func && /^function fetch\(\)\s+\{\s+\[native code\]\s+\}$/.test(func.toString());
}

/**
 * Tells whether current environment supports Fetch API natively
 * {@link supportsNativeFetch}.
 *
 * @returns true if `window.fetch` is natively implemented, false otherwise
 */
function supportsNativeFetch() {
  if (typeof EdgeRuntime === 'string') {
    return true;
  }

  if (!supportsFetch()) {
    return false;
  }

  // Fast path to avoid DOM I/O
  // eslint-disable-next-line @typescript-eslint/unbound-method
  if (isNativeFetch(WINDOW.fetch)) {
    return true;
  }

  // window.fetch is implemented, but is polyfilled or already wrapped (e.g: by a chrome extension)
  // so create a "pure" iframe to see if that has native fetch
  let result = false;
  const doc = WINDOW.document;
  // eslint-disable-next-line deprecation/deprecation
  if (doc && typeof (doc.createElement ) === 'function') {
    try {
      const sandbox = doc.createElement('iframe');
      sandbox.hidden = true;
      doc.head.appendChild(sandbox);
      if (sandbox.contentWindow && sandbox.contentWindow.fetch) {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        result = isNativeFetch(sandbox.contentWindow.fetch);
      }
      doc.head.removeChild(sandbox);
    } catch (err) {
      _debug_build_js__WEBPACK_IMPORTED_MODULE_1__.DEBUG_BUILD &&
        _logger_js__WEBPACK_IMPORTED_MODULE_2__.logger.warn('Could not create sandbox iframe for pure fetch check, bailing to window.fetch: ', err);
    }
  }

  return result;
}

/**
 * Tells whether current environment supports ReportingObserver API
 * {@link supportsReportingObserver}.
 *
 * @returns Answer to the given question.
 */
function supportsReportingObserver() {
  return 'ReportingObserver' in WINDOW;
}

/**
 * Tells whether current environment supports Referrer Policy API
 * {@link supportsReferrerPolicy}.
 *
 * @returns Answer to the given question.
 */
function supportsReferrerPolicy() {
  // Despite all stars in the sky saying that Edge supports old draft syntax, aka 'never', 'always', 'origin' and 'default'
  // (see https://caniuse.com/#feat=referrer-policy),
  // it doesn't. And it throws an exception instead of ignoring this parameter...
  // REF: https://github.com/getsentry/raven-js/issues/1233

  if (!supportsFetch()) {
    return false;
  }

  try {
    new Request('_', {
      referrerPolicy: 'origin' ,
    });
    return true;
  } catch (e) {
    return false;
  }
}


//# sourceMappingURL=supports.js.map


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/syncpromise.js":
/*!*******************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/syncpromise.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SyncPromise": () => (/* binding */ SyncPromise),
/* harmony export */   "rejectedSyncPromise": () => (/* binding */ rejectedSyncPromise),
/* harmony export */   "resolvedSyncPromise": () => (/* binding */ resolvedSyncPromise)
/* harmony export */ });
/* harmony import */ var _is_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./is.js */ "./node_modules/@sentry/utils/esm/is.js");


/* eslint-disable @typescript-eslint/explicit-function-return-type */

/** SyncPromise internal states */
var States; (function (States) {
  /** Pending */
  const PENDING = 0; States[States["PENDING"] = PENDING] = "PENDING";
  /** Resolved / OK */
  const RESOLVED = 1; States[States["RESOLVED"] = RESOLVED] = "RESOLVED";
  /** Rejected / Error */
  const REJECTED = 2; States[States["REJECTED"] = REJECTED] = "REJECTED";
})(States || (States = {}));

// Overloads so we can call resolvedSyncPromise without arguments and generic argument

/**
 * Creates a resolved sync promise.
 *
 * @param value the value to resolve the promise with
 * @returns the resolved sync promise
 */
function resolvedSyncPromise(value) {
  return new SyncPromise(resolve => {
    resolve(value);
  });
}

/**
 * Creates a rejected sync promise.
 *
 * @param value the value to reject the promise with
 * @returns the rejected sync promise
 */
function rejectedSyncPromise(reason) {
  return new SyncPromise((_, reject) => {
    reject(reason);
  });
}

/**
 * Thenable class that behaves like a Promise and follows it's interface
 * but is not async internally
 */
class SyncPromise {

   constructor(
    executor,
  ) {SyncPromise.prototype.__init.call(this);SyncPromise.prototype.__init2.call(this);SyncPromise.prototype.__init3.call(this);SyncPromise.prototype.__init4.call(this);
    this._state = States.PENDING;
    this._handlers = [];

    try {
      executor(this._resolve, this._reject);
    } catch (e) {
      this._reject(e);
    }
  }

  /** JSDoc */
   then(
    onfulfilled,
    onrejected,
  ) {
    return new SyncPromise((resolve, reject) => {
      this._handlers.push([
        false,
        result => {
          if (!onfulfilled) {
            // TODO: ¯\_(ツ)_/¯
            // TODO: FIXME
            resolve(result );
          } else {
            try {
              resolve(onfulfilled(result));
            } catch (e) {
              reject(e);
            }
          }
        },
        reason => {
          if (!onrejected) {
            reject(reason);
          } else {
            try {
              resolve(onrejected(reason));
            } catch (e) {
              reject(e);
            }
          }
        },
      ]);
      this._executeHandlers();
    });
  }

  /** JSDoc */
   catch(
    onrejected,
  ) {
    return this.then(val => val, onrejected);
  }

  /** JSDoc */
   finally(onfinally) {
    return new SyncPromise((resolve, reject) => {
      let val;
      let isRejected;

      return this.then(
        value => {
          isRejected = false;
          val = value;
          if (onfinally) {
            onfinally();
          }
        },
        reason => {
          isRejected = true;
          val = reason;
          if (onfinally) {
            onfinally();
          }
        },
      ).then(() => {
        if (isRejected) {
          reject(val);
          return;
        }

        resolve(val );
      });
    });
  }

  /** JSDoc */
    __init() {this._resolve = (value) => {
    this._setResult(States.RESOLVED, value);
  };}

  /** JSDoc */
    __init2() {this._reject = (reason) => {
    this._setResult(States.REJECTED, reason);
  };}

  /** JSDoc */
    __init3() {this._setResult = (state, value) => {
    if (this._state !== States.PENDING) {
      return;
    }

    if ((0,_is_js__WEBPACK_IMPORTED_MODULE_0__.isThenable)(value)) {
      void (value ).then(this._resolve, this._reject);
      return;
    }

    this._state = state;
    this._value = value;

    this._executeHandlers();
  };}

  /** JSDoc */
    __init4() {this._executeHandlers = () => {
    if (this._state === States.PENDING) {
      return;
    }

    const cachedHandlers = this._handlers.slice();
    this._handlers = [];

    cachedHandlers.forEach(handler => {
      if (handler[0]) {
        return;
      }

      if (this._state === States.RESOLVED) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        handler[1](this._value );
      }

      if (this._state === States.REJECTED) {
        handler[2](this._value);
      }

      handler[0] = true;
    });
  };}
}


//# sourceMappingURL=syncpromise.js.map


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/time.js":
/*!************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/time.js ***!
  \************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "_browserPerformanceTimeOriginMode": () => (/* binding */ _browserPerformanceTimeOriginMode),
/* harmony export */   "browserPerformanceTimeOrigin": () => (/* binding */ browserPerformanceTimeOrigin),
/* harmony export */   "dateTimestampInSeconds": () => (/* binding */ dateTimestampInSeconds),
/* harmony export */   "timestampInSeconds": () => (/* binding */ timestampInSeconds),
/* harmony export */   "timestampWithMs": () => (/* binding */ timestampWithMs),
/* harmony export */   "usingPerformanceAPI": () => (/* binding */ usingPerformanceAPI)
/* harmony export */ });
/* harmony import */ var _node_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./node.js */ "./node_modules/@sentry/utils/esm/node.js");
/* harmony import */ var _worldwide_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./worldwide.js */ "./node_modules/@sentry/utils/esm/worldwide.js");
/* module decorator */ module = __webpack_require__.hmd(module);



// eslint-disable-next-line deprecation/deprecation
const WINDOW = (0,_worldwide_js__WEBPACK_IMPORTED_MODULE_0__.getGlobalObject)();

/**
 * An object that can return the current timestamp in seconds since the UNIX epoch.
 */

/**
 * A TimestampSource implementation for environments that do not support the Performance Web API natively.
 *
 * Note that this TimestampSource does not use a monotonic clock. A call to `nowSeconds` may return a timestamp earlier
 * than a previously returned value. We do not try to emulate a monotonic behavior in order to facilitate debugging. It
 * is more obvious to explain "why does my span have negative duration" than "why my spans have zero duration".
 */
const dateTimestampSource = {
  nowSeconds: () => Date.now() / 1000,
};

/**
 * A partial definition of the [Performance Web API]{@link https://developer.mozilla.org/en-US/docs/Web/API/Performance}
 * for accessing a high-resolution monotonic clock.
 */

/**
 * Returns a wrapper around the native Performance API browser implementation, or undefined for browsers that do not
 * support the API.
 *
 * Wrapping the native API works around differences in behavior from different browsers.
 */
function getBrowserPerformance() {
  const { performance } = WINDOW;
  if (!performance || !performance.now) {
    return undefined;
  }

  // Replace performance.timeOrigin with our own timeOrigin based on Date.now().
  //
  // This is a partial workaround for browsers reporting performance.timeOrigin such that performance.timeOrigin +
  // performance.now() gives a date arbitrarily in the past.
  //
  // Additionally, computing timeOrigin in this way fills the gap for browsers where performance.timeOrigin is
  // undefined.
  //
  // The assumption that performance.timeOrigin + performance.now() ~= Date.now() is flawed, but we depend on it to
  // interact with data coming out of performance entries.
  //
  // Note that despite recommendations against it in the spec, browsers implement the Performance API with a clock that
  // might stop when the computer is asleep (and perhaps under other circumstances). Such behavior causes
  // performance.timeOrigin + performance.now() to have an arbitrary skew over Date.now(). In laptop computers, we have
  // observed skews that can be as long as days, weeks or months.
  //
  // See https://github.com/getsentry/sentry-javascript/issues/2590.
  //
  // BUG: despite our best intentions, this workaround has its limitations. It mostly addresses timings of pageload
  // transactions, but ignores the skew built up over time that can aversely affect timestamps of navigation
  // transactions of long-lived web pages.
  const timeOrigin = Date.now() - performance.now();

  return {
    now: () => performance.now(),
    timeOrigin,
  };
}

/**
 * Returns the native Performance API implementation from Node.js. Returns undefined in old Node.js versions that don't
 * implement the API.
 */
function getNodePerformance() {
  try {
    const perfHooks = (0,_node_js__WEBPACK_IMPORTED_MODULE_1__.dynamicRequire)(module, 'perf_hooks') ;
    return perfHooks.performance;
  } catch (_) {
    return undefined;
  }
}

/**
 * The Performance API implementation for the current platform, if available.
 */
const platformPerformance = (0,_node_js__WEBPACK_IMPORTED_MODULE_1__.isNodeEnv)() ? getNodePerformance() : getBrowserPerformance();

const timestampSource =
  platformPerformance === undefined
    ? dateTimestampSource
    : {
        nowSeconds: () => (platformPerformance.timeOrigin + platformPerformance.now()) / 1000,
      };

/**
 * Returns a timestamp in seconds since the UNIX epoch using the Date API.
 */
const dateTimestampInSeconds = dateTimestampSource.nowSeconds.bind(dateTimestampSource);

/**
 * Returns a timestamp in seconds since the UNIX epoch using either the Performance or Date APIs, depending on the
 * availability of the Performance API.
 *
 * See `usingPerformanceAPI` to test whether the Performance API is used.
 *
 * BUG: Note that because of how browsers implement the Performance API, the clock might stop when the computer is
 * asleep. This creates a skew between `dateTimestampInSeconds` and `timestampInSeconds`. The
 * skew can grow to arbitrary amounts like days, weeks or months.
 * See https://github.com/getsentry/sentry-javascript/issues/2590.
 */
const timestampInSeconds = timestampSource.nowSeconds.bind(timestampSource);

/**
 * Re-exported with an old name for backwards-compatibility.
 * TODO (v8): Remove this
 *
 * @deprecated Use `timestampInSeconds` instead.
 */
const timestampWithMs = timestampInSeconds;

/**
 * A boolean that is true when timestampInSeconds uses the Performance API to produce monotonic timestamps.
 */
const usingPerformanceAPI = platformPerformance !== undefined;

/**
 * Internal helper to store what is the source of browserPerformanceTimeOrigin below. For debugging only.
 */
let _browserPerformanceTimeOriginMode;

/**
 * The number of milliseconds since the UNIX epoch. This value is only usable in a browser, and only when the
 * performance API is available.
 */
const browserPerformanceTimeOrigin = (() => {
  // Unfortunately browsers may report an inaccurate time origin data, through either performance.timeOrigin or
  // performance.timing.navigationStart, which results in poor results in performance data. We only treat time origin
  // data as reliable if they are within a reasonable threshold of the current time.

  const { performance } = WINDOW;
  if (!performance || !performance.now) {
    _browserPerformanceTimeOriginMode = 'none';
    return undefined;
  }

  const threshold = 3600 * 1000;
  const performanceNow = performance.now();
  const dateNow = Date.now();

  // if timeOrigin isn't available set delta to threshold so it isn't used
  const timeOriginDelta = performance.timeOrigin
    ? Math.abs(performance.timeOrigin + performanceNow - dateNow)
    : threshold;
  const timeOriginIsReliable = timeOriginDelta < threshold;

  // While performance.timing.navigationStart is deprecated in favor of performance.timeOrigin, performance.timeOrigin
  // is not as widely supported. Namely, performance.timeOrigin is undefined in Safari as of writing.
  // Also as of writing, performance.timing is not available in Web Workers in mainstream browsers, so it is not always
  // a valid fallback. In the absence of an initial time provided by the browser, fallback to the current time from the
  // Date API.
  // eslint-disable-next-line deprecation/deprecation
  const navigationStart = performance.timing && performance.timing.navigationStart;
  const hasNavigationStart = typeof navigationStart === 'number';
  // if navigationStart isn't available set delta to threshold so it isn't used
  const navigationStartDelta = hasNavigationStart ? Math.abs(navigationStart + performanceNow - dateNow) : threshold;
  const navigationStartIsReliable = navigationStartDelta < threshold;

  if (timeOriginIsReliable || navigationStartIsReliable) {
    // Use the more reliable time origin
    if (timeOriginDelta <= navigationStartDelta) {
      _browserPerformanceTimeOriginMode = 'timeOrigin';
      return performance.timeOrigin;
    } else {
      _browserPerformanceTimeOriginMode = 'navigationStart';
      return navigationStart;
    }
  }

  // Either both timeOrigin and navigationStart are skewed or neither is available, fallback to Date.
  _browserPerformanceTimeOriginMode = 'dateNow';
  return dateNow;
})();


//# sourceMappingURL=time.js.map


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/url.js":
/*!***********************************************!*\
  !*** ./node_modules/@sentry/utils/esm/url.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getNumberOfUrlSegments": () => (/* binding */ getNumberOfUrlSegments),
/* harmony export */   "getSanitizedUrlString": () => (/* binding */ getSanitizedUrlString),
/* harmony export */   "parseUrl": () => (/* binding */ parseUrl),
/* harmony export */   "stripUrlQueryAndFragment": () => (/* binding */ stripUrlQueryAndFragment)
/* harmony export */ });
/**
 * Parses string form of URL into an object
 * // borrowed from https://tools.ietf.org/html/rfc3986#appendix-B
 * // intentionally using regex and not <a/> href parsing trick because React Native and other
 * // environments where DOM might not be available
 * @returns parsed URL object
 */
function parseUrl(url) {
  if (!url) {
    return {};
  }

  const match = url.match(/^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/);

  if (!match) {
    return {};
  }

  // coerce to undefined values to empty string so we don't get 'undefined'
  const query = match[6] || '';
  const fragment = match[8] || '';
  return {
    host: match[4],
    path: match[5],
    protocol: match[2],
    search: query,
    hash: fragment,
    relative: match[5] + query + fragment, // everything minus origin
  };
}

/**
 * Strip the query string and fragment off of a given URL or path (if present)
 *
 * @param urlPath Full URL or path, including possible query string and/or fragment
 * @returns URL or path without query string or fragment
 */
function stripUrlQueryAndFragment(urlPath) {
  // eslint-disable-next-line no-useless-escape
  return urlPath.split(/[\?#]/, 1)[0];
}

/**
 * Returns number of URL segments of a passed string URL.
 */
function getNumberOfUrlSegments(url) {
  // split at '/' or at '\/' to split regex urls correctly
  return url.split(/\\?\//).filter(s => s.length > 0 && s !== ',').length;
}

/**
 * Takes a URL object and returns a sanitized string which is safe to use as span description
 * see: https://develop.sentry.dev/sdk/data-handling/#structuring-data
 */
function getSanitizedUrlString(url) {
  const { protocol, host, path } = url;

  const filteredHost =
    (host &&
      host
        // Always filter out authority
        .replace(/^.*@/, '[filtered]:[filtered]@')
        // Don't show standard :80 (http) and :443 (https) ports to reduce the noise
        // TODO: Use new URL global if it exists
        .replace(/(:80)$/, '')
        .replace(/(:443)$/, '')) ||
    '';

  return `${protocol ? `${protocol}://` : ''}${filteredHost}${path}`;
}


//# sourceMappingURL=url.js.map


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/vendor/supportsHistory.js":
/*!******************************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/vendor/supportsHistory.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "supportsHistory": () => (/* binding */ supportsHistory)
/* harmony export */ });
/* harmony import */ var _worldwide_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../worldwide.js */ "./node_modules/@sentry/utils/esm/worldwide.js");


// Based on https://github.com/angular/angular.js/pull/13945/files

// eslint-disable-next-line deprecation/deprecation
const WINDOW = (0,_worldwide_js__WEBPACK_IMPORTED_MODULE_0__.getGlobalObject)();

/**
 * Tells whether current environment supports History API
 * {@link supportsHistory}.
 *
 * @returns Answer to the given question.
 */
function supportsHistory() {
  // NOTE: in Chrome App environment, touching history.pushState, *even inside
  //       a try/catch block*, will cause Chrome to output an error to console.error
  // borrowed from: https://github.com/angular/angular.js/pull/13945/files
  /* eslint-disable @typescript-eslint/no-unsafe-member-access */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chrome = (WINDOW ).chrome;
  const isChromePackagedApp = chrome && chrome.app && chrome.app.runtime;
  /* eslint-enable @typescript-eslint/no-unsafe-member-access */
  const hasHistoryApi = 'history' in WINDOW && !!WINDOW.history.pushState && !!WINDOW.history.replaceState;

  return !isChromePackagedApp && hasHistoryApi;
}


//# sourceMappingURL=supportsHistory.js.map


/***/ }),

/***/ "./node_modules/@sentry/utils/esm/worldwide.js":
/*!*****************************************************!*\
  !*** ./node_modules/@sentry/utils/esm/worldwide.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "GLOBAL_OBJ": () => (/* binding */ GLOBAL_OBJ),
/* harmony export */   "getGlobalObject": () => (/* binding */ getGlobalObject),
/* harmony export */   "getGlobalSingleton": () => (/* binding */ getGlobalSingleton)
/* harmony export */ });
/** Internal global with common properties and Sentry extensions  */

// The code below for 'isGlobalObj' and 'GLOBAL_OBJ' was copied from core-js before modification
// https://github.com/zloirock/core-js/blob/1b944df55282cdc99c90db5f49eb0b6eda2cc0a3/packages/core-js/internals/global.js
// core-js has the following licence:
//
// Copyright (c) 2014-2022 Denis Pushkarev
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/** Returns 'obj' if it's the global object, otherwise returns undefined */
function isGlobalObj(obj) {
  return obj && obj.Math == Math ? obj : undefined;
}

/** Get's the global object for the current JavaScript runtime */
const GLOBAL_OBJ =
  (typeof globalThis == 'object' && isGlobalObj(globalThis)) ||
  // eslint-disable-next-line no-restricted-globals
  (typeof window == 'object' && isGlobalObj(window)) ||
  (typeof self == 'object' && isGlobalObj(self)) ||
  (typeof __webpack_require__.g == 'object' && isGlobalObj(__webpack_require__.g)) ||
  (function () {
    return this;
  })() ||
  {};

/**
 * @deprecated Use GLOBAL_OBJ instead or WINDOW from @sentry/browser. This will be removed in v8
 */
function getGlobalObject() {
  return GLOBAL_OBJ ;
}

/**
 * Returns a global singleton contained in the global `__SENTRY__` object.
 *
 * If the singleton doesn't already exist in `__SENTRY__`, it will be created using the given factory
 * function and added to the `__SENTRY__` object.
 *
 * @param name name of the global singleton on __SENTRY__
 * @param creator creator Factory function to create the singleton if it doesn't already exist on `__SENTRY__`
 * @param obj (Optional) The global object on which to look for `__SENTRY__`, if not `GLOBAL_OBJ`'s return value
 * @returns the singleton
 */
function getGlobalSingleton(name, creator, obj) {
  const gbl = (obj || GLOBAL_OBJ) ;
  const __SENTRY__ = (gbl.__SENTRY__ = gbl.__SENTRY__ || {});
  const singleton = __SENTRY__[name] || (__SENTRY__[name] = creator());
  return singleton;
}


//# sourceMappingURL=worldwide.js.map


/***/ }),

/***/ "./node_modules/process/browser.js":
/*!*****************************************!*\
  !*** ./node_modules/process/browser.js ***!
  \*****************************************/
/***/ ((module) => {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/harmony module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.hmd = (module) => {
/******/ 			module = Object.create(module);
/******/ 			if (!module.children) module.children = [];
/******/ 			Object.defineProperty(module, 'exports', {
/******/ 				enumerable: true,
/******/ 				set: () => {
/******/ 					throw new Error('ES Modules may not assign module.exports or exports.*, Use ESM export syntax, instead: ' + module.id);
/******/ 				}
/******/ 			});
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!*******************************!*\
  !*** ./resources/js/panel.js ***!
  \*******************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _sentry_browser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sentry/browser */ "./node_modules/@sentry/core/esm/exports.js");
/* harmony import */ var _sentry_browser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @sentry/browser */ "./node_modules/@sentry/browser/esm/sdk.js");
/* harmony import */ var _sentry_browser__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @sentry/browser */ "./node_modules/@sentry-internal/feedback/esm/index.js");

_sentry_browser__WEBPACK_IMPORTED_MODULE_0__.setUser({
  email: window.USER.email,
  fullName: window.USER.name
});
_sentry_browser__WEBPACK_IMPORTED_MODULE_1__.init({
  dsn: 'https://b87c70ba4dbb72aeefadfea942b0db52@debug.learnkit.dev/24',
  integrations: [new _sentry_browser__WEBPACK_IMPORTED_MODULE_2__.Feedback({
    colorScheme: 'light',
    buttonLabel: 'Feedback',
    showBranding: false,
    formTitle: 'Geef feedback',
    submitButtonLabel: 'Verstuur feedback',
    cancelButtonLabel: 'Annuleren',
    nameLabel: 'Naam',
    namePlaceholder: '',
    emailLabel: 'E-mailadres',
    emailPlaceholder: '',
    messageLabel: 'Bericht',
    messagePlaceholder: '',
    successMessageText: 'Bedankt voor je feedback.',
    useSentryUser: {
      email: "email",
      name: "fullName"
    }
  })]
});
})();

/******/ })()
;