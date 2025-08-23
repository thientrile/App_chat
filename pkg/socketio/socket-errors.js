// socket/socket-errors.js
import { StatusCodes, ReasonPhrases } from '../response/HttpStatusCode/index.js';
import {
    // các class của bạn
    ConflictRequestError,
    BadRequestError,
    AuthFailureError,
    NotFoundError,
    ForbiddenError,
    NotAcceptableError,
    // (đang typo, nên là RedisErrorResponse)
} from '../response/error.js';

// Helper: coi có phải lỗi do bạn định nghĩa => cho phép expose message
const isKnownClientError = (err) =>
    err instanceof ConflictRequestError ||
    err instanceof BadRequestError ||
    err instanceof AuthFailureError ||
    err instanceof NotFoundError ||
    err instanceof ForbiddenError ||
    err instanceof NotAcceptableError ||

    err?.expose === true; // cho phép override bằng err.expose

const stripErrorPrefix = (msg) =>
    typeof msg === 'string' ? msg.replace(/^Error:\s*/i, '') : msg;

/**
 * Chuẩn hoá lỗi để gửi về client qua socket
 * Trả về: { ok:false, error:{ code, message, status, details }, ts }
 */
export function serializeSocketError(err) {
    const status = Number(err?.status) || StatusCodes.INTERNAL_SERVER_ERROR;
    const safe = isKnownClientError(err);
    const code =
        err?.code ||
        (err?.name && String(err.name).toUpperCase()) ||
        'INTERNAL_ERROR';

    const message = safe
        ? stripErrorPrefix(err?.message) || ReasonPhrases[status] || 'Error'
        : 'Something went wrong';

    const payload = {
        ok: false,
        error: {
            code,
            message,
            status,
            details: safe ? err?.details : undefined
        },
        ts: Date.now()
    };
    return payload;
}
