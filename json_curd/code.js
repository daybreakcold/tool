/**
 * HTTP Code 和 业务 Code 判断库
 * 用于统一处理 HTTP 状态码和业务错误码
 */

(function (global) {
    'use strict';

    // ============================================
    // HTTP 状态码模块
    // ============================================
    var HttpCode = {
        // 2xx 成功
        OK: 200,
        CREATED: 201,
        ACCEPTED: 202,
        NO_CONTENT: 204,

        // 3xx 重定向
        MOVED_PERMANENTLY: 301,
        FOUND: 302,
        NOT_MODIFIED: 304,

        // 4xx 客户端错误
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        METHOD_NOT_ALLOWED: 405,
        CONFLICT: 409,
        GONE: 410,
        UNPROCESSABLE_ENTITY: 422,
        TOO_MANY_REQUESTS: 429,

        // 5xx 服务端错误
        INTERNAL_SERVER_ERROR: 500,
        NOT_IMPLEMENTED: 501,
        BAD_GATEWAY: 502,
        SERVICE_UNAVAILABLE: 503,
        GATEWAY_TIMEOUT: 504
    };

    // HTTP 状态码对应的消息
    var HttpMessage = {
        200: '请求成功',
        201: '创建成功',
        204: '无内容',
        301: '永久重定向',
        302: '临时重定向',
        304: '未修改',
        400: '请求参数错误',
        401: '未授权，请登录',
        403: '禁止访问',
        404: '资源不存在',
        405: '请求方法不允许',
        409: '资源冲突',
        422: '参数验证失败',
        429: '请求过于频繁',
        500: '服务器内部错误',
        502: '网关错误',
        503: '服务暂不可用',
        504: '网关超时'
    };

    // ============================================
    // 业务错误码模块
    // ============================================
    var BizCode = {
        // 通用
        SUCCESS: 0,
        FAIL: -1,

        // 登录认证模块 (1000-1999)
        ENTRY: {
            TOKEN_INVALID: 1001,
            TOKEN_EXPIRE: 1002,
            USER_NOT_EXIST: 1003,
            PASSWORD_ERROR: 1004,
            ACCOUNT_DISABLED: 1005,
            CAPTCHA_ERROR: 1006
        },

        // 网关模块 (2000-2999)
        GATE: {
            NO_SERVER_AVAILABLE: 2001,
            SERVER_BUSY: 2002,
            RATE_LIMITED: 2003
        },

        // 聊天模块 (3000-3999)
        CHAT: {
            CHANNEL_CREATE_FAIL: 3001,
            CHANNEL_NOT_EXIST: 3002,
            UNKNOWN_CONNECTOR: 3003,
            USER_NOT_ONLINE: 3004,
            MESSAGE_TOO_LONG: 3005,
            BLOCKED_USER: 3006
        },

        // 数据模块 (4000-4999)
        DATA: {
            NOT_FOUND: 4001,
            DUPLICATE: 4002,
            INVALID_FORMAT: 4003
        }
    };

    // 业务错误码对应的消息
    var BizMessage = {
        0: '操作成功',
        '-1': '操作失败',

        // 登录认证
        1001: 'Token无效，请重新登录',
        1002: 'Token已过期，请重新登录',
        1003: '用户不存在',
        1004: '密码错误',
        1005: '账号已被禁用',
        1006: '验证码错误',

        // 网关
        2001: '暂无可用服务器',
        2002: '服务器繁忙，请稍后再试',
        2003: '请求过于频繁，请稍后再试',

        // 聊天
        3001: '频道创建失败',
        3002: '频道不存在',
        3003: '未知的连接器',
        3004: '用户不在线',
        3005: '消息内容过长',
        3006: '用户已被拉黑',

        // 数据
        4001: '数据不存在',
        4002: '数据已存在',
        4003: '数据格式错误'
    };

    // ============================================
    // CodeChecker - 状态码检查器
    // ============================================
    function CodeChecker() {}

    // ---------- HTTP 状态码判断方法 ----------

    /**
     * 判断 HTTP 请求是否成功 (2xx)
     */
    CodeChecker.prototype.isHttpSuccess = function (status) {
        return status >= 200 && status < 300;
    };

    /**
     * 判断是否为重定向 (3xx)
     */
    CodeChecker.prototype.isHttpRedirect = function (status) {
        return status >= 300 && status < 400;
    };

    /**
     * 判断是否为客户端错误 (4xx)
     */
    CodeChecker.prototype.isHttpClientError = function (status) {
        return status >= 400 && status < 500;
    };

    /**
     * 判断是否为服务端错误 (5xx)
     */
    CodeChecker.prototype.isHttpServerError = function (status) {
        return status >= 500 && status < 600;
    };

    /**
     * 判断是否需要登录 (401)
     */
    CodeChecker.prototype.isUnauthorized = function (status) {
        return status === 401;
    };

    /**
     * 判断是否被禁止 (403)
     */
    CodeChecker.prototype.isForbidden = function (status) {
        return status === 403;
    };

    /**
     * 获取 HTTP 状态码对应的消息
     */
    CodeChecker.prototype.getHttpMessage = function (status) {
        return HttpMessage[status] || '未知错误';
    };

    // ---------- 业务错误码判断方法 ----------

    /**
     * 判断业务是否成功 (code === 0)
     */
    CodeChecker.prototype.isBizSuccess = function (code) {
        return code === 0;
    };

    /**
     * 判断是否为认证相关错误 (1000-1999)
     */
    CodeChecker.prototype.isAuthError = function (code) {
        return code >= 1001 && code <= 1999;
    };

    /**
     * 判断是否需要重新登录
     */
    CodeChecker.prototype.needReLogin = function (code) {
        return code === BizCode.ENTRY.TOKEN_INVALID ||
               code === BizCode.ENTRY.TOKEN_EXPIRE ||
               code === BizCode.ENTRY.USER_NOT_EXIST;
    };

    /**
     * 判断是否为网关错误 (2000-2999)
     */
    CodeChecker.prototype.isGateError = function (code) {
        return code >= 2001 && code <= 2999;
    };

    /**
     * 判断是否为聊天模块错误 (3000-3999)
     */
    CodeChecker.prototype.isChatError = function (code) {
        return code >= 3001 && code <= 3999;
    };

    /**
     * 判断是否为数据模块错误 (4000-4999)
     */
    CodeChecker.prototype.isDataError = function (code) {
        return code >= 4001 && code <= 4999;
    };

    /**
     * 获取业务错误码对应的消息
     */
    CodeChecker.prototype.getBizMessage = function (code) {
        return BizMessage[code] || '未知业务错误';
    };

    // ---------- 统一响应处理方法 ----------

    /**
     * 处理 API 响应
     * @param {number} httpStatus - HTTP 状态码
     * @param {object} response - 响应体 { code, message, data }
     * @returns {object} 处理结果
     */
    CodeChecker.prototype.handleResponse = function (httpStatus, response) {
        var result = {
            success: false,
            httpStatus: httpStatus,
            bizCode: null,
            message: '',
            data: null,
            needLogin: false
        };

        // 第一步：检查 HTTP 状态
        if (!this.isHttpSuccess(httpStatus)) {
            result.message = this.getHttpMessage(httpStatus);
            result.needLogin = this.isUnauthorized(httpStatus);
            return result;
        }

        // 第二步：检查业务状态码
        if (response && typeof response.code !== 'undefined') {
            result.bizCode = response.code;
            result.data = response.data || null;

            if (this.isBizSuccess(response.code)) {
                result.success = true;
                result.message = response.message || '操作成功';
            } else {
                result.message = response.message || this.getBizMessage(response.code);
                result.needLogin = this.needReLogin(response.code);
            }
        } else {
            // 没有业务码，HTTP 成功即为成功
            result.success = true;
            result.message = '操作成功';
            result.data = response;
        }

        return result;
    };

    /**
     * 创建成功响应
     */
    CodeChecker.prototype.success = function (data, message) {
        return {
            code: BizCode.SUCCESS,
            message: message || '操作成功',
            data: data || null
        };
    };

    /**
     * 创建失败响应
     */
    CodeChecker.prototype.fail = function (code, message, data) {
        return {
            code: code || BizCode.FAIL,
            message: message || this.getBizMessage(code),
            data: data || null
        };
    };

    // ============================================
    // 导出
    // ============================================
    var CodeLib = {
        HttpCode: HttpCode,
        HttpMessage: HttpMessage,
        BizCode: BizCode,
        BizMessage: BizMessage,
        checker: new CodeChecker(),
        CodeChecker: CodeChecker
    };

    // 支持多种模块规范
    if (typeof module !== 'undefined' && module.exports) {
        // Node.js / CommonJS
        module.exports = CodeLib;
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define(function () { return CodeLib; });
    } else {
        // 浏览器全局变量
        global.CodeLib = CodeLib;
    }

})(typeof window !== 'undefined' ? window : global);
